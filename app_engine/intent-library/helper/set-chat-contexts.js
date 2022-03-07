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

const { chatResponses } = require("./get-chat-responses.js");
const { CONTEXTS } = require("../../helper/constants");


/**
   * Helper function to set context for the status, Giving a chance to user jump to another flow
*/
const setChatContexts = async (df, params) => {
    let responses = await chatResponses(params["jobDetails"], params);
    for (let i = 0; i < responses.contexts.length; i++) {
        df.setOutputContext(responses.contexts[i], 1);
    }
    // Active below context for all statuses
    df.setOutputContext(CONTEXTS.ChatInvoice, 1);
    df.setOutputContext(CONTEXTS.ChatCancelReq, 1);
};

module.exports = { setChatContexts };
