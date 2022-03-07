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


const logger = require("../logger");

/**
 * Set body for RSA API
 * @param {object} callbackNumber 
 * @param {object} rsaPostDetails 
 * @param {object} dfSessionId
 */
const setRSABody = (callbackNumber, rsaPostDetails, dfSessionId) => {
    try {
        let body, serviceDetails = "";
        if (rsaPostDetails.serviceTypeSelected)
            serviceDetails += `\nService Type: ${rsaPostDetails.serviceTypeSelected}`;
        if (rsaPostDetails.serviceTime)
            serviceDetails += `\nTime Requested: ${rsaPostDetails.serviceTime}`;
        if (rsaPostDetails.jumpStartAttempted)
            serviceDetails += `\nJump Start Attempted: ${rsaPostDetails.jumpStartAttempted}`;
        if (rsaPostDetails.hasGoodSpareTire)
            serviceDetails += `\nHas Good Spare Tire: ${rsaPostDetails.hasGoodSpareTire}`;
        if (rsaPostDetails.flatTires)
            serviceDetails += `\nNumber of Flat Tires: ${rsaPostDetails.flatTires}`;
        if (rsaPostDetails.tiretoattend)
            serviceDetails += `\nTire Flat: ${rsaPostDetails.tiretoattend}`;
        if (rsaPostDetails.isKeyAccessible)
            serviceDetails += `\nIs Vehicle Key Accessible: ${rsaPostDetails.isKeyAccessible}`;
        if (rsaPostDetails.winchable)
            serviceDetails += `\nWinchable: ${rsaPostDetails.winchable}`;
        if (rsaPostDetails.drivableOnceWinched)
            serviceDetails += `\nVehicle Drivable Once Winched: ${rsaPostDetails.drivableOnceWinched}`;
        if (rsaPostDetails.serviceChange)
            serviceDetails += `\nService Change: ${rsaPostDetails.serviceChange}`;

        body = {
            "requestor": {
                "name": {
                    "firstName": `${rsaPostDetails.firstName || ""}`,
                    "lastName": `${rsaPostDetails.lastName || ""}`,
                    "middleInitial": ""
                },
                "callbackNumber": callbackNumber
            },
            "profile": {
                "insurancePolicyNumber": `${rsaPostDetails.policyNumber || null}`,
                "name": {
                    "firstName": `${rsaPostDetails.firstName || ""}`,
                    "lastName": `${rsaPostDetails.lastName || ""}`,
                    "middleInitial": ""
                },
                "contactInfo": {
                    "address": {
                        "streetAddress1": "",
                        "streetAddress2": "",
                        "city": "",
                        "state": "",
                        "country": "",
                        "zip": ""
                    },
                    "addressType": "",
                    "phoneNumber": "",
                    "phoneType": ""
                }
            },
            "disablementLocation": {
                "address": {
                    "streetAddress1": `${rsaPostDetails.streetAddress || ""}`,
                    "streetAddress2": "",
                    "city": `${rsaPostDetails.city || ""}`,
                    "state": `${rsaPostDetails.state || ""}`,
                    "country": `${rsaPostDetails.country || ""}`,
                    "zip": `${rsaPostDetails.zipCode || ""}`
                },
                "geographicalCoordinates": {
                    "latitude": `${rsaPostDetails.latitude || null}`,
                    "longitude": `${rsaPostDetails.longitude || null}`
                },
                "locationType": `${rsaPostDetails.locationType || ""}`,
                "customerAtLocation": `${rsaPostDetails.customerAtLocation || ""}`
            },
            "towDestination": {
                "destinationBusinessName": "",
                "destinationType": "",
                "address": {
                    "streetAddress1": "",
                    "streetAddress2": "",
                    "city": "",
                    "state": "",
                    "country": "",
                    "zip": ""
                },
                "geographicalCoordinates": {
                    "latitude": null,
                    "longitude": null
                }
            },
            "vehicle": {
                "make": `${rsaPostDetails.make || ""}`,
                "model": `${rsaPostDetails.model || ""}`,
                "year": `${rsaPostDetails.year || null}`,
                "licensePlate": `${rsaPostDetails.licensePlateNumber || null}`,
                "mileage": "",
                "vin": `${rsaPostDetails.vin || null}`,
                "color": "",
                "fuelType": `${rsaPostDetails.fuelType || ""}`,
            },
            "notificationPreferences": {
                "preferredMode": "",
                "emailId": "",
                "textMessageNumber": null,
                "primaryPhoneNumber": null
            },
            "serviceDetails": {
                "disablementReason": `${rsaPostDetails.disablementReason || ""}`,
                "comments": [
                    {
                        "value": serviceDetails
                    },
                    {
                        "value": ""
                    }
                ]
            }
        };
        return body;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "webhook/helper/set-rsa-body", { "message": err, session: dfSessionId });
        throw err;
    }
};

module.exports = { setRSABody };