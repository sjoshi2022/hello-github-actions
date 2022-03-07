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

const { VOIP_REGEX } = require("./constants");


/**
  * Method to send voip number as mobile or landline
  * @param {String} typeResult User's voip carrier type + carrier name
  * @param {String} phoneTypeRegex phoneType regex from Config API
  */
const validateVoip = (typeResult, phoneTypeRegex = VOIP_REGEX) => {
  let regex = new RegExp(phoneTypeRegex);
  //If true, VOIP has to be treated as mobile - That means voip is SMS enabled
  return regex.test(typeResult);
};

module.exports = {
  validateVoip
};
