"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const volumeMigrationService = require('../services/volume-migration');


describe("service to make volume migration api call", () => {
    /* Should assert formatted response of volume migration api with platform and area code */
    it('asserting open request  as true', async () => {
        let callbackNumber = "7819607789";
        let appName = "RoadsideIVA";
        let programCode = "PRG";
        let programSubCode = "AU";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await volumeMigrationService(callbackNumber, appName, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.platform').equal('NGP');
        actual_output.should.have.nested.property('data.areaCode').equal('781');
        actual_output.should.have.property('message').equal('success');
    });

    /* Should assert formatted response of volume migration api when passing callback number not matching the given regex */
    it('asserting open request  as ', async () => {
        let callbackNumber = "78196077892";
        let appName = "RoadsideIVA";
        let programCode = "KIA";
        let programSubCode = "AU";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await volumeMigrationService(callbackNumber, appName, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.platform').equal('OneRoad');
        actual_output.should.have.nested.property('data.areaCode').equal(null);
        actual_output.should.have.property('message').equal('success');
    });
});
