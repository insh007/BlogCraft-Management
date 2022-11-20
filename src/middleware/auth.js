const jwt = require('jsonwebtoken')
const blogModel = require('../models/blogsModel')
const { isValidObjectId } = require('mongoose')

const authenticate = async function(req, res, next){
    try{
        const token = req.headers['x-api-key']
        if(!token){return res.status(400).send({status:false, msg:"Token must be present in header"})}
        let tokenVerify
        try{
            tokenVerify = jwt.verify(token,"pushpa jhukega nhi")
        }
        catch(err){
            return res.status(401).send({status:false, msg:"Invalid token coming from header"})
        }
        req.identity = tokenVerify.id
        next()
    }
    catch(err){
        return res.status(500).send({status:false, err:err.message})
    }

}

const authorization = async function(req, res, next){
    try{
        let blogId = req.params.blogId
        
        if(!isValidObjectId(blogId)){return res.status(400).send({status:false, msg:"Blog Id is invalid"})}
    
        let blog = await blogModel.findById({_id:blogId})

        if(!blog){return res.status(404).send({status:false, msg:"Blog id is not exit in DB"})}
    
        if(blog.authorId != req.identity){return res.status(403).send({status:false, msg:"you are unauthorized to make changes"})}
    
        next()
    }
    catch(err){
        return res.status(500).send({status:false, err:err.message})
    }
}

module.exports.authenticate = authenticate
module.exports.authorization = authorization