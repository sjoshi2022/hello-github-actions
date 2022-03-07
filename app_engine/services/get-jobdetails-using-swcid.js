"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiUtils = require("./api-utils/getEta");

/**
 * This is service to make a query for job details using swcId 
 * @param {number} swcId
 * @param {string} accessToken 
 * @return {object} formatted response of job details using swcId
 */
module.exports = (swcId, accessToken, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let responseData = {}, errorResponseData = {};

            let headers = {
                "Authorization": `${accessToken}`,
                "Content-Type": "application/json"
            };
            let query = `{
                job(swcid: ${swcId}) {
                    swcid
                    id
                    createdAt
                    status
                    service {
                        name
                        __typename
                    }
                    eta {
                        current
                    }
                    customer {
                        name
                        phone
                    }
                    location {
                        serviceLocation {
                            locationType
                            address
                        }
                    }
                    partner {

                        company {
                            name
                            phone
                        }
                    }
                }
            }`;
            let requestData = {
                url: process.env.CB_GRAPHQL_API_URL,
                headers,
                method: "POST",
                data: JSON.stringify({ query })
            };
            apiCaller(requestData, "get job details using swcid", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data.data && res.data.data.job) {
                    let calculatedETA = null;
                    if (res.data.data.job.eta && res.data.data.job.eta.current) {
                        //calculate the ETA with difference of currentETA and current GMT time
                        calculatedETA = apiUtils.getTimeDifference(res.data.data.job.eta.current);
                        if (!isNaN(calculatedETA)) {
                            responseData.data = {
                                ...res.data.data.job,
                                calculatedETA
                            };
                            resolve(apiResponse.successResponse(responseData));
                        } else {
                            responseData.data = {
                                ...res.data.data.job,
                                calculatedETA
                            };
                            responseData.message = "Invalid ETA calculated";
                            return resolve(apiResponse.successResponse(responseData));
                        }

                    } else {
                        responseData.data = {
                            ...res.data.data.job,
                            calculatedETA
                        };
                        responseData.message = "Invalid ETA provided";
                        return resolve(apiResponse.successResponse(responseData));
                    }
                } else {
                    let message;
                    if (res.data.errors) {
                        message = res.data.errors[0].message;
                    }
                    else {
                        message = "No job details found";
                    }
                    errorResponseData = {
                        message: message
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));
                }

            }).catch(err => {
                logger.log("error", "Get Job Details Using swcid error", "API-getJobDetailsUsingJobid", { message: err || "some error occured in API", session: dfSessionId });
                errorResponseData.message = err || "some error occured in API";
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", "Server error", "webhook/services/get-job-details-using-jobid", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};