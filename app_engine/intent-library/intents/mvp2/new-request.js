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
const { CONTEXTS, OPLIFESPAN, EVENTS, PHONE_TYPES, VOIP_REGEX } = require("../../../helper/constants");
const retryLimitExceeded = require("../../../helper/retry-limit-checker").retryLimitExceeded;
const twilioLookup = require("../../../services/twilio-lookup");
const { setTwilioOutput } = require("../../../helper/twilio-output-voip-setting");
const { trimAni } = require("../../../helper/trim-ani");
const sessionEventChat = require("../../../services/session-event-chat.js");

/**
   * Raise new request Intent controller
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const newRequest = async (df, params) => {
    try {
        let dfSessionId = df._request.session.split("/").reverse()[0];
        let callIdSipHdrs = params.webchat && params.webchat.c1SessionId || "";

        let programCode = params.webchat.clientCode.toUpperCase();
        let phoneNumber = params.phoneNumber || params["jobDetails"].customer.phone;

        if (!phoneNumber) { //ask for phone number. If it is null
            params["triggerSms"] = true;
            df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
            df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
            df.setResponseText(params.chatConfigApi.numberForNewRequest);
        }
        else {
            let givenNumber = trimAni(phoneNumber); //trim number if it has country or some other chars

            let twilioOutputRes = await twilioLookup(givenNumber); // check if it is` landline or mobile
            let twilioOutput = twilioOutputRes;
            if (twilioOutputRes.success == true) {
                if (twilioOutputRes.data["carrierType"] === PHONE_TYPES.voip) {
                    let phoneTypeRegex = VOIP_REGEX,
                        twilioOutput = setTwilioOutput(twilioOutputRes, phoneTypeRegex, df);
                }
                let twilioResult = twilioOutput.data;
                if (twilioResult.carrierType.toLowerCase() !== PHONE_TYPES.mobile) {
                    if (retryLimitExceeded(params, "ChatGetPhoneNumber", 3)) {
                        df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                    } else {
                        params["triggerSms"] = true;
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                        df.setResponseText(params.chatConfigApi.numberForNewRequest);
                    }
                }
                else {
                    let sessionEventRes = await sessionEventChat(programCode, givenNumber, dfSessionId, callIdSipHdrs);
                    if (sessionEventRes.success == true) {
                        //NOTE: save the time in context. We will use it later
                        params.smsTriggeredTime = Math.floor(Date.now() / 1000);
                        df.setOutputContext(CONTEXTS.ChatSMSTriggered, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatSMSTriggered);
                        let attempt = parseInt(params["attempt"]) || 0;
                        attempt = attempt + 1;
                        params.attempt = attempt;
                    }
                    else {
                        df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatAgentTransfer);
                        params.apiFailure = true;
                    }
                }
            }
            else {
                //API Failure
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                params.apiFailure = true;
            }
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/mvp2/new-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newRequest;