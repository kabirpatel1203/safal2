const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Architect = require("../models/architectModel")

exports.totalarchitect = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const architects = await Architect.find(filter);

    res.status(200).json({
        archlength:architects.length,
        success:true
       })
})


exports.createArchitect = catchAsyncErrors(async(req, res, next)=>{
    let t = req.body;
    t = {
        ...t,
        date : t.date ? t.date.substr(0,10) : null
    }
    const architect = await Architect.create({
        ...t,
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
    })
    console.log(architect);
    res.status(200).json({
        architect,
        success:true
       })
})

exports.getArchitect = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const architect = await Architect.findOne(filter)

    if (!architect) {
        return next(new ErrorHander("Architect not found", 404));
    }

    res.status(200).json({
        architect,
        success:true
       })
})

exports.updateArchitect = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    
    // For non-admin users, only allow updating remarks field
    let updateData = req.body;
    if (req.user.role !== "admin") {
        updateData = {
            remarks: req.body.remarks
        };
    }
    
    const architect = await Architect.findOneAndUpdate(filter, updateData, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    if (!architect) {
        return next(new ErrorHander("Architect not found", 404));
    }
    res.status(200).json({
        architect,
        success:true
       })
})

exports.deleteArchitect = catchAsyncErrors(async(req, res, next)=>{
    const architect = await Architect.findOneAndDelete({mobileno:req.params.id});

    res.status(200).json({
        architect,
        success:true
       })
})

exports.getAllArchitect = catchAsyncErrors(async(req, res, next)=>{
    // Admin sees all architects; users see only their own
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const architects = await Architect.find(filter).populate('createdBy', 'email name');

    // Normalize salesPerson for each architect
    const normalizedArchitects = architects.map(arch => {
        const archObj = arch.toObject();
        if (!archObj.salesPerson && archObj.salesmen && archObj.salesmen.length > 0) {
            archObj.salesPerson = archObj.salesmen[0].name || '';
        }
        return archObj;
    });

    res.status(200).json({
        architects: normalizedArchitects,
        success:true
       })
})
