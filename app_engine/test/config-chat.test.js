"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const configChatService = require('../services/config-chat');

// Test cases may fail if there are changes regarding to config chat api in future

describe("service to make config chat api call", () => {
    /* Should assert formatted response of config chat api with data and success message */
    it('asserting successful response when progCode valid', async () => {
        let progCode = "CTC";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await configChatService (progCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.client');
        actual_output.should.have.nested.property('data.environment');
        actual_output.should.have.nested.property('data.client.clientName').and.to.be.a('string');
        actual_output.should.have.nested.property('data.client.clientDisplayName').and.to.be.a('string');
        actual_output.should.have.nested.property('data.client.programCode').equal('CTC');
        actual_output.should.have.nested.property('data.environment.phoneRegex').equal('^1?[2-9]\\d{9}#?$');
        actual_output.should.have.nested.property('data.prompts').and.to.be.a('object');
        actual_output.should.have.nested.property('data.prompts.agent').and.to.be.a('object');
        actual_output.should.have.nested.property('data.prompts.silence').and.to.be.a('object');
        actual_output.should.have.nested.property('data.prompts.chatbot').and.to.be.a('object');
        actual_output.should.have.nested.property('data.prompts.chatbot.welcome').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.customerWelcomeMsg').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.welcomeMsg').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.greeting').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.etaExpired').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.endFlow').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.askCallbackNumber').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.askNumber').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.getUserIntent').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.greetings').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.agentTransfer').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.initialApiFail').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.apiFailure').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.confirmCancelRequest').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.confirmCancelRequestFallback').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.reasonForCancel').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.anythingElse').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.cancelSuccess').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.rephraseQuery').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPDetails').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.askToChatWithAgent').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.modifyRequest').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.getPickupLocation').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.getDropoffLocation').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.towTruckInfo').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.ETAAvailable').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.smsTriggered').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.smsWait').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.ETAPassed').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPNotArrived').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.initial').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.connectToAgentForHelp').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.created').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.processOfAllocatingSP').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.requestInProcess').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPShouldArriveInMinutes').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.revisedETAAvailable').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.revisedETAUnavailable').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPArrivedPickup').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPArrivedPickupTowing').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.SPArrivedDropoff').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.completed').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.cancelled').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.GOA').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.unsuccessful').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.numberForNewRequest').and.to.be.a('string');
        actual_output.should.have.nested.property('data.prompts.chatbot.sessionRefresh').and.to.be.a('string');
        actual_output.should.have.nested.property('data.superToken').and.to.be.a('string');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert failure response when progCode not valid */
    it('asserting failure response when progCode not valid', async () => {
        let progCode = "ABC";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await configChatService(progCode, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.nested.property('data.client');
        actual_output.should.not.have.nested.property('data.environment');
        actual_output.should.not.have.nested.property('data.prompts');
        actual_output.should.not.have.nested.property('data.superToken');
        actual_output.should.have.property('message')
    });
});
