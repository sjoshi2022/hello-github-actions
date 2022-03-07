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

const logger = require("../../../logger");
const { EVENTS, CONTEXTS, OPLIFESPAN, INTENTS, SERVICE_TYPE_ISSUES, OPLIFESPAN_THREE } = require("../../../helper/constants");
const { vinPolicyConfirmationRouteHelper } = require("../../helper/vin-policy-confirmation-route-helper");
const { response } = require("../../helper/responses");
/**
 * User With Vehicle Yes Intent Controller
 * @param {object} df webhook fulfillment object
 * @param {object} params Global Parameters
 */
const userWithVehicleYes = async (df, params) => {
    try {
        const intentName = df._request.queryResult.intent.displayName;

        let serviceTypeSelected = params.rsaPostDetails.serviceTypeSelected;
        //User with Vehicle for Tow service
        if (serviceTypeSelected.toLowerCase() === SERVICE_TYPE_ISSUES.towService.toLowerCase()) {
            switch (intentName) {
                case INTENTS.userWithVehicleNo:
                    params.rsaPostDetails.customerAtLocation = "No";
                    df.setOutputContext(CONTEXTS.towService, OPLIFESPAN_THREE);
                    df.setEvent(EVENTS.towService);
                    break;
                case INTENTS.userWithVehicleYes:
                    params.rsaPostDetails.customerAtLocation = "Yes";
                    df.setOutputContext(CONTEXTS.locationCollection, OPLIFESPAN);
                    df.setEvent(EVENTS.locationCollection);
                    break;
            }
        }
        else {
            //User with vehicle in profile determination
            switch (intentName) {
                case INTENTS.userWithVehicleNo:
                    params.rsaPostDetails.customerAtLocation = "No";
                    //To set fallback and no input retry as zero for immediate or later service request
                    params.serviceTypeYesNoInputRetry = 0;
                    params.serviceTypeYesFallbackRetry = 0;
                    df.setOutputContext(CONTEXTS.serviceTypeYesfollowup, OPLIFESPAN);
                    df.setResponseText(response(params.apiResults.configResult.prompts.vivr.todayorLaterRetry.text));
                    break;

                case INTENTS.userWithVehicleYes:
                    params.rsaPostDetails.customerAtLocation = "Yes";
                    return vinPolicyConfirmationRouteHelper(df, params);
            }
        }

    } catch (err) {
        logger.log("error", `Webhook call failed: ${err.message}`, "intent-library/intents/user-with-vehicle", { "message": err, session: params.dfSessionID });
        throw err;
    }
};

module.exports = userWithVehicleYes;