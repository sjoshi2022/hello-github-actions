"use strict";

const logger = require("../../logger");
const { setEndResponse } = require("../../helper/set-end-response");
const getDTMF = require("../../helper/avaya-functions/get-dtmf");
const { openRequestFallbackHelper, newRequestFallbackHelper } = require("../helper/non-blacklist-fallback-helper");
const { SILENT_OPTION_DTMF } = require("../../helper/constants");
const welcomeBlacklistedNumberFallbackHelper = require("../helper/blacklist-fallback-helper").welcomeBlacklistedNumberFallbackHelper;


/**
 * Silent Option Get DTMF
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const silentOptionDTMF = async (df, params) => {
    try {
        let digit = getDTMF(df);
        if (digit == null || digit.toString() === SILENT_OPTION_DTMF) return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);

        if (!params.apiResults.allowedAniResult.maskedNumber) {
            // non-blacklist flow
            if (params.apiResults.aniResult.openRequest) return openRequestFallbackHelper(df, params); // open request
            return newRequestFallbackHelper(df, params); // no open request
        } else {
            // blacklist flow
            return welcomeBlacklistedNumberFallbackHelper(df, params);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/silent-option-dtmf", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = silentOptionDTMF;
