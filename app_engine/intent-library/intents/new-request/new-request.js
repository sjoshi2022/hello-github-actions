"use strict";

const logger = require("../../../logger");
const { responseHelper, payloadHelper } = require("../../helper/response-payload-helper");
const { CONTEXTS, OPLIFESPAN_ONE } = require(".././../../helper/constants");


/**
 * New Request Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const newRequest = async (df, params) => {
    try {
        let message = params.apiResults.configResult.prompts.greeting.newRequest.text;
        let result = responseHelper(params, message);
        let payload = payloadHelper(df, params);

        if (!params.apiResults.configResult.client.csr.enabled) {
            // Silent option disabled, Handle agent request for inital prompt
            df.setOutputContext(CONTEXTS.agentRequestInitialQuery, OPLIFESPAN_ONE);
        }

        df.setResponseText(result);
        df.setPayload(payload);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/new-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newRequest;