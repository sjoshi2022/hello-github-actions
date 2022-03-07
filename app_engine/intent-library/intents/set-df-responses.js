"use strict";

const config = require("../../config")();
const logger = require("../../logger");
const { CALL_TYPES, CLIENT_TYPES, EVENTS, CONTEXTS, OPLIFESPAN, FALLBACK_INTENTS, INTENTS, OPLIFESPAN_ONE, OPLIFESPAN_THREE, SERVICE_TYPE_ISSUES, DISABLEMENT_REASON, PAUSE_TIME_VISUAL_PATH } = require(".././../helper/constants");
const { setEndResponse } = require("../../helper/set-end-response");
const { newRequest } = require("../helper/set-new-request");
const { response } = require("../helper/responses");
const retryLimitExceeded = require("../../helper/retry-limit-checker").retryLimitExceeded;
const { openRequestFallbackHelper, newRequestFallbackHelper } = require("../helper/non-blacklist-fallback-helper");
const welcomeBlacklistedNumberFallbackHelper = require("../helper/blacklist-fallback-helper").welcomeBlacklistedNumberFallbackHelper;
const { configSliceNumber } = require("../helper/number-slice-helper");
const noInputRetryLimitCheck = require("../helper/no-input-end-call-helper").noInputRetryLimitCheck;
const { commandProcessor } = require("../helper/command-processor");
const { locateMeSMSFlowHelper } = require("../helper/locate-me-sms-flow-helper");
const { vinPolicyConfirmationRouteHelper } = require("../helper/vin-policy-confirmation-route-helper");
const { weatherMessagingHelper } = require("../helper/weather-messaging-helper");
const { towServiceRouteHelper } = require("../helper/tow-service-route");


/**
 * A generic function to set DF fuilfillment responses
 * @param {Object} df The fullfillment object to perform Dialogflow functions
 * @param {Object} params Global context to store data
 */
