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

const { EVENTS, CONTEXTS, OPLIFESPAN, OPLIFESPAN_ONE, FLOW_NAMES } = require("../../../../helper/constants");
const { setEndResponse } = require("../../../../helper/set-end-response");
const { retryLimitExceeded } = require("../../../../helper/retry-limit-checker");
const isValidNumber = require("../../../../helper/validate-phone-number").validatePhoneNumber;
const getDTMF = require("../../../../helper/avaya-functions/get-dtmf");
const logger = require("../../../../logger");
const { trimAni } = require("../../../../helper/trim-ani");
const { response } = require("../../../helper/responses");
const { numberNotValidHelper } = require("../../../helper/number-not-valid-helper");
const { numberValidHelper } = require("../../../helper/number-valid-helper");


/**
  * NewCallbackNumberIncorrect Intent controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const newCallbackNumberIncorrect = async (df, params) => {
    try {
        let dfResponses = params["apiResults"]["configResult"]["prompts"];
        let newCallbackNumberCorrected = getDTMF(df) || params.newCallbackNumberCorrected;
        params.newCallbackNumberCorrected = newCallbackNumberCorrected;
        let phoneRegex = params["apiResults"]["configResult"]["environment"]["phoneRegex"];
        let message;
        /* Checking for New callback Number Retry limit */
        if (retryLimitExceeded(params, "newCallBackNumberIncorrectRetry", 2)) {
            await setEndResponse(df, params, dfResponses["visual"]["agentTransfer"]["text"], true);
        } else {
            /* For Landline */
            if(params.landlineflow){
                df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup,OPLIFESPAN_ONE);
                message = "Could you provide me a valid landline number for us to help you further?";
                df.setResponseText(response(message));
            }

            /* There was no phone number entered through the utterance - Asking for number again */
            else if (!newCallbackNumberCorrected) {
                df.setEvent(EVENTS.welcomeBlacklistedNumber);
                df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                message = df._request.queryResult.fulfillmentMessages[0].text.text[0];
                df.setResponseText(response(message));
            }
            else if (!isValidNumber(newCallbackNumberCorrected, phoneRegex)) {
                // number is invalid - Checking for Validation of phone number retry - If not exceeded, asking for number again
                params.callbackNumber = trimAni(newCallbackNumberCorrected);
                params.newCallbackNumber = trimAni(newCallbackNumberCorrected);
                delete params.newCallbackNumberCorrected;
                return numberNotValidHelper(df, params);
            }
            else {
                // number is valid - Number Captured and Asking for Number Confirmation
                params.callbackNumber = trimAni(newCallbackNumberCorrected);
                params.newCallbackNumber = trimAni(newCallbackNumberCorrected);
                delete params.newCallbackNumberCorrected;
                return numberValidHelper(df, params, newCallbackNumberCorrected, FLOW_NAMES.incorrectFlow);
            }
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/blacklist/new-callback-number-incorrect", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newCallbackNumberIncorrect;
