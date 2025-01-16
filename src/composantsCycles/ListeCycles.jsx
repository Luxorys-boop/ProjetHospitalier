import React, { useState, useEffect } from "react";

function ListeCycles({ onAjouterCycle }) {
  const [cycleShifts, setCycleShifts] = useState({});
  const [cycleNames, setCycleNames] = useState({}); // Associe cycle_id à cycle_nom
  const [maxJours, setMaxJours] = useState(0); // Nombre maximum de jours
  const [cycleActuel, setCycleActuel] = useState(null); // Pour modification
  const [formData, setFormData] = useState([]); // État pour stocker les modifications
  const [availableShifts, setAvailableShifts] = useState([]); // Liste des shifts disponibles
  const [popupModifierVisible, setPopupModifierVisible] = useState(false);
  const [popupSupprimerVisible, setPopupSupprimerVisible] = useState(false);
  const [cycleASupprimer, setCycleASupprimer] = useState(null);

  useEffect(() => {
    const recupererCycles = async () => {
      try {
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: `
              SELECT
                c.id AS cycle_id,
                c.nom_cycle AS cycle_nom,
                cs.jour,
                s.nom AS shift_nom
              FROM
                cycle_shifts cs
              JOIN
                shifts s ON cs.shift_id = s.id
              JOIN
                cycles c ON cs.cycle_id = c.id
              ORDER BY
                c.id, cs.jour
            `,
          }),
        });

        const data = await response.json();
        let maxDays = 0;
        const groupedCycles = {};
        const namesMapping = {};

        data.forEach((curr) => {
          if (!groupedCycles[curr.cycle_id]) groupedCycles[curr.cycle_id] = [];
          groupedCycles[curr.cycle_id][curr.jour - 1] = curr.shift_nom;
          namesMapping[curr.cycle_id] = curr.cycle_nom;
          if (curr.jour > maxDays) maxDays = curr.jour;
        });

        setCycleShifts(groupedCycles);
        setCycleNames(namesMapping);
        setMaxJours(maxDays);
      } catch (err) {
        console.error("Erreur lors de la récupération des cycles :", err);
      }
    };

    const recupererShiftsDisponibles = async () => {
      try {
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: "SELECT * FROM shifts",
          }),
        });

        const data = await response.json();
        setAvailableShifts(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des shifts :", err);
      }
    };

    recupererCycles();
    recupererShiftsDisponibles();
  }, []);

  const ouvrirPopupModifier = (cycleId) => {
    setCycleActuel(cycleId);
    setFormData([...cycleShifts[cycleId]]);
    setPopupModifierVisible(true);
  };

  const fermerPopupModifier = () => {
    setPopupModifierVisible(false);
    setCycleActuel(null);
    setFormData([]);
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
  
  const enregistrerModification = async () => {
    // Construire le cycle à partir des modifications
    const cycle = formData.map((shiftNom, index) => {
      const shift = availableShifts.find((s) => s.nom === shiftNom);
      const heureDebut = shift ? shift.heure_debut % 24 : 0;
      const duree = shift ? shift.duree : 0;
      const heureFin = (heureDebut + duree) % 24;
  
      return {
        jour: index + 1,
        shiftId: shift ? shift.id : null,
        heureDebut,
        duree,
        heureFin,
        typeRepos: shift ? shift.nom === "RH" : false,
      };
    });
  
    // Vérifier les contraintes
    const violations = await verifierContraintes(cycle);
  
    if (violations.length > 0) {
      const confirmer = window.confirm(
        `Des violations de contraintes ont été détectées :\n\n${violations.join(
          "\n"
        )}\n\nVoulez-vous continuer et enregistrer les modifications malgré ces violations ?`
      );
      if (!confirmer) {
        return; // Ne pas enregistrer les modifications si l'utilisateur annule
      }
    }
  
    // Si l'utilisateur accepte, sauvegarder les modifications
    try {
      for (let i = 0; i < formData.length; i++) {
        const shiftNom = formData[i];
        const jour = i + 1;
  
        await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: `
              UPDATE cycle_shifts
              SET shift_id = (
                SELECT id
                FROM shifts
                WHERE nom = ?
              )
              WHERE cycle_id = ? AND jour = ?;
            `,
            params: [shiftNom, cycleActuel, jour],
          }),
        });
      }
  
      setCycleShifts((prev) => ({
        ...prev,
        [cycleActuel]: formData,
      }));
  
      fermerPopupModifier();
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
    }
  };
  

  const supprimerCycle = async () => {
    try {
      await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: `DELETE FROM cycle_shifts WHERE cycle_id = ?;`,
          params: [cycleASupprimer],
        }),
      });

      await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: `DELETE FROM cycles WHERE id = ?;`,
          params: [cycleASupprimer],
        }),
      });

      setCycleShifts((prev) => {
        const newShifts = { ...prev };
        delete newShifts[cycleASupprimer];
        return newShifts;
      });

      annulerSuppression();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  
  return (
    <div className="liste-cycles">
      <h2>Gestion des cycles de travail</h2>

      <table>
        <thead>
          <tr>
            <th>Nom du Cycle</th>
            {Array.from({ length: maxJours }).map((_, index) => (
              <th key={index}>Jour {index + 1}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(cycleShifts).map((cycleId) => (
            <tr key={cycleId}>
              <td>{cycleNames[cycleId]}</td>
              {Array.from({ length: maxJours }).map((_, index) => (
                <td key={index}>{cycleShifts[cycleId][index] || "Aucun"}</td>
              ))}
              <td className="actions-cycles">
                <button onClick={() => ouvrirPopupModifier(cycleId)}>Modifier</button>
                <button onClick={() => confirmerSuppression(cycleId)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="ajouter-cycles-bouton" onClick={onAjouterCycle}>
        Ajouter Cycle
      </button>

      {popupModifierVisible && (
        <>
          <div className="backdrop" onClick={fermerPopupModifier}></div>
          <div className="formulaire-ajout-cycle">
            <h2>Modifier le cycle {cycleNames[cycleActuel]}</h2>
            {formData.map((shiftNom, index) => (
              <div key={index} className="jour">
                <label>Jour {index + 1} :</label>
                <select
                  value={shiftNom || ""}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updated = [...prev];
                      updated[index] = e.target.value;
                      return updated;
                    })
                  }
                >
                  <option value="">Sélectionnez un shift</option>
                  {availableShifts.map((shift) => (
                    <option key={shift.id} value={shift.nom}>
                      {shift.nom}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="actions-cycles">
              <button onClick={enregistrerModification}>Enregistrer</button>
              <button onClick={fermerPopupModifier}>Annuler</button>
            </div>

          </div>
        </>
      )}

      {popupSupprimerVisible && (
        <>
          <div className="backdrop" onClick={annulerSuppression}></div>
          <div className="formulaire-ajout-cycle">
            <p>
              Êtes-vous sûr de vouloir supprimer le cycle{" "}
              <strong>{cycleNames[cycleASupprimer]}</strong> ?
            </p>
            <button onClick={supprimerCycle}>Oui</button>
            <button onClick={annulerSuppression}>Non</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ListeCycles;
