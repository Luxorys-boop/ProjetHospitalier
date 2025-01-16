import React, { useState, useEffect } from "react";

function FormulaireAjoutCycle({ onFermer }) {
  const [nombreSemaines, setNombreSemaines] = useState(1);
  const [shifts, setShifts] = useState([]);
  const [jours, setJours] = useState([]); // Tableau pour stocker les choix de chaque jour
  const [nomCycle, setNomCycle] = useState(""); // Stocker le nom du cycle

  useEffect(() => {
    // Charger les shifts pour la liste déroulante
    const recupererShifts = async () => {
      try {
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: "SELECT * FROM shifts",
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

  const verifierContraintes = async (cycle) => {
    try {
      const response = await fetch("http://localhost:5001/verify-constraints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      });

      const { violations } = await response.json();
      return violations;
    } catch (error) {
      console.error("Erreur lors de la vérification des contraintes :", error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomCycle.trim()) {
      alert("Veuillez saisir un nom pour le cycle.");
      return;
    }

    // Construire le cycle à partir des jours sélectionnés
    const cycle = jours.map((shiftId, index) => {
      const shiftIdInt = parseInt(shiftId, 10); // Convertir shiftId en entier
      const shift = shifts.find((s) => s.id === shiftIdInt); // Trouver le shift correspondant
    
      // Ajuster les heures de début et de fin pour rester dans une plage valide
      const heureDebut = shift ? shift.heure_debut % 24 : 0;
      const duree = shift ? shift.duree : 0;
      const heureFin = (heureDebut + duree) % 24;
    
      // Retourner l'objet cycle
      return {
        jour: index % 7 + 1, // Calcul du jour (1 à 7)
        shiftId: shiftIdInt, // ID du shift (entier)
        heureDebut, // Heure de début du shift
        duree, // Durée du shift
        heureFin, // Heure de fin normalisée
        typeRepos: shift ? shift.nom === "RH" : false, // Type de repos
      };
    });
    
    // Afficher les propriétés du cycle
    cycle.forEach((entry) => {
      console.log("Jour :", entry.jour);
      console.log("Shift ID :", entry.shiftId);
      console.log("Heure début :", entry.heureDebut);
      console.log("Durée :", entry.duree);
      console.log("Type repos :", entry.typeRepos);
    });


    // Vérifier les contraintes
    const violations = await verifierContraintes(cycle);

    if (violations.length > 0) {
      alert("Des violations de contraintes ont été détectées :\n\n" + violations.join("\n"));
      return;
    }

    try {
      // Étape 1 : Insérer le cycle
      const cycleResponse = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: "INSERT INTO cycles (nom_cycle, duree_weeks) VALUES (?, ?)",
          params: [nomCycle, nombreSemaines],
        }),
      });

      const cycleData = await cycleResponse.json();
      const nouveauCycleId = cycleData.insertId;

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
        <form onSubmit={handleSubmit}>
          <div className="nom-cycle">
            <label>Nom du Cycle</label>
            <input
              type="text"
              value={nomCycle}
              onChange={(e) => setNomCycle(e.target.value)}
              required
            />
          </div>
          <div className="controle-semaines">
            <button type="button" onClick={() => handleSemainesChange(-1)}>-</button>
            <span>{nombreSemaines} Semaine(s)</span>
            <button type="button" onClick={() => handleSemainesChange(1)}>+</button>
          </div>
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
                        }
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
