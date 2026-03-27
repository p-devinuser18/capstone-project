const request = require('supertest');
const app = require('../../app');
const StudentModel = require('../studentModel');

beforeEach(() => {
    StudentModel.reset();
});

describe('Students API', () => {
    describe('GET /students', () => {
        it('should return 200 with all students', async () => {
            const res = await request(app).get('/students');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(5);
        });

        it('should return students with correct shape', async () => {
            const res = await request(app).get('/students');
            expect(res.status).toBe(200);
            res.body.data.forEach((student) => {
                expect(student).toHaveProperty('id');
                expect(student).toHaveProperty('name');
                expect(student).toHaveProperty('address');
                expect(student).toHaveProperty('college');
                expect(student).toHaveProperty('subjects');
                expect(student).toHaveProperty('branch');
                expect(Array.isArray(student.subjects)).toBe(true);
            });
        });

        it('should return Content-Type application/json', async () => {
            const res = await request(app).get('/students');
            expect(res.headers['content-type']).toMatch(/application\/json/);
        });
    });

    describe('GET /students/:id', () => {
        it('should return 200 with specific student for valid ID', async () => {
            const res = await request(app).get('/students/1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('id', 1);
            expect(res.body.data).toHaveProperty('name', 'Aarav Sharma');
            expect(res.body.data).toHaveProperty('college', 'Indian Institute of Technology Bombay');
            expect(res.body.data).toHaveProperty('branch', 'Computer Science');
        });

        it('should return 404 for non-existent student ID', async () => {
            const res = await request(app).get('/students/999');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Student with id 999 not found');
        });

        it('should return 400 for invalid (non-numeric) ID', async () => {
            const res = await request(app).get('/students/abc');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Invalid student ID');
        });
    });

    describe('POST /students', () => {
        it('should create a new student and return 201', async () => {
            const newStudent = {
                name: 'Test Student',
                address: '100 Test Road, Test City',
                college: 'Test University',
                subjects: ['Math', 'Science'],
                branch: 'Test Engineering'
            };
            const res = await request(app).post('/students').send(newStudent);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('id');
            expect(typeof res.body.data.id).toBe('number');
            expect(res.body.data).toHaveProperty('name', 'Test Student');
            expect(res.body.data).toHaveProperty('address', '100 Test Road, Test City');
            expect(res.body.data).toHaveProperty('college', 'Test University');
            expect(res.body.data).toHaveProperty('subjects', ['Math', 'Science']);
            expect(res.body.data).toHaveProperty('branch', 'Test Engineering');
        });

        it('should auto-generate an ID for the new student', async () => {
            const newStudent = {
                name: 'Auto ID Student',
                address: '200 Auto Road',
                college: 'Auto University',
                subjects: ['Physics'],
                branch: 'Auto Engineering'
            };
            const res = await request(app).post('/students').send(newStudent);
            expect(res.status).toBe(201);
            expect(res.body.data.id).toBe(6);
        });

        it('should return 400 when missing required fields', async () => {
            const incomplete = {
                name: 'Incomplete Student'
            };
            const res = await request(app).post('/students').send(incomplete);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.message).toMatch(/Missing required fields/);
        });

        it('should return 400 when subjects is not an array', async () => {
            const badSubjects = {
                name: 'Bad Student',
                address: '300 Bad Road',
                college: 'Bad University',
                subjects: 'Not an array',
                branch: 'Bad Engineering'
            };
            const res = await request(app).post('/students').send(badSubjects);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.message).toMatch(/Subjects must be an array/);
        });
    });

    describe('PUT /students/:id', () => {
        it('should update an existing student and return 200', async () => {
            const updates = {
                name: 'Updated Aarav',
                college: 'Updated College'
            };
            const res = await request(app).put('/students/1').send(updates);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('id', 1);
            expect(res.body.data).toHaveProperty('name', 'Updated Aarav');
            expect(res.body.data).toHaveProperty('college', 'Updated College');
            expect(res.body.data).toHaveProperty('branch', 'Computer Science');
        });

        it('should return 404 for non-existent student ID', async () => {
            const res = await request(app).put('/students/999').send({ name: 'Ghost' });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Student with id 999 not found');
        });

        it('should return 400 for invalid (non-numeric) ID', async () => {
            const res = await request(app).put('/students/abc').send({ name: 'Invalid' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Invalid student ID');
        });

        it('should return 400 when subjects is not an array', async () => {
            const res = await request(app).put('/students/1').send({ subjects: 'Not an array' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.message).toMatch(/Subjects must be an array/);
        });

        it('should return 400 when no valid fields are provided', async () => {
            const res = await request(app).put('/students/1').send({ invalidField: 'test' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.message).toMatch(/No valid fields provided/);
        });

        it('should filter out disallowed fields and only update allowed ones', async () => {
            const res = await request(app).put('/students/1').send({
                name: 'Filtered Name',
                hackerField: 'should be ignored'
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('name', 'Filtered Name');
            expect(res.body.data).not.toHaveProperty('hackerField');
        });
    });

    describe('DELETE /students/:id', () => {
        it('should delete an existing student and return 200', async () => {
            const res = await request(app).delete('/students/5');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message', 'Student "Arjun Singh" deleted successfully');
            expect(res.body.data).toHaveProperty('id', 5);
            expect(res.body.data).toHaveProperty('name', 'Arjun Singh');
        });

        it('should return 404 for non-existent student ID', async () => {
            const res = await request(app).delete('/students/999');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Student with id 999 not found');
        });

        it('should return 400 for invalid (non-numeric) ID', async () => {
            const res = await request(app).delete('/students/abc');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Invalid student ID');
        });

        it('should make deleted student no longer retrievable via GET', async () => {
            await request(app).delete('/students/3');
            const res = await request(app).get('/students/3');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('success', false);
        });
    });
});
