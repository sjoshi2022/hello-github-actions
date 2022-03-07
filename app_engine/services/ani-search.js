"use strict";

const apiCaller = require("./make-api-call").makeApiCall;
const apiConfig = require("../config/api-config").apiConfig;
const apiResponse = require("../helper/api-response-schema");
const logger = require("../logger");
const apiMetaData = require("../helper/api-meta-data");


/**
 * This is service to make ani search api call
 * @param {string} phoneNumber
 * @param {string} programCode
 * @return {object} formatted response of ani search api
 */

module.exports = (phoneNumber, programCode, dfSessionId, callIdSipHdrs) => {
    return new Promise((resolve, reject) => {
        let openRequest = false, responseData = {};
        try {
            let apiMeta = apiConfig.aniSearch;
            let url = process.env.ANI_SEARCH_URL || apiMetaData.fetchApiUrl(apiMeta);
            url = url.replace("{{phoneNumber}}", phoneNumber);

            let headers = {
                "Authorization": `${process.env.ANI_SEARCH_TOKEN || apiMeta.token}`,
                "x-agero-programCode": programCode
            };
            let requestData = {
                url,
                headers,
                method: apiMeta.method
            };
            apiCaller(requestData, "ani search", dfSessionId, callIdSipHdrs).then(res => {
                if (res.data) {
                    let data = res.data;
                    if (data.Result && data.Result.profiles.length > 0) {
                        let isActiveCall = res.data.Result.profiles[0].casedata.isActiveCall;
                        let insurancePolicyNumber = data.Result.profiles[0].insurancePolicyNumber;
                        let vinNumber = data.Result.profiles[0].vehicles[0].vin;
                        let licensePlateNumber = data.Result.profiles[0].vehicles[0].licensePlate;
                        if (insurancePolicyNumber === "null") insurancePolicyNumber = null;
                        if (vinNumber === "null") vinNumber = null;
                        if (licensePlateNumber === "null") licensePlateNumber = null;
                        if (isActiveCall) {
                            responseData.data = {
                                openRequest: isActiveCall,
                                caseId: data.Result.profiles[0].casedata.caseId,
                                eta: data.Result.profiles[0].casedata.remainingEta,
                                spName: data.Result.profiles[0].casedata.spName,
                                EtaAvailable: data.Result.profiles[0].casedata.etaAvailable,
                                policyNumber: insurancePolicyNumber,
                                firstName: data.Result.profiles[0].people[0].firstName,
                                lastName: data.Result.profiles[0].people[0].lastName,
                                vin: vinNumber,
                                carMake: data.Result.profiles[0].vehicles[0].make,
                                carModel: data.Result.profiles[0].vehicles[0].model,
                                carYear: data.Result.profiles[0].vehicles[0].year,
                                licensePlate: licensePlateNumber,
                                fuelType: data.Result.profiles[0].vehicles[0].fuelType
                            };
                        } else {
                            responseData.data = {
                                openRequest,
                                policyNumber: insurancePolicyNumber,
                                firstName: data.Result.profiles[0].people[0].firstName,
                                lastName: data.Result.profiles[0].people[0].lastName,
                                vin: vinNumber,
                                carMake: data.Result.profiles[0].vehicles[0].make,
                                carModel: data.Result.profiles[0].vehicles[0].model,
                                carYear: data.Result.profiles[0].vehicles[0].year,
                                licensePlate: licensePlateNumber,
                                fuelType: data.Result.profiles[0].vehicles[0].fuelType
                            };
                        }
                        responseData.message = "profile data found";
                    } else {
                        responseData.message = "No profile found";
                        responseData.data = { openRequest };
                    }
                }
                return resolve(apiResponse.successResponse(responseData));
            }).catch(err => {
                if (err.response.status == 401) {
                    logger.log("error", "Ani Search - Unauthorized! Token missing", "Token-missing", { message: err.response.data || err.response.statusText , session: dfSessionId});
                    responseData.message = "Unauthorized! Token missing";
                } else {
                    logger.log("error", "Ani Search error", "API-aniSearch", { message: err.response.data || err.response.statusText, session: dfSessionId });
                    responseData.message = err.response.data.Exceptions[0].Message || "some error occured in API";

                }
                responseData.data = {
                    openRequest: false,
                };
                return resolve(apiResponse.successResponse(responseData));
            });
        } catch (err) {
            logger.log("error", `Webhook call failed: ${err.message}`, "webhook/sevices/ani-search", { message: err, session: dfSessionId });
            reject(err);
        }
    });
};