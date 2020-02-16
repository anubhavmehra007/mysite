const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Posts = require('./../models/posts');
const User = require('./../models/user');
const Comment = require('./../models/comments');
const jwt = require('jsonwebtoken');
const comments = require('./comments');
let createSlug = title => {
    let slugArray = title.split(' ');
    let slug = '';
    slugArray.forEach(element => {
        element = element.toLowerCase();
        newElement = '';
        element.split('').forEach(c => {
            const code = c.charCodeAt(0);
            if (code >= 97 && code <= 122) {
                newElement += c;
            }
        });
        slug += newElement + '-';
    });
    return slug.slice(0, slug.length - 1);
};
router.use(
    '/:postslug/comments',
    (req, res, next) => {
        req.postslug = req.params.postslug;
        next();
    },
    comments
);
router.get('/', (req, res) => {
    Posts.find()
        .exec()
        .then(postArray => {
            if (postArray.length > 0) {
                res.status(200).json({
                    message: 'Current POSTS',
                    postArray
                });
            } else {
                res.status(404).json({
                    message: 'No posts Found'
                });
            }
        });
});
router.get('/:slug', (req, res) => {
    Posts.findOne({ slug: req.params.slug })
        .exec()
        .then(result => {
            if (result) {
                Comment.find({ post: result._id })
                    .exec()
                    .then(comments => {
                        res.status(201).json({
                            message: 'Post Found',
                            post: result,
                            comments
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: err.message
                        });
                    });
            } else {
                res.status(404).json({
                    message: 'Post not Found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});
router.post('/', (req, res) => {
    if (req.headers['content-type'] == 'application/json') {
        //
        const tokenHeader = req.headers['authorization'];
        const token = tokenHeader.split(' ')[1];

        jwt.verify(token, 'mysercretkey', (jwtError, verficationResult) => {
            if (jwtError) {
                res.status(403).json({
                    message: 'Forbidden Request'
                });
            } else {
                const user = verficationResult.user;
                const post = {
                    _id: new mongoose.Types.ObjectId(),
                    title: req.body.title,
                    slug: createSlug(req.body.title),
                    content: req.body.content,
                    user: user._id
                };
                const newPost = new Posts(post);
                newPost
                    .save()
                    .then($saveResult => {
                        res.status(201).json({
                            message: 'Post Successfully Created',
                            slug: post.slug
                        });
                    })
                    .catch(errMongoSave => {
                        res.status(500).json({
                            message: errMongoSave
                        });
                    });
            }
        });
    } else {
        res.send(400).json({
            message: 'Could not understand the request'
        });
    }
});
router.delete('/:slug', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerify, jwtResult) => {
        if (errVerify) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            const user = jwtResult.user._id;
            Posts.findOne({ slug: req.params.slug })
                .exec()
                .then(result => {
                    if (user == result.user._id) {
                        Posts.remove({ slug: req.params.slug })
                            .exec()
                            .then(deletion => {
                                if (deletion) {
                                    res.status(200).json({
                                        message: 'Post Successfully Deleted'
                                    });
                                } else {
                                    res.status(500).json({
                                        message: "Can't Delete at the momment"
                                    });
                                }
                            })
                            .catch(errMongoDelete => {
                                res.status(500).json({
                                    message: errMongoDelete.message
                                });
                            });
                    } else {
                        res.status(403).json({
                            message: 'Forbidden'
                        });
                    }
                })
                .catch(errMongoDelete => {
                    res.status(500).json({
                        message: errMongoDelete.message
                    });
                });
        }
    });
});
router.patch('/:slug', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'mysercretkey', (errVerify, jwtResult) => {
        if (errVerify) {
            res.status(403).json({
                message: 'Forbidden'
            });
        } else {
            const user = jwtResult.user._id;
            Posts.findOne({ slug: req.params.slug })
                .exec()
                .then(result => {
                    if (user == result.user._id) {
                        const updatedPost = {
                            title: req.body.title,
                            slug: createSlug(req.body.title),
                            content: req.body.content
                        };
                        Posts.update({ slug: req.params.slug }, updatedPost)
                            .exec()
                            .then(updation => {
                                res.status(200).json({
                                    messaege: 'Post successfully Updated',
                                    slug: updatedPost.slug
                                });
                            })
                            .catch(errMongoUpdate => {
                                res.json(500).json({
                                    message: errMongoUpdate.message
                                });
                            });
                    } else {
                        res.status(403).json({
                            message: 'Forbidden'
                        });
                    }
                })
                .catch(errMongoUpdate => {
                    res.status(500).json({
                        message: errMongoUpdate
                    });
                });
        }
    });
});

router.use('/', (req, res) => {
    res.status(405).json({
        message: `${req.method} is not allowed`
    });
});

module.exports = router;