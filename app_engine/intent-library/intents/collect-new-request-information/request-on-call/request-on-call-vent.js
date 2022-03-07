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

const logger = require("../../../../logger");
const { CONTEXTS, OPLIFESPAN, SERVICE_TYPE_ISSUES, DISABLEMENT_REASON } = require("../../../../helper/constants");
const { setSlotResponse } = require("../../../../helper/set-slot-response");
const { response } = require("../../../helper/responses");


/**
 * Request On Call Vent Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const requestOnCallVent = async (df, params) => {
    try {
        let message;
        if (!params.serviceTypeSelected) {
            if (params.hasOwnProperty("requestOnCallNoInputRetry") && params.requestOnCallNoInputRetry) params.requestOnCallNoInputRetry = 0;
            df.setOutputContext(CONTEXTS.requestOnCallFollowUp, 3);
            message = params.apiResults.configResult.prompts.vivr.serviceTypeRecognition.text;
            await setSlotResponse(df, params, "serviceTypeSelectedSlotRetry", message);
        } else {
            params.rsaPostDetails = {};
            let serviceTypeSelected = params.serviceTypeSelected;
            let disablementReason;
            if (serviceTypeSelected === SERVICE_TYPE_ISSUES.batteryService) {
                disablementReason = DISABLEMENT_REASON.jumpStartDefaultDidNotStall;
            } else if (serviceTypeSelected === SERVICE_TYPE_ISSUES.flatTireService) {
                disablementReason = DISABLEMENT_REASON.oneFlatTire;
            } else if (serviceTypeSelected === SERVICE_TYPE_ISSUES.towService) {
                disablementReason = DISABLEMENT_REASON.towNotLeakingFuel;
            } else if (serviceTypeSelected === SERVICE_TYPE_ISSUES.lockedOutService) {
                disablementReason = DISABLEMENT_REASON.lockoutKeysInCar;
            } else if (serviceTypeSelected === SERVICE_TYPE_ISSUES.fuelService) {
                disablementReason = DISABLEMENT_REASON.fuelService;
            } else if (serviceTypeSelected === SERVICE_TYPE_ISSUES.winchService) {
                disablementReason = DISABLEMENT_REASON.vehicleStuck;
            }
            params.rsaPostDetails.disablementReason = disablementReason;
            df.clearContext(CONTEXTS.requestOnCallFollowUp);
            df.setOutputContext(CONTEXTS.serviceTypeSelected, OPLIFESPAN);
            message = params.apiResults.configResult.prompts.vivr.serviceTypeCapture2.text;
            df.setResponseText(response(message.replace("<service type>", serviceTypeSelected)));
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/request-on-call-vent", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = requestOnCallVent;