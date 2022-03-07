"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const aniSearchService = require('../services/ani-search');

describe("service to make ani search api call", () => {
    /* Should assert formatted response of ani search api with openRequest equal to false with 404 error as phone number does not match the given regex */
    it('asserting open request  as false with 404 error', async () => {
        let phoneNumber = "71436918901";
        let programCode = "KIA";
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await aniSearchService(phoneNumber, programCode, dfSessionId, callIdSipHdrs);
        actual_output.should.have.nested.property('data.openRequest').equal(false);
        actual_output.should.have.property('message').equal('Profile details not found for ani :71436918901');
    });
});
