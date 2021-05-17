const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/quizController');


//TODO:: add middleware
/**
 * надо ограничить поиск для публичных
 * и для отдельных лиц
 */

//auth middleware must provide user id

/**
 * ================================PUT/UPDATE SECTION================================
 */

//#region Update

//Note: to make a call to this route , json must be wrapped around [] as iterable
router.put('/quiz/:quizId' , authMiddleware , controller.updateQuiz)


//TODO ВПАЯТЬ СОКЕТЫ
router.put('/quiz/:quizId/question/:questionId' , authMiddleware , controller.updateQuestion)

//#endregion

/**
 * =============================PUT/UPDATE SECTION END================================
 */








/**
 * =================================GET SECTION ====================================
 */

//#region Get

router.get('/quiz' ,authMiddleware, controller.getAllQuizes);

router.get('/quiz/:quizId' ,controller.getQuizById);

router.get('/quiz/:quizId/question' ,controller.getAllQuestionsFromQuizById);

router.get('/quiz/:quizId/question/:questionId' ,controller.getQuestionFromQuizById);


//#endregion

/**
 * =======================GET SECTION END============================
 */




/**
 * =========================POST SECTION=============================    
 */

//#region Create

router.post('/quiz' , authMiddleware , controller.createQuiz);


router.post('/quiz/:quizId/question' ,controller.createQuestion);

//#endregion



/**
 * ============================= POST SECTIOND END =================================
 */









/**
 *-----------------------------DELETE SECTION --------------------------------
 */


//#region Delete

router.delete('/quiz/:quizId' , controller.removeQuizById)

router.delete('/quiz/:quizId/question/:questionId' , controller.removeQuestionFromQuizById)

//#endregion


/**
 * ===============================DELETE SECTION END =====================================
 */


router.get('/' , (req,res) =>{
    res.send('hi from question router');
});

module.exports = router;