"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const { CONFIG_API_PARAMS } = require("../helper/constants");
const setapiEnvironment = require("./api-urls").setapiEnvironment;
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");


module.exports = async (vdn, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.config, responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${apiMeta.token}`
            };
            let params = {
                ...CONFIG_API_PARAMS, // contains config api static params - appName, calltype, platform
                region: process.env.REGION,
                vdn: vdn,
                loadClientConfig: true
            };
            let requestData = {
                url: process.env.CONFIG_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                params
            };
            apiCaller(requestData, "config", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.Result) {
                    //set api creds in env
                    setapiEnvironment(res.data.Result.api);
                    let data = res.data.Result;
                    responseData.data = {
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
                if (err.response.status == 403) {
                    logger.log("error", "Config api - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText , session: dfSessionId});
                    errorResponseData.message = "Unauthorized! Token missing";

                } else {
                    logger.log("error", "Config api error", "API-config", { message: err.response.data || err.response.statusText , session: dfSessionId});
                    errorResponseData.message = err.response.data.Exceptions[0].Message;
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); // send agent transfer flag true
            });

        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/configuration", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};
