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

const { validateVoip } = require("../helper/voip-validation");

describe("Validate SMS enabled VOIP phone numbers", () => {

    let carrierType = "voip";
    let phoneTypeRegex = "^(mobile|voip.*(sms-|sms/|mms-))";

    /* Should return true since the VOIP is SMS enabled */
    it("should return true since voip is SMS enabled", () => {
        let carrierName = "Twilio - Toll-Free - SMS-Sybase365/MMS-SVR";
        let typeResult = `${carrierType.toLowerCase()}${carrierName.toLowerCase()}`;
        let expected_output = true;

        let actual_output = validateVoip(typeResult, phoneTypeRegex);
        expected_output.should.deep.equal(actual_output);
    });

    /* asserting false since voip is not SMS enabled */
    it("asserting false since voip is not SMS enabled", () => {
        let carrierName = "Onvoy, LLC";
        let typeResult = `${carrierType.toLowerCase()}${carrierName.toLowerCase()}`;
        let expected_output = false;

        let actual_output = validateVoip(typeResult, phoneTypeRegex);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should return false since voip is not SMS enabled as it is Text Now voip */
    it("should return false since voip is not SMS enabled as it is Text Now voip", () => {
        let carrierName = "TextNow - Bandwidth.com - SVR";
        let typeResult = `${carrierType.toLowerCase()}${carrierName.toLowerCase()}`;
        let expected_output = false;

        let actual_output = validateVoip(typeResult, phoneTypeRegex);
        expected_output.should.deep.equal(actual_output);
    });
});