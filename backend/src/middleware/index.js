const { authenticate, isAdmin, generateToken } = require('./auth.middleware');

module.exports = {
  authenticate,
  isAdmin,
  generateToken
};
