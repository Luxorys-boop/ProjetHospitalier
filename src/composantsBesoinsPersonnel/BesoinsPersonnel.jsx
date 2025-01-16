import React, { useState, useEffect } from "react";
import "./BesoinsPersonnel.css";
import FormulaireBesoins from "./FormulaireBesoins";

function BesoinsPersonnel() {
  const [moisCourant, setMoisCourant] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [besoins, setBesoins] = useState([]);
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const joursAbrégés = ["D", "L", "M", "ME", "J", "V", "S"];

  // Charger les shifts
  const chargerShifts = async () => {
    try {
      const response = await fetch("http://localhost:5001/get-shifts");
      const data = await response.json();
      setShifts(data.filter((shift) => shift.nom !== "RH" && shift.nom !== "CA"));
    } catch (error) {
      console.error("Erreur lors du chargement des shifts :", error);
    }
  };

  // Charger les besoins
  const chargerBesoins = async () => {
    try {
      const mois = moisCourant.getMonth() + 1;
      const annee = moisCourant.getFullYear();
      const response = await fetch("http://localhost:5001/get-besoins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mois, annee }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      setBesoins(data);
    } catch (error) {
      console.error("Erreur lors du chargement des besoins :", error);
    }
  };

  // Supprimer tous les besoins
  const supprimerTousLesBesoins = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les besoins personnels ?")) {
      try {
        const response = await fetch("http://localhost:5001/delete-all-besoins", { method: "DELETE" });
        if (response.ok) {
          setBesoins([]);
          alert("Tous les besoins personnels ont été supprimés.");
        } else {
          alert("Erreur lors de la suppression des besoins personnels.");
        }
      } catch (error) {
        alert("Erreur lors de la suppression des besoins personnels.");
      }
    }
  };

  // Modifier une cellule
  const modifierCellule = async (jour, shiftId, nouveauBesoin) => {
    try {
      const response = await fetch("http://localhost:5001/update-besoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jour, shift_id: shiftId, nombre_personnel: nouveauBesoin }),
      });
      if (response.ok) {
        await chargerBesoins(); // Recharger les besoins après modification
      } else {
        alert("Erreur lors de la mise à jour du besoin.");
      }
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
    }
  };

  // Gestion du clic sur une cellule
  const handleCelluleClick = (jour, shiftId, besoinActuel) => {
    // Simuler un clic sur le jour suivant
    const jourSuivant = new Date(jour);
    jourSuivant.setDate(jourSuivant.getDate() + 1);
    const jourSuivantISO = jourSuivant.toISOString().split("T")[0];

    const nouveauBesoin = prompt(
      `Modifier le besoin pour le jour ${jourSuivantISO} et le shift ${shiftId}:`,
      besoinActuel || 0
    );
    if (nouveauBesoin !== null) {
      modifierCellule(jourSuivantISO, shiftId, parseInt(nouveauBesoin, 10));
    }
  };

  const handleMoisChange = (increment) => {
    setMoisCourant(new Date(moisCourant.getFullYear(), moisCourant.getMonth() + increment, 1));
  };

  const genererEntetes = () => {
    const joursDansMois = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + 1, 0).getDate();
    return [...Array(joursDansMois)].map((_, i) => {
      const dateCourante = new Date(moisCourant.getFullYear(), moisCourant.getMonth(), i + 1);
      const jourDeLaSemaine = dateCourante.getDay();
      return `${joursAbrégés[jourDeLaSemaine]}${i + 1}`;
    });
  };

  const obtenirDateParIndex = (index) => {
    const date = new Date(moisCourant.getFullYear(), moisCourant.getMonth(), index + 1);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    chargerShifts();
    chargerBesoins();
  }, [moisCourant]);

  return (
    <div className="besoins-personnel">
      <h1>Besoins en Personnel</h1>
      <div className="navigation-mois">
        <button onClick={() => handleMoisChange(-1)}>← Mois Précédent</button>
        <span>{moisCourant.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</span>
        <button onClick={() => handleMoisChange(1)}>Mois Suivant →</button>
      </div>

      <button className="ajouter-besoin" onClick={() => setFormulaireVisible(true)}>Ajouter Besoin</button>
      <button className="supprimer-tous-besoins" onClick={supprimerTousLesBesoins}>Supprimer tous les besoins</button>

      <table className="besoins-table">
        <thead>
          <tr>
            <th>Shifts</th>
            {genererEntetes().map((entete, i) => <th key={i}>{entete}</th>)}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.nom}</td>
              {[...Array(new Date(moisCourant.getFullYear(), moisCourant.getMonth() + 1, 0).getDate())].map(
                (_, i) => {
                  const jourISO = obtenirDateParIndex(i);
                  const besoin = besoins.find((b) => b.shift_id === shift.id && b.jour === jourISO);
                  return (
                    <td
                      key={i}
                      onClick={() => handleCelluleClick(jourISO, shift.id, besoin?.nombre_personnel)}
                      style={{ cursor: "pointer" }}
                    >
                      {besoin ? besoin.nombre_personnel : "--"}
                    </td>
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {formulaireVisible && (
        <FormulaireBesoins
          shifts={shifts}
          mois={moisCourant.getMonth() + 1}
          annee={moisCourant.getFullYear()}
          onFermer={() => setFormulaireVisible(false)}
          onEnregistrer={chargerBesoins}
        />
      )}
    </div>
  );
}

export default BesoinsPersonnel;