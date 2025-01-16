import React, { useEffect, useState } from 'react';
import './Indicateurs.css';

function IndicateursTable() {
  const [indicateurs, setIndicateurs] = useState([]);
  const [totaux, setTotaux] = useState([]);

  useEffect(() => {
    const fetchIndicateurs = async () => {
      try {
        const response = await fetch('http://localhost:5001/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              SELECT 
                u.id AS utilisateur_id,
                u.nom AS utilisateur_nom,
                COUNT(DISTINCT CASE WHEN s.besoin_infirmiers > 0 THEN cs.id END) AS besoins_non_couverts,
                COUNT(DISTINCT CASE WHEN s.besoin_infirmiers < 0 THEN cs.id END) AS surplus,
                COUNT(CASE WHEN s.nom = 'Matin' THEN 1 END) AS shifts_matin,
                COUNT(CASE WHEN s.nom = 'Soir' THEN 1 END) AS shifts_soir,
                COUNT(CASE WHEN ((DAYOFWEEK(cs.jour) + 4) % 7) = 4 THEN 1 END) AS samedis_travailles,
                COUNT(CASE WHEN ((DAYOFWEEK(cs.jour) + 4) % 7) = 5 THEN 1 END) AS dimanches_travailles,
                COUNT(CASE WHEN s.nom = 'CA' THEN 1 END) AS total_ca,
                COUNT(CASE WHEN s.nom = 'RH' THEN 1 END) AS total_rh
              FROM utilisateurs u
              LEFT JOIN cycle_shifts cs ON u.cycle_id = cs.cycle_id
              LEFT JOIN shifts s ON cs.shift_id = s.id
              GROUP BY u.id;
            `,
          }),
        });

        const data = await response.json();
        console.log('Données récupérées :', data); // Vérification en console
        setIndicateurs(data);

        // Calcul des totaux
        const totauxColonnes = Array(9).fill(0); // 9 colonnes à calculer
        data.forEach((row) => {
          totauxColonnes[0] += row.besoins_non_couverts || 0;
          totauxColonnes[1] += row.surplus || 0;
          totauxColonnes[2] += row.shifts_matin || 0;
          totauxColonnes[3] += row.shifts_soir || 0;
          totauxColonnes[4] += row.samedis_travailles || 0;
          totauxColonnes[5] += row.dimanches_travailles || 0;
          totauxColonnes[6] += row.total_ca || 0; // Total CA
          totauxColonnes[7] += row.total_rh || 0; // Total RH
        });
        setTotaux(totauxColonnes);
      } catch (error) {
        console.error('Erreur lors de la récupération des indicateurs :', error);
      }
    };

    fetchIndicateurs();
  }, []);

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
            <th>Nombre de CA</th>
            <th>Nombre de RH</th>
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
            <td>Somme</td>
            {totaux.map((total, index) => (
              <td key={index}>{total}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default IndicateursTable;
