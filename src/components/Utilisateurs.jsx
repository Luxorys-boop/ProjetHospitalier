import React, { useState } from "react";
import Option from "./Option";
function UtilisateursPage() {
    const [id, setId] = useState("");
    const [cycle_id, setCycleID] = useState("");
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

    const handleCreate = async () => {
        try {
            if (!cycle_id) { 
                throw new Error("Veuillez sélectionner un cycle.");
            }
    
            // Étape 1 : Ajouter l'utilisateur dans la base de données
            const response = await fetch("http://localhost:5001/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: "INSERT INTO utilisateurs (nom, cycle_id) VALUES (?, ?)",
                    params: [nom, cycle_id],
                }),
            });
    
            if (!response.ok) {
                throw new Error("Erreur lors de la création.");
            } 
            
            const userData = await response.json();
            const userId = userData.insertId;
    
            // Étape 2 : Générer les assignations automatiques pour l'utilisateur
            const assignationResponse = await fetch("http://localhost:5001/generate-assignations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    cycleId: cycle_id,
                    adjustDateBy: 1, // Indique au backend d'ajouter 1 jour à chaque date
                }),
            });
    
            if (!assignationResponse.ok) {
                throw new Error("Erreur lors de la génération des assignations.");
            }
    
            setResult("Utilisateur créé avec assignations !");
            setError(null);
        } catch (err) {
            alert('Veuillez sélectionner un cycle avant de continuer.'); 
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
                <label>
                <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom de l'utilisateur"
                />
                </label>
                
            </div>

            {/* Boutons pour les opérations CRUD */}
            <div className="containerButtons">
                <button onClick={handleGetAll}>Get All</button>
                <button onClick={handleCreate}>Create</button>
                <select onChange={(e) => setCycleID(e.target.value)}>
                    <Option></Option>
                </select>
                
            </div>

            {/* Affichage des résultats ou des erreurs */}
            {result && <pre style={{ color: "green" }}>{result}</pre>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default UtilisateursPage;
