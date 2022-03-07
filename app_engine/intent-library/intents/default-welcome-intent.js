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

const { EVENTS, CALL_TYPES, PHONE_TYPES, CONTEXTS, REGIONS } = require("../../helper/constants");
const isValidNumber = require("../../helper/validate-phone-number").validatePhoneNumber;
const config = require("../../config")();
const logger = require("../../logger");
const configuration = require("../../services/configuration");
const aniSearch = require("../../services/ani-search");
const allowedAni = require("../../services/allowed-ani");
const twilioLookup = require("../../services/twilio-lookup");
const { setTwilioOutput } = require("../../helper/twilio-output-voip-setting");
const { setEndResponse } = require("../../helper/set-end-response");
const { setRegion } = require("../../helper/set-region");
const { getLoggingParams } = require("../../helper/get-logging-params");
const { response } = require("../helper/responses");

/**
 * Default Welcome Intent controller
 * @param {object} df webhook fulfillment object,
 * @param {object} params Global Parameters
 */
const defaultWelcomeIntent = async (df, params) => {
    try {
        /*
            Check Points:
            1. Call Configuration API and store responses in context
            2. Check for silentOptionEnabled
            3. Call Allowed ANI and change KnownMaskedNumber=true if MaskedNumber=true
            4. Call ANI Search and change callType=NewCall
        */

        let ani, vdn;
        let apiConfigurableData = df._request.queryResult.fulfillmentMessages[1].payload.apiData;
        let session = df._request.session.split("/").reverse()[0];
        logger.log("info", `session initiated - ${session} on ${process.env.NODE_ENVIRONMENT}`, "webhook/welcome-intent", { session: params.dfSessionID });

        let loggingParams = getLoggingParams(df);
        // get user's number from avaya telephony context
        let avayaSessionTelephoneContext = df.getContext(CONTEXTS.avayaSessionTelephone);
        let avayaSessionTelephoneParams = avayaSessionTelephoneContext && avayaSessionTelephoneContext.hasOwnProperty("parameters") ? avayaSessionTelephoneContext["parameters"] : {};
        if (avayaSessionTelephoneParams && avayaSessionTelephoneParams.hasOwnProperty("ani")) {
            ani = avayaSessionTelephoneParams["ani"].replace("+", "");
        } else {
            ani = apiConfigurableData["aniFromAvaya"];
        }

        // Check region
        if (avayaSessionTelephoneParams && avayaSessionTelephoneParams.hasOwnProperty("call_tag")) {
            process.env.REGION = setRegion(avayaSessionTelephoneParams["call_tag"], params);
        } else {
            process.env.REGION = REGIONS.dev;
            logger.log("warn", "Call tag not found", "webhook/region-info", null);
        }

        // get vdn from avaya telephony context
        if (["production", "staging", "development"].includes(process.env.NODE_ENVIRONMENT) && avayaSessionTelephoneParams && avayaSessionTelephoneParams["dnis"]) {
            vdn = avayaSessionTelephoneParams["dnis"].slice(-5); // vdn from Avaya
        } else {
            vdn = apiConfigurableData["vdn"]; // vdn for testing on dev an stg
        }

        // in case of webhook faliure, use above vdn
        params.transferNumber = vdn;

        logger.log("info", `Used VDN: ${vdn}`);

        let callbackNumber = ani;
        let callType = CALL_TYPES.newCall; // default value: NewCall
        let knownMaskedNumber = false;
        let numberConfirmed = false; // to check number is valid or not

        let configResult = {}, aniResult = {}, allowedAniResult = {}, twilioResult;
        let aaApiFailureAction, programCode, programSubCode;

        // Get Array of unidentifiedANIWords from secrets Ex: [ 'anonymous', 'restricted' ]
        let unidentifiedANIWordsArray = config.unidentifiedANIWords.split(",");

        let configApiOutput = await configuration(vdn, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);

        params.configApiOutput = configApiOutput.success; // Store the results of config api is success or fail
        if (configApiOutput.success === true) {
            // Configuration API result
            configResult = configApiOutput.data;
            aaApiFailureAction = configApiOutput.data.client.aaApiFailureAction;
            programCode = configApiOutput.data.client.programCode;
            programSubCode = configApiOutput.data.client.programSubCode;

            /* Validate ANI Checklist:
                1. ANI is blank/empty, if yes route to blacklisted flow
                2. ANI is one of the InvalidANIWords Ex: anonymous, restricted etc (Masked Numbers), if yes route to blacklisted flow
                3. If ANI is more than 10 digit, check and remove leading plus(+) or +1 or 1
                4. Is ANI a valid US number? Check using phoneRegex from config api
                Note: Edge Case: There are 2 invalid 10 digit numbers: 7378742833, 6282452253 will be banned by
                    new regex and will be marked as blacklisted in AllowedANI API
            */
            let phoneRegex = configResult["environment"]["phoneRegex"];

            if (typeof ani === "string") {
                ani = ani.toLowerCase()
            }

            if (ani.length === 11 && ani.charAt(0) === "1") {
                ani = ani.substring(1);
            }

            callbackNumber = ani;

            if (!ani || unidentifiedANIWordsArray.includes(ani) || !isValidNumber(ani, phoneRegex)) {
                // If ANI is blank/empty OR part of InvalidANIWordList Ex: anonymous etc. OR blacklisted number

                // store api results in context
                params["apiResults"] = {
                    configResult,
                    allowedAniResult,
                    aniResult,
                    twilioResult
                };

                params.ani = ani;
                params.callbackNumber = callbackNumber;
                params.programCode = programCode;
                params.programSubCode = programSubCode;
                params.vdn = vdn;
                params.aaApiFailureAction = aaApiFailureAction;
                params.callType = CALL_TYPES.newCall;
                params.knownMaskedNumber = true;
                params.numberConfirmed = false;

                df.setEvent(EVENTS.welcomeBlacklistedNumber);
                df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
                return df;
            }

            let apiResponses = await Promise.all([
                aniSearch(ani, programCode, loggingParams.dfSessionId, loggingParams.callIdSipHdrs),
                allowedAni(ani, programCode, programSubCode, "None", loggingParams.dfSessionId, loggingParams.callIdSipHdrs),
                twilioLookup(ani, loggingParams.dfSessionId, loggingParams.callIdSipHdrs)
            ]);

            let aniApiOutput = apiResponses[0];
            let allowedAniOutput = apiResponses[1];
            let twilioOutput = apiResponses[2];

            // no false response always success
            aniResult = aniApiOutput.data;

            if (allowedAniOutput.success === true) {
                allowedAniResult = allowedAniOutput.data;
            } else {
                if (aaApiFailureAction == "AcceptNumber") {
                    allowedAniResult = {
                        maskedNumber: false,
                        forcedMobile: false
                    };
                } else {
                    // AaApiFailureAction="TreatAsBlacklisted"|""|null
                    allowedAniResult = {
                        maskedNumber: true,
                        forcedMobile: false
                    };
                }
            }

            // CALL REGEX for VOIP and update 
            if (twilioOutput.success === true) {
                if (twilioOutput.data["carrierType"] === PHONE_TYPES.voip) {
                    let phoneTypeRegex = configResult["environment"]["phoneType"];
                    twilioOutput = setTwilioOutput(twilioOutput, phoneTypeRegex, df);
                }
                twilioResult = twilioOutput.data;
            }

            // store api results in context
            params["apiResults"] = {
                configResult,
                allowedAniResult,
                aniResult,
                twilioResult
            };

            if (!allowedAniResult.maskedNumber) {
                // the number user is calling from is not a blacklisted
                if (aniResult.openRequest) {
                    // open request within 24 hhr
                    knownMaskedNumber = false;
                    df.setEvent(EVENTS.openRequest);
                } else {
                    // no open request
                    knownMaskedNumber = false;
                    df.setEvent(EVENTS.newRequest);
                }
            } else {
                // the number user is calling from is blacklisted
                callType = CALL_TYPES.newCall;
                knownMaskedNumber = true;
                numberConfirmed = false;
                df.setEvent(EVENTS.welcomeBlacklistedNumber);
            }

            params.ani = ani;
            params.callbackNumber = callbackNumber;
            params.callType = callType;
            params.knownMaskedNumber = knownMaskedNumber;
            params.numberConfirmed = numberConfirmed;
            params.programCode = programCode;
            params.programSubCode = programSubCode;
            params.vdn = vdn;
            params.aaApiFailureAction = aaApiFailureAction;
            df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
        }
        else {
            // Config api failed, handle live agent transfer
            await setEndResponse(df, params);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/welcome-intent", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = defaultWelcomeIntent;
