"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");

/**
 * This is service to make geo code api call
 * @param {string} address
 * @return {object} formatted response of geo code api
 */
module.exports = (address, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.geoCode, responseData = {}, errorResponseData = {};
            let headers = {
                "Content-Type": "application/json"
            };
            let params = {
                address: address,
                key: `${process.env.GEOCODE_TOKEN || apiMeta.token}`
            };

            let requestData = {
                url: process.env.GEOCODE_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                params
            };
            apiCaller(requestData, "geo code", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.results && res.data.results && (res.data.status === "OK" || res.data.status === "ZERO_RESULTS")) {
                    responseData.data = res.data.results;
                    return resolve(apiResponse.successResponse(responseData));
                }
                else {
                    errorResponseData = {
                        message: res.data.error_message
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Geo code - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Geo Code error", "API-geoCode", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.error_message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/geo-code", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};