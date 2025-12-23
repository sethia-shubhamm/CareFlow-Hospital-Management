import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    messages: [{
        id: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['user', 'ai'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        files: [{
            name: String,
            size: Number
        }],
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
