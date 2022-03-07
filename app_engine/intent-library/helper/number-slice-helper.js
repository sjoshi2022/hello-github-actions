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
const { PAUSE_TIME_VISUAL_PATH } = require("../../helper/constants");

/**
  * It slices the ANI number to last four digit and sends out modifed response by replacing it in response
  * @param {object} params The global context object used to store parameters
  * @param {string} message The message to be replaced
  * @param {object} payload Tweaks for dev & stage
  */
const configSliceNumber = (params, message, payload = null) => {
    try {
        let number = (params.callbackNumber).slice(-4);
        if (process.env.NODE_ENVIRONMENT === "development" || process.env.NODE_ENVIRONMENT === "staging") {
            if (payload && payload.tweaksEnable) message = payload.message;
        }
        message = message.replace("[lastFourDigits]", `<say-as interpret-as="verbatim">${number}</say-as>`);
        message = message.replace("<pause 2s>", `<break time="${PAUSE_TIME_VISUAL_PATH}"/>`);
        return message;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/event-check", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

/**
  * It slices the ANI number to last four digit and sends out modifed response by replacing it in response
  * @param {object} params The global context object used to store parameters
  * @param {string} message The message to be replaced
  * @param {object} payload Tweaks for dev & stage
  */

const openReqSomethingElseSliceNumber = (params, message, payload = null) => {
    let number = (params.callbackNumber).slice(-4);
    if (process.env.NODE_ENVIRONMENT === "development" || process.env.NODE_ENVIRONMENT === "staging") {
        if (payload) message = payload.tweaksEnable.message;
    }
    message = message.replace("[ANI Number]", ` <say-as interpret-as="verbatim">${number}</say-as>`);
    return message;
};

module.exports = { configSliceNumber, openReqSomethingElseSliceNumber };
