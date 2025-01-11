import React, { useState } from "react";
import ListeCycles from "./ListeCycles.jsx";
import FormulaireAjoutCycle from "./FormulaireAjoutCycle.jsx";
import "./Cycles.css";

function AppCycles() {
  const [formulaireVisible, setFormulaireVisible] = useState(false);

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