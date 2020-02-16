const express = require('express');
const post = require('./routes/posts');
const user = require('./routes/user');
const port = 80;
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true });
app.use(bodyParser.json());

app.use(cors());
app.use('/user', user);
app.use('/posts', post);
app.get('/', (req, res) => {
    res.status(200);
    res.json({
        message: 'This is homepage'
    });
});
app.use('/', (req, res) => {
    res.json({
        message: `${req.method} is not allowed on this page`
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});