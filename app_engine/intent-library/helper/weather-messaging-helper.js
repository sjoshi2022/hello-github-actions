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
const { WEATHER_MESSAGING_COLOR } = require("../../helper/constants");
const regionalEtaZip = require("../../services/regional-eta-zip");
const { getLoggingParams } = require("../../helper/get-logging-params");
const moment = require('moment');

/**
  * blacklist flow fallback helpers
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */

const weatherMessagingHelper = async (df, params) => {
    try {
        let regionalEtaZipColor, message;
        let configPrompts = params.apiResults.configResult.prompts;
        let loggingParams = getLoggingParams(df);
        let disablementLocationDateAndTime = moment().utc().format();
        params.disablementLocationDateAndTime = disablementLocationDateAndTime;
        params.weatherMessageCalled = true;

        if (params.rsaPostDetails.zipCode === "" || !params.rsaPostDetails.zipCode)
            message = "";
        else {
            let regionaEtaZipOutput = await regionalEtaZip(disablementLocationDateAndTime, params.rsaPostDetails.zipCode, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
            params.regionalEtaZipSuccess = regionaEtaZipOutput.success;
            if (regionaEtaZipOutput.success === true && regionaEtaZipOutput.data.color && regionaEtaZipOutput.data.color) {
                regionalEtaZipColor = regionaEtaZipOutput.data.color;
                params.regionaEtaZipColor = regionalEtaZipColor;
                if (regionalEtaZipColor === WEATHER_MESSAGING_COLOR.Black)
                    message = configPrompts.vivr.weatherMessageResponseBlack.text;
                else if (regionalEtaZipColor === WEATHER_MESSAGING_COLOR.Blue)
                    message = configPrompts.vivr.weatherMessageResponseBlue.text;
                else if (regionalEtaZipColor === WEATHER_MESSAGING_COLOR.Yellow)
                    message = configPrompts.vivr.weatherMessageResponseYellow.text;
                else
                    message = "";
            } else {
                message = "";
            }
        }
        return message;

    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/weahter-messaging-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { weatherMessagingHelper };
