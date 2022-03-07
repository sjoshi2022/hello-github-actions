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

const chai = require("chai");
const assert = require('assert');
const retryLimitExceeded = require("../helper/retry-limit-checker").retryLimitExceeded;

describe("Get a boolean response of retry counter", () => {

    /* Should assert true when the counter has reached its limit */
    it("should assert true when the counter has reached its limit", () => {
        let params = {}
        let counterLimit = 1;
        let counterParamName = "counterParam"
        let expected_output = true;

        let actual_output = retryLimitExceeded(params, counterParamName, counterLimit);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert false when the counter has not reached its limit */
    it("should assert false when the counter has not reached its limit", () => {
        let params = {}
        let counterLimit = 2;
        let counterParamName = "counterParam"
        let expected_output = false;

        let actual_output = retryLimitExceeded(params, counterParamName, counterLimit);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert true when the counterParam is already present with one count */
    it("Should assert true when the counterParam is already present with one count", () => {
        let params = { counterParam: 1 }
        let counterLimit = 2;
        let counterParamName = "counterParam"
        let expected_output = true;

        let actual_output = retryLimitExceeded(params, counterParamName, counterLimit);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert false when the counterParam is already present with one count */
    it("Should assert false when the counterParam is already present with one count", () => {
        let params = { counterParam: 1 }
        let counterLimit = 3;
        let counterParamName = "counterParam"
        let expected_output = false;

        let actual_output = retryLimitExceeded(params, counterParamName, counterLimit);
        assert.strictEqual(expected_output, actual_output);
    });
});