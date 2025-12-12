const authController = require('./auth.controller');
const sweetController = require('./sweet.controller');

module.exports = {
  ...authController,
  ...sweetController
};
