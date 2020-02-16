const express = require('express');
const Post = require('./../models/posts');
const User = require('./../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Comment = require('./../models/comments');
router = express.Router();
router.post('/:commentId', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerification, decoded) => {
        if (errVerification) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            const user = decoded.user._id;
            Post.findOne({ slug: req.postslug })
                .exec()
                .then(post => {
                    if (post) {
                        const newComment = new Comment({
                            _id: new mongoose.Types.ObjectId(),
                            user,
                            body: req.body.content,
                            parents: req.params.commentId,
                            post: post._id
                        });
                        newComment
                            .save()
                            .then(savingResult => {
                                res
                                    .status(200)
                                    .json({
                                        message: 'Succesfull Commented'
                                    })
                                    .catch(postUpdateErr => {
                                        res.status(500).json({
                                            message: postUpdateErr.message
                                        });
                                    });
                            })
                            .catch(savingError => {
                                res.status(500).json({
                                    message: savingError.message
                                });
                            });
                    } else {
                        res.status(404).json({
                            message: 'Post not found'
                        });
                    }
                })
                .catch(postFindingErr => {
                    res.status(500).json({
                        message: postFindingErr.message
                    });
                });
        }
    });
});
router.post('/', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerification, decoded) => {
        if (errVerification) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            const user = decoded.user._id;
            Post.findOne({ slug: req.postslug })
                .exec()
                .then(post => {
                    if (post) {
                        const newComment = new Comment({
                            _id: new mongoose.Types.ObjectId(),
                            user,
                            body: req.body.content,
                            parents: post._id,
                            post: post._id
                        });
                        newComment
                            .save()
                            .then(savingResult => {
                                res
                                    .status(200)
                                    .json({
                                        message: 'Succesfull Commented'
                                    })
                                    .catch(postUpdateErr => {
                                        res.status(500).json({
                                            message: postUpdateErr.message
                                        });
                                    });
                            })
                            .catch(savingError => {
                                res.status(500).json({
                                    message: savingError.message
                                });
                            });
                    } else {
                        res.status(404).json({
                            message: 'Post not found'
                        });
                    }
                })
                .catch(postFindingErr => {
                    res.status(500).json({
                        message: postFindingErr.message
                    });
                });
        }
    });
});
router.patch('/:commentid', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerification, decoded) => {
        if (errVerification) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            Comment.findOne({ _id: req.params.commentid })
                .exec()
                .then(result => {
                    if (result) {
                        if (result.user == decoded.user._id) {
                            Comment.update({ _id: req.params.commentid }, { body: req.body.content })
                                .then(updation => {
                                    res.status(200).json({
                                        message: 'Comment successfully updated'
                                    });
                                })
                                .catch(updatingErr => {
                                    res.status(500).json({
                                        message: updatingErr.message
                                    });
                                });
                        } else {
                            res.status(403).json({
                                message: 'Forbidden'
                            });
                        }
                    } else {
                        res.status(404).json({
                            message: 'Comment not found'
                        });
                    }
                })
                .catch(errFinding => {
                    res.status(500).json({
                        message: errFinding.message
                    });
                });
        }
    });
});
router.delete('/:commentid', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerification, decoded) => {
        if (errVerification) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            Comment.findOne({ _id: req.params.commentid })
                .exec()
                .then(result => {
                    if (result) {
                        if (result.user == decoded.user._id) {
                            Comment.remove({ _id: req.params.commentid })
                                .then(removal => {
                                    if (removal) {
                                        res.status(200).json({
                                            message: 'Comment successfully deleted'
                                        });
                                    } else {
                                        res.status(500).json({
                                            message: 'Cannot delete at the momment'
                                        });
                                    }
                                })
                                .catch(updatingErr => {
                                    res.status(500).json({
                                        message: updatingErr.message
                                    });
                                });
                        } else {
                            res.status(403).json({
                                message: 'Forbidden'
                            });
                        }
                    } else {
                        res.status(404).json({
                            message: 'Comment not found'
                        });
                    }
                })
                .catch(errFinding => {
                    res.status(500).json({
                        message: errFinding.message
                    });
                });
        }
    });
});

module.exports = router;