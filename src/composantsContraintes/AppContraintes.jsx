import React, { useState } from "react";
import ListeContraintes from "./ListeContraintes.jsx";
import Layout from "../Layout"; 
import "./Contraintes.css";

function AppContraintes() {
  return (
    <Layout>
      <div className="AppContraintes">
        <ListeContraintes />
      </div>
    </Layout>
  );
}

export default AppContraintes;
