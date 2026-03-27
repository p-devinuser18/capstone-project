# Product Catalog API Documentation

## Base URL

```
http://localhost:3000
```

## Endpoints

### Root

```
GET /
```

Returns a welcome message.

**Response:**

```json
{
  "message": "Welcome to the Express server"
}
```

---

### Search Products

```
GET /api/search
```

Search and filter products from the catalog. All query parameters are optional. When no parameters are provided, all products are returned. Multiple parameters are combined using AND logic.

#### Query Parameters

| Parameter   | Type   | Required | Description                                                     |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| `q`         | string | No       | Case-insensitive partial match against product name             |
| `category`  | string | No       | Case-insensitive exact match against product category           |
| `minPrice`  | number | No       | Minimum price filter (inclusive). Returns products with price >= value |
| `maxPrice`  | number | No       | Maximum price filter (inclusive). Returns products with price <= value |
| `page`      | integer | No      | Page number for pagination (default: 1). Must be a positive integer |
| `limit`     | integer | No      | Number of results per page (default: 20, max: 100). Must be a positive integer |

#### Response Format

```json
{
  "results": {
    "total": <number>,
    "page": <number>,
    "limit": <number>,
    "totalPages": <number>,
    "productsList": [
      {
        "product": {
          "id": <number>,
          "name": <string>,
          "category": <string>,
          "price": <number>
        }
      }
    ]
  }
}
```

#### Response Fields

| Field                          | Type   | Description                          |
| ------------------------------ | ------ | ------------------------------------ |
| `results.total`                | number | Total number of matching products    |
| `results.page`                 | number | Current page number                  |
| `results.limit`                | number | Number of results per page           |
| `results.totalPages`           | number | Total number of pages                |
| `results.productsList`         | array  | Array of matching product objects    |
| `results.productsList[].product.id`       | number | Unique product identifier  |
| `results.productsList[].product.name`     | string | Product name               |
| `results.productsList[].product.category` | string | Product category           |
| `results.productsList[].product.price`    | number | Product price              |

#### Error Responses

The API returns a `400 Bad Request` with a JSON error message when invalid parameters are provided:

```json
{
  "error": "minPrice must be a valid number"
}
```

Possible validation errors:

| Condition | Error Message |
| --------- | ------------- |
| `minPrice` is not a valid number | `minPrice must be a valid number` |
| `maxPrice` is not a valid number | `maxPrice must be a valid number` |
| `page` is not a positive integer | `page must be a positive integer` |
| `limit` is not a positive integer | `limit must be a positive integer` |

The API returns `429 Too Many Requests` when the rate limit is exceeded:

```json
{
  "error": "Too many requests, please try again later."
}
```

---

## Example Requests and Responses

### 1. Get All Products

**Request:**

```
GET /api/search
```

**Response:**

```json
{
  "results": {
    "total": 6,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } },
      { "product": { "id": 2, "name": "Bluetooth Headphones", "category": "Electronics", "price": 79.99 } },
      { "product": { "id": 3, "name": "Running Shoes", "category": "Clothing", "price": 119.99 } },
      { "product": { "id": 4, "name": "Denim Jacket", "category": "Clothing", "price": 89.99 } },
      { "product": { "id": 5, "name": "JavaScript: The Good Parts", "category": "Books", "price": 25.49 } },
      { "product": { "id": 6, "name": "Stainless Steel Water Bottle", "category": "Kitchen", "price": 18.99 } }
    ]
  }
}
```

### 2. Search by Product Name

**Request:**

```
GET /api/search?q=wireless
```

**Response:**

```json
{
  "results": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } }
    ]
  }
}
```

### 3. Filter by Category

**Request:**

```
GET /api/search?category=electronics
```

**Response:**

```json
{
  "results": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } },
      { "product": { "id": 2, "name": "Bluetooth Headphones", "category": "Electronics", "price": 79.99 } }
    ]
  }
}
```

### 4. Filter by Price Range

**Request:**

```
GET /api/search?minPrice=20&maxPrice=30
```

**Response:**

```json
{
  "results": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } },
      { "product": { "id": 5, "name": "JavaScript: The Good Parts", "category": "Books", "price": 25.49 } }
    ]
  }
}
```

### 5. Combined Filters

**Request:**

```
GET /api/search?q=mouse&category=electronics&minPrice=10&maxPrice=50
```

**Response:**

```json
{
  "results": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } }
    ]
  }
}
```

### 6. No Matching Results

**Request:**

```
GET /api/search?q=nonexistent
```

**Response:**

```json
{
  "results": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0,
    "productsList": []
  }
}
```

### 7. Pagination

**Request:**

```
GET /api/search?page=1&limit=2
```

**Response:**

```json
{
  "results": {
    "total": 6,
    "page": 1,
    "limit": 2,
    "totalPages": 3,
    "productsList": [
      { "product": { "id": 1, "name": "Wireless Mouse", "category": "Electronics", "price": 29.99 } },
      { "product": { "id": 2, "name": "Bluetooth Headphones", "category": "Electronics", "price": 79.99 } }
    ]
  }
}
```

### 8. Invalid Parameter

**Request:**

```
GET /api/search?minPrice=abc
```

**Response (400 Bad Request):**

```json
{
  "error": "minPrice must be a valid number"
}
```

---

## Available Product Categories

| Category    | Product Count |
| ----------- | ------------- |
| Electronics | 2             |
| Clothing    | 2             |
| Books       | 1             |
| Kitchen     | 1             |

---

## Notes

- All data is served from an in-memory store. No database connection is required.
- The `q` parameter performs a **partial, case-insensitive** match on the product name (e.g., `q=mouse` matches "Wireless Mouse").
- The `category` parameter performs an **exact, case-insensitive** match on the product category (e.g., `category=Elect` will **not** match "Electronics").
- When multiple filters are provided, they are combined with **AND** logic (all conditions must be satisfied).
- The API returns HTTP 200 with the standard response format when no products match (with an empty `productsList`).
- The API returns HTTP 400 with an error message for invalid numeric parameters (`minPrice`, `maxPrice`, `page`, `limit`).
- The API returns HTTP 429 when the rate limit is exceeded (100 requests per 15 minutes per IP).
- Only the `GET` method is supported on `/api/search`. Other HTTP methods (POST, PUT, DELETE) will return a 404 error.
- Pagination defaults to `page=1` and `limit=20`. The maximum value for `limit` is 100.

---

## Running the Server

```bash
# Install dependencies
npm install

# Start the server
npm start

# Run tests
npm test
```

The server starts on port 3000 by default. Set the `PORT` environment variable to use a different port:

```bash
PORT=8080 npm start
```

### Running Linter

```bash
npm run lint
```

---

## Security

- **Helmet** — sets security-related HTTP response headers
- **CORS** — Cross-Origin Resource Sharing is enabled by default
- **Rate Limiting** — 100 requests per 15 minutes per IP address
- **Compression** — responses are gzip/brotli compressed
- **Input Validation** — numeric query parameters are validated before processing
