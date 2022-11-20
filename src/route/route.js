const express = require('express');
const router = express.Router();
const authorController = require('../controller/authorController')
const blogController = require('../controller/blogController')
const mid = require('../middleware/auth')

// ---------------- author create --------------
router.post('/authors', authorController.createAuthors)

// ---------------- blogs create ---------------
router.post('/blogs', mid.authenticate ,blogController.createBlog)

//---------------- get blogs ----------------
router.get('/blogs', mid.authenticate ,blogController.getBlog)

//---------------- update blog ----------------
router.put('/blogs/:blogId',mid.authenticate, mid.authorization, blogController.updateDetails)

//----------------- delete blog(path params) ----------------
router.delete('/blogs/:blogId',mid.authenticate,mid.authorization ,blogController.deleteBlog)

//----------------- delete blog(query params) ----------------
router.delete('/blogs', mid.authenticate ,blogController.deleteByQuery)

//---------------- auhtor login --------------------------
router.post('/login', authorController.login)

module.exports = router