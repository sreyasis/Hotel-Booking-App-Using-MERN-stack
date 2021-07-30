const { NotExtended } = require('http-errors');
const Hotel = require('../models/hotel');
const cloudinary = require('cloudinary');
const multer= require('multer');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:  process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})
const storage = multer.diskStorage({});
const upload = multer({storage});
exports.upload=upload.single('image');
exports.pushToCloudinary = (req,res,next)=>{
    if(req.file){
      cloudinary.uploader.upload(req.file.path)
      .then((result) => {
          req.body.image = result.public_id;
          next();

      })
      .catch(()=>{
          req.flash('error', 'There was a problem uploading image try again')
          res.redirect('/admin/add');
      })
    }else{
        next();
    }
}
// exports.homePage = (req,res)=>{
//     res.render('index',{title:'Lets travel'});
// }
exports.homePageFilter = async (req,res,next) => {
    try{
        
        const hotels     =   Hotel.aggregate([
         { $match: {availble:true}},
         {$sample : {size:7}},
         { $sort : { hotel_name : 1 } }
        ]);  
        const countries =   Hotel.aggregate([
             {$group:{_id:'$country'}} ,
             {$sample:{size:7}}     ]); 
        const [filteredCountries, filteredHotels] = await Promise.all([countries, hotels]);
        //   res.json(filteredCountries)
        res.render('index',{filteredCountries, filteredHotels});
    }catch(error){next(error);}
 
 }
 exports.editRemoveGET= (req,res,next)=>{
     res.render('edit',{title:"edit"})
 }
 exports.editRemovePOST= async (req,res,next)=>{
    try{
        const hotelId= req.body.hotel_id || null ;
        const hotelName = req.body.hotel_name || null ;
        const hotelData = await Hotel.find({$or :[
            {_id: hotelId},
            {hotel_name: hotelName}
        ]}).collation({
            locale: 'en',
            strength: 2 
        });

        if(hotelData.length>0){
            //res.json(hotelData);
            res.render('hotel_detail',{title:'Add or remove hotel', hotelData});
            return
        }else{
            req.flash('info','no match found')
            res.redirect('admin/edit');
        }

       
    } catch(error){ 
        next(next)} 
}

exports.listAllHotels = async (req,res,next)=>{
    try{
    const allHotels = await Hotel.find({availble :{$eq: true}});  
    res.render('all_hotels',{title:'All Hotels', allHotels});
    
   
    } catch(error){ next(next);} 
}
 
exports.adminPage =(req,res) => {
    res.render('admin', {title: 'Admin'});
}
exports.createHotelGet =(req,res) => {
    res.render('add_hotel', {title: 'Add new hotel'});
}
exports.createHotelPost =async (req,res,next) => {
    try{
    const hotel = new Hotel(req.body);
    await   hotel.save();
    req.flash('success', `${hotel.hotel_name} created succesfully`)
    res.redirect(`/all/${hotel.id}`);
    }catch(error){
    next(error)
    }
}
exports.listAllCountries = async (req,res,next) => {
   try{
       const allCountries = await  Hotel.distinct('country');
       res.render('all_countries',{title:"browse by countries", allCountries});
   }catch(error){next(error);}

}
exports.updateHotelGet = async(req,res,next) =>{
    try{
        const hotel = await Hotel.findOne({_id: req.params.hotelId});
        res.render('add_hotel',{title: 'Update hotel', hotel})
    }catch(error){next(error);}
}
exports.updateHotelPost = async(req,res,next) =>{
    try{
       const hotelId = req.params.hotelId;
       const hotel = await Hotel.findByIdAndUpdate(hotelId, req.body, {new:true});
       req.flash('success',`${hotel.hotel_name} updated succesfully`)
       res.redirect(`/all/${hotelId}`)
    }catch(error){next(error);}
}
exports.deleteHotelGet = async(req,res,next) =>{
    try{
       const hotelId = req.params.hotelId;
       const hotel = await Hotel.findOne({_id:hotelId});
       res.render('add_hotel',{title: 'Delete Hotel', hotel})
    }catch(error){next(error);}
}
exports.deleteHotelPost = async(req,res,next) =>{
    try{
       const hotelId = req.params.hotelId;
       const hotel = await Hotel.findByIdAndRemove({_id:hotelId});
       req.flash('info',`HotelID: ${hotelId} has been delted`);
       res.redirect('/')
    }catch(error){next(error);}
}
exports.hotelDetail =async (req,res,next) =>{
    try{ 
        const hotelParam= req.params.hotel;
        const hotelData= await Hotel.find({_id:hotelParam});
        res.render('hotel_detail',{
            title: 'Lets Travel',
            hotelData});


    }catch(error){
        next(error)
    }

}
exports.hotelsByCountry = async (req,res,next)=>{

    try{
        const countryParam= req.params.country
        const countryList = await Hotel.find({country:countryParam}) 
        res.render('hotels_by_country',{title:`Browse by country : ${countryParam}`, countryList});
    }catch(error){
        next(error);
    }

}
exports.searchResults = async (req,res,next) => {
    try{
     const searchQuery = req.body;
     const parsedStars = parseInt(searchQuery.stars || 1); 
     const parsedSort = parseInt(searchQuery.sort || 1);
    const searchData =  await Hotel.aggregate([
        {$match:{$text:{$search: `\"${searchQuery.destination}\" `}}},
        {$match:{availble:true, star_rating:{$gte: parsedStars}}},
        {$sort: {cost_per_night: parsedSort}}
    ])
    res.render('search_results',{title: 'Search results', searchQuery, searchData});
    
    } catch(error){
        next(error);
    }
}