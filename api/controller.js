'use strict';

// Define operations once at module level for efficiency
const operations = {
  'add':      function(a, b) { return Number(a) + Number(b) },
  'subtract': function(a, b) { return a - b },
  'multiply': function(a, b) { return a * b },
  'divide':   function(a, b) { return a / b },
};

// Compile regex patterns once for better performance
const operandRegex = /^(-)?[0-9.]+(e(-)?[0-9]+)?$/;
const invalidCharsRegex = /[-0-9e]/g;

exports.calculate = function(req, res) {
  // Error handler should not be registered on every request
  // It should be registered once in the main app setup

  if (!req.query.operation) {
    throw new Error("Unspecified operation");
  }

  var operation = operations[req.query.operation];

  if (!operation) {
    throw new Error("Invalid operation: " + req.query.operation);
  }

  if (!req.query.operand1 ||
      !operandRegex.test(req.query.operand1) ||
      req.query.operand1.replace(invalidCharsRegex, '').length > 1) {
    throw new Error("Invalid operand1: " + req.query.operand1);
  }

  if (!req.query.operand2 ||
      !operandRegex.test(req.query.operand2) ||
      req.query.operand2.replace(invalidCharsRegex, '').length > 1) {
    throw new Error("Invalid operand2: " + req.query.operand2);
  }

  res.json({ result: operation(req.query.operand1, req.query.operand2) });
};
