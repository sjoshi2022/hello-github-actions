"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const { PLATFORM_ID } = require("../helper/constants");

/**
 * This is service to makesession events api call
 * @param {object} object having required params - sessionId, programCode, callbackNumber, vdn, eventType}
 * @return {object} formatted response of session events api
 */
module.exports = ({ sessionId, programCode, programSubCode, callbackNumber, vdn, eventType }, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.sessionEvent, responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${process.env.SESSION_EVENT_TOKEN || apiMeta.token}`
            };
            let body = {
                sessionId: sessionId,
                programCode: programCode,
                programSubCode: programSubCode,
                callbackNumber: callbackNumber,
                vdn: vdn,
                event: eventType,
                platformId: PLATFORM_ID,
                correlationId: sessionId
            };

            let requestData = {
                url: process.env.SESSION_EVENT_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                data: body
            };
            apiCaller(requestData, "session events", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data) {
                    if (res.data.IsSuccess === true) {
                        responseData.data = {};
                        responseData.data = res.data.Result.Commands;
                        responseData.message = "session event executed";
                        return resolve(apiResponse.successResponse(responseData));
                    }
                    else {
                        errorResponseData = {
                            message: res.data.Exceptions[0].Message || "some error occured in API"
                        };
                        return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
                    }
                }
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Session Event - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Session Event error", "API-sessionEvent", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.Exceptions[0].Message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/session-event", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};