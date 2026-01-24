const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
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
    address:String,
    area:{
        type:String,
        default:""
    },
    birthdate:String,
    marriagedate:String,
    date:Date,
    followupdate:Date,
    requirement:[
        {requirement:String}
    ],
    remarks:String,
    revenue:Number,
    rewardPoints:Number,
    orderValue:Number,
    ordervalue:Number,
    scale: {
        type: String,
        enum: ["High", "Medium", "Low", "N/A"]
    },
    // salesPerson:String,
    mistryTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"mistry"
    },
    mistryName:String,
    mistryNumber:Number,
    architectTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"architect"
    },
    architectName:String,
    architectNumber:Number,
    dealerTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"dealer"
    },
    dealerName:String,
    dealerNumber:Number,
    pmcTag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"pmc"
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
    salesmen:[{name:String}],
    salesPerson: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});



module.exports = mongoose.model("Customer", customerSchema)

