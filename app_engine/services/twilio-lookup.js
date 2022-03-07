"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");
const config = require("../config/index")();

/**
 * This is service for making twilio lookup api call
 * @param {string} phoneNumber
 * @return {object} formatted response of twilio lookup api
 */
module.exports = async (phoneNumber, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let apiMeta = apiConfig.twilioLookup, responseData = {}, errorResponseData = {};
            let url = process.env.TWILIO_LOOKUP_URL || apiMetaData.fetchApiUrl(apiMeta);
            url = url.replace("{{phoneNumber}}", phoneNumber);
            let headers = {
                "Authorization": `${process.env.TWILIO_LOOKUP_TOKEN || apiMeta.token}`
            };
            let requestData = {
                url,
                headers,
                method: apiMeta.method,
                params: { Type: "carrier" }
            };
            apiCaller(requestData, "twilio lookup", dfSessionId, callIdSipHdrs).then(res => {
                //Tweaks for testing
                if ((process.env.NODE_ENVIRONMENT === "development" || process.env.NODE_ENVIRONMENT === "staging") && Object.keys(config.tweakedTwilioPhoneNumbers).includes(phoneNumber)) {
                    responseData.data = {
                        carrierType: config.tweakedTwilioPhoneNumbers[phoneNumber],
                        carrierName: `${config.tweakedTwilioPhoneNumbers[phoneNumber]} type no.`
                    };
                    return resolve(apiResponse.successResponse(responseData));
                }
                if (res.data && res.data.carrier && res.data.carrier.type) {
                    responseData.data = {
                        carrierType: res.data.carrier.type,
                        carrierName: res.data.carrier.name
                    };
                    return resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: "No carrier data found"
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Twilio Lookup - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Twilio Lookup error", "API-twilioLookup", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    errorResponseData.message = err.response.data.message || "some error occured in API";

                }
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/twilio-lookup", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};