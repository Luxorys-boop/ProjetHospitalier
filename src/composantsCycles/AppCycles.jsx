import React, { useState } from "react";
import ListeCycles from "./ListeCycles.jsx";
import FormulaireAjoutCycle from "./FormulaireAjoutCycle.jsx";
import Layout from "../Layout"; 
import "./Cycles.css";

function AppCycles() {
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  // Gestion de l'affichage du formulaire
  const handleAjouterCycle = () => {
    setFormulaireVisible(true);
  };

  const handleFermerFormulaire = () => {
    setFormulaireVisible(false);
  };

  return (
    <div className="appcycles">
      <ListeCycles onAjouterCycle={handleAjouterCycle} />
      {formulaireVisible && <FormulaireAjoutCycle onFermer={handleFermerFormulaire} />}
    </div>
  );
}

export default AppCycles;
