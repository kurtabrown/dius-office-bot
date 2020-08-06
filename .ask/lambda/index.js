// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const dbHelper = require('./helpers/dbHelper');
const dynamoDBTableName = "office_bot_visitors";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CheckInIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckIn';
    },
    handle(handlerInput) {
        console.log('Inside CheckInHandler');
        const firstname = handlerInput.requestEnvelope.request.intent.slots.firstname.value;
        const officelocation = handlerInput.requestEnvelope.request.intent.slots.officelocation.value;
        return dbHelper.addVisitor(firstname, officelocation)
            .then((data) => {
            const speechText = 'Check In ' + firstname + ' as a new visitor to the ' + officelocation + ' office';
            console.log('Speak ' + speechText);
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
          })
        .catch((err) => {
            console.log("Error occured while saving visitor", err);
            const speechText = "we cannot check in your visitor right now. Try again!"
            return responseBuilder
                .speak(speechText)
                .getResponse();
        })
    }
};
const CheckOutIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckOut';
    },
    handle(handlerInput) {
        console.log('Inside CheckOutHandler');
        var firstname = handlerInput.requestEnvelope.request.intent.slots.firstname.value;
        var officelocation = handlerInput.requestEnvelope.request.intent.slots.officelocation.value;

        return dbHelper.removeVisitor(firstname, officelocation)
            .then((data) => {
            const speechText = `You have checked out ${firstname}`
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        })
        .catch((err) => {
            const speechText = `You do not have a visitor with name ${firstname}`
            return responseBuilder
                .speak(speechText)
                .getResponse();
        })
    }
};
const RollCallIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RollCall';
    },
    handle(handlerInput) {
        console.log('Inside RollCallHandler');
        var officelocation = handlerInput.requestEnvelope.request.intent.slots.officelocation.value;

        return dbHelper.getVisitors(officelocation)
             .then((data) => {
            var speechText = "Visitors to the " + officelocation + " are ";
            if (data.length == 0) {
                speechText = "You do not have any visitors right now ";
            } else {
                speechText += data.map(e => e.firstname).join(", ");
            }
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        })
        .catch((err) => {
            console.log(err);
            const speechText = "we cannot do a roll call right now. Try again!";
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        })
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CheckInIntentHandler,
        CheckOutIntentHandler,
        RollCallIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
