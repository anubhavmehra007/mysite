const mongoose = require('mongoose');
const Post = require('./posts');
const commentSchema = new mongoose.Schema();
commentSchema.add({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: {
        type: String,
        required: true
    },
    t_o_p: {
        type: Date,
        default: Date.now()
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    score: {
        type: Number,
        default: 1
    },
    parents: mongoose.Schema.Types.ObjectId
});
module.exports = mongoose.model('Comment', commentSchema, 'comments');