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
const { INTENTS } = require("../../../../helper/constants");
const { setEndResponse } = require("../../../../helper/set-end-response");
const { response } = require("../../../helper/responses");


/**
 * Vehicle Stuck Flow Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const vehicleStuckFlow = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        switch (intentName) {
            case INTENTS.VehicleStuckFlowYes:
                params.rsaPostDetails.winchable = "No";
                await setEndResponse(df, params, params["apiResults"]["configResult"]["prompts"]["visual"]["agentTransfer"]["text"]);
                df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
                break;
            case INTENTS.VehicleStuckFlowNo:
                params.rsaPostDetails.winchable = "Yes";
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.driveVehicle2.text));
                break;
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/vehicle-stuck-flow", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = vehicleStuckFlow;