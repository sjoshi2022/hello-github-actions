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
const payloadHelper = require("../helper/response-payload-helper").payloadHelper;
const { response } = require("../helper/responses");

/**
  * Open - Non blacklist flow fallback helpers
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */
const openRequestFallbackHelper = async (df, params) => {
    try {
        let payload, message;
        let queryText = df._request.queryResult.queryText ? true : false;
        if (retryLimitExceeded(params, "openRequestFallbackRetry", 3, queryText)) {
            return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
        } else {
            message = params.apiResults.configResult.prompts.greeting.openRequestFallback.text;
            payload = payloadHelper(df, params);
        }

        df.setResponseText(response(message));
        if (payload) {
            df.setPayload(payload);
        }
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/non-blacklist-fallback-helper", { message: err, session: params.dfSessionID });
        throw err;
    }
};


/**
  * NewRequest - Non blacklist flow fallback helpers
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */
const newRequestFallbackHelper = async (df, params) => {
    try {
        let payload, message;
        let queryText = df._request.queryResult.queryText ? true : false;

        if (retryLimitExceeded(params, "newRequestFallbackRetry", 3, queryText)) {
            return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
        } else {
            message = params.apiResults.configResult.prompts.greeting.newRequestFallback.text;
            payload = payloadHelper(df, params);
        }

        df.setResponseText(response(message));
        if (payload) {
            df.setPayload(payload);
        }
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/non-blacklist-fallback-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { openRequestFallbackHelper, newRequestFallbackHelper };
