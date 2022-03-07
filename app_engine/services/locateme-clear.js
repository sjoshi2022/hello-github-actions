"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");

/**
 * This is service to make locate me clear api call
 * @param {string} phoneNumber
 * @return {object} formatted response of locate me clear api
 */
module.exports = (phoneNumber, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.locateMeClear, responseData = {}, errorResponseData = {};
            let headers = {
                "Content-Type": "application/json",
                "Authorization": `${process.env.LOCATE_ME_CLEAR_TOKEN || apiMeta.token}`
            };
            let url = process.env.LOCATE_ME_CLEAR_URL || apiMetaData.fetchApiUrl(apiMeta);
            let requestData = {
                url: url.replace("[phoneNumber]", phoneNumber),
                headers,
                method: apiMeta.method
            };
            apiCaller(requestData, "locateMe clear", dfSessionId, callIdSipHdrs).then(res => {
                if (res.status && res.status === 200) {
                    responseData.data = res.data;
                    responseData.message = "Locate me clear api executed";
                    return resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: "Error in locate me clear"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }
            }).catch(err => {
                if (err.response && err.response.status && err.response.status == 401) {
                    logger.log("error", "Locate me clear - Unauthorized! Token missing", "Token-missing", { message: "Unauthorized", session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Locate me clear error", "API-locateme clear", { message: err, session: dfSessionId });
                    errorResponseData.message = "some error occured in locateMe-clear API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/locateme-clear", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};