const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const route = require('./src/route/route')

const app = express()
app.use(bodyParser.json())

mongoose.connect("mongodb+srv://insh007:Inshad123@firstcluster.p0r04o1.mongodb.net/Project-1_self",{
    useNewUrlParser : true
})
.then(() => console.log("MongoDB is connected"))
.catch(err => console.log(err))

app.use('/',route)

app.listen(3000, function(){
    console.log("Express app is running on port " + 3000)
})