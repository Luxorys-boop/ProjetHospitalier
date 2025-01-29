import React, { useEffect, useState } from 'react';
import IndicateursTable from './IndicateursTable';
import './Indicateurs.css';
import Layout from '../Layout';

function AppIndicateurs() {
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
                COUNT(DISTINCT CASE WHEN s.besoin_infirmiers > 0 THEN a.id END) AS besoins_non_couverts,
                COUNT(DISTINCT CASE WHEN s.besoin_infirmiers < 0 THEN a.id END) AS surplus,
                COUNT(CASE WHEN s.nom = 'Matin' THEN 1 END) AS shifts_matin,
                COUNT(CASE WHEN s.nom = 'Soir' THEN 1 END) AS shifts_soir,
                COUNT(CASE WHEN DAYOFWEEK(a.jour) = 7 THEN 1 END) AS samedis_travailles,
                COUNT(CASE WHEN DAYOFWEEK(a.jour) = 1 THEN 1 END) AS dimanches_travailles,
                COUNT(CASE WHEN s.nom = 'CA' THEN 1 END) AS total_ca,
                COUNT(CASE WHEN s.nom = 'RH' THEN 1 END) AS total_rh
              FROM assignations a
              JOIN utilisateurs u ON a.user_id = u.id  -- Corrected join
              JOIN shifts s ON a.shift_id = s.id
              WHERE YEAR(a.jour) = YEAR(CURDATE())  -- Filtrer l'année actuelle
              GROUP BY u.id;
            `,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        const data = await response.json();
        setIndicateurs(data);

        const colonnesMoyennes = Array(8).fill(0);
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
      <div id="app-indicateurs" className="appindicateurs">
        <h1 className="indicateurs-header">Indicateurs</h1>
        <IndicateursTable indicateurs={indicateurs} moyennes={moyennes} />
      </div>
    </Layout>
  );
}

export default AppIndicateurs;