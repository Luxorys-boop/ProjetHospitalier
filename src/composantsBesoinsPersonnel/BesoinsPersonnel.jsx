import React, { useState, useEffect } from "react";
import "./BesoinsPersonnel.css";
import FormulaireBesoins from "./FormulaireBesoins";

function BesoinsPersonnel() {
  const [moisCourant, setMoisCourant] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [besoins, setBesoins] = useState([]);
  const [assignations, setAssignations] = useState([]);
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const joursAbrégés = ["D", "L", "M", "ME", "J", "V", "S"];

  // Charger les shifts
  const chargerShifts = async () => {
    try {
      const response = await fetch("http://localhost:5001/get-shifts");
      const data = await response.json();
      setShifts(data.filter((shift) => shift.nom !== "RH" && shift.nom !== "CA"));
    } catch (error) {
      console.error("Erreur chargement des shifts :", error);
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
      console.error("Erreur chargement des besoins :", error);
    }
  };

  // Charger les assignations
  const chargerAssignations = async () => {
    try {
      const mois = moisCourant.getMonth() + 1;
      const annee = moisCourant.getFullYear();
      const response = await fetch("http://localhost:5001/get-assignations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mois, annee }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      setAssignations(data);
    } catch (error) {
      console.error("Erreur chargement des assignations :", error);
    }
  };

  // Calculer le besoin (Y) et les assignations (X) pour une cellule donnée
  const calculerXY = (jour, shiftId) => {
    const jourAjuste = new Date(jour);
    jourAjuste.setDate(jourAjuste.getDate() + 1); // Ajustement pour les assignations
    const jourAjusteISO = jourAjuste.toISOString().split("T")[0];

    const besoin = besoins.find((b) => b.jour === jourAjusteISO && b.shift_id === shiftId);
    const assignationsPourShift = assignations.filter(
      (a) => a.jour === jourAjusteISO && a.shift_id === shiftId
    );

    const x = assignationsPourShift.length;
    const y = besoin ? besoin.nombre_personnel : 0;

    return { x, y, affichage: `${x}/${y}` };
  };

  // Déterminer la couleur personnalisée en fonction de x et y
  const getCouleurTexte = (x, y) => {
    if (x > y) return "#135be6";  // Bleu pour surcharge
    if (x < y) return "#DD761C";  // Orange pour sous-effectif
    return "#179d5c";              // Vert pour équilibre parfait
  };

  // Modifier une cellule (besoin)
  const modifierCellule = async (jour, shiftId, nouveauBesoin) => {
    const jourAjuste = new Date(jour);
    jourAjuste.setDate(jourAjuste.getDate() + 2);
    const jourAjusteISO = jourAjuste.toISOString().split("T")[0];

    try {
      const response = await fetch("http://localhost:5001/update-besoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jour: jourAjusteISO, shift_id: shiftId, nombre_personnel: nouveauBesoin }),
      });

      if (response.ok) {
        console.log("Besoin mis à jour avec succès !");
        await chargerBesoins();
      } else {
        alert("Erreur lors de la mise à jour du besoin.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  // Gestion du clic sur une cellule
  const handleCelluleClick = (jourISO, shiftId, besoinActuel) => {
    const jourAjuste = new Date(jourISO);
    jourAjuste.setDate(jourAjuste.getDate() + 2); // Décalage visuel de 2 jours pour le prompt
    const jourAjusteISO = jourAjuste.toISOString().split("T")[0];

    const nouveauBesoin = prompt(
      `Modifier le besoin pour ${jourAjusteISO} (${shiftId}):`,
      besoinActuel.split("/")[1]
    );

    if (nouveauBesoin !== null && !isNaN(parseInt(nouveauBesoin, 10))) {
      modifierCellule(jourISO, shiftId, parseInt(nouveauBesoin, 10));
    }
  };

  // Modifier le mois affiché
  const handleMoisChange = (increment) => {
    setMoisCourant(new Date(moisCourant.getFullYear(), moisCourant.getMonth() + increment, 1));
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

  // Générer les entêtes (jours) pour le tableau
  const genererEntetes = () => {
    const joursDansMois = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + 1, 0).getDate();
    return [...Array(joursDansMois)].map((_, i) => {
      const dateCourante = new Date(moisCourant.getFullYear(), moisCourant.getMonth(), i + 1);
      const jourDeLaSemaine = dateCourante.getDay();
      const dateISO = dateCourante.toISOString().split("T")[0];
      return { affichage: `${joursAbrégés[jourDeLaSemaine]}${i + 1}`, dateISO };
    });
  };

  useEffect(() => {
    chargerShifts();
    chargerBesoins();
    chargerAssignations();
  }, [moisCourant]);

  return (
    <div className="besoins-personnel">
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
            {genererEntetes().map(({ affichage }, i) => (
              <th key={i}>{affichage}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.nom}</td>
              {genererEntetes().map(({ dateISO }, i) => {
                const { x, y, affichage } = calculerXY(dateISO, shift.id);
                const couleurTexte = getCouleurTexte(x, y);

                return (
                  <td
                    key={i}
                    onClick={() => handleCelluleClick(dateISO, shift.id, affichage)}
                    style={{ cursor: "pointer", color: couleurTexte }}
                  >
                    {affichage}
                  </td>
                );
              })}
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