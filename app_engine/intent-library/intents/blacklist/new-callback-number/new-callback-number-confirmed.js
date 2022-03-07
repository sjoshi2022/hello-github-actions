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

const { EVENTS, PHONE_TYPES, CONTEXTS, CALL_TYPES, OPLIFESPAN, OPLIFESPAN_THREE, OPLIFESPAN_ONE } = require("../../../../helper/constants");
const logger = require("../../../../logger");
const aniSearch = require("../../../../services/ani-search");
const allowedAni = require("../../../../services/allowed-ani");
const twilioLookup = require("../../../../services/twilio-lookup");
const { setEndResponse } = require("../../../../helper/set-end-response");
const { retryLimitExceeded } = require("../../../../helper/retry-limit-checker");
const { setTwilioOutput } = require("../../../../helper/twilio-output-voip-setting");
const { trimAni } = require("../../../../helper/trim-ani");
const { response } = require("../../../helper/responses");
const { resetBlacklistCounters } = require("../../../helper/reset-blacklist-counters");
const { getLoggingParams } = require("../../../../helper/get-logging-params");


/**
* New Callback Number Confirmed Intent controller
* @param {object} df webhook fulfillment object
* @param {object} params Global Parameters
*/
const newCallbackNumberConfirmed = async (df, params) => {
    try {
        let dfResponses = params["apiResults"]["configResult"]["prompts"];
        let callbackNumber = params.callbackNumber;
        let newCallbackNumber = params.newCallbackNumber;
        let callType = params.callType;
        let knownMaskedNumber = params.knownMaskedNumber;
        let numberConfirmed = params.numberConfirmed;
        let programCode = params.programCode;
        let programSubCode = params.programSubCode;
        let aaApiFailureAction = params.aaApiFailureAction;

        /* Trmming ANI of any special symbols and extra country code */
        newCallbackNumber = trimAni(newCallbackNumber);
        params.newCallbackNumber = newCallbackNumber;
        let aniResult = {}, allowedAniResult = {}, twilioResult;

        let loggingParams = getLoggingParams(df);

        // Call Blacklisted, Twilio and ANI API for the new number.
        let apiResponses = await Promise.all([
            aniSearch(newCallbackNumber, programCode, loggingParams.dfSessionId, loggingParams.callIdSipHdrs),
            allowedAni(newCallbackNumber, programCode, programSubCode, "None", loggingParams.dfSessionId, loggingParams.callIdSipHdrs),
            twilioLookup(newCallbackNumber, loggingParams.dfSessionId, loggingParams.callIdSipHdrs)
        ]);
        let aniApiOutput = apiResponses[0];
        let allowedAniOutput = apiResponses[1];
        let twilioOutput = apiResponses[2];

        // no false response always success
        aniResult = aniApiOutput.data;

        // check allowed ani output
        if (allowedAniOutput.success === true) {
            allowedAniResult = allowedAniOutput.data;
        } else {
            if (aaApiFailureAction == "AcceptNumber") {
                allowedAniResult = {
                    maskedNumber: false,
                    forcedMobile: false
                };
            } else {
                // AaApiFailureAction = "TreatAsBlacklisted"|""|null
                allowedAniResult = {
                    maskedNumber: true,
                    forcedMobile: false
                };
            }
        }
        // check twilio output
        if (twilioOutput.success == true) {
            if (twilioOutput.data["carrierType"] === PHONE_TYPES.voip) {
                let phoneTypeRegex = params["apiResults"]["configResult"]["environment"]["phoneType"];
                twilioOutput = setTwilioOutput(twilioOutput, phoneTypeRegex, df);
            }
            twilioResult = twilioOutput.data;
        }

        // update the API results
        params["apiResults"] = {
            configResult: params["apiResults"].configResult,
            allowedAniResult,
            aniResult,
            twilioResult
        };
        if (allowedAniResult.maskedNumber) {
            if (retryLimitExceeded(params, "blacklistedEnteredRetry", 2)) {
                await setEndResponse(df, params, dfResponses["visual"]["agentTransfer"]["text"], true);
            } else {
                // Blacklisted - Ask for Number again
                knownMaskedNumber = allowedAniResult.maskedNumber;
                if (numberConfirmed) {
                    numberConfirmed = false;
                }
                if (params.landlineflow || twilioResult.carrierType.toLowerCase() === PHONE_TYPES.landline || twilioResult.carrierType.toLowerCase() === PHONE_TYPES.voip) {
                    df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_ONE);
                    // TO DO : To update from config api (IVA-XXX)
                    df.setResponseText(response("Could you provide me a valid landline number for us to help you further?"));
                } else {
                    callbackNumber = params.newCallbackNumber;
                    df.setEvent(EVENTS.welcomeBlacklistedNumber);
                    df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                }
            }
        } else {
            knownMaskedNumber = false;
            callbackNumber = params.newCallbackNumber;
            numberConfirmed = true;
            callType = CALL_TYPES.newCall;
            // Open Request ETA flow
            if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
                callType = CALL_TYPES.callback;
                /* Resetting all the counters */
                params.openRequestNewCallbackNumber = false;
                params.openRequestNewCallNumber = 0;
                params = await resetBlacklistCounters(params);
                df.setOutputContext(CONTEXTS.openRequestFollowup, OPLIFESPAN);
                df.setEvent(EVENTS.openRequestEta);
            } else if (!twilioResult && !allowedAniResult.forcedMobile) {
                // Not-blacklisted/Whitelisted
                /* Twilio failed and not whitelisted */
                params.initialFlow = false;
                df.setOutputContext(CONTEXTS.askCarrierType, OPLIFESPAN);
                df.setEvent(EVENTS.askCarrierType);
                return df;
            } else if (!allowedAniResult.maskedNumber && twilioResult.carrierType.toLowerCase() === PHONE_TYPES.landline) {
                /* Device type was landline and checking for Landline Retry - Transfer if second time landline entered or ask for number again */
                if (retryLimitExceeded(params, "newCallBackNumberLandlineRetry", 3)) {
                    // Agent transfer, if device type is landline for 2 consecutive landline input
                    return await setEndResponse(df, params, dfResponses["visual"]["agentTransfer"]["text"], true);

                    // Comment Request on call flow after 2 time landline number inputted by user
                    // df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
                    // df.setEvent(EVENTS.requestOnCall);
                } else {
                    if (aniResult.openRequest === true) {
                        /*  open request */
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                        df.setEvent(EVENTS.openRequest);
                    } else if (params.configpathchecked) {
                        // If number is asked again in hook options
                        df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
                        df.setEvent(EVENTS.requestOnCall);
                    } else {
                        /* no open request */
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                        df.setEvent(EVENTS.newRequest);
                    }
                }
            } else if (allowedAniResult.maskedNumber && twilioResult.carrierType.toLowerCase() === PHONE_TYPES.landline) {
                df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup, OPLIFESPAN_ONE);
                // TO DO : To update from config api (IVA-XXX)
                df.setResponseText(response("Could you provide me a valid landline number for us to help you further?"));
            } else if (params.hasOwnProperty("forLocateMeSMS") && params.forLocateMeSMS) {
                df.setOutputContext(CONTEXTS.sendLocateMeSMS, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.sendLocateMeSMS);
            } else if (params.hasOwnProperty("configPathNewCallbackNumber") && params.configPathNewCallbackNumber) {
                //It will be routed directly to trigger SMS flow
                df.setOutputContext(CONTEXTS.triggerSms, OPLIFESPAN);
                df.setEvent(EVENTS.triggerSms);
            } else if (params.hasOwnProperty("isInitialQueAsked") && params.isInitialQueAsked) {
                // Config path ask number
                /* When the flow entered from new/open request and directly has to go for confire Message */
                df.setOutputContext(CONTEXTS.config, OPLIFESPAN);
                df.setEvent(EVENTS.configMessage);
            } else if (aniResult.openRequest === true) {
                /* Flow Entered through blacklisted and open request */
                df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                df.setEvent(EVENTS.openRequest);
            } else {
                /* Flow Entered through blacklisted and no open request */
                df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                df.setEvent(EVENTS.newRequest);
            }
            params.callbackNumber = callbackNumber;
            params.callType = callType;
            params.knownMaskedNumber = knownMaskedNumber;
            params.numberConfirmed = numberConfirmed;

            df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/blacklist/new-callback-number-confirmed", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = newCallbackNumberConfirmed;
