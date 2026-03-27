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

#### Response Format

```json
{
  "results": {
    "total": <number>,
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
| `results.productsList`         | array  | Array of matching product objects    |
| `results.productsList[].product.id`       | number | Unique product identifier  |
| `results.productsList[].product.name`     | string | Product name               |
| `results.productsList[].product.category` | string | Product category           |
| `results.productsList[].product.price`    | number | Product price              |

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
    "productsList": []
  }
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
- The API always returns HTTP 200 with the standard response format, even when no products match.
- Only the `GET` method is supported on `/api/search`. Other HTTP methods (POST, PUT, DELETE) will return a 404 error.

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
