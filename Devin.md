# Devin — Technical Specifications

## Overview

This project is a Node.js/Express REST API serving as a product catalog search service. It provides endpoints for querying products with support for filtering by name, category, and price range.

## Architecture

- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Data Store:** In-memory (no database)
- **Testing:** Jest + Supertest
- **CI:** GitHub Actions

## Security

- **Helmet** — sets security-related HTTP headers
- **CORS** — configures Cross-Origin Resource Sharing
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Compression** — gzip/brotli response compression
- **Input Validation** — query parameters are validated before processing

## API Endpoints

| Method | Path          | Description                     |
| ------ | ------------- | ------------------------------- |
| GET    | `/`           | Welcome message                 |
| GET    | `/api/search` | Search and filter products      |

For detailed API documentation, see [docs/API.md](docs/API.md).
