const authorModel = require('../models/authorModel')
const validation = require('../validate/validation')
const jwt = require('jsonwebtoken')

//----------------------------- Create Author --------------------------------------
const createAuthors = async function(req,res){
    try{
        let data = req.body
    
        if(Object.keys(data).length == 0){
            res.status(400).send({status : false, msg : "can't create author data with empty body"})
        }
    
        const {fname, lname, title, email, password} = req.body
    
        if(!(fname && lname && title && email && password)){
            res.status(400).send({status:false, msg : "required field data is missing"})
        } 
    
        const uniqueEmail = await authorModel.find({email : email})
        if(!uniqueEmail){
            res.status(400).send({staus : false, msg : "email is already exit"})
        } 
    
        if((title != "Mr") && (title != "Mrs") && (title != "Miss")){
            res.status(400).send({status : false, msg : "Please enter correct title ex: Mr, Mrs, Miss"})
        }
        
        if(typeof(fname) == "string" && fname.trim().length != 0 && validation.isValidName(fname)){
            if(typeof(lname) == "string" && lname.trim().length != 0 && validation.isValidName(lname)){
                if(typeof(email) == "string" && email.trim().length != 0 && validation.isValidMail(email)){
                    if(typeof(password) == "string" && password.trim().length != 0 && validation.isValidPassword(password)){
                        let authorCreate = await authorModel.create({
                            fname : fname.replaceAll(" ","").charAt(0).toUpperCase() + fname.slice(1).toLowerCase().replaceAll(" ",""),
                            lname : lname.replaceAll(" ","").charAt(0).toUpperCase() + lname.slice(1).toLowerCase().replaceAll(" ",""),
                            title : title.replaceAll(" ",""),
                            email : email.replaceAll(" ",""),
                            password : password.replaceAll(" ","")
                        })
                        if(!authorCreate) {res.status(400).send({status:false, msg:"cannot create data"})}
                        res.status(201).send({status : true , data : authorCreate})
    
                    }else {res.status(400).send({status:false, msg:"Please provide valid password"})}
                }else {res.status(400).send({status:false, msg:"Please provide valid email"})}
            }else {res.status(400).send({status:false, msg:"Please provide valid last name"})}
        }else {res.status(400).send({status:false, msg:"Please provide valid first name"})}
    }
    catch(err){
        res.status(500).send({staus:false, msg:err.message})
    }
}

//--------------------------------- Login ---------------------------
const login = async function(req, res){
    try{

        const {email, password} = req.body
        
        if(Object.keys(req.body).length == 0){return res.status(400).send({status:false, msg:"Please provide email and password"})}
        if(email== undefined || password ==undefined){return res.status(400).send({status:false, msg:"Both email and password are required"})}
    
        if(!(validation.isValidMail(email))) {return res.status(400).send({status:false, msg:"Please provide correct email"})}
        if(!(validation.isValidPassword(password))) {return res.status(400).send({status:false, msg:"Please provide correct passsword"})}
    
        let authorDetails = await authorModel.findOne({email:email, password:password})
        
        if(!authorDetails){return res.status(404).send({status:false, msg:"author is not present in our DB"})}
    
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