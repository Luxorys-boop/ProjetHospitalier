import React, { useState, useEffect } from "react";

function ListeShifts({ onAjouterShift, onEditerShift }) {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const recupererShifts = async () => {
      try {
        const response = await fetch("http://localhost:5000/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: "SELECT * FROM shifts",
          }),
        });
        const data = await response.json();
        setShifts(data);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
      }
    };
    recupererShifts();
  }, []);

  return (
    <div className="liste-shifts">
      <table>
        <thead>
          <tr>
            <th>Shift</th>
            <th>Heure Début</th>
            <th>Durée</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.nom}</td>
              <td>{shift.heure_debut || "Non défini"}</td>
              <td>{shift.duree}</td>
              <td>
                <button onClick={() => onEditerShift(shift)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="ajouter-bouton" onClick={onAjouterShift}>
        Ajouter Shift
      </button>
    </div>
  );
}

export default ListeShifts;
