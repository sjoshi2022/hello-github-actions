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
const { CONTEXTS, OPLIFESPAN, EVENTS, CHIPS } = require("../../../helper/constants");
const logger = require("../../../logger");
const apiUtils = require("../../../services/api-utils/getEta");
const { setChatContexts } = require("../../helper/set-chat-contexts");


/**
   * Tow Truck Time Input Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const towTruckTime = async (df, params) => {
    try {
        // get eta from context
        let calculatedETA = params["jobDetails"].calculatedETA;

        // check if ETA is present or not
        if ((calculatedETA == null) || (calculatedETA == "") || (calculatedETA <= 0)) {
            // agent transfer
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
        }
        else {
            //calculate the ETA with difference of currentETA and current GMT time
            let updateddETA = apiUtils.getTimeDifference(params["jobDetails"].eta.current);
            let message, chips;
            if ((updateddETA == null) || (updateddETA == "") || (updateddETA <= 0)) {
                df.setOutputContext(CONTEXTS.ChatCancelReq, OPLIFESPAN);
                message = params.chatConfigApi.etaExpired;
                chips = [CHIPS.talkToAgent, CHIPS.cancelRequest, CHIPS.speakToSp];
            }
            else {
                df.setOutputContext(CONTEXTS.ChatEndFlow, OPLIFESPAN);
                message = params.chatConfigApi.ETAAvailable.replace("$time", updateddETA);
                chips = [CHIPS.talkToAgent, CHIPS.thanks, CHIPS.speakToSp];
            }
            df.setOutputContext(CONTEXTS.ChatSpeakToSP, OPLIFESPAN);
            df.setSuggestions({
                "title": message,
                "suggestions": chips
            });

            //Activate contexts at the end of the flow, giving user to jump to another flow
            setChatContexts(df, params);
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/tow-truck-time", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = towTruckTime;

