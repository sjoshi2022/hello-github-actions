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
const { setSlotResponse } = require("../../../helper/set-slot-response");
const { EVENTS, CONTEXTS, OPLIFESPAN, PHONE_TYPES, CALL_TYPES, OPLIFESPAN_THREE } = require("../../../helper/constants");
const logger = require("../../../logger");
const { retryLimitExceeded } = require("../../../helper/retry-limit-checker");
const { setEndResponse } = require("../../../helper/set-end-response");
const { response } = require("../../helper/responses");


/**
  * Carrier Type Input Intent controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const carrierTypeInput = async (df, params) => {
    try {
        let dfResponsesFromConfig = params["apiResults"]["configResult"]["prompts"];
        let aniResult = params["apiResults"].aniResult;
        let carrierType = params.carrierType;
        let carrierName = "";
        let twilioResult = { carrierType, carrierName };

        if (params.hasOwnProperty("forLocateMeSMS") && params.forLocateMeSMS) {
            if (!carrierType || carrierType === "") {
                // carrierType is required - Checking with set slot response
                df.setOutputContext(CONTEXTS.askCarrierTypeFollowup, OPLIFESPAN);
                await setSlotResponse(df, params, "forLocateMeSMSCarrierType", dfResponsesFromConfig["greeting"]["twilioFailure"]["text"]);
            } else {
                params["apiResults"]["twilioResult"] = twilioResult;
                if (carrierType.toLowerCase() === PHONE_TYPES.mobile) {
                    params.callType = CALL_TYPES.newCall;
                    params.knownMaskedNumber = false;
                    params.numberConfirmed = true;
                    df.setOutputContext(CONTEXTS.sendLocateMeSMS, OPLIFESPAN_THREE);
                    df.setEvent(EVENTS.sendLocateMeSMS);
                } else if (carrierType.toLowerCase() === PHONE_TYPES.landline) {
                    df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                    df.setResponseText(response(params.apiResults.configResult.prompts.vivr.todayOrLater.text));
                }
            }
        }
        else if (params.hasOwnProperty("locateMeSMSFlow") && params.locateMeSMSFlow) {
            if (!carrierType || carrierType === "") {
                // carrierType is required - Checking with set slot response
                df.setOutputContext(CONTEXTS.askCarrierTypeFollowup, OPLIFESPAN);
                await setSlotResponse(df, params, "locateMeCarrierType", dfResponsesFromConfig["greeting"]["twilioFailure"]["text"]);
            } else {
                params["apiResults"]["twilioResult"] = twilioResult;
                if (carrierType.toLowerCase() === PHONE_TYPES.mobile) {
                    df.setOutputContext(CONTEXTS.locateMeFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.locateMeFlow);
                } else if (carrierType.toLowerCase() === PHONE_TYPES.landline) {
                    df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                    df.setResponseText(response(params.apiResults.configResult.prompts.vivr.todayOrLater.text));

                }
            }
        }
        //It will be routed directly to trigger SMS flow
        else if (params.hasOwnProperty("configPathNewCallbackNumber") && params.configPathNewCallbackNumber) {
            if (!carrierType || carrierType === "") {
                // carrierType is required - Checking with set slot response
                df.setOutputContext(CONTEXTS.askCarrierTypeFollowup, OPLIFESPAN);
                await setSlotResponse(df, params, "configPathCarrierType", dfResponsesFromConfig["greeting"]["twilioFailure"]["text"]);
            }
            else {
                params["apiResults"]["twilioResult"] = twilioResult;
                if (carrierType.toLowerCase() === PHONE_TYPES.landline) {
                    if (retryLimitExceeded(params, "newCallBackNumberLandlineRetry", 2)) {
                        await setEndResponse(df, params, dfResponsesFromConfig["visual"]["agentTransfer"]["text"], true);
                    } else {
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                        df.setEvent(EVENTS.welcomeBlacklistedNumber);
                    }
                } else if (carrierType.toLowerCase() === PHONE_TYPES.mobile) {
                    df.setOutputContext(CONTEXTS.triggerSms, OPLIFESPAN);
                    df.setEvent(EVENTS.triggerSms);
                }
            }
        }
        /* params.initialFlow = true when twilio fails at default welcome */
        else if (params.initialFlow) {
            if (!carrierType || carrierType === "") {
                // carrierType is required - Checking with set slot response
                df.setOutputContext(CONTEXTS.askCarrierTypeFollowup, OPLIFESPAN);
                await setSlotResponse(df, params, "initialCarrierType", dfResponsesFromConfig["greeting"]["twilioFailure"]["text"]);
            }
            else {
                /* Getting the carrier type and setting in twilio result */
                params["apiResults"]["twilioResult"] = twilioResult;
                if (carrierType.toLowerCase() === PHONE_TYPES.mobile) {
                    /* Going for configure message since it is mobile */
                    df.setOutputContext(CONTEXTS.config, OPLIFESPAN);
                    df.setEvent(EVENTS.configMessage);
                }
                else if (carrierType.toLowerCase() === PHONE_TYPES.landline) {
                    /* Asking for new callback number since it is landline */
                    params["isInitialQueAsked"] = true; // Set isInitialQueAsked isasked as true paarameter to check this parameter again after taking up callback number
                    params["playFullMessage"] = true;
                    df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                    df.setEvent(EVENTS.welcomeBlacklistedNumber);
                }
            }
        }
        else {
            /* params.initialFlow = false when twilio fails at new call back number confirmed intent */
            if (!carrierType || carrierType === "") {
                // carrierType is required
                df.setOutputContext(CONTEXTS.askCarrierTypeFollowup, OPLIFESPAN);
                await setSlotResponse(df, params, "laterCarrierType", dfResponsesFromConfig["greeting"]["twilioFailure"]["text"]);
            }
            else {
                /* Setting Twilio Result after taking carrier type parameter */
                params["apiResults"]["twilioResult"] = twilioResult;
                /* If Mobile - going further in flow */
                if (carrierType.toLowerCase() === PHONE_TYPES.mobile) {
                    params.knownMaskedNumber = false;
                    params.callbackNumber = params.newCallbackNumber;
                    params.numberConfirmed = true;
                    params.callType = CALL_TYPES.newCall;
                    if (params.hasOwnProperty("isInitialQueAsked") && params.isInitialQueAsked) {
                        /* No need to ask for open/new request */
                        df.setOutputContext(CONTEXTS.config, OPLIFESPAN);
                        df.setEvent(EVENTS.configMessage);
                    } else if (aniResult.openRequest === true) {
                        /* Need to ask if user is calling about current request or new request */
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                        df.setEvent(EVENTS.openRequest);
                    } else {
                        /* Asking about new request or something else */
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                        df.setEvent(EVENTS.newRequest);
                    }
                }
                else if (carrierType.toLowerCase() === PHONE_TYPES.landline) {
                    /* If user enters landline twice - Request On Call , else need to ask for number again */
                    if (retryLimitExceeded(params, "newCallBackNumberLandlineRetry", 2)) {
                        df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
                        df.setEvent(EVENTS.requestOnCall);
                    }
                    else {
                        df.setEvent(EVENTS.welcomeBlacklistedNumber);
                        df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                    }
                }
            }
        }
        df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/carrier-type-input", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = carrierTypeInput;