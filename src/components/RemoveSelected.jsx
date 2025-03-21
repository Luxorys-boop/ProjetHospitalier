import React, { useState } from 'react';
import removeIcon from '../images/2.svg';
import "../index.css";


function RemoveSelected({ selectedItems, onRemoveComplete }) {
  // Fonction pour supprimer les éléments sélectionnés
  const handleRemoveSelected = async () => {
    try {
      for (const id of selectedItems) {
        console.log(`Suppression de l'utilisateur avec ID: ${id}`);
        const response = await fetch("http://localhost:5001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sql: "DELETE FROM utilisateurs WHERE id = ?",
            params: [id],
          }),
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression.");
      }
      alert("Utilisateurs supprimés avec succès !");
      onRemoveComplete();
    } catch (err) {
      console.error("Erreur :", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <>
      <button onClick={handleRemoveSelected} className="supp-button">
      <img src={removeIcon} alt="Supprimer" />
    </button>
    </>
  );
}

export default RemoveSelected;
