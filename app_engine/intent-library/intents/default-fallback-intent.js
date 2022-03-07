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

const { CONTEXTS, OPLIFESPAN, EVENTS, CHAT_CONFIG_PROMPTS } = require("../../helper/constants");
const retryLimitExceeded = require("../../helper/retry-limit-checker").retryLimitExceeded;
const logger = require("../../logger");


/**
  * Default Fallback Intent controller
  * @param {object} df webhook fulfillment object,
  * @param {object} params Global Parameters
  */
const defaultFallbackIntent = async (df, params) => {
    try {
        // get avaya and global contexts
        let avayaContext = df.getContext("avaya-session-telephone");
        let globalContext = df.getContext("global");
        // Telephony Fallback 
        if (avayaContext) {
            df.setResponseText("");
        }
        // Chat Fallback when session is alive
        else if (globalContext) {
            let configPromptsExist = params.chatConfigApi && Object.keys(params.chatConfigApi).length;
            if (configPromptsExist > 0) { //enter only for chat bot request and if chatConfigApi object values present
                if (retryLimitExceeded(params, "ChatDefautlFallbackIntentRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                }
                else {
                    df.setResponseText(params.chatConfigApi.rephraseQuery);
                }
            }
            else {
                // Treating only for chatbot as of now. telephony might won't get call this intent 
                df.setResponseText(CHAT_CONFIG_PROMPTS.sessionRefresh);
                df.setOutputContext(CONTEXTS.ChatDummyContext, OPLIFESPAN); //setDummy context for analytics
            }
        }
        // Chat Fallback when context is expired
        else {
            // Treating only for chatbot as of now. telephony might won't get call this intent
            df.setResponseText(CHAT_CONFIG_PROMPTS.sessionRefresh);
            df.setOutputContext(CONTEXTS.ChatDummyContext, OPLIFESPAN); //setDummy context for analytics
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/welcome-intent", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = defaultFallbackIntent;
