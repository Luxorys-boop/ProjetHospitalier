import React, { useState } from 'react';
import TableMaker from './components/Tablemaker';
import Popup from './components/Popup';
import UtilisateursPage from './components/Utilisateurs';
import RemoveButton from './components/RemoveSelected';
import Layout from "./Layout";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BesoinsPersonnel from './composantsBesoinsPersonnel/BesoinsPersonnel';

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
    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.setFontSize(22);
    doc.setTextColor(40);
    const title = 'Rapport - Page Principale';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (doc.internal.pageSize.getWidth() - titleWidth) / 2, 20);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 25, doc.internal.pageSize.getWidth() - 10, 25);
    doc.setFontSize(12);
    doc.text(' ', 10, 30);

    const tableElement = document.querySelector('.tableContainer table');
    const besoinsTableElement = document.querySelector('.besoins-table');

    if (tableElement) {
      doc.autoTable({
        html: tableElement,
        startY: 35,
        theme: 'grid',
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center',
          padding: 10,
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 10,
          lineColor: [200, 200, 200],
          lineWidth: 0.25,
          halign: 'center',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40, left: 10, right: 10 },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'auto',
        },
      });
    }

    if (besoinsTableElement) {
      doc.addPage();
      doc.text('Besoins en Personnel', 10, 20);
      doc.autoTable({
        html: besoinsTableElement,
        startY: 30,
        theme: 'grid',
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    doc.save('rapport-page-principale.pdf');
  };

  return (
    <Layout>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={downloadPDF} style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Télécharger PDF
        </button>
      </div>

      <div className="tableContainer">
        <TableMaker onUserSelectionChange={handleUserSelectionChange} />
      </div>
      <div className="containerButtons">
        <button
          onClick={() => {
            setButtonPopup(true);
            let title = document.getElementsByClassName("theadmaker")[0];
            title.style.position = "inherit";
            let tab = document.getElementsByTagName("table");
            for(let i = 0 ; i < tab.length ; i++) {
              tab[i].style.display = "None";
            }
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
      <BesoinsPersonnel />
    </Layout>
  );
}

export default App;
