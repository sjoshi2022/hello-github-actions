// generate success response object
module.exports.successResponse = (data) => {
    return {
        success: true,
        data: data.data || {},
        message: data.message || "success"
    };
};

// generate failure response object
module.exports.errorResponse = (errorMessage, agentTransfer) => {
    return {
        success: false,
        message: errorMessage.message || "API failed",
        agentTransfer
    };
};