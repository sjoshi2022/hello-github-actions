/**
 * Copyright 2020 Quantiphi, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const apiConfig = require("../config/api-config").apiConfig;
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const { PLATFORM_ID } = require("../helper/constants");

/**
 * This is service to make command api call
 * @param {object} object having required params - sessionId, programCode, programSubCode, callbackNumber, vdn}
 * @param {String} dfSessionId Dialogflow session ID for logging
 * @param {String} callIdSipHdrs Call ID of Avaya for logging
 * @return {object} formatted response of session events api
 */
module.exports = ({ sessionId, programCode, programSubCode, callbackNumber, vdn }, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.command, responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${process.env.COMMAND_API_TOKEN || apiMeta.token}`,
                "Content-Type": "application/json"
            };
            let body = {
                sessionId: sessionId,
                programCode: programCode,
                programSubCode: programSubCode,
                callbackNumber: callbackNumber,
                vdn: vdn,
                correlationId: sessionId,
                platformId: PLATFORM_ID
            };
            let requestData = {
                url: process.env.COMMAND_API_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                data: body
            };
            apiCaller(requestData, "command api", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data) {
                    if (res.data.IsSuccess === true) {
                        responseData.data = res.data.Result.Commands;
                        responseData.message = "command api executed";
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
                    logger.log("error", "Command API - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Command API error", "API-CommandAPI", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.Exceptions[0].Message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/command-api", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};
