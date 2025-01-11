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
    </Navbar>
    <div className='tableContainer'>
      <TableMaker/>
      <div><button onClick={() => setButtonPopup(true)} class="addButton">Ajouter</button></div>
    </div>

    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
      <h2>Ajout Utilisateur</h2>
      <UtilisateursPage/>
    </Popup>
    </>
  );
}


export default App;
