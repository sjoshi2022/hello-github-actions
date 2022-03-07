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

const { CONTEXTS, OPLIFESPAN } = require("../../helper/constants");
const logger = require("../../logger");
const { response } = require("./responses");
const { formedResponse } = require("../../helper/configure-welcome-response");


/**
  * Response helper for new & open request
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */
const responseHelper = (params, message) => {
    try {
        return (params.ani !== params.callbackNumber || params.askNewRequest) ? response(message) : formedResponse(message, params);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/response-payload-helper", { message: err, session: params.dfSessionID });
        throw err;
    }
};


/**
  * Paylaod helper functions for new & open request
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */
const payloadHelper = (df, params) => {
    try {
        let payload = {};
        if (params.apiResults.configResult.client.csr.enabled) {
            payload = df._request.queryResult.fulfillmentMessages[1].payload.silentOptionEnablePayload;
            df.setOutputContext(CONTEXTS.silentOption, OPLIFESPAN);
        } else {
            payload = df._request.queryResult.fulfillmentMessages[1].payload.silentOptionDisabledPayload;
        }
        return payload;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/response-payload-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { responseHelper, payloadHelper };
