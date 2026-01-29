const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Mistry = require("../models/mistryModel")
const User = require("../models/userModel")


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
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
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
    
    // For non-admin users, allow updating grade and remarks
    let updateData = req.body;
    if (req.user.role !== "admin") {
        // Only allow non-admins to update grade, remarks
        const mistry = await Mistry.findOne(filter);
        if (!mistry) {
            return next(new ErrorHander("Mistry not found", 404));
        }
        mistry.grade = req.body.grade ?? mistry.grade;
        mistry.remarks = req.body.remarks ?? mistry.remarks;
        await mistry.save();
        return res.status(200).json({ mistry, success: true });
    }

    if (updateData) {
        delete updateData.createdBy;
        delete updateData.salesPerson;
        delete updateData.salesmen;
    }

    const mistry = await Mistry.findOneAndUpdate(filter, updateData, {
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

// Admin: Change sales person for a Mistry
exports.changeMistrySalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { mistryId, newSalesPersonId } = req.body;
    const mistry = await Mistry.findById(mistryId);
    if (!mistry) return next(new ErrorHander("Mistry not found", 404));
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) return next(new ErrorHander("Sales person user not found", 404));
    if (newUser.role !== 'user') return next(new ErrorHander('New sales person must have role "user"', 400));

    mistry.createdBy = newUser._id;
    mistry.salesPerson = newUser.name;
    await mistry.save();
    const updated = await Mistry.findById(mistry._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, mistry: updated, newSalesPerson: newUser.name, newCreatedBy: newUser._id });
});

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
    const mistries = await Mistry.find(filter).populate('createdBy', 'email name')

    // Normalize salesPerson for each mistry
    const normalizedMistries = mistries.map(m => {
        const mObj = m.toObject();
        if (!mObj.salesPerson && mObj.salesmen && mObj.salesmen.length > 0) {
            mObj.salesPerson = mObj.salesmen[0].name || '';
        }
        return mObj;
    });

    res.status(200).json({
        mistries: normalizedMistries,
        success:true
       })
})