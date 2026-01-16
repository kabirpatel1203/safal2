const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Customer = require("../models/customerModel")


exports.totalCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter);

    res.status(200).json({
        custlength: customers.length,
        success: true
    })
})

exports.totalOrderValue = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter);
    var total = 0
    customers.map((item) => {
        total = total + item.orderValue
    })
    total = total / 1000;
    res.status(200).json({
        orderValue: total,
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
        customer,
        success: true
    })
})

exports.updateCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const customer = await Customer.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!customer) {
        return next(new ErrorHander("Customer not found", 404));
    }
    res.status(200).json({
        customer,
        success: true
    })
})

exports.deleteCustomer = catchAsyncErrors(async (req, res, next) => {
    const customer = await Customer.findOneAndDelete({ mobileno: req.params.id });

    res.status(200).json({
        customer,
        success: true
    })
})

exports.getAllCustomer = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const customers = await Customer.find(filter)

    res.status(200).json({
        customers,
        success: true
    })
})