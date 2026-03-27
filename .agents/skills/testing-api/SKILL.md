# Testing the Capstone Project Express API

## Overview
This is a Node.js Express API for student CRUD operations. The app uses Winston for structured logging.

## Prerequisites
- Node.js 20+
- npm

## Setup
```bash
npm install
```

## Running Tests
```bash
npm test
```
Expect 20 tests across GET/POST/PUT/DELETE /students endpoints. Tests use Jest + Supertest against `app.js` (not `server.js`).

## Running the Server Locally
```bash
# Dev mode (colorized logs)
node server.js

# Production mode (JSON logs)
NODE_ENV=production node server.js
```
Default port is 3000 (configurable via PORT env var).

**Note:** The server process may exit quickly after startup in some environments. For testing, you can use an inline script to keep it alive:
```bash
node -e "
const app = require('./app');
const PORT = 3001;
const server = app.listen(PORT, () => console.log('Running on ' + PORT));
" &
```

## Key Endpoints
- `GET /` - Welcome message
- `GET /students` - List all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create student (requires: name, address, college, subjects[], branch)
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

## Verifying Logging
- **Dev mode:** Logs should show colorized output with timestamps: `YYYY-MM-DDTHH:MM:SS.sssZ [level]: message`
- **Prod mode:** Logs should be JSON: `{"level":"info","message":"...","timestamp":"..."}`
- Route handlers log: `{METHOD} {path} {statusCode}`
- Validation failures use `warn` level; caught errors in routes use `error` level
- Grep check: `rg 'console\.(log|error)' --glob='*.js' --glob='!node_modules/**' --glob='!**/test/**'` should return no matches

## CI
CI workflow (`.github/workflows/ci.yml`) only triggers on PRs targeting `main`. PRs targeting other branches won't run CI automatically.

## Architecture
- `server.js` - Entry point, starts Express server
- `app.js` - Express app setup (used by tests)
- `src/utils/logger.js` - Winston logger config
- `students/controller/studentController.js` - Route handlers
- `students/services/studentService.js` - Business logic
- `students/studentModel.js` - In-memory data model
- `students/studentData.js` - Seed data
- `students/test/students.test.js` - Test suite (do NOT modify)
