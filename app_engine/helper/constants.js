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


/**
 * Application Constants to be defined here
 */

const CONTEXTS = {
    globalContext: "global",
    telephonyDTMF: "telephony_dtmf",
    sysCounter: "__system_counters__",
    initial: "initial",
    silentOption: "silentoption",
    agentRequestInitialQuery: "agentrequestinitialquery",
    configureMessageFollowup: "configuremessage-followup",
    triggerSms: "trigger_sms",
    config: "config",
    newCallbackNumberFollowUp: "newcallbacknumberrequest-followup",
    askCarrierType: "askcarriertype",
    avayaSessionTelephone: "avaya-session-telephone",
    welcomeBlacklistedNumberFollowup: "welcomeblacklistednumber-followup",
    askCarrierTypeFollowup: "askcarriertype-followup",
    sipHdrs: "sip-hdrs",
    openRequestFollowup: "openrequest-followup",
    newRequestFollowup: "newrequest-followup",
    openRequestETAfollowup: "openrequesteta-followup",
    agentTransferReason: "agenttransferreason",
    configMessageNo: "configmessageno",
    configOfferPathUnconfirmed: "configofferpathunconfirmed",
    configForceVisual: "configforcevisual",
    sendLocateMeSMSContext: "sendLocateMeSMS-followup",

    // policy
    vinPolicyConfirm: "vinpolicynumberconfirm",
    confirmName: "ConfirmName-followup",
    carMakeAndModel: "CarMakeAndModel-followup",
    confirmCarDetails: "GetCarBrand-followup",
    requestOnCall: "requestoncall",
    requestOnCallFollowUp: "requestoncall-followup",
    serviceTypeSelected: "servicetypeselected",
    batteryServiceFlow: "batteryserviceflow",
    batteryServiceFlowFollowup: "batteryserviceflow-followup",
    locationCollection: "locationcollection",
    triggerSMSFollowup: "triggersms-followup",
    dontHaveMobile: "nomobile",
    locationCollectionFollowup: "locationcollection-followup",
    sendLocateMeSMS: "sendlocatemesms",
    sysLocationCollection: "syslocationcollection",
    determineProblem: "determineproblem",
    locationConfirmation: "locationconfirmation",
    locationConfirmationFollowup: "locationcollection-followup",
    geoCityCollection: "geocitycollection",
    geoStateCollection: "geostatecollection",
    locateMeFlow: "locatemeflow",
    jumpStart: "jumpstart",
    locateMeTextPermission: "locatemetextpermission",
    userwithvehicle: "userwithvehicle",

    // MVP2
    ChatEditReq: "ChatEditReq",
    ChatRaiseReq: "ChatRaiseReq",
    ChatETAPassed: "ChatETAPassed",
    ChatETAPassedFollowup: "ChatETAPassed-followup",
    ChatSpeakToSP: "ChatSpeakToSP",
    ChatCancelReq: "ChatCancelReq",
    ChatTowTruckInfo: "ChatTowTruckInfo",
    ChatTime: "ChatTime",
    ChatEndFlow: "ChatEndFlow",
    ChatSomethingElse: "ChatSomethingElse",
    ChatTalkToAgent: "ChatTalkToAgent",
    ChatSPNotArrived: "ChatSPNotArrived",
    ChatUserNotCancelRequest: "ChatUserNotCancelRequest",
    ChatInvoice: "ChatInvoice",
    ChatGetCallbackNumber: "ChatGetCallbackNumber",
    ChatGetCallbackNumberFallback: "ChatGetCallbackNumber-followup",
    ChatCancelReqConfirm: "ChatCancelReqConfirm",
    ChatSMSNotReceived: "ChatSMSNotReceived",
    ChatSMSTriggered: "ChatSMSTriggered",
    ChatAgentTransfer: "ChatAgentTransfer",
    ChatUnplannedAgentTransfer: "ChatUnplannedAgentTransfer",
    ChatTalkToAgentFallback: "ChatGetQuery-followup",
    ChatSMSWait: "ChatSMSWait",
    ChatCancelReqSuccess: "ChatCancelReqSuccess",
    ChatEditRequestFollowup: "ChatEditRequest-followup",
    ChatGetQuery: "ChatGetQuery",
    ChatWebchat: "webchat",
    ChatDummyContext: "ChatDummyContext",
    ChatDefaultWelcomeIntentFallback: "ChatDefaultWelcomeIntent-followup",
    street_address: "street-address",
    policynumber: "policynumber",
    flatTire: 'FlatTire-followup',
    lockedOut: "LockedOut-followup",
    batteryService: "BatteryService-followup",
    vehicleStuck: "VehicleStuck-followup",
    flatTireFlow: "flattireflow",
    lockedOutFlow: "lockedoutflow",
    vehicleStuckFlow: "vehiclestuckflow",
    outOfFuelFlow: "outoffuelflow",
    outOfFuelFollowup: "OutOfFuel-followup",
    flatTireFlowFollowup: "FlatTireFlow-followup",
    capturetire: "capturetire",
    towService: "towservice",
    towServicefollowup: "TowService-followup",
    capturelicenseplatefollowup: "CaptureLicensePlate-followup",
    sparetire: "sparetire",
    serviceTypeYesfollowup: "ServiceTypeYes-followup"
};

