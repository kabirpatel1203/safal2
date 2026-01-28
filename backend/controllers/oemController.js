const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const OEM = require("../models/oemModel")

exports.totaloem = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const oems = await OEM.find(filter);

    res.status(200).json({
        oemlength:oems.length,
        success:true
       })
})


exports.createOEM = catchAsyncErrors(async(req, res, next)=>{
    let t = req.body;
    t = {
        ...t,
        date : t.date ? t.date.substr(0,10) : null
    }
    const oem = await OEM.create({
        ...t,
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
    })
    console.log(oem);
    res.status(200).json({
        oem,
        success:true
       })
})

exports.getOEM = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const oem = await OEM.findOne(filter)

    if (!oem) {
        return next(new ErrorHander("OEM not found", 404));
    }

    res.status(200).json({
        oem,
        success:true
       })
})

exports.updateOEM = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    
    // For non-admin users, allow updating grade and remarks
    let updateData = req.body;
    if (req.user.role !== "admin") {
        // Only allow non-admins to update grade, remarks
        const oem = await OEM.findOne(filter);
        if (!oem) {
            return next(new ErrorHander("OEM not found", 404));
        }
        oem.grade = req.body.grade ?? oem.grade;
        oem.remarks = req.body.remarks ?? oem.remarks;
        await oem.save();
        return res.status(200).json({ oem, success: true });
    }
    
    const oem = await OEM.findOneAndUpdate(filter, updateData, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    if (!oem) {
        return next(new ErrorHander("OEM not found", 404));
    }
    res.status(200).json({
        oem,
        success:true
       })
})

exports.deleteOEM = catchAsyncErrors(async(req, res, next)=>{
    const oem = await OEM.findOneAndDelete({mobileno:req.params.id});

    res.status(200).json({
        oem,
        success:true
       })
})

exports.getAllOEM = catchAsyncErrors(async(req, res, next)=>{
    // Admin sees all oems; users see only their own
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const oems = await OEM.find(filter).populate('createdBy', 'email name');

    // Normalize salesPerson for each OEM
    const normalizedOems = oems.map(o => {
        const oObj = o.toObject();
        if (!oObj.salesPerson && oObj.salesmen && oObj.salesmen.length > 0) {
            oObj.salesPerson = oObj.salesmen[0].name || '';
        }
        return oObj;
    });

    res.status(200).json({
        oems: normalizedOems,
        success:true
       })
})
