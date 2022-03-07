"use strict";

const axios = require("axios");
const logger = require("../logger");
/**
 * External Http call place holder
 *
 * @param {object} request request object
 * @return {object} response object 
 */
module.exports.makeApiCall = async (request, apiName, dfSessionId, callIdSipHdrs) => {
    let apiPayloadDetails = {
        apiUrl: request.url,
        headers: request.headers,
        methodType: request.method,
        sessionId: dfSessionId,
        callId: callIdSipHdrs
    };
    if (request.params) {
        apiPayloadDetails["queryParams"] = request.params;
    }
    if (request.data) {
        apiPayloadDetails["body"] = request.data;
    }

    try {
        let startTime = Date.now();
        // make api call
        let responseObj = await axios.default.request(request);
        let endTime = Date.now();
        if (responseObj) {
            apiPayloadDetails["apiResult"] = responseObj.data;
            let apiExeutionTime = `${(endTime - startTime) / 1000}`;
            apiPayloadDetails["apiExeutionTime"] = `${apiExeutionTime}s`;
            apiPayloadDetails["apiExecutionStatusCode"] = responseObj.status;
            if (parseInt(apiExeutionTime) > 8) logger.log("warn", `API execution time is ${apiExeutionTime} seconds`, `apiDetails/${apiName}`, { session: dfSessionId });
        }
        //logging only last 4 digits of AuthTokenv Value
        if (apiPayloadDetails.headers["Authorization"]) {
            apiPayloadDetails.headers["Authorization"] = apiPayloadDetails.headers["Authorization"].substring(apiPayloadDetails.headers["Authorization"].length - 4);
        }
        // log api call details
        logger.log("info", `API Payload Info: ${apiName}`, `apiDetails/${apiName}`, apiPayloadDetails);
        return responseObj;
    } catch (err) {
        //logging only last 4 digits of AuthTokenv Value
        if (apiPayloadDetails.headers["Authorization"]) {
            apiPayloadDetails.headers["Authorization"] = apiPayloadDetails.headers["Authorization"].substring(apiPayloadDetails.headers["Authorization"].length - 4);
        }
        apiPayloadDetails["apiExecutionStatusCode"] = err.response.status;
        apiPayloadDetails["errorDetails"] = err.response.data || err.response.statusText || err.response;
        logger.log("error", `API Payload Error: ${apiName}. Error msg: ${err.message}`, `apiDetails/${apiName}`, apiPayloadDetails);
        throw err;
    }
};
