// const mongoose  = require("mongoose")

const isValidMail = function(email){
    if(typeof(email) == undefined || typeof(email) == null) return false
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(email)
}

const isValidPassword = function(password){
    if(typeof(password) == undefined || typeof(password) == null) return false
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    return regex.test(password)
}

const isValidTitle = function(title){
    const regex = /^(Mr|Mrs|Miss)+$\b/
    return regex.test(title)
}

const isValidName = function(value){
    // if(typeof(value) == undefined || typeof(value) == null) return false
    const regex = /^[a-z ,.'-]+$/i
    return regex.test(value)
}

const isEmpty = function(value){
    if(typeof(value) === 'string' && value.trim().length == 0){return false}
    return true
}

// const isVlalidObjectId = function(ObjectId){
//     return mongoose.Types.ObjectId.isValid(ObjectId)
// }

module.exports = {isValidMail, isValidPassword, isValidTitle, isValidName, isEmpty}
