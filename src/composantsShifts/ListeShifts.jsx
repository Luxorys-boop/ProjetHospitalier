import React, { useState, useEffect } from "react";
import FormulaireShifts from "./FormulaireShifts";

function ListeShifts() {
  const [shifts, setShifts] = useState([]);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [shiftActuel, setShiftActuel] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [shiftASupprimer, setShiftASupprimer] = useState(null);

  // Fonction pour récupérer les shifts depuis l'API
  const actualiserShifts = async () => {
    try {
      const response = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: "SELECT * FROM shifts ORDER BY id",
        }),
      });
      const data = await response.json();
      setShifts(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des shifts :", err);
    }
  };

  // Appel de l'API au chargement initial de la page
  useEffect(() => {
    actualiserShifts();
  }, []);

  const ouvrirFormulaire = (shift = null) => {
    setShiftActuel(shift);
    setFormulaireOuvert(true);
  };

  const fermerFormulaire = () => {
    setFormulaireOuvert(false);
    actualiserShifts(); // Mise à jour des shifts après fermeture
  };

  const confirmerSuppression = (id) => {
    setShiftASupprimer(id);
    setPopupVisible(true);
  };

  const annulerSuppression = () => {
    setPopupVisible(false);
    setShiftASupprimer(null);
  };

  const supprimerShift = async () => {
    if (!shiftASupprimer) return;

    try {
      const response = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: "DELETE FROM shifts WHERE id = ?",
          params: [shiftASupprimer],
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression.");
      setShifts((prevShifts) =>
        prevShifts.filter((shift) => shift.id !== shiftASupprimer)
      );
      setPopupVisible(false);
      setShiftASupprimer(null);
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  return (
    <div className="liste-shifts">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Heure Début</th>
            <th>Durée</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.id}</td>
              <td>{shift.nom}</td>
              <td>{shift.heure_debut || "Non défini"}</td>
              <td>{shift.duree}</td>
              <td>
                <div className="actions-shifts">
                  <button onClick={() => ouvrirFormulaire(shift)}>Modifier</button>
                  <button onClick={() => confirmerSuppression(shift.id)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="ajouter-shifts-bouton" onClick={() => ouvrirFormulaire()}>
        Ajouter Shift
      </button>

      {formulaireOuvert && (
        <>
          <div className="backdrop" onClick={fermerFormulaire}></div>
          <div className="popupshifts">
            <div className="popup-content">
              <FormulaireShifts shift={shiftActuel} onFermer={fermerFormulaire} />
            </div>
          </div>
        </>
      )}

      {popupVisible && (
        <>
          <div className="backdrop" onClick={annulerSuppression}></div>
          <div className="popupshifts">
            <div className="popup-content">
              <p>Êtes-vous sûr de vouloir supprimer ce shift ?</p>
              <button onClick={supprimerShift}>Oui</button>
              <button onClick={annulerSuppression}>Non</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ListeShifts;