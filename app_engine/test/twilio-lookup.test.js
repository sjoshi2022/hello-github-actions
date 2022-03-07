"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const twilioLookupService = require('../services/twilio-lookup');


describe("service to make twilio lookup api call", () => {
    /* Should assert formatted response of twilio lookup api with carrier type as landline*/
    it('asserting  carrier type as landline when success', async () => {
        let phoneNumber = "7813061234";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await twilioLookupService(phoneNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.carrierName').equal('Verizon');
        actual_output.should.have.nested.property('data.carrierType').equal('landline');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert formatted response of twilio lookup api with carrier type as mobile */
    it('asserting  carrier type as mobile when success', async () => {
        let phoneNumber = "7819607789";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await twilioLookupService(phoneNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.carrierName').equal('Verizon Wireless');
        actual_output.should.have.nested.property('data.carrierType').equal('mobile');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert formatted response of twilio lookup api with carrier type as voip */
    it('asserting  carrier type as mobile when success', async () => {
        let phoneNumber = "2056340827";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await twilioLookupService(phoneNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.carrierName').equal('TextNow - Bandwidth.com - SVR');
        actual_output.should.have.nested.property('data.carrierType').equal('voip');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert formatted response of twilio lookup api with failure response */
    it('asserting no data found when failure', async () => {
        let phoneNumber = "5113061234";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await twilioLookupService(phoneNumber, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('The requested resource /PhoneNumbers/5113061234 was not found');
        actual_output.should.have.property('agentTransfer');
    });
});
