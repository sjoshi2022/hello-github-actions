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
const { chatResponses } = require("../../helper/get-chat-responses.js");
const { CONTEXTS, OPLIFESPAN, EVENTS, CHIPS, ETA_EXPIRATION_CHECK } = require("../../../helper/constants");
const retryLimitExceeded = require("../../../helper/retry-limit-checker").retryLimitExceeded;
const jobDetails = require("../../../services/get-job-details-using-callbacknumber.js");
const logger = require("../../../logger");
const newRequest = require("./new-request");
const isValidNumber = require("../../../helper/validate-phone-number").validatePhoneNumber;


/**
    * Callback number Intent controller
    * @param {object} df webhook fulfillment object
    * @param {object} params Global Parameters
    */
const getCallbackNumber = async (df, params) => {
    try {
        let dfSessionId = df._request.session.split("/").reverse()[0];
        let callIdSipHdrs = params.webchat && params.webchat.c1SessionId || "";
        let accessToken = params["accessToken"];

        // get job details parameters
        let callbackNumber = params["callbackNumber"] || "";
        callbackNumber = callbackNumber.toString();

        // request for callback number in initial flow
        let isValidPhoneNumberRes = await isValidPhoneNumber(df, params);
        if (isValidPhoneNumberRes) {
            let isForTriggerSms = params["triggerSms"];
            if (isForTriggerSms) { // check if called for new request
                return newRequest(df, params);
            }
            else {
                let jobDetailParams = await jobDetails(callbackNumber, accessToken, dfSessionId, callIdSipHdrs);
                // if job details not found
                if (jobDetailParams.success == false) {
                    //Invalid JobId and no job details are found, then ask for callback number
                    if (jobDetailParams.message == "No job details found") {
                        if (retryLimitExceeded(params, "ChatGetCallbackNumber")) {
                            df.setResponseText(params.chatConfigApi.invalidNumber);
                            df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                        } else {
                            df.setResponseText(params.chatConfigApi.askNumber);
                            df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                            df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                        }
                    }
                    //API Failure cases
                    else {
                        // AGENT TRANSFER
                        df.setResponseText(params.chatConfigApi.initialApiFail);
                        df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                    }
                }
                // if job details are found
                else {
                    let name = jobDetailParams.data && jobDetailParams.data.customer && jobDetailParams.data.customer.name || "";
                    if (name) { //concatenate of ‘customerName’ and clientCode, in global context. ConvergeOne will use this value
                        params.webchat.customerName = `${name} ${params.webchat.clientCode}`;
                    }

                    let responses = await chatResponses(jobDetailParams.data, params);
                    // agent transfer for statuses: ETARejected, Expired, Deleted and Reassigned
                    if (responses.agentTransfer) {
                        params.isWelcomeMsgDisplayed = true;
                        df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatAgentTransfer);
                    }
                    // activate contexts for all other statuses
                    else {
                        for (let i = 0; i < responses.contexts.length; i++) {
                            df.setOutputContext(responses.contexts[i], OPLIFESPAN);
                        }
                        let message, chips;
                        let greetingMsg = params.chatConfigApi.greeting.replace("$name", name);
                        let calculatedETA = jobDetailParams.data && jobDetailParams.data.calculatedETA;
                        let status = jobDetailParams.data && jobDetailParams.data.status;

                        //check ETA expiration for "Assigned", "Dispatched", "En Route", "Accepted", "ETAExtended"
                        // Route it to ETA passed flow if its expired
                        if ((ETA_EXPIRATION_CHECK.includes(status)) && ((calculatedETA == null) || (calculatedETA == "") || (calculatedETA <= 0))) {
                            message = `${greetingMsg}, ${params.chatConfigApi.etaExpired}`;
                            chips = [CHIPS.talkToAgent, CHIPS.cancelRequest, CHIPS.speakToSp];
                        }
                        else {
                            message = `${greetingMsg}, ${responses.res}`;
                            chips = responses.chips;
                        }
                        df.setOutputContext(CONTEXTS.ChatInvoice, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatCancelReq, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatDefaultWelcomeIntentFallback, 1);
                        df.setSuggestions({
                            "title": message,
                            "suggestions": chips
                        });
                    }
                    params.jobDetails = jobDetailParams.data;
                }
            }
        }
    }
    catch (err) {
        // AGENT TRANSFER
        df.setResponseText(params.chatConfigApi.apiFailure);
        df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/get-callback-number", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

// check for valid phone number in case of new request
const isValidPhoneNumber = async (df, params) => {
    try {
        let validMobileNumber = false;

        let phoneNumber = params["callbackNumber"] || "";
        phoneNumber = phoneNumber.toString();

        let phoneRegex = params.phoneRegex;
        /* If the phone number was not captured or empty, ChatGetCallbackNumber intent is called again */
        if (!phoneNumber || phoneNumber === "") {
            if (retryLimitExceeded(params, "phoneNumberFallbackRetry")) {
                let isForTriggerSms = params["triggerSms"];
                if (isForTriggerSms) { //Check is it for new request flow
                    //transfer to agent
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                }
                else {
                    df.setResponseText(params.chatConfigApi.invalidNumber);
                    df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                }
            }
            else {
                let isForTriggerSms = params["triggerSms"];
                let message;
                //Check is it for new request flow
                if (isForTriggerSms) message = params.chatConfigApi.numberForNewRequest;
                else message = params.chatConfigApi.askNumber;
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                df.setResponseText(message);
            }
        }
        else if (!isValidNumber(phoneNumber, phoneRegex)) {
            // number is invalid and retry is checked for how many times user entered invalid number
            if (retryLimitExceeded(params, "phoneNumberValidRetry")) {
                let isForTriggerSms = params["triggerSms"];
                if (isForTriggerSms) { //Check is it for new request flow
                    //transfer to agent
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                }
                else {
                    df.setResponseText(params.chatConfigApi.invalidNumber);
                    df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                }
            }
            else {
                let isForTriggerSms = params["triggerSms"];
                let response;
                //Check is it for new request flow
                if (isForTriggerSms) response = params.chatConfigApi.numberForNewRequest;
                else response = params.chatConfigApi.askNumber;
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                df.setResponseText(response);
            }
        }
        else {
            // number is valid, and store for future use
            validMobileNumber = true;
            params.phoneNumber = phoneNumber;
        }
        return validMobileNumber;
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/mvp2/new-request", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = getCallbackNumber;
