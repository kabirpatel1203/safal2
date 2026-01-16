const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Salesman = require("../models/salesmanModel")
const Architect=require("../models/architectModel")
const Customer=require("../models/customerModel")
const Dealer=require("../models/dealerModel")
const Mistry=require("../models/mistryModel")
const Inquiry=require("../models/inquiryModel")
const PMC=require("../models/pmcModel")
exports.createSalesman = catchAsyncErrors(async (req, res, next) => {
    const salesman = await Salesman.create({
        ...req.body,
        createdBy: req.user._id
    });
    console.log(salesman);
    res.status(200).json({
        salesman,
        success: true
    })
})

exports.getSalesman = catchAsyncErrors(async (req, res, next) => {

    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const salesman = await Salesman.findOne(filter)

    if (!salesman) {
        return next(new ErrorHander("Salesman not found", 404));
    }

    res.status(200).json({
        salesman,
        success: true
    })
})

exports.updateSalesman = catchAsyncErrors(async (req, res, next) => {

    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const salesman = await Salesman.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false

    });

    if (!salesman) {
        return next(new ErrorHander("Salesman not found", 404));
    }

    res.status(200).json({
        salesman,
        success: true
    })
})

exports.deleteSalesman = catchAsyncErrors(async (req, res, next) => {

    const salesman = await Salesman.findOneAndDelete({mobileno:req.params.id});

    res.status(200).json({
        salesman,
        success: true
    })
})

exports.getAllSalesman = catchAsyncErrors(async (req, res, next) => {

    // All users can see all salesmen (shared master data)
    const filter = {};
    const salesmans = await Salesman.find(filter)

    res.status(200).json({
        salesmans,
        success: true
    })
})
exports.getCustomerofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        customers,
        success: true
    })
})
exports.getInquiriesofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const inquiries = await Inquiry.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        inquiries,
        success: true
    })
})


exports.getArchitectsofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const architects = await Architect.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        architects,
        success: true
    })
})
exports.getDealersofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const dealer = await Dealer.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        dealer,
        success: true
    })
})
exports.getMistryofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name = req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const mistry = await Mistry.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        mistry,
        success: true
    })
})
exports.getPMCofSalesman = catchAsyncErrors(async (req, res, next) => {
    const name= req.body.name;
    if (!name) {
        return next(new ErrorHander("Please Provide name", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const pmc = await PMC.find({ ...ownerFilter, "salesmen.name": name })
    res.status(200).json({
        pmc,
        success: true
    })
})