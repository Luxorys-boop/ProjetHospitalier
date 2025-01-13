import React, { useState, useEffect } from "react";

function RemoveButton() {
  const [selectedItems, setSelectedItems] = useState([]);

  // Fonction pour gérer le changement d'état des checkboxes
  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

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
      setSelectedItems([]);  // Réinitialiser les éléments sélectionnés après suppression
      alert("Utilisateurs supprimés avec succès !");
    } catch (err) {
      console.error("Erreur :", err);
      alert(`Erreur : ${err.message}`);
    }
  };

  return (
    <>
      <button onClick={handleRemoveSelected}>Remove Selected</button>
    </>
  );
}

export default RemoveButton;
