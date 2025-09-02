const express = require('express');
const router = express.Router();

const patientController = require('../controllers/patientController');

// List available patient endpoints
router.get('/', (req, res, next) => {
	// If query param ?info is present, show HTML, else return records
	if (req.query.info !== undefined) {
		res.send(`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Patient API Routes</title>
				<style>
					body { font-family: Arial, sans-serif; background: #f4f6f8; color: #222; margin: 0; padding: 0; }
					.container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 32px; }
					h1 { color: #c62828; margin-bottom: 16px; }
					ul { list-style: none; padding: 0; }
					li { margin: 8px 0; }
					a { color: #d32f2f; text-decoration: none; }
				</style>
			</head>
			<body>
				<div class="container">
					<h1>Patient API Routes</h1>
					<ul>
						<li><strong>GET</strong> <a href="/api/patients">/api/patients</a> (all records)</li>
						<li><strong>POST</strong> <a href="/api/patients">/api/patients</a> (create record)</li>
						<li><strong>GET</strong> <a href="/api/patients/:id">/api/patients/:id</a> (get record by id)</li>
					</ul>
				</div>
			</body>
			</html>
		`);
	} else {
		next();
	}
});
router.get('/', patientController.getAllRecords); // Get all patient records
router.post('/', patientController.createRecord); // Create patient record
router.get('/:id', patientController.getRecord);  // Get patient record
router.put('/:id', patientController.updateRecord); // Update patient record
router.delete('/:id', patientController.deleteRecord); // Delete patient record

module.exports = router;
