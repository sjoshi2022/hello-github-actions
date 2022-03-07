"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const config = require("../config/index")();

/**
 * This is service to make Allowed Ani Api call
 * @param {string} ani 
 * @param {string} programCode 
 * @param {string} programSubCode 
 * @param {string} [returnList="None"]
 * @return {object} formatted response of allowed ani
 */
module.exports = (ani, programCode, programSubCode, returnList = "None", dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.allowedAni, responseData = {}, errorResponseData = {};

            let headers = {
                "Authorization": `${process.env.ALLOWED_ANI_TOKEN || apiMeta.token}`
            };
            let params = {
                ANI: ani,
                ProgramCode: programCode,
                ProgramSubCode: programSubCode,
                ReturnList: returnList,

            };
            let requestData = {
                url: process.env.ALLOWED_ANI_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                params
            };
            apiCaller(requestData, "allowed ani", dfSessionId, callIdSipHdrs).then(res => {
                //Tweaks for testing
                if ((process.env.NODE_ENVIRONMENT === "development") && Object.keys(config.tweakedAllowedAniPhoneNumbers).includes(ani)) {
                    responseData.data = {
                        maskedNumber: false,
                        forcedMobile: config.tweakedAllowedAniPhoneNumbers[ani]
                    };
                    return resolve(apiResponse.successResponse(responseData));
                }
                if (res.data && res.data.Result) {
                    responseData.data = {
                        maskedNumber: res.data.Result.MaskedNumber,
                        forcedMobile: res.data.Result.ForcedMobile
                    };
                    resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: "No result data found"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));

                }

            }).catch(err => {
                if (err.response.status == 403) {
                    logger.log("error", "Allowed Ani - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";

                } else {
                    logger.log("error", "Allowed Ani error", "API-allowedAni", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Invalid Request. ANI missing or invalid.";
                }
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/services/allowed-ani", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};