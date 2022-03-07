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
const { EVENTS, CONTEXTS, OPLIFESPAN, ISCANCELLABLE } = require("../../../helper/constants");
const logger = require("../../../logger");

/**
   * Cancel Request process Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const cancelRequest = async (df, params) => {
    try {
        let status = params["jobDetails"].status;

        // check if the request is cancellable
        if (ISCANCELLABLE.includes(status)) {
            // ask for confirmation
            df.setOutputContext(CONTEXTS.ChatCancelReqConfirm, OPLIFESPAN);
            df.setEvent(EVENTS.ChatCancelReqConfirm);
        }
        else {
            // agent transfer
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/cancel-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = cancelRequest;

