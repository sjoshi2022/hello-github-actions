"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const rsaService = require('../services/rsa');


describe("service to make rsa api call", () => {
    /* Should provide message property with success response as rsa submitted sucessfully */
    it('should have property message with value success', async () => {
        let callbackNumber = "7813061234";
        let sourceSystem = "RoadsideIVA_VDC";
        let programCode = "KIA";
        let programSubCode = "AU";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await rsaService(callbackNumber, sourceSystem, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.rsaRequestId').and.to.be.a('string');
    });

    /* Should provide agentTransfer property and not have data property in the error response as rsa not submitted*/
    it('should have property agentTransfer and do not have data property for error response.', async () => {
        let callbackNumber = "";
        let sourceSystem = "RoadsideIVA";
        let programCode = "KIA";
        let programSubCode = "AU";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await rsaService(callbackNumber, sourceSystem, programCode, programSubCode, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('agentTransfer');
    });
});
