'use strict';

exports.calculate = function(req, res) {
  req.app.use(function(err, _req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    res.status(400);
    res.json({ error: err.message });
  });

  // TODO: Add operator
  var supportedOperations = {
    'add':      function(firstNumber, secondNumber) { return Number(firstNumber) + Number(secondNumber) },
    'subtract': function(firstNumber, secondNumber) { return firstNumber - secondNumber },
    'multiply': function(firstNumber, secondNumber) { return firstNumber * secondNumber },
    'divide':   function(firstNumber, secondNumber) { return firstNumber / secondNumber },
  };

  if (!req.query.operation) {
    throw new Error("Unspecified operation");
  }

  var operationFunction = supportedOperations[req.query.operation];

  if (!operationFunction) {
    throw new Error("Invalid operation: " + req.query.operation);
  }

  if (!req.query.operand1 ||
      !req.query.operand1.match(/^(-)?[0-9.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
    throw new Error("Invalid operand1: " + req.query.operand1);
  }

  if (!req.query.operand2 ||
      !req.query.operand2.match(/^(-)?[0-9.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand2.replace(/[-0-9e]/g, '').length > 1) {
    throw new Error("Invalid operand2: " + req.query.operand2);
  }

  res.json({ result: operationFunction(req.query.operand1, req.query.operand2) });
};
