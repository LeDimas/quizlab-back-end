const User = require('../models/User');
const Role = require('../models/Role');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService')
const ApiError = require('../exceptions/apiError')


class AuthController{


    async registration(req, res , next){
        try {

            const errors = validationResult(req);

            if(!errors.isEmpty()) return next(ApiError.BadRequest('Validation error' , errors.array()))
            
            const {username , password , email} = req.body;

            const userData = await UserService.registration(email , password , username)

            res.cookie('refreshToken' , userData.refreshToken , {maxAge: 30 * 24 * 60 * 60 * 1000 , httpOnly:true})
            return res.status(201).json(userData);
            
        } catch (error) {
             next(error)
        }
    }


    async login(req,res , next){
        try {
            const {email , password} = req.body;
            const userData = await UserService.login(email , password)
            res.cookie('refreshToken' , userData.refreshToken , {maxAge:30*24*60*60*1000 , httpOnly:true})
            return res.status(201).json(userData);
        } catch (error) {
           next(error)
        }
    }


    async logout (req,res,next){
        try{
            const {refreshToken} = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie('refreshToken')
            return res.json(token)
        }catch(e){
            next(e)
        }
    }
    async refresh (req,res,next){
        try{
            const {refreshToken} = req.cookies;
            const userData = await UserService.refresh(refreshToken)
            res.cookie('refreshToken' , userData.refreshToken , {maxAge:30*24*60*60*1000 , httpOnly:true})
            return res.status(201).json(userData);
        }catch(e){
            next(e)
        }
    }
    async activate (req,res,next){
        try{
            const activationLink = req.params.activationLink
            await UserService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL)
        }catch(e){
            next(e)
        }
    }

    async getUsers(req,res){
        try {
            const users = await User.find();
            res.json(users); 
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AuthController();