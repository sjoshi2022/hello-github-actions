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

const logger = require("../../logger");
const { response } = require("./responses");
const { CONTEXTS, OPLIFESPAN_ONE, SERVICE_TYPE_ISSUES, DISABLEMENT_REASON } = require("../../helper/constants");


/**
 * Helper function to route to tow service
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {String} event Event which is triggered 
 */
const towServiceRouteHelper = async (df, params) => {
    try {
        params.rsaPostDetails.serviceTypeSelected = SERVICE_TYPE_ISSUES.towService;
        params.rsaPostDetails.disablementReason = DISABLEMENT_REASON.towNotLeakingFuel;
        params.rsaPostDetails.serviceChange += `${params.rsaPostDetails.serviceTypeSelected}`;

        // Routes to user with vehicle thereafter moves to Tow service depending on the condition
        df.setOutputContext(CONTEXTS.userwithvehicle, OPLIFESPAN_ONE);
        let message = params.apiResults.configResult.prompts.vivr.withVehicle.text;
        df.setResponseText(response(message));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/tow-service-route", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { towServiceRouteHelper };


