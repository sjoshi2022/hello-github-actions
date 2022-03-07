/**
 * Copyright 2020 Quantiphi, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const logger = require("../../logger");
const retryLimitExceeded = require("../../helper/retry-limit-checker").retryLimitExceeded;
const { setEndResponse } = require("../../helper/set-end-response");
const { response } = require("../helper/responses");
const { CONTEXTS, OPLIFESPAN_ONE } = require("../../helper/constants");

/**
  * blacklist flow fallback helpers
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */

const welcomeBlacklistedNumberFallbackHelper = async (df, params) => {
    try {
        let payload, message;
        let queryText = df._request.queryResult.queryText ? true : false;

        if (retryLimitExceeded(params, "welcomeBlacklistedNumberFallbackRetry", 3, queryText)) {
            return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
        } else {
            if (params.landlineflow) {
                df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_ONE);
                // TO DO: Update below prompt from config api (IVA-XXX)
                message = "Sorry I am unable to understand. Could you provide me a valid landline number for us to help you further?";
            } else if (params.hasOwnProperty("forLocateMeSMS") && params.forLocateMeSMS) {
                df.clearContext(CONTEXTS.dontHaveMobile);
                message = params.apiResults.configResult.prompts.vivr.requestMobileNumberFallback.text;
            } else if (params.hasOwnProperty("configPathNewCallbackNumber") && params.configPathNewCallbackNumber) {
                df.clearContext(CONTEXTS.dontHaveMobile);
                message = params.apiResults.configResult.prompts.vivr.offerVisualAskPhoneNumberfallback.text;
                df.setOutputContext(CONTEXTS.configMessageNo, OPLIFESPAN_ONE);
            } else if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
                df.clearContext(CONTEXTS.dontHaveMobile);
                message = params.apiResults.configResult.prompts.greeting.openRequestNewCallNumberFallback.text;
            } else {
                message = params.apiResults.configResult.prompts.greeting.blacklistFallback.text;
            }
            payload = df._request.queryResult.fulfillmentMessages[1].payload.blacklistedAvayaPayload;
        }

        df.setResponseText(response(message));
        if (payload) {
            df.setPayload(payload);
        }
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/blacklist-fallback-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { welcomeBlacklistedNumberFallbackHelper };
