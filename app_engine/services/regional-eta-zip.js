"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");

/**
 * This is service for making regional eta zip api call
 * @param {string} disablementLocationDateTime
 * @param {string} zipcode
 * @return {*} formatted response for regional eta zip  api 
 */
module.exports = async (disablementLocationDateTime, zipcode, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.regionalEtaZip;
            let responseData = {}, errorResponseData = {};

            let headers = {
                "x-apikey": `${process.env.REGIONAL_ETA_ZIP_TOKEN || apiMeta.token}`
            };
            let params = {
                disablementLocationDateTime: disablementLocationDateTime,
                zipcode: zipcode
            };
            let requestData = {
                url: process.env.REGIONAL_ETA_ZIP_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                params
            };
            apiCaller(requestData, "regional eta zip", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.ETAEventInfo && res.data.ETAEventInfo.Color) {
                    responseData.data = {
                        color: res.data.ETAEventInfo.Color
                    };
                    return resolve(apiResponse.successResponse(responseData));
                } else {
                    responseData.data = {
                        color: null
                    };
                    return resolve(apiResponse.successResponse(responseData));
                }

            }).catch(err => {
                if (err.response && err.response.status && err.response.status == 401) {
                    logger.log("error", "Regional Eta Zip - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Regional Eta Zip error", "API-regionalEtaZip", { message: err.response.data || err.response.statusText, session: dfSessionId});
                    errorResponseData.message = err.response.data || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error",  `Webhook call failed: ${err.message}`, "webhook/sevices/regional-eta-zip", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};