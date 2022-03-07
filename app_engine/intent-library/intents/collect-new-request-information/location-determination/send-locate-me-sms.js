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

const logger = require("../../../../logger");
const { getLoggingParams } = require("../../../../helper/get-logging-params");
const locateMeSMSApi = require("../../../../services/send-sms-location");
const { response } = require("../../../helper/responses");
const { setEndResponse } = require("../../../../helper/set-end-response");


/**
  * Send Locate Me SMS Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const sendLocateMeSMS = async (df, params) => {
    try {
        let fromNumber, smsBody;
        let environmentEnv;
        if (process.env.NODE_ENVIRONMENT === "production") {
            environmentEnv = "prod";
        } else {
            environmentEnv = "stg";
        }
        fromNumber = params.apiResults.configResult.environment.smsLocation[`${environmentEnv}`].fromNumber;
        smsBody = params.apiResults.configResult.environment.smsLocation[`${environmentEnv}`].body;

        let loggingParams = getLoggingParams(df);
        let toNumber = params.callbackNumber;
        let applicationName = params.apiResults.configResult.environment.appName;

        let location = await locateMeSMSApi(toNumber, fromNumber, applicationName, smsBody, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
        if (!location.success) {
            await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
        } else {
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.locationLinkClick.text));
            let payload = df._request.queryResult.fulfillmentMessages[1].payload.NoInputPayload;
            df.setPayload(payload);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/send-locate-me-sms", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = sendLocateMeSMS;