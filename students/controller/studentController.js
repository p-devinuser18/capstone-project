const express = require('express');
const router = express.Router();
const StudentService = require('../services/studentService');
const logger = require('../../src/utils/logger');

// GET /students - Get all students
router.get('/', (req, res) => {
    try {
        const students = StudentService.getAllStudents();
        const statusCode = 200;
        logger.info(`${req.method} ${req.originalUrl} ${statusCode}`);
        res.status(statusCode).json({ success: true, data: students });
    } catch (error) {
        const statusCode = 500;
        logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`);
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// GET /students/:id - Get a student by ID
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const statusCode = 400;
            logger.warn(`${req.method} ${req.originalUrl} ${statusCode} - Invalid student ID`);
            return res.status(statusCode).json({ success: false, message: 'Invalid student ID' });
        }

        const student = StudentService.getStudentById(id);
        if (!student) {
            const statusCode = 404;
            logger.info(`${req.method} ${req.originalUrl} ${statusCode} - Student with id ${id} not found`);
            return res.status(statusCode).json({ success: false, message: `Student with id ${id} not found` });
        }

        const statusCode = 200;
        logger.info(`${req.method} ${req.originalUrl} ${statusCode}`);
        res.status(statusCode).json({ success: true, data: student });
    } catch (error) {
        const statusCode = 500;
        logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`);
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// POST /students - Create a new student
router.post('/', (req, res) => {
    try {
        const newStudent = StudentService.createStudent(req.body);
        const statusCode = 201;
        logger.info(`${req.method} ${req.originalUrl} ${statusCode}`);
        res.status(statusCode).json({ success: true, data: newStudent });
    } catch (error) {
        const statusCode = 400;
        logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`);
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// PUT /students/:id - Update a student
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const statusCode = 400;
            logger.warn(`${req.method} ${req.originalUrl} ${statusCode} - Invalid student ID`);
            return res.status(statusCode).json({ success: false, message: 'Invalid student ID' });
        }

        const updatedStudent = StudentService.updateStudent(id, req.body);
        if (!updatedStudent) {
            const statusCode = 404;
            logger.info(`${req.method} ${req.originalUrl} ${statusCode} - Student with id ${id} not found`);
            return res.status(statusCode).json({ success: false, message: `Student with id ${id} not found` });
        }

        const statusCode = 200;
        logger.info(`${req.method} ${req.originalUrl} ${statusCode}`);
        res.status(statusCode).json({ success: true, data: updatedStudent });
    } catch (error) {
        const statusCode = 400;
        logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`);
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

// DELETE /students/:id - Delete a student
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const statusCode = 400;
            logger.warn(`${req.method} ${req.originalUrl} ${statusCode} - Invalid student ID`);
            return res.status(statusCode).json({ success: false, message: 'Invalid student ID' });
        }

        const deletedStudent = StudentService.deleteStudent(id);
        if (!deletedStudent) {
            const statusCode = 404;
            logger.info(`${req.method} ${req.originalUrl} ${statusCode} - Student with id ${id} not found`);
            return res.status(statusCode).json({ success: false, message: `Student with id ${id} not found` });
        }

        const statusCode = 200;
        logger.info(`${req.method} ${req.originalUrl} ${statusCode}`);
        res.status(statusCode).json({ success: true, message: `Student "${deletedStudent.name}" deleted successfully`, data: deletedStudent });
    } catch (error) {
        const statusCode = 500;
        logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`);
        res.status(statusCode).json({ success: false, message: error.message });
    }
});

module.exports = router;
