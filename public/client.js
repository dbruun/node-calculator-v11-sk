'use strict';

var currentValue = 0;

var calculatorStates = {
    "start": 0,
    "operand1": 1,
    "operator": 2,
    "operand2": 3,
    "complete": 4
};

var currentState = calculatorStates.start;

var firstOperand = 0;
var secondOperand = 0;
var selectedOperation = null;

function calculate(firstOperand, secondOperand, selectedOperation) {
    var requestUri = location.origin + "/arithmetic";

    // TODO: Add operator
    switch (selectedOperation) {
        case '+':
            requestUri += "?operation=add";
            break;
        case '-':
            requestUri += "?operation=subtract";
            break;
        case '*':
            requestUri += "?operation=multiply";
            break;
        case '/':
            requestUri += "?operation=divide";
            break;
        default:
            setError();
            return;
    }

    requestUri += "&operand1=" + encodeURIComponent(firstOperand);
    requestUri += "&operand2=" + encodeURIComponent(secondOperand);

    setLoading(true);

    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", requestUri, true);
    httpRequest.onload = function () {
        setLoading(false);

        if (httpRequest.status == 200) {
            var response = JSON.parse(httpRequest.responseText);
            setValue(response.result);
        } else {
            setError();
        }
    };
    httpRequest.send(null);
}

function clearPressed() {
    setValue(0);

    firstOperand = 0;
    secondOperand = 0;
    selectedOperation = null;
    currentState = calculatorStates.start;
}

function clearEntryPressed() {
    setValue(0);
    currentState = (currentState == calculatorStates.operand2) ? calculatorStates.operator : calculatorStates.start;
}

function numberPressed(digit) {
    var displayedValue = getValue();

    if (currentState == calculatorStates.start || currentState == calculatorStates.complete) {
        displayedValue = digit;
        currentState = (digit == '0' ? calculatorStates.start : calculatorStates.operand1);
    } else if (currentState == calculatorStates.operator) {
        displayedValue = digit;
        currentState = (digit == '0' ? calculatorStates.operator : calculatorStates.operand2);
    } else if (displayedValue.replace(/[-\.]/g, '').length < 8) {
        displayedValue += digit;
    }

    setValue(displayedValue);
}

function decimalPressed() {
    if (currentState == calculatorStates.start || currentState == calculatorStates.complete) {
        setValue('0.');
        currentState = calculatorStates.operand1;
    } else if (currentState == calculatorStates.operator) {
        setValue('0.');
        currentState = calculatorStates.operand2;
    } else if (!getValue().toString().includes('.')) {
        setValue(getValue() + '.');
    }
}

function signPressed() {
    var displayedValue = getValue();

    if (displayedValue != 0) {
        setValue(-1 * displayedValue);
    }
}

function operationPressed(operator) {
    firstOperand = getValue();
    selectedOperation = operator;
    currentState = calculatorStates.operator;
}

function equalPressed() {
    if (currentState < calculatorStates.operand2) {
        currentState = calculatorStates.complete;
        return;
    }

    if (currentState == calculatorStates.operand2) {
        secondOperand = getValue();
        currentState = calculatorStates.complete;
    } else if (currentState == calculatorStates.complete) {
        firstOperand = getValue();
    }

    calculate(firstOperand, secondOperand, selectedOperation);
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
    return currentValue;
}

function setValue(newValue) {
    currentValue = newValue;
    var displayValue = currentValue;

    if (displayValue > 99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < -99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue > 0 && displayValue < 0.0000001) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < 0 && displayValue > -0.0000001) {
        displayValue = displayValue.toExponential(3);
    }

    var characters = displayValue.toString().split("");
    var htmlOutput = "";

    for (var character of characters) {
        if (character == '-') {
            htmlOutput += "<span class=\"resultchar negative\">" + character + "</span>";
        } else if (character == '.') {
            htmlOutput += "<span class=\"resultchar decimal\">" + character + "</span>";
        } else if (character == 'e') {
            htmlOutput += "<span class=\"resultchar exponent\">e</span>";
        } else if (character != '+') {
            htmlOutput += "<span class=\"resultchar digit" + character + "\">" + character + "</span>";
        }
    }

    document.getElementById("result").innerHTML = htmlOutput;
}

function setError() {
    document.getElementById("result").innerHTML = "ERROR";
}

function setLoading(isLoading) {
    if (isLoading) {
        document.getElementById("loading").style.visibility = "visible";
    } else {
        document.getElementById("loading").style.visibility = "hidden";
    }

    var allButtons = document.querySelectorAll("BUTTON");

    for (var buttonIndex = 0; buttonIndex < allButtons.length; buttonIndex++) {
        allButtons[buttonIndex].disabled = isLoading;
    }
}
