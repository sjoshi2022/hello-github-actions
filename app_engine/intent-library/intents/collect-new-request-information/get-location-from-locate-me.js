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
const { LOCATE_ME_API_MAX_WAIT_TIME, OPLIFESPAN_ZERO, ONE_SECOND, CONTEXTS, OPLIFESPAN, PAUSE_TIME_VISUAL_PATH } = require("../../../helper/constants");
const { getLoggingParams } = require("../../../helper/get-logging-params");
const retrieveLocationDetails = require("../../../services/retreive-location-details");
const { response } = require("../../helper/responses");
const { setEndResponse } = require("../../../helper/set-end-response");
const { retryLimitExceeded } = require("../../../helper/retry-limit-checker");
const { weatherMessagingHelper } = require("../../helper/weather-messaging-helper");


/**
  * Send LocateMe SMS Fallback / No Input Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const getLocationFromLocateMe = async (df, params) => {
    try {
        let message;
        if (retryLimitExceeded(params, "getLocationFromLocateMeCounter", 5)) {
            await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
        } else {
            let loggingParams = getLoggingParams(df);
            let totalAPITime = 0;
            let retrieveLocationDetailsOutput;
            while (totalAPITime < LOCATE_ME_API_MAX_WAIT_TIME) {
                let iterationTimeDelay = 0;
                let startTime = Date.now();
                retrieveLocationDetailsOutput = await retrieveLocationDetails(params.callbackNumber, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
                let endTime = Date.now();
                let apiExecutionTime = parseInt(endTime - startTime);
                iterationTimeDelay = parseInt(ONE_SECOND - apiExecutionTime);
                if (iterationTimeDelay > 0) {
                    totalAPITime += parseInt(apiExecutionTime + iterationTimeDelay);
                } else {
                    totalAPITime += parseInt(apiExecutionTime);
                }
                if (retrieveLocationDetailsOutput.data && retrieveLocationDetailsOutput.success) {
                    break;
                }
                if (iterationTimeDelay > 0) {
                    await new Promise(resolve => setTimeout(function () { resolve(); }, iterationTimeDelay));
                }
            }

            if (retrieveLocationDetailsOutput.data && retrieveLocationDetailsOutput.success) {
                let locationDetails = retrieveLocationDetailsOutput.data;
                params.rsaPostDetails.streetAddress = `${locationDetails.streetNumber} ${locationDetails.street} ${locationDetails.addressLine1}`;
                params.rsaPostDetails.city = `${locationDetails.city}`;
                params.rsaPostDetails.state = `${locationDetails.state}`;
                params.rsaPostDetails.country = `US`;
                params.rsaPostDetails.zipCode = `${locationDetails.zip}`;
                params.rsaPostDetails.latitude = `${locationDetails.latitude}`;
                params.rsaPostDetails.longitude = `${locationDetails.longitude}`;

                // clear send locate me context
                df.setOutputContext(CONTEXTS.sendLocateMeSMSContext, OPLIFESPAN_ZERO);

                df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                //weather messaging message integration
                let weatherMessage = await weatherMessagingHelper(df, params);
                if (weatherMessage && weatherMessage !== "")
                    message = `${weatherMessage} <break time="${PAUSE_TIME_VISUAL_PATH}"/> ${params.apiResults.configResult.prompts.vivr.todayOrLater.text}`;
                else
                    message = params.apiResults.configResult.prompts.vivr.todayOrLater.text;
                df.setResponseText(response(message));
            } else {
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.locationLinkClick.text));
                let payload = df._request.queryResult.fulfillmentMessages[1].payload.NoInputPayload;
                df.setPayload(payload);
            }
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/get-location-from-locate-me", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = getLocationFromLocateMe;