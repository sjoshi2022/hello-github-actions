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
const { EVENTS, CONTEXTS, OPLIFESPAN, INTENTS, OPLIFESPAN_ONE } = require("../../../../helper/constants");
const retryLimitExceeded = require("../../../../helper/retry-limit-checker").retryLimitExceeded;
const { response } = require("../../../helper/responses");
const { setEndResponse } = require("../../../../helper/set-end-response");

/**
 * Capture License Plate Yes No Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const captureLicensePlateYesNo = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        switch (intentName) {
            case INTENTS.CaptureLicensePlateYes:
                df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN);
                df.setEvent(EVENTS.locationCollection);
                df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
                break;
            case INTENTS.CaptureLicensePlateNo:
                let queryText = df._request.queryResult.queryText ? true : false;
                if (retryLimitExceeded(params, "CaptureLicensePlateNoRetry", 2, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    df.setOutputContext(CONTEXTS.towServicefollowup, OPLIFESPAN_ONE);
                    df.setResponseText(response(params.apiResults.configResult.prompts.vivr.licensePlateRequest.text));
                }
                break;
        }

    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/capture-license-plate-correct", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = captureLicensePlateYesNo;