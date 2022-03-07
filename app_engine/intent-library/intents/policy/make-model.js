"use strict";

const { response } = require("../../helper/responses");
const logger = require("../../../logger");


/**
 * Car make and model intent handler
 * @param {object} df webhook fulfillment object,
 * @param {object} params Global Parameters
 */
const carMakeAndModel = async (df, params) => {
    try {
        let message, payload;
        let make = params.apiResults.aniResult.carMake || "TOYO";
        let model = params.apiResults.aniResult.carModel || "CAMRY HYBRID 4DR";
        let year = params.apiResults.aniResult.carYear || "2009";
        params.rsaPostDetails.make = make;
        params.rsaPostDetails.model = model;
        params.rsaPostDetails.year = year
        message = params.apiResults.configResult.prompts.vivr.oemMakeConfirmation.text.replace("<Make>", make);
        message = message.replace("<Year>", year);
        message = message.replace("<Model>", model);
        df.setResponseText(response(message));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/policy/make-model", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = carMakeAndModel;