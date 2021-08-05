const router = require('express').Router();
const controller = require('../controllers/authController');
const { body} = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/registration', [
    body('username' , 'Username cannot be empty').notEmpty().isLength({min:5, max:15}),
    body('password' , 'Password has to be more than 4 and less than 15 symbols').isLength({min:5 , max:15}),
    body('email' , 'Please provide valid email').isEmail()
],controller.registration);

router.post('/login' , controller.login)
router.get('/activate/:link' , controller.activate)
router.get('/refresh' , controller.refresh)
router.post('/logout' , controller.logout)


// router.route('/users').get(roleMiddleware(['Admin']) , controller.getUsers).post(controller.getUsers); 
module.exports = router;