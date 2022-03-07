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
const logger = require("../../../logger");
const { CONTEXTS, OPLIFESPAN, EVENTS } = require("../../../helper/constants");
const { trimAni } = require("../../../helper/trim-ani");
const sessionEventChat = require("../../../services/session-event-chat.js");

/**
   * Raise new request Intent controller. When user say sms not received
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const newRequest = async (df, params) => {
    try {
        let smsTriggeredTime = params["smsTriggeredTime"];
        let attempt = params["attempt"];

        // get current time
        let currentTime = Math.floor(Date.now() / 1000);

        // check attempt
        if (attempt == 1) {
            // check if <30 seconds
            if (currentTime - smsTriggeredTime < 30) {
                df.setOutputContext(CONTEXTS.ChatSMSWait, OPLIFESPAN);
                df.setEvent(EVENTS.ChatSMSWait);
            }
            else {
                // trigger sms
                let dfSessionId = df._request.session.split("/").reverse()[0];
                let callIdSipHdrs = params.webchat && params.webchat.c1SessionId || "";

                let programCode = params.webchat.clientCode.toUpperCase();
                let phoneNumber = params.phoneNumber || params["jobDetails"].customer.phone;
                let givenNumber = trimAni(phoneNumber); // trim number if it has country or some other chars

                let sessionEventRes = await sessionEventChat(programCode, givenNumber, dfSessionId, callIdSipHdrs);
                // sms sent
                if (sessionEventRes.success == true) {
                    df.setOutputContext(CONTEXTS.ChatSMSTriggered, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatSMSTriggered);
                    let attempt = parseInt(params["attempt"]) + 1;
                    params.attempt = attempt;
                }
                // agent transfer for api failure
                else {
                    params.apiFailure = true;
                    df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatAgentTransfer);
                }
            }
        }
        // agent transfer for > 1 attempts
        else {
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/did-not-get-sms", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newRequest;

