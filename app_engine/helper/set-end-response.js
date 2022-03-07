"use strict";

const { EVENTS } = require("../helper/constants");
const logger = require("../logger");
const { response } = require("../intent-library/helper/responses");

/**
 * To set df end response
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {Object} params Global context to store data
 * @param {String} message Specific message needs to send other than fulfillment
 * @param {Boolean} maxAttemptExceed Maximum attemp limit
 * @returns {Object} Dialogflow fulfillment response
 */
const setEndResponse = async (df, params, message, maxAttemptExceed = false) => {
    try {
        message = message || df._request.queryResult.fulfillmentMessages[0].text.text[0];
        params["EndResponse"] = message;

        if (maxAttemptExceed) {
            df.setEvent(EVENTS.agentTrasnferRetryExceeded, "en-US", params);
        } else {
            df.setEvent(EVENTS.agentTransfer, "en-US", params);
        }
        df.setResponseText(response(message));

        logger.log("info", `End response sent from: ${df._request.queryResult.intent.displayName}`, "helper/set-end-response", { "End response": message, session: df._request.session.split("/").reverse()[0] });
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed while sending the end response: ${err.message}`, null, {
            "message": err, session: df._request.session.split("/").reverse()[0],
        });
        throw err;
    }
};

module.exports = { setEndResponse };
