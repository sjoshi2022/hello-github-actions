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

const { setTwilioOutput } = require("../helper/twilio-output-voip-setting");

describe("Segregate voip phone numbers as mobile/landline based on sms enablement of the device", () => {

    let twiliOutput = {};
    let phoneTypeRegex = "^(mobile|voip.*(sms-|sms/|mms-))";

    /* Should return as landline since the VOIP is not SMS enabled as it is Textnow voip */
    it("should return as landline since voip is not SMS enabled as it is Textnow voip", () => {
        twiliOutput = {
            success: true,
            data: {
                carrierType: "voip",
                carrierName: "TextNow - Bandwidth.com - SVR"
            },
            message: "Successful"
        }
        let expected_output = {
            success: true,
            data: {
                carrierType: "landline",
                carrierName: "TextNow - Bandwidth.com - SVR"
            },
            message: "Successful"
        }

        let actual_output = setTwilioOutput(twiliOutput, phoneTypeRegex, df);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should return as mobile since the VOIP is SMS enabled */
    it("should return mobile since voip is SMS enabled", () => {
        twiliOutput = {
            success: true,
            data: {
                carrierType: "voip",
                carrierName: "Twilio - Toll-Free - SMS-Sybase365/MMS-SVR"
            },
            message: "Successful"
        }
        let expected_output = {
            success: true,
            data: {
                carrierType: "mobile",
                carrierName: "Twilio - Toll-Free - SMS-Sybase365/MMS-SVR"
            },
            message: "Successful"
        }

        let actual_output = setTwilioOutput(twiliOutput, phoneTypeRegex, df);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should return as landline since the VOIP is not SMS enabled */
    it("should return as landline since voip is not SMS enabled", () => {
        twiliOutput = {
            success: true,
            data: {
                carrierType: "voip",
                carrierName: "Onvoy, LLC"
            },
            message: "Successful"
        }
        let expected_output = {
            success: true,
            data: {
                carrierType: "landline",
                carrierName: "Onvoy, LLC"
            },
            message: "Successful"
        }

        let actual_output = setTwilioOutput(twiliOutput, phoneTypeRegex, df);
        expected_output.should.deep.equal(actual_output);
    });
});