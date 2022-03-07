"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");

/**
 * This is service to make session event chat api call* 
 * @param {string} programCode
 * @param {string} callbackNumber
 * @return {object} formatted response of session event chat api
 */
module.exports = (programCode, callbackNumber, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${process.env.CB_SESSION_EVENT_CHAT_TOKEN}`
            };
            let body = {
                programCode: programCode,
                callbackNumber: callbackNumber,
                smsToSend: true
            };
            let requestData = {
                url: process.env.CB_SESSION_EVENT_CHAT_URL,
                headers,
                method: "POST",
                data: body
            };
            apiCaller(requestData, "session event chat", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.trackingId) {
                    responseData.data = {
                        ...res.data
                    };
                    responseData.message = "session event  chat executed";
                    return resolve(apiResponse.successResponse(responseData));
                }
                else {
                    errorResponseData = {
                        message: res.data.Exceptions[0].Message || "some error occured in API"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }

            }).catch(err => {
                if (err.response && err.response.status && err.response.status === 401) {
                    logger.log("error", "Session Event Chat - Unauthorized! Token missing", "Token-missing", { message: err.response.data.fault.faultstring || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.fault.faultstring || "some error occured in API";
                } else {
                    logger.log("error", "Session Event Chat error", "API-sessionEventChat", { message: err.response.data.Exceptions[0].Message || "some error occured in API", session: dfSessionId });
                    errorResponseData.message = err.response.data.Exceptions[0].Message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", "Server error", "webhook/sevices/session-event-chat", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};
