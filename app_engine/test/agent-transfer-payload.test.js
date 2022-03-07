"use strict";

const should = require('chai').should();
const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });
const agentTransferPayloadService = require('../services/agent-transfer-payload').getAgentPayload;


describe("service to provide sip header and vdn for agent transfer with platform NGP/OneRoad", () => {
    /* Should provide the sipHeader and vdn when success */
    it('should have the sipHeader and vdn property', async () => {
        let ctxParams = {
            callType: "NewCall",
            callbackNumber: "3148882523",
            ani: "7052553453",
            rsaRequestId: "50152347611",
            knownMaskedNumber: "true",
            numberConfirmed: "false",
            sourceSystem: "RoadsideIVA",
            programCode: "KIA",
            programSubCode: "AU",
            configVdn: {
                "NGP": {
                    "NewCall": "22065",
                    "CallBack": "22066"
                },
                "OneRoad": {
                    "NewCall": "22013",
                    "CallBack": "22011"
                }
            }
        }
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await agentTransferPayloadService(ctxParams, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('sipHeader');
        actual_output.should.have.property('vdn').equal('22013');
    });

    /* Should provide the sipHeader and vdn when callbackNumber and ani are same and platform is OneRoad */
    it('should have the sipHeader and vdn property when callbackNumber is same as ani provided and platform is OneRoad', async () => {
        let ctxParams = {
            callType: "NewCall",
            callbackNumber: "7052553453",
            ani: "7052553453",
            knownMaskedNumber: "true",
            numberConfirmed: "false",
            sourceSystem: "RoadsideIVA",
            programCode: "KIA",
            programSubCode: "AU",
            configVdn: {
                "OneRoad": {
                    "NewCall": "22013"
                }
            }
        }
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await agentTransferPayloadService(ctxParams, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('sipHeader').equal('4e3a');
        actual_output.should.have.property('vdn').equal('22013');
    });

    /* Should provide the sipHeader and vdn when callbackNumber and ani are same  with platform NGP */
    it('should have the sipHeader and vdn property when callbackNumber is same as ani providedand platform is NGP', async () => {
        let ctxParams = {
            callType: "NewCall",
            callbackNumber: "7816588902",
            ani: "7816588902",
            knownMaskedNumber: "true",
            numberConfirmed: "false",
            sourceSystem: "RoadsideIVA",
            programCode: "PRG",
            programSubCode: "AU",
            configVdn: {
                "NGP": {
                    "NewCall": "22065"
                }
            }
        }
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await agentTransferPayloadService(ctxParams, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('sipHeader').equal('434349443a373831363538383930322c4b4d4e3a756e646566696e65642c4e433a66616c7365');
        actual_output.should.have.property('vdn').equal('22065');
    });

    /* Should provide the sipHeader and vdn when callType is Callback  */
    it(' should have the sipHeader and vdn property as callType is CallBack', async () => {
        let ctxParams = {
            callType: "CallBack",
            callbackNumber: "7816588902",
            ani: "7816588902",
            knownMaskedNumber: "true",
            numberConfirmed: "false",
            sourceSystem: "RoadsideIVA",
            programCode: "PRG",
            programSubCode: "AU",
            configVdn: {
                "NGP": {
                    "CallBack": "22011"
                }
            }
        }
        let dfSessionId = "8d688ba6-a4c8-8554-12de-f5a9ea905251";
        let callIdSipHdrs = "b2ea5e26ccd341ebbcfc0c29fbcc3";
        let actual_output = await agentTransferPayloadService(ctxParams, dfSessionId, callIdSipHdrs);
        actual_output.should.have.property('sipHeader').equal('37383136353838393032');
        actual_output.should.have.property('vdn').equal("22011");
    });
});
