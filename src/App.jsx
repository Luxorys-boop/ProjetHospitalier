import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import UtilisateursPage from './components/Utilisateurs';
import RemoveButton from './components/RemoveSelected';
import Layout from "./Layout"; 

function App() {

  /**
   * Etats contenants des données :
   * Gestion de l'affichage de la PopUp par un booleén
   * Gestion des checkedboxes utilisateurs, si l'utilisateur clique sur une box
   * Cela ajoute le user ID dans cette liste d'état.
   */
  const [buttonPopup, setButtonPopup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  /**
   * Fonction permettant d'ajouter les users sans doublons dans la liste.
   */
  const handleUserSelectionChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  /**
   * Fonction notifiant de la suppression complète des userID étant présents auparavant dans la liste
   */
  const handleRemoveComplete = () => {
    setSelectedUsers([]);
  };

  /**
   * Return du composant en balises html 
   */
  return (
    <Layout>
      <div className="tableContainer">
        <TableMaker onUserSelectionChange={handleUserSelectionChange} />
      </div>
      <div className="containerButtons">
        <button
          onClick={() => {
            setButtonPopup(true);
            let title = document.getElementsByClassName("theadmaker")[0];
            title.style.position = "inherit";
            let title2 = document.getElementsByClassName("theadmaker")[1];
            title2.style.display = "none";
          }}
          className="addButton"
        >
          Ajouter
        </button>
        <RemoveButton selectedItems={selectedUsers} onRemoveComplete={handleRemoveComplete} />
      </div>
      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <h2>Ajout Utilisateur</h2>
        <UtilisateursPage />
      </Popup>
    </Layout>
  );
}

export default App;
