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

const { EVENTS, PHONE_TYPES, CONTEXTS, OPLIFESPAN } = require("../../helper/constants");
const logger = require("../../logger");
const { response } = require("./responses");


/**
 * Helper function to set up a new request for user
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {Object} params Global context to store data
 */
const newRequest = async (df, params) => {
    try {
        let message = df._request.queryResult.fulfillmentMessages[0].text.text[0];
        let forceNumber = params["apiResults"].allowedAniResult.forcedMobile;
        let mobileType;

        params.openRequestNewCallbackNumber = false; // So as to avoid wrong initiation of flow in welcome blacklist number if number is landline
        if (!params["apiResults"].twilioResult && !forceNumber) {
            // trigger intent to ask for the mobile type
            params.initialFlow = true;
            df.setOutputContext(CONTEXTS.askCarrierType, OPLIFESPAN);
            df.setEvent(EVENTS.askCarrierType);
            return df;
        }
        if (params["apiResults"].twilioResult) {
            mobileType = params["apiResults"].twilioResult.carrierType;
        }
        // Changes made for landline as well as mobile
        if (forceNumber || mobileType === PHONE_TYPES.mobile) {
            df.setOutputContext(CONTEXTS.config, OPLIFESPAN);
            df.setEvent(EVENTS.configMessage);
        }
        else if (mobileType === PHONE_TYPES.landline) {
            df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
            df.setEvent(EVENTS.requestOnCall);
        }
        df.setResponseText(response(message));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/set-new-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { newRequest };
