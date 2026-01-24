const mongoose = require("mongoose");

const oemSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please Enter Your Name"],
        maxlength:[30, "Can not exceeed 30 characters"]
    },
    email:String,
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
    grade: {
        type: String,
        enum: ['A', 'B', 'C', null, ''],
        default: null
    },
    companyName:String,
    birthdate:Date,
    marriagedate:Date,
    date:Date,
    remarks:String,
    bankname:String,
    IFSCcode:String,
    branchname:String,
    adharcard:Number,
    pancard:String,
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



module.exports = mongoose.model("OEM", oemSchema)
