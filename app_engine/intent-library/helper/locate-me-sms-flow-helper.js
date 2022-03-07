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

const logger = require("../../logger");
const geocodeApi = require("../../services/geo-code");
const getLoggingParams = require("../../helper/get-logging-params");
const { response } = require("../helper/responses");
const { CONTEXTS, OPLIFESPAN, EVENTS, OPLIFESPAN_THREE, PHONE_TYPES } = require("../../helper/constants");


/**
 * Helper function to determine if landline or mobile for locate me sms path
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {String} event Event which is triggered 
 */
const locateMeSMSFlowHelper = async (df, params) => {
    try {
        let phoneType;
        if (params.apiResults.allowedAniResult.forcedMobile) {
            df.setOutputContext(CONTEXTS.locateMeFlow, OPLIFESPAN);
            df.setEvent(EVENTS.locateMeFlow);
        } else if (!params["apiResults"].twilioResult) {
            params.locateMeSMSFlow = "true";
            df.setOutputContext(CONTEXTS.askCarrierType, OPLIFESPAN_THREE);
            df.setEvent(EVENTS.askCarrierType);
        } else {
            phoneType = params["apiResults"].twilioResult.carrierType;
            if (phoneType === PHONE_TYPES.mobile) {
                df.setOutputContext(CONTEXTS.locateMeFlow, OPLIFESPAN);
                df.setEvent(EVENTS.locateMeFlow);
            } else {
                df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.todayOrLater.text));
            }
        }
        // df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/locate-me-sms-flow-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { locateMeSMSFlowHelper };



