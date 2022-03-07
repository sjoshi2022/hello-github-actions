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

const { OPLIFESPAN, CONTEXTS, OPLIFESPAN_ONE } = require("../../../helper/constants");
const { formedResponse } = require("../../../helper/configure-welcome-response");
const { response } = require("../../helper/responses");
const logger = require("../../../logger");
const { retryLimitExceeded } = require("../../../helper/retry-limit-checker");
const { resetBlacklistCounters } = require("../../helper/reset-blacklist-counters");
const { openReqSomethingElseSliceNumber } = require("../../helper/number-slice-helper");

/**
 * Welcome Blacklisted Number Intent controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const welcomeBlacklistedNumber = async (df, params) => {
    try {
        // Getting responses from config API
        let dfResponses = params["apiResults"]["configResult"]["prompts"];
        let message;
        let payload = df._request.queryResult.fulfillmentMessages[1].payload.blacklistedAvayaPayload;
        if (params.hasOwnProperty("newCallbackNumberNoInputRetry")) {
            params.newCallbackNumberNoInputRetry = 0;
        }
        if (params.hasOwnProperty("welcomeBlacklistedNoInputRetry")) {
            params.newCallbackNumberNoInputRetry = 0;
        }

        if (!params.apiResults.configResult.client.csr.enabled) {
            // Silent option disabled, Handle agent request for inital prompt
            df.setOutputContext(CONTEXTS.agentRequestInitialQuery, OPLIFESPAN_ONE);
        }

        if (params.hasOwnProperty("forLocateMeSMS") && params.forLocateMeSMS) {
            df.clearContext(CONTEXTS.dontHaveMobile);
            if (!retryLimitExceeded(params, "forLocateMeSMSWelcomeBlacklistCounter", 2)) {
                params = await resetBlacklistCounters(params);
            }
            message = params.apiResults.configResult.prompts.vivr.requestMobileNumber.text;
            message = response(message);
        }
        /* When the flow is for asking new number for config message path */
        else if (params.hasOwnProperty("configPathNewCallbackNumber") && params.configPathNewCallbackNumber) {
            //Enabling don't have mobile option so that user can ask for landline 
            //df.clearContext(CONTEXTS.dontHaveMobile);
            //params.configpathchecked is used in don't have mobile intent to check whether the flow has gone through hook options
            params.configpathchecked=true;  
            if (retryLimitExceeded(params, "configPathNewCallbackNumberCounter", 2)) {
                message = params.apiResults.configResult.prompts.vivr.offerVisualAskPhoneNumberRepeat.text;
                message = response(message);
            }
            else {
                params = await resetBlacklistCounters(params);
                message = params.apiResults.configResult.prompts.vivr.offerVisualAskPhoneNumber.text;
                message = response(message);
            }
            df.setOutputContext(CONTEXTS.configMessageNo, OPLIFESPAN_ONE);
        }
        /* When the flow is for asking new number for open request */
        else if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
            df.clearContext(CONTEXTS.dontHaveMobile);
            if (retryLimitExceeded(params, "openRequestNewCallNumber", 2)) {
                message = dfResponses["greeting"]["openRequestNewCallNumberSecond"]["text"];
                message = response(message);
            }
            else {
                params = await resetBlacklistCounters(params);
                message = dfResponses["greeting"]["openRequestNewCallNumber"]["text"];
                message = openReqSomethingElseSliceNumber(params, message);
                message = response(message);
            }
        }
        /* When the flow is coming from open/new request and the number is landline */
        else if (params.hasOwnProperty("isInitialQueAsked") && params.hasOwnProperty("playFullMessage") && params["playFullMessage"]) {
            params.playFullMessage = false;
            let invalidAniResponse = dfResponses["greeting"]["invalidAni"]["text"];
            message = formedResponse(`${invalidAniResponse} ${dfResponses["greeting"]["invalidCallback"]["text"]}`, params, params.isInitialQueAsked);
        }
        /* When the flow is from open/new request and number is landline but it's not the first time it is coming to blacklisted flow */
        else if (params.hasOwnProperty("isInitialQueAsked")) {
            message = formedResponse(dfResponses["greeting"]["invalidCallback"]["text"], params, params.isInitialQueAsked);
        }
        /* When the start of the flow was from blacklisted but it's not the first time it is coming to blacklisted flow */
        else if (params.hasOwnProperty("blacklistedWelcome")) {
            message = formedResponse(dfResponses["greeting"]["invalidCallback"]["text"], params, params.blacklistedWelcome);
        }
        /* When the flow starts with blacklisted flow */
        else {
            params.blacklistedWelcome = true;
            if (params["apiResults"].configResult.client.csr.enabled) {
                df.setOutputContext(CONTEXTS.silentOption, OPLIFESPAN);
                payload = df._request.queryResult.fulfillmentMessages[1].payload.blacklistedAvayaPayload1;
            } else {
                payload = df._request.queryResult.fulfillmentMessages[1].payload.blacklistedAvayaPayload2;
            }
            let invalidAniResponse = dfResponses["greeting"]["invalidAni"]["text"];
            message = formedResponse(`${invalidAniResponse} ${dfResponses["greeting"]["invalidCallback"]["text"]}`, params);
        }
        df.setPayload(payload);
        df.setResponseText(message);
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/blacklist/welcome-blacklisted-number", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = welcomeBlacklistedNumber;