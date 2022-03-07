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
const { DIRECT_AGENT_TRANSFER_CASES, CHAT_CONFIG_PROMPTS } = require("../../../helper/constants");
const logger = require("../../../logger");

/**
   * Agent Transfer Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const agentTransfer = async (df, params) => {
    try {
        let status = params.jobDetails && params.jobDetails.status || "";
        let apiFailure = params.apiFailure || false;
        let name = params.jobDetails && params.jobDetails.customer && params.jobDetails.customer.name || "";
        // direct agent transfer 
        if (DIRECT_AGENT_TRANSFER_CASES.includes(status)) {
            let jobDetails = params.jobDetails;
            let greetingMsg = params.chatConfigApi.greeting.replace("$name", name);
            let responses = await chatResponses(jobDetails, params);
            let responseText = greetingMsg;

            // display welcome msg if is not displayed. 
            if (!params.isWelcomeMsgDisplayed) {
                responseText = `${greetingMsg}, ${params.chatConfigApi.customerWelcomeMsg.replace("$client_name", params.clientName)}. \n\n${responses.res}`;
            }
            else {
                responseText = `${greetingMsg}, ${responses.res}`;
            }
            df.setResponseText(responseText);
        }
        // api failure 
        else if (apiFailure) {
            //chatConfigApi object null when chatconfig api fails. send static prompt
            let message = (params.chatConfigApi && params.chatConfigApi.apiFailure) || CHAT_CONFIG_PROMPTS.apiFailure;
            df.setResponseText(message);
        }
        // remaining cases
        else {
            df.setResponseText(params.chatConfigApi.agentTransfer);
        }
        //remove chatConfig prompts when agent escalation. Its not needed for the C1 conversation system yet take a lot of space in storing 
        params.chatConfigApi = {};
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/agent-trasnfer", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = agentTransfer;

