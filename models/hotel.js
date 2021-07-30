const mongoose = require('mongoose');

const hotelSchema = mongoose.Schema({
    hotel_name:{
        type: String,
        required : 'Hotel name Required',
        max: 32,
        trim: true
    },
    hotel_description:{
        type: String,
        required : 'Hotel Description Required',
        trim: true


    },
    image: String,
    star_rating:{
        type: Number,
        required : 'Hotel Star rating Required',
        max : 5,
        trim: true
    },
    country: { 
        type : String,
        required: ' Country is required',
        trim: true
    },
    cost_per_night:{
        type: Number,
        required:' Cost per night is required',
        trim: true
    },
    availble:{
        type: Boolean,
        required: 'Availability is required'
    }
})
    hotelSchema.index({
        hotel_name: 'text',
        country:'text'

    })

// export model
module.exports=mongoose.model('Hotel', hotelSchema);