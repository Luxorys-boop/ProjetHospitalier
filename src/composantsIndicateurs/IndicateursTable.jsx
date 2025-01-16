import React from 'react';
import './Indicateurs.css';

function IndicateursTable({ indicateurs, moyennes }) {
  return (
    <div className="indicateurs-container">
      <table className="indicateurs-table">
        <thead>
          <tr>
            <th>ID Utilisateur</th>
            <th>Besoins Non Couverts</th>
            <th>Jours avec Surplus</th>
            <th>Shifts Matin</th>
            <th>Shifts Soir</th>
            <th>Samedis Travaillés</th>
            <th>Dimanches Travaillés</th>
            <th>Total CA</th>
            <th>Total RH</th>
          </tr>
        </thead>
        <tbody>
          {indicateurs.map((indicateur, index) => (
            <tr key={index}>
              <td>{indicateur.utilisateur_id}</td>
              <td>{indicateur.besoins_non_couverts}</td>
              <td>{indicateur.surplus}</td>
              <td>{indicateur.shifts_matin}</td>
              <td>{indicateur.shifts_soir}</td>
              <td>{indicateur.samedis_travailles}</td>
              <td>{indicateur.dimanches_travailles}</td>
              <td>{indicateur.total_ca}</td>
              <td>{indicateur.total_rh}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Moyenne</td>
            {moyennes.map((moyenne, index) => (
              <td key={index}>{moyenne}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default IndicateursTable;