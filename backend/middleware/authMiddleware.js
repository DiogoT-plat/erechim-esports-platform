const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'erechim_esports_secret_key');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};

// Middleware para verificar se o usuário é administrador
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Não autorizado como administrador' });
  }
};

// Middleware para verificar se o usuário é capitão
const captain = (req, res, next) => {
  if (req.user && (req.user.role === 'captain' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Não autorizado como capitão' });
  }
};

module.exports = { protect, admin, captain };
