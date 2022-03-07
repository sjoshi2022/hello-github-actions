"use strict";

const { CONTEXTS, OPLIFESPAN, FALLBACK_INTENTS, INTENTS, EVENTS, CHIPS } = require("../../../helper/constants");
const retryLimitExceeded = require("../../../helper/retry-limit-checker").retryLimitExceeded;
const logger = require("../../../logger");
const sessionEnd = require("./session-end");
const { setChatContexts } = require("../../helper/set-chat-contexts");

/**
 * A generic function to set DF fuilfillment responses for chatbot
 * @param {Object} df The fullfillment object to perform Dialogflow functions
 * @param {Object} params Global context to store data
 */
const setDFResponses = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        let message;
        let suggestions = [];
        let jobDetails = params["jobDetails"];
        let address = jobDetails && jobDetails.location && jobDetails.location.serviceLocation && jobDetails.location.serviceLocation.address || "";
        switch (intentName) {
            case FALLBACK_INTENTS.ChatTowTruckInfoFallback:
                if (retryLimitExceeded(params, "towTruckInfoFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case FALLBACK_INTENTS.ChatTowTruckTimeFallback:
                if (retryLimitExceeded(params, "towTruckTimeFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case FALLBACK_INTENTS.ChatSMSNotReceivedFallback:
                if (retryLimitExceeded(params, "userNotGetSmsFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
            case INTENTS.ChatInvoice:
                //Transfer to agent
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case INTENTS.ChatSPNotArrived:
                message = params.chatConfigApi.SPNotArrived;
                df.setOutputContext(CONTEXTS.ChatSpeakToSP, OPLIFESPAN);
                suggestions.push(CHIPS.talkToAgent, CHIPS.speakToSp);
                //Activate contexts at the end of the flow, giving user to jump to another flow
                setChatContexts(df, params);
                break;
            case FALLBACK_INTENTS.ChatSPNotArrivedFallback:
                if (retryLimitExceeded(params, "ChatSPNotArrivedFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case INTENTS.ChatETAPassedYes:
                //transfer to agent
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case FALLBACK_INTENTS.ChatETAPassedFallback:
                if (retryLimitExceeded(params, "etaPassedFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case INTENTS.ChatEditRequest:
                message = params.chatConfigApi.modifyRequest;
                suggestions.push(CHIPS.pickUpLocation, CHIPS.dropOffLocation, CHIPS.someThingElse);
                break;
            case INTENTS.ChatChangePickUpLocation:
                message = params.chatConfigApi.getPickupLocation;
                break;
            case INTENTS.ChatChangeDropOffLocation:
                message = params.chatConfigApi.getDropoffLocation;
                break;
            case INTENTS.ChatSomeThingElse:
            case INTENTS.ChatTalkToAgent:
                // event call to ChatGetQuery intent
                df.setOutputContext(CONTEXTS.ChatGetQuery, OPLIFESPAN);
                df.setEvent(EVENTS.CHAT_GET_QUERY);
                break;
            case FALLBACK_INTENTS.ChatEditRequestFallback:
                if (retryLimitExceeded(params, "changeRequestFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
            case FALLBACK_INTENTS.ChatCancelReqSuccessFallback:
                if (retryLimitExceeded(params, "CancelReqSuccessFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case INTENTS.ChatCancelReqSuccess:
                message = params.chatConfigApi.cancelSuccess;
                suggestions.push(CHIPS.thanks, CHIPS.newRequest);
                //Activate contexts at the end of the flow, giving user to jump to another flow
                setChatContexts(df, params);
                break;
            case FALLBACK_INTENTS.ChatSPNotRespondingFallback:
                if (retryLimitExceeded(params, "SPNotRespondingFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
            case FALLBACK_INTENTS.ChatSpeakToSPFallback:
                if (retryLimitExceeded(params, "SPToSPFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case INTENTS.ChatSPNotRespondingYes:
                //transfer to agent
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case INTENTS.ChatUserNotCancelRequest:
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case INTENTS.ChatSPNotResponding:
                df.setOutputContext(CONTEXTS.ChatEndFlow, OPLIFESPAN);
                message = params.chatConfigApi.askToChatWithAgent;
                suggestions.push(CHIPS.noThanks, CHIPS.yes);
                break;
            case INTENTS.ChatSMSTriggered:
                message = params.chatConfigApi.smsTriggered;
                suggestions.push(CHIPS.smsNotReceived, CHIPS.thanks);
                break;
            case FALLBACK_INTENTS.ChatSMSTriggeredFallback:
                if (retryLimitExceeded(params, "SMSTriggeredFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
            case FALLBACK_INTENTS.ChatSMSWaitFallback:
                if (retryLimitExceeded(params, "SMSWaitFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
            case INTENTS.ChatSMSWait:
                message = params.chatConfigApi.smsWait;
                suggestions.push(CHIPS.smsNotReceived, CHIPS.smsReceived);
                break;
            case FALLBACK_INTENTS.ChatCancelRequestConfirmFallback:
                if (retryLimitExceeded(params, "ChatCancelRequestConfirmFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.confirmCancelRequestFallback.replace("$address", address);
                    suggestions.push(CHIPS.yes, CHIPS.no);
                }
                break;
            case INTENTS.ChatCancelRequestConfirm:
                message = params.chatConfigApi.confirmCancelRequest.replace("$address", address);
                suggestions.push(CHIPS.yes, CHIPS.no);
                break;
            case INTENTS.ChatCancelRequestConfirmYes:
                message = params.chatConfigApi.reasonForCancel;
                suggestions.push(CHIPS.nolongerRequireService, CHIPS.serviceTakingLong, CHIPS.locatedAlternativeService, CHIPS.other);
                break;
            case INTENTS.ChatCancelRequestConfirmNo:
                message = params.chatConfigApi.anythingElse;
                suggestions.push(CHIPS.noThanks, CHIPS.newRequest, CHIPS.talkToAgent);
                //Activate contexts at the end of the flow, giving user to jump to another flow
                setChatContexts(df, params);
                break;
            case FALLBACK_INTENTS.ChatCancelRequestConfirmNoFallback:
                if (retryLimitExceeded(params, "ChatCancelRequestConfirmNoFallbackRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                    //Activate contexts at the end of the flow, giving user to jump to another flow
                    setChatContexts(df, params);
                }
                break;
            case FALLBACK_INTENTS.ChatGetPickUpLocation:
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case FALLBACK_INTENTS.ChatGetDropOffLocation:
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case INTENTS.ChatThanks:
                df.setResponseText(params.chatConfigApi.endFlow);
                params.endFlow = true;
                return sessionEnd(df, params); // end the session
            case INTENTS.ChatUnplannedAgentTransfer:
                message = params.chatConfigApi.agentTransfer;
                //remove chatConfig prompts when agent escalation. Its not needed for the C1 conversation system yet take a lot of space in storing 
                params.chatConfigApi = {};
                break;
            case FALLBACK_INTENTS.ChatUserQuery:
                df.setOutputContext(CONTEXTS.ChatAgentTransfer, OPLIFESPAN);
                df.setEvent(EVENTS.ChatAgentTransfer);
                break;
            case FALLBACK_INTENTS.ChatDefaultWelcomeIntentFallback:
                let webchat = params.webchat;
                let jobId = webchat && webchat.jobId || "";
                // asking user for callback number
                if (jobId == "" && !params.phoneNumber) {
                    if (retryLimitExceeded(params, "ChatGetCallbackNumber")) {
                        df.setResponseText(params.chatConfigApi.invalidNumber);
                        df.setOutputContext(CONTEXTS.ChatTalkToAgentFallback, OPLIFESPAN);
                    } else {
                        df.setResponseText(params.chatConfigApi.askNumber);
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumber, OPLIFESPAN);
                        df.setOutputContext(CONTEXTS.ChatGetCallbackNumberFallback, 1);
                    }
                }
                // asking user for intent
                else {
                    if (retryLimitExceeded(params, "ChatDefaultWelcomeIntentFallbackRetry")) {
                        df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                        df.setEvent(EVENTS.ChatUnplannedAgentTransfer);
                    } else {
                        message = params.chatConfigApi.rephraseQuery;
                    }
                }
                break;
            default:
                if (retryLimitExceeded(params, "ChatDefautlFallbackIntentRetry")) {
                    df.setOutputContext(CONTEXTS.ChatUnplannedAgentTransfer, OPLIFESPAN);
                    df.setEvent(EVENTS.ChatUnplannedAgentTransfer);

                } else {
                    message = params.chatConfigApi.rephraseQuery;
                }
                break;
        }
        if (message && suggestions.length > 0) {
            df.setSuggestions({
                "title": message,
                "suggestions": suggestions
            });
        }
        else if (message != null) {
            df.setResponseText(message);
        }

        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/set-df-responses-mvp2", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = setDFResponses;
