const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Task = require("../models/taskModel")

exports.totalTask = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    let tasks = await Task.find(filter).populate("salesmanId mistryTag architectTag dealerTag pmcTag oemTag");
    // Normalize salesPerson for old data
    tasks = tasks.map(task => {
        if ((!task.salesPerson || task.salesPerson === "") && task.salesmanId && task.salesmanId.name) {
            task.salesPerson = task.salesmanId.name;
        }
        return task;
    });
    res.status(200).json({
        tasks,
        taskslength: tasks.length,
        success: true
    })
})
exports.createTask = async (req, res) => {
    try {
        const { date, remarks, mistryTag, architectTag, dealerTag, pmcTag, oemTag } = req.body;
        if (!date || !remarks) {
            return res.status(500).json({ success: false, message: "Please fill all the fields" });
        }
        if (!pmcTag && !mistryTag && !architectTag && !dealerTag && !oemTag)
            return res.status(500).json({ success: false, message: "Please select a tag" });

        let task = await Task.create({
            date,
            remarks,
            mistryTag,
            architectTag,
            dealerTag,
            pmcTag,
            oemTag,
            createdBy: req.user._id,
            salesPerson: req.user.name
        });
        res.status(200).json({
            task,
            success: true
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTask = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const task = await Task.findOne(filter)

    if (!task) {
        return next(new ErrorHander("Task not found", 404));
    }

    res.status(200).json({
        task,
        success: true
    })
})

exports.updateTask = catchAsyncErrors(async (req, res, next) => {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    // Ensure salesPersonId is not overwritten unless explicitly set
    const updateData = { ...req.body };
    if (!updateData.salesPersonId && req.user && req.user._id) {
        updateData.salesPersonId = req.user._id;
    }
    const task = await Task.findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!task) {
        return next(new ErrorHander("Task not found", 404));
    }
    res.status(200).json({
        task,
        success: true
    })
})

exports.deleteTask = catchAsyncErrors(async (req, res, next) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({
        message: "Task Deleted",
        success: true
    })
})