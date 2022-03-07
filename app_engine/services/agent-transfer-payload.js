"use strict";

const volumeMigration = require("./volume-migration");
const rsa = require("./rsa");
const logger = require("../logger");
const { RSAPI_STRING, ONEROAD_SIP_HEADER_VALUE, PLATFORM, CALL_TYPES } = require("../helper/constants");


/**
 * This method is used to generate sip header using rsa request ID
 * @param {string} rsaRequestId
 * @return {string} ascii request ID for "VDC with RSA"
 */
const asciiRequestID = (rsaRequestId, dfSessionId) => {
    const rsapiStr = RSAPI_STRING;
    let generatedAsciiRequestID;
    if (typeof rsaRequestId === "string") {
        generatedAsciiRequestID = rsapiStr + rsaRequestId.split("").map(item => `3${item}`).join("");
    } else {
        generatedAsciiRequestID = rsapiStr + rsaRequestId;
    }
    logger.log("info", "agent transfer", "webhook/agent-transfer-payload", { "generatedAsciiRequestID": generatedAsciiRequestID, "session": dfSessionId });
    return generatedAsciiRequestID;
};


/**
 * This method is used to generate ascii for the callback number
 * @param {string} callbackNumber
 * @return {string} ascii callback number
 */
const asciiCallbackNumber = (callbackNumber) => {
    if (typeof callbackNumber === "string") {
        return callbackNumber.split("").map(item => `3${item}`).join("");
    }
    return callbackNumber;
};


/**
 * helper function to generate hex encoded string for the given value
 * @param {object} value 
 * @return {number}
 */
const getHex = (value) => {
    let hex = "";
    for (let n = 0; n < value.length; n++) {
        hex += Number(value.charCodeAt(n)).toString(16);
    }
    return hex;
};


/**
 * This method is used to generate CTINameValuePairs string and encode them using getHEx method
 * @param {object} ctxParams context params 
 * @return {string} encoded CTINameValuePairs string
 */
const getCTINameValuePairs = (ctxParams, dfSessionId) => {
    let nameValuePairs = `CCID:${ctxParams.callbackNumber},KMN:${ctxParams.knownMaskedNumber},NC:${ctxParams.numberConfirmed}`;
    logger.log("info", "agent transfer", "webhook/agent-transfer-payload", { "getCTINameValuePairs": nameValuePairs, "session": dfSessionId });
    let encodedNameValuePairs = getHex(nameValuePairs);
    return encodedNameValuePairs;
};


/**
 * Main method used to generate agent transfer payload
 * @param {object} ctxParams context params
 * @return {object} sip headers
 */
module.exports.getAgentPayload = async (ctxParams, dfSessionId, callIdSipHdrs) => {
    try {
        let sipHeader, vmData, rsaData;
        // check if rsaPostDetails are present and then make api calls
        if (ctxParams.rsaPostDetails && ctxParams.rsaPostDetails && ctxParams.callType === CALL_TYPES.newCall) {
            [vmData, rsaData] = await Promise.all([
                volumeMigration(ctxParams.callbackNumber, ctxParams.sourceSystem, ctxParams.programCode, ctxParams.programSubCode, dfSessionId, callIdSipHdrs),
                // Appending _VDC to source system for rsa API which may change in future
                rsa(ctxParams.callbackNumber, ctxParams.sourceSystemForRSA, ctxParams.programCode, ctxParams.programSubCode, dfSessionId, callIdSipHdrs, ctxParams.rsaPostDetails)
            ]);
        }
        // check if rsa api needs to be called and make api calls
        else if (ctxParams.callType === CALL_TYPES.newCall && ctxParams.callbackNumber !== ctxParams.ani
            && !ctxParams.hasOwnProperty("rsaID") && !ctxParams["rsaID"]) {
            [vmData, rsaData] = await Promise.all([
                volumeMigration(ctxParams.callbackNumber, ctxParams.sourceSystem, ctxParams.programCode, ctxParams.programSubCode, dfSessionId, callIdSipHdrs),
                // Appending _VDC to source system for rsa API which may change in future
                rsa(ctxParams.callbackNumber, ctxParams.sourceSystemForRSA, ctxParams.programCode, ctxParams.programSubCode, dfSessionId, callIdSipHdrs)]);
        } else {
            vmData = await volumeMigration(ctxParams.callbackNumber, ctxParams.sourceSystem, ctxParams.programCode, ctxParams.programSubCode, dfSessionId, callIdSipHdrs);
        }

        if (ctxParams.hasOwnProperty("rsaID") && ctxParams.rsaID) {
            rsaData = {};
            rsaData.success = true;
            rsaData.data = {};
            rsaData.data.rsaRequestId = ctxParams.rsaID;
        }
        // if no platform found take it from the config api - ctxParams
        const platform = vmData.data.platform || ctxParams.destinationPlatform;

        // logic to generate sip headers
        if (ctxParams.callType === CALL_TYPES.newCall) {
            // logic to identify VDC format
            if (platform === PLATFORM.ngp) {
                sipHeader = getCTINameValuePairs(ctxParams, dfSessionId);
            } else {
                // if callback != ani and rsa api successful
                if (ctxParams.callbackNumber !== ctxParams.ani && rsaData && rsaData.success) {
                    sipHeader = asciiRequestID(rsaData.data.rsaRequestId, dfSessionId);
                } else if (rsaData && rsaData.success) {
                    sipHeader = asciiRequestID(rsaData.data.rsaRequestId, dfSessionId);
                } else {
                    // if RSA API fails or callback == ani, follow "VDC without RSA ID"
                    sipHeader = ONEROAD_SIP_HEADER_VALUE;
                }
            }
        } else {
            sipHeader = asciiCallbackNumber(ctxParams.callbackNumber);
        }

        // calculate vdn based on platform and calltype
        let vdn = ctxParams.configVdn[platform][ctxParams.callType];
        return { sipHeader, vdn };
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "webhook/services/agent-transfer-payload", { message: err, session: dfSessionId });
        throw (err);
    }
};
