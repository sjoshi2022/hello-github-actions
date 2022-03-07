"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const configurationService = require('../services/configuration');


describe("service to make configuration api call", () => {
    /* Should assert formatted response of configuration api with data and success message */
    it('asserting successful response when vdn valid', async () => {
        let vdn = "22013";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await configurationService(vdn, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.client');
        actual_output.should.have.nested.property('data.environment');
        actual_output.should.have.nested.property('data.prompts');
        actual_output.should.have.nested.property('data.client');
        actual_output.should.have.nested.property('data.client.forceVisualChoice').equal(false);
        actual_output.should.have.nested.property('data.client.destinationPlatform').equal('NGP');
        actual_output.should.have.nested.property('data.client.programCode').equal('PRG');
        actual_output.should.have.nested.property('data.client.programSubCode').equal('AU');
        actual_output.should.have.nested.property('data.client.aaApiFailureAction').equal('TreatAsBlacklisted');
        actual_output.should.have.nested.property('data.client.csr.enabled').equal(false);
        actual_output.should.have.nested.property('data.client.vdn');
        actual_output.should.have.nested.property('data.environment.appName').equal('RoadsideIVA');
        actual_output.should.have.nested.property('data.environment.phoneRegex').equal('^1?[2-9]\\d{9}#?$');
        actual_output.should.have.nested.property('data.environment.phoneType').equal('^(mobile|voip.*(sms-|sms\\/|mms-))');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert formatted response of ani search api with openRequest equal to true since phoneNumber has isActiveCall value as false */
    it('asserting failure response when vdn not valid', async () => {
        let vdn = "22012";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await configurationService(vdn, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('1 or more documents missing for filter');
        actual_output.should.have.property('agentTransfer').equal(true);
    });
});
