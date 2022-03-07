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
const { CONTEXTS, OPLIFESPAN_ONE, MORE } = require("../../../../helper/constants");
const { setSlotResponse } = require("../../../../helper/set-slot-response");
const { response } = require("../../../helper/responses");
const { towServiceRouteHelper } = require("../../../helper/tow-service-route");

/**
 * Tires Impacted Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const tiresImpacted = async (df, params) => {
    try {
        let tires = params.tires;
        if (!tires) {
            df.setOutputContext(CONTEXTS.flatTireFlowFollowup, OPLIFESPAN_ONE);
            let message = params.apiResults.configResult.prompts.vivr.tyresImpacted.text;
            await setSlotResponse(df, params, "tiresSlotRetry", message);
        }
        params.rsaPostDetails.flatTires = tires;
        if (Number(tires[0]) > 1 || tires[0] === MORE) {
            params.rsaPostDetails.serviceChange = `${params.rsaPostDetails.serviceTypeSelected} - `;
            return towServiceRouteHelper(df, params);
        }
        else {
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.whichTyre.text));
            df.setOutputContext(CONTEXTS.capturetire, OPLIFESPAN_ONE);
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/tires-impacted", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = tiresImpacted;