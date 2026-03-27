# Capstone Project — Product Catalog API

A RESTful API built with Node.js and Express for searching and filtering a product catalog.

## Features

- Product search with partial, case-insensitive name matching
- Category filtering with exact, case-insensitive matching
- Price range filtering (min/max)
- Pagination support
- Security hardened with Helmet, CORS, rate limiting, and compression
- Comprehensive test suite (64+ tests with Jest and Supertest)
- CI/CD pipeline with GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/p-devinuser18/capstone-project.git
cd capstone-project
npm install
```

### Configuration

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

| Variable   | Default       | Description                    |
| ---------- | ------------- | ------------------------------ |
| `PORT`     | `3000`        | Port the server listens on     |
| `NODE_ENV` | `development` | Environment (development/production) |

### Running the Server

```bash
npm start
```

The server will start at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

### Running Linter

```bash
npm run lint
```

## Project Structure

```
capstone-project/
├── .github/workflows/
│   └── ci.yml                # GitHub Actions CI workflow
├── data/
│   └── products.js           # In-memory product data
├── docs/
│   └── API.md                # API documentation
├── models/
│   └── Product.js            # Product class
├── routes/
│   └── productRoutes.js      # Product search endpoint
├── tests/
│   └── productSearch.test.js # Test suite
├── .env.example              # Environment variable template
├── .gitignore
├── eslint.config.mjs         # ESLint configuration
├── package.json
├── README.md
└── server.js                 # Application entry point
```

## API Reference

See [docs/API.md](docs/API.md) for full API documentation.

### Quick Example

```bash
# Get all products
curl http://localhost:3000/api/search

# Search by name
curl "http://localhost:3000/api/search?q=wireless"

# Filter by category and price range
curl "http://localhost:3000/api/search?category=electronics&minPrice=10&maxPrice=50"

# With pagination
curl "http://localhost:3000/api/search?page=1&limit=2"
```

## License

ISC
