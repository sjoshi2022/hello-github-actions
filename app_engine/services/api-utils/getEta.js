"use strict";

/**
 * This is function to calculate eta*
 * @param {string} etaData current eta of the job from Api
 * @return {number} calculated eta
 */
exports.getTimeDifference = etaData =>  Math.floor((new Date(etaData) - new Date(Date.now())) / (1000 * 60));
