"use strict";

const logger = require("../../logger");
const { CONTEXTS, EVENTS, OPLIFESPAN_THREE, VISUAL_PATH_CHOICES } = require("../../helper/constants");
const { response } = require("../helper/responses");
const setEndResponse = require("../../helper/set-end-response").setEndResponse;
const { configSliceNumber } = require("../helper/number-slice-helper");

/**
 * Configure Message
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const configureMessage = async (df, params) => {
    try {
        // Depending on config API, flow will be routed based on foreceVisualChoice boolean
        let tweakPayload = df._request.queryResult.fulfillmentMessages[1].payload.configNormalMessagePayload.tweaks;
        if (["development", "staging"].includes(process.env.NODE_ENVIRONMENT) && tweakPayload && tweakPayload.visualTweak) {
            params["apiResults"].configResult.client.forceVisualChoice = tweakPayload.forceVisualChoice;
            params["apiResults"].configResult.client.visualPath = tweakPayload.visualPath;
        }

        let visualPathOptions = params["apiResults"].configResult.client.visualPath;
        let message = df._request.queryResult.fulfillmentMessages[0].text.text[0];
        let payload;

        switch (visualPathOptions) {
            case VISUAL_PATH_CHOICES.default:
                // If visualPath is Default, forceVisualChoice and directToAgent both being false
                // Based on conversation flow, Normal Path - Hook Options
                logger.log("info", "VisualPath is Default, Check hok options", "intent-library/intents/configure-messages", { session: params.dfSessionID });
                message = params.apiResults.configResult.prompts.vivr.hook1_confirmed.text;
                if (params.apiResults.configResult.prompts.vivr.hook1_confirmed_noInput_gibberish && params.apiResults.configResult.prompts.vivr.hook1_confirmed_noInput_gibberish.text) {
                    // option 3 & 4
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.noInputGibberishThreeSeconds;
                } else {
                    // option 1 & 2
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.configNormalMessagePayload;
                }
                message = configSliceNumber(params, message, tweakPayload);

                df.setResponseText(response(message));
                if (payload) {
                    df.setPayload(payload);
                }
                break;

            case VISUAL_PATH_CHOICES.directToAgent:
                // If visualPath is DirectToAgent, Its hook option 4 send to agent
                logger.log("info", "VisualPath is DirectToAgent, Redirecting to an agent", "intent-library/intents/configure-messages", { session: params.dfSessionID });
                message = params.apiResults.configResult.prompts.vivr.hook1_confirmed.text;
                payload = df._request.queryResult.fulfillmentMessages[1].payload.noInputGibberishThreeSeconds;
                message = configSliceNumber(params, message, tweakPayload);

                df.setResponseText(response(message));
                if (payload) {
                    df.setPayload(payload);
                }
                break;

            case VISUAL_PATH_CHOICES.forceVisual:
                // If VisualPath is ForceVisual, send to visual path, web app link
                // Based on conversation flow, Default path - Force Visual Path
                logger.log("info", "VisualPath is ForceVisual, Send web app text link", "intent-library/intents/configure-messages", { session: params.dfSessionID });

                df.clearContext(CONTEXTS.configureMessageFollowup);
                df.setOutputContext(CONTEXTS.configForceVisual, 2);
                df.setEvent(EVENTS.forceVisualPath);

                payload = df._request.queryResult.fulfillmentMessages[1].payload.configDefaultMessagePayload;
                df.setResponseText(response(message));
                if (payload) {
                    df.setPayload(payload);
                }
                break;

            case VISUAL_PATH_CHOICES.forceSpeech:
                // If visualPath is ForceSpeech, send to request on call flow
                logger.log("info", "VisualPath is ForceSpeech, Redirect to Request on Call flow", "intent-library/intents/configure-messages", { session: params.dfSessionID });
                df.clearContext(CONTEXTS.configureMessageFollowup);
                df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.requestOnCall);
                break;

            default:
                // If visualPath is other than above option, send to request on call flow (ForceSpeech)
                logger.log("info", "VisualPath is Default, Redirect to Request on Call flow", "intent-library/intents/configure-messages", { session: params.dfSessionID });
                df.clearContext(CONTEXTS.configureMessageFollowup);
                df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.requestOnCall);
                break;
        }
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/configure-messages", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = configureMessage;
