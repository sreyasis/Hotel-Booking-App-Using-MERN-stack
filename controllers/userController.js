const User = require('../models/user');
const Passport = require('passport');
const queryString= require('querystring');
const Hotel = require('../models/hotel')
const Order=  require('../models/order')
//validator

const {check, validationResult} = require('express-validator/check');
const {sanitize}= require('express-validator/filter');
const hotel = require('../models/hotel');
const { parse } = require('dotenv');

exports.signUpGet = (req,res,next)=>{
    res.render('sign-up',{title:'User Sign Up'})
}
exports.signUpPost = [
   //Validate Data 
 check('first_name').isLength({min:1}).withMessage('First name must be specified')
 .isAlphanumeric().withMessage('First name must be alpha Numeric'),
//  check('last_name').isLength({min:1}).withMessage('last name must be specified')
//  .isAlphanumeric().withMessage('last name must be alpha Numeric'),
 check('email').isEmail().withMessage('Invalid email Address'),
 check('confirm_email')
 .custom((value, { req }) => value=== req.body.email)
 .withMessage('email addresses does not match'),
 check('password').isLength({min : 6})
 .withMessage('Minimum 6 characters required'),
 check('confirm_password')
 .custom((value, { req }) => value=== req.body.password)
 .withMessage('passwords does not match'),
 sanitize('*').trim().escape(),
 (req,res,next)=>{
     const errors=validationResult(req);
     if(!errors.isEmpty()){
         //there are errors
        //  res.json(req.body)
         res.render('sign-up', {title:'Please fix following errors', errors: errors.array()});
         return;
     }else{
         //no error
        const newUser= new User(req.body);
        User.register(newUser, req.body.password, function(err){
            if(err)
            {
                console.log('error while registering', err);
                return next(err);
            }
            next();//move onto loginn post
        });
     }
 }
]
exports.loginGet= (req,res)=>{
    res.render('login',{title:'Login page'});
}
exports.loginPost=Passport.authenticate('local',{

successRedirect:'/',
successFlash: 'you are now logged in',
failureRedirect:'/login',
failureFlash: 'Login failed please try again'
});
exports.logout=(req,res)=>{
    req.logout();
    req.flash('info', 'You are now logout')
    res.redirect('/');

}
exports.bookingConfirmation = async (req,res,next)=>{
 try{
    const data = req.params.data;
    const searchData = queryString.parse(data);
   
    const hotel = await Hotel.find({_id: searchData.id})
    res.render('confirmation', {title: 'Confirm your booking', hotel, searchData});
 }catch(error){
     next(error);
 }
}
exports.orderPlaced = async (req,res,next)=>{
    try{
        const data = req.params.data;
        const parsedData= queryString.parse(data);
        const order = new Order({
            user_id: req.user._id,
            hotel_id: parsedData.id,
            order_details:{
                duration: parsedData.duration,
                dateOfDeparture: parsedData.dateOfDeparture,
                numberOfGuests: parsedData.numberOfGuests
            }
        });
    await order.save();
    req.flash('info', 'thank you, your order has been placed!');
    res.redirect('/my-account');
    }catch(error){
        next(error);
    }
   }
exports.myAccount = async (req,res,next)=>{
    try{
       const orders= await Order.aggregate([
           {$match : {user_id: req.user.id}},
           { $lookup:{
               from: 'hotels',
               localField: 'hotel_id',
               foreignField:'_id',
               as: 'hotel_data'
           }

           }
       ])
       res.render('user_account',{title:'My account', orders});

    }catch(error){
        next(error);
    }
   }
exports.allOrders = async (req,res,next)=>{
    try{
       const orders= await Order.aggregate([
           
           { $lookup:{
               from: 'hotels',
               localField: 'hotel_id',
               foreignField:'_id',
               as: 'hotel_data'
           }

           }
       ])
       res.render('orders',{title:'My account', orders});

    }catch(error){
        next(error);
    }
   }
exports.isAdmin=(req,res,next)=>{
    if(req.isAuthenticated() && req.user.isAdmin){
        next();
        return;
    }
    res.redirect('/');
}
