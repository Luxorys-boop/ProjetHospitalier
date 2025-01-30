import React, { useState } from "react";
import ListeShifts from "./ListeShifts.jsx";
import FormulaireShifts from "./FormulaireShifts.jsx";
import "./shifts.css";
import Layout from "../Layout"; 


function AppShifts() {
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const [shiftEdition, setShiftEdition] = useState(null);

  const handleAjouterShift = () => {
    setShiftEdition(null); // Réinitialise le shift à éditer
    setFormulaireVisible(true); // Affiche le formulaire
  };

  const handleEditerShift = (shift) => {
    setShiftEdition(shift); // Définit le shift à modifier
    setFormulaireVisible(true); // Affiche le formulaire
  };

  const handleFermerFormulaire = () => {
    setFormulaireVisible(false); // Masque le formulaire
  };

  return (
    <Layout>
    <div className="appshifts">
      <h1 className="h1S">Gestion des Shifts</h1>
      <ListeShifts onAjouterShift={handleAjouterShift} onEditerShift={handleEditerShift} />
      {formulaireVisible && (
        <FormulaireShifts shift={shiftEdition} onFermer={handleFermerFormulaire} />
      )}
    </div>
    </Layout>
  );
}

export default AppShifts;
