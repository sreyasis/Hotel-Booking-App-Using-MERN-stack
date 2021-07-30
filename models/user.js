const mongoose = require('mongoose')
const passportLocalMongoose=require('passport-local-mongoose');
const monggoseBcrypt=require('mongoose-bcrypt');
const mongooseBcrypt = require('mongoose-bcrypt');


const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required : 'First name Required',
        max: 32,
        trim: true
    },
    last_name:{
        type: String,
        required : 'Last name Required',
        max: 32,
        trim: true
    },
    email:{
        type: String,
        required : 'Email address  Required',
        max: 32,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required : 'Password is Required',
        bcrypt:  true,
        max: 32,
        trim: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
});
userSchema.plugin(mongooseBcrypt);
userSchema.plugin(passportLocalMongoose,{usernameField:'email'});
module.exports = mongoose.model('User', userSchema);