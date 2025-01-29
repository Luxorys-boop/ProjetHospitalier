import React, { useState } from "react";
import Option from "./Option";

function UtilisateursPage() {
    const [nom, setNom] = useState("");
    const [cycle_id, setCycleID] = useState(""); // Stocke l'ID du cycle sélectionné
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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
                <button onClick={handleCreate}>Créer</button>
                <Option setCycleID={setCycleID} />
            </div>

            {/* Affichage des résultats ou des erreurs */}
            {result && <pre style={{ color: "green" }}>{result}</pre>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default UtilisateursPage;
