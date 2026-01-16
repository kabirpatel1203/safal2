const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Branch = require("../models/branchModel");
const Customer = require("../models/customerModel");
const Architect = require("../models/architectModel");
const Dealer = require("../models/dealerModel")
const Mistry = require("../models/mistryModel")
const PMC = require("../models/pmcModel")

const Inquiry=require("../models/inquiryModel")
const Salesman=require("../models/salesmanModel")
exports.createbranch = catchAsyncErrors(async (req, res, next) => {
    const branch = await Branch.create({
        ...req.body,
        createdBy: req.user._id
    })

    res.status(200).json({
        branch,
        success: true
    })
})
exports.totalbranch = catchAsyncErrors(async (req, res, next) => {
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const branches = await Branch.find(ownerFilter);

    res.status(200).json({
        branchsize: branches.length,
        success: true
    })
})
exports.getBranch = catchAsyncErrors(async (req, res, next) => {
    const ownerFilter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const branch = await Branch.findOne(ownerFilter)

    if (!branch) {
        return next(new ErrorHander("Branch not found", 404));
    }

    res.status(200).json({
        branch,
        success: true
    })
})

exports.updateBranch = catchAsyncErrors(async (req, res, next) => {

    const ownerFilter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };

    const branch = await Branch.findOneAndUpdate(ownerFilter, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false

    });

    if (!branch) {
        return next(new ErrorHander("Branch not found", 404));
    }

    res.status(200).json({
        branch,
        success: true
    })
})

exports.getAllBranches = catchAsyncErrors(async (req, res, next) => {

    // All users can see all branches (shared master data)
    const ownerFilter = {};
    let branches = await Branch.find(ownerFilter);
    const lengths = await getarc(branches, ownerFilter);
    res.status(200).json({
        branches,
        lengths,
        success: true
    })
})
async function getarc(br, ownerFilter) {
    let branhes = [];
    for (let i = 0; i < br.length; i++) {
        const filter = { ...ownerFilter, "branches.branchname": br[i].branchname };
        const architects = await Architect.find(filter)
        const customers = await Customer.find(filter)
        const pmc = await PMC.find(filter)
        const mistry = await Mistry.find(filter)
        const dealer = await Dealer.find(filter)
        const n = {
            ...br[i],
            arclen: architects.length,
            custlen: customers.length,
            deallen: dealer.length,
            mistlen: mistry.length,
            pmclen: pmc.length
        }
        branhes.push(n)
    }
    return branhes;
}
exports.getCustomerofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        customers,
        success: true
    })
})
exports.getInquiriesofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const inquiries = await Inquiry.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        inquiries,
        success: true
    })
})
exports.getSalesmenofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const salesmen = await Salesman.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        salesmen,
        success: true
    })
})

exports.getArchitectsofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const architects = await Architect.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        architects,
        success: true
    })
})
exports.getDealersofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const dealer = await Dealer.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        dealer,
        success: true
    })
})
exports.getMistryofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const mistry = await Mistry.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        mistry,
        success: true
    })
})
exports.getPMCofBranch = catchAsyncErrors(async (req, res, next) => {
    const branchname = req.body.branchname;
    if (!branchname) {
        return next(new ErrorHander("Please Provide branchname", 400))

    }
    const ownerFilter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const pmc = await PMC.find({ ...ownerFilter, "branches.branchname": branchname })
    res.status(200).json({
        pmc,
        success: true
    })
})
exports.deleteBranch = catchAsyncErrors(async (req, res, next) => {

    let t = req.params.branchname;

    const branch= await Branch.findOneAndDelete({branchname:t});

    res.status(200).json({
        branch,
        success: true
    })
})