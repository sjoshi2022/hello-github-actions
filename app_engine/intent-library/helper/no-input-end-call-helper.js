"use strict";

const retryLimitExceeded = require("../../helper/retry-limit-checker").retryLimitExceeded;
const logger = require("../../logger");
const { response } = require("../helper/responses");
const { EVENTS } = require(".././../helper/constants");

/**
  *no input end call helper to check two consecutive no inputs
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  * @param {string} noInputParam parameter for checking retry limit exceeded
  */

const noInputRetryLimitCheck = async (df, params, noInputParam) => {
    try {
        if (retryLimitExceeded(params, noInputParam, 2)) {
            let message = response(params.apiResults.configResult.prompts.greeting.NoInputDisconnectCall.text);
            params["NoInputDiconnectResponse"] = message;
            df.setResponseText(message);
            df.setEvent(EVENTS.noInputDisconnectCall);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/no-input-end-call-helper", { message: err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { noInputRetryLimitCheck };