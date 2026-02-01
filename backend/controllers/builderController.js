const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Builder = require("../models/builderModel")
const User = require("../models/userModel")


exports.totalBuilder = catchAsyncErrors(async(req, res, next)=>{
   
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const builders = await Builder.find(filter);

    res.status(200).json({
        builderlength:builders.length,
        success:true
       })
})


exports.createBuilder = catchAsyncErrors(async(req, res, next)=>{
    let t = req.body;
    t = {
        ...t,
        date : t.date ? t.date.substr(0,10) : null
    }
    const builder = await Builder.create({
        ...t,
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
    })

    res.status(200).json({
        builder,
        success:true
       })
})

exports.getBuilder = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const builder = await Builder.findOne(filter)

    if (!builder) {
        return next(new ErrorHander("Builder not found", 404));
    }

    res.status(200).json({
        builder,
        success:true
       })
})


exports.updateBuilder = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    
    // For non-admin users, allow limited updates
    let updateData = req.body;
    if (req.user.role !== "admin") {
        const builder = await Builder.findOne(filter);
        if (!builder) {
            return next(new ErrorHander("Builder not found", 404));
        }
        builder.grade = req.body.grade ?? builder.grade;
        builder.remarks = req.body.remarks ?? builder.remarks;
        await builder.save();
        return res.status(200).json({ builder, success: true });
    }

    if (updateData) {
        delete updateData.createdBy;
        delete updateData.salesPerson;
        delete updateData.salesmen;
    }

    const builder = await Builder.findOneAndUpdate(filter, updateData, {
        new:true,
        runValidators:true,
        useFindAndModify:false
 
    });

    if (!builder) {
        return next(new ErrorHander("Builder not found", 404));
    }

    res.status(200).json({
        builder,
        success:true
       })
})

// Admin: Change sales person for a Builder
exports.changeBuilderSalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { builderId, newSalesPersonId } = req.body;
    const builder = await Builder.findById(builderId);
    if (!builder) return next(new ErrorHander("Builder not found", 404));
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) return next(new ErrorHander("Sales person user not found", 404));
    if (newUser.role !== 'user') return next(new ErrorHander('New sales person must have role "user"', 400));

    builder.createdBy = newUser._id;
    builder.salesPerson = newUser.name;
    await builder.save();
    const updated = await Builder.findById(builder._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, builder: updated, newSalesPerson: newUser.name, newCreatedBy: newUser._id });
});

exports.deleteBuilder = catchAsyncErrors(async(req, res, next)=>{
    const builder = await Builder.findByIdAndDelete(req.params.id);

    res.status(200).json({
        builder,
        success:true
       })
})

exports.getAllBuilder = catchAsyncErrors(async(req, res, next)=>{
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const builders = await Builder.find(filter).populate('createdBy', 'email name')

    // Normalize salesPerson for each Builder
    const normalizedBuilders = builders.map(b => {
        const bObj = b.toObject();
        if (!bObj.salesPerson && bObj.salesmen && bObj.salesmen.length > 0) {
            bObj.salesPerson = bObj.salesmen[0].name || '';
        }
        return bObj;
    });

    res.status(200).json({
        builders: normalizedBuilders,
        success:true
       })
})
