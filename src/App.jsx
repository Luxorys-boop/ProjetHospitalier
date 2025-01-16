import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import Navbar from './components/Navbar';
import UtilisateursPage from './components/Utilisateurs';
import RemoveButton from './components/RemoveSelected';
import Layout from "./Layout"; 
import BesoinInfirmier from "./components/BesoinInfirmier";

function App() {
  const [buttonPopup, setButtonPopup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelectionChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleRemoveComplete = () => {
    setSelectedUsers([]);
  };

  return (
    <Layout>
      <Navbar />
      <div className="tableContainer">
        <TableMaker onUserSelectionChange={handleUserSelectionChange} />
      </div>
      <div className="containerButtons">
        <button
          onClick={() => {
            setButtonPopup(true);
            let title = document.getElementsByClassName("theadmaker")[0];
            title.style.position = "inherit";
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
      <BesoinInfirmier />
    </Layout>
  );
}

export default App;
