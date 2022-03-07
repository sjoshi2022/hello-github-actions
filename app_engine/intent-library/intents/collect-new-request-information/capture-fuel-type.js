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

const logger = require("../../../logger");
const { EVENTS, CONTEXTS, OPLIFESPAN, SERVICE_TYPE_ISSUES, OPLIFESPAN_THREE, INTENTS, FUEL_TYPES, DISABLEMENT_REASON } = require("../../../helper/constants");
const { setSlotResponse } = require("../../../helper/set-slot-response");
const { response } = require("../../helper/responses");
const { towServiceRouteHelper } = require("../../helper/tow-service-route");

/**
  * Capture Fuel Type Intent Controller
  * @param {object} df webhook fulfillment object
  * @param {object} params Global Parameters
  */
const captureFuelType = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        let fuelType = params.fuelType;
        if (!fuelType) {
            df.setOutputContext(CONTEXTS.batteryServiceFlowFollowup, OPLIFESPAN);
            let message = params.apiResults.configResult.prompts.vivr.fuelType.text;
            await setSlotResponse(df, params, "fuelTypeSlotRetry", message);
        }
        params.rsaPostDetails.fuelType = `${fuelType}`;
        if (fuelType.toLowerCase() !== FUEL_TYPES.electric) {
            switch (intentName) {
                case INTENTS.CaptureVehicleFuel:
                    params.rsaPostDetails.disablementReason = DISABLEMENT_REASON.outOfFuelCostNotCovered;
                    df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN_THREE);
                    df.setEvent(EVENTS.locationCollection);
                    break;

                case INTENTS.CaptureFuelType:
                    df.setResponseText(response(params.apiResults.configResult.prompts.vivr.jumpStartConfirmation.text));
                    df.setOutputContext(CONTEXTS.jumpStart, OPLIFESPAN);
                    break;
            }
        }
        else {
            params.rsaPostDetails.serviceChange = `${params.rsaPostDetails.serviceTypeSelected} - `;
            params.rsaPostDetails.serviceTypeSelected = SERVICE_TYPE_ISSUES.towService;
            params.rsaPostDetails.disablementReason = DISABLEMENT_REASON.towNotLeakingFuel;
            return towServiceRouteHelper(df, params);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/capture-fuel-type", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = captureFuelType;