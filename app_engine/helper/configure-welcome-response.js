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

const { PAUSE_TIME } = require("./constants");
const { response } = require("../intent-library/helper/responses");


/**
 * Method to configure welcome message based on certain conditions
 * @param {String} thirdMessage Configurable Third Message
 * @param {object} params global params
 * @param {String} isInitialQueAsked Is Initial Question Asked. 
 * If yes: No need to send welcome message again
 */
const formedResponse = (thirdMessage, params, isInitialQueAsked = false) => {
    // Set Initial welcome message - 1. 911 Message, 2. Recorded Message
    let configAPI911Response = params.apiResults.configResult.prompts.greeting.disclaimer911.text;
    let configAPICallsRecordedResponse = params.apiResults.configResult.prompts.greeting.disclaimerRecording.text;
    let welcomeClientResponse = params.apiResults.configResult.prompts.greeting.welcome || null;
    let globalMessage1 = params.apiResults.configResult.prompts.greeting.globalMessage1 || null;

    let inititalMessage, welcomeClientResponseText, globalMessage1Text;

    if (!isInitialQueAsked) {
        welcomeClientResponseText = (welcomeClientResponse && welcomeClientResponse.text) ? `${welcomeClientResponse.text}<break time="${PAUSE_TIME}"/> ` : "";
        globalMessage1Text = (globalMessage1 && globalMessage1.text) ? `${globalMessage1.text}<break time="${PAUSE_TIME}"/> ` : "";

        inititalMessage = response(`${welcomeClientResponseText}${configAPI911Response} <break time="${PAUSE_TIME}"/><prosody rate="fast" volume="75%"> 
        ${configAPICallsRecordedResponse}</prosody><break time="${PAUSE_TIME}"/> ${globalMessage1Text} 
        ${thirdMessage}`);

        return inititalMessage;
    } else {
        return response(`${thirdMessage}`);
    }
};

module.exports = { formedResponse };