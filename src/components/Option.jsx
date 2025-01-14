import React, { useState, useEffect } from 'react';

function Option() {
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await fetch('http://localhost:5001/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: 'SELECT id FROM cycles',
            params: []
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des cycles.');
        const data = await response.json();
        setCycles(data);
      } catch (error) {
        console.error('Erreur de récupération des cycles:', error);
      }
    };

    fetchCycles();
  }, []);

  return (
    <>
      <option> -- Selectionnez un cycle ! -- </option>
      {cycles.map((cycle) => (
        <option key={cycle.id} value={cycle.id}>
          Cycle {cycle.id}
        </option>
      ))}
    </>
  );
}

export default Option;
