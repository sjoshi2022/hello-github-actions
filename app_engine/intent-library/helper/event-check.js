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
 * Helper function to check whether the event is present or not
 * @param {Object} df The fullfillment object used to communicate with dialogflow
 * @param {String} event Event which is triggered 
 */
const eventCheck = (df, event) => {
    try {
        let eventContext = df.getContext(event);
        if (eventContext)
            return true;
        else
            return false;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/event-check", { "message": err, session: df._request.session.split("/").reverse()[0] });
        throw err;
    }
};

module.exports = { eventCheck };
