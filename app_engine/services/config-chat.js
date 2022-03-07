"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const setConfigDetails = require("./api-utils/callback-api-url").setConfigDetails;
const logger = require("../logger");

/**
 * This is service to make config chat api call
 * @param {string} progCode
 * @return {object} formatted response of  super token, prompts, client and environment details
 */

module.exports = async (progCode, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${process.env.CB_CONFIG_CHAT_TOKEN}`
            };
            let params = {
                appName: process.env.CB_APPNAME,
                calltype: process.env.CB_CALLTYPE,
                platform: process.env.CB_PLATFORM,
                region: process.env.CB_REGION,
                progCode: progCode,
                loadClientConfig: process.env.CB_LOADCLIENTCONFIG
            };
            let requestData = {
                url: process.env.CB_CONFIG_CHAT_URL,
                headers,
                method: "GET",
                params
            };
            apiCaller(requestData, "config chat", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.Result) {
                    // get super token for graphQL APIs and set config api details
                    let superToken = setConfigDetails(res.data.Result.api);
                    let data = res.data.Result;
                    responseData.data = {
                        superToken,
                        client: data.client,
                        prompts: data.prompt,
                        environment: data.environment
                    };
                    return resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: "No result data found"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
                }
            }).catch(err => {
                if (err.response && err.response.status && err.response.status === 401) {
                    logger.log("error", "Config  chat api - Unauthorized", "Unauthorized Token", { message: err.response.data.fault.faultstring || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.fault.faultstring;

                } else {
                    logger.log("error", "Config chat api error", "API-config-chat", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data;
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); // send agent transfer flag true
            });
        } catch (err) {
            logger.log("error", "Server error", "webhook/sevices/config-chat", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};

