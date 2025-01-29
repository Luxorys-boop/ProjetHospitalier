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
    const jourDeLaSemaine = (dateActuelle.getDay() + index - 2) % 7;
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
    let reposConsecutifs = 0; // En heures

    for (let i = 1; i < cycle.length; i++) {
        // Calculer l'heure de fin du shift précédent
        const heureFin = cycle[i - 1].heureDebut + cycle[i - 1].duree;

        // Normaliser les heures dans une plage de 24 heures
        const heureFinPrecedent = heureFin % 24;
        const heureDebutActuel = cycle[i].heureDebut % 24;

        // Si le shift précédent est un RH, ajouter 24 heures de repos
        if (cycle[i - 1].typeRepos === true) {
            reposConsecutifs += 24;
        } else {
            // Calculer la différence entre la fin du shift précédent et le début du shift actuel
            const difference = (heureDebutActuel - heureFinPrecedent + 24) % 24;
            reposConsecutifs += difference;
        }

        // Vérifier si le repos atteint 36 heures
        if (reposConsecutifs >= 36) {
            return true;
        }

        // Si le shift actuel n'est pas un RH, réinitialiser le compteur
        if (cycle[i].typeRepos !== true) {
            reposConsecutifs = 0;
        }
    }

    return false; // Aucun repos consécutif de 36 heures trouvé
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

