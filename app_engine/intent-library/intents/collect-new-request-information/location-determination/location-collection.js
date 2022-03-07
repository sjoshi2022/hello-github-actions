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
const { CONTEXTS, OPLIFESPAN, OPLIFESPAN_THREE } = require("../../../../helper/constants");
const { geocodeApiCaller } = require("../../../helper/geocode-api-call-helper");
const { response } = require("../../../helper/responses");
const { retryLimitExceeded } = require("../../../../helper/retry-limit-checker");
const { locateMeSMSFlowHelper } = require("../../../helper/locate-me-sms-flow-helper");


/**
  * Location Collection & Sys Location Collection Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const locationCollection = async (df, params) => {
    try {
        let streetAddress, city, zipCode, state;
        let sysLocation = params.sysLocation;
        if (sysLocation) {
            streetAddress = params.sysLocation["street-address"];
            city = params.sysLocation.city;
            zipCode = params.sysLocation.zipCode;
            state = params.sysLocation["admin-area"];
        }
        if (!sysLocation || !streetAddress) {
            if ((!sysLocation && retryLimitExceeded(params, "noAddressGiven", 2))
                || (sysLocation && !streetAddress && retryLimitExceeded(params, "noStreetGiven", 2))) {
                return await locateMeSMSFlowHelper(df, params);
            }
            df.setOutputContext(CONTEXTS.sysLocationCollection, OPLIFESPAN);
            df.clearContext(CONTEXTS.locationConfirmation);
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.requestingLocationToCapture.text));
            return df;
        } else if (!city) {
            params.rsaPostDetails.streetAddress = params.sysLocation["street-address"]
            df.setOutputContext(CONTEXTS.geoCityCollection, OPLIFESPAN);
            df.clearContext(CONTEXTS.locationConfirmation);
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureCityName.text));
            return df;
        } else if (!state) {
            params.rsaPostDetails.streetAddress = params.sysLocation["street-address"];
            params.rsaPostDetails.city = city;
            df.setOutputContext(CONTEXTS.geoStateCollection, OPLIFESPAN);
            df.clearContext(CONTEXTS.locationConfirmation);
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.captureStateName.text));
            return df;
        }

        params.rsaPostDetails.streetAddress = params.sysLocation["street-address"];
        params.rsaPostDetails.city = params.sysLocation.city;
        params.rsaPostDetails.state = params.sysLocation["admin-area"];
        params.rsaPostDetails.zipCode = params.sysLocation.zipCode;
        df.setOutputContext(CONTEXTS.locationCollectionFollowup, OPLIFESPAN_THREE);
        let addressObject = `${params.sysLocation["street-address"] || ""} ${params.sysLocation.city || ""} ${params.sysLocation["admin-area"] || ""} ${params.sysLocation.zipCode || ""}`;
        await geocodeApiCaller(df, params, addressObject);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/location-collection", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = locationCollection;