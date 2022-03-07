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

const { formedResponse } = require("../helper/configure-welcome-response");

describe("Get response from formedResponse based on parameters", () => {
    let messageArray = {
        disclaimer911: "If this is a medical emergency or your safety is at risk, hang up now and call 9 1 1.",
        disclaimerRecording: "This call, and any subsequent calls, may be recorded.",
        invalidAni: "We will need a contact number for your service today. A smart phone is best for fast and accurate service.",
        invalidCallback: "Please provide a valid 10 digit mobile number.",
        currentRequest: "Are you looking for information on your current open request?",
        newRequest: "Are you looking to open a new roadside assistance request?"
    }

    let params = {
        apiResults: {
            configResult: {
                prompts: {
                    greeting: {
                        disclaimer911: {
                            text: "If this is a medical emergency or your safety is at risk, hang up now and call 9 1 1."
                        },
                        disclaimerRecording: {
                            text: "This call, and any subsequent calls, may be recorded."
                        }
                    }
                }
            }
        }
    }

    let PAUSE_TIME = "2s";

    /* Should append disclaimers of 911 and callsRecorded to message parameter */
    it("should append disclaimers of 911 and callsRecorded to message parameter", () => {
        let message = `${messageArray.invalidAni}${messageArray.invalidCallback}`;
        let expected_output = `<speak> ${messageArray.disclaimer911} <break time="${PAUSE_TIME}"/><prosody rate="fast" volume="75%">
        ${messageArray.disclaimerRecording}</prosody><break time="${PAUSE_TIME}"/>
        ${message} </speak>`;
        let actual_output = formedResponse(message, params, false);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should not append disclaimers of 911 and callsRecorded to message parameter */
    it("should not append disclaimers of 911 and callsRecorded to message parameter", () => {
        let message = `${messageArray.invalidAni}${messageArray.invalidCallback}`;
        let expected_output = `<speak> ${message} </speak>`;

        let actual_output = formedResponse(message, params, true);
        expected_output.should.deep.equal(actual_output);
    });

    /* Should assert append disclaimers of 911 and callsRecorded to open request message parameter */
    it("should assert append disclaimers of 911 and callsRecorded to open request message parameter", () => {
        let message = `${messageArray.currentRequest}`;
        let expected_output = `<speak> ${messageArray.disclaimer911} <break time="${PAUSE_TIME}"/><prosody rate="fast" volume="75%">
        ${messageArray.disclaimerRecording}</prosody><break time="${PAUSE_TIME}"/>
        ${message} </speak>`;
        let actual_output = formedResponse(message, params, false);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert append disclaimers of 911 and callsRecorded to new request message parameter */
    it("should assert append disclaimers of 911 and callsRecorded to new request message parameter", () => {
        let message = `${messageArray.newRequest}`;
        let expected_output = `<speak> ${messageArray.disclaimer911} <break time="${PAUSE_TIME}"/><prosody rate="fast" volume="75%">
        ${messageArray.disclaimerRecording}</prosody><break time="${PAUSE_TIME}"/>
        ${message} </speak>`;
        let actual_output = formedResponse(message, params, false);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert not appending disclaimers of 911 and callsRecorded to new request message parameter */
    it("should assert not appending disclaimers of 911 and callsRecorded to new request message parameter", () => {
        let message = `${messageArray.newRequest}`;
        let expected_output = `<speak> ${message} </speak>`;
        let actual_output = formedResponse(message, params, true);
        assert.strictEqual(expected_output, actual_output);
    });

    /* Should assert not appending disclaimers of 911 and callsRecorded to open request message parameter */
    it("should assert not appending disclaimers of 911 and callsRecorded to open request message parameter", () => {
        let message = `${messageArray.currentRequest}`;
        let expected_output = `<speak> ${message} </speak>`;
        let actual_output = formedResponse(message, params, true);
        assert.strictEqual(expected_output, actual_output);
    });
});