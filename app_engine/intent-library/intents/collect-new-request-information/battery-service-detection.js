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
const { EVENTS, CONTEXTS, OPLIFESPAN_ONE, INTENTS, SERVICE_TYPE_ISSUES, DISABLEMENT_REASON, OPLIFESPAN } = require("../../../helper/constants");
const { response } = require("../../helper/responses");

/**
 * Battery Service detection Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const batteryServiceDetection = async (df, params) => {

    try {
        const intentName = df._request.queryResult.intent.displayName;
        switch (intentName) {
            case INTENTS.BatteryServiceYes:
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.driveVehicle.text));
                df.setOutputContext(CONTEXTS.vehicleStuck, OPLIFESPAN_ONE);
                break;
            case INTENTS.BatteryServiceNo:
                params.rsaPostDetails.serviceTypeSelected = SERVICE_TYPE_ISSUES.batteryService;
                params.rsaPostDetails.disablementReason = DISABLEMENT_REASON.jumpStartDefaultDidNotStall;
                df.setEvent(EVENTS.immediateOrLaterEvent);
                df.setOutputContext(CONTEXTS.serviceTypeSelected, OPLIFESPAN);
                df.setResponseText(df._request.queryResult.fulfillmentMessages[0].text.text[0]);
                break;
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/battery-service-detection", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = batteryServiceDetection;