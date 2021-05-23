const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const user = require('../models/User');
const jwt = require('jsonwebtoken');
const {secret} = require('../jwt_config');

const generateAccessToken = (id , roles) => {

    const payload ={
        id,
        roles
    }

    return jwt.sign(payload , secret , {expiresIn:"24h"} );
}

class AuthController{

    getRegistrationView(req,res){
        res.send('hi from auth controller get registration veiw');
    }

    async initRoles(req,res){

    }

    async registration(req,res){
        try {

            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({message:"Registration error" , errors})
            }


            const {username , password , email} = req.body;

            const candidate = await User.findOne({username});

            if(candidate){
                return res.status(400).json({message:"User with this name already exists"});
            }

            //Store hash as password
            const hashedPassword = bcrypt.hashSync(password, 7);
            
            //TODO make dynamic
            let userRole = await Role.findOne({value:"User"});

            if(!userRole){
                userRole = await Role.create({value : "User"});
            }
            
            const user = new User({username: username , password:hashedPassword ,email:email , roles: [userRole.value] });

            await user.save();

            return res.json({message:"User has been succesfully registered"});


            

            
        } catch (error) {
            console.log(error);
            res.status(400).json({message:'Registration error'})
        }
    }

    getLoginView(req,res){

        res.send('hi from authcontroller get login view');

    }

    async login(req,res){
        try {
            const {username , password} = req.body;

            const user = await User.findOne({username});

            if(!user){
                return res.status(400).json({message:`User ${username} is not found`});
            }

            const validPassword = bcrypt.compareSync(password , user.password);

            if(!validPassword)
                return res.status(400).json({message:'Incorrect password'})
            

            const token = generateAccessToken(user._id , user.roles) ;

            return res.json({token});

        } catch (error) {
            console.log(error);
            res.status(400).json({message:'Login error'})
        }
    }

    getUsersView(req,res){
        res.send('hi from auth controller get users view');
    }

    async getUsers(req,res){
        try {

            const users = await User.find();

            res.json(users); 
        } catch (error) {
            console.log(error);
            res.status(400).json({message:'User fetch error'})
        }
    }
}

module.exports = new AuthController();