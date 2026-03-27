# Capstone Project

A Node.js web service built with Express, providing student management and health check APIs.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server starts on `http://localhost:3000` by default. Set the `PORT` environment variable to use a different port.

## API Documentation

Full API documentation for all endpoints is available at [students/docs/API.md](students/docs/API.md).

### Available Endpoints

| Method | Path              | Description                          |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/health`         | Liveness health check                |
| GET    | `/health/ready`   | Readiness check with dependency info |
| GET    | `/students`       | List all students                    |
| GET    | `/students/:id`   | Get a student by ID                  |
| POST   | `/students`       | Create a new student                 |
| PUT    | `/students/:id`   | Update an existing student           |
| DELETE | `/students/:id`   | Delete a student                     |
