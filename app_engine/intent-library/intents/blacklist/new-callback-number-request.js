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

const { CONTEXTS, OPLIFESPAN, FLOW_NAMES } = require("../../../helper/constants");
const { setSlotResponse } = require("../../../helper/set-slot-response");
const isValidNumber = require("../../../helper/validate-phone-number").validatePhoneNumber;
const getDTMF = require("../../../helper/avaya-functions/get-dtmf");
const logger = require("../../../logger");
const { trimAni } = require("../../../helper/trim-ani");
const { numberNotValidHelper } = require("../../helper/number-not-valid-helper");
const { numberValidHelper } = require("../../helper/number-valid-helper");

/**
 * New Callback Number Requested Intent controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const newCallbackNumberRequested = async (df, params) => {
    try {
        /* Getting responses from config */
        let dfResponses = params["apiResults"]["configResult"]["prompts"];
        let phoneRegex = params["apiResults"]["configResult"]["environment"]["phoneRegex"];
        /* Getting newcallbacknumber from either dtmf or parameter in DF console */
        let newCallbackNumber = getDTMF(df) || params.newCallbackNumber;
        params.newCallbackNumber = trimAni(newCallbackNumber);
        let message;
        /* If the new callback number was not captured or empty, retry limit for slot is checked and welcome blacklisted is called again */
        if (!newCallbackNumber || newCallbackNumber === "") {
            // number is required
            let payload = df._request.queryResult.fulfillmentMessages[1].payload.newCallbackNumberPayload;
            df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN);
            df.clearContext(CONTEXTS.newCallbackNumberFollowUp);
            df.setPayload(payload);
            if (params.hasOwnProperty("forLocateMeSMS") && params.forLocateMeSMS) {
                message = params.apiResults.configResult.prompts.vivr.requestMobileNumber.text;
            }
            else if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
                message = dfResponses["greeting"]["openRequestNewCallNumberSecond"]["text"];
            }
            else if (params.hasOwnProperty("configPathNewCallbackNumber") && params.configPathNewCallbackNumber) {
                message = params.apiResults.configResult.prompts.vivr.offerVisualAskPhoneNumberRepeat.text;
            }
            else {
                message = dfResponses["greeting"]["invalidCallback"]["text"];
            }
            await setSlotResponse(df, params, "newCallBackNumberSlotRetry", message);
        }
        else if (!isValidNumber(newCallbackNumber, phoneRegex)) {
            // number is invalid and retry is checked for how many times user entered invalid number
            params.callbackNumber = trimAni(newCallbackNumber);
            return numberNotValidHelper(df, params);
        }
        else {
            // number is valid, so asking for confirmation of number
            params.callbackNumber = trimAni(newCallbackNumber);
            return numberValidHelper(df, params, newCallbackNumber, FLOW_NAMES.requestFlow);
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/blacklist/new-callback-number-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newCallbackNumberRequested;