const FALLBACK_INTENTS = {
    openRequestFallback: "OpenRequestFallback",
    newRequestFallback: "NewRequestFallback",
    newCallbackNumberFallback: "NewCallbackNumberFallback",
    configureMessageFallback: "ConfigureMessageFallback",
    triggerSMSFallback: "TriggerSMSFallback",
    welcomeBlacklistedNumberFallback: "WelcomeBlacklistedNumberFallback",
    askCarrierTypeFallback: "AskCarrierTypeFallback",
    openRequestAnythingElseFallback: "OpenRequestAnythingElseFallback",
    configOfferVisualUnconfirmedFallback: "ConfigOfferVisualUnconfirmedFallback",
    configForceVisualPathFallback: "ConfigForceVisualPathFallback",

    // policy intents
    VinPolicyNumberConfirmFallback: "VinPolicyNumberConfirmFallback",
    ConfirmNameFallback: "ConfirmNameFallback",
    ConfirmCarDetailsFallback: "ConfirmCarDetailsFallback",
    CarMakeAndModelFallback: "CarMakeAndModelFallback",
    requestOnCallFallback: "RequestOnCallFallback",
    serviceTypeConfirmationFallback: "ServiceTypeConfirmationFallback",
    serviceTypeYesFallback: "ServiceTypeYesFallback",
    userWithVehicleConfirmationFallback: "UserWithVehicleConfirmationFallback",
    batteryServiceFlowFallback: "BatteryServiceFlowFallback",
    jumpStartAttemptedFallback: "JumpStartAttemptedFallback",
    locationCollectionFallback: "LocationCollectionFallback",
    locationConfirmedFallback: "LocationConfirmedFallback",
    sysLocationCollectionFallback: "SysLocationCollectionFallback",
    geoCityCollectionFallback: "GeoCityCollectionFallback",
    geoStateCollectionFallback: "GeoStateCollectionFallback",
    zipCodeCollectionFallback: "ZipCodeCollectionFallback",
    locateMeFlowFallback: "LocateMeFlowFallback",
    locateMeTextPermissionFallback: "LocateMeTextPermissionFallback",
    locateMeTextNumberPermissionFallback: "LocateMeTextNumberPermissionFallback",

    // MPV2
    ChatTowTruckInfoFallback: "ChatTowTruckInfoFallback",
    ChatSPNotArrivedFallback: "ChatSPNotArrivedFallback",
    ChatETAPassedFallback: "ChatETAPassedFallback",
    ChatCancelRequestFallback: "ChatCancelRequestFallback",
    ChatCancelRequestReason: "ChatCancelRequestReason",
    ChatCancelReqSuccessFallback: "ChatCancelReqSuccessFallback",
    ChatSMSNotReceivedFallback: "ChatSNotReceivedFallback",
    ChatEditRequestFallback: "ChatEditRequestFallback",
    ChatSpeakToSPFallback: "ChatSpeakToSPFallback",
    ChatSPNotRespondingFallback: "ChatSPNotRespondingFallback",
    ChatSMSTriggeredFallback: "SMSTriggeredFallback",
    ChatSMSWaitFallback: "SMSWaitFallback",
    ChatCancelRequestConfirmFallback: "ChatCancelRequestConfirmFallback",
    ChatCancelRequestConfirmNoFallback: "ChatCancelRequestConfirmNoFallback",
    ChatDefaultFallbackIntent: "Default Fallback Intent",
    ChatGetPickUpLocation: "ChatGetPickUpLocation",
    ChatGetDropOffLocation: "ChatGetDropOffLocation",
    ChatTowTruckTimeFallback: "ChatTowTruckTimeFallback",
    ChatUserQuery: "ChatUserQuery",
    ChatDefaultWelcomeIntentFallback: "ChatDefaultWelcomeIntentFallback",

    OutOfFuelFlowFallback: 'OutOfFuelFallback',
    VehicleStuckFlowFallback: 'VehicleStuckFlowFallback',
    VehicleDrivableFallback: 'VehicleDrivableFallback',
    LockedOutFlowFallback: 'LockedOutFlowFallback',
    FlatTireFlowFallback: 'FlatTireFlowFallback',
    CaptureTireToAttendFallback: 'CaptureTireToAttendFallback',
    SpareTireFallback: 'SpareTireFallback',
    TowServiceFallback: 'TowServiceFallback',
    CaptureLicensePlateFallback: 'CaptureLicensePlateFallback',
    BatteryServiceFallback: 'BatteryServiceFallback',
    LockedOutFallback: 'LockedOutFallback',
    FlatTireFallback: 'FlatTireFallback',
    VehicleStuckFallback: 'VehicleStuckFallback'
};

