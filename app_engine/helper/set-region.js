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

const logger = require("../logger");
const { REGIONS } = require("../helper/constants");


/**
  * Method to set the region
  * @param {String} RegionFromAvaya region coming in payload
  * @param {object} params Global Parameters
  */
const setRegion = (RegionFromAvaya, params) => {
    let region;
    if (RegionFromAvaya.includes(process.env.MPP_NAMES_EAST)) {
        region = REGIONS.east;
    } else if (RegionFromAvaya.includes(process.env.MPP_NAMES_WEST)) {
        region = REGIONS.west;
    } else if (RegionFromAvaya.includes(process.env.MPP_NAMES_STG)) {
        region = REGIONS.stg;
    } else if (RegionFromAvaya.includes(process.env.MPP_NAMES_DEV)) {
        region = REGIONS.dev;
    } else {
        // if no matching prefix found, default region is set to DEV
        region = REGIONS.dev;
        logger.log("warn", "MPP prefix not matched with region", "helper/region-info", { session: params.dfSessionID });
    }
    return region;
};

module.exports = {
    setRegion
};