const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// List all users
router.get('/', userController.getAllUsers);
// Register user with wallet
router.post('/register', userController.registerUser);
// Get user by wallet address
router.get('/:walletAddress', userController.getUserByWallet);
// Update user profile
router.put('/:walletAddress', userController.updateUser);
// Delete user
router.delete('/:walletAddress', userController.deleteUser);

module.exports = router;