const INTENTS = {
    openRequestAgentTransfer: "OpenRequestAgentTransfer",
    newRoadsideRequest: "NewRoadsideRequest",
    smsReceived: "SMSReceived",
    smsNotReceived: "SMSNotReceived",
    triggerSMS: "TriggerSMS",
    openRequestSomethingElse: "OpenRequestSomethingElse",
    newRequestSomethingElse: "NewRequestSomethingElse",
    newRequestNoInput: "NewRequestNoInput",
    openRequestNoInput: "OpenRequestNoInput",
    welcomeBlacklistedNoInput: "WelcomeBlacklistedNoInput",
    newCallbackNoInput: "NewCallbackNoInput",
    carrierTypeNoInput: "CarrierTypeNoInput",
    askCarrierType: "AskCarrierType",
    configureMessageNoInput: "ConfigureMessageNoInput",
    triggerSMSNoInput: "TriggerSMSNoInput",
    configOfferVisualPathYes: "ConfigOfferVisualPathYes",
    configOfferVisualPathNo: "ConfigOfferVisualPathNo",
    agentTransferReason: "AgentTransferReason",
    newRequestNo: "NewRequestNo",
    openRequestAskNewRequest: "OpenRequestAskNewRequest",
    openRequestAnythingElseYes: "OpenRequestAnythingElseYes",
    openRequestAnythingElseNo: "OpenRequestAnythingElseNo",
    openRequestAnythingElseNoInput: "OpenRequestAnythingElseNoInput",
    openRequestAnythingElseRepeat: "OpenRequestAnythingElseRepeat",
    agentTransferReasonNoInput: "AgentTransferReasonNoInput",
    agentTransferReasonFallback: "AgentTransferReasonFallback",
    openRequestReason: "OpenRequestReason",
    newRequestReason: "NewRequestReason",
    configNewNumberRejectSMS: "ConfigNewNumberRejectSMS",
    configForceVisualPath: "ConfigForceVisualPath",
    configOfferVisualPathAgent: "ConfigOfferVisualPathAgent",
    configOfferVisualUnconfirmed: "ConfigOfferVisualUnconfirmed",
    configOfferVisualUnconfirmedNoInput: "ConfigOfferVisualUnconfirmedNoInput",
    configOfferVisualUnconfirmedAgent: "ConfigOfferVisualUnconfirmedAgent",
    configOfferVisualUnconfirmedNo: "ConfigOfferVisualUnconfirmedNo",
    configOfferVisualUnconfirmedYes: "ConfigOfferVisualUnconfirmedYes",
    configForceVisualPathNo: "ConfigForceVisualPathNo",
    configForceVisualPathNoInput: "ConfigForceVisualPathNoInput",
    configOfferVisualRequestOnCall: "ConfigOfferVisualRequestOnCall",
    configOfferVisualUnconfirmedRequestOnCall: "ConfigOfferVisualUnconfirmedRequestOnCall",
    requestOnCallNoInput: "RequestOnCallNoInput",
    serviceTypeYes: "ServiceTypeYes",
    serviceTypeNo: "ServiceTypeNo",
    determineProblem: "DetermineProblem",
    serviceTypeYesImmediate: "ServiceTypeYesImmediate",
    serviceTypeYesLater: "ServiceTypeYesLater",
    serviceTypeConfirmationNoInput: "ServiceTypeConfirmationNoInput",
    serviceTypeYesNoInput: "ServiceTypeYesNoInput",
    userWithVehicleNo: "UserWithVehicleNo",
    userWithVehicleYes: "UserWithVehicleYes",
    userWithVehicleConfirmationNoInput: "UserWithVehicleConfirmationNoInput",
    batteryServiceFlow: "BatteryServiceFlow",
    batteryServiceFlowNoInput: "BatteryServiceFlowNoInput",
    jumpStartAttemptedYes: "JumpStartAttemptedYes",
    jumpStartAttemptedNo: "JumpStartAttemptedNo",
    jumpStartAttemptedNoInput: "JumpStartAttemptedNoInput",
    locationCollectionNoInput: "LocationCollectionNoInput",
    locationConfirmedNoInput: "LocationConfirmedNoInput",
    sysLocationCollectionNoInput: "SysLocationCollectionNoInput",
    geoCityCollectionNoInput: "GeoCityCollectionNoInput",
    geoStateCollectionNoInput: "GeoStateCollectionNoInput",
    locateMeFlow: "LocateMeFlow",
    sysLocationDontKnow: "SysLocationDontKnow",
    zipCodeCollectionNoInput: "ZipCodeCollectionNoInput",
    captureFuelType: "CaptureFuelType",
    captureVehicleFuel: "CaptureVehicleFuel",
    requestOnCall: "RequestOnCall",
    requestOnCallDontKnow: "RequestOnCallDontKnow",
    locationCaptureIncorrect: "LocationCaptureIncorrect",
    locationConfirmed: "LocationConfirmed",
    locatemeFlowNoInput: "LocateMeFlowNoInput",
    locateMeTextPermission: "LocateMeTextPermission",
    locateMeTextPermissionNoInput: "LocateMeTextPermissionNoInput",
    locateMeTextNumberPermissionNoInput: "LocateMeTextNumberPermissionNoInput",
    locateMeTextNumberPermissionNo: "LocateMeTextNumberPermissionNo",
    locateMeTextPermissionNo: "LocateMeTextPermissionNo",
    locateMeTextPermissionYes: "LocateMeTextPermissionYes",
    locateMeTextNumberPermissionYes: "LocateMeTextNumberPermissionYes",
    withVehicleForLocateMe: "WithVehicleForLocateMe",
    requestOnCallTalkToAgent: "RequestOnCallTalkToAgent",
    requestOnCallAccident: "RequestOnCallAccident",
    dontKnowFuelType: "DontKnowFuelType",
    triggerSMSConnectAgent: "TriggerSMSConnectAgent",
    dontHaveMobile: "DontHaveMobile",
    notWithVehicleForLocateMe: "NotWithVehicleForLocateMe",
    collectLocationType: "CollectLocationType",

    // MVP2
    ChatTransferAgent: "ChatTransferAgent",
    ChatCancelRequest: "ChatCancelRequest",
    ChatCancelRequestNo: "ChatCancelRequestNo",
    ChatCancelRequestYes: "ChatCancelRequestYes",
    ChatEditRequest: "ChatEditRequest",
    ChatChangePickUpLocation: "ChatChangePickUpLocation",
    ChatChangeDropOffLocation: "ChatChangeDropOffLocation",
    ChatETAPassed: "ChatETAPassed",
    ChatETAPassedYes: "ChatETAPassedYes",
    ChatGetCallbackNumber: "ChatGetCallbackNumber",
    ChatInvoice: "ChatInvoice",
    ChatNewRequest: "ChatNewRequest",
    ChatSmsNotReceived: "ChatSmsNotReceived",
    ChatSomeThingElse: "ChatSomeThingElse",
    ChatSpeakToSP: "ChatSpeakToSP",
    ChatSPNotResponding: "ChatSPNotResponding",
    ChatSPNotRespondingYes: "ChatSPNotRespondingYes",
    ChatSPNotRespondingNo: "ChatSPNotRespondingNo",
    ChatSPNotArrived: "ChatSPNotArrived",
    ChatTalkToAgent: "ChatTalkToAgent",
    ChatThanks: "ChatThanks",
    ChatTowTruckInfo: "ChatTowTruckInfo",
    ChatTowTruckTime: "ChatTowTruckTime",
    ChatUserNotCancelRequest: "ChatUserNotCancelRequest",
    ChatCancelRequestConfirm: "ChatCancelRequestConfirm",
    ChatCancelRequestConfirmYes: "ChatCancelRequestConfirmYes",
    ChatSMSWait: "ChatSMSWait",
    ChatSMSTriggered: "ChatSMSTriggered",
    ChatCancelRequestConfirmNo: "ChatCancelRequestConfirmNo",
    ChatAgentTransfer: "ChatAgentTransfer",
    ChatUnplannedAgentTransfer: "ChatUnplannedAgentTransfer",
    ChatCancelReqSuccess: "ChatCancelReqSuccess",
    ChatGetQuery: "ChatGetQuery",
    ChatCustomerDisconnected: "ChatCustomerDisconnected",

    // Policy Flow Intents
    VinPolicyNumberConfirm: "VinPolicyNumberConfirm",
    VinPolicyNumberConfirmNoInput: "VinPolicyNumberConfirmNoInput",
    VinPolicyNumberConfirmNo: "VinPolicyNumberConfirmNo",

    ConfirmName: "ConfirmName",
    ConfirmNameAgentTransfer: "ConfirmNameAgentTransfer",
    ConfirmNameNoInput: "ConfirmNameNoInput",
    ConfirmCarDetails: "ConfirmCarDetails",
    ConfirmCarDetailsNoInput: "ConfirmCarDetailsNoInput",
    CarDetailsConfirmed: "CarDetailsConfirmed",
    CarMakeAndModel: "CarMakeAndModel",
    CarMakeAndModelNoInput: "CarMakeAndModelNoInput",
    CarMakeAndModelResponse: "CarMakeAndModelResponse",
    NumberConfirmed: "NumberConfirmed",
    FlatTireFlow: "FlatTireFlow",
    FlatTireFlowNoInput: "FlatTireFlowNoInput",
    OutOfFuel: "OutOfFuel",
    OutOfFuelFlowNoInput: 'OutOfFuelNoInput',
    CaptureTireToAttendNoInput: 'CaptureTireToAttendNoInput',
    VehicleStuckFlow: "VehicleStuckFlow",
    LockedOutFlow: "LockedOutFlow",
    SpareTireYes: 'SpareTireYes',
    SpareTireNo: 'SpareTireNo',
    SpareTireNoInput: 'SpareTireNoInput',
    LockedOutFlowYes: 'LockedOutFlowYes',
    LockedOutFlowNo: 'LockedOutFlowNo',
    VehicleDrivableYes: 'VehicleDrivableYes',
    VehicleDrivableNo: 'VehicleDrivableNo',
    VehicleDrivableNoInput: 'VehicleDrivableNoInput',
    VehicleStuckFlowNoInput: 'VehicleStuckFlowNoInput',
    LockedOutFlowNoInput: 'LockedOutFlowNoInput',
    VehicleStuckFlowYes: 'VehicleStuckFlowYes',
    VehicleStuckFlowNo: 'VehicleStuckFlowNo',
    VehicleDetailsVerificationYes: 'VehicleDetailsVerificationYes',
    VehicleDetailsVerificationNo: 'VehicleDetailsVerificationNo',
    FlatTireYes: 'FlatTireYes',
    FlatTireNo: 'FlatTireNo',
    BatteryServiceYes: 'BatteryServiceYes',
    BatteryServiceNo: 'BatteryServiceNo',
    LockedOutYes: 'LockedOutYes',
    LockedOutNo: 'LockedOutNo',
    VehicleStuckYes: 'VehicleStuckYes',
    VehicleStuckNo: 'VehicleStuckNo',
    TowService: 'TowService',
    TowServiceNoInput: 'TowServiceNoInput',
    CaptureLicensePlateNoInput: 'CaptureLicensePlateNoInput',
    CaptureLicensePlate: 'CaptureLicensePlate',
    CaptureLicensePlateNo: 'CaptureLicensePlateNo',
    CaptureLicensePlateYes: 'CaptureLicensePlateYes',
    BatteryServiceNoInput: 'BatteryServiceNoInput',
    LockedOutNoInput: 'LockedOutNoInput',
    FlatTireNoInput: 'FlatTireNoInput',
    VehicleStuckNoInput: 'VehicleStuckNoInput',
    CaptureVehicleFuel: 'CaptureVehicleFuel',
    CaptureFuelType: 'CaptureFuelType',
    SpareTireDontKnow: 'SpareTireDontKnow'
};

