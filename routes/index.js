var express = require('express');//node module
var router = express.Router();
//import controller
const hotelController=require('../controllers/hotelController');
const userController=require('../controllers/userController');
const user = require('../models/user');
/* GET home page. */
router.get('/', hotelController.homePageFilter);
// router.get('/',function(req, res){
//     if (req.session.page_views){
//         req.session.page_views++;
//         res.send(`Number of visits: ${req.session.page_views}`)
//     }else{
//         req.session.page_views=1;
//         res.send('First visit');
//     }
// });
router.get('/all', hotelController.listAllHotels);
router.get('/all/:hotel',hotelController.hotelDetail);
router.get('/countries/:country',hotelController.hotelsByCountry);

//admin route
router.get('/admin', userController.isAdmin, hotelController.adminPage);
router.get('/admin/*', userController.isAdmin);
router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add',
hotelController.upload, 
hotelController.pushToCloudinary,
 hotelController.createHotelPost);
router.get('/countries', hotelController.listAllCountries);
router.post('/results', hotelController.searchResults)
router.get('/admin/edit', hotelController.editRemoveGET);
router.post('/admin/edit', hotelController.editRemovePOST);
router.get('/admin/:hotelId/update', 
hotelController.updateHotelGet);
router.post('/admin/:hotelId/update', 
hotelController.upload, 
hotelController.pushToCloudinary,
hotelController.updateHotelPost);
router.get('/admin/:hotelId/delete', hotelController.deleteHotelGet);
router.post('/admin/:hotelId/delete', hotelController.deleteHotelPost);
router.get('/admin/orders', userController.allOrders);
//USER ROUTES
//--------------------------
router.get('/sign-up',userController.signUpGet);
router.post('/sign-up',userController.signUpPost,userController.loginPost);
router.get('/login',userController.loginGet);
router.post('/login',userController.loginPost);
router.get('/logout', userController.logout);
router.get('/confirmation/:data', userController.bookingConfirmation);
router.get('/order-placed/:data', userController.orderPlaced);
router.get('/my-account',userController.myAccount);
module.exports = router;
