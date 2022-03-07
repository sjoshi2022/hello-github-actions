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
const { CONTEXTS, EVENTS, OPLIFESPAN_THREE, CLIENT_TYPES } = require("../../helper/constants");
const { setEndResponse } = require("../../helper/set-end-response");


/**
 * Helper function to determine if vin or policy is present in ani Result or not
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {String} event Event which is triggered 
 */
const vinPolicyConfirmationRouteHelper = async (df, params) => {
    try {
        let aniResults = params.apiResults.aniResult;
        if ((!aniResults.policyNumber && !aniResults.vin) || (params.apiResults.configResult.client.clientType === CLIENT_TYPES.insurance && !aniResults.policyNumber) || (params.apiResults.configResult.client.clientType === CLIENT_TYPES.oem && !aniResults.vin)) {
            let message = params.apiResults.configResult.prompts.vivr.agentTransferDetailsValidation.text;
            return await setEndResponse(df, params, message);
        } else {
            df.setOutputContext(CONTEXTS.vinPolicyConfirm, OPLIFESPAN_THREE);
            df.setEvent(EVENTS.vinPolicyConfirm);
        }
        df.setResponseText(response(df._request.queryResult.fulfillmentMessages[0].text.text[0]));
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/vin-policy-confirmation-route-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { vinPolicyConfirmationRouteHelper };