const EVENTS = {
    newRequest: "NEW_REQUEST_EVENT",
    openRequest: "OPEN_REQUEST_EVENT",
    configMessage: "CONFIGURE_MESSAGE_EVENT",
    agentTransfer: "AGENT_TRANSFER_EVENT",
    agentTrasnferRetryExceeded: "AGENT_TRANSFER_MAX_EVENT",
    welcomeBlacklistedNumber: "WELCOME_BLACKLISTED_NUMBER_EVENT",
    triggerSms: "TRIGGER_SMS_EVENT",
    telephonyConfig: "TELEPHONY_DTMF",
    askCarrierType: "ASK_CARRIER_TYPE_EVENT",
    endConversation: "END_CONVERSATION_EVENT",
    noInputDisconnectCall: "NO_INPUT_DISCONNECT_EVENT",
    openRequestEta: "OPEN_REQUEST_ETA_EVENT",
    newRoadsideRequest: "NEW_ROADSIDE_REQUEST_EVENT",
    dfSystemNoInput: "DF_SYSTEM_NO_INPUT",
    offerPathUnconfirmed: "OFFER_VISUAL_PATH_UNCONFIRMED_EVENT",
    forceVisualPath: "FORCE_VISUAL_PATH_EVENT",
    requestOnCall: "REQUEST_ON_CALL_EVENT",
    batteryServiceFlow: "BATTERY_SERVICE_FLOW_EVENT",
    flatTireFlow: "FLAT_TIRE_FLOW_EVENT",
    lockedOutFlow: "LOCKED_OUT_FLOW_EVENT",
    vehicleStuckFlow: "VEHICLE_STUCK_FLOW_EVENT",
    outOfFuelFlow: "OUT_OF_FUEL_FLOW_EVENT",
    locationCollection: "LOCATION_COLLECTION_EVENT",
    vinPolicyNumber: "VIN_POLICY_NUMBER_EVENT",
    sendLocateMeSMS: "SEND_LOCATE_ME_SMS_EVENT",
    sysLocationCollection: "SYS_LOCATION_COLLECTION_EVENT",
    towService: "TOW_SERVICE_FLOW_EVENT",
    determineProblem: "DETERMINE_PROBLEM_EVENT",
    locateMeFlow: "LOCATE_ME_FLOW_EVENT",
    locateMeTextPermission: "LOCATE_ME_TEXT_PERMISSION_EVENT",

    // MVP2
    ChatCancelReqConfirm: "CHAT_CANCEL_REQ_CONFIRM_EVENT",
    ChatCancelReqSuccess: "CHAT_CANCEL_REQ_SUCCESS_EVENT",
    ChatSMSWait: "CHAT_SMS_WAIT_EVENT",
    ChatSMSTriggered: "CHAT_SMS_TRIGGERED_EVENT",
    ChatAgentTransfer: "CHAT_AGENT_TRANSFER_EVENT",
    CHAT_GET_QUERY: "CHAT_GET_QUERY_EVENT",
    ChatUnplannedAgentTransfer: "CHAT_UNPLANNED_AGENT_TRANSFER_EVENT",

    // Policy Flow Events
    vinPolicyNumber: "VIN_POLICY_NUMBER_EVENT",
    vinPolicyConfirm: "VIN_POLICY_CONFIRM_EVENT",
    carDetails: "CAR_DETAILS_EVENT",
    immediateOrLaterEvent: "IMMEDIATE_OR_LATER_EVENT",
    setOption: "SET_OPTION"
};

