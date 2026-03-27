const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /health - Liveness check
router.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

// GET /health/ready - Readiness check
router.get('/ready', (req, res) => {
    const checks = {};

    // Check products.json
    try {
        fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf8');
        checks.products = 'ok';
    } catch (err) {
        checks.products = 'fail';
    }

    // Check orders.json (skip gracefully if it doesn't exist)
    try {
        fs.readFileSync(path.join(__dirname, '..', 'data', 'orders.json'), 'utf8');
        checks.orders = 'ok';
    } catch (err) {
        if (err.code === 'ENOENT') {
            checks.orders = 'ok';
        } else {
            checks.orders = 'fail';
        }
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    if (allOk) {
        res.status(200).json({ status: 'ready', checks });
    } else {
        res.status(503).json({ status: 'not ready', checks });
    }
});

module.exports = router;
