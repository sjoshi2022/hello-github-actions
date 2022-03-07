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
const { SESSION_COMMANDS, MAX_API_TIME_CHECK, COMMAND_API_COMMANDS, EVENTS, SESSION_EVENTS, CONTEXTS, OPLIFESPAN, RSAREQUESTID, ONE_SECOND } = require("../../helper/constants");
const { response } = require("../helper/responses");
const { setEndResponse } = require("../../helper/set-end-response");
const { sessionEventHelper } = require("../helper/session-event-helper");
const commandApi = require("../../services/command-api");
const { getLoggingParams } = require("../../helper/get-logging-params");
const { clearQueueCommandHelper } = require("../helper/clear-queue-command-helper");
const { appendCommandHelper } = require("../helper/append-commands-helper");


/**
  * Method that executes commands of session event api and command api
  * @param {Object} df The fullfillment object used to communicate with dialogflow
  * @param {Object} params Global context to store data
  */
const commandProcessor = async (df, params) => {
    try {
        df.setPayload(df._request.queryResult.fulfillmentMessages[1].payload.NoInputPayload);
        let sessionCommands = params.apiResults.sessionEventResult;
        let sessionEventCounter = params.sessionEventCounter;
        let message = "";
        if (sessionEventCounter < sessionCommands.length && sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.clearQueue) {
            sessionEventCounter = parseInt(sessionEventCounter) + 1;
        }
        if (sessionEventCounter < sessionCommands.length && sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.pollingTime) {
            sessionEventCounter = parseInt(sessionEventCounter) + 1;
        }
        if ((sessionEventCounter < sessionCommands.length && sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.wait) || (sessionEventCounter >= sessionCommands.length)) {
            //Wait Command
            let loggingParams = getLoggingParams(df);
            let totalAPITime = 0;
            let sessionId = loggingParams.dfSessionId;
            let commandApiParams = {
                sessionId: sessionId,
                programCode: params.programCode,
                programSubCode: params.programSubCode || "",
                callbackNumber: params.callbackNumber,
                vdn: params.vdn,
                correlationId: sessionId
            };
            let commandApiOutput;
            while (totalAPITime < MAX_API_TIME_CHECK) {
                let iterationTimeDelay = 0;
                let startTime = Date.now();
                commandApiOutput = await commandApi(commandApiParams, loggingParams.dfSessionId, loggingParams.callIdSipHdrs);
                let endTime = Date.now();
                let apiExecutionTime = parseInt(endTime - startTime);
                iterationTimeDelay = parseInt(ONE_SECOND - apiExecutionTime);
                if (iterationTimeDelay > 0) {
                    totalAPITime += parseInt(apiExecutionTime + iterationTimeDelay);
                } else {
                    totalAPITime += parseInt(apiExecutionTime);
                }
                if (commandApiOutput.data.length > 0 && commandApiOutput.data[0].Command === COMMAND_API_COMMANDS.clearQueue) {
                    // Not null - Check for ClearQueue and Speak 
                    let commandAPIResult = commandApiOutput.data;
                    params = await clearQueueCommandHelper(params, commandAPIResult);
                    sessionCommands = params.apiResults.sessionEventResult;
                    sessionEventCounter = params.sessionEventCounter;
                    break;
                } else if (commandApiOutput.data.length > 0 && commandApiOutput.data[0].Command != COMMAND_API_COMMANDS.clearQueue) {
                    //append to session event api commands
                    params.apiResults.sessionEventResult = await appendCommandHelper(sessionCommands, commandApiOutput.data, params);
                }
                if (iterationTimeDelay > 0) {
                    await new Promise(resolve => setTimeout(function () { resolve(); }, iterationTimeDelay));
                }
                // If null - do nothing 
            }
            // User did not click the link while polling command API
            sessionEventCounter = parseInt(sessionEventCounter) + 1;
        }

        while (sessionEventCounter < sessionCommands.length && sessionCommands[sessionEventCounter].Command != SESSION_COMMANDS.wait) {
            if (sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.requestTransfer) {
                await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                return df;
            } else if (sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.transfer) {
                let transferCommand = sessionCommands[sessionEventCounter];
                let description = transferCommand.Description.split(";");
                let indexOfRSA = description.findIndex(descriptionObjects => descriptionObjects === RSAREQUESTID);
                let value = transferCommand.Value.split(";");
                let rsaID = value[indexOfRSA];
                params.rsaID = rsaID;
                return await setEndResponse(df, params, message);
            } else if (sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.endCall) {
                params.endConversationMessage = message;
                df.setEvent(EVENTS.endConversation);
                df.setResponseText(response(message));
                break;
            } else if (sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.speak) {
                message += ` ${sessionCommands[sessionEventCounter].Description}`;
            } else if (sessionCommands[sessionEventCounter].Command === SESSION_COMMANDS.resendText) {
                let sessionEventApiOutput = await sessionEventHelper(df, params, SESSION_EVENTS.resendRequested, true);
                if (!sessionEventApiOutput.success) {
                    // handle case when session event api fails - agent transfer
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                    return df;
                }
            }
            sessionEventCounter = parseInt(sessionEventCounter) + 1;
            params.sessionEventCounter = sessionEventCounter;
        }
        df.setResponseText(response(message));
        df.setOutputContext(CONTEXTS.triggerSMSFollowup, OPLIFESPAN);
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/helper/session-event-command-type", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = { commandProcessor };