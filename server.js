const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const studentController = require('./students/controller/studentController');

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Express server' });
});

app.use('/students', studentController);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
