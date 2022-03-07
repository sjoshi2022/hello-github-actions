"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const allowedAniService = require('../services/allowed-ani');


describe("service to make allowed ani api call", () => {
    /* Should assert formatted response of allowed ani api with maskedNumber as false and forcedMobile as true */
    it('asserting whitelisted number', async () => {
        let phoneNumber = "7813063659";
        let programCode = "KIA";
        let programSubCode = "";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await allowedAniService(phoneNumber, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.maskedNumber').equal(false);
        actual_output.should.have.nested.property('data.forcedMobile').equal(true);
    });

    /* Should assert formatted response of allowed ani api with maskedNumber as true and forcedMobile as false */
    it('asserting  maskedNumber i.e. blacklisted number', async () => {
        let phoneNumber = "7143691890";
        let programCode = "KIA";
        let programSubCode = "";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await allowedAniService(phoneNumber, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.maskedNumber').equal(true);
        actual_output.should.have.nested.property('data.forcedMobile').equal(false);
    });

    /* Should assert formatted response of allowed ani api with maskedNumber and forcedMobile as false */
    it('asserting neither blacklisted nor whitelisted number', async () => {
        let phoneNumber = "7813061234";
        let programCode = "KIA";
        let programSubCode = "";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await allowedAniService(phoneNumber, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.maskedNumber').equal(false);
        actual_output.should.have.nested.property('data.forcedMobile').equal(false);
    });

    /* Should assert error response as phoneNumber provided does not match phone number format */
    it('asserting invalid request', async () => {
        let phoneNumber = "77813061234";
        let programCode = "KIA";
        let programSubCode = "";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await allowedAniService(phoneNumber, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('agentTransfer');
    });
});