// Endpoint : add besoins 
app.post("/add-besoin", async (req, res) => {
    const { semaineBesoins, annee } = req.body;
  
    console.log("Données reçues :", { semaineBesoins, annee });
  
    if (!semaineBesoins || !annee) {
      console.error("Données manquantes : semaineBesoins ou annee");
      return res.status(400).json({ error: "Données manquantes pour l'ajout des besoins." });
    }
  
    try {
      const connection = await pool.getConnection();
  
      for (let mois = 0; mois < 12; mois++) {
        const premierJourMois = new Date(Date.UTC(annee, mois, 1));
  
        for (let jour = 0; jour < 31; jour++) {
          const dateJour = new Date(premierJourMois);
          dateJour.setUTCDate(jour + 1);
  
          if (dateJour.getUTCMonth() !== mois) break; // on arrete  si on dépasse le mois actuel
  
          const jourIndex = (jour % 7); 
          const besoinsJour = semaineBesoins[jourIndex];
          if (!besoinsJour) continue;
  
          for (const [shiftId, nombrePersonnel] of Object.entries(besoinsJour)) {
            if (!shiftId || typeof nombrePersonnel === "undefined") {
              console.error(`Paramètre manquant pour le shiftId ${shiftId} ou nombrePersonnel ${nombrePersonnel}`);
              continue;
            }
  
            const sql = `
              INSERT INTO besoin_personnel (jour, shift_id, nombre_personnel)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE nombre_personnel = ?;
            `;
            const params = [
              dateJour.toISOString().split("T")[0],
              shiftId,
              nombrePersonnel,
              nombrePersonnel,
            ];
            console.log("Exécution de la requête SQL avec :", params);
            await connection.execute(sql, params);
          }
        }
      }
  
      connection.release();
      res.json({ success: true });
    } catch (err) {
      console.error("Erreur lors de l'ajout des besoins :", err);
      res.status(500).json({ error: "Erreur lors de l'ajout des besoins." });
    }
  });
  
  /// Endpoint : Récupérer la liste des shifts (sauf RH et CA)
  app.get("/get-shifts", async (req, res) => {
    try {
      const sql = "SELECT id, nom FROM shifts WHERE nom NOT IN ('RH', 'CA');";
      const [rows] = await pool.execute(sql); 
      res.json(rows);
    } catch (err) {
      console.error("Erreur lors de la récupération des shifts :", err);
      res.status(500).json({ error: "Erreur lors de la récupération des shifts." });
    }
  });
  
  // Endpoint pour récupérer les besoins
  app.post("/get-besoins", async (req, res) => {
    const { mois, annee } = req.body;
  
    console.log("Récupération des besoins pour :", { mois, annee });
  
    if (!mois || !annee) {
      return res.status(400).json({ error: "Mois ou année manquants." });
    }
  
    try {
      const sql = `
        SELECT jour, shift_id, nombre_personnel 
        FROM besoin_personnel 
        WHERE MONTH(jour) = ? AND YEAR(jour) = ?;
      `;
      const [rows] = await pool.execute(sql, [mois, annee]);
  
      const normalizedRows = rows.map((row) => ({
        ...row,
        jour: new Date(row.jour).toISOString().split("T")[0], // Conversion de la date
      }));
  
      console.log("Données récupérées (normalisées) :", normalizedRows);
      res.json(normalizedRows);
    } catch (error) {
      console.error("Erreur lors de la récupération des besoins :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des besoins." });
    }
  });
  
  // Endpoint : Supprimer tous les besoins personnels
  app.delete("/delete-all-besoins", async (req, res) => {
    try {
      const sql = "DELETE FROM besoin_personnel;";
      const connection = await pool.getConnection();
      await connection.execute(sql);
      connection.release();
      console.log("Tous les besoins personnels ont été supprimés.");
      res.status(200).json({ success: true, message: "Tous les besoins personnels ont été supprimés." });
    } catch (error) {
      console.error("Erreur lors de la suppression des besoins personnels :", error);
      res.status(500).json({ error: "Erreur lors de la suppression des besoins personnels." });
    }
  });
  
  // Endpoint pour mettre à jour un besoin spécifique
  app.post("/update-besoin", async (req, res) => {
    const { jour, shift_id, nombre_personnel } = req.body;
  
    console.log("Modification demandée :", { jour, shift_id, nombre_personnel });
  
    if (!jour || !shift_id || typeof nombre_personnel === "undefined") {
      return res.status(400).json({ error: "Paramètres manquants ou invalides." });
    }
  
    try {
      const sql = `
        UPDATE besoin_personnel 
        SET nombre_personnel = ? 
        WHERE jour = ? AND shift_id = ?;
      `;
      const params = [nombre_personnel, jour, shift_id];
  
      const connection = await pool.getConnection();
      const [result] = await connection.execute(sql, params);
      connection.release();
  
      console.log("Résultat de la mise à jour :", result);
      if (result.affectedRows > 0) {
        res.status(200).json({ success: true, message: "Besoin modifié avec succès." });
      } else {
        res.status(404).json({
          success: false,
          message: "Aucun besoin correspondant trouvé pour la modification.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification du besoin :", error);
      res.status(500).json({ error: "Erreur lors de la modification du besoin." });
    }
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



// Endpoint : récupérer les assignations pour un mois spécifique
app.post("/get-assignations", async (req, res) => {
  const { mois, annee } = req.body;

  if (!mois || !annee) {
    return res.status(400).json({ error: "Mois et année sont requis." });
  }

  try {
    const sql = `
      SELECT DATE_FORMAT(a.jour, '%Y-%m-%d') AS jour, a.shift_id, a.user_id 
      FROM assignations a
      WHERE MONTH(a.jour) = ? AND YEAR(a.jour) = ?;
    `;
    const [rows] = await pool.execute(sql, [mois, annee]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur récupération des assignations :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des assignations." });
  }
});

// Endpoint : générer des assignations pour un utilisateur
app.post("/generate-assignations", async (req, res) => {
  const { userId, cycleId } = req.body;

  if (!userId || !cycleId) {
    return res.status(400).json({ error: "User ID et Cycle ID sont requis." });
  }

  try {
    const connection = await pool.getConnection();
    
    const [cycleShifts] = await connection.execute(
      "SELECT jour, shift_id FROM cycle_shifts WHERE cycle_id = ? ORDER BY jour",
      [cycleId]
    );

    if (cycleShifts.length === 0) {
      return res.status(404).json({ error: "Aucune donnée trouvée pour ce cycle." });
    }

    const currentYear = new Date().getFullYear();
    const assignations = [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const cycleDayIndex = (day - 1) % cycleShifts.length;
        const shift = cycleShifts[cycleDayIndex];

        if (shift) {
          assignations.push([`${currentYear}-${month + 1}-${day}`, shift.shift_id, userId]);
        }
      }
    }

    await connection.query(
      "INSERT INTO assignations (jour, shift_id, user_id) VALUES ?",
      [assignations]
    );

    connection.release();
    res.json({ success: true, message: "Assignations créées avec succès." });

  } catch (error) {
    console.error("Erreur génération des assignations :", error);
    res.status(500).json({ error: "Erreur lors de la génération des assignations." });
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
