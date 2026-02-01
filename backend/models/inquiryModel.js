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
    revenue: Number,
    rewardPoints: Number,
    orderValue: Number,
    ordervalue: Number,
    date: Date,
    followupdate: Date,
    requirement: [
    {requirement:String}
    ],
    stage:String,
    scale: {
        type: String,
        enum: ["High", "Medium", "Low", "N/A"],
        default: "N/A"
    },
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
    builderTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Builder"
    },
    builderName: String,
    builderNumber: Number,
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
    oemTag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OEM"
    },
    oemName: String,
    oemNumber: Number,
    branches: [
        { branchname: String }
    ],
    salesmen: [{ name: String }],
    salesPerson: {
        type: String,
        default: ""
    },
    remarks:String,
    adminRemarks: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});


module.exports = mongoose.model("Inquiry", inquirySchema)

