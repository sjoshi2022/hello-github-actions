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

const { CONTEXTS, CHIPS } = require("../../helper/constants");


/**
  * Helper function to check whether the event is present or not
  */
const chatResponses = async (jobDetailsParams, params) => {
    let SPName = jobDetailsParams.partner && jobDetailsParams.partner.company && jobDetailsParams.partner.company.name || "";
    let minutes = jobDetailsParams.calculatedETA || "";
    let serviceType = jobDetailsParams.service && jobDetailsParams.service.name || "";
    let location = jobDetailsParams.location && jobDetailsParams.location.serviceLocation && jobDetailsParams.location.serviceLocation.address || "";

    let responses = {
        "Initial": {
            res: params.chatConfigApi.initial,
            contexts: [CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.towTruckTime, CHIPS.thanks]
        },
        "Created": {
            res: params.chatConfigApi.created,
            contexts: [CONTEXTS.ChatEditReq, CONTEXTS.ChatEditRequestFollowup, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.editRequest, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "Predraft": {
            res: params.chatConfigApi.initial,
            contexts: [CONTEXTS.ChatEditReq, CONTEXTS.ChatEditRequestFollowup, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.editRequest, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "Draft": {
            res: params.chatConfigApi.initial,
            contexts: [CONTEXTS.ChatEditReq, CONTEXTS.ChatEditRequestFollowup, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.editRequest, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "AutoAssigning": {
            res: params.chatConfigApi.processOfAllocatingSP,
            contexts: [CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.towTruckTime, CHIPS.thanks]
        },
        "Pending": {
            res: params.chatConfigApi.requestInProcess,
            contexts: [CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.cancelRequest, CHIPS.towTruckTime, CHIPS.thanks]
        },
        "Unassigned": {
            res: params.chatConfigApi.processOfAllocatingSP,
            contexts: [CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.cancelRequest, CHIPS.towTruckTime, CHIPS.thanks]
        },
        "Assigned": {
            res: params.chatConfigApi.SPShouldArriveInMinutes.replace("$SPName", SPName).replace("$serviceType", serviceType).replace("$minutes", minutes).replace("$location", location),
            contexts: [CONTEXTS.ChatETAPassed, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "Accepted": {
            res: params.chatConfigApi.SPShouldArriveInMinutes.replace("$SPName", SPName).replace("$serviceType", serviceType).replace("$minutes", minutes).replace("$location", location),
            contexts: [CONTEXTS.ChatETAPassed, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "Rejected": {
            res: params.chatConfigApi.processOfAllocatingSP,
            contexts: [CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse, CONTEXTS.ChatTime],
            chips: [CHIPS.thanks, CHIPS.towTruckTime]
        },
        "ETAExtended": {
            res: params.chatConfigApi.revisedETAAvailable.replace("$SPName", SPName).replace("$serviceType", serviceType).replace("$minutes", minutes).replace("$location", location),
            contexts: [CONTEXTS.ChatETAPassed, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.etaPassed, CHIPS.speakToSp, CHIPS.cancelRequest]
        },
        "Submitted": {
            res: params.chatConfigApi.revisedETAUnavailable.replace("$SPName", SPName).replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "ETARejected": {
            res: params.chatConfigApi.connectToAgentForHelp,
            contexts: [],
            agentTransfer: true
        },
        "Expired": {
            res: params.chatConfigApi.connectToAgentForHelp,
            contexts: [],
            agentTransfer: true
        },
        "Dispatched": {
            res: params.chatConfigApi.SPShouldArriveInMinutes.replace("$SPName", SPName).replace("$serviceType", serviceType).replace("$minutes", minutes).replace("$location", location),
            contexts: [CONTEXTS.ChatETAPassed, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "EnRoute": {
            res: params.chatConfigApi.SPShouldArriveInMinutes.replace("$SPName", SPName).replace("$serviceType", serviceType).replace("$minutes", minutes).replace("$location", location),
            contexts: [CONTEXTS.ChatETAPassed, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.cancelRequest, CHIPS.towTruckTime]
        },
        "OnSite": {
            res: params.chatConfigApi.SPArrivedPickup.replace("$SPName", SPName).replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse, CONTEXTS.ChatSPNotArrived],
            chips: [CHIPS.thanks, CHIPS.talkToAgent, CHIPS.spNotArrived]
        },
        "Towing": {
            res: params.chatConfigApi.SPArrivedPickupTowing.replace("$SPName", SPName).replace("$serviceType", serviceType) + ". " + params.chatConfigApi.anythingElse,
            contexts: [CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse, CONTEXTS.ChatSPNotArrived],
            chips: [CHIPS.speakToSp, CHIPS.thanks, CHIPS.spNotArrived]
        },
        "TowDestination": {
            res: params.chatConfigApi.SPArrivedDropoff.replace("$SPName", SPName),
            contexts: [CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTowTruckInfo, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.thanks, CHIPS.spNotArrived]
        },
        "Stored": {
            res: params.chatConfigApi.completed.replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.speakToSp, CHIPS.thanks, CHIPS.someThingElse]
        },
        "Released": {
            res: params.chatConfigApi.completed.replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatTime, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.towTruckTime, CHIPS.thanks, CHIPS.spNotArrived]
        },
        "Deleted": {
            res: params.chatConfigApi.connectToAgentForHelp,
            contexts: [],
            agentTransfer: true
        },
        "Completed": {
            res: params.chatConfigApi.completed.replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatRaiseReq, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.newRequest, CHIPS.thanks]
        },
        "Canceled": {
            res: params.chatConfigApi.cancelled.replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatRaiseReq, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse, CONTEXTS.ChatUserNotCancelRequest],
            chips: [CHIPS.newRequest, CHIPS.thanks, CHIPS.userNotCancelRequest]
        },
        "GOA": {
            res: params.chatConfigApi.GOA.replace("$location", location),
            contexts: [CONTEXTS.ChatRaiseReq, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse],
            chips: [CHIPS.newRequest, CHIPS.speakToSp, CHIPS.thanks]
        },
        "Reassigned": {
            res: params.chatConfigApi.connectToAgentForHelp,
            contexts: [],
            agentTransfer: true
        },
        "Unsuccessful": {
            res: params.chatConfigApi.unsuccessful.replace("$serviceType", serviceType),
            contexts: [CONTEXTS.ChatRaiseReq, CONTEXTS.ChatEndFlow],
            chips: [CHIPS.newRequest, CHIPS.talkToAgent]
        },
    };

    return responses[jobDetailsParams.status];
};

module.exports = { chatResponses };
