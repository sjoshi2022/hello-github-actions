"use strict";

/**
 * This function is to set callback api urls and returning the super token *
 * @param {object} apiData api data we get from config chat api
 * @return {string} super token
 */

module.exports.setConfigDetails = (apiData) => {
    if (apiData && Object.keys(apiData).length > 0) {
        // store graphQL query url and session chat event api details
        if (apiData.swoop && apiData.SessionEventChat) {
            if (process.env.NODE_ENVIRONMENT === "production") {
                process.env.CB_GRAPHQL_API_URL = apiData.swoop.prod.url;
                process.env.CB_SESSION_EVENT_CHAT_URL = apiData.SessionEventChat.prod.url;
                process.env.CB_SESSION_EVENT_CHAT_TOKEN = apiData.SessionEventChat.prod.headers[1].headerValue;
                if (apiData.swoop.prod && apiData.swoop.prod.headers && apiData.swoop.prod.headers[1] && apiData.swoop.prod.headers[1].headerValue && apiData.swoop.prod.headers[1].headerValue) {
                    return apiData.swoop.prod.headers[1].headerValue; // returning super token
                } else {
                    return false;
                }
            } else {
                process.env.CB_GRAPHQL_API_URL = apiData.swoop.stg.url;
                process.env.CB_SESSION_EVENT_CHAT_URL = apiData.SessionEventChat.stg.url;
                process.env.CB_SESSION_EVENT_CHAT_TOKEN = apiData.SessionEventChat.stg.headers[1].headerValue;
                if (apiData.swoop.stg && apiData.swoop.stg.headers && apiData.swoop.stg.headers[1] && apiData.swoop.stg.headers[1].headerValue && apiData.swoop.stg.headers[1].headerValue) {
                    return apiData.swoop.stg.headers[1].headerValue;  // returning super token
                } else {
                    return false;
                }
            }

        } else {
            return false;
        }
    }
    process.env.apiData = apiData;
};