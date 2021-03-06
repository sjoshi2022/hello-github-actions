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

const { ANI_REGEX } = require("./constants");


/**
  * Method to replace and trim aniNumber to 10 digits and remove all special characters
  * @param {String} aniNumber User's number
*/
const trimAni = (aniNumber) => {
	let regex = new RegExp(ANI_REGEX, "g");  // g - globally removing all characters except numbers
	aniNumber = aniNumber.replace(regex, "");

	/* Removing country code if 11 digits */
	if (aniNumber.length === 11 && aniNumber.charAt(0) === "1") {
		aniNumber = aniNumber.substring(1);
	}
	return aniNumber;
};

module.exports = { trimAni };
