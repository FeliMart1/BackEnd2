const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../dao/models/User');

const router = express.Router();
const JWT_SECRET = 'coder'; // Clave secreta para firmar el token

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Login exitoso', token });
  })(req, res, next);
});

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    // Validar campos obligatorios
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Crear el usuario
    const newUser = new User({ first_name, last_name, email, age, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    // Manejo de errores específicos
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    if (err.code === 11000) { // Error de duplicado (MongoDB)
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});


// Ruta "current" para validar token
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
