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
const { chatResponses } = require("../../helper/get-chat-responses.js");
const { OPLIFESPAN, CONTEXTS } = require("../../../helper/constants");
const logger = require("../../../logger");


/**
   * Get Query Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const getQuery = async (df, params) => {
    try {
        let flowVisited = params.flowVisited;
        let status = await params.jobDetails && params.jobDetails.status || "";

        // check if user previously visited any flow
        if (flowVisited == "false" && status != "") {
            let responses = await chatResponses(params.jobDetails, params);
            for (let i = 0; i < responses.contexts.length; i++) {
                df.setOutputContext(responses.contexts[i], OPLIFESPAN);
            }
            // Active below context for all statuses
            df.setOutputContext(CONTEXTS.ChatInvoice, OPLIFESPAN);
            df.setOutputContext(CONTEXTS.ChatCancelReq, OPLIFESPAN);
        }
        let message = params.chatConfigApi.getUserIntent;
        df.setResponseText(message);
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/get-query", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = getQuery;