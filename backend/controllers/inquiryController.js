const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const mongoose = require('mongoose');
const Inquiry = require("../models/inquiryModel")
const Customer = require("../models/customerModel")
const User = require("../models/userModel")

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

const normalizeInquiryDoc = (doc) => {
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

    // Always include scale field
    plain.scale = doc.scale ?? plain.scale ?? "N/A";

    // Compute salesPerson: prioritize existing salesPerson, then legacy salesmen[0].name, then createdBy.name
    if (!plain.salesPerson || plain.salesPerson === "") {
        if (plain.salesmen && plain.salesmen.length > 0 && plain.salesmen[0].name) {
            plain.salesPerson = plain.salesmen[0].name;
        } else if (plain.createdBy && plain.createdBy.name) {
            plain.salesPerson = plain.createdBy.name;
        }
    }

    return plain;
};


const normalizeInquiriesArray = (inquiries) => {
    if (!Array.isArray(inquiries)) {
        return [];
    }
    return inquiries.map((inquiry) => normalizeInquiryDoc(inquiry));
};


// exports.totalInquiry = catchAsyncErrors(async (req, res, next) => {

//     const Inquiries = await Inquiry.find();

//     res.status(200).json({
//         custlength: Inquiries.length,
//         success: true
//     })
// })



exports.createInquiry = catchAsyncErrors(async (req, res, next) => {
    const inquiryData = {
        ...req.body,
        createdBy: req.user._id,
        // Set salesPerson to the logged-in user's name for new entries
        salesPerson: req.user.name
    };
    
    // Clear salesmen array as we're now using salesPerson field
    inquiryData.salesmen = [];

    const rewardValue = parseRewardValue(
        inquiryData.rewardPoints ??
        inquiryData.revenue ??
        inquiryData.orderValue ??
        inquiryData.ordervalue
    );
    inquiryData.rewardPoints = rewardValue;
    inquiryData.revenue = rewardValue;
    
    // If creating inquiry as already Qualified, move directly to Customer
    if (inquiryData.stage === "Qualified") {
        console.log(`New inquiry is already Qualified, creating customer directly...`);
        
        // Normalize scale value to ensure it matches Customer schema enum
        let scaleValue = inquiryData.scale;
        const validScales = ["High", "Medium", "Low", "N/A"];
        if (!scaleValue || !validScales.includes(scaleValue)) {
            scaleValue = "N/A";
        }
        
        // Check if customer already exists
        let existingCustomer = await Customer.findOne({ mobileno: inquiryData.mobileno });
        
        if (existingCustomer) {
            console.log(`Customer already exists for ${inquiryData.mobileno}, returning existing customer`);
            return res.status(200).json({
                success: true,
                movedToCustomer: true,
                customer: existingCustomer,
                customerAlreadyExisted: true
            });
        }

        try {
            const createdCustomer = await Customer.create({
                name: inquiryData.name,
                email: inquiryData.email,
                mobileno: inquiryData.mobileno,
                address: inquiryData.address,
                area: inquiryData.area,
                birthdate: inquiryData.birthdate,
                marriagedate: inquiryData.marriagedate,
                revenue: rewardValue,
                rewardPoints: rewardValue,
                date: inquiryData.date,
                followupdate: inquiryData.followupdate,
                requirement: inquiryData.requirement,
                remarks: inquiryData.remarks,
                scale: scaleValue,
                mistryTag: inquiryData.mistryTag,
                mistryName: inquiryData.mistryName,
                mistryNumber: inquiryData.mistryNumber,
                architectTag: inquiryData.architectTag,
                architectName: inquiryData.architectName,
                architectNumber: inquiryData.architectNumber,
                dealerTag: inquiryData.dealerTag,
                dealerName: inquiryData.dealerName,
                dealerNumber: inquiryData.dealerNumber,
                pmcTag: inquiryData.pmcTag,
                pmcName: inquiryData.pmcName,
                pmcNumber: inquiryData.pmcNumber,
                builderTag: inquiryData.builderTag,
                builderName: inquiryData.builderName,
                builderNumber: inquiryData.builderNumber,
                oemTag: inquiryData.oemTag,
                oemName: inquiryData.oemName,
                oemNumber: inquiryData.oemNumber,
                branches: inquiryData.branches,
                salesmen: [],
                salesPerson: inquiryData.salesPerson,
                adminRemarks: inquiryData.adminRemarks || "",
                // set the actor performing the move as the owner of the new customer
                createdBy: req.user._id,
            });
            // expose created customer for frontend to use immediately
            console.log(`Customer created from qualified inquiry`);
            return res.status(200).json({
                success: true,
                movedToCustomer: true,
                customer: createdCustomer
            });
        } catch (err) {
            console.error('Failed creating customer from qualified inquiry', err);
            
            // Provide specific error message based on error type
            let errorMessage = 'Failed to create customer from qualified inquiry';
            if (err.code === 11000) {
                errorMessage = 'A customer with this mobile number already exists.';
            } else if (err.name === 'ValidationError') {
                errorMessage = `Validation error: ${err.message}`;
            }
            
            return next(new ErrorHander(errorMessage, 500));
        }

    }
    
    // Normal inquiry creation (not qualified)
    // Ensure only admins can set adminRemarks on create
    if (req.user.role !== "admin") {
        delete inquiryData.adminRemarks;
    } else {
        inquiryData.adminRemarks = req.body.adminRemarks || inquiryData.adminRemarks || "";
    }

    const inquiry = await Inquiry.create(inquiryData);
    res.status(200).json({
        inquiry: normalizeInquiryDoc(inquiry),
        success: true
    })
})

exports.getInquiry = catchAsyncErrors(async (req, res, next) => {
    let filter = { _id: req.params.id };
    
    if (req.user.role !== "admin") {
        // Non-admin users can only see inquiries they created or are assigned to (by salesPerson or legacy salesmen)
        filter = {
            _id: req.params.id,
            $or: [
                { createdBy: req.user._id },
                { salesPerson: { $regex: req.user.name, $options: "i" } },
                // Legacy support: match salesman entries that contain the user's name
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }
    
    const inquiry = await Inquiry.findOne(filter).populate('createdBy', 'email name');

    if (!inquiry) {
        return next(new ErrorHander("Inquiry not found", 404));
    }

    res.status(200).json({
        inquiry: normalizeInquiryDoc(inquiry),
        success: true
    })
})

exports.updateInquiry = catchAsyncErrors(async (req, res, next) => {
    let filter = { _id: req.params.id };

    if (req.user.role !== "admin") {
        // Non-admin users can only update inquiries they created or are assigned to (by salesPerson or legacy salesmen)
        filter = {
            _id: req.params.id,
            $or: [
                { createdBy: req.user._id },
                { salesPerson: { $regex: req.user.name, $options: "i" } },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }

    // Load existing inquiry to check previous stage
    const existingInquiry = await Inquiry.findOne(filter);

    if (!existingInquiry) {
        return next(new ErrorHander("Inquiry not found", 404));
    }

    // For non-admin users, only allow updating stage, requirement, and scale fields
    let updateData = req.body;
    if (req.user.role !== "admin") {
        updateData = {
            stage: req.body.stage,
            requirement: req.body.requirement,
            scale: req.body.scale,
            remarks: req.body.remarks,
            followupdate: req.body.followupdate ? new Date(req.body.followupdate) : undefined
        };
    }

    // Ensure non-admins cannot set adminRemarks
    if (req.user.role !== "admin") {
        delete updateData.adminRemarks;
    }
    
    // Remove salesmen from update data - we don't use it anymore
    delete updateData.salesmen;
    // Prevent overwriting owner/salesPerson via generic update - admin should use change-salesperson endpoint
    delete updateData.createdBy;
    delete updateData.salesPerson;

    // Check if this update is trying to change stage to "Qualified"
    const isBecomingQualified = updateData.stage === "Qualified" && existingInquiry.stage !== "Qualified";

    // If becoming qualified, handle the move to Customer FIRST before saving the stage change
    if (isBecomingQualified) {
        console.log(`Inquiry ${existingInquiry._id} is being qualified, will move to Customer...`);

        const rewardValue = parseRewardValue(
            existingInquiry.rewardPoints ??
            existingInquiry.revenue ??
            existingInquiry.orderValue ??
            existingInquiry.ordervalue ??
            updateData.rewardPoints ??
            updateData.revenue
        );

        // Compute salesPerson: prioritize existing salesPerson, then legacy salesmen[0].name
        let salesPersonValue = existingInquiry.salesPerson || "";
        if (!salesPersonValue && existingInquiry.salesmen && existingInquiry.salesmen.length > 0 && existingInquiry.salesmen[0].name) {
            salesPersonValue = existingInquiry.salesmen[0].name;
        }

        // Normalize scale value to ensure it matches Customer schema enum
        let scaleValue = updateData.scale || existingInquiry.scale;
        const validScales = ["High", "Medium", "Low", "N/A"];
        if (!scaleValue || !validScales.includes(scaleValue)) {
            scaleValue = "N/A";
        }

        // Merge update data with existing inquiry for customer creation
        const mergedData = {
            name: updateData.name || existingInquiry.name,
            email: updateData.email || existingInquiry.email,
            mobileno: existingInquiry.mobileno, // mobileno should not change
            address: updateData.address || existingInquiry.address,
            area: updateData.area || existingInquiry.area,
            birthdate: updateData.birthdate || existingInquiry.birthdate,
            marriagedate: updateData.marriagedate || existingInquiry.marriagedate,
            revenue: rewardValue,
            rewardPoints: rewardValue,
            date: updateData.date || existingInquiry.date,
            followupdate: updateData.followupdate || existingInquiry.followupdate,
            requirement: updateData.requirement || existingInquiry.requirement,
            remarks: updateData.remarks || existingInquiry.remarks,
            scale: scaleValue,
            mistryTag: updateData.mistryTag || existingInquiry.mistryTag,
            mistryName: updateData.mistryName || existingInquiry.mistryName,
            mistryNumber: updateData.mistryNumber || existingInquiry.mistryNumber,
            architectTag: updateData.architectTag || existingInquiry.architectTag,
            architectName: updateData.architectName || existingInquiry.architectName,
            architectNumber: updateData.architectNumber || existingInquiry.architectNumber,
            dealerTag: updateData.dealerTag || existingInquiry.dealerTag,
            dealerName: updateData.dealerName || existingInquiry.dealerName,
            dealerNumber: updateData.dealerNumber || existingInquiry.dealerNumber,
            pmcTag: updateData.pmcTag || existingInquiry.pmcTag,
            pmcName: updateData.pmcName || existingInquiry.pmcName,
            pmcNumber: updateData.pmcNumber || existingInquiry.pmcNumber,
            builderTag: updateData.builderTag || existingInquiry.builderTag,
            builderName: updateData.builderName || existingInquiry.builderName,
            builderNumber: updateData.builderNumber || existingInquiry.builderNumber,
            oemTag: updateData.oemTag || existingInquiry.oemTag,
            oemName: updateData.oemName || existingInquiry.oemName,
            oemNumber: updateData.oemNumber || existingInquiry.oemNumber,
            branches: existingInquiry.branches,
            salesmen: [],
            salesPerson: salesPersonValue,
            adminRemarks: (req.user.role === "admin" ? updateData.adminRemarks : existingInquiry.adminRemarks) || "",
            createdBy: req.user._id,
        };

        // Start a MongoDB session for transaction
        const session = await mongoose.startSession();
        
        try {
            let responseCustomer = null;
            let customerAlreadyExisted = false;

            await session.withTransaction(async () => {
                // Check if customer already exists (within transaction)
                const existingCustomer = await Customer.findOne({ mobileno: existingInquiry.mobileno }).session(session);
                
                if (existingCustomer) {
                    console.log(`Customer already exists for ${existingInquiry.mobileno}, will delete inquiry and link to existing customer`);
                    customerAlreadyExisted = true;
                    responseCustomer = existingCustomer;
                } else {
                    // Create new customer within transaction
                    const createdCustomers = await Customer.create([mergedData], { session });
                    responseCustomer = createdCustomers[0];
                    console.log(`Created customer ${responseCustomer._id} from inquiry ${existingInquiry.mobileno}`);
                }

                // Delete inquiry within the same transaction
                // This ONLY happens if customer creation succeeded (or customer already exists)
                await Inquiry.findByIdAndDelete(existingInquiry._id).session(session);
                console.log(`Deleted inquiry ${existingInquiry._id} within transaction`);
            });

            // Transaction committed successfully
            await session.endSession();

            console.log(`Transaction completed successfully. Customer ${customerAlreadyExisted ? 'already existed' : 'created'}: ${responseCustomer._id}`);

            return res.status(200).json({
                success: true,
                movedToCustomer: true,
                customer: responseCustomer,
                customerAlreadyExisted: customerAlreadyExisted
            });
        } catch (err) {
            // Transaction failed - it will automatically rollback
            // IMPORTANT: The inquiry was NOT modified because we didn't save it yet
            // So no data is lost - inquiry remains in its original state
            await session.endSession();
            
            console.error('Transaction failed while moving inquiry to customer:', err);

            // Provide specific error message based on error type
            let errorMessage = 'Failed to move inquiry to customer. The inquiry has NOT been modified and remains safe.';
            if (err.code === 11000) {
                errorMessage = 'A customer with this mobile number already exists but could not be linked. Please try again.';
            } else if (err.name === 'ValidationError') {
                errorMessage = `Validation error while creating customer: ${err.message}. Please check the inquiry data.`;
            } else if (err.message && err.message.includes('transaction')) {
                // MongoDB standalone mode doesn't support transactions
                errorMessage = 'Database transaction not supported. Please contact administrator.';
            }

            return next(new ErrorHander(errorMessage, 500));
        }
    }

    // For non-qualified updates, proceed normally
    Object.assign(existingInquiry, updateData);
    const normalizedReward = parseRewardValue(
        existingInquiry.rewardPoints ??
        existingInquiry.revenue ??
        existingInquiry.orderValue ??
        existingInquiry.ordervalue
    );
    existingInquiry.rewardPoints = normalizedReward;
    existingInquiry.revenue = normalizedReward;

    const inquiry = await existingInquiry.save();

    console.log(`Inquiry updated, stage: "${inquiry.stage}"`);

    // Normal update without moving
    res.status(200).json({
        inquiry: normalizeInquiryDoc(inquiry),
        success: true
    })
})

// Admin: Change sales person for an Inquiry
exports.changeInquirySalesPerson = catchAsyncErrors(async (req, res, next) => {
    const { inquiryId, newSalesPersonId } = req.body;
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) return next(new ErrorHander("Inquiry not found", 404));
    const newUser = await User.findById(newSalesPersonId);
    if (!newUser) return next(new ErrorHander("Sales person user not found", 404));
    if (newUser.role !== 'user') return next(new ErrorHander('New sales person must have role "user"', 400));

    inquiry.createdBy = newUser._id;
    inquiry.salesPerson = newUser.name;
    await inquiry.save();
    const updated = await Inquiry.findById(inquiry._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, inquiry: normalizeInquiryDoc(updated), newSalesPerson: newUser.name, newCreatedBy: newUser._id });
});

exports.deleteInquiry = catchAsyncErrors(async (req, res, next) => {
    // const inquiry = await Inquiry.findByIdAndDelete(t);
    const inquiry = await Inquiry.findOneAndDelete({ mobileno: req.params.id });

    res.status(200).json({
        inquiry: normalizeInquiryDoc(inquiry),
        success: true
    })
})

exports.getAllInquiry = catchAsyncErrors(async (req, res, next) => {
    let inquiries;
    if (req.user.role === "admin") {
        // Admin sees all inquiries
        inquiries = await Inquiry.find().populate('createdBy', 'email name');
    } else {
        // Non-admin users see:
        // 1. Inquiries they created
        // 2. Inquiries where they are the salesPerson
        // 3. Legacy: Inquiries where they are listed in salesmen array
        inquiries = await Inquiry.find({
            $or: [
                { createdBy: req.user._id },
                { salesPerson: { $regex: req.user.name, $options: "i" } },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        }).populate('createdBy', 'email name');
    }

    res.status(200).json({
        inquiries: normalizeInquiriesArray(inquiries),
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
                { salesPerson: { $regex: req.user.name, $options: "i" } },
                { "salesmen.name": { $regex: req.user.name, $options: "i" } }
            ]
        };
    }

    // Build query based on whether salesman filter is applied
    // If salesman is "all", don't filter by salesperson
    let query = {
        ...ownerFilter,
        date: { "$gte": startdate, "$lt": endDate },
        "branches.branchname": branch
    };

    // Only add salesPerson filter if not "all"
    if (salesman !== "all") {
        query.$or = [
            { salesPerson: salesman },
            { "salesmen.name": salesman }
        ];
    }

    const inquiries = await Inquiry.find(query);
    res.status(200).json({
        inquiries: normalizeInquiriesArray(inquiries),
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