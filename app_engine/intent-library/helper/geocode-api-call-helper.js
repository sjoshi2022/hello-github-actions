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
const geocodeApi = require("../../services/geo-code");
const { getLoggingParams } = require("../../helper/get-logging-params");
const { response } = require("../helper/responses");
const { CONTEXTS, OPLIFESPAN_THREE } = require("../../helper/constants");
const { locateMeSMSFlowHelper } = require("./locate-me-sms-flow-helper");


/**
 * Helper function to call GeoCode API
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {String} event Event which is triggered 
 * @param {String} addressObject combined address string
 */
const geocodeApiCaller = async (df, params, addressObject) => {
    try {
        let loggingParams = getLoggingParams(df);
        let geocodeResult = await geocodeApi(addressObject, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
        if (!geocodeResult.success || geocodeResult.data.length > 1 || geocodeResult.data.length === 0) {
            params.geoCodeResultSuccess = geocodeResult.success;
            if (geocodeResult.success && geocodeResult.data.length != 1) {
                params.geocodeResultLength = geocodeResult.data.length;
            }
            return await locateMeSMSFlowHelper(df, params);
        } else {
            let geocodeApiComponents = geocodeResult.data[0];
            let { streetAddress, city, state, country, zipCode } = addressExtraction(geocodeApiComponents["address_components"]);
            let latitude = geocodeApiComponents.geometry.location.lat;
            let longitude = geocodeApiComponents.geometry.location.lng;
            params.sysLocation["street-address"] = streetAddress;
            params.rsaPostDetails.streetAddress = streetAddress;
            params.sysLocation["admin-area"] = state;
            params.rsaPostDetails.state = state;
            params.sysLocation.city = city;
            params.rsaPostDetails.city = city;
            params.sysLocation.country = country;
            params.rsaPostDetails.country = country;
            params.sysLocation.zipCode = zipCode;
            params.rsaPostDetails.zipCode = zipCode;
            params.rsaPostDetails.latitude = latitude;
            params.rsaPostDetails.longitude = longitude;

            let message = params.apiResults.configResult.prompts.vivr.locationCapture.text;
            message = message.replace("<street details>", params.sysLocation["street-address"]);

            if (params.sysLocation.city) {
                message = message.replace("<town>", params.sysLocation.city);
            } else {
                message = message.replace("in <town>", "");
            }

            if (params.sysLocation['admin-area']) {
                message = message.replace("<state>", params.sysLocation['admin-area']);
            } else {
                message = message.replace("<state>", "");
            }

            if (params.sysLocation.zipCode) {
                message = message.replace("<zipcode>", `<say-as interpret-as="verbatim"> ${params.sysLocation.zipCode}</say-as>`);
            } else {
                message = message.replace("at zipcode <zipcode>", "");
            }
            df.setOutputContext(CONTEXTS.locationCollectionFollowup, OPLIFESPAN_THREE);
            df.setResponseText(response(message));
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/geocode-api-call-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

const addressExtraction = (addressComponents) => {
    let address = {};
    address.streetAddress = "";
    addressComponents.filter(component => {
        if (component.types.includes("street_number") && component["long_name"]) {
            address.streetAddress += ` ${component["long_name"]}` || "";
        } else if (component.types.includes("sublocality") && component["long_name"]) {
            address.streetAddress += ` ${component["long_name"]}` || "";
        } else if (component.types.includes("locality") && component["long_name"]) {
            address.streetAddress += ` ${component["long_name"]}` || "";
        } else if (component.types.includes("route") && component["long_name"]) {
            address.streetAddress += ` ${component["long_name"]}` || "";
        } else if (component.types.includes("administrative_area_level_3") && component["long_name"]) {
            address.streetAddress += ` ${component["long_name"]}` || "";
        } else if (component.types.includes("administrative_area_level_2") && component["long_name"]) {
            address.city = component["long_name"];
        } else if (component.types.includes("administrative_area_level_1") && component["long_name"]) {
            address.state = component["long_name"];
        } else if (component.types.includes("country") && component["long_name"]) {
            address.country = component["long_name"];
        } else if (component.types.includes("postal_code") && component["long_name"]) {
            address.zipCode = component["long_name"];
        }
    });
    return address;
}

module.exports = { geocodeApiCaller };