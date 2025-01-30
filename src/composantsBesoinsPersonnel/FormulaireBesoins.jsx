import React, { useState } from "react";
import "./FormulaireBesoins.css";

function FormulaireBesoins({ shifts, mois, annee, onFermer, onEnregistrer }) {
  const [semaineBesoins, setSemaineBesoins] = useState(
    Array(7).fill({}).map(() => ({})) // Besoins pour 7 jours
  );

  const handleChange = (jourIndex, shiftId, value) => {
    const updatedBesoins = [...semaineBesoins];
    updatedBesoins[jourIndex] = {
      ...updatedBesoins[jourIndex],
      [shiftId]: value,
    };
    setSemaineBesoins(updatedBesoins);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // on vérifie les données avant soumission
    for (const besoinsJour of semaineBesoins) {
      for (const value of Object.values(besoinsJour)) {
        if (typeof value === "undefined" || value === null) {
          alert("Veuillez remplir tous les champs avant de valider.");
          return;
        }
      }
    }

    try {
      await fetch("http://localhost:5001/add-besoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semaineBesoins,
          mois,
          annee,
        }),
      });
      console.log("Ajout des besoins effectué.");
      onEnregistrer();
      onFermer();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des besoins :", error);
    }
  };

  return (
    <div className="formulaire-besoins-overlay">
      <div className="formulaire-besoins-popup">
        <h2>Ajouter Besoin en Personnel</h2>
        <form onSubmit={handleSubmit}>
          <div className="semaine-container">
            {[...Array(7)].map((_, jourIndex) => (
              <div key={jourIndex} className="jour-besoin">
                <h3>Jour {jourIndex + 1}</h3>
                {shifts.map((shift) => (
                  <div key={shift.id} className="shift-besoin">
                    <label>{shift.nom} :</label>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) =>
                        handleChange(jourIndex, shift.id, parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="submit" className="btn-submit">Valider</button>
            <button type="button" className="btn-cancel" onClick={onFermer}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormulaireBesoins;