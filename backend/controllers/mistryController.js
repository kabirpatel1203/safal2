const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Mistry = require("../models/mistryModel")


exports.totalMistry = catchAsyncErrors(async(req, res, next)=>{
   
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const mistry = await Mistry.find(filter);

    res.status(200).json({
        mistrylength:mistry.length,
        success:true
       })
})


exports.createMistry = catchAsyncErrors(async(req, res, next)=>{
    const mistry = await Mistry.create({
        ...req.body,
        createdBy: req.user._id
    })

    res.status(200).json({
        mistry,
        success:true
       })
})

exports.getMistry = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const mistry = await Mistry.findOne(filter)

    if (!mistry) {
        return next(new ErrorHander("Mistry not found", 404));
    }

    res.status(200).json({
        mistry,
        success:true
       })
})


exports.updateMistry = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const mistry = await Mistry.findOneAndUpdate(filter,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
 
    });

    if (!mistry) {
        return next(new ErrorHander("Mistry not found", 404));
    }

    res.status(200).json({
        mistry,
        success:true
       })
})

exports.deleteMistry = catchAsyncErrors(async(req, res, next)=>{
    const mistery = await Mistry.findOneAndDelete({mobileno:req.params.id});

    res.status(200).json({
        mistery,
        success:true
       })
})

exports.getAllMistry = catchAsyncErrors(async(req, res, next)=>{
    // Admin sees all mistries; users see only their own
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const mistries = await Mistry.find(filter)

    res.status(200).json({
        mistries,
        success:true
       })
})