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


/**
  * Retry counter reset helper for blacklisted flow
  * @param {Object} params Global context to store data
  */

const resetBlacklistCounters = (params) => {
    try {
        params.newCallBackNumberSlotRetry = 0;
        params.newCallBackNumberValidRetry = 0;
        params.newCallBackNumberIncorrectRetry = 0;
        params.blacklistedEnteredRetry = 0;
        params.welcomeBlacklistedNoInputRetry = 0;
        params.newCallbackNumberNoInputRetry = 0;
        params.newCallBackNumberLandlineRetry = 0;
        return params;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/reset-blacklist-counters", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { resetBlacklistCounters };