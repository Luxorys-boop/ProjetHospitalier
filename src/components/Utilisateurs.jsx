import React, { useState } from "react";
import Option from "./Option";

function UtilisateursPage() {
    const [cycle_id, setCycleID] = useState("");
    const [nom, setNom] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fonction pour créer un utilisateur
    const handleCreate = async () => {
        try {
            if (!cycle_id) { 
                throw new Error("Veuillez sélectionner un cycle avant de continuer.");
            }

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
            
            setResult("Utilisateur créé avec succès !");
            setError(null);
        } catch (err) {
            console.log(err);
            alert(err.message);
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
