const mongoose = require("mongoose");

const salesmanSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please Enter Your Name"],
        maxlength:[30, "Can not exceeed 30 characters"]
    },
    email:{
        type:String,
    },
    mobileno:{
        type:Number,
        unique:true,
        required:[true, "Please Enter Mobile Number"]
    },
    remarks:String,
    address:String,
    birthdate:String,
    date:String,
    mistryTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Mistry"
    },
    mistryName:String,
    mistryNumber:Number,
    architectTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Architect"
    },
    architectName:String,
    architectNumber:Number,
    dealerTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Dealer"
    },
    dealerName:String,
    dealerNumber:Number,
    pmcTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"PMC"
    },
    pmcName:String,
    pmcNumber:Number,
    oemTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"OEM"
    },
    oemName:String,
    oemNumber:Number,
    branches:[
        {branchname:String}
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});



module.exports = mongoose.model("Salesman", salesmanSchema)