const CHIPS = {
    editRequest: "Edit service request",
    newRequest: "Raise a new request",
    etaPassed: "My ETA has passed",
    speakToSp: "Speak to the service provider",
    cancelRequest: "Cancel my request",
    towTruckInfo: "Where is the tow truck",
    towTruckTime: "How much longer will it take",
    someThingElse: "Something else",
    thanks: "Thanks",
    talkToAgent: "Talk to an agent",
    spNotArrived: "service provider has not arrived",
    noOneResponding: "No one's responding",
    pickUpLocation: "Change pick-up location",
    dropOffLocation: "Change tow drop-off location",
    userNotCancelRequest: "I did not cancel my request",
    smsNotReceived: "I did not get any SMS",
    smsReceived: "Thanks, Got it",
    invoice: "Invoice",
    yes: "Yes",
    no: "No",
    noThanks: "No,Thanks",
    nolongerRequireService: "No longer require service",
    serviceTakingLong: "Service is taking too long",
    locatedAlternativeService: "Located an alternative service",
    other: "Other"
};

const MORE = "more";

// Context lifespan
const OPLIFESPAN = 2; // Default span
const OPLIFESPAN_ZERO = 0;
const OPLIFESPAN_ONE = 1;
const OPLIFESPAN_THREE = 3;

