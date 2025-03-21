import React, { useState, useEffect } from 'react';
import FormulaireAjoutCycle from "../composantsCycles/FormulaireAjoutCycle"; // Import de la popup

function Option({ setCycleID }) {
  const [quotite, setQuotite] = useState(""); // Quotité sélectionnée
  const [cycles, setCycles] = useState([]); // Liste des cycles
  const [filteredCycles, setFilteredCycles] = useState([]); // Cycles filtrés selon la quotité
  const [selectedCycle, setSelectedCycle] = useState(""); // Cycle sélectionné
  const [popupAjoutVisible, setPopupAjoutVisible] = useState(false); // Affichage de la popup

  // Mapping entre quotité et nombre de RH/semaine attendu
  const quotiteToRH = {
    "100%": 2,
    "70%": 3,
    "50%": 4,
    "30%": 5,
    "10%": 6,
  };

  // Charger tous les cycles depuis la base de données
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await fetch('http://localhost:5001/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              SELECT c.id AS cycle_id, c.nom_cycle, c.duree_weeks, 
                     GROUP_CONCAT(s.nom SEPARATOR ',') AS shifts
              FROM cycles c
              JOIN cycle_shifts cs ON c.id = cs.cycle_id
              JOIN shifts s ON cs.shift_id = s.id
              GROUP BY c.id
            `,
            params: []
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des cycles.');
        const data = await response.json();

        // Ajouter le tableau des shifts pour chaque cycle
        const processedCycles = data.map(cycle => ({
          ...cycle,
          shifts: cycle.shifts ? cycle.shifts.split(",") : [], // Convertir string en tableau
        }));

        setCycles(processedCycles);
      } catch (error) {
        console.error('Erreur de récupération des cycles:', error);
      }
    };

    fetchCycles();
  }, []);

  // Fonction pour calculer le nombre de RH par semaine pour un cycle donné
  const calculateRhPerWeek = (shifts, dureeWeeks) => {
    if (!shifts || shifts.length === 0 || dureeWeeks === 0) return 0;

    const rhCount = shifts.filter(shift => shift === "RH").length; // Nombre de jours RH
    return Math.floor(rhCount / dureeWeeks); // Nombre de RH par semaine (arrondi)
  };

  // Mettre à jour les cycles filtrés en fonction de la quotité sélectionnée
  useEffect(() => {
    if (quotite !== "") {
      const rhTarget = quotiteToRH[quotite] || 0; // Nombre de RH attendu
      const filtered = cycles.filter(cycle => calculateRhPerWeek(cycle.shifts, cycle.duree_weeks) === rhTarget);
      setFilteredCycles(filtered);
    } else {
      setFilteredCycles([]);
      setSelectedCycle("");
      setCycleID("");
    }
  }, [quotite, cycles, setCycleID]);

  // Gestion du changement de cycle sélectionné
  const handleCycleChange = (e) => {
    const selected = e.target.value;
    setSelectedCycle(selected);
    const selectedCycleObj = filteredCycles.find(cycle => cycle.nom_cycle === selected);
    setCycleID(selectedCycleObj ? selectedCycleObj.cycle_id : ""); // Envoyer l'ID du cycle à UtilisateursPage
  };

  return (
    <>
    <select 
      className="popup-select-quotite"
      value={quotite} 
      onChange={(e) => setQuotite(e.target.value)}
    >
      <option value="">-- Sélectionnez une quotité --</option>
      <option value="100%">100% (2 RH/semaine)</option>
      <option value="70%">70% (3 RH/semaine)</option>
      <option value="50%">50% (4 RH/semaine)</option>
      <option value="30%">30% (5 RH/semaine)</option>
      <option value="10%">10% (6 RH/semaine)</option>
    </select>

    {quotite && filteredCycles.length > 0 && (
      <select 
        className="popup-select-cycles"
        value={selectedCycle} 
        onChange={handleCycleChange}
      >
        <option value="">-- Sélectionnez un cycle ! --</option>
        {filteredCycles.map((cycle) => (
          <option key={cycle.cycle_id} value={cycle.nom_cycle}>
            Cycle : {cycle.nom_cycle}
          </option>
        ))}
      </select>
)}

      {/* Message si aucun cycle ne correspond à la quotité sélectionnée */}
      {quotite && filteredCycles.length === 0 && (
        <>
          <p>Aucun cycle ne correspond à cette quotité.</p>
          <button onClick={() => setPopupAjoutVisible(true)}>Ajouter un cycle</button>
        </>
      )}

      {/* Popup d'ajout de cycle */}
      {popupAjoutVisible && <FormulaireAjoutCycle onFermer={() => setPopupAjoutVisible(false)} />}
    </>
  );
}

export default Option;
