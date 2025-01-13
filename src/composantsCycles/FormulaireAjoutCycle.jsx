import React, { useState, useEffect } from "react";

function FormulaireAjoutCycle({ onFermer }) {
  const [nombreSemaines, setNombreSemaines] = useState(1);
  const [shifts, setShifts] = useState([]);
  const [jours, setJours] = useState([]); // Tableau pour stocker les choix de chaque jour
  const [cycleId, setCycleId] = useState(null); // Stocker l'ID du cycle créé

  useEffect(() => {
    // Charger les shifts pour la liste déroulante
    const recupererShifts = async () => {
      try {
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: "SELECT id, nom FROM shifts",
          }),
        });

        const data = await response.json();
        setShifts(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des shifts :", error);
      }
    };

    recupererShifts();
  }, []);

  const handleSemainesChange = (increment) => {
    setNombreSemaines((prev) => Math.max(1, Math.min(2, prev + increment)));
    setJours([]); // Réinitialiser les jours
  };

  const handleJourChange = (index, value) => {
    const updatedJours = [...jours];
    updatedJours[index] = value;
    setJours(updatedJours);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Étape 1 : Insérer le cycle
      const cycleResponse = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: "INSERT INTO cycles (duree_weeks) VALUES (?)",
          params: [nombreSemaines],
        }),
      });

      const cycleData = await cycleResponse.json();
      const nouveauCycleId = cycleData.insertId;
      setCycleId(nouveauCycleId);

      // Étape 2 : Insérer les shifts pour chaque jour
      for (let i = 0; i < jours.length; i++) {
        const jourShift = jours[i];
        if (jourShift) {
          await fetch("http://localhost:5001/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sql: "INSERT INTO cycle_shifts (cycle_id, jour, shift_id) VALUES (?, ?, ?)",
              params: [nouveauCycleId, i + 1, jourShift],
            }),
          });
        }
      }

      alert("Cycle ajouté avec succès !");
      onFermer(); // Fermer le formulaire après validation
    } catch (err) {
      console.error("Erreur lors de l'ajout du cycle :", err);
    }
  };

  return (
    <>
      <div className="backdrop" onClick={onFermer}></div>
      <div className="formulaire-ajout-cycle">
        <h2>Ajouter un Nouveau Cycle</h2>
        <div className="controle-semaines">
          <button onClick={() => handleSemainesChange(-1)}>-</button>
          <span>{nombreSemaines} Semaine(s)</span>
          <button onClick={() => handleSemainesChange(1)}>+</button>
        </div>
        <form onSubmit={handleSubmit}>
          {[...Array(nombreSemaines)].map((_, semaineIndex) => (
            <div key={semaineIndex} className="semaine">
              <h3>Semaine {semaineIndex + 1}</h3>
              <div className="jours">
                {[...Array(7)].map((_, jourIndex) => {
                  const globalJourIndex = semaineIndex * 7 + jourIndex;
                  return (
                    <div key={globalJourIndex} className="jour">
                      <label>Jour {globalJourIndex + 1} :</label>
                      <select
                        value={jours[globalJourIndex] || ""}
                        onChange={(e) =>
                          handleJourChange(globalJourIndex, e.target.value)
                        }required
                      >
                        <option value="">-- Options --</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="actions-cycles">
            <button type="submit">Valider</button>
            <button type="button" onClick={onFermer}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </>
  );
  
}

export default FormulaireAjoutCycle;