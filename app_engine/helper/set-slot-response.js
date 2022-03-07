"use strict";

const config = require("../config")();
const setEndResponse = require("./set-end-response").setEndResponse;
const retryLimitExceeded = require("../helper/retry-limit-checker").retryLimitExceeded;
const logger = require("../logger");
const { response } = require("../intent-library/helper/responses");

/**
 * To handle slot retry limit and send respective msg
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {Object} params Global context to store data
 * @param {Object} slotName Name of the slot counter
 * @param {Object} anotherResponse Other response, if retry limit for slot exceeds 1.
 * @returns {Object} df To send response to dialogflow
 */
const setSlotResponse = async (df, params, slotName, anotherResponse) => {
    let message = "";
    let counterName = `${slotName}Counter`;

    if (params[counterName]) {
        message = anotherResponse;
    } else {
        message = anotherResponse || df._request.queryResult.fulfillmentMessages[0].text.text[0];
    }

    if (retryLimitExceeded(params, counterName, config.slotFillingCounterLimit)) {
        await setEndResponse(df, params, params["apiResults"]["configResult"]["prompts"]["visual"]["agentTransfer"]["text"], true);
    } else {
        df.setResponseText(response(message));
        logger.log("info", `Slot filling response for ${counterName}`, 'helper/set-slot-response', { session: df._request.session.split("/").reverse()[0] });
    }
};

module.exports = { setSlotResponse };
