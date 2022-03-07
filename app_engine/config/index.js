/**
 * Copyright 2020 Quantiphi Inc. All Rights Reserved.
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

const path = require("path");
const ENV_FILE = path.join(path.dirname(__dirname), ".env");
require("dotenv").config({ path: ENV_FILE });


/**
 * Configures the application based on the NODE_ENV eg: "production, qa and develop"
 * return application configurations   
 */
const loadConfig = () => {
    switch (process.env.NODE_ENVIRONMENT) {
        case "production":
            return {
                "port": process.env.PORT || 8080,
                "fullfillmentConfig": {
                    "platformsEnabled": ["TEXT", "FACEBOOK_MESSENGER", "TELEPHONY"]
                },
                "auth": {
                    "enable": true,
                    "username": process.env.USER_NAME,
                    "password": process.env.PASSWORD
                },
                "defaultCounterLimit": 2,
                "slotFillingCounterLimit": 2,
                "unidentifiedANIWords": process.env.UNIDENTIFIED_ANI_WORDS,
                "logger": {
                    "piiFields": []
                }
            };
        case "staging":
            return {
                "port": process.env.PORT || 8080,
                "fullfillmentConfig": {
                    "platformsEnabled": ["TEXT", "FACEBOOK_MESSENGER", "TELEPHONY"]
                },
                "auth": {
                    "enable": true,
                    "username": process.env.USER_NAME,
                    "password": process.env.PASSWORD
                },
                "defaultCounterLimit": 2,
                "slotFillingCounterLimit": 2,
                "unidentifiedANIWords": process.env.UNIDENTIFIED_ANI_WORDS,
                "logger": {
                    "piiFields": []
                },
                "tweakedTwilioPhoneNumbers": {
                    "7083509152": "mobile",
                    "7813495517": "mobile",
                    "7472100671": "landline",
                    "8573990237": "landline",
                    "17083509152": "mobile",
                    "17813495517": "mobile",
                    "17472100671": "landline",
                    "18573990237": "landline"
                }
            };
        case "development":
            return {
                "port": process.env.PORT || 8080,
                "fullfillmentConfig": {
                    "platformsEnabled": ["TEXT", "FACEBOOK_MESSENGER", "TELEPHONY"]
                },
                "auth": {
                    "enable": true,
                    "username": process.env.USER_NAME,
                    "password": process.env.PASSWORD
                },
                "defaultCounterLimit": 2,
                "slotFillingCounterLimit": 2,
                "unidentifiedANIWords": process.env.UNIDENTIFIED_ANI_WORDS,
                "logger": {
                    "piiFields": []
                },
                "tweakedTwilioPhoneNumbers": {
                    "7083509152": "mobile",
                    "7813495517": "mobile",
                    "7472100671": "landline",
                    "8573990237": "landline",
                    "17083509152": "mobile",
                    "17813495517": "mobile",
                    "17472100671": "landline",
                    "18573990237": "landline"
                },
                "tweakedAllowedAniPhoneNumbers": {
                    "6075451294": true,
                    "7085680519": true
                },
                "geoCodingAPIKey": process.env.GEOCODING_API_KEY
            };
        default:
            return {
                "port": 8080,
                "fullfillmentConfig": {
                    "platformsEnabled": ["TEXT", "FACEBOOK_MESSENGER", "TELEPHONY"]
                },
                "auth": {
                    "enable": false,
                    "username": process.env.USER_NAME,
                    "password": process.env.PASSWORD
                },
                "defaultCounterLimit": 2,
                "slotFillingCounterLimit": 2,
                "unidentifiedANIWords": process.env.UNIDENTIFIED_ANI_WORDS,
                "logger": {
                    "piiFields": []
                }
            };
    }
};

module.exports = loadConfig;
