import React, { useEffect, useState } from 'react';
import Filler from './Filler';

const TableUser = ({ daysInMonth, refresh, onUserSelectionChange }) => {
    /**
     * Gestion d'état de Users pour contenir la liste des Users et l'afficher en bas de page si aucune erreur n'est détectée.
     * Gestion d'état d'Erreurs pour définir l'erreur si présente et l'afficher en bas de page.
     */
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5001/query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sql: "SELECT * FROM utilisateurs ORDER BY id",
                    }),
                });

                if (!response.ok) throw new Error("Erreur lors de la récupération.");
                const data = await response.json();
                setUsers(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUsers();
    }, []);

    /**
     * Fonction permettant de passer à onUserSelectionChange un userid.
     * @param {*} id 
     */
    const handleCheckboxChange = (id) => {
        onUserSelectionChange(id);
    };

    return (
        <>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.map((user) => (
                <tr key={user.id}>
                    <td>{user.id}
                        <input 
                            type="checkbox" 
                            id="scales" 
                            value={user.id} 
                            onChange={() => handleCheckboxChange(user.id)} 
                        />
                    </td>
                    {Array.from({ length: 0 }).map((_, i) => (
                        <td key={`empty-${i}`}></td>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                        <td key={i + 1}></td>
                    ))}
                </tr>
            ))}
            <Filler refresh={refresh} />
        </>
    );
};

export default TableUser;
