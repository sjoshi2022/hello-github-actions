
// fetch url based on environment
module.exports.fetchApiUrl = (apiMeta) => {
    return process.env.NODE_ENVIRONMENT == "production" ? apiMeta.prodUrl : apiMeta.url;
};
