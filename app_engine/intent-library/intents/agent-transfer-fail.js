"use strict";

const logger = require("../../logger");
const { CONTEXTS } = require("../../helper/constants");
const { response } = require("../helper/responses");
const { payloadHelper } = require("../helper/response-payload-helper");

/**
 * Agent Transfer Intent controller
 * @param {object} df webhook fulfillment object,
 * @param {object} params Global Parameters
 */
const agentTransferFail = async (df, params) => {
    try {
        // get user's number from avaya telephony context
        let vdn;
        let payload = df._request.queryResult.fulfillmentMessages[1].payload.agentTransferAvayaPayload;
        let avayaSessionTelephoneContext = df.getContext(CONTEXTS.avayaSessionTelephone);
        let avayaSessionTelephoneParams = avayaSessionTelephoneContext && avayaSessionTelephoneContext.hasOwnProperty("parameters") ? avayaSessionTelephoneContext["parameters"] : {};

        // get vdn from avaya telephony context
        if (["production", "staging", "development"].includes(process.env.NODE_ENVIRONMENT) && avayaSessionTelephoneParams && avayaSessionTelephoneParams["dnis"]) {
            vdn = avayaSessionTelephoneParams["dnis"].slice(-5); // vdn from Avaya
        } else {
            vdn = apiConfigurableData["vdn"]; // vdn for testing on dev an stg
        }

        // in case of webhook faliure, use above vdn
        params.transferNumber = vdn;

        payload.avaya_telephony.transfer.dest = `tel:${params.transferNumber}`;
        logger.log("debug", "Agent transfer failed from avaya, trunk dnis to 5 digit", "webhook/agent-transfer", { vdn: params.transferNumber, intentName: df._request.queryResult.intent.displayName, session: params.dfSessionID });

        df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
        df.setPayload(payload);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/agent-transfer-fail", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = agentTransferFail;
