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
const { EVENTS, CONTEXTS, OPLIFESPAN, INTENTS } = require("../../../../helper/constants");
const { towServiceRouteHelper } = require("../../../helper/tow-service-route");

/**
 * Vehicle Drivable Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const vehicleDrivable = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        switch (intentName) {
            case INTENTS.VehicleDrivableYes:
                params.rsaPostDetails.drivableOnceWinched = "Yes";
                df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN);
                df.setEvent(EVENTS.locationCollection);
                break;
            case INTENTS.VehicleDrivableNo:
                params.rsaPostDetails.serviceChange = `${params.rsaPostDetails.serviceTypeSelected} - `;
                params.rsaPostDetails.drivableOnceWinched = "No";
                return towServiceRouteHelper(df, params);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/vehicle-drivable", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = vehicleDrivable;