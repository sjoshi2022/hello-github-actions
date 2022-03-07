"use strict";

const logger = require("../../logger");
const { sessionEventHelper } = require("../helper/session-event-helper");
const { SESSION_EVENTS, SESSION_COMMANDS } = require("../../helper/constants");
const { setEndResponse } = require("../../helper/set-end-response");
const { commandProcessor } = require("../helper/command-processor");
const { appendCommandHelper } = require("../helper/append-commands-helper");
const { clearQueueCommandHelper } = require("../helper/clear-queue-command-helper");

/**
 * Trigger SMS Connect Agent - Session Events API update with Transfer Requested 
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const triggerSMSConnectAgent = async (df, params) => {
    try {
        let sessionEventApiOutput = await sessionEventHelper(df, params, SESSION_EVENTS.transferRequested, true);
        if (!sessionEventApiOutput.success) {
            // handle case when session event api fails - agent transfer
            await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
            return df;
        }

        if (sessionEventApiOutput.data != null && sessionEventApiOutput.data[0].Command === SESSION_COMMANDS.clearQueue) {
            params = await clearQueueCommandHelper(params, sessionEventApiOutput.data);
        } else if (sessionEventApiOutput.data != null && sessionEventApiOutput.data[0].Command != SESSION_COMMANDS.clearQueue) {
            // append Commands to Session Event 
            let sessionCommands = params.apiResults.sessionEventResult;
            params.apiResults.sessionEventResult = await appendCommandHelper(sessionCommands, sessionEventApiOutput.data, params);
        }
        return await commandProcessor(df, params);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/trigger-sms-connect-agent", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = triggerSMSConnectAgent;
