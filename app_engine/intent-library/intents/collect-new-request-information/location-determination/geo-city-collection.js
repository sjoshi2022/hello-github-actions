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
const { CONTEXTS, OPLIFESPAN } = require("../../../../helper/constants");
const { geocodeApiCaller } = require("../../../helper/geocode-api-call-helper");
const { response } = require("../../../helper/responses");
const { retryLimitExceeded } = require("../../../../helper/retry-limit-checker");


/**
  * Geo City Collection Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const geoCityCollection = async (df, params) => {
    try {
        let city = params.city;
        if (!city) {
            if (retryLimitExceeded(params, "noCityGiven", 2)) {
                df.setOutputContext(CONTEXTS.geoStateCollection, OPLIFESPAN);
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureStateName.text));
            } else {
                df.setOutputContext(CONTEXTS.geoCityCollection, OPLIFESPAN_ONE);
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureCityName.text));
            }
        } else {
            params.rsaPostDetails.city = params.city;
            params.sysLocation.city = params.city;
            if (!params.sysLocation["admin-area"]) {
                df.setOutputContext(CONTEXTS.geoStateCollection, OPLIFESPAN);
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureStateName.text));
            } else {
                let addressObject = `${params.sysLocation["street-address"] || ""} ${params.sysLocation.city || ""} ${params.sysLocation["admin-area"] || ""} ${params.sysLocation.zipCode || ""}`;
                await geocodeApiCaller(df, params, addressObject);
            }
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/geo-city-collection", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = geoCityCollection;