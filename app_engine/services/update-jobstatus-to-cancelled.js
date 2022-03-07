"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");

/**
 * This is service to update a job status to cancelled using job id
 * @param {string} jobId 
 * @param {string} accessToken
 * @return {object} formatted response of job status updated to cancelled
 */
module.exports = (jobId, accessToken, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        try {
            let responseData = {}, errorResponseData = {};
            let headers = {
                "Authorization": `${accessToken}`,
                "Content-Type": "application/json"
            };
            let query = `mutation UpdateJobStatus{
                    updateJobStatus(input: {job: {id: "${jobId}",
                    status: Canceled}}) {
                    job {
                    id
                    swcid
                    status
                    }
                    }
                    }`;
            let requestData = {
                url: process.env.CB_GRAPHQL_API_URL,
                headers,
                method: "POST",
                data: JSON.stringify({ query })
            };
            apiCaller(requestData, "update job status to cancelled", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data.data && res.data.data.updateJobStatus) {
                    responseData.data = {
                        ...res.data.data.updateJobStatus.job
                    };
                    resolve(apiResponse.successResponse(responseData));
                } else {
                    errorResponseData = {
                        message: res.data.errors[0].message
                    };
                    return resolve(apiResponse.errorResponse(errorResponseData));

                }

            }).catch(err => {
                logger.log("error", "update job status to cancelled error", "API-updateJobStatusToCancelled", { message: err || "some error occured in API", session: dfSessionId });
                errorResponseData.message = err || "some error occured in API";
                return resolve(apiResponse.errorResponse(errorResponseData));
            });
        } catch (err) {
            logger.log("error", "Server error", "webhook/services/update-jobstatus-to-cancelled", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};

