const User  = require('../models/User');
const bcrypt = require('bcrypt');
const uuid = require('uuid')
const MailService = require('../services/MailService')
const TokenService = require('../services/TokenService')
const UserDto = require('../dtos/UserDto')
const ApiError = require('../exceptions/apiError')

class UserService {


    async mapTokensUser(user){

       const userDto = new UserDto(user)
       const tokens = TokenService.generateTokens({...userDto})
       await TokenService.saveToken(userDto.id , tokens.refreshToken)

       return { ...tokens , user:userDto }
    }

    async registration(email,password ,username){
        
        const candidate = await User.findOne({email});
        
        if(candidate) throw ApiError.BadRequest(`User with ${email} already exists`)
        

        //Store hash as password
        const hashedPassword = bcrypt.hashSync(password, 7);
        
        //TODO make dynamic
        // let UserRole = await Role.findOne({value:"User"});
        // if(!UserRole) UserRole = await Role.create({value : "User"});
        //=========
        
        const activationLink = uuid.v4();
        const user = User.create({username: username , password:hashedPassword  ,email:email ,  activationLink });

        await MailService.sendActivationMail(email , `${process.env.API_URL}/api/auth/activate/${activationLink}`)

        return await this.mapTokensUser(user)

    }

    async login(email , password){
        const user = await User.findOne({email});

        if(!user)
            throw ApiError.BadRequest(`User ${email} is not found`);
        
        const validPassword = await bcrypt.compare(password , user.password);

        if(!validPassword)
            throw ApiError.BadRequest(`Incorrect credentials`)

        return await this.mapTokensUser(user)
    }

    async activate(activationLink){
        const user = await User.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequest(`Incorrect activation link`)
        }
        user.isActivated = true
        await user.save()
    }

    async refresh(refreshToken){
        if(!refreshToken) throw ApiError.UnauthorizedError()

        const userData = TokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await TokenService.findToken(refreshToken)

        if(!userData || !tokenFromDb) throw ApiError.UnauthorizedError()

        const user = await User.findById(userData.id)

        return await this.mapTokensUser(user)
    }

    async logout(refreshToken){
        const token = await TokenService.removeToken(refreshToken)
        return token
    }

}

module.exports = new UserService()