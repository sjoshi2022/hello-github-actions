"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const { VALUE_UNDEFINED } = require("../helper/constants");

/**
 * This is service to make retreive location details api call
 * @param {string} callbackNumber 
 * @return {object} formatted response of retreive location details api
 */
module.exports = (callbackNumber, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.retreiveLocationDetails, responseData = {}, errorResponseData = {};
            let url = process.env.RETREIVE_LOCATION_DETAILS_URL || apiMetaData.fetchApiUrl(apiMeta);
            url = url.replace("[phoneNumber]", callbackNumber);
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `${process.env.RETREIVE_LOCATION_DETAILS_TOKEN || apiMeta.token}`
            };
            let requestData = {
                url,
                headers,
                method: apiMeta.method
            };
            apiCaller(requestData, "retreive location details", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.customerNumber && res.data.customerNumber) {
                    let latitudeValue = res.data.latitude.Value;
                    let longitudeValue = res.data.longitude.Value;
                    let streetNumberValue = res.data.streetNumber.Value;
                    let streetValue = res.data.street.Value;
                    let addressLine1Value = res.data.addressLine1.Value;
                    let cityValue = res.data.city.Value;
                    let stateValue = res.data.state.Value;
                    let zipValue = res.data.zip.Value;
                    if (latitudeValue === VALUE_UNDEFINED) latitudeValue = "";
                    if (longitudeValue === VALUE_UNDEFINED) longitudeValue = "";
                    if (streetNumberValue === VALUE_UNDEFINED) streetNumberValue = "";
                    if (streetValue === VALUE_UNDEFINED) streetValue = "";
                    if (addressLine1Value === VALUE_UNDEFINED) addressLine1Value = "";
                    if (cityValue === VALUE_UNDEFINED) cityValue = "";
                    if (stateValue === VALUE_UNDEFINED) stateValue = "";
                    if (zipValue === VALUE_UNDEFINED) zipValue = "";

                    responseData.data = {
                        latitude: latitudeValue,
                        longitude: longitudeValue,
                        streetNumber: streetNumberValue,
                        street: streetValue,
                        addressLine1: addressLine1Value,
                        city: cityValue,
                        state: stateValue,
                        zip: zipValue
                    };
                    return resolve(apiResponse.successResponse(responseData));
                }
                else {
                    errorResponseData = {
                        message: res.data.Message ? res.data.Message : "some error occured in API"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Retreive Location Details - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Retreive Location Details error", "API-retreiveLocationDetails", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.Message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/retreive-location-details", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};