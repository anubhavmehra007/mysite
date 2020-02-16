const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    email: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String,
        required: true
    },
    validation: {
        type: Boolean,
        required: true
    },
    godPoints: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema, 'users');