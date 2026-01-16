const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Inquiry = require("../models/inquiryModel")


// exports.totalInquiry = catchAsyncErrors(async (req, res, next) => {

//     const Inquiries = await Inquiry.find();

//     res.status(200).json({
//         custlength: Inquiries.length,
//         success: true
//     })
// })



exports.createInquiry = catchAsyncErrors(async (req, res, next) => {
    const inquiry = await Inquiry.create({
        ...req.body,
        createdBy: req.user._id
    });
    // console.log(cust);/
    res.status(200).json({
        inquiry,
        success: true
    })
})

exports.getInquiry = catchAsyncErrors(async (req, res, next) => {
    let filter = { _id: req.params.id };
    
    if (req.user.role !== "admin") {
        // Non-admin users can only see inquiries they created or are assigned to
        filter = {
            _id: req.params.id,
            $or: [
                { createdBy: req.user._id },
                // Match salesman entries that contain the user's name (case-insensitive)
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }
    
    const inquiry = await Inquiry.findOne(filter);

    if (!inquiry) {
        return next(new ErrorHander("Inquiry not found", 404));
    }

    res.status(200).json({
        inquiry,
        success: true
    })
})

exports.updateInquiry = catchAsyncErrors(async (req, res, next) => {
    let filter = { _id: req.params.id };
    
    if (req.user.role !== "admin") {
        // Non-admin users can only update inquiries they created or are assigned to
        filter = {
            _id: req.params.id,
            $or: [
                { createdBy: req.user._id },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }
    
    const inquiry = await Inquiry.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!inquiry) {
        return next(new ErrorHander("Inquiry not found", 404));
    }
    res.status(200).json({
        inquiry,
        success: true
    })
})

exports.deleteInquiry = catchAsyncErrors(async (req, res, next) => {
    // const inquiry = await Inquiry.findByIdAndDelete(t);
    const inquiry = await Inquiry.findOneAndDelete({ mobileno: req.params.id });

    res.status(200).json({
        inquiry,
        success: true
    })
})

exports.getAllInquiry = catchAsyncErrors(async (req, res, next) => {
    let inquiries;
    if (req.user.role === "admin") {
        // Admin sees all inquiries
        inquiries = await Inquiry.find();
    } else {
        // Non-admin users see:
        // 1. Inquiries they created
        // 2. Inquiries where they are listed as a salesman (by name contains match, case-insensitive)
        inquiries = await Inquiry.find({
            $or: [
                { createdBy: req.user._id },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        });
    }

    res.status(200).json({
        inquiries,
        success: true
    })
})

exports.getFilteredInquiry = catchAsyncErrors(async (req, res, next) => {

    // let body = req.body;
    // const salesman = req.query.salesman;
    // const branch = req.query.branch;
    // let startDate = req.query.startdate;
    // let endDate = req.query.enddate;
    // let s=new Date(startDate);
    // // s=startDate.toISOString();
    // let e=new Date(endDate);
    // e=endDate.toISOString();

    // console.log(req.query.enddate)
    // let s=new Date(startDate);
    // let e=new Date(endDate);

// s=
    // s=startDate.parse()
    // startDate=new Date(startDate);
    // endDate=new Date(endDate);
    const salesman = req.params.salesman;
    const branch = req.params.branch;
    const startdate = req.params.startdate;
    const endDate = req.params.enddate;
    
    // Build owner filter for non-admin users
    let ownerFilter = {};
    if (req.user.role !== "admin") {
        ownerFilter = {
            $or: [
                { createdBy: req.user._id },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }

    const inquiries = await Inquiry.find({
        ...ownerFilter,
        date: { "$gte": startdate, "$lt": endDate },
        "salesmen.name": salesman,
        "branches.branchname": branch
    })
    res.status(200).json({
        inquiries,
        success: true
    })
})

// Migration function to assign createdBy to existing inquiries without it
// Tries to match salesman name to user, or assigns to admin
exports.migrateInquiries = catchAsyncErrors(async (req, res, next) => {
    // Only allow admin to run this
    if (req.user.role !== "admin") {
        return next(new ErrorHander("Only admin can run migrations", 403));
    }

    const User = require("../models/userModel");
    
    // Get all inquiries without createdBy
    const inquiriesWithoutOwner = await Inquiry.find({ createdBy: { $exists: false } });
    
    let migratedCount = 0;

    for (const inquiry of inquiriesWithoutOwner) {
        let assignedUserId = req.user._id; // Default to current admin
        
        // Try to find a matching salesman from the inquiry
        if (inquiry.salesmen && inquiry.salesmen.length > 0) {
            const salesmanName = inquiry.salesmen[0].name;
            const matchingUser = await User.findOne({ name: salesmanName });
            if (matchingUser) {
                assignedUserId = matchingUser._id;
            }
        }
        
        // Update the inquiry
        await Inquiry.findByIdAndUpdate(inquiry._id, { createdBy: assignedUserId });
        migratedCount++;
    }

    res.status(200).json({
        message: "Migration completed",
        modifiedCount: migratedCount,
        success: true
    })
})