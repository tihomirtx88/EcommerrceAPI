const CustomError = require("./../errors");

const checkPermissions = (requestUser, requestIserId) => {
    if (requestUser.role === 'admin') return;
    if(requestUser.userId === requestIserId.toString()) return;
    throw new CustomError.UnAuthorizedError('Not authorized to access this route');
};

module.exports = {
    checkPermissions
};