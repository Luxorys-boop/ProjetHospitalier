import React, { useState } from "react";

function FormulaireShift({ shift, onFermer }) {
  const [nom, setNom] = useState(shift ? shift.nom : "");
  const [heure_debut, setHeureDebut] = useState(shift ? shift.heure_debut : "");
  const [duree, setDuree] = useState(shift ? shift.duree : "");

  const handleValider = async (e) => {
    e.preventDefault();

    const url = "http://localhost:5000/query";
    const requete = shift ? "UPDATE" : "INSERT INTO";
    const sql = shift
      ? "UPDATE shifts SET nom = ?, heure_debut = ?, duree = ? WHERE id = ?"
      : "INSERT INTO shifts (nom, heure_debut, duree) VALUES (?, ?, ?)";

    const params = shift
      ? [nom, heure_debut || null, duree, shift.id]
      : [nom, heure_debut || null, duree];

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, params }),
      });
      if (!response.ok) throw new Error("Erreur lors de la soumission.");
      onFermer();
    } catch (err) {
      console.error("Erreur :", err);
    }
  };

  return (
    <div className="formulaire-shift">
      <h2>{shift ? "Modifier Shift" : "Ajouter Shift"}</h2>
      <form onSubmit={handleValider}>
        <div>
          <label>Nom :</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Heure Début :</label>
          <input
            type="time"
            value={heure_debut}
            onChange={(e) => setHeureDebut(e.target.value)}
          />
        </div>
        <div>
          <label>Durée :</label>
          <input
            type="number"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            required
            min="1"
          />
        </div>
        <div className="actions">
          <button type="submit">Valider</button>
          <button type="button" onClick={onFermer}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormulaireShift;
