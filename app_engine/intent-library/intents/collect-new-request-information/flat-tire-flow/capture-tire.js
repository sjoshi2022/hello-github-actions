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
const { CONTEXTS, OPLIFESPAN } = require("../../../../helper/constants");
const { setSlotResponse } = require("../../../../helper/set-slot-response");
const { response } = require("../../../helper/responses");

/**
 * Capture Tire to Attend Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const captureTireToAttend = async (df, params) => {
    try {
        let tiretoattend = params.tiretoattend;
        if (!tiretoattend) {
            df.setOutputContext(CONTEXTS.capturetire, OPLIFESPAN);
            message = response(params.apiResults.configResult.prompts.vivr.whichTyre.text);
            await setSlotResponse(df, params, "tiretoattendSlotRetry", message);
        } else {
            df.setOutputContext(CONTEXTS.sparetire, OPLIFESPAN);
            df.setResponseText(response(params.apiResults.configResult.prompts.vivr.spareTyre.text));
        }
        params.rsaPostDetails.tiretoattend = tiretoattend;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/capture-tire", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = captureTireToAttend;