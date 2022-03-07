"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const sessionEventService = require('../services/session-event');


describe("service to make session event api call", () => {
    /* Should assert formatted response of session event api having success message */
    it('asserting success message', async () => {
        let sessionId = "7b8ecd5a-ec9d-4653-b862-4ff3c24de0a3";
        let programCode = "KIA";
        let programSubCode = "";
        let callbackNumber = "7814061234";
        let vdn = "21777";
        let eventType = "InitiateSession";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await sessionEventService({ sessionId, programCode, programSubCode, callbackNumber, vdn, eventType }, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('data');
        actual_output.should.have.property('message').equal('session event executed');
    });

    /* Should assert formatted response of session event api with error message having 400 Bad Request */
    it('asserting error message', async () => {
        let sessionId = "";
        let programCode = "KIA";
        let programSubCode = "";
        let callbackNumber = "7814061234";
        let vdn = "21777";
        let eventType = "InitiateSession";
        let actual_output = await sessionEventService({ sessionId, programCode, programSubCode, callbackNumber, vdn, eventType });
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('SessionId is required');
        actual_output.should.have.property('agentTransfer').equal(true);
    });

    /* Should assert formatted response of session event api with error message */
    it('asserting error message when event type ResendRequested called before InitiateSession', async () => {
        let sessionId = "7b8ecd5a-ec9d-4653-b862-4ff3c24de0a3";
        let programCode = "KIA";
        let programSubCode = "";
        let callbackNumber = "7829773665";
        let vdn = "21777";
        let eventType = "ResendRequested";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await sessionEventService({ sessionId, programCode, programSubCode, callbackNumber, vdn, eventType }, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('SessionId not mot matched  with CallEnd/StartKeyPress');
        actual_output.should.have.property('agentTransfer').equal(true);
    });
});