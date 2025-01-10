import express from 'express';
import mysql2 from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 5000;

// Configuration de la base de données
const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'planning_hospitalier',
  port: '5001',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Création du pool de connexions MySQL
const pool = mysql2.createPool(config);

// Middleware
app.use(cors());
app.use(express.json());

// Route pour vérifier la connexion à la base de données
app.get('/connect', async (req, res) => {
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
app.use((err, req, res, next) => {
  console.error('Uncaught error:', err);
  res.status(500).send(`Erreur inattendue : ${err.message}`);
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

