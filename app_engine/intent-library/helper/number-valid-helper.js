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

const { OPLIFESPAN, CONTEXTS, FLOW_NAMES } = require("../../helper/constants");
const { response } = require("./responses");
const logger = require("../../logger");


/**
  * Number valid helper - gets executed when the user provided number is valid and bot asks for confirmation on the number
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  * @param {String} callbackNumber phone number of user
  * @param {String} flow Confirming after NewCallbackNumberRequest (flow = FLOW_NAMES.requestFlow) or after NewCallbackNumberIncorrect (flow = FLOW_NAMES.incorrectFlow)
  */

const numberValidHelper = async (df, params, callbackNumber, flow) => {
    try {
        let payload, message;
        let dfResponses = params["apiResults"]["configResult"]["prompts"];

        /* Setting the outpur contexts, messages and payloads based on NewCallbackNumberRequest or NewCallbackNumberIncorrect flow */
        if (flow === FLOW_NAMES.incorrectFlow) {
            df.setOutputContext(CONTEXTS.newCallbackNumberFollowUp, OPLIFESPAN);
            payload = df._request.queryResult.fulfillmentMessages[1].payload.newCallbackIncorrectPayload;
        } else {
            payload = df._request.queryResult.fulfillmentMessages[1].payload.newCallbackNumberPayload;
        }
        df.setPayload(payload);

        /* Assigning Different bot prompts for Open Request Something else flow and blacklisted/landline flow */
        if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
            message = dfResponses["greeting"]["openRequestNumberConfirm"]["text"];
        } else {
            message = dfResponses["greeting"]["confirmNumber"]["text"];
        }
        message = message.replace("[callbackNumber]", "");
        df.setResponseText(response(`${message} <say-as interpret-as='telephone'> ${callbackNumber} </say-as>`));
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/number-valid-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { numberValidHelper };