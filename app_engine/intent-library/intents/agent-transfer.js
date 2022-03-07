"use strict";

const logger = require("../../logger");
const agentTransferPayload = require("../../services/agent-transfer-payload");
const { response } = require("../helper/responses");
const { getLoggingParams } = require("../../helper/get-logging-params");
const { USER_SIP_HEADER } = require("../../helper/constants");

/**
 * Agent Transfer Intent controller
 * @param {object} df webhook fulfillment object,
 * @param {object} params Global Parameters
 */
const agentTransfer = async (df, params) => {
    try {
        let message, payload;

        let loggingParams = getLoggingParams(df);

        let sourceSystemForRSA = (params.hasOwnProperty("changeRSASourceSystem") && params.changeRSASourceSystem) ? params.apiResults.configResult.environment.visualTag : params.apiResults.configResult.environment.appName.trim().concat("_VDC");

        // Check if the config API is success or failure
        if (params.configApiOutput) {
            message = params["EndResponse"] || params.apiResults.configResult.prompts.visual.agentTransfer.text;
            payload = df._request.queryResult.fulfillmentMessages[1].payload.agentTransferAvayaPayload;
            let ctxParams = {
                callType: params.callType,
                callbackNumber: params.callbackNumber,
                sourceSystem: params.apiResults.configResult.environment.appName,
                programCode: params.apiResults.configResult.client.programCode,
                programSubCode: params.apiResults.configResult.client.programSubCode,
                knownMaskedNumber: params.knownMaskedNumber,
                numberConfirmed: params.numberConfirmed,
                destinationPlatform: params.apiResults.configResult.client.destinationPlatform,
                configVdn: params.apiResults.configResult.client.vdn,
                ani: params.ani,
                rsaPostDetails: params.rsaPostDetails,
                sourceSystemForRSA: sourceSystemForRSA
            };

            if (params.hasOwnProperty("rsaID") && params.rsaID) {
                ctxParams.rsaID = params.rsaID;
            }

            // set sip header & vdn
            let { sipHeader, vdn } = await agentTransferPayload.getAgentPayload(ctxParams, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
            payload.avaya_telephony.transfer.dest = `tel:${vdn}`;
            payload.avaya_telephony.transfer.aai = payload.avaya_telephony.transfer.aai.replace(USER_SIP_HEADER, sipHeader);
            logger.log("info", "Agent transfer detail", "webhook/agent-transfer", { "log details": sipHeader, vdn: vdn, transferAAI: payload.avaya_telephony.transfer.aai, session: params.dfSessionID });
        } else {
            // if fails, the SIP header in payload is not considered           
            message = df._request.queryResult.fulfillmentMessages[0].text.text[0] || params.EndResponse;
            payload = df._request.queryResult.fulfillmentMessages[1].payload.ConfigApiFailurePayload;
            payload.avaya_telephony.transfer.dest = `tel:${params.transferNumber}`;
            logger.log("info", "Agent transfer to Avaya dnis - no config output", "webhook/agent-transfer", { vdn: params.transferNumber, session: params.dfSessionID });
        }

        df.setResponseText(response(message));
        df.setPayload(payload);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/agent-transfer", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = agentTransfer;
