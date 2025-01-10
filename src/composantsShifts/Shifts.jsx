import React, { useState } from "react";

function ShiftsPage() {
    const [id, setId] = useState("");
    const [nom, setNom] = useState("");
    const [heure_debut, setHeureDebut] = useState("");
    const [duree, setDuree] = useState("");
    const [besoin_infirmiers, setBesoinInfirmier] = useState("");
    const [service_id, setServiceId] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fonction pour récupérer tous les shifts
    const handleGetAll = async () => {
        try {
            const response = await fetch("http://localhost:5000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "SELECT * FROM shifts",
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération.");
            const data = await response.json();
            setResult(data.length > 0 ? JSON.stringify(data, null, 2) : "Aucun shift trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour récupérer un utilisateur par ID
    const handleGetById = async () => {
        try {
            const response = await fetch("http://localhost:5000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "SELECT * FROM shifts WHERE id = ?",
                    params: [id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération.");
            const data = await response.json();
            setResult(data.length > 0 ? JSON.stringify(data[0], null, 2) : "Shift introuvable.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreate = async () => {
        if (!nom || !duree) {
            setError("Les champs 'Nom' et 'Durée' sont obligatoires.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "INSERT INTO shifts (nom, heure_debut, duree, besoin_infirmiers, service_id) VALUES (?, ?, ?, ?, ?)",
                    params: [nom, heure_debut || null, duree, besoin_infirmiers || null, service_id || null],
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erreur lors de la création : ${errorData}`);
            }

            setResult("Shift créé avec succès !");
            setError(null);
        } catch (err) {
            setError(err.message);
            setResult(null);
        }
    };


    // Fonction pour mettre à jour un shift
    const handleUpdate = async () => {
        if (!nom || !duree) {
            setError("Les champs 'Nom' et 'Durée' sont obligatoires.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "UPDATE shifts SET nom = ?, heure_debut = ?, duree = ?, besoin_infirmiers = ?, service_id = ? WHERE id = ?",
                    params: [nom, heure_debut || null, duree, besoin_infirmiers || null, service_id || null, id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
            const data = await response.json();
            setResult(data.affectedRows > 0 ? "Shift mis à jour avec succès." : "Aucun shift trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour supprimer un shift par ID
    const handleDelete = async () => {
        if (!id) {
            setError("L'ID est obligatoire pour effectuer une suppression.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "DELETE FROM shifts WHERE id = ?",
                    params: [id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression.");
            const data = await response.json();
            setResult(data.affectedRows > 0 ? "Shift supprimé avec succès." : "Aucun shift trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Gestion des Shifts</h1>

            {/* Formulaire pour les champs */}
            <div>
                <label>ID :</label>
                <input
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ID du shift"
                />
            </div>
            <div>
                <label>Nom :</label>
                <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom du shift"
                    required
                />
            </div>
            <div>
                <label>Heure de début :</label>
                <input
                    type="time"
                    value={heure_debut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    placeholder="Heure de début"
                />
            </div>
            <div>
                <label>Durée :</label>
                <input
                    type="number"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    placeholder="Durée en heures"
                    required
                    min="1"
                />
            </div>
            <div>
                <label>Besoin en infirmiers :</label>
                <input
                    type="number"
                    value={besoin_infirmiers}
                    onChange={(e) => setBesoinInfirmier(e.target.value)}
                    placeholder="Besoin en infirmiers"
                />
            </div>
            <div>
                <label>Service ID :</label>
                <input
                    type="number"
                    value={service_id}
                    onChange={(e) => setServiceId(e.target.value)}
                    placeholder="Service ID"
                />
            </div>

            {/* Boutons pour les opérations CRUD */}
            <div>
                <button onClick={handleGetAll}>Get All</button>
                <button onClick={handleGetById}>Get By Id</button>
                <button onClick={handleCreate}>Create</button>
                <button onClick={handleUpdate}>Update</button>
                <button onClick={handleDelete}>Delete</button>
            </div>

            {/* Affichage des résultats ou des erreurs */}
            {result && <pre style={{ color: "green" }}>{result}</pre>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default ShiftsPage;
