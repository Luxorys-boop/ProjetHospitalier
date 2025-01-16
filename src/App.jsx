import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import UtilisateursPage from './components/Utilisateurs';
import RemoveButton from './components/RemoveSelected';
import Layout from "./Layout"; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const downloadPDF = () => {
    // Initialiser jsPDF en mode paysage
    const doc = new jsPDF('landscape', 'mm', 'a4');
  
    // Ajouter un titre centré
    doc.setFontSize(22);
    doc.setTextColor(40);
    const title = 'Rapport - Page Principale';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (doc.internal.pageSize.getWidth() - titleWidth) / 2, 20);
  
    // Ajouter une ligne sous le titre
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 25, doc.internal.pageSize.getWidth() - 10, 25);
  
    // Ajouter un espacement avant le tableau
    doc.setFontSize(12);
    doc.text(' ', 10, 30);
  
    // Sélection du tableau dans le DOM
    const tableElement = document.querySelector('.tableContainer table');
  
    if (tableElement) {
      // Utilisation de autoTable pour structurer correctement le contenu avec des styles personnalisés
      doc.autoTable({
        html: tableElement,
        startY: 35, // Commencer après le titre et l'espacement
        theme: 'grid', // Thème avec des lignes visibles pour améliorer la lisibilité
        headStyles: {
          fillColor: [44, 62, 80], // Couleur sombre pour l'en-tête
          textColor: [255, 255, 255], // Texte blanc pour l'en-tête
          fontSize: 12, // Taille de la police des en-têtes
          fontStyle: 'bold',
          halign: 'center', // Centrer le texte dans l'en-tête
          padding: 10, // Ajouter du padding pour plus d'espace
        },
        bodyStyles: {
          fontSize: 10, // Taille de la police du corps du tableau
          cellPadding: 10, // Augmenter l'espacement interne des cellules
          lineColor: [200, 200, 200], // Couleur des lignes de séparation
          lineWidth: 0.25,
          halign: 'center', // Centrer le texte dans les cellules
          valign: 'middle', // Centrer verticalement le texte dans les cellules
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245], // Gris très clair pour les lignes alternées
        },
        margin: { top: 40, left: 10, right: 10 }, // Marge réduite pour occuper toute la largeur
        styles: {
          overflow: 'linebreak', // Permet le retour à la ligne automatique
          cellWidth: 'auto', // Ajuste automatiquement la largeur des cellules
        },
        columnStyles: {
          0: { cellWidth: 'wrap' }, // Ajuste la première colonne si nécessaire
          1: { cellWidth: 'wrap' }, // Ajuste la deuxième colonne si nécessaire
          2: { cellWidth: 'wrap' }, // Ajuste la troisième colonne si nécessaire
        },
      });
  
      // Ajouter un pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }
  
      // Sauvegarder le PDF
      doc.save('rapport-page-principale.pdf');
    } else {
      console.error('Table element not found');
    }
  };

  const downloadCSV = () => {
    const tableElement = document.querySelector('.tableContainer table');
    
    if (tableElement) {
      let csv = [];
      for (let row of tableElement.rows) {
        let cells = Array.from(row.cells).map(cell => `"${cell.textContent.trim()}"`);
        csv.push(cells.join(','));
      }
      const csvContent = `data:text/csv;charset=utf-8,${csv.join('\n')}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'page-principale.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Table element not found');
    }
  };

  return (
    <Layout>
      {/* Conteneur pour les boutons de téléchargement en haut à droite avec styles en ligne */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={downloadPDF} style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Télécharger PDF
        </button>
        <button onClick={downloadCSV} style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Télécharger CSV
        </button>
      </div>

      {/* Contenu principal avec tableau */}
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