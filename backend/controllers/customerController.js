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

exports.createCustomer = catchAsyncErrors(async (req, res, next) => {
    const cust = await Customer.create({
        ...req.body,
        createdBy: req.user._id
    });
    console.log(cust);
    res.status(200).json({
        cust,
        success: true
    })
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