const PHONE_NUMBER_REGEX = "^1?[2-9]\\d{9}#?$";

const VOIP_REGEX = "^(mobile|voip.*(sms-|sms\/|mms-))";

const ANI_REGEX = "[^0-9]";

const PAUSE_TIME = "2s";

const PAUSE_TIME_VISUAL_PATH = "1s";

const CONFIG_MSG_PAUSE_TIME = "3s"; // Instead of 3 second pause it is given as 2 second because 1 second is of fullstop

const TRIGGER_SMS_PAUSE_TIME = "4s"; // Instead of 5 second pause it is given as 4 second because 1 second is of fullstop

const LOCATE_ME_API_MAX_WAIT_TIME = "7000";

const NO_INPUT_MESSAGE = "It seems that there are no responses from you. The call will be disconnected shortly. Thank you!";

const PLATFORM = {
    oneRoad: "OneRoad",
    ngp: "NGP"
};

const CONFIG_API_PARAMS = {
    appName: "RoadsideIVA",
    calltype: "NewCall",
    platform: "Avaya"
};

const RSAPI_STRING = "52534150493a";
const ONEROAD_SIP_HEADER_VALUE = "4e3a";
const TELEPHONY_DTMF_DIGIT_YES = "1";
const TELEPHONY_DTMF_DIGIT_NO = "2";
const SILENT_OPTION_DTMF = "3";

