module.exports.apiConfig = {
    twilioLookup: {
        url: "https://lookups.twilio.com/v1/PhoneNumbers/{{phoneNumber}}",
        prodUrl: "https://lookups.twilio.com/v1/PhoneNumbers/{{phoneNumber}}",
        token: process.env.TWILIO_LOOKUP_TOKEN,
        method: "GET"
    },
    aniSearch: {
        url: "http://agero-stg.apigee.net/ondemandapi/v2/ProfileData/ani/{{phoneNumber}}",
        prodUrl: "https://api.enterprise.agero.com/ondemandapi/v2/ProfileData/ani/{{phoneNumber}}",
        token: process.env.ANI_SEARCH_TOKEN,
        method: "GET"
    },
    volumeMigration: {
        url: "https://agero-stg.apigee.net/ondemandapi/migration",
        prodUrl: "https://api.enterprise.agero.com/ondemandapi/migration",
        token: process.env.VOLUME_MIGRATION_TOKEN,
        method: "GET"
    },
    allowedAni: {
        url: "https://agero-stg.apigee.net/ivrblacklist/V1/ivr-allowed-ani",
        prodUrl: "https://api.enterprise.agero.com/ivrblacklist/v1/ivr-allowed-ani",
        token: process.env.ALLOWED_ANI_TOKEN,
        method: "GET"
    },
    rsa: {
        url: "https://agero-stg.apigee.net/rsahelpapi/ANY/V1/RSA",
        prodUrl: "https://api.enterprise.agero.com/rsahelpapi/ANY/V1/RSA",
        token: process.env.RSA_TOKEN,
        method: "POST"
    },
    sessionEvent: {
        url: "https://agero-stg.apigee.net/ondemandapi/SessionEvents",
        prodUrl: "https://api-gateway.enterprise.agero.com/ondemandapi/SessionEvents",
        token: process.env.SESSION_EVENT_TOKEN,
        method: "POST"
    },
    config: {
        url: "https://agero-stg.apigee.net/ivrconfig/dev/ivr_configuration",
        prodUrl: "https://api-gateway.enterprise.agero.com/ivrconfig/prod/ivr_configuration",
        token: process.env.CONFIG_TOKEN,
        method: "GET"
    },
    geoCode: {
        url: "https://maps.googleapis.com/maps/api/geocode/json",
        prodUrl: "https://maps.googleapis.com/maps/api/geocode/json",
        token: process.env.GEOCODE_TOKEN,
        method: "GET"
    },
    sendSMSLocation: {
        url: " https://agero-stg.apigee.net/twowaycommapi/v2/Messages",
        prodUrl: "https://api.enterprise.agero.com/twowaycommapi/v2/Messages",
        token: process.env.SENDSMSLOCATION_TOKEN,
        method: "POST"
    },
    retreiveLocationDetails: {
        url: "https://agero-stg.apigee.net/locatemeapi/api/getlocation/[phoneNumber]",
        prodUrl: "https://api.enterprise.agero.com/locatemeapi/api/getlocation/[phoneNumber]",
        token: process.env.RETREIVE_LOCATION_DETAILS_TOKEN,
        method: "GET"
    },
    locateMeClear: {
        url: "https://agero-stg.apigee.net/locatemeapi/api/clearlocation/[phoneNumber]",
        prodUrl: "https://api.enterprise.agero.com/locatemeapi/api/clearlocation/[phoneNumber]",
        token: process.env.LOCATE_ME_CLEAR_TOKEN,
        method: "GET"
    },
    command: {
        url: "https://agero-stg.apigee.net/ondemandapi/Command",
        prodUrl: "https://api-gateway.enterprise.agero.com/ondemandapi/Command",
        token: process.env.COMMAND_API_TOKEN,
        method: "POST"
    },
    regionalEtaZip: {
        url: "https://agero-stg.apigee.net/regional-eta-api/v1/eta/maximumacceptable",
        prodUrl: "https://api.enterprise.agero.com/regional-eta-api/v1/eta/maximumacceptable",
        token: process.env.REGIONAL_ETA_ZIP_TOKEN,
        method: "GET"
    }
};