module.exports = function (app) {
  const arithmeticController = require('./controller');
  app.route('/arithmetic').get(arithmeticController.calculate);
};
