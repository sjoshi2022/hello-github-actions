"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const { PLATFORM } = require("../helper/constants");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");


/**
 * This is service for making volume migration api call
 * @param {string} callbackNumber
 * @param {string} appName
 * @param {string} programCode
 * @param {string} programSubCode
 * @return {*} formatted response for volume migration api 
 */
module.exports = async (callbackNumber, appName, programCode, programSubCode, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.volumeMigration;
            let responseData = {}, errorResponseData = {};

            let headers = {
                Authorization: `${process.env.VOLUME_MIGRATION_TOKEN || apiMeta.token}`
            };
            let params = {
                CallbackNumber: callbackNumber,
                AppName: appName,
                ProgramCode: programCode,
                ProgramSubCode: programSubCode
            };
            let requestData = {
                url: process.env.VOLUME_MIGRATION_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                params
            };
            apiCaller(requestData, "volume migration", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.Result) {
                    responseData.data = {
                        platform: res.data.Result.Platform || PLATFORM.oneRoad,
                        areaCode: res.data.Key.AreaCode
                    };
                    return resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: "No platform data found"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }

            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Volume Migration - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Volume Migration error", "API-volumeMigration", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.fault.faultstring || "some error occured in API";
                }
                logger.log("error", "Agero api error", "API-volumeMigration", { message: err.response.data || err.response.statusText, session: dfSessionId });
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/volume-migration", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};
