const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const PMC = require("../models/pmcModel")
const User = require("../models/userModel")


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
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
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
    
    // For non-admin users, allow updating grade and remarks
    let updateData = req.body;
    if (req.user.role !== "admin") {
        // Only allow non-admins to update grade, remarks
        const pmc = await PMC.findOne(filter);
        if (!pmc) {
            return next(new ErrorHander("PMC not found", 404));
        }
        pmc.grade = req.body.grade ?? pmc.grade;
        pmc.remarks = req.body.remarks ?? pmc.remarks;
        await pmc.save();
        return res.status(200).json({ pmc, success: true });
    }

    if (updateData) {
        delete updateData.createdBy;
        delete updateData.salesPerson;
        delete updateData.salesmen;
    }

    const pmc = await PMC.findOneAndUpdate(filter, updateData, {
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

// Admin: Change sales person for a PMC
exports.changePMCSalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { pmcId, newSalesPersonId } = req.body;
    const pmc = await PMC.findById(pmcId);
    if (!pmc) return next(new ErrorHander("PMC not found", 404));
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) return next(new ErrorHander("Sales person user not found", 404));
    if (newUser.role !== 'user') return next(new ErrorHander('New sales person must have role "user"', 400));

    pmc.createdBy = newUser._id;
    pmc.salesPerson = newUser.name;
    await pmc.save();
    const updated = await PMC.findById(pmc._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, pmc: updated, newSalesPerson: newUser.name, newCreatedBy: newUser._id });
});

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
    const pmcs = await PMC.find(filter).populate('createdBy', 'email name')

    // Normalize salesPerson for each PMC
    const normalizedPmcs = pmcs.map(p => {
        const pObj = p.toObject();
        if (!pObj.salesPerson && pObj.salesmen && pObj.salesmen.length > 0) {
            pObj.salesPerson = pObj.salesmen[0].name || '';
        }
        return pObj;
    });

    res.status(200).json({
        pmcs: normalizedPmcs,
        success:true
       })
})