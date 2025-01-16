import React, { useEffect, useState } from 'react';
import './Indicateurs.css';
import Layout from '../Layout';

function IndicateursTable() {
  const [indicateurs, setIndicateurs] = useState([]);
  const [moyennes, setMoyennes] = useState([]);
  const [error, setError] = useState(null);

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
                COUNT(CASE WHEN DAYOFWEEK(cs.jour) = 7 THEN 1 END) AS samedis_travailles,
                COUNT(CASE WHEN DAYOFWEEK(cs.jour) = 1 THEN 1 END) AS dimanches_travailles,
                COUNT(CASE WHEN s.nom = 'CA' THEN 1 END) AS total_ca,
                COUNT(CASE WHEN s.nom = 'RH' THEN 1 END) AS total_rh
              FROM utilisateurs u
              LEFT JOIN cycle_shifts cs ON u.cycle_id = cs.cycle_id
              LEFT JOIN shifts s ON cs.shift_id = s.id
              GROUP BY u.id;
            `,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        const data = await response.json();

        setIndicateurs(data);

        // Calcul des moyennes
        const colonnesMoyennes = Array(8).fill(0); // Passe à 8 colonnes au lieu de 9
        data.forEach((row) => {
          colonnesMoyennes[0] += row.besoins_non_couverts || 0;
          colonnesMoyennes[1] += row.surplus || 0;
          colonnesMoyennes[2] += row.shifts_matin || 0;
          colonnesMoyennes[3] += row.shifts_soir || 0;
          colonnesMoyennes[4] += row.samedis_travailles || 0;
          colonnesMoyennes[5] += row.dimanches_travailles || 0;
          colonnesMoyennes[6] += row.total_ca || 0;
          colonnesMoyennes[7] += row.total_rh || 0;
        });

        const nombreUtilisateurs = data.length || 1;
        const moyennesCalculées = colonnesMoyennes.map((total) =>
          Math.round((total / nombreUtilisateurs) * 100) / 100
        );
        setMoyennes(moyennesCalculées);
      } catch (error) {
        console.error('Erreur lors de la récupération des indicateurs :', error);
        setError('Impossible de charger les indicateurs.');
      }
    };

    fetchIndicateurs();
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (indicateurs.length === 0) {
    return <p>Chargement des indicateurs en cours...</p>;
  }

  return (
    <Layout>
      <h1 className="indicateurs-header">Indicateurs</h1>
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
    </Layout>
  );
}

export default IndicateursTable;
