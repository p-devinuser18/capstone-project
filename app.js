const express = require('express');
const app = express();

const studentController = require('./students/controller/studentController');

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Express server' });
});

app.use('/students', studentController);

module.exports = app;
