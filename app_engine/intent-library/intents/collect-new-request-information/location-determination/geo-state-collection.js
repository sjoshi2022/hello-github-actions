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
const { geocodeApiCaller } = require("../../../helper/geocode-api-call-helper");
const { response } = require("../../../helper/responses");
const { retryLimitExceeded } = require("../../../../helper/retry-limit-checker");
const { locateMeSMSFlowHelper } = require("../../../helper/locate-me-sms-flow-helper");


/**
  * Geo State Collection Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const geoStateCollection = async (df, params) => {
    try {
        let state = params.state;
        if (!state) {
            if (retryLimitExceeded(params, "noStateGiven", 2)) {
                if (params.sysLocation["street-address"] && (params.sysLocation.city || params.sysLocation.zipCode)) {
                    // geoCode API
                    let addressObject = `${params.sysLocation["street-address"] || ""} ${params.sysLocation.city || ""} ${params.sysLocation["admin-area"] || ""} ${params.sysLocation.zipCode || ""}`;
                    await geocodeApiCaller(df, params, addressObject);
                } else {
                    return await locateMeSMSFlowHelper(df, params);
                }
            } else {
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureStateName.text));
            }
        } else {
            params.rsaPostDetails.state = params.state;
            params.sysLocation["admin-area"] = params.state;
            let addressObject = `${params.sysLocation["street-address"] || ""} ${params.sysLocation.city || ""} ${params.sysLocation["admin-area"] || ""} ${params.sysLocation.zipCode || ""}`;
            await geocodeApiCaller(df, params, addressObject);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/geo-state-collection", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = geoStateCollection;