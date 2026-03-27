const students = require('./studentData');

let db = [...students];

const StudentModel = {
    getAll: () => {
        return [...db];
    },

    getById: (id) => {
        return db.find((student) => student.id === id) || null;
    },

    create: (student) => {
        const newId = db.length > 0 ? Math.max(...db.map((s) => s.id)) + 1 : 1;
        const newStudent = { id: newId, ...student };
        db.push(newStudent);
        return newStudent;
    },

    update: (id, updates) => {
        const index = db.findIndex((student) => student.id === id);
        if (index === -1) {
            return null;
        }
        db[index] = { ...db[index], ...updates, id };
        return db[index];
    },

    delete: (id) => {
        const index = db.findIndex((student) => student.id === id);
        if (index === -1) {
            return null;
        }
        const deleted = db.splice(index, 1);
        return deleted[0];
    },

    reset: () => {
        db = [...students];
    }
};

module.exports = StudentModel;
