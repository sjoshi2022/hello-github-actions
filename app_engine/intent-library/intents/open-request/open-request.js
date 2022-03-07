"use strict";

const logger = require("../../../logger");
const { responseHelper, payloadHelper } = require("../../helper/response-payload-helper");

/**
 * Open Request
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */

const { CALL_TYPES, CONTEXTS, OPLIFESPAN_ONE } = require(".././../../helper/constants");

const openRequest = async (df, params) => {
    try {
        let message = params.apiResults.configResult.prompts.greeting.currentRequest.text;
        let result = responseHelper(params, message);
        let payload = payloadHelper(df, params);

        if (!params.apiResults.configResult.client.csr.enabled) {
            // Silent option disabled, Handle agent request for inital prompt
            df.setOutputContext(CONTEXTS.agentRequestInitialQuery, OPLIFESPAN_ONE);
        }

        params.callType = CALL_TYPES.callback; // For open request, set call type to callback
        df.setResponseText(result);
        df.setPayload(payload);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/open-request/open-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = openRequest;