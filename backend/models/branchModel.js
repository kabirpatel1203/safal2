const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
    branchname:String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});



module.exports = mongoose.model("Branch", branchSchema)

