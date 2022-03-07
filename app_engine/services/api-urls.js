
module.exports.setapiEnvironment = (apiData) => {
    if (apiData && Object.keys(apiData).length > 0) {
        // store migration data
        if (apiData.migration) {
            let url;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.migration.prod.url;
                process.env.VOLUME_MIGRATION_URL = url.split("?")[0];
                process.env.VOLUME_MIGRATION_TOKEN = apiData.migration.prod.headers[0].headerValue;
            } else {
                url = apiData.migration.stg.url;
                process.env.VOLUME_MIGRATION_URL = url.split("?")[0];
                process.env.VOLUME_MIGRATION_TOKEN = apiData.migration.stg.headers[0].headerValue;
            }

        }

        // store twilio data
        if (apiData.phoneType) {
            let url;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.phoneType.prod.url;
                process.env.TWILIO_LOOKUP_URL = url.split("?")[0].replace("[phoneNumber]", "{{phoneNumber}}");
                process.env.TWILIO_LOOKUP_TOKEN = apiData.phoneType.prod.headers[0].headerValue;
            } else {
                url = apiData.phoneType.stg.url;
                process.env.TWILIO_LOOKUP_URL = url.split("?")[0].replace("[phoneNumber]", "{{phoneNumber}}");
                process.env.TWILIO_LOOKUP_TOKEN = apiData.phoneType.stg.headers[0].headerValue;
            }
        }

        // store ani search data
        if (apiData.aniSearch) {
            let url, headers;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.aniSearch.prod.url;
                headers = apiData.aniSearch.prod.headers;
                process.env.ANI_SEARCH_URL = url.replace("[phoneNumber]", "{{phoneNumber}}");
                process.env.ANI_SEARCH_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;
            } else {
                url = apiData.aniSearch.stg.url;
                headers = apiData.aniSearch.stg.headers;
                process.env.ANI_SEARCH_URL = url.replace("[phoneNumber]", "{{phoneNumber}}");
                process.env.ANI_SEARCH_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;

            }

        }

        // store session event data
        if (apiData.sessionEvents) {
            let url, headers;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.sessionEvents.prod.url;
                headers = apiData.sessionEvents.prod.headers;
                process.env.SESSION_EVENT_URL = url;
                process.env.SESSION_EVENT_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;
            } else {
                url = apiData.sessionEvents.stg.url;
                headers = apiData.sessionEvents.stg.headers;
                process.env.SESSION_EVENT_URL = url;
                process.env.SESSION_EVENT_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;
            }
        }

        // store allowed ani data
        if (apiData.allowedAni) {
            let url;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.allowedAni.prod.url;
                process.env.ALLOWED_ANI_URL = url.split("?")[0];
                process.env.ALLOWED_ANI_TOKEN = apiData.allowedAni.prod.headers[0].headerValue;
            } else {
                url = apiData.allowedAni.stg.url;
                process.env.ALLOWED_ANI_URL = url.split("?")[0];
                process.env.ALLOWED_ANI_TOKEN = apiData.allowedAni.stg.headers[0].headerValue;
            }

        }

        // store rsa data
        if (apiData.submitRequest) {
            let url, headers;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.submitRequest.prod.url;
                headers = apiData.submitRequest.prod.headers;
                process.env.RSA_URL = url;
                process.env.RSA_TOKEN = headers.filter(header => header.headerKey == "X-ApiKey")[0].headerValue;
            } else {
                url = apiData.submitRequest.stg.url;
                headers = apiData.submitRequest.stg.headers;
                process.env.RSA_URL = url;
                process.env.RSA_TOKEN = headers.filter(header => header.headerKey == "X-ApiKey")[0].headerValue;
            }

        }

        // store GeoCode data
        if (apiData.geocode) {
            let url, headers;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.geocode.prod.url;
                process.env.GEOCODE_URL = url.split("?")[0];
                headers = url.split("?")[3].replace("&key=", "");
                process.env.GEOCODE_TOKEN = headers;
            } else {
                url = apiData.geocode.stg.url;
                process.env.GEOCODE_URL = url.split("?")[0];
                headers = url.split("?")[3].replace("&key=", "");
                process.env.GEOCODE_TOKEN = headers;
            }

        }

        // store allowed send SMS data
        if (apiData.sendSMS) {
            if (process.env.NODE_ENVIRONMENT == "production") {
                process.env.SENDSMSLOCATION_URL = apiData.sendSMS.prod.url;
                process.env.SENDSMSLOCATION_TOKEN = apiData.sendSMS.prod.headers[0].headerValue;
            } else {
                process.env.SENDSMSLOCATION_URL = apiData.sendSMS.stg.url;
                process.env.SENDSMSLOCATION_TOKEN = apiData.sendSMS.stg.headers[0].headerValue;
            }

        }

        // store locate me clear data
        if (apiData.locateMeClear) {
            if (process.env.NODE_ENVIRONMENT == "production") {
                process.env.LOCATE_ME_CLEAR_URL = apiData.locateMeClear.prod.url;
                process.env.LOCATE_ME_CLEAR_TOKEN = apiData.locateMeClear.prod.headers[0].headerValue;
            } else {
                process.env.LOCATE_ME_CLEAR_URL = apiData.locateMeClear.stg.url;
                process.env.LOCATE_ME_CLEAR_TOKEN = apiData.locateMeClear.stg.headers[0].headerValue;
            }

        }

        // store locate me get data
        if (apiData.locateMeGet) {
            if (process.env.NODE_ENVIRONMENT == "production") {
                process.env.RETREIVE_LOCATION_DETAILS_URL = apiData.locateMeGet.prod.url;
                process.env.RETREIVE_LOCATION_DETAILS_TOKEN = apiData.locateMeGet.prod.headers[0].headerValue;
            } else {
                process.env.RETREIVE_LOCATION_DETAILS_URL = apiData.locateMeGet.stg.url;
                process.env.RETREIVE_LOCATION_DETAILS_TOKEN = apiData.locateMeGet.stg.headers[0].headerValue;
            }
        }
        // store command api data
        if (apiData.command) {
            let url, headers;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.command.prod.url;
                headers = apiData.command.prod.headers;
                process.env.COMMAND_API_URL = url;
                process.env.COMMAND_API_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;
            } else {
                url = apiData.command.stg.url;
                headers = apiData.command.stg.headers;
                process.env.COMMAND_API_URL = url;
                process.env.COMMAND_API_TOKEN = headers.filter(header => header.headerKey == "Authorization")[0].headerValue;
            }

        }
        //store regional eta zip api data
        if (apiData.regionalEtaZip) {
            let url;
            if (process.env.NODE_ENVIRONMENT == "production") {
                url = apiData.regionalEtaZip.prod.url;
                process.env.REGIONAL_ETA_ZIP_URL = url.split("?")[0];
                process.env.REGIONAL_ETA_ZIP_TOKEN = apiData.regionalEtaZip.prod.headers[0].headerValue;
            } else {
                url = apiData.regionalEtaZip.stg.url;
                process.env.REGIONAL_ETA_ZIP_URL = url.split("?")[0];
                process.env.REGIONAL_ETA_ZIP_TOKEN = apiData.regionalEtaZip.stg.headers[0].headerValue;
            }

        }
    }
    process.env.apiData = apiData;
};