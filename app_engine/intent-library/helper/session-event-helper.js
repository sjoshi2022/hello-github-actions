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

const sessionEvent = require("../../services/session-event");
const logger = require("../../logger");
const { getLoggingParams } = require("../../helper/get-logging-params");

/**
  * Response helper for new & open request
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  * @param {String} eventType Event to be passed in session API
  * @param {Boolean} returnFullResult
  */
const sessionEventHelper = async (df, params, eventType, returnFullResult = false) => {
    try {
        let sessionId = df._request.session.split("/").reverse()[0];
        let sessionEventApiParams = {
            sessionId: sessionId,
            programCode: params.programCode,
            programSubCode: params.programSubCode || "",
            callbackNumber: params.callbackNumber,
            vdn: params.vdn,
            eventType: eventType
        };

        let loggingParams = getLoggingParams(df);

        // session api with initiate event 
        let sessionEventApiOutput = await sessionEvent(sessionEventApiParams, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
        if (returnFullResult) {
            return sessionEventApiOutput;
        } else {
            return sessionEventApiOutput.success;
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/session-event-helper", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { sessionEventHelper };
