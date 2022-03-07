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

const { validateVoip } = require("./voip-validation");
const { PHONE_TYPES } = require("./constants");
const logger = require("../logger");


/**
  * Method to set twilio output for voip number as mobile or landline
  * @param {Object} twilioOutput twilioOutput Result from API 
  * @param {String} phoneTypeRegex phone type regex from config api
  * @param {String} df the fullfillment object used to communicate with dialogflow
  */
const setTwilioOutput = (twilioOutput, phoneTypeRegex, df) => {

    try {
        let twilioCarrierType = twilioOutput.data["carrierType"];
        let twilioCarrierName = twilioOutput.data["carrierName"];

        /* CarrierType+CarrierName has to be sent for VOIP Validation and accordingly, set as mobile (if true from voip validation), else landline */
        let typePlusName = `${twilioCarrierType.toLowerCase()}${twilioCarrierName.toLowerCase()}`;
        let typeResult = validateVoip(typePlusName, phoneTypeRegex);
        if (typeResult) {
            twilioOutput.data["carrierType"] = PHONE_TYPES.mobile;
        } else {
            twilioOutput.data["carrierType"] = PHONE_TYPES.landline;
        }
        return twilioOutput;
    } catch (err) {
        logger.log("error", `Set twilio ouput logic failed: ${err.message}`, "helper/twilio-output-voip-setting", { "message": err, session: df._request.session.split("/").reverse()[0] });
        throw err;
    }
};

module.exports = { setTwilioOutput };
