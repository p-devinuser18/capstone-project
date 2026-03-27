const StudentModel = require('../studentModel');
const logger = require('../../src/utils/logger');

const StudentService = {
    getAllStudents: () => {
        logger.info('[StudentService] Fetching all students');
        const students = StudentModel.getAll();
        logger.info(`[StudentService] Found ${students.length} student(s)`);
        return students;
    },

    getStudentById: (id) => {
        logger.info(`[StudentService] Fetching student with id: ${id}`);
        const student = StudentModel.getById(id);
        if (!student) {
            logger.info(`[StudentService] Student with id ${id} not found`);
            return null;
        }
        logger.info(`[StudentService] Found student: ${student.name}`);
        return student;
    },

    createStudent: (studentData) => {
        logger.info('[StudentService] Creating new student');
        const { name, address, college, subjects, branch } = studentData;

        if (!name || !address || !college || !subjects || !branch) {
            logger.warn('[StudentService] Validation failed: missing required fields');
            throw new Error('Missing required fields: name, address, college, subjects, and branch are required');
        }

        if (!Array.isArray(subjects)) {
            logger.warn('[StudentService] Validation failed: subjects must be an array');
            throw new Error('Subjects must be an array');
        }

        const newStudent = StudentModel.create({ name, address, college, subjects, branch });
        logger.info(`[StudentService] Student created successfully with id: ${newStudent.id}`);
        return newStudent;
    },

    updateStudent: (id, updateData) => {
        logger.info(`[StudentService] Updating student with id: ${id}`);
        const existingStudent = StudentModel.getById(id);

        if (!existingStudent) {
            logger.info(`[StudentService] Student with id ${id} not found for update`);
            return null;
        }

        const allowedFields = ['name', 'address', 'college', 'subjects', 'branch'];
        const filteredUpdates = {};

        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredUpdates[key] = updateData[key];
            }
        }

        if (filteredUpdates.subjects !== undefined && !Array.isArray(filteredUpdates.subjects)) {
            logger.warn('[StudentService] Validation failed: subjects must be an array');
            throw new Error('Subjects must be an array');
        }

        if (Object.keys(filteredUpdates).length === 0) {
            logger.warn('[StudentService] No valid fields provided for update');
            throw new Error('No valid fields provided for update');
        }

        const updatedStudent = StudentModel.update(id, filteredUpdates);
        logger.info(`[StudentService] Student with id ${id} updated successfully`);
        return updatedStudent;
    },

    deleteStudent: (id) => {
        logger.info(`[StudentService] Deleting student with id: ${id}`);
        const existingStudent = StudentModel.getById(id);

        if (!existingStudent) {
            logger.info(`[StudentService] Student with id ${id} not found for deletion`);
            return null;
        }

        const deletedStudent = StudentModel.delete(id);
        logger.info(`[StudentService] Student "${deletedStudent.name}" (id: ${id}) deleted successfully`);
        return deletedStudent;
    }
};

module.exports = StudentService;
