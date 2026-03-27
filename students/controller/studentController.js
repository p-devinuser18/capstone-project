const express = require('express');
const router = express.Router();
const StudentService = require('../services/studentService');

// GET /students - Get all students
router.get('/', (req, res) => {
    try {
        const students = StudentService.getAllStudents();
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /students/:id - Get a student by ID
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const student = StudentService.getStudentById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /students - Create a new student
router.post('/', (req, res) => {
    try {
        const newStudent = StudentService.createStudent(req.body);
        res.status(201).json({ success: true, data: newStudent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT /students/:id - Update a student
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const updatedStudent = StudentService.updateStudent(id, req.body);
        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
        }

        res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE /students/:id - Delete a student
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const deletedStudent = StudentService.deleteStudent(id);
        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
        }

        res.status(200).json({ success: true, message: `Student "${deletedStudent.name}" deleted successfully`, data: deletedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
