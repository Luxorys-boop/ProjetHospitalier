import React, { useEffect, useState, useCallback } from 'react';

const Filler = ({ refresh }) => {
  const [cycleShifts, setCycleShifts] = useState({});
  const [error, setError] = useState(null);

  const fetchUsersCycles = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: `
            SELECT DISTINCT
              u.id AS user_id,
              u.nom AS user_nom,
              cs.cycle_id,
              cs.jour,
              s.nom AS shift_nom
            FROM
              utilisateurs u
            JOIN
              cycle_shifts cs ON cs.cycle_id = u.cycle_id
            JOIN
              shifts s ON cs.shift_id = s.id
            ORDER BY
              u.nom, cs.jour;
          `,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des cycles utilisateurs");
      }

      const data = await response.json();

      const groupedCycles = data.reduce((acc, curr) => {
        if (!acc[curr.user_id]) acc[curr.user_id] = {};
        if (!acc[curr.user_id][curr.cycle_id]) acc[curr.user_id][curr.cycle_id] = [];
        acc[curr.user_id][curr.cycle_id][curr.jour - 1] = curr.shift_nom; 
        return acc;
      }, {});

      setCycleShifts(groupedCycles);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
      setError("Impossible de récupérer les données. Veuillez réessayer plus tard.");
    }
  }, []);

  useEffect(() => {
    fetchUsersCycles();
  }, [fetchUsersCycles, refresh]);

  const extendCycleToNDays = (cycle, n) => {
    const extendedCycle = [];
    while (extendedCycle.length < n) {
      extendedCycle.push(...cycle);
    }
    return extendedCycle.slice(0, n);
  };

  const adaptToInsert = (n) => {
    let cycleUserExtended = [];
    Object.keys(cycleShifts).forEach(userId => {
      const userCycles = cycleShifts[userId];
      Object.keys(userCycles).forEach(cycleId => {
        const shifts = userCycles[cycleId];
        for(let y = 0 ; y < shifts.length ; y++) {
          if(typeof shifts[y] == "undefined") {
            shifts[y] = "RH"
          }
        }
        cycleUserExtended.push(extendCycleToNDays(shifts, n));
      });
    });
    return cycleUserExtended;
  };

  const insertParagraph = () => {
    let docs = document.getElementsByClassName("userTable");
    if (docs.length > 0) {
      Array.from(docs).forEach(doc => {
        let tbody = doc.childNodes;
        let usersCycle = adaptToInsert(31);

        for (let x = 0; x < tbody.length; x++) {
          for (let i = 1; i < tbody[x].childNodes.length; i++) {
            let p = document.createElement("p");
            if (typeof tbody[x].childNodes[i].childNodes[0] === 'undefined') {
              p.textContent = usersCycle[x][i-1];
              tbody[x].childNodes[i].appendChild(p);
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    insertParagraph();
  }, [cycleShifts]);

  return (
    <>
    </>
  );
};

export default Filler;
