const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const customerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('jobLocation')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Job location must not exceed 200 characters')
];

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerValidation, customerController.createCustomer);
router.put('/:id', customerValidation, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
