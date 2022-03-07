"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const getJobDetails = require('../services/get-jobdetails-using-swcid');

//Test cases might fail in future if there are any changes in the api or superToken value

describe("service to make api call for getting job details using swcid id", () => {
    /* Should provide the job details and provide calculated Eta when Eta is available else should provide calculated Eta as null  */
    it('should provide the job details and calculated eta', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let swcid = "1774994";
        let accessToken = "Bearer Fg_wlaSvYw11H7uHCBFRAky-N6qflbzyb27av23QfSY";
        let actual_output = await getJobDetails(swcid, accessToken, dfSessionId, callIdSipHdrs);
        if (actual_output.data.eta.current) {
            actual_output.should.have.nested.property('data.swcid').and.not.to.be.a('string');;
            actual_output.should.have.nested.property('data.id').and.to.be.a('string');
            actual_output.should.have.nested.property('data.createdAt').not.to.be.an('object');
            actual_output.should.have.nested.property('data.status').and.to.be.a('string');
            actual_output.should.have.nested.property('data.service.name');
            actual_output.should.have.nested.property('data.service.__typename');
            actual_output.should.have.nested.property('data.eta.current').not.to.be.an('object');
            actual_output.should.have.nested.property('data.customer.name');
            actual_output.should.have.nested.property('data.customer.phone').not.equal(null);
            actual_output.should.have.nested.property('data.location.serviceLocation');
            actual_output.should.have.nested.property('data.partner.company');
            actual_output.should.have.nested.property('data.calculatedETA').not.equal(null);
            actual_output.should.have.property('message');
        } else {
            actual_output.should.have.nested.property('data.swcid').and.not.to.be.a('string');;
            actual_output.should.have.nested.property('data.id').and.to.be.a('string');
            actual_output.should.have.nested.property('data.createdAt').not.to.be.an('object');
            actual_output.should.have.nested.property('data.status').and.to.be.a('string');
            actual_output.should.have.nested.property('data.service.name');
            actual_output.should.have.nested.property('data.service.__typename');
            actual_output.should.have.nested.property('data.eta.current').equal(null);
            actual_output.should.have.nested.property('data.customer.name');
            actual_output.should.have.nested.property('data.customer.phone').not.equal(null);
            actual_output.should.have.nested.property('data.location.serviceLocation');
            actual_output.should.have.nested.property('data.partner.company');
            actual_output.should.have.nested.property('data.calculatedETA').equal(null);
            actual_output.should.have.property('message').equal('Invalid ETA provided');
        }
    });

    /* Should provide an error message when authorization token value provided is null or wrong*/
    it('should not have data property and provide an error message for authorization token value as null', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let swcid = "1774994";
        let accessToken = "";
        let actual_output = await getJobDetails(swcid, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal("Field 'job' doesn't exist on type 'Query'");
    });

    /* Should provide an error message when job id provided is null*/
    it('should not have data property and provide an error response for job id as null', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let swcid = "";
        let accessToken = "Bearer 2LFN4Ot7zR269yiolXtH3RFgRgoWLxnOLcTMRDI1xcM";
        let actual_output = await getJobDetails(swcid, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal('Parse error on ")" (RPAREN) at [2, 28]');
    });

    /* Should provide an error message when job id provided is wrong*/
    it('should not have data property and provide an error response for wrong job id ', async () => {
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let swcid = "177499456";
        let accessToken = "Bearer 2LFN4Ot7zR269yiolXtH3RFgRgoWLxnOLcTMRDI1xcM";
        let actual_output = await getJobDetails(swcid, accessToken, dfSessionId, callIdSipHdrs);
        actual_output.should.not.have.property('data');
        actual_output.should.have.property('message').equal("Field 'job' doesn't accept argument 'swcid'");
    });
});
