const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('./../models/user');
const bcrypt = require('bcrypt');
const default_pic = 'defult.png';
const jwt = require('jsonwebtoken');
const posts = require('./posts');
const comments = require('./comments');

router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username })
        .exec()
        .then(data => {
            if (data) {
                bcrypt.compare(
                    req.body.password,
                    data.password,
                    (errorHash, result2) => {
                        if (errorHash) {
                            res.status(500).json({
                                message: errorHash.message
                            });
                        } else {
                            if (result2) {
                                jwt.sign({ user: { _id: data._id, username: data.username } },
                                    'mysercretkey',
                                    (errorJWT, token) => {
                                        if (errorJWT) {
                                            res.status(500).json({
                                                message: err.message
                                            });
                                        } else {
                                            res.status(200).json({ token });
                                        }
                                    }
                                );
                            } else {
                                res.status(404).json({
                                    message: 'User not found',
                                    user: {
                                        username: req.body.username,
                                        password: req.body.password
                                    }
                                });
                            }
                        }
                    }
                );
            } else {
                res.status(404).json({
                    message: 'User not found',
                    user: {
                        username: req.body.username,
                        password: req.body.password
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});

router.get('/:username', (req, res) => {
    User.findOne({ username: req.params.username })
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'User Found',
                    user: {
                        _id: result._id,
                        username: result.username,
                        name: result.name,
                        email: result.email,
                        profile_picture: result.profile_picture
                    }
                });
            } else {
                res.status(404).json({
                    message: 'User not Found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});
router.get('/name/:id', (req, res) => {
    User.findOne({ _id: req.params.id })
        .exec()
        .then(user => {
            res.status(200).json({
                message: 'User Found',
                username: user.username
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
});
router.post('/', (req, res) => {
    if (req.headers['content-type'] == 'application/json') {
        bcrypt
            .hash(req.body.password, 10)
            .then(hash => {
                const user = {
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    profile_picture: default_pic,
                    validation: false
                };
                const newUser = new User(user);
                newUser
                    .save()
                    .then(result => {
                        res.status(201).json({
                            message: 'Successfully created Uesr'
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: err.message
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    message: err.message
                });
            });
    } else {
        res.status(400).json({
            message: 'Bad Request'
        });
    }
});
router.patch('/:username', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    console.log(token);
    jwt.verify(token, 'mysercretkey', (err, decoded) => {
        if (err) {
            res.status(403).json({
                message: 'Forbidden Request'
            });
        } else {
            console.log(decoded);
            if (decoded.user.username != req.params.username) {
                res.status(403).json({
                    message: 'Forbidden Request'
                });
            } else {
                if (req.headers['content-type'] == 'application/json') {
                    const user = {
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        profile_picture: default_pic
                    };
                    User.updateOne({ username: req.params.username }, user)
                        .then(data => {
                            res.status(201).json({
                                message: 'User successfully Updated'
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: err.message
                            });
                        });
                } else {
                    res.status(400).json({
                        message: 'Bad Request'
                    });
                }
            }
        }
    });
});
router.delete('/:username', (req, res) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader.split(' ')[1];
    console.log(token);
    jwt.verify(token, 'mysercretkey', (err, decoded) => {
        if (err) {
            res.status(403).json({
                message: 'Forbidden Request'
            });
        } else {
            if (decoded.user.username != req.params.username) {
                res.status(403).json({
                    message: 'Forbidden Request'
                });
            } else {
                User.remove({ username: req.params.username })
                    .exec()
                    .then(deleteingResult => {
                        res.status(200).json({
                            user: 'User successfully Deleted'
                        });
                    })
                    .catch(deletingErr => {
                        res.status(500).json({
                            message: deletingErr.message
                        });
                    });
            }
        }
    });
});
router.use('/', (req, res) => {
    res.status(405).json({
        message: `${req.method} is not allowed on this page`
    });
});
module.exports = router;