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

const { PHONE_NUMBER_REGEX } = require("./constants");
const { trimAni } = require("./trim-ani");


/**
 * Method to validate the phone number
 * @param {String} phoneNumber User's phone number
 * @param {String} phoneRegex phoneRegex from Config API
 */
const validatePhoneNumber = (phoneNumber, phoneRegex = PHONE_NUMBER_REGEX) => {
    phoneNumber = trimAni(phoneNumber);
    let regex = new RegExp(phoneRegex);
    return regex.test(phoneNumber); // Returns true if it is valid US number - Satisfies REGEX
};

module.exports = { validatePhoneNumber };