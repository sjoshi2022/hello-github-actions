"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const sessionEventChat = require('../services/session-event-chat');

//Test cases might fail in future if there are any changes in the api or token value

describe("service to make session event chat api call ", () => {
    /* Should have the property trackingId when successful */
    it('should have access_token value', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let programCode = "USM";
        let callbackNumber = "7819601739";
        let actual_output = await sessionEventChat(programCode, callbackNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.trackingId');
        actual_output.should.have.property('message').equal('session event  chat executed');
    });

    /* Should not have the data property when programCode passed as null */
    it('should  provide error response when programCode is null', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let programCode = "";
        let callbackNumber = "7819601739";
        let actual_output = await sessionEventChat(programCode, callbackNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('ProgramCode is required');
    });
});
