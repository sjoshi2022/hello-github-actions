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

const should = chai.should();

const assert = require('assert');

const { trimAni } = require("../helper/trim-ani");

describe("Making ANI phone number 10 digit by stripping all special characters and extra 1", () => {

    /* Should return ANI without special characters  and without 1 */
    it("should return ANI without special characters and without 1", () => {
        let phoneNumber = "+17083907892";
        let expected_output = "7083907892";

        let actual_output = trimAni(phoneNumber);
        expected_output.should.deep.equal(actual_output);
    });

    /* asserting ANI to be returned without 1 */
    it("asserting ANI to be returned without 1 ", () => {
        let phoneNumber = "19975509880";
        let expected_output = "9975509880";

        let actual_output = trimAni(phoneNumber);
        assert.strictEqual(expected_output, actual_output);
    });

    /* should return ANI without any special characters */
    it("should return ANI without any special characters", () => {
        let phoneNumber = "+1(857) 399-0237";
        let expected_output = "8573990237";

        let actual_output = trimAni(phoneNumber);
        expected_output.should.deep.equal(actual_output);
    });

    /* should assert true and strip ANI without all special characters */
    it("should assert true and stripANI without all special characters", () => {
        let phoneNumber = "(929) 447-1588";
        let expected_output = "9294471588";

        let actual_output = trimAni(phoneNumber);
        assert.strictEqual(expected_output, actual_output);
    });
});