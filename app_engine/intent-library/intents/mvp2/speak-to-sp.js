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
const { setChatContexts } = require("../../helper/set-chat-contexts");


/**
   * Speak to Service Provider Input Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const speakToSP = async (df, params) => {
    try {
        // get SP details from context
        let SPName = params["jobDetails"].partner && params["jobDetails"].partner.company && params["jobDetails"].partner.company.name || "";
        let SPPhone = params["jobDetails"].partner && params["jobDetails"].partner.company && params["jobDetails"].partner.company.phone || "";

        // check for null strings
        if (SPName != "" && SPPhone != "") {
            let message = params.chatConfigApi.SPDetails.replace("$SPName", SPName).replace("$SPnumber", SPPhone);
            df.setOutputContext(CONTEXTS.ChatEndFlow, OPLIFESPAN);
            df.setSuggestions({
                "title": message,
                "suggestions": [CHIPS.thanks, CHIPS.noOneResponding]
            });
            //Activate contexts at the end of the flow, giving user to jump to another flow
            setChatContexts(df, params);
        }
        else {
            // agent transfer
            params.apiFailure = true;
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/speak-to-sp", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = speakToSP;

