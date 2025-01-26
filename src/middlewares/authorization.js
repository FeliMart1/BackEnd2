const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Acceso denegado: solo administradores pueden realizar esta acción' });
};

const isUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    return next();
  }
  res.status(403).json({ message: 'Acceso denegado: solo usuarios pueden realizar esta acción' });
};

module.exports = { isAdmin, isUser };

  