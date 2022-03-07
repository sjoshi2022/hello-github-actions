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

const { retryLimitExceeded } = require("../../helper/retry-limit-checker");
const { setEndResponse } = require("../../helper/set-end-response");
const { EVENTS, OPLIFESPAN, OPLIFESPAN_ONE, CONTEXTS } = require("../../helper/constants");
const { response } = require("../helper/responses");
const logger = require("../../logger");


/**
  * Number not valid helper - gets executed when the number is not valid
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */

const numberNotValidHelper = async (df, params) => {
    try {
        let dfResponses = params["apiResults"]["configResult"]["prompts"];
        let message;

        /* Checking the retry limit , otherwise going ahead and asking the number again as it is invalid */
        if (retryLimitExceeded(params, "newCallBackNumberValidRetry", 2)) {
            await setEndResponse(df, params, dfResponses["visual"]["agentTransfer"]["text"], true);
        } else if (params.landlineflow) {
            df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_ONE);
            message = "Could you provide me a valid landline number for us to help you further?";
            df.setResponseText(response(message));
        } else {
            params.welcomeBlacklistedNoInputRetry = 0;
            df.setEvent(EVENTS.welcomeBlacklistedNumber);
            df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
            /* Different prompts for Asking the user for number 
                1. For open request in new request something else flow
                2. For blacklisted or landline flow            
            */
            if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
                message = dfResponses["greeting"]["openRequestNewCallNumberSecond"]["text"];
            } else {
                message = dfResponses["greeting"]["invalidCallback"]["text"];
            }
            df.setResponseText(response(message));
        }
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/number-not-valid-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { numberNotValidHelper };