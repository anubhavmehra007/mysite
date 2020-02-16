const mongoose = require('mongoose');
const Comment = require('./comments');

const postSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        index: { unique: true }
    },
    content: {
        type: String,
        required: true
    },
    t_o_p: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    score: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Post', postSchema, 'posts');