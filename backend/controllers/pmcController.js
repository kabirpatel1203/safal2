const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const PMC = require("../models/pmcModel")


exports.totalPMC = catchAsyncErrors(async(req, res, next)=>{
   
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const pmc = await PMC.find(filter);

    res.status(200).json({
        pmclength:pmc.length,
        success:true
       })
})


exports.createPMC = catchAsyncErrors(async(req, res, next)=>{
    const pmc = await PMC.create({
        ...req.body,
        createdBy: req.user._id
    })

    res.status(200).json({
        pmc,
        success:true
       })
})

exports.getPMC = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const pmc = await PMC.findOne(filter)

    if (!pmc) {
        return next(new ErrorHander("PMC not found", 404));
    }

    res.status(200).json({
        pmc,
        success:true
       })
})


exports.updatePMC = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const pmc = await PMC.findOneAndUpdate(filter,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
 
    });

    if (!pmc) {
        return next(new ErrorHander("PMC not found", 404));
    }

    res.status(200).json({
        pmc,
        success:true
       })
})

exports.deletePMC = catchAsyncErrors(async(req, res, next)=>{
    const pmc = await PMC.findByIdAndDelete(req.params.id);

    res.status(200).json({
        pmc,
        success:true
       })
})

exports.getAllPMC = catchAsyncErrors(async(req, res, next)=>{
    // Admin sees all PMCs; users see only their own
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const pmcs = await PMC.find(filter)

    res.status(200).json({
        pmcs,
        success:true
       })
})