const setDFResponses = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;
        let message = df._request.queryResult.fulfillmentMessages[0].text.text[0];
        let payload;
        let configPrompts = params.apiResults.configResult.prompts;
        let dfRequest = df._request.queryResult;
        let queryText;
        let weatherMessage;

        switch (intentName) {
            case INTENTS.openRequestNoInput:
            case FALLBACK_INTENTS.openRequestFallback:
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "openRequestNoInputRetry");
                    if (params.openRequestNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.openRequestNoInputRetry = 0;
                openRequestFallbackHelper(df, params);
                return df;

            case INTENTS.newRequestNoInput:
            case FALLBACK_INTENTS.newRequestFallback:
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "newRequestNoInputRetry");
                    if (params.newRequestNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.newRequestNoInputRetry = 0;
                newRequestFallbackHelper(df, params);
                return df;

            case INTENTS.newCallbackNoInput:
            case FALLBACK_INTENTS.newCallbackNumberFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                /* Checking for Fallback/No input retry else confirming number again */
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "newCallbackNumberNoInputRetry");
                    if (params.newCallbackNumberNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.newCallbackNumberNoInputRetry = 0;
                if (retryLimitExceeded(params, "newCallBackNumberFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    let newNumberFallbackResponse;
                    if (params.hasOwnProperty("openRequestNewCallbackNumber") && params.openRequestNewCallbackNumber) {
                        newNumberFallbackResponse = params.apiResults.configResult.prompts.greeting.openRequestNumberConfirmFallback.text;
                    } else {
                        newNumberFallbackResponse = params.apiResults.configResult.prompts.greeting.newNumberFallback.text;
                    }
                    newNumberFallbackResponse = newNumberFallbackResponse.replace("[callbackNumber]", "");
                    message = `${newNumberFallbackResponse} <say-as interpret-as='telephone'>${params.newCallbackNumber} </say-as>`;
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.newCallbackFallbackPayload;
                    df.setPayload(payload);
                }
                break;

            case INTENTS.triggerSMSNoInput:
            case FALLBACK_INTENTS.triggerSMSFallback:
            case INTENTS.smsReceived:
                return await commandProcessor(df, params);

            case INTENTS.configureMessageNoInput:
            case FALLBACK_INTENTS.configureMessageFallback:

                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "configureMessageNoInputRetry");
                    if (params.configureMessageNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.configureMessageNoInputRetry = 0;
                if (retryLimitExceeded(params, "configMessageFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    if (!params.apiResults.configResult.prompts.vivr.hook1_confirmed_noInput_gibberish.text || retryLimitExceeded(params, "hook1NoInputGibberish", 2, queryText)) {
                        message = params.apiResults.configResult.prompts.vivr.hook2.text;
                    } else {
                        message = params.apiResults.configResult.prompts.vivr.hook1_confirmed_noInput_gibberish.text;
                    }
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.noInputGibbershNormal;
                }
                break;

            case INTENTS.openRequestAnythingElseNoInput:
            case FALLBACK_INTENTS.openRequestAnythingElseFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "openRequestAnythingElseNoInputRetry");
                    if (params.openRequestAnythingElseNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.openRequestAnythingElseNoInputRetry = 0;
                if (retryLimitExceeded(params, "configMessageInput", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.greeting.etaPositiveFallback.text;
                }
                break;

            case INTENTS.newRoadsideRequest:
            case INTENTS.newRequestReason:
                params.callType = CALL_TYPES.newCall;
                newRequest(df, params);
                return df;

            case INTENTS.smsNotReceived:
                if (retryLimitExceeded(params, "smsNotReceivedRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.visual.textNotReceived.text;
                }
                payload = df._request.queryResult.fulfillmentMessages[1].payload.NoInputPayload;
                break;

            case INTENTS.openRequestSomethingElse:
            case INTENTS.newRequestSomethingElse:
            case INTENTS.newRequestNo:
            case INTENTS.openRequestAnythingElseYes:
                params.somethingElse = true;
                message = params.apiResults.configResult.prompts.greeting.somethingElseReason.text;
                break;

            case INTENTS.agentTransferReason:
            case INTENTS.agentTransferReasonFallback:
                if (dfRequest.intent.isFallback && !dfRequest.queryText) {
                    df.setOutputContext(CONTEXTS.agentTransferReason, OPLIFESPAN_ONE);
                    df.setEvent(EVENTS.dfSystemNoInput);
                } else {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                    return df;
                }
                break;

            case INTENTS.carrierTypeNoInput:
            case FALLBACK_INTENTS.askCarrierTypeFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                /* For carrier type - No input and fallback. */
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "carrierTypeNoInputRetry");
                    if (params.carrierTypeNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.carrierTypeNoInputRetry = 0;

                if (retryLimitExceeded(params, "askCarrierTypeFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params["apiResults"]["configResult"]["prompts"]["greeting"]["carrierTypeFallback"]["text"];
                }
                break;
            case INTENTS.askCarrierType:
                message = configPrompts["greeting"]["twilioFailure"]["text"];
                break;

            case FALLBACK_INTENTS.configOfferVisualUnconfirmedFallback:
            case INTENTS.configOfferVisualUnconfirmedNoInput:
                queryText = df._request.queryResult.queryText ? true : false;

                /* Checking for Fallback/No input retry */
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "configOfferVisualUnconfirmedNoInputRetry");
                    if (params.configOfferVisualUnconfirmedNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.configOfferVisualUnconfirmedNoInputRetry = 0;
                if (retryLimitExceeded(params, "configOfferVisualUnconfirmedFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    if (!params.apiResults.configResult.prompts.vivr.hook1_unconfirmed_noInput_gibberish.text || retryLimitExceeded(params, "hook1UnConfirmedNoInputGibberish", 2, queryText)) {
                        message = params.apiResults.configResult.prompts.vivr.hook2_unconfirmed.text;
                    } else {
                        message = params.apiResults.configResult.prompts.vivr.hook1_unconfirmed_noInput_gibberish.text;
                    }
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.noInputGibbershNormal;
                    message = configSliceNumber(params, message, payload);
                }
                break;

            case INTENTS.welcomeBlacklistedNoInput:
            case FALLBACK_INTENTS.welcomeBlacklistedNumberFallback:
                /* Checking for Fallback/No input retry */
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "welcomeBlacklistedNoInputRetry");
                    if (params.welcomeBlacklistedNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.welcomeBlacklistedNoInputRetry = 0;
                welcomeBlacklistedNumberFallbackHelper(df, params);
                return df;

            case INTENTS.openRequestAskNewRequest:
                params.askNewRequest = true;
                df.setEvent("NEW_REQUEST_EVENT");
                break;
            case INTENTS.openRequestAnythingElseNo:
                message = params.apiResults.configResult.prompts.greeting.openRequestEndConversation.text;
                break;
            case INTENTS.openRequestAnythingElseRepeat:
                queryText = df._request.queryResult.queryText ? true : false;

                if (retryLimitExceeded(params, "openRequestAnythingElseRepeatFallback", 4, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.greeting.etaPositive.text;
                    message = message.replace("[SP Business Name]", params.apiResults.aniResult.spName)
                        .replace("[remaining ETA]", params.apiResults.aniResult.eta);
                }
                break;
            case INTENTS.agentTransferReasonNoInput:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "agentTransferReasonNoInputRetry");
                    if (params.agentTransferReasonNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.agentTransferReasonNoInputRetry = 0;
                if (retryLimitExceeded(params, "agentTranssferFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.greeting.somethingElseReasonNoInput.text;
                }
                break;
            case INTENTS.configOfferVisualPathYes:
                if (params.numberConfirmed) {
                    df.setOutputContext(CONTEXTS.triggerSms, OPLIFESPAN);
                    df.setEvent(EVENTS.triggerSms);
                } else {
                    df.setOutputContext(CONTEXTS.configOfferPathUnconfirmed, OPLIFESPAN);
                    df.setEvent(EVENTS.offerPathUnconfirmed);
                }
                break;
            case INTENTS.configOfferVisualUnconfirmedAgent:
            case INTENTS.configOfferVisualPathAgent:
                await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                return df;
            case INTENTS.configForceVisualPath:
                message = params.apiResults.configResult.prompts.vivr.hook1_confirmed.text;
                message = configSliceNumber(params, message);
                break;
            case INTENTS.configOfferVisualUnconfirmed:
                message = params.apiResults.configResult.prompts.vivr.hook1_unconfirmed.text;
                if (!params.apiResults.configResult.prompts.vivr.hook1_unconfirmed_noInput_gibberish.text) {
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.configOfferVisualUnconfirmedMessagePayload.tweaks;
                } else {
                    payload = df._request.queryResult.fulfillmentMessages[1].payload.noInputGibberishThreeSeconds;
                }
                message = configSliceNumber(params, message, payload);
                break;
            case INTENTS.configOfferVisualUnconfirmedYes:
                df.setOutputContext(CONTEXTS.triggerSms, OPLIFESPAN);
                df.setEvent(EVENTS.triggerSms);
                break;
            case INTENTS.configOfferVisualUnconfirmedNo:
            case INTENTS.configForceVisualPathNo:
                params["configPathNewCallbackNumber"] = true;
                df.setOutputContext(CONTEXTS.initial, OPLIFESPAN);
                df.setEvent(EVENTS.welcomeBlacklistedNumber);
                break;
            case INTENTS.configNewNumberRejectSMS:
                await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                break;
            case INTENTS.dontHaveMobile:
                //if passed through hook options then request on call flow else ask for landline number
                if(params.configpathchecked){
                    df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
                    df.setEvent(EVENTS.requestOnCall);
                }
                else {
                    df.setOutputContext(CONTEXTS.welcomeBlacklistedNumberFollowup,OPLIFESPAN_ONE);
                    params.landlineflow=true;
                    message = "Could you provide me a valid landline number for us to help you further?";
                }
                
                break;

            case INTENTS.configOfferVisualPathNo:
            case INTENTS.configOfferVisualRequestOnCall:
            case INTENTS.configOfferVisualUnconfirmedRequestOnCall:
                df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN);
                df.setEvent(EVENTS.requestOnCall);
                break;

            case INTENTS.requestOnCall:
                params.rsaPostDetails = {};
                if (retryLimitExceeded(params, "requestOnCallRetry", 2)) {
                    message = params.apiResults.configResult.prompts.vivr.serviceTypeRecognition.text;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.newRequestLanding.text;
                }
                break;

            case INTENTS.requestOnCallAccident:
            case INTENTS.requestOnCallTalkToAgent:
                return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);

            case INTENTS.requestOnCallDontKnow:
                df.setOutputContext(CONTEXTS.determineProblem, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.determineProblem);
                break;

            case INTENTS.requestOnCallNoInput:
            case FALLBACK_INTENTS.requestOnCallFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "requestOnCallNoInputRetry");
                    if (params.requestOnCallNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.requestOnCallNoInputRetry = 0;
                if (retryLimitExceeded(params, "requestOnCallFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    if (params.requestOnCallRetry >= 2) {
                        message = params.apiResults.configResult.prompts.vivr.serviceTypeRecognitionFallback.text;
                    } else {
                        message = params.apiResults.configResult.prompts.vivr.newRequestLandingFallback.text;
                    }
                }
                break;

            case INTENTS.serviceTypeYes:
                //Routes directly to Service type selected flow 
                if (!params.rsaPostDetails.serviceTypeSelected) {
                    params.rsaPostDetails.serviceTypeSelected = params.serviceTypeSelected;
                }
                let serviceTypeSelected = params.rsaPostDetails.serviceTypeSelected;
                if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.batteryService.toLowerCase()) {
                    df.setOutputContext(CONTEXTS.batteryServiceFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.batteryServiceFlow);
                } else if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.flatTireService.toLowerCase()) {
                    df.setOutputContext(CONTEXTS.flatTireFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.flatTireFlow);
                } else if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.lockedOutService.toLowerCase()) {
                    df.setOutputContext(CONTEXTS.lockedOutFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.lockedOutFlow);
                } else if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.fuelService.toLowerCase()) {
                    df.setOutputContext(CONTEXTS.outOfFuelFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.outOfFuelFlow);
                } else if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.winchService.toLowerCase()) {
                    df.setOutputContext(CONTEXTS.vehicleStuckFlow, OPLIFESPAN);
                    df.setEvent(EVENTS.vehicleStuckFlow);
                } else if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.towService.toLowerCase()) {
                    //Routes to user with vehicle
                    df.setOutputContext(CONTEXTS.userwithvehicle, OPLIFESPAN_ONE);
                    message = params.apiResults.configResult.prompts.vivr.withVehicle.text;
                }
                break;

            case INTENTS.serviceTypeYesNoInput:
            case FALLBACK_INTENTS.serviceTypeYesFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "serviceTypeYesNoInputRetry");
                    if (params.serviceTypeYesNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.serviceTypeYesNoInputRetry = 0;
                if (retryLimitExceeded(params, "serviceTypeYesFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.todayOrLaterFallback.text;
                }
                break;

            case INTENTS.serviceTypeYesImmediate:
            case INTENTS.serviceTypeYesLater:
                params.rsaPostDetails.serviceTime = "Immediate";
                if (intentName != INTENTS.serviceTypeYesImmediate) {
                    params.rsaPostDetails.serviceTime = "Later";
                }
                // In Profile determination if service type is Tow or User with vehicle is No route to Policy Confirmation  
                if (params.rsaPostDetails.serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.towService.toLowerCase() || params.rsaPostDetails.customerAtLocation === "No") {
                    df.clearContext(CONTEXTS.userwithvehicle);
                    return vinPolicyConfirmationRouteHelper(df, params);
                } else {
                    message = params.apiResults.configResult.prompts.vivr.withVehicle.text;
                }

                break;

            case INTENTS.serviceTypeNo:
                if (retryLimitExceeded(params, "serviceTypeNoRetry", 2)) {
                    return await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                }
                df.setOutputContext(CONTEXTS.requestOnCall, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.requestOnCall);
                break;

            case INTENTS.serviceTypeConfirmationNoInput:
            case FALLBACK_INTENTS.serviceTypeConfirmationFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "serviceTypeConfirmationNoInputRetry");
                    if (params.serviceTypeConfirmationNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.serviceTypeConfirmationNoInputRetry = 0;
                if (retryLimitExceeded(params, "serviceTypeConfirmationFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.serviceTypeCaptureFallback2.text.replace("<service Type>", params.serviceTypeSelected);
                }
                break;

            case INTENTS.userWithVehicleConfirmationNoInput:
            case FALLBACK_INTENTS.userWithVehicleConfirmationFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "userWithVehicleConfirmationNoInputRetry");
                    if (params.userWithVehicleConfirmationNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.userWithVehicleConfirmationNoInputRetry = 0;
                if (retryLimitExceeded(params, "userWithVehicleConfirmationFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.withVehicleFallback.text;
                }
                break;

            case INTENTS.OutOfFuel:
            case INTENTS.batteryServiceFlow:
                message = params.apiResults.configResult.prompts.vivr.fuelType.text;
                break;

            case INTENTS.batteryServiceFlowNoInput:
            case FALLBACK_INTENTS.batteryServiceFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "batteryServiceFlowNoInputRetry");
                    if (params.batteryServiceFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.batteryServiceFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "batteryServiceFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.fuelTypeFallback.text;
                }
                break;

            case INTENTS.jumpStartAttemptedNo:
                params.rsaPostDetails.jumpStartAttempted = "No";
                df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN);
                df.setEvent(EVENTS.locationCollection);
                break;
            case INTENTS.jumpStartAttemptedYes:
                params.rsaPostDetails.jumpStartAttempted = "Yes";
                params.rsaPostDetails.serviceChange = `${params.rsaPostDetails.serviceTypeSelected} - `;
                params.rsaPostDetails.serviceTypeSelected = SERVICE_TYPE_ISSUES.towService;
                params.rsaPostDetails.disablementReason = DISABLEMENT_REASON.jumpStartStalled;
                return towServiceRouteHelper(df, params);

            case INTENTS.jumpStartAttemptedNoInput:
            case FALLBACK_INTENTS.jumpStartAttemptedFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "jumpStartAttemptedNoInputRetry");
                    if (params.jumpStartAttemptedNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.jumpStartAttemptedNoInputRetry = 0;
                if (retryLimitExceeded(params, "jumpStartAttemptedFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.jumpStartConfirmationFallback.text;
                }
                break;

            case INTENTS.sysLocationCollectionNoInput:
            case FALLBACK_INTENTS.sysLocationCollectionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "sysLocationCollectionNoInputRetry");
                    if (params.sysLocationCollectionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.sysLocationCollectionNoInputRetry = 0;
                if (retryLimitExceeded(params, "sysLocationCollectionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.requestingLocationToCaptureFallback.text;
                }
                break;

            case INTENTS.sysLocationDontKnow:
                return await locateMeSMSFlowHelper(df, params);

            case INTENTS.geoCityCollectionNoInput:
            case FALLBACK_INTENTS.geoCityCollectionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "geoCityCollectionNoInputRetry");
                    if (params.geoCityCollectionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.geoCityCollectionNoInputRetry = 0;
                if (retryLimitExceeded(params, "geoCityCollectionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.captureCityNameFallback.text;
                }
                break;

            case INTENTS.geoStateCollectionNoInput:
            case FALLBACK_INTENTS.geoStateCollectionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "geoStateCollectionNoInputRetry");
                    if (params.geoStateCollectionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.geoStateCollectionNoInputRetry = 0;
                if (retryLimitExceeded(params, "geoStateCollectionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.captureStateNameFallback.text;
                }
                break;

            case INTENTS.locationCaptureIncorrect:
                return await locateMeSMSFlowHelper(df, params);

            case INTENTS.locationConfirmed:
                weatherMessage = await weatherMessagingHelper(df, params);
                if (weatherMessage && weatherMessage !== "")
                    message = `${weatherMessage} <break time="${PAUSE_TIME_VISUAL_PATH}"/> ${params.apiResults.configResult.prompts.vivr.locationType.text}`;
                else
                    message = params.apiResults.configResult.prompts.vivr.locationType.text;
                break;

            case INTENTS.locationCollectionNoInput:
            case FALLBACK_INTENTS.locationCollectionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "locationCollectionNoInputRetry");
                    if (params.locationCollectionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.locationCollectionNoInputRetry = 0;
                if (retryLimitExceeded(params, "locationCollectionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.locationCaptureFallback.text;
                    message = message.replace("<street details>", params.sysLocation["street-address"]);

                    if (params.sysLocation.city) {
                        message = message.replace("<town>", params.sysLocation.city);
                    } else {
                        message = message.replace("in <town>", "");
                    }

                    if (params.sysLocation['admin-area']) {
                        message = message.replace("<state>", params.sysLocation['admin-area']);
                    } else {
                        message = message.replace("<state>", "");
                    }

                    if (params.sysLocation.zipCode) {
                        message = message.replace("<zipcode>", `<say-as interpret-as="verbatim"> ${params.sysLocation.zipCode}</say-as>`);
                    } else {
                        message = message.replace("at zipcode <zipcode>", "");
                    }
                }
                break;

            // Added Immediate or later event after location type is detected
            case INTENTS.collectLocationType:
                params.rsaPostDetails.locationType = params.locationType;
                df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                message = params.apiResults.configResult.prompts.vivr.todayOrLater.text;
                break;
            // Previous Changes
            // No break is required since we need return vinPolicyConfirmationRouteHelper(df, params); 
            // Which is present below

            case INTENTS.notWithVehicleForLocateMe:
            case INTENTS.locateMeTextPermissionNo:
                df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                message = params.apiResults.configResult.prompts.vivr.todayOrLater.text;
                break;

            case INTENTS.locationConfirmedNoInput:
            case FALLBACK_INTENTS.locationConfirmedFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "locationConfirmationNoInputRetry");
                    if (params.locationConfirmationNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.locationConfirmationNoInputRetry = 0;
                if (retryLimitExceeded(params, "locationConfirmationFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.locationTypeFallback.text;
                }
                break;

            case INTENTS.locateMeFlow:
                message = params.apiResults.configResult.prompts.vivr.withVehicleForLocateMe.text;
                break;

            case INTENTS.locatemeFlowNoInput:
            case FALLBACK_INTENTS.locateMeFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "locateMeFlowNoInputRetry");
                    if (params.locateMeFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.locateMeFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "locateMeFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.withVehicleForLocateMeFallback.text;
                }
                break;

            case INTENTS.withVehicleForLocateMe:
                df.setOutputContext(CONTEXTS.locateMeTextPermission, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.locateMeTextPermission);
                break;

            case INTENTS.locateMeTextPermission:
                message = params.apiResults.configResult.prompts.vivr.textForLocationCapture.text;
                break;

            case INTENTS.locateMeTextPermissionYes:
                message = params.apiResults.configResult.prompts.vivr.phoneNumberConfirmation.text;
                message = configSliceNumber(params, message, payload);
                break;

            case INTENTS.locateMeTextPermissionNoInput:
            case FALLBACK_INTENTS.locateMeTextPermissionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "locateMeTextPermissionNoInputRetry");
                    if (params.locateMeTextPermissionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.locateMeTextPermissionNoInputRetry = 0;
                if (retryLimitExceeded(params, "locateMeTextPermissionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.textForLocationCaptureFallback.text;
                }
                break;

            case INTENTS.locateMeTextNumberPermissionYes:
                df.setOutputContext(CONTEXTS.sendLocateMeSMS, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.sendLocateMeSMS);
                break;

            case INTENTS.locateMeTextNumberPermissionNo:
                params.forLocateMeSMS = true;
                df.setOutputContext(CONTEXTS.initial, OPLIFESPAN_THREE);
                df.setEvent(EVENTS.welcomeBlacklistedNumber);
                break;

            case INTENTS.locateMeTextNumberPermissionNoInput:
            case FALLBACK_INTENTS.locateMeTextNumberPermissionFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "locateMeTextNumberPermissionNoInputRetry");
                    if (params.locateMeTextNumberPermissionNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.locateMeTextNumberPermissionNoInputRetry = 0;
                if (retryLimitExceeded(params, "locateMeTextNumberPermissionFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.phoneNumberConfirmationFallback.text;
                    message = configSliceNumber(params, message, payload);
                }
                break;

            case INTENTS.dontKnowFuelType:
                params.rsaPostDetails.fuelType = "Dont Know";
                df.setResponseText(response(params.apiResults.configResult.prompts.vivr.jumpStartConfirmation.text));
                df.setOutputContext(CONTEXTS.jumpStart, OPLIFESPAN);
                break;

            case INTENTS.determineProblem:
                df.setOutputContext(CONTEXTS.flatTire, OPLIFESPAN_ONE);
                message = params.apiResults.configResult.prompts.vivr.vehicleTireFunctioning.text;
                break;

            case INTENTS.VinPolicyNumberConfirm:
                let number, type;
                if (params.apiResults.configResult.client.clientType === CLIENT_TYPES.insurance) {
                    number = params.apiResults.aniResult.policyNumber.replace(/[^\w\s]/gi, "");
                    type = 'policy'
                    params.rsaPostDetails.policyNumber = number;
                } else {
                    number = params.apiResults.aniResult.vin.replace(/[^\w\s]/gi, "");
                    type = 'vin';
                    params.rsaPostDetails.vin = number
                }
                params.number = number.replace(/[^\w\s]/gi, "");
                params.type = type
                message = params.apiResults.configResult.prompts.vivr.vinPolicyRequest.text.replace("<VIN / Policy>", type);
                message = message.replace('<number>', `<prosody rate="slow" pitch="-2st"><say-as interpret-as="verbatim">${number}</say-as> ?</prosody>`);
                break;

            case INTENTS.VinPolicyNumberConfirmNoInput:
            case FALLBACK_INTENTS.VinPolicyNumberConfirmFallback:
                queryText = df._request.queryResult.queryText ? true : false;
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "vinPolicyNumberConfirmNoInputRetry");
                    if (params.vinPolicyNumberConfirmNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.vinPolicyNumberConfirmNoInputRetry = 0;
                if (retryLimitExceeded(params, "vinPolicyNumberConfirmFallback", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.vinPolicyRequestFallback.text.replace("<VIN / Policy>", params.type);
                    message = message.replace('<number>', `<prosody rate="slow" pitch="-2st"><say-as interpret-as="verbatim">${params.number}</say-as> ?</prosody>`);
                }
                break;

            case INTENTS.VinPolicyNumberConfirmNo:
                await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                break;

            case INTENTS.ConfirmName:
                let firstName = params.apiResults.aniResult.firstName ? `${params.apiResults.aniResult.firstName.toLowerCase()}` : "";
                let lastName = params.apiResults.aniResult.lastName ? `${params.apiResults.aniResult.lastName.toLowerCase()}` : "";
                let name = `${firstName} ${lastName}`;
                params.name = name;
                params.rsaPostDetails.firstName = firstName;
                params.rsaPostDetails.lastName = lastName;
                message = params.apiResults.configResult.prompts.vivr.nameConfirmation.text.replace("<Name>", name);
                break;

            case INTENTS.ConfirmNameAgentTransfer:
                await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                break;

            case INTENTS.ConfirmCarDetailsNoInput:
            case FALLBACK_INTENTS.ConfirmCarDetailsFallback:
                queryText = df._request.queryResult.queryText ? true : false;
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "ConfirmCarDetailsNoInputRetry");
                    if (params.ConfirmCarDetailsNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.ConfirmCarDetailsNoInputRetry = 0;
                if (retryLimitExceeded(params, "ConfirmCarDetailsFallback", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = "Sorry, I am unable to understand that. Can you please repeat that";
                }
                break;

            case INTENTS.ConfirmNameNoInput:
            case FALLBACK_INTENTS.ConfirmNameFallback:
                queryText = df._request.queryResult.queryText ? true : false;
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "ConfirmNameNoInputRetry");
                    if (params.ConfirmNameNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.ConfirmNameNoInputRetry = 0;
                if (retryLimitExceeded(params, "ConfirmNameFallback", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.nameConfirmationFallback.text.replace("<Name>", params.name);
                }
                break;

            case INTENTS.CarMakeAndModelNoInput:
            case FALLBACK_INTENTS.CarMakeAndModelFallback:
                queryText = df._request.queryResult.queryText ? true : false;
                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "CarMakeAndModelNoInputRetry");
                    if (params.CarMakeAndModelNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.CarMakeAndModelNoInputRetry = 0;
                if (retryLimitExceeded(params, "CarMakeAndModelFallback", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.oemMakeConfirmationFallback.text.replace("<Make>", params.rsaPostDetails.make);
                    message = message.replace("<Year>", params.rsaPostDetails.year);
                    message = message.replace("<Model>", params.rsaPostDetails.model);
                }
                break;

            case INTENTS.CarMakeAndModelResponse:
                message = params.apiResults.configResult.prompts.vivr.agentTransferDetailsValidation.text;
                await setEndResponse(df, params, message);
                break;

            case INTENTS.FlatTireFlow:
                message = params.apiResults.configResult.prompts.vivr.tyresImpacted.text;
                break;

            case INTENTS.VehicleStuckFlow:
                message = params.apiResults.configResult.prompts.vivr.vehicleStuck.text;
                break;

            case INTENTS.LockedOutFlow:
                message = params.apiResults.configResult.prompts.vivr.lockedVehicle.text;
                break;

            case INTENTS.TowService:
                message = params.apiResults.configResult.prompts.vivr.licensePlateForTow.text;
                break;

            case INTENTS.FlatTireFlowNoInput:
            case FALLBACK_INTENTS.FlatTireFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "FlatTireFlowNoInputRetry");
                    if (params.FlatTireFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.FlatTireFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "FlatTireFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.tyresImpactedFallback.text;
                }
                break;

            case INTENTS.OutOfFuelFlowNoInput:
            case FALLBACK_INTENTS.OutOfFuelFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "OutOfFuelFlowNoInputRetry");
                    if (params.OutOfFuelFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.OutOfFuelFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "OutOfFuelFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.fuelTypeFallback.text;
                }
                break;

            case INTENTS.CaptureTireToAttendNoInput:
            case FALLBACK_INTENTS.CaptureTireToAttendFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "CaptureTireToAttendNoInputRetry");
                    if (params.CaptureTireToAttendNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.CaptureTireToAttendNoInputRetry = 0;
                if (retryLimitExceeded(params, "CaptureTireToAttendFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.whichTyreFallback.text;
                }
                break;

            case INTENTS.VehicleDrivableNoInput:
            case FALLBACK_INTENTS.VehicleDrivableFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "VehicleDrivableNoInputRetry");
                    if (params.VehicleDrivableNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.VehicleDrivableNoInputRetry = 0;
                if (retryLimitExceeded(params, "VehicleDrivableFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.driveVehicleFallback2.text;
                }
                break;

            case INTENTS.VehicleStuckFlowNoInput:
            case FALLBACK_INTENTS.VehicleStuckFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "VehicleStuckFlowNoInputRetry");
                    if (params.VehicleStuckFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.VehicleStuckFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "VehicleStuckFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.vehicleStuckFallback.text;
                }
                break;

            case INTENTS.LockedOutFlowNoInput:
            case FALLBACK_INTENTS.LockedOutFlowFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "LockedOutFlowNoInputRetry");
                    if (params.LockedOutFlowNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.LockedOutFlowNoInputRetry = 0;
                if (retryLimitExceeded(params, "LockedOutFlowFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.lockedVehicleFallback.text;
                }
                break;

            case INTENTS.SpareTireNoInput:
            case FALLBACK_INTENTS.SpareTireFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "SpareTireNoInputRetry");
                    if (params.SpareTireNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.SpareTireNoInputRetry = 0;
                if (retryLimitExceeded(params, "SpareTireFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.spareTyreFallback.text;
                }
                break;

            case INTENTS.TowServiceNoInput:
            case FALLBACK_INTENTS.TowServiceFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "TowServiceNoInputRetry");
                    if (params.TowServiceNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.TowServiceNoInputRetry = 0;
                if (retryLimitExceeded(params, "TowServiceFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.licensePlateRequestFallback.text;
                }
                break;

            case INTENTS.CaptureLicensePlateNoInput:
            case FALLBACK_INTENTS.CaptureLicensePlateFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "CaptureLicensePlateNoInputRetry");
                    if (params.CaptureLicensePlateNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.CaptureLicensePlateNoInputRetry = 0;
                if (retryLimitExceeded(params, "CaptureLicensePlateFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = (params.apiResults.configResult.prompts.vivr.licensePlateCaptureFallback.text).replace("<number>", `<say-as interpret-as="verbatim">${params.licenseplatenumber}</say-as>`);
                }
                break;

            case INTENTS.BatteryServiceNoInput:
            case FALLBACK_INTENTS.BatteryServiceFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "BatteryServiceNoInputRetry");
                    if (params.BatteryServiceNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.BatteryServiceNoInputRetry = 0;
                if (retryLimitExceeded(params, "BatteryServiceFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.vehicleStartingupFallback.text;
                }
                break;

            case INTENTS.LockedOutNoInput:
            case FALLBACK_INTENTS.LockedOutFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "LockedOutNoInputRetry");
                    if (params.LockedOutNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.LockedOutNoInputRetry = 0;
                if (retryLimitExceeded(params, "LockedOutFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.getIntoVehicleFallback.text;
                }
                break;

            case INTENTS.FlatTireNoInput:
            case FALLBACK_INTENTS.FlatTireFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "FlatTireNoInputRetry");
                    if (params.FlatTireNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.FlatTireNoInputRetry = 0;
                if (retryLimitExceeded(params, "FlatTireFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.vehicleTireFunctioningFallback.text;
                }
                break;

            case INTENTS.VehicleStuckNoInput:
            case FALLBACK_INTENTS.VehicleStuckFallback:
                queryText = df._request.queryResult.queryText ? true : false;

                if (dfRequest.queryText === "DF_SYSTEM_NO_INPUT") {
                    noInputRetryLimitCheck(df, params, "VehicleStuckNoInputRetry");
                    if (params.VehicleStuckNoInputRetry === 2) break;
                }
                if (dfRequest.queryText !== "DF_SYSTEM_NO_INPUT") params.VehicleStuckNoInputRetry = 0;
                if (retryLimitExceeded(params, "VehicleStuckFallbackRetry", 3, queryText)) {
                    await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text, true);
                    return df;
                } else {
                    message = params.apiResults.configResult.prompts.vivr.driveVehicleFallback.text;
                }
                break;

            default:
                if (df._request.queryResult.intent.isFallback) {
                    let systemCounter = df.getContext(CONTEXTS.sysCounter);
                    if (parseInt(systemCounter.parameters["no-match"]) >= config.defaultCounterLimit) {
                        await setEndResponse(df, params, params.apiResults.configResult.prompts.visual.agentTransfer.text);
                        return df;
                    }
                }
        }
        df.setResponseText(response(message));
        if (payload) {
            df.setPayload(payload);
        }
        return df;
    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/set-df-responses", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = setDFResponses;
