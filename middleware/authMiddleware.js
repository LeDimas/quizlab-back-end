const jwt = require('jsonwebtoken');
require('dotenv').config()
const ApiError = require('../exceptions/apiError')
const TokenService = require('../services/TokenService')

module.exports = function (req,res,next){

    if(req.method === "OPTIONS"){
        next();
    }

    try {

        const authorizationHeader = req.headers.authorization

        if(!authorizationHeader) return next(ApiError.UnauthorizedError())

        const token = authorizationHeader.split(' ')[1];

        if(!token) return next(ApiError.UnauthorizedError())

        const userData = TokenService.validateAccessToken(token)

        if(!userData) return next(ApiError.UnauthorizedError())

        req.user = userData;

        next();

    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
};