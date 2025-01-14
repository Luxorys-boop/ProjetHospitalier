import React, { useState, useEffect } from "react";
import Popup from "../components/Popup.jsx";

function ListeCycles({ onAjouterCycle }) {
  const [cycleShifts, setCycleShifts] = useState({});
  const [cycleNames, setCycleNames] = useState({}); // Associe cycle_id à cycle_nom
  const [error, setError] = useState(null);
  const [maxJours, setMaxJours] = useState(0); // Stocke le nombre maximum de jours
  const [cycleActuel, setCycleActuel] = useState(null); // Pour modification
  const [popupVisible, setPopupVisible] = useState(false); // Pop-up de modification
  const [formData, setFormData] = useState([]); // État pour stocker les modifications
  const [availableShifts, setAvailableShifts] = useState([]); // Liste des shifts disponibles
  const [confirmDelete, setConfirmDelete] = useState(null); // État pour confirmation de suppression

  useEffect(() => {
    const recupererCycleShifts = async () => {
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

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cycles shifts");
        }

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
        console.error("Erreur lors de la récupération :", err);
        setError("Impossible de récupérer les données. Veuillez réessayer plus tard.");
      }
    };

    recupererCycleShifts();
  }, []);

  const modifierCycle = (cycleId) => {
    const cycle = cycleShifts[cycleId];
    setCycleActuel(cycleId); // Utiliser l'ID du cycle
    setFormData([...cycle]);
    setPopupVisible(true);
  };

  const submitModification = async () => {
    try {
      if (formData.some((shift) => !shift)) {
        alert("Veuillez sélectionner un shift pour chaque jour.");
        return;
      }

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

      setPopupVisible(false);
      setCycleActuel(null);
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      setError("Impossible de modifier le cycle. Veuillez réessayer.");
    }
  };

  const supprimerCycle = async (cycleId) => {
    try {
      await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: `DELETE FROM cycle_shifts WHERE cycle_id = ?;`,
          params: [cycleId],
        }),
      });

      await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: `DELETE FROM cycles WHERE id = ?;`,
          params: [cycleId],
        }),
      });

      const newCycleShifts = { ...cycleShifts };
      delete newCycleShifts[cycleId];
      setCycleShifts(newCycleShifts);
      setConfirmDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("Impossible de supprimer le cycle. Veuillez réessayer.");
    }
  };

  return (
    <div className="liste-cycles">
      <h2>Gestion des cycles de travail</h2>

      {error && <p className="error-message">{error}</p>}

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
          {Object.keys(cycleShifts).length === 0 ? (
            <tr>
              <td colSpan={maxJours + 2}>Aucune donnée disponible</td>
            </tr>
          ) : (
            Object.keys(cycleShifts).map((cycleId) => (
              <tr key={cycleId}>
                <td>{cycleNames[cycleId]}</td>
                {Array.from({ length: maxJours }).map((_, index) => (
                  <td key={index}>{cycleShifts[cycleId][index] || "Aucun"}</td>
                ))}
                <td className="actions-cycles">
                  <button onClick={() => modifierCycle(cycleId)}>Modifier</button>
                  <button onClick={() => setConfirmDelete(cycleId)}>Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="ajouter-cycles-bouton" onClick={onAjouterCycle}>
        Ajouter Cycle
      </button>

      {popupVisible && (
        <Popup trigger={popupVisible} setTrigger={setPopupVisible}>
          <h3>Modifier le cycle {cycleNames[cycleActuel]}</h3>
          {formData.map((shiftNom, index) => (
            <div key={index}>
              <label>Jour {index + 1}:</label>
              <select
                value={shiftNom || ""}
                onChange={(e) => setFormData((prev) => {
                  const updated = [...prev];
                  updated[index] = e.target.value;
                  return updated;
                })}
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
          <button onClick={submitModification}>Enregistrer</button>
        </Popup>
      )}

      {confirmDelete && (
        <Popup trigger={true} setTrigger={() => setConfirmDelete(null)}>
          <h3>Confirmer la suppression</h3>
          <p>Êtes-vous sûr de vouloir supprimer le cycle {cycleNames[confirmDelete]} ?</p>
          <button onClick={() => supprimerCycle(confirmDelete)}>Oui</button>
          <button onClick={() => setConfirmDelete(null)}>Non</button>
        </Popup>
      )}
    </div>
  );
}

export default ListeCycles;
