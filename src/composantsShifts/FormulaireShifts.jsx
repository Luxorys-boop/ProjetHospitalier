import React, { useState, useEffect } from "react";

function FormulaireShifts({ shift, onFermer }) {
  const [nom, setNom] = useState(shift ? shift.nom : "");
  const [heure_debut, setHeureDebut] = useState(shift ? shift.heure_debut : "");
  const [duree, setDuree] = useState(shift ? shift.duree : "");
  const [besoin_infirmiers, setBesoinInfirmiers] = useState(
    shift ? shift.besoin_infirmiers : ""
  );

  // Utiliser useEffect pour réinitialiser les champs lorsque shift change
  useEffect(() => {
    if (shift) {
      setNom(shift.nom);
      setHeureDebut(shift.heure_debut);
      setDuree(shift.duree);
      setBesoinInfirmiers(shift.besoin_infirmiers);
    } else {
      setNom("");
      setHeureDebut("");
      setDuree("");
      setBesoinInfirmiers("");
    }
  }, [shift]);

  const handleValider = async (e) => {
    e.preventDefault();

    const url = "http://localhost:5001/query";
    const sql = shift
      ? "UPDATE shifts SET nom = ?, heure_debut = ?, duree = ?, besoin_infirmiers = ? WHERE id = ?"
      : "INSERT INTO shifts (nom, heure_debut, duree, besoin_infirmiers) VALUES (?, ?, ?, ?)";

    const params = shift
      ? [nom, heure_debut || null, duree, besoin_infirmiers, shift.id]
      : [nom, heure_debut || null, duree, besoin_infirmiers];

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, params }),
      });
      if (!response.ok) throw new Error("Erreur lors de la soumission.");
      onFermer(); // Fermer le formulaire et déclencher l'actualisation
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
        <div>
          <label>Besoin Infirmiers :</label>
          <input
            type="number"
            value={besoin_infirmiers}
            onChange={(e) => setBesoinInfirmiers(e.target.value)}
          />
        </div>
        <div className="confirm-boutons">
          <button type="submit">Valider</button>
          <button type="button" onClick={onFermer}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormulaireShifts;
