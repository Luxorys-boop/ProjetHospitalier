import express from 'express';
import mysql2 from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 5001;

// Configuration de la base de données
const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'planning_hospitalier',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Création du pool de connexions MySQL
const pool = mysql2.createPool(config);

// Middleware
app.use(cors());
app.use(express.json());

// Fonction pour déterminer si un jour est un dimanche
const estDimanche = (index) => {
    const dateActuelle = new Date();
    const jourDeLaSemaine = (dateActuelle.getDay() + index + 4) % 7;
    return jourDeLaSemaine === 0;
};

// Fonctions de vérification des contraintes

// 12 heures de repos entre deux journées travaillées
const verifierReposEntreJournees = (cycle) => {
    for (let i = 1; i < cycle.length; i++) {
        const heureFin = cycle[i - 1].heureDebut + cycle[i - 1].duree;
        if ((heureFin + 12) >= 24) {
            // Normaliser les heures dans une plage de 24 heures
            const heureFinPrecedent = heureFin % 24;
            const heureDebutActuel = cycle[i].heureDebut % 24;

            // Calculer la différence dans un cycle de 24 heures
            const difference = (heureDebutActuel - heureFinPrecedent) % 24;


            // Vérifier si la différence est d'au moins 12 heures
            if (difference < 12) {
                return false;
            }
        }
    }
    return true;
};

// contrainte de 36 heures de repos consécutives hebdomadaires
const verifierReposHebdomadaire = (cycle) => {
    let reposConsecutifs = 0;
    for (let shift of cycle) {
        if (shift.typeRepos == true) {
            reposConsecutifs += 24; // 1 jour = 24 heures
        } else {
            reposConsecutifs = 0;
        }
        if (reposConsecutifs >= 36) {
            return true;
        }
    }
    return false;
};

// contrainte de 4 jours de repos sur 2 semaines dont au moins 2 consécutifs dont 1 dimanche
const verifierReposBihebdomadaire = (cycle) => {
    let reposConsecutifs = 0;
    let dimanches = 0;
    for (let shift of cycle) {
        if (shift.typeRepos == true) {
            reposConsecutifs += 1;
            if (estDimanche(shift.jour)) {
                dimanches += 1;
            }
        } else {
            reposConsecutifs = 0;
        }
        if (reposConsecutifs >= 2 && dimanches >= 1) {
            return true;
        }
    }
    return false;
};

// contrainte de 48 heures sur 7 jours roulants
const verifierHeuresMax7Jours = (cycle) => {
    let heures7Jours = 0;
    for (let i = 0; i < cycle.length; i++) {
        heures7Jours += cycle[i].duree;
        if (i >= 7) {
            heures7Jours -= cycle[i - 7].duree;
        }
        if (heures7Jours > 48) {
            return false;
        }
    }
    return true;
};

// contrainte de 44 heures par semaine
const verifierHeuresMaxSemaine = (cycle) => {
    let heuresSemaine = 0;
    for (let shift of cycle) {
        heuresSemaine += shift.duree;
        if (estDimanche(shift.jour)) {
            if (heuresSemaine > 44) {
                return false;
            }
            heuresSemaine = 0;
        }
    }
    return true;
};

// contrainte de 39 heures hebdomadaires en moyenne sur un cycle
const verifierHeuresMoyenneCycle = (cycle) => {
    let heuresTotales = cycle.reduce((total, shift) => total + shift.duree, 0);
    let heuresMoyennes = heuresTotales / (cycle.length / 7);
    return heuresMoyennes <= 39;
};

// contrainte de plus de 4 RH sur 2 semaines
const verifierReposHebdomadaireExces = (cycle) => {
    let reposHebdomadaires = cycle.filter(shift => shift.typeRepos === "RH").length;
    return reposHebdomadaires <= 4;
};

// Route pour vérifier les contraintes
app.post('/verify-constraints', async (req, res) => {
    const { cycle } = req.body;
    let violations = [];

    if (!verifierReposEntreJournees(cycle)) {
        violations.push("- Violation de la contrainte de 12 heures de repos entre deux journées travaillées.\n");
    }

    if (!verifierReposHebdomadaire(cycle)) {
        violations.push("- Violation de la contrainte de 36 heures de repos consécutives hebdomadaires.\n");
    }

    if (!verifierReposBihebdomadaire(cycle)) {
        violations.push("- Violation de la contrainte de 4 jours de repos sur 2 semaines dont au moins 2 consécutifs dont 1 dimanche.\n");
    }

    if (!verifierHeuresMax7Jours(cycle)) {
        violations.push("- Violation de la contrainte de 48 heures sur 7 jours roulants.\n");
    }

    if (!verifierHeuresMaxSemaine(cycle)) {
        violations.push("- Violation de la contrainte de 44 heures par semaine.\n");
    }

    if (!verifierHeuresMoyenneCycle(cycle)) {
        violations.push("- Violation de la contrainte de 39 heures hebdomadaires en moyenne sur un cycle.\n");
    }

    if (!verifierReposHebdomadaireExces(cycle)) {
        violations.push("- Violation de la contrainte de plus de 4 RH sur 2 semaines.\n");
    }

    res.json({ violations });
});

// Route pour vérifier la connexion à la base de données
app.get('/connect', async (res) => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database:', config.database);
        connection.release();
        res.status(200).send('Connexion réussie à la base de données.');
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).send(`Erreur lors de la connexion : ${error.message}`);
    }
});

// Route pour exécuter une requête SQL
app.post('/query', async (req, res) => {
    const { sql, params } = req.body;

    try {
        // Exécuter la requête SQL avec les paramètres
        const [rows] = await pool.execute(sql, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send(`Erreur lors de l'exécution de la requête : ${error.message}`);
    }
});

// Middleware pour gérer les erreurs non capturées
app.use((err, res) => {
    console.error('Uncaught error:', err);
    res.status(500).send(`Erreur inattendue : ${err.message}`);
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
