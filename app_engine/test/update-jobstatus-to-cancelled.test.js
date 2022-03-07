"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const updatedJobStatusToCancelled = require('../services/update-jobstatus-to-cancelled');

//Test cases might fail in future if there are any changes in the api or token value

describe("service to make api call for changing the status of job to cancelled", () => {
    /* Should have message and success property when status of job gets cancelled */
    it('should have message and success property', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let jobId = "5tOX0ZtyLd5H1riarZrakE";
        let accessToken = "Bearer 2LFN4Ot7zR269yiolXtH3RFgRgoWLxnOLcTMRDI1xcM";
        let actual_output = await updatedJobStatusToCancelled(jobId, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('message');
        actual_output.should.have.property('success');
    });

    /* Should provide an error response when jobId provided as null */
    it('should provide an error response for jobId as null', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let jobId = "";
        let accessToken = "Bearer 2LFN4Ot7zR269yiolXtH3RFgRgoWLxnOLcTMRDI1xcM";
        let actual_output = await updatedJobStatusToCancelled(jobId, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('message').equal("Couldn't find Job with id=");
        actual_output.should.have.property('success').equal(false);
    });

     /* Should provide an error response when authorization token is empty */
     it('should provide an error response when authorization token is empty', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let jobId = "5tOX0ZtyLd5H1riarZrakE";
        let accessToken = "";
        let actual_output = await updatedJobStatusToCancelled(jobId, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('message').equal("Field 'updateJobStatus' doesn't exist on type 'Mutation'");
        actual_output.should.have.property('success').equal(false);
    });
});
