import React, { useState, useEffect } from "react";

function ListeContraintes() {
    const [cyclesInvalides, setCyclesInvalides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCyclesInvalides = async () => {
            try {
                // Récupérer tous les cycles à vérifier
                const response = await fetch("http://localhost:5001/query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sql: `
                            SELECT
                                c.id AS cycle_id,
                                c.nom_cycle AS cycle_nom,
                                cs.jour,
                                cs.shift_id,
                                s.nom AS shift_nom,
                                s.heure_debut,
                                s.duree
                            FROM
                                cycle_shifts cs
                            JOIN
                                shifts s ON cs.shift_id = s.id
                            JOIN
                                cycles c ON cs.cycle_id = c.id
                            ORDER BY
                                c.id, cs.jour
                        `,
                    }),
                });

                const cycles = await response.json();
                const groupedCycles = {};

                // Grouper les cycles par ID
                cycles.forEach((row) => {
                    if (!groupedCycles[row.cycle_id]) {
                        groupedCycles[row.cycle_id] = {
                            nom: row.cycle_nom,
                            shifts: [],
                        };
                    }
                    groupedCycles[row.cycle_id].shifts.push({
                        jour: row.jour,
                        heureDebut: row.heure_debut,
                        duree: row.duree,
                        shiftId: row.shift_id,
                        typeRepos: row.shift_nom === "RH",
                    });
                });

                const invalidCycles = {};

                // Vérifier chaque cycle via l'API /verify-constraints
                for (const [cycleId, cycle] of Object.entries(groupedCycles)) {
                    const constraintsResponse = await fetch("http://localhost:5001/verify-constraints", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cycle: cycle.shifts }),
                    });

                    const { violations } = await constraintsResponse.json();

                    if (violations.length > 0) {
                        invalidCycles[cycleId] = {
                            nom: cycle.nom,
                            violations,
                        };
                    }
                }

                setCyclesInvalides(invalidCycles);
            } catch (err) {
                console.error("Erreur lors de la vérification des cycles invalides :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCyclesInvalides();
    }, []);

    if (loading) {
        return <p>Chargement des cycles invalides...</p>;
    }

    return (
        <div className="liste-cycles-invalides">
            <h2>Cycles avec Contraintes Invalides</h2>
            {Object.keys(cyclesInvalides).length === 0 ? (
                <p>Aucune contrainte invalide trouvée pour les cycles.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nom du Cycle</th>
                            <th>Contraintes Invalides</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(cyclesInvalides).map(([cycleId, cycle]) => (
                            <tr key={cycleId}>
                                <td>{cycle.nom}</td>
                                <td>
                                    <ul>
                                        {cycle.violations.map((violation, index) => (
                                            <li key={index}>{violation}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ListeContraintes;
