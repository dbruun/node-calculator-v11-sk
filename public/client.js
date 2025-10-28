'use strict';

var value = 0;

var states = {
    "start": 0,
    "operand1": 1,
    "operator": 2,
    "operand2": 3,
    "complete": 4
};

var state = states.start;

var operand1 = 0;
var operand2 = 0;
var operation = null;

// Cache DOM elements for better performance
var loadingElement = null;
var resultElement = null;
var buttonElements = null;

function calculate(operand1, operand2, operation) {
    var uri = location.origin + "/arithmetic";

    // TODO: Add operator
    switch (operation) {
        case '+':
            uri += "?operation=add";
            break;
        case '-':
            uri += "?operation=subtract";
            break;
        case '*':
            uri += "?operation=multiply";
            break;
        case '/':
            uri += "?operation=divide";
            break;
        default:
            setError();
            return;
    }

    uri += "&operand1=" + encodeURIComponent(operand1);
    uri += "&operand2=" + encodeURIComponent(operand2);

    setLoading(true);

    var http = new XMLHttpRequest();
    http.open("GET", uri, true);
    http.onload = function () {
        setLoading(false);

        if (http.status == 200) {
            var response = JSON.parse(http.responseText);
            setValue(response.result);
        } else {
            setError();
        }
    };
    http.send(null);
}

function clearPressed() {
    setValue(0);

    operand1 = 0;
    operand2 = 0;
    operation = null;
    state = states.start;
}

function clearEntryPressed() {
    setValue(0);
    state = (state == states.operand2) ? states.operator : states.start;
}

function numberPressed(n) {
    var value = getValue();

    if (state == states.start || state == states.complete) {
        value = n;
        state = (n == '0' ? states.start : states.operand1);
    } else if (state == states.operator) {
        value = n;
        state = (n == '0' ? states.operator : states.operand2);
    } else if (value.replace(/[-\.]/g, '').length < 8) {
        value += n;
    }

    value += "";

    setValue(value);
}

function decimalPressed() {
    var currentValue = getValue();
    
    if (state == states.start || state == states.complete) {
        setValue('0.');
        state = states.operand1;
    } else if (state == states.operator) {
        setValue('0.');
        state = states.operand2;
    } else if (!currentValue.toString().includes('.')) {
        setValue(currentValue + '.');
    }
}

function signPressed() {
    var value = getValue();

    if (value != 0) {
        setValue(-1 * value);
    }
}

function operationPressed(op) {
    operand1 = getValue();
    operation = op;
    state = states.operator;
}

function equalPressed() {
    if (state < states.operand2) {
        state = states.complete;
        return;
    }

    if (state == states.operand2) {
        operand2 = getValue();
        state = states.complete;
    } else if (state == states.complete) {
        operand1 = getValue();
    }

    calculate(operand1, operand2, operation);
}

// TODO: Add key press logics
document.addEventListener('keypress', (event) => {
    if (event.key.match(/^\d+$/)) {
        numberPressed(event.key);
    } else if (event.key == '.') {
        decimalPressed();
    } else if (event.key.match(/^[-*+/]$/)) {
        operationPressed(event.key);
    } else if (event.key == '=') {
        equalPressed();
    }
});

function getValue() {
    return value;
}

function setValue(n) {
    value = n;
    var displayValue = value;

    if (displayValue > 99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < -99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue > 0 && displayValue < 0.0000001) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < 0 && displayValue > -0.0000001) {
        displayValue = displayValue.toExponential(3);
    }

    var chars = displayValue.toString().split("");
    var htmlParts = [];

    for (var c of chars) {
        if (c == '-') {
            htmlParts.push("<span class=\"resultchar negative\">" + c + "</span>");
        } else if (c == '.') {
            htmlParts.push("<span class=\"resultchar decimal\">" + c + "</span>");
        } else if (c == 'e') {
            htmlParts.push("<span class=\"resultchar exponent\">e</span>");
        } else if (c != '+') {
            htmlParts.push("<span class=\"resultchar digit" + c + "\">" + c + "</span>");
        }
    }

    if (!resultElement) {
        resultElement = document.getElementById("result");
    }
    resultElement.innerHTML = htmlParts.join('');
}

function setError(n) {
    if (!resultElement) {
        resultElement = document.getElementById("result");
    }
    resultElement.innerHTML = "ERROR";
}

function setLoading(loading) {
    // Cache DOM elements on first use
    if (!loadingElement) {
        loadingElement = document.getElementById("loading");
        buttonElements = document.querySelectorAll("BUTTON");
    }

    if (loading) {
        loadingElement.style.visibility = "visible";
    } else {
        loadingElement.style.visibility = "hidden";
    }

    for (var i = 0; i < buttonElements.length; i++) {
        buttonElements[i].disabled = loading;
    }
}
