"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const locateMeClear = require("./locateme-clear");

/**
 * This is service to make send sms location api call
 *  @param {string} toNumber callback number
 *  @param {string} fromNumber number from which sms received
 *  @param {string} applicationName name of application
 *  @param {string} SMSBody link to be send in sms
 *  @return {object} formatted response of send sms location api
 */
module.exports = (toNumber, fromNumber, applicationName, SMSBody, dfSessionId, callIdSipHdrs) => {
    return new Promise(async (resolve, reject) => {
        try {
            let apiMeta = apiConfig.sendSMSLocation, responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${process.env.SENDSMSLOCATION_TOKEN || apiMeta.token}`
            };
            let body = {
                Is2Way: false,
                TimeToLiveInMinutes: 2,
                CallbackToken: dfSessionId,
                Body: SMSBody.replace("[Customer PhoneNumber]", toNumber),
                ToNumber: toNumber,
                FromNumber: fromNumber,
                ApplicationName: applicationName,
                OutboundStatusCallback: "",
                InboundResponseCallback: "",
                ReferenceNumber: toNumber
            };

            let requestData = {
                url: process.env.SENDSMSLOCATION_URL || apiMetaData.fetchApiUrl(apiMeta),
                headers,
                method: apiMeta.method,
                data: body
            };
            await locateMeClear(toNumber, dfSessionId, callIdSipHdrs);
            apiCaller(requestData, "send sms location", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data) {
                    if (res.data.IsSuccess === true) {
                        responseData.message = "send SMS location executed";
                        return resolve(apiResponse.successResponse(responseData));
                    }
                    else {
                        errorResponseData = {
                            message: res.data.Exceptions[0].Message ? res.data.Exceptions[0].Message : "some error occured in API"
                        };
                        return resolve(apiResponse.errorResponse(errorResponseData));
                    }
                }
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Send SMS Location - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Send SMS Location error", "API-sendSMSLocation", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.Exceptions[0].Message || "some error occured in API";
                }
                return resolve(apiResponse.errorResponse(errorResponseData, true)); //agent transfer flag true
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/send-sms-location", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};