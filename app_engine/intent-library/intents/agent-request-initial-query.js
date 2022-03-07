"use strict";

const logger = require("../../logger");
const { CONTEXTS, OPLIFESPAN_THREE, OPLIFESPAN_ONE, PHONE_TYPES } = require("../../helper/constants");
const { setEndResponse } = require("../../helper/set-end-response");
const { retryLimitExceeded } = require("../../helper/retry-limit-checker");
const { setTwilioOutput } = require("../../helper/twilio-output-voip-setting");

/**
 * Agent Requested on Inital Welcome Msg
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const agentRequestInitialQuery = async (df, params) => {
    try {
        // Silent option disbaled for the vdn, provide self service automation - speech flow
        let message = params.apiResults.configResult.prompts.vivr.forceSelfServeAutomation.text;
        let queryText = df._request.queryResult.queryText ? true : false;
        let twilioResult = params.apiResults.twilioResult;

        if (retryLimitExceeded(params, "agentRequestInitialQuery", 3, queryText)) {
            return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
        }

        if (twilioResult.carrierType === PHONE_TYPES.voip) {
            let phoneTypeRegex = params.apiResults.configResult["environment"]["phoneType"];
            params.apiResults.twilioResult = setTwilioOutput(twilioResult, phoneTypeRegex, df);
        }
        if (params.apiResults.twilioResult.carrierType !== PHONE_TYPES.mobile) {
            df.setResponseText(`${message} ${params.apiResults.configResult.prompts.greeting.invalidCallback.text}`);
            df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_THREE);
            df.setOutputContext(CONTEXTS.dontHaveMobile, OPLIFESPAN_THREE);
            df.setOutputContext(CONTEXTS.agentRequestInitialQuery, OPLIFESPAN_ONE);
            return df;
        }

        if (!params.apiResults.allowedAniResult.maskedNumber) {
            // the number user is calling from is not a blacklisted
            if (params.apiResults.aniResult.openRequest) {
                // open request within 24 hr
                df.setResponseText(`${message} ${params.apiResults.configResult.prompts.greeting.currentRequest.text}`);
                df.setOutputContext(CONTEXTS.openRequestFollowup, OPLIFESPAN_THREE);
            } else {
                // no open request - new request
                df.setResponseText(`${message} ${params.apiResults.configResult.prompts.greeting.newRequest.text}`);
                df.setOutputContext(CONTEXTS.newRequestFollowup, OPLIFESPAN_THREE);
            }
        } else {
            // the number user is calling from is blacklisted
            df.setResponseText(`${message} ${params.apiResults.configResult.prompts.greeting.invalidCallback.text}`);
            df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_THREE);
            df.setOutputContext(CONTEXTS.dontHaveMobile, OPLIFESPAN_THREE);
        }
        df.setOutputContext(CONTEXTS.agentRequestInitialQuery, OPLIFESPAN_ONE);
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/agent-request-initial-query", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = agentRequestInitialQuery;
