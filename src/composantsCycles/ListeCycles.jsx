import React, { useState, useEffect } from "react";

function ListeCycles({ onAjouterCycle }) {
  const [cycleShifts, setCycleShifts] = useState({});
  const [error, setError] = useState(null);
  const [maxJours, setMaxJours] = useState(0); // Stocke le nombre maximum de jours

  useEffect(() => {
    const recupererCycleShifts = async () => {
      try {
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: `
              SELECT
                cs.cycle_id,
                cs.jour,
                s.nom AS shift_nom
              FROM
                cycle_shifts cs
              JOIN
                shifts s ON cs.shift_id = s.id
              ORDER BY
                cs.cycle_id, cs.jour
            `,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cycles shifts");
        }

        const data = await response.json();

        // Regrouper les données par cycle_id et déterminer le nombre maximal de jours
        let maxDays = 0;
        const groupedCycles = data.reduce((acc, curr) => {
          if (!acc[curr.cycle_id]) acc[curr.cycle_id] = [];
          acc[curr.cycle_id][curr.jour - 1] = curr.shift_nom; // Remplit les jours dans le bon ordre
          if (curr.jour > maxDays) maxDays = curr.jour; // Met à jour le nombre maximum de jours
          return acc;
        }, {});

        setCycleShifts(groupedCycles);
        setMaxJours(maxDays); // Définit le nombre maximum de jours
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        setError("Impossible de récupérer les données. Veuillez réessayer plus tard.");
      }
    };

    recupererCycleShifts();
  }, []);

  return (
    <div className="liste-cycles">
      <h2>Gestion des cycles de travail</h2>

      {error && <p className="error-message">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Cycle ID</th>
            {Array.from({ length: maxJours }).map((_, index) => (
              <th key={index}>Jour {index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(cycleShifts).length === 0 ? (
            <tr>
              <td colSpan={maxJours + 1}>Aucune donnée disponible</td>
            </tr>
          ) : (
            Object.keys(cycleShifts).map((cycleId) => (
              <tr key={cycleId}>
                <td>{cycleId}</td>
                {Array.from({ length: maxJours }).map((_, index) => (
                  <td key={index}>{cycleShifts[cycleId][index] || "Aucun"}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="ajouter-bouton" onClick={onAjouterCycle}>
        Ajouter Cycle
      </button>
    </div>
  );
}

export default ListeCycles;