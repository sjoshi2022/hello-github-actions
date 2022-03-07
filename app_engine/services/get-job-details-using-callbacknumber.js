"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiUtils = require("./api-utils/getEta");

/**
 * This is service to make query for job details using callbackNumber
 * @param {string} callbackNumber
 * @param {string} accessToken 
 * @return {object} formatted response of job details using callbackNumber
 */
module.exports = (callbackNumber, accessToken, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let responseData = {}, errorResponseData = {};

            let headers = {
                "Authorization": `${accessToken}`,
                "Content-Type": "application/json"
            };
            let query = `{
            jobs(filters: {query: "${callbackNumber}"}, states: All) {
            totalCount
            edges {
            node {
            swcid
            id
            createdAt
            status
            service{
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
            }
            }
            }`;
            let requestData = {
                url: process.env.CB_GRAPHQL_API_URL,
                headers,
                method: "POST",
                data: JSON.stringify({ query })
            };
            apiCaller(requestData, "get job details using callbackNumber", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data && res.data.data && res.data.data.jobs) {
                    let errorResponseData = {}, calculatedETA = null;
                    if (res.data.data.jobs.totalCount > 0) {
                        if (res.data.data.jobs.edges[0].node && res.data.data.jobs.edges[0].node.eta.current) {
                            // calculate the ETA with difference of currentETA and current GMT time
                            calculatedETA = apiUtils.getTimeDifference(res.data.data.jobs.edges[0].node.eta.current);
                            if (!isNaN(calculatedETA)) {
                                responseData.data = {
                                    ...res.data.data.jobs.edges[0].node,
                                    calculatedETA
                                };
                                resolve(apiResponse.successResponse(responseData));
                            } else {
                                responseData.data = {
                                    ...res.data.data.jobs.edges[0].node,
                                    calculatedETA
                                };
                                responseData.message = "Invalid ETA calculated";
                                return resolve(apiResponse.successResponse(responseData));
                            }
                        } else {
                            responseData.data = {
                                ...res.data.data.jobs.edges[0].node,
                                calculatedETA
                            };
                            responseData.message = "Invalid ETA provided";
                            return resolve(apiResponse.successResponse(responseData));
                        }
                    } else {
                        errorResponseData.message = "No job details found";
                        resolve(apiResponse.errorResponse(errorResponseData.message));
                    }
                } else {
                    let message;
                    if (res.data.errors) {
                        message = res.data.errors[0].message;
                    } else {
                        message = "No job details found";
                    }
                    errorResponseData = {
                        message: message
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));

                }

            }).catch(err => {
                logger.log("error", "Get Job Details Using callbackNumber error", "API-getJobDetailsUsingCallbackNumber", { message: err || "some error occured in API", session: dfSessionId });
                errorResponseData.message = err || "some error occured in API";
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/services/get-job-details-using-callbackNumber", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};