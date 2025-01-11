import React, { useState } from "react";

function UtilisateursPage() {
    const [id, setId] = useState("");
    const [nom, setNom] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fonction pour récupérer tous les utilisateurs
    const handleGetAll = async () => {
        try {
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "SELECT * FROM utilisateurs",
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération.");
            const data = await response.json();

            // Convertir tous les utilisateurs en JSON formaté
            setResult(data.length > 0 ? JSON.stringify(data, null, 2) : "Aucun utilisateur trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour récupérer un utilisateur par ID
    const handleGetById = async () => {
        try {
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "SELECT * FROM utilisateurs WHERE id = ?",
                    params: [id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération.");
            const data = await response.json();
            setResult(data.length > 0 ? JSON.stringify(data[0], null, 2) : "Utilisateur introuvable.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour créer un utilisateur
    const handleCreate = async () => {
        try {
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "INSERT INTO utilisateurs (nom) VALUES (?)",
                    params: [nom],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la création.");
            setResult("Utilisateur créé avec succès !");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour mettre à jour un utilisateur
    const handleUpdate = async () => {
        try {
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "UPDATE utilisateurs SET nom = ? WHERE id = ?",
                    params: [nom, id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
            const data = await response.json();
            setResult(data.affectedRows > 0 ? "Utilisateur mis à jour avec succès." : "Aucun utilisateur trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Fonction pour supprimer un utilisateur
    const handleDelete = async () => {
        try {
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "DELETE FROM utilisateurs WHERE id = ?",
                    params: [id],
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression.");
            const data = await response.json();
            setResult(data.affectedRows > 0 ? "Utilisateur supprimé avec succès." : "Aucun utilisateur trouvé.");
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            {/* Formulaire pour les champs */}
            <div>
                <label>ID :</label>
                <input
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ID de l'utilisateur"
                />
            </div>
            <div>
                <label>Nom :</label>
                <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom de l'utilisateur"
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

export default UtilisateursPage;
