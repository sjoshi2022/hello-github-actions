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

const { validatePhoneNumber } = require("../helper/validate-phone-number");

describe("Validate given phone number for US numbers", () => {
    let phoneRegex = "^1?[2-9]\\d{9}#?$";

    /* Should return false since the starting is 0 with 11 digits */
    it("should return false", () => {
        let phoneNumber = "02236784435";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should assert false since the 11 digit number has 2nd digit as 1 */
    it('asserting 11 digit phone number with 2nd digit as 1', () => {
        let phoneNumber = "11367844390";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert false since the 11 digit number has 2nd digit as 0 */
    it('asserting 11 digit phone number with 2nd digit as 0', () => {
        let phoneNumber = "10549908076";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert false since the 10 digit number starting with 0 */
    it('asserting 0 digit phone number with 1st digit as 0', () => {
        let phoneNumber = "0549908076";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert true since the 10 digit number is valid */
    it('asserting valid number', () => {
        let phoneNumber = "7472100671";
        let expected_output = true;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should return false since invalid number(Greater than 11 digits) */
    it("should return false for 12 digit number", () => {
        let phoneNumber = "708350915278";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should return false since invalid number(Less than 10 digits) */
    it("should return false for less than 10 digit number", () => {
        let phoneNumber = "708350";
        let expected_output = false;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should return true since valid number */
    it("should return true for valid number without spaces and special symbols", () => {
        let phoneNumber = "+17083509152";
        let expected_output = true;

        let actual_output = validatePhoneNumber(phoneNumber, phoneRegex);
        expected_output.should.deep.equal(actual_output);
    });

});