const PHONE_TYPES = {
    landline: "landline",
    mobile: "mobile",
    voip: "voip"
};

const CALL_TYPES = {
    newCall: "NewCall",
    callback: "Callback"
};

const REGIONS = {
    east: "EAST",
    west: "WEST",
    stg: "STG",
    dev: "DEV"
};

const FLOW_NAMES = {
    incorrectFlow: "incorrectFlow",
    requestFlow: "requestFlow"
};

const SESSION_EVENTS = {
    initiateSession: "InitiateSession",
    resendRequested: "ResendRequested",
    transferRequested: "TransferRequested"
};

const CLIENT_TYPES = {
    insurance: "INS",
    oem: "OEM"

};

const SERVICE_TYPE_ISSUES = {
    towService: "Tow Service",
    batteryService: "Battery Service",
    flatTireService: "Flat Tire Service",
    lockedOutService: "Locked Out Service",
    fuelService: "Fuel Service",
    winchService: "Winch Service"
};

const FUEL_TYPES = {
    gasoline: "gasoline",
    diesel: "diesel",
    hybrid: "hybrid",
    other: "other",
    naturalGas: "natural gas",
    unleadedGas: "unleaded gas",
    petrol: "petrol",
    electric: "electric"
};

const DISABLEMENT_REASON = {
    jumpStartDefaultDidNotStall: "Jump Start (Did not stall while driving)",
    jumpStartStalled: "Jump Start (stall while driving)",
    towNotLeakingFuel: "Tow (Not leaking fuel)",
    oneFlatTire: "One Flat Tire - Good spare",
    outOfFuelCostNotCovered: "Out of Fuel (Cost of fuel not covered)",
    vehicleStuck: "Vehicle Stuck",
    lockoutKeysInCar: "Lockout - Keys in car",
    default: "Default"
};

const VALUE_UNDEFINED = "undefined";

const PLATFORM_ID = "Avaya";

const ISCANCELLABLE = [
    "Predraft", "Pending", "Draft",
    "Assigned", "Dispatched",
    "EnRoute", "Accepted", "Submitted",
    "Unassigned", "EnRoute", "Created",
    "ETAExtended"
];

const ETA_EXPIRATION_CHECK = [
    "Assigned", "Dispatched", "EnRoute", "Accepted", "ETAExtended"
];

const DIRECT_AGENT_TRANSFER_CASES = [
    "ETARejected", "Expired", "Deleted", "Reassigned"
];

const CHAT_CONFIG_PROMPTS = {
    apiFailure: "I am currently unable to process your request. Please wait while I connect you to an agent.",
    sessionRefresh: "Your session expired. To re-initiate chat please click on the END CHAT button",
    defaultUnknownEta: "I see that your request is in progress. We are awaiting dispatch details from our partner. As soon as we secure the service, you will receive a Text Message with the ETA. What would you like to do?"
};

const CONTENT_TYPE = "application/json";

const API_METHODS = {
    get: "GET",
    post: "POST"
};

const MAX_API_TIME_CHECK = 5000;

const ONE_SECOND = 1000;

const SESSION_COMMANDS = {
    speak: "Speak",
    wait: "Wait",
    requestTransfer: "RequestTransfer",
    transfer: "Transfer",
    endCall: "EndCall",
    resendText: "ResendText",
    clearQueue: "ClearQueue",
    pollingTime: "PollingTime"
};

const COMMAND_API_COMMANDS = {
    speak: "Speak",
    clearQueue: "ClearQueue"
};

const RSAREQUESTID = "RsaRequestID";

const USER_SIP_HEADER = "#user-sip-header";

const WEATHER_MESSAGING_COLOR = {
    Blue: "Blue",
    Black: "Black",
    Yellow: "Yellow"
}

const VISUAL_PATH_CHOICES = {
    default: "Default", // this is the normal pathing with forceVisualChoice and directToAgent both being false
    forceVisual: "ForceVisual", // this is assigned for forceVisualChoice set to true
    directToAgent: "DirectToAgent", // this is assigned for directToAgent set to true
    forceSpeech: "ForceSpeech" // this is the new path to handle a client not being available on the web platform
}

module.exports = {
    CONTEXTS,
    EVENTS,
    CHIPS,
    OPLIFESPAN,
    OPLIFESPAN_ONE,
    PHONE_NUMBER_REGEX,
    PAUSE_TIME,
    PHONE_TYPES,
    CALL_TYPES,
    CONFIG_MSG_PAUSE_TIME,
    TRIGGER_SMS_PAUSE_TIME,
    PLATFORM,
    RSAPI_STRING,
    ONEROAD_SIP_HEADER_VALUE,
    CONFIG_API_PARAMS,
    TELEPHONY_DTMF_DIGIT_YES,
    TELEPHONY_DTMF_DIGIT_NO,
    SILENT_OPTION_DTMF,
    FALLBACK_INTENTS,
    INTENTS,
    VOIP_REGEX,
    ANI_REGEX,
    REGIONS,
    SESSION_EVENTS,
    CLIENT_TYPES,
    PLATFORM_ID,
    FLOW_NAMES,
    PAUSE_TIME_VISUAL_PATH,
    ISCANCELLABLE,
    ETA_EXPIRATION_CHECK,
    DIRECT_AGENT_TRANSFER_CASES,
    CHAT_CONFIG_PROMPTS,
    OPLIFESPAN_THREE,
    LOCATE_ME_API_MAX_WAIT_TIME,
    SERVICE_TYPE_ISSUES,
    FUEL_TYPES,
    MORE,
    VALUE_UNDEFINED,
    DISABLEMENT_REASON,
    NO_INPUT_MESSAGE,
    CONTENT_TYPE,
    API_METHODS,
    MAX_API_TIME_CHECK,
    SESSION_COMMANDS,
    COMMAND_API_COMMANDS,
    RSAREQUESTID,
    ONE_SECOND,
    USER_SIP_HEADER,
    WEATHER_MESSAGING_COLOR,
    VISUAL_PATH_CHOICES,
    OPLIFESPAN_ZERO
};
