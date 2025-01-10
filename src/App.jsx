import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import Navbar from './components/Navbar';
import UtilisateursPage from './components/Utilisateurs';
function App() {
  const [buttonPopup, setButtonPopup] = useState(false);
  return (
    <>
    <Navbar>
      <div><button onClick={() => setButtonPopup(true)} class="addButton">Ajouter</button></div>
      <div><button class="editButton">Editer</button></div>
      <div><p>Attente</p></div>
      <div class="search-container"> 
        <div class="search-box"> 
            <input type="text" placeholder="Search..."></input> 
            <button type="submit">Search</button>
        </div>
      </div>
    </Navbar>
    <TableMaker/>

    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
      <h2>Ajout Utilisateur</h2>
      <UtilisateursPage/>
    </Popup>
    </>
  );
}


export default App;
