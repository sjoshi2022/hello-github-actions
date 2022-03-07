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


/**
 * Locked Out Flow Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const lockedOut = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        switch (intentName) {
            case INTENTS.LockedOutFlowYes:
                params.rsaPostDetails.isKeyAccessible = "Yes";
                break;
            case INTENTS.LockedOutFlowNo:
                params.rsaPostDetails.isKeyAccessible = "No";
                break;
        }
        df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN);
        df.setEvent(EVENTS.locationCollection);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/locked-out", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = lockedOut;