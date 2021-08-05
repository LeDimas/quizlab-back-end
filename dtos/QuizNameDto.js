module.exports = class QuizNameDto{


    constructor(model){
        this.name = model.name
        this.id = model._id
    }

}