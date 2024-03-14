const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

// Middleware para parsear el body de las solicitudes
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'api'
});

// Conexión a la base de datos
connection.connect(error => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
    return;
  }
  console.log('Conexión a la base de datos MySQL establecida.');
});

// Ruta para el registro de usuarios
app.post('/registro', (req, res) => {
  const { usuario, password } = req.body;

  // Validar datos recibidos
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Se requieren usuario y contraseña.' });
  }

  // Verificar si el usuario ya está registrado
  connection.query('SELECT * FROM usuario WHERE usuario = ?', [usuario], (error, results) => {
    if (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'El usuario ya está registrado.' });
    } 

    // Registrar al usuario
    connection.query('INSERT INTO usuario (usuario, password) VALUES (?, ?)', [usuario, password], (error, results) => {
      if (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      return res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    });
  });
});

// Ruta para el inicio de sesión
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  // Validar datos recibidos
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Se requieren usuario y contraseña.' });
  }

  // Verificar credenciales
  connection.query('SELECT * FROM usuario WHERE usuario = ?', [usuario], (error, results) => {
    if (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Inicio de sesión fallido.' });
    } 

    const user = results[0];
    if (user.password === password) {
      return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas. Inicio de sesión fallido.' });
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});