const mongoose = require('mongoose');
const Inquiry = require('./backend/models/inquiryModel');

// Connect to MongoDB
const DB_URI = "mongodb+srv://kabirpatel1203_db_user:djv6ZYIL5qJ3UD8d@cluster0.0z9b3kb.mongodb.net/";
mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    updateScaleValues();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function updateScaleValues() {
    try {
        // Update all inquiries that have scale set to "Medium" (the old default) to null
        const result = await Inquiry.updateMany(
            { scale: "Medium" },
            { $unset: { scale: "" } }
        );
        
        console.log(`Updated ${result.modifiedCount} inquiries - set scale to null/undefined`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating scale values:', error);
        process.exit(1);
    }
}
