import React, { useEffect, useState } from 'react';

const TableUser = ({ daysInMonth, startDay }) => {
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

    return (
        <>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.map((user) => (
                <tr key={user.id}>
                    <td>{user.id}</td>
                    {Array.from({ length: 0 }).map((_, i) => (
                        <td key={`empty-${i}`}></td>
                    ))}
                    {Array.from({ length: 31 }).map((_, i) => (
                        <td key={i + 1}></td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableUser;
