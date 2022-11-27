const blogModel = require('../models/blogsModel')
const authorModel = require('../models/authorModel')
const validation = require('../validate/validation')
const mongoose = require('mongoose')
const moment = require('moment')

const {isEmpty} = validation

//------------------------------------ Blog Create ---------------------------------
const createBlog = async function(req, res){
    try{

        const {title,body,authorId,category,isPublished} = req.body
    
        /*------------------------Checking body is empty or not-----------------------------------*/
        if(Object.keys(req.body).length == 0) {return res.status(400).send({status:false, msg:"can not create blog with empty body"})}
        
        /*------------------------Checking fileds are present or not-----------------------------------*/
        if(!title){return res.status(400).send({status:false, msg : "Title is required"})}
        if(!body){return res.status(400).send({status:false, msg : "body is required"})}
        if(!authorId){return res.status(400).send({status:false, msg : "authorId is required"})}
        if(!category){return res.status(400).send({status:false, msg : "category is required"})}

        /*------------------------Mongoose Id Validation-----------------------------------*/
        if(!(mongoose.isValidObjectId(authorId))) {return res.status(400).send({status:false, msg:"invalid authorId"})}
        
        /*------------------------Checking fileds values are empty or not-----------------------------------*/
        if(!(isEmpty(title))){return res.status(400).send({status:false, msg:"Title is required"})}
        if(!(isEmpty(body))){return res.status(400).send({status:false, msg:"body is required"})}
        if(!(isEmpty(category))){return res.status(400).send({status:false, msg:"category is invalid"})}
        
    
        if(isPublished == true){
            let today = moment().format('YYYY-MM-DD, hh:mm:ss a')
            req.body.publishedAt = today
        }

        const authorCheck = await authorModel.findById(authorId)
        if(!authorCheck) {return res.status(404).send({status:false, msg:"author is not present in our DB"})}
    
        const create = await blogModel.create(req.body)
        res.status(201).send({status : true, data : create})
    }
    catch(err){
        res.status(500).send({status:false, msg:err.message})
    }
}


//--------------------------------- Get Blog ----------------------------------
const getBlog = async function(req ,res){
    try{

        /*------------------------If Query is empty-----------------------------------*/
        if(Object.keys(req.query).length==0){
            let blog = await blogModel.find({isDeleted:false, isPublished:true}).populate('authorId')
            if(blog.length == 0){
                return res.status(404).send({status:false, msg:"No blogs found"})
            }
            return res.status(200).send({status:true, data:blog})
        }
        
        /*------------------------If Query is not empty-----------------------------------*/
        if(Object.keys(req.query).length != 0){
            const filteredBlogs = await blogModel.find(req.query).populate('authorId')
            if(filteredBlogs.length == 0){
                return res.status(404).send({status:false, msg:"No blogs found with these filters"})
            }
            return res.status(200).send({status:true, data:filteredBlogs})
        }
    }
    catch(err){
        return res.staus(500).send({status:false, msg:err.message})
    }
}

//-------------------------------- Update Blog --------------------------------
const updateDetails = async function(req,res){
    try{

        const blogId = req.params.blogId
        const {title, body, tags, subcategory, category, publishedAt, isPublished, isDeleted} = req.body

        /*------------------------Checking body is empty or not-----------------------------------*/
        if(Object.keys(req.body).length == 0){return res.status(400).send({staus:false, msg:"Body is Empty"})}
    
        /*------------------------Mongoose Id Validation-----------------------------------*/
        if(!(mongoose.isValidObjectId(blogId))){return res.status(400).send({staus:false, msg:"Invalid Object Id"})}
    
        /*-------------------------------  Checking Blog in DB  -----------------------------------*/
        const blogIdCheck = await blogModel.findById(blogId)
        if(!blogIdCheck){return res.status(404).send({status:false, msg:"BlogId is not present in DB"})}
    
        if(isDeleted == true){return res.staus(400).send({staus:false, msg:"You can't delete a blog form here"})}
    
        if(isPublished == true){
            let today = moment().format('YYYY-MM-DD', 'hh:mm:ss a')
            req.body.publishedAt = today
        }
    
        const update = await blogModel.findOneAndUpdate(
            {_id:blogId},
            {title:title,body:body,$push:{tags:tags, subcategory:subcategory}, category:category, publishedAt:req.body.publishedAt, isPublished:isPublished},
            {new:true}
        )
        return res.status(200).send({status:true, message: "blog updated", data:update})
    }
    catch(err){
        res.status(500).send({status:false, msg:err.message})
    }
}

//----------------------- delete blog using Path Params -------------------------------------
const deleteBlog = async function(req, res){
    try{

        const blogId = req.params.blogId

        /*------------------------Mongoose Id Validation-----------------------------------*/
        if(!(mongoose.isValidObjectId(blogId))){return res.status(400).send({status:false, message:"Invalid Object Id"})}
    
        /*-------------------------------  Checking Blog in DB  -----------------------------------*/
        const checkId = await blogModel.findById(blogId)
        if(!checkId){return res.status(404).send({status:false, message:"BlogId is not present in DB"})}
    
        if(checkId.isDeleted == true){return res.status(404).send({status:false, message:"This blog is already deleted"})}
        
        let today = moment().format('YYYY-MM-DD', 'hh:mm:ss a')
        await blogModel.findOneAndUpdate({_id:blogId}, {isDeleted:true, deletedAt:today}, {new:true})
        return res.status(200).send({status:true})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//----------------------- delete blog using query Params ----------------------
const deleteByQuery = async function(req, res){
    try{

        const data = req.query
        const authorId = req.query.authorId
        
        /*------------------------Query is empty or not-----------------------------------*/
        if(Object.keys(data).length == 0){return res.status(400).send({status:false, msg:"query is missing"})}
        
        if(authorId){
            if(!(mongoose.isValidObjectId(authorId))){return res.status(400).send({status:false, msg:"Invalid author Id"})}
        }
    
        //Authotization
        if(authorId != req.tokenVerify.id){return res.status(403).send({status:false, msg:"you are unauthorized to make changes"})}

        /*-------------------------------  Checking Blog in DB  -----------------------------------*/
        let blogFound = await blogModel.find(req.query)
        if(blogFound.length == 0){return res.status(404).send({status:false, msg:"No blog found"})}
    
        let notDletedBlog = blogFound.filter((val) => val.isDeleted == false)
        if(notDletedBlog.length == 0){return res.status(404).send({status:false, msg:"Blog is already deleted"})}
    
        let today = moment().format('YYYY-MM-DD', 'hh:mm:ss a')

        await blogModel.updateMany(
            {$or:[{category:data.category}, {authorId:data.authorId}, {tags:data.tags},{subcategory:data.subcategory},{isPublished:data.isPublished}]},
            {$set:{isDeleted:true, deletedAt:today}}
        )
    
        return res.status(200).send({status:true})
    }
    catch(err){
        return res.status(500).send({status:false, msg:err.message})
    }
}

module.exports.createBlog = createBlog
module.exports.getBlog = getBlog
module.exports.updateDetails = updateDetails
module.exports.deleteBlog = deleteBlog
module.exports.deleteByQuery = deleteByQuery
