const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Dealer = require("../models/dealerModel")


exports.totalDealer = catchAsyncErrors(async(req, res, next)=>{
   
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const dealers = await Dealer.find(filter);

    res.status(200).json({
        dealerlength:dealers.length,
        success:true
       })
})


exports.createDealer = catchAsyncErrors(async(req, res, next)=>{
    const d = await Dealer.create({
        ...req.body,
        createdBy: req.user._id
    })

    res.status(200).json({
        d,
        success:true
       })
})

exports.getDealer = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const dealer = await Dealer.findOne(filter)

    if (!dealer) {
        return next(new ErrorHander("Dealer not found", 404));
    }

    res.status(200).json({
        dealer,
        success:true
       })
})

exports.updateDealer = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const dealer = await Dealer.findOneAndUpdate(filter,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    if (!dealer) {
        return next(new ErrorHander("Dealer not found", 404));
    }

    res.status(200).json({
        dealer,
        success:true
       })
})

exports.deleteDealer = catchAsyncErrors(async(req, res, next)=>{
    const dealer = await Dealer.findByIdAndDelete(req.params.id);

    res.status(200).json({
        dealer,
        success:true
       })
})

exports.getAllDealer = catchAsyncErrors(async(req, res, next)=>{
    // All users can see all dealers (shared master data)
        // Admin sees all dealers; users see only their own
        const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const dealers = await Dealer.find(filter)

    res.status(200).json({
        dealers,
        success:true
       })
})