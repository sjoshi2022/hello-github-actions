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
const config = require("../../../services/config-chat.js");
const jobDetails = require("../../../services/get-jobdetails-using-swcid");
const { chatResponses } = require("../../helper/get-chat-responses.js");
const { CONTEXTS, OPLIFESPAN, EVENTS, CHIPS, ETA_EXPIRATION_CHECK } = require("../../../helper/constants");
const logger = require("../../../logger");
const etaValidator = require('../../helper/eta-validator')

/**
   * Default Welcome Intent for chatbot
   * @param {object} df webhook fulfillment object
   * @param {object} params Global Parameters
   */
const chatDefaultWelcomeIntent = async (df, params) => {

    // get converge one parameters
    let webchat;
    if (df.getContext("webchat")) {
        webchat = df.getContext("webchat");
    }
    else {
        webchat = df._request.queryResult.fulfillmentMessages[1].payload.webchat;
    }
    let requestcontext = df.getContext("requestcontext");
    let jobId = webchat && webchat.parameters && webchat.parameters.jobId || params.jobID || "";
    let clientCode = webchat && webchat.parameters && webchat.parameters.clientCode || "Default";
    let callbackNumber = webchat && webchat.parameters && webchat.parameters.callbackNumber || "";

    // storing C1 parameters
    params.webchat = webchat && webchat.parameters || {};
    params.webchat.jobId = jobId;
    params.webchat.callbackNumber = callbackNumber;
    params.webchat.clientCode = clientCode;
    //Initially we are setting customerName has `Guest ${clientCode}`. if customer name is available in jobDetails, have to update it to `name ${clientCode}`
    params.webchat.customerName = `Guest ${clientCode}`;

    try {
        let progCode = clientCode.toUpperCase();
        let dfSessionId = df._request.session.split("/").reverse()[0];
        let callIdSipHdrs = requestcontext && requestcontext.parameters && requestcontext.parameters.sessionid || "";

        // store session ids in global context
        params.webchat.c1SessionId = callIdSipHdrs;
        params.webchat.dfSessionId = dfSessionId;

        // get parameters from configChat API
        let configRes = await config(progCode, dfSessionId, callIdSipHdrs);

        if (configRes.success == true) {
            // get parameter values
            let accessToken = configRes.data.superToken;
            let phoneRegex = configRes.data.environment.phoneRegex;
            let chatConfig = configRes.data.prompts.chatbot;
            let clientName = configRes.data.client.clientDisplayName || "";

            // set values in context
            params.accessToken = accessToken;
            params.chatConfigApi = chatConfig;
            params.phoneRegex = phoneRegex;
            params.clientName = clientName;

            // If customer name is available then use "customerWelcomeMsg" orelse "normalWelcomeMsg" 
            let customerWelcomeMsg = params.chatConfigApi.customerWelcomeMsg.replace("$client_name", params.clientName);
            let normalWelcomeMsg = params.chatConfigApi.welcomeMsg.replace("$client_name", params.clientName);
            // if jobID is received in the payload
            if (jobId != "") {
                let jobDetailsParams = await jobDetails(jobId, accessToken, dfSessionId, callIdSipHdrs);
                // job details are found
                if (jobDetailsParams.success == true) {
                    let welcomeMsg;
                    let name = jobDetailsParams.data && jobDetailsParams.data.customer && jobDetailsParams.data.customer.name || "";
                    if (name) { //concatenate of ‘customerName’ and 'clientCode', in global context. ConvergeOne will use this value
                        params.webchat.customerName = `${name} ${clientCode}`;
                        let greetingMsg = params.chatConfigApi.greeting.replace("$name", name);
                        welcomeMsg = `${greetingMsg}, ${customerWelcomeMsg}`;
                    }
                    else {
                        welcomeMsg = normalWelcomeMsg;
                    }
                    let _responses = await chatResponses(jobDetailsParams.data, params);
                    let responses = etaValidator(_responses, jobDetailsParams.data, chatConfig);
                    // agent transfer for statuses: ETARejected, Expired, Deleted and Reassigned
                    if (responses.agentTransfer) {
                        df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatAgentTransfer);
                    }
                    // activate contexts for all other statuses
                    else {
                        for (let i = 0; i < responses.contexts.length; i++) {
                            df.setOutputContext(responses.contexts[i], OPLIFESPAN);
                        }
                        let message, chips;
                        let calculatedETA = jobDetailsParams.data && jobDetailsParams.data.calculatedETA;
                        let status = jobDetailsParams.data && jobDetailsParams.data.status;

                        //check ETA expiration for "Assigned", "Dispatched", "EnRoute", "Accepted", "ETAExtended"
                        // Route it to ETA passed flow if its expired
                        if ((ETA_EXPIRATION_CHECK.includes(status)) && ((calculatedETA == null) || (calculatedETA == "") || (calculatedETA <= 0))) {
                            message = `${welcomeMsg}. \n\n${params.chatConfigApi.etaExpired} `;
                            chips = [CHIPS.talkToAgent, CHIPS.cancelRequest, CHIPS.speakToSp]
                        }
                        else {
                            message = `${welcomeMsg}. \n\n${responses.res}`;
                            chips = responses.chips
                        }
                        df.setSuggestions({
                            "title": message,
                            "suggestions": chips
                        });
                        df.setOutputContext(CONTEXTS.ChatInvoice, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatCancelReq, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatDefaultWelcomeIntentFallback, 1);
                    }
                    params.jobDetails = jobDetailsParams.data;
                }
                else {
                    let response;
                    //Invalid JobIds and no job details are found, then ask for callback number
                    if (jobDetailsParams.message == "No job details found") {
                        response = `${normalWelcomeMsg}. ${params.chatConfigApi.askCallbackNumber}`
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                    }
                    //API Failure cases
                    else {
                        // AGENT TRANSFER
                        response = `${normalWelcomeMsg}. ${params.chatConfigApi.initialApiFail}`
                        df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                    }
                    df.setResponseText(response);
                }
            }
            // ask for callback number
            else {
                let response = `${normalWelcomeMsg}. ${params.chatConfigApi.askCallbackNumber}`
                df.setResponseText(response);
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
            }
        }
        // if config API fails
        else {
            // AGENT TRANSFER
            df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
            df.setEvent(EVENTS.ChatAgentTransfer);
            params.apiFailure = true;
        }
    }
    catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/chat-default-welcome-intent", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = chatDefaultWelcomeIntent;


