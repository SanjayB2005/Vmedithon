const express = require('express');
const router = express.Router();

// Health check for API routes
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Health Check</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; color: #222; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 32px; }
        h1 { color: #2e7d32; margin-bottom: 16px; }
        ul { list-style: none; padding: 0; }
        li { margin: 8px 0; }
        .status { font-weight: bold; color: #388e3c; }
        .timestamp { color: #888; font-size: 0.95em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Health Check</h1>
        <div class="status">Status: OK</div>
        <div class="timestamp">${new Date().toLocaleString()}</div>
        <h2>Available Routes</h2>
        <ul>
          <li><a href="/api/patients?info">/api/patients</a> (Patient CRUD)</li>
          <li><a href="/api/blockchain">/api/blockchain</a> (Blockchain API)</li>
          <li><a href="/api/users">/api/users</a> (User CRUD)</li>
          <li><a href="/api/medical-documents">/api/medical-documents</a> (Medical Documents)</li>
          <li><a href="/api/health">/api/health</a> (Health Check)</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
