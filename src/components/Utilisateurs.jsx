import React, { useState } from "react";
import Option from "./Option";

function UtilisateursPage({ setPopupOpen, onUserCreated }) {
    const [nom, setNom] = useState("");
    const [cycle_id, setCycleID] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fonction pour créer l'utilisateur
    const handleCreate = async () => {
        try {
            if (!cycle_id) {
                throw new Error("Veuillez sélectionner un cycle.");
            }

            // Étape 1 : Ajouter l'utilisateur
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

            // Étape 2 : Générer les assignations automatiques
            await fetch("http://localhost:5001/generate-assignations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    cycleId: cycle_id,
                    adjustDateBy: 1,
                }),
            });

            setResult("Utilisateur créé avec assignations !");
            setNom("");  // Réinitialiser le champ
            setCycleID("");
            setError(null);

            // Appeler la fonction parent pour rafraîchir la table
            onUserCreated();
            setPopupOpen(false);  // Fermer la pop-up
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Ajout d'un Utilisateur</h2>

            <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom de l'utilisateur"
                className="popup-input"
            />

            <Option setCycleID={setCycleID} />

            <div className="popup-buttons">
                <button onClick={handleCreate} className="create-btn">Créer</button>
                <button onClick={() => setPopupOpen(false)} className="cancel-btn">Annuler</button>
            </div>

            {result && <p style={{ color: "green" }}>{result}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default UtilisateursPage;