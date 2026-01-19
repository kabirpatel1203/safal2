const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Customer = require("../models/customerModel")

const parseRewardValue = (rawValue) => {
    const value = rawValue ?? 0;
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        const sanitized = value.replace(/[^0-9.-]/g, "");
        const parsed = Number(sanitized);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const normalizeCustomerDoc = (doc) => {
    if (!doc) {
        return null;
    }
    const plain = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : doc;
    const rewardValue = parseRewardValue(
        plain.rewardPoints ??
        plain.revenue ??
        plain.orderValue ??
        plain.ordervalue
    );
    plain.rewardPoints = rewardValue;
    plain.revenue = rewardValue;
    return plain;
};

const normalizeCustomersArray = (customers) => {
    if (!Array.isArray(customers)) {
        return [];
    }
    return customers.map((customer) => normalizeCustomerDoc(customer));
};


exports.totalCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter);

    res.status(200).json({
        custlength: customers.length,
        success: true
    })
})

exports.totalRewardPoints = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter);
    const total = customers.reduce((acc, item) => {
        const rewardValue = parseRewardValue(
            item?.rewardPoints ??
            item?.revenue ??
            item?.orderValue ??
            item?.ordervalue
        );
        return acc + rewardValue;
    }, 0);
    total = total / 1000;
    res.status(200).json({
        rewardPoints: total,
        success: true
    })
})

// Direct customer creation via API is disabled in favour of the Inquiry -> Customer flow
exports.createCustomer = catchAsyncErrors(async (req, res, next) => {
    return next(new ErrorHander("Direct customer creation is disabled. Please create an Inquiry and qualify it instead.", 403));
})

exports.getCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const customer = await Customer.findOne(filter)

    if (!customer) {
        return next(new ErrorHander("Customer not found", 404));
    }

    res.status(200).json({
        customer: normalizeCustomerDoc(customer),
        success: true
    })
})

exports.updateCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    
    // For non-admin users, only allow updating remarks field
    let updateData = req.body;
    if (req.user.role !== "admin") {
        updateData = {
            remarks: req.body.remarks
        };
    }

    const hasRewardUpdate = Object.prototype.hasOwnProperty.call(updateData, "rewardPoints") || Object.prototype.hasOwnProperty.call(updateData, "revenue");
    if (hasRewardUpdate) {
        const rewardValue = parseRewardValue(updateData.rewardPoints ?? updateData.revenue);
        updateData.rewardPoints = rewardValue;
        updateData.revenue = rewardValue;
    }
    
    const customer = await Customer.findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!customer) {
        return next(new ErrorHander("Customer not found", 404));
    }
    res.status(200).json({
        customer: normalizeCustomerDoc(customer),
        success: true
    })
})

exports.deleteCustomer = catchAsyncErrors(async (req, res, next) => {
    const customer = await Customer.findOneAndDelete({ mobileno: req.params.id });

    res.status(200).json({
        customer: normalizeCustomerDoc(customer),
        success: true
    })
})

exports.getAllCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter).populate('createdBy', 'email name')

    res.status(200).json({
        customers: normalizeCustomersArray(customers),
        success: true
    })
})