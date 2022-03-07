"use strict";

const logger = require("../../../logger");
const retryLimitExceeded = require("../../../helper/retry-limit-checker").retryLimitExceeded;
const { EVENTS, CONTEXTS, OPLIFESPAN, CALL_TYPES } = require(".././../../helper/constants");
const { setEndResponse } = require("../../../helper/set-end-response");
const { response } = require("../../helper/responses");


/**
 * Open Request ETA
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const openRequestETA = async (df, params) => {
    try {
        let message = df._request.queryResult.fulfillmentMessages[0].text.text[0];
        let agentTransferText = params.apiResults.configResult.prompts.visual.agentTransfer.text;
        let payload = df._request.queryResult.fulfillmentMessages[1].payload.openRequestETAPayload;
        params.agentTransferReasonNoInputRetry = 0; // If the user has already visited reason flow

        if (process.env.NODE_ENVIRONMENT === "development" || process.env.NODE_ENVIRONMENT === "staging") {
            if (payload.tweaks) {
                params.apiResults.aniResult.eta = payload.ETA;
                params.apiResults.aniResult.EtaAvailable = payload.EtaAvailable;
                params.apiResults.aniResult.spName = payload.spName;
            }
        }

        if (params.hasOwnProperty("openRequestNewCallbackNumber") && !params.apiResults.aniResult.openRequest) return await setEndResponse(df, params, agentTransferText);

        if (!params.apiResults.aniResult.openRequest && params.somethingElse) {
            params.openRequestNewCallbackNumber = true;
            df.clearContext(CONTEXTS.openRequestETAfollowup);
            df.clearContext(CONTEXTS.agentTransferReason);
            df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
            df.setEvent(EVENTS.welcomeBlacklistedNumber);
        }
        else {
            params.callType = CALL_TYPES.callback;
            if (retryLimitExceeded(params, "openRequestETA", 2)) {
                return await setEndResponse(df, params, agentTransferText);
            }
            else {
                if (params.apiResults.aniResult.EtaAvailable) {
                    let ETA = params.apiResults.aniResult.eta;
                    switch (true) {
                        case (ETA <= 0):
                            agentTransferText = params.apiResults.configResult.prompts.greeting.etaZero.text;
                            return await setEndResponse(df, params, agentTransferText);
                        case (ETA > 0):
                            message = params.apiResults.configResult.prompts.greeting.etaPositive.text;
                            message = message.replace("[SP Business Name]", params.apiResults.aniResult.spName)
                                .replace("[remaining ETA]", ETA);
                            break;
                        case (ETA == null):
                            agentTransferText = params.apiResults.configResult.prompts.greeting.etaNull.text;
                            return await setEndResponse(df, params, agentTransferText);
                        default:
                            return await setEndResponse(df, params, agentTransferText);
                    }
                }
                else {
                    return await setEndResponse(df, params, agentTransferText);
                }
            }
        }

        df.setResponseText(response(message));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/open-request/open-request-eta", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = openRequestETA;