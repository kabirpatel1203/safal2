const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Architect = require("../models/architectModel");
const User = require("../models/userModel");

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
    
    // For non-admin users, allow updating grade and remarks
    let updateData = req.body;
    if (req.user.role !== "admin") {
        // Only allow non-admins to update grade, remarks
        const architect = await Architect.findOne(filter);
        if (!architect) {
            return next(new ErrorHander("Architect not found", 404));
        }
        architect.grade = req.body.grade ?? architect.grade;
        architect.remarks = req.body.remarks ?? architect.remarks;
        await architect.save();
        return res.status(200).json({ architect, success: true });
    }
    
    // Prevent accidental overwrite of ownership or salesPerson via generic update
    if (updateData) {
        delete updateData.createdBy;
        delete updateData.salesPerson;
        delete updateData.salesmen;
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

// Admin: Change sales person for an architect
exports.changeArchitectSalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { architectId, newSalesPersonId } = req.body;
    // Find the architect
    const architect = await Architect.findById(architectId);
    if (!architect) {
        return next(new ErrorHander("Architect not found", 404));
    }

    // Find the new sales person user
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) {
        return next(new ErrorHander("Sales person user not found", 404));
    }
    // Ensure the target user has role 'user'
    if (newUser.role !== 'user') {
        return next(new ErrorHander('New sales person must have role "user"', 400));
    }

    const oldSalesPerson = architect.salesPerson;

    // Update the createdBy (owner) and salesPerson name
    architect.createdBy = newUser._id;
    architect.salesPerson = newUser.name;

    await architect.save();

    // re-fetch architect with populated createdBy for clarity
    const updatedArchitect = await Architect.findById(architect._id).populate('createdBy', 'name email');
    const oldCreatedBy = architect.createdBy; // before change saved this is newUser._id, so capture old via earlier value isn't available here
    console.log(`Architect ${architect._id} reassigned to '${newUser.name}' by admin ${req.user && req.user._id}`);

    res.status(200).json({
        success: true,
        architect: updatedArchitect,
        oldSalesPerson,
        newSalesPerson: newUser.name,
        newCreatedBy: newUser._id,
    });
});
