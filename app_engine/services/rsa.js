"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const { setRSABody } = require("../helper/set-rsa-body");


/**
 * This is service to make rsa api call
 * @param {string} callbackNumber
 * @param {string} sourceSystem
 * @param {string} programCode
 * @param {string} programSubCode
 * @param {string} rsaPostDetails
 * @return {object} formatted response of rsa api
 */
module.exports = async (callbackNumber, sourceSystem, programCode, programSubCode, dfSessionId, callIdSipHdrs, rsaPostDetails = {}) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.rsa, responseData = {};

            let headers = {
                "x-apiKey": `${process.env.RSA_TOKEN || apiMeta.token}`,
                "Content-Type": "application/json",
                "x-agero-sourceSystem": sourceSystem,
                "x-agero-clientType": "ANY",
                "x-agero-programCode": programCode,
                "x-agero-programSubCode": programSubCode
            };
            let body = setRSABody(callbackNumber, rsaPostDetails, dfSessionId);
            let requestData = {
                url: process.env.RSA_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                data: body
            };
            apiCaller(requestData, "rsa", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data) {
                    responseData.data = {
                        ...res.data
                    };
                    return resolve(apiResponse.successResponse(responseData));
                }
            }).catch(err => {
                let errorResponseData = {};
                if (err.response.status == 401) {
                    logger.log("error", "Rsa api - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Rsa api error", "API-rsa", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/rsa", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};