const StudentModel = require('../studentModel');

const StudentService = {
    getAllStudents: () => {
        console.log('[StudentService] Fetching all students');
        const students = StudentModel.getAll();
        console.log(`[StudentService] Found ${students.length} student(s)`);
        return students;
    },

    getStudentById: (id) => {
        console.log(`[StudentService] Fetching student with id: ${id}`);
        const student = StudentModel.getById(id);
        if (!student) {
            console.log(`[StudentService] Student with id ${id} not found`);
            return null;
        }
        console.log(`[StudentService] Found student: ${student.name}`);
        return student;
    },

    createStudent: (studentData) => {
        console.log('[StudentService] Creating new student');
        const { name, address, college, subjects, branch } = studentData;

        if (!name || !address || !college || !subjects || !branch) {
            console.log('[StudentService] Validation failed: missing required fields');
            throw new Error('Missing required fields: name, address, college, subjects, and branch are required');
        }

        if (!Array.isArray(subjects)) {
            console.log('[StudentService] Validation failed: subjects must be an array');
            throw new Error('Subjects must be an array');
        }

        const newStudent = StudentModel.create({ name, address, college, subjects, branch });
        console.log(`[StudentService] Student created successfully with id: ${newStudent.id}`);
        return newStudent;
    },

    updateStudent: (id, updateData) => {
        console.log(`[StudentService] Updating student with id: ${id}`);
        const existingStudent = StudentModel.getById(id);

        if (!existingStudent) {
            console.log(`[StudentService] Student with id ${id} not found for update`);
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
            console.log('[StudentService] Validation failed: subjects must be an array');
            throw new Error('Subjects must be an array');
        }

        if (Object.keys(filteredUpdates).length === 0) {
            console.log('[StudentService] No valid fields provided for update');
            throw new Error('No valid fields provided for update');
        }

        const updatedStudent = StudentModel.update(id, filteredUpdates);
        console.log(`[StudentService] Student with id ${id} updated successfully`);
        return updatedStudent;
    },

    deleteStudent: (id) => {
        console.log(`[StudentService] Deleting student with id: ${id}`);
        const existingStudent = StudentModel.getById(id);

        if (!existingStudent) {
            console.log(`[StudentService] Student with id ${id} not found for deletion`);
            return null;
        }

        const deletedStudent = StudentModel.delete(id);
        console.log(`[StudentService] Student "${deletedStudent.name}" (id: ${id}) deleted successfully`);
        return deletedStudent;
    }
};

module.exports = StudentService;
