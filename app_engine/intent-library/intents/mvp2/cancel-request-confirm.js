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
const { EVENTS, CONTEXTS, OPLIFESPAN } = require("../../../helper/constants");
const cancelRequest = require("../../../services/update-jobstatus-to-cancelled.js");
const logger = require("../../../logger");


/**
   * Cancel request confirm Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const cancelRequestConfirm = async (df, params) => {
    try {
        let jobId = params.jobDetails.id;
        let accessToken = params["accessToken"];
        let callIdSipHdrs = params.webchat && params.webchat.c1SessionId || "";
        let dfSessionId = df._request.session.split("/").reverse()[0];

        // cancel request
        let requestInfo = await cancelRequest(jobId, accessToken, dfSessionId, callIdSipHdrs);
        // request is successful
        if (requestInfo.success) {
            df.setOutputContext(CONTEXTS.ChatCancelReqSuccess, OPLIFESPAN);
            df.setEvent(EVENTS.ChatCancelReqSuccess);
        }
        // agent transfer for request failure
        else {
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
            params.apiFailure = true;
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/cancel-request-confirm", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = cancelRequestConfirm;

