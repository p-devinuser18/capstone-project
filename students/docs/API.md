# API Documentation

Base URL: `http://localhost:3000`

---

## Table of Contents

- [Health Check](#health-check)
  - [GET /health](#get-health)
  - [GET /health/ready](#get-healthready)
- [Students](#students)
  - [GET /students](#get-students)
  - [GET /students/:id](#get-studentsid)
  - [POST /students](#post-students)
  - [PUT /students/:id](#put-studentsid)
  - [DELETE /students/:id](#delete-studentsid)

---

## Health Check

### GET /health

Returns the overall health status of the service.

- **Method:** `GET`
- **Path:** `/health`
- **Description:** Liveness check that indicates whether the server process is running.

#### Query Parameters

None.

#### Response

| Field    | Type   | Description                  |
| -------- | ------ | ---------------------------- |
| `status` | string | Health status of the service |

#### Example Response

```json
{
  "status": "ok"
}
```

#### Error Codes

| Status Code | Description            |
| ----------- | ---------------------- |
| `200`       | Service is healthy     |

---

### GET /health/ready

Returns the readiness status of the service, indicating whether it is ready to accept traffic.

- **Method:** `GET`
- **Path:** `/health/ready`
- **Description:** Readiness check that verifies the server and its data dependencies (e.g., `products.json`, `orders.json`) are accessible and operational.

#### Query Parameters

None.

#### Response

| Field    | Type   | Description                                          |
| -------- | ------ | ---------------------------------------------------- |
| `status` | string | `"ready"` or `"not ready"`                           |
| `checks` | object | Key-value map of dependency names to their status (`"ok"` or `"fail"`) |

#### Example Response (Ready)

```json
{
  "status": "ready",
  "checks": {
    "products": "ok",
    "orders": "ok"
  }
}
```

#### Example Response (Not Ready)

```json
{
  "status": "not ready",
  "checks": {
    "products": "ok",
    "orders": "fail"
  }
}
```

#### Error Codes

| Status Code | Description                        |
| ----------- | ---------------------------------- |
| `200`       | Service is ready to accept traffic |
| `503`       | Service is not ready               |

---

## Students

### GET /students

Returns all students.

- **Method:** `GET`
- **Path:** `/students`
- **Description:** Retrieves the full list of students currently stored in the system.

#### Query Parameters

None.

#### Response

| Field     | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `success` | boolean  | Whether the request was successful     |
| `data`    | array    | Array of student objects               |

Each student object:

| Field      | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| `id`       | number   | Unique identifier for the student  |
| `name`     | string   | Full name of the student           |
| `address`  | string   | Address of the student             |
| `college`  | string   | College the student attends        |
| `subjects` | string[] | List of subjects the student takes |
| `branch`   | string   | Engineering branch / major         |

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Aarav Sharma",
      "address": "12 MG Road, Mumbai, Maharashtra",
      "college": "Indian Institute of Technology Bombay",
      "subjects": ["Data Structures", "Algorithms", "Operating Systems"],
      "branch": "Computer Science"
    },
    {
      "id": 2,
      "name": "Priya Patel",
      "address": "45 Park Street, Kolkata, West Bengal",
      "college": "Jadavpur University",
      "subjects": ["Circuit Theory", "Signal Processing", "Electromagnetics"],
      "branch": "Electrical Engineering"
    }
  ]
}
```

#### Error Codes

| Status Code | Description                       |
| ----------- | --------------------------------- |
| `200`       | Successfully retrieved students   |
| `500`       | Internal server error             |

---

### GET /students/:id

Returns a single student by ID.

- **Method:** `GET`
- **Path:** `/students/:id`
- **Description:** Retrieves a specific student by their unique numeric ID.

#### Path Parameters

| Parameter | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `id`      | number | Unique identifier of the student  |

#### Query Parameters

None.

#### Response

| Field     | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| `success` | boolean | Whether the request was successful |
| `data`    | object  | The student object                 |

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "address": "12 MG Road, Mumbai, Maharashtra",
    "college": "Indian Institute of Technology Bombay",
    "subjects": ["Data Structures", "Algorithms", "Operating Systems"],
    "branch": "Computer Science"
  }
}
```

#### Error Response (Not Found)

```json
{
  "success": false,
  "message": "Student with id 99 not found"
}
```

#### Error Response (Invalid ID)

```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

#### Error Codes

| Status Code | Description                      |
| ----------- | -------------------------------- |
| `200`       | Successfully retrieved student   |
| `400`       | Invalid student ID (non-numeric) |
| `404`       | Student not found                |
| `500`       | Internal server error            |

---

### POST /students

Creates a new student.

- **Method:** `POST`
- **Path:** `/students`
- **Description:** Creates a new student record. All fields are required.

#### Query Parameters

None.

#### Request Body

| Field      | Type     | Required | Description                        |
| ---------- | -------- | -------- | ---------------------------------- |
| `name`     | string   | Yes      | Full name of the student           |
| `address`  | string   | Yes      | Address of the student             |
| `college`  | string   | Yes      | College the student attends        |
| `subjects` | string[] | Yes      | List of subjects (must be an array)|
| `branch`   | string   | Yes      | Engineering branch / major         |

#### Example Request Body

```json
{
  "name": "Meera Nair",
  "address": "10 Marine Drive, Kochi, Kerala",
  "college": "NIT Calicut",
  "subjects": ["Artificial Intelligence", "Machine Learning"],
  "branch": "Computer Science"
}
```

#### Response

| Field     | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| `success` | boolean | Whether the request was successful |
| `data`    | object  | The newly created student object   |

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Meera Nair",
    "address": "10 Marine Drive, Kochi, Kerala",
    "college": "NIT Calicut",
    "subjects": ["Artificial Intelligence", "Machine Learning"],
    "branch": "Computer Science"
  }
}
```

#### Error Response (Missing Fields)

```json
{
  "success": false,
  "message": "Missing required fields: name, address, college, subjects, and branch are required"
}
```

#### Error Response (Invalid Subjects)

```json
{
  "success": false,
  "message": "Subjects must be an array"
}
```

#### Error Codes

| Status Code | Description                                    |
| ----------- | ---------------------------------------------- |
| `201`       | Student created successfully                   |
| `400`       | Validation error (missing fields or bad input) |

---

### PUT /students/:id

Updates an existing student.

- **Method:** `PUT`
- **Path:** `/students/:id`
- **Description:** Updates one or more fields of an existing student. Only the provided fields are updated; omitted fields remain unchanged.

#### Path Parameters

| Parameter | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `id`      | number | Unique identifier of the student  |

#### Query Parameters

None.

#### Request Body

All fields are optional. Only allowed fields (`name`, `address`, `college`, `subjects`, `branch`) are accepted; other fields are ignored.

| Field      | Type     | Required | Description                        |
| ---------- | -------- | -------- | ---------------------------------- |
| `name`     | string   | No       | Full name of the student           |
| `address`  | string   | No       | Address of the student             |
| `college`  | string   | No       | College the student attends        |
| `subjects` | string[] | No       | List of subjects (must be an array)|
| `branch`   | string   | No       | Engineering branch / major         |

#### Example Request Body

```json
{
  "address": "99 New Address, Delhi",
  "subjects": ["Data Structures", "Algorithms", "Machine Learning"]
}
```

#### Response

| Field     | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| `success` | boolean | Whether the request was successful |
| `data`    | object  | The updated student object         |

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "address": "99 New Address, Delhi",
    "college": "Indian Institute of Technology Bombay",
    "subjects": ["Data Structures", "Algorithms", "Machine Learning"],
    "branch": "Computer Science"
  }
}
```

#### Error Response (Not Found)

```json
{
  "success": false,
  "message": "Student with id 99 not found"
}
```

#### Error Response (No Valid Fields)

```json
{
  "success": false,
  "message": "No valid fields provided for update"
}
```

#### Error Codes

| Status Code | Description                                    |
| ----------- | ---------------------------------------------- |
| `200`       | Student updated successfully                   |
| `400`       | Validation error (invalid ID, bad input, or no valid fields) |
| `404`       | Student not found                              |
| `500`       | Internal server error                          |

---

### DELETE /students/:id

Deletes a student by ID.

- **Method:** `DELETE`
- **Path:** `/students/:id`
- **Description:** Permanently removes a student record from the system.

#### Path Parameters

| Parameter | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `id`      | number | Unique identifier of the student  |

#### Query Parameters

None.

#### Response

| Field     | Type    | Description                                  |
| --------- | ------- | -------------------------------------------- |
| `success` | boolean | Whether the request was successful           |
| `message` | string  | Confirmation message with the student's name |
| `data`    | object  | The deleted student object                   |

#### Example Response

```json
{
  "success": true,
  "message": "Student \"Aarav Sharma\" deleted successfully",
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "address": "12 MG Road, Mumbai, Maharashtra",
    "college": "Indian Institute of Technology Bombay",
    "subjects": ["Data Structures", "Algorithms", "Operating Systems"],
    "branch": "Computer Science"
  }
}
```

#### Error Response (Not Found)

```json
{
  "success": false,
  "message": "Student with id 99 not found"
}
```

#### Error Response (Invalid ID)

```json
{
  "success": false,
  "message": "Invalid student ID"
}
```

#### Error Codes

| Status Code | Description                      |
| ----------- | -------------------------------- |
| `200`       | Student deleted successfully     |
| `400`       | Invalid student ID (non-numeric) |
| `404`       | Student not found                |
| `500`       | Internal server error            |
