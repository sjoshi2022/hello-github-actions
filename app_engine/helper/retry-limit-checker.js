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

const config = require("./../config")();


/**
 * Set retry counter for provided parameter
 * @param {object} globalParams global parameters
 * @param {object} counterParamName Name of the parameter
 * @param {object} counterLimit Counter limit
 */
const retryLimitExceeded = (globalParams, counterParamName, counterLimit, queryText = true) => {
    let result = false;
    counterLimit = counterLimit || config.defaultCounterLimit;
    if (queryText) {
        if (!globalParams.hasOwnProperty(counterParamName) || (globalParams[counterParamName] === undefined)) {
            globalParams[counterParamName] = 1;
        } else {
            globalParams[counterParamName] += 1;
        }
    }

    if (parseInt(globalParams[counterParamName]) >= counterLimit) {
        result = true;
    }
    return result;
};

module.exports = { retryLimitExceeded };
