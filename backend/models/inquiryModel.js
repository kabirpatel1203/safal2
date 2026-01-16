const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxlength: [30, "Can not exceeed 30 characters"]
    },
    mobileno: {
        type: Number,
        unique: true,
        required: [true, "Please Enter Mobile Number"]
    },
    address: String,
    area: {
        type: String,
        default: ""
    },
    birthdate: String,
    marriagedate: String,
    orderValue: Number,
    date: Date,
    followupdate: Date,
    requirement: [
    {requirement:String}
    ],
    stage:String,
    architectTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "architect"
    },
    architectName: String,
    architectNumber: Number,
    pmcTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pmc"
    },
    email:String,
    pmcName: String,
    pmcNumber: Number,
    mistryTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "architect"
    },
    mistryName: String,
    mistryNumber: Number,
    dealerTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "architect"
    },
    dealerName: String,
    dealerNumber: Number,
    branches: [
        { branchname: String }
    ],
    salesmen: [{ name: String }],
    remarks:String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});


module.exports = mongoose.model("Inquiry", inquirySchema)

