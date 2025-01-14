import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import Navbar from './components/Navbar';
import UtilisateursPage from './components/Utilisateurs';
import RemoveSelected from './components/RemoveSelected'
import Layout from "./Layout"; 
import Filler from './components/Filler';

function App() {
  const [buttonPopup, setButtonPopup] = useState(false);
  return (
    
    <Layout>
    <Navbar>
    </Navbar>
    <div className='tableContainer'>
      <TableMaker/>

    </div>
    <div className='containerButtons'>
        <button onClick={() => {
          setButtonPopup(true);
          let title = document.getElementsByClassName("theadmaker")[0]
          title.style.position = "inherit";
          }} className="addButton">Ajouter</button>
        <RemoveSelected></RemoveSelected>
    </div>
        
    <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
      <h2>Ajout Utilisateur</h2>
      <UtilisateursPage/>
    </Popup>
    </Layout>
  );
}


export default App;
