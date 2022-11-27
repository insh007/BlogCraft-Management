const authorModel = require('../models/authorModel')
const validation = require('../validate/validation')
const jwt = require('jsonwebtoken')

const {isValidMail, isValidPassword, isValidTitle, isEmpty, isValidName} = validation

//----------------------------- Create Author --------------------------------------
const createAuthors = async function(req,res){
    try{
        let data = req.body
        const {fname, lname, title, email, password} = req.body
        
        /*------------------------Checking body is empty or not-----------------------------------*/
        if(Object.keys(data).length == 0){
            res.status(400).send({status : false, msg : "can't create author data with empty body"})
        }
    
        /*------------------------Checking fileds are present or not-----------------------------------*/
        if(!fname){res.status(400).send({status:false, msg : "first name is required"})} 
        if(!lname){res.status(400).send({status:false, msg : "last name is required"})} 
        if(!title){res.status(400).send({status:false, msg : "title is required"})} 
        if(!email){res.status(400).send({status:false, msg : "email is required"})} 
        if(!password){res.status(400).send({status:false, msg : "password is required"})} 

        /*------------------------Checking fileds values are empty or not-----------------------------------*/
        if(!(isEmpty(fname))){res.status(400).send({status:false, msg : "first name is required"})}
        if(!(isEmpty(lname))){res.status(400).send({status:false, msg : "last name is required"})}
        if(!(isEmpty(title))){res.status(400).send({status:false, msg : "title is required"})}
        if(!(isEmpty(email))){res.status(400).send({status:false, msg : "email is required"})}
        if(!(isEmpty(password))){res.status(400).send({status:false, msg : "password name is required"})}
    
        /*------------------------Checking mail is unique or not-----------------------------------*/
        const uniqueEmail = await authorModel.find({email : email})
        if(!uniqueEmail){res.status(400).send({staus : false, msg : "email is already exit"})} 
    
        /*-------------------------------  Validation(Regex)  -----------------------------------*/
        if(!(isValidName(fname))){return res.status(400).send({status:false, msg:"Please provide valid first name"})}
        if(!(isValidName(lname))){return res.status(400).send({status:false, msg:"Please provide valid last name"})}
        if(!(isValidTitle(title))){return res.status(400).send({status : false, msg : "Please enter correct title ex: Mr, Mrs, Miss"})}
        if(!(isValidMail(email))){return res.status(400).send({status:false, msg:"Please provide valid email"})}
        if(!(isValidPassword(password))){return res.status(400).send({status:false, msg:"Please provide valid password"})}
        
        let authorCreate = await authorModel.create(data)
        return res.status(201).send({status : true , data : authorCreate})
    }
    catch(err){
        res.status(500).send({staus:false, msg:err.message})
    }
}

//--------------------------------- Login ---------------------------
const login = async function(req, res){
    try{

        const {email, password} = req.body
        
        /*------------------------Checking body is empty or not-----------------------------------*/
        if(Object.keys(req.body).length == 0){return res.status(400).send({status:false, msg:"Please provide email and password"})}

        /*------------------------Checking fileds are present or not-----------------------------------*/
        if(!email){res.status(400).send({status:false, msg : "email is required"})} 
        if(!password){res.status(400).send({status:false, msg : "password is required"})} 

        /*------------------------Checking fileds values are empty or not-----------------------------------*/
        if(!(isEmpty(email))){res.status(400).send({status:false, msg : "email name is required"})}
        if(!(isEmpty(password))){res.status(400).send({status:false, msg : "password name is required"})}
        
        /*-------------------------------  Validation(Regex)  -----------------------------------*/
        if(!(isValidMail(email))) {return res.status(400).send({status:false, msg:"Please provide correct email"})}
        if(!(isValidPassword(password))) {return res.status(400).send({status:false, msg:"Please provide correct passsword"})}
    
        /*-------------------------------  Checking author in DB  -----------------------------------*/
        let authorDetails = await authorModel.findOne({email:email, password:password})
        
        if(!authorDetails){return res.status(404).send({status:false, msg:"author is not present in our DB"})}
    
        /*------------------------------- Generate Token -----------------------------------*/
        let token = jwt.sign({
            id:authorDetails._id,
            email:authorDetails.email,
            password:authorDetails.password
        },"pushpa jhukega nhi", {expiresIn:'24hr'})
    
        res.setHeader("x-api-key", token)
        res.status(200).send({status:true, data:token})
    
    } 
    catch(err){
        return res.status(500).send({status:false, msg:err.message})
    }
}

module.exports.createAuthors = createAuthors
module.exports.login = login