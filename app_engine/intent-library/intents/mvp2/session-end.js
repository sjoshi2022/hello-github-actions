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
const { CONTEXTS, OPLIFESPAN, CHAT_CONFIG_PROMPTS } = require("../../../helper/constants");
const logger = require("../../../logger");

/**
   * Session End Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const sessionEnd = async (df, params) => {
    try {
        if (params.endFlow) { //check if request coming from chatThanks intent
            df.setResponseText(params.chatConfigApi.sessionRefresh);
        }
        else {
            df.setResponseText(CHAT_CONFIG_PROMPTS.sessionRefresh);
        }
        let currentContexts = df.getAllOutputContexts() || [];
        //remove all output contexts
        if (currentContexts && currentContexts.length > 0) {
            currentContexts.forEach(context => {
                let contextName = context && context.name.split("/").reverse()[0];
                df.clearContext(contextName);
            });
        }
        params.chatConfigApi = {}; //after sessionEnd we don't need configPrompts
        df.setOutputContext(CONTEXTS.ChatDummyContext, OPLIFESPAN); //setDummy context for analytics
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/session-end", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = sessionEnd;

