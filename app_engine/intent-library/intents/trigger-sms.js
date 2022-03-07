"use strict";

const logger = require("../../logger");
const { sessionEventHelper } = require("../helper/session-event-helper");
const { SESSION_EVENTS } = require("../../helper/constants");
const { setEndResponse } = require("../../helper/set-end-response");
const { commandProcessor } = require("../helper/command-processor");
const { clearQueueCommandHelper } = require("../helper/clear-queue-command-helper");


/**
 * Trigger SMS - Session Events API starts 
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const triggerSMS = async (df, params) => {
    try {
        params.changeRSASourceSystem = true;
        let sessionEventApiOutput = await sessionEventHelper(df, params, SESSION_EVENTS.initiateSession, true);
        if (!sessionEventApiOutput.success) {
            // handle case when session event api fails - agent transfer
            logger.log("info", 'Sessin Event API call failed, Transfer to an agent', "intent-library/intents/trigger-sms", { session: params.dfSessionID });
            await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
            return df;
        }
        params = await clearQueueCommandHelper(params, sessionEventApiOutput.data);
        return await commandProcessor(df, params);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/trigger-sms", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = triggerSMS;
