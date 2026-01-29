const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Dealer = require("../models/dealerModel")
const User = require("../models/userModel")


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
        createdBy: req.user._id,
        salesPerson: req.user.name,
        salesmen: []
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
    
    // For non-admin users, allow updating SS, L, Grade, and remarks
    let updateData = req.body;
    if (req.user.role !== "admin") {
        // Only allow non-admins to update SS, L, grade, remarks
        const dealer = await Dealer.findOne(filter);
        if (!dealer) {
            return next(new ErrorHander("Dealer not found", 404));
        }
        dealer.SS = req.body.SS ?? dealer.SS;
        dealer.L = req.body.L ?? dealer.L;
        dealer.grade = req.body.grade ?? dealer.grade;
        dealer.remarks = req.body.remarks ?? dealer.remarks;
        await dealer.save();
        return res.status(200).json({ dealer, success: true });
    }

    if (updateData) {
        delete updateData.createdBy;
        delete updateData.salesPerson;
        delete updateData.salesmen;
    }

    const dealer = await Dealer.findOneAndUpdate(filter, updateData, {
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

// Admin: Change sales person for a Dealer
exports.changeDealerSalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { dealerId, newSalesPersonId } = req.body;
    const dealer = await Dealer.findById(dealerId);
    if (!dealer) return next(new ErrorHander("Dealer not found", 404));
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) return next(new ErrorHander("Sales person user not found", 404));
    if (newUser.role !== 'user') return next(new ErrorHander('New sales person must have role "user"', 400));

    dealer.createdBy = newUser._id;
    dealer.salesPerson = newUser.name;
    await dealer.save();
    const updated = await Dealer.findById(dealer._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, dealer: updated, newSalesPerson: newUser.name, newCreatedBy: newUser._id });
});

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
    const dealers = await Dealer.find(filter).populate('createdBy', 'email name')

    // Normalize salesPerson for each dealer
    const normalizedDealers = dealers.map(d => {
        const dObj = d.toObject();
        if (!dObj.salesPerson && dObj.salesmen && dObj.salesmen.length > 0) {
            dObj.salesPerson = dObj.salesmen[0].name || '';
        }
        return dObj;
    });

    res.status(200).json({
        dealers: normalizedDealers,
        success:true
       })
})