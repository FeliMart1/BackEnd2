const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('./utils/database'); 
const sessionRouter = require('./routes/sessionRouter');
const passport = require('./config/passport.config');
const cartRouter = require('./routes/cartRouter');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rutas
app.use('/api/sessions', sessionRouter);
app.use('/api/carts', cartRouter);

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
