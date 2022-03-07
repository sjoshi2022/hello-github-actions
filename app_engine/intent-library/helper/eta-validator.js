"use strict";

const constants = require('../../helper/constants')

/**
 * This function is to calculate time difference*
 * @param {response} response to modify from Api
 * @return {jobData} job details
 * @return {prompts} config prompts
 */
module.exports = (response, jobData, prompts) => {
    //if eta available return the response
    if (jobData.eta && jobData.eta.current) {
        return response
    } else {
        //get the time difference for created and current time in minutes
        let createdJobTimeDif = Math.floor((new Date(Date.now()) - new Date(jobData.createdAt)) / (1000 * 60))
        if (createdJobTimeDif < 10) {
            let _response = { ...response }
            let index = _response.chips.indexOf(constants.CHIPS.towTruckTime)
            if (index !== -1) {
                _response.chips.splice(index, 1)
                _response.res = prompts.UnknownETA || constants.CHAT_CONFIG_PROMPTS.defaultUnknownEta
                return _response
            } else {
                _response.res = prompts.UnknownETA || constants.CHAT_CONFIG_PROMPTS.defaultUnknownEta
                return _response
            }
        } else {
            response.res = prompts.UnknownETA || constants.CHAT_CONFIG_PROMPTS.defaultUnknownEta
            return response
        }
    }
}