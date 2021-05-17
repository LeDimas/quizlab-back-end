const router = require('express').Router();
const controller = require('../controllers/authController');
const {check , body} = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.route('/registration').get(controller.getRegistrationView).post([
    check('username' , 'Username cannot be empty').notEmpty().isLength({min:5, max:15}).trim().escape(),
    check('password' , 'Password has to be more than 4 and less than 15 symbols').isLength({min:5 , max:15}).isStrongPassword(),

    // body('passwordConfirmation').custom((value , req)=> {
    //     if(value !== req.body.password) throw new Error("Password confirmation doesn't match password")
    // }),
    
    check('email' , 'Please provide valid email').isEmail()
],controller.registration);

router.route('/login').get(controller.getLoginView).post(controller.login);

router.route('/users').get(roleMiddleware(['Admin']) , controller.getUsers).post(controller.getUsers); 

module.exports = router;