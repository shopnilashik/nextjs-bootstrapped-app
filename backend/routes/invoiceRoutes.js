const express = require('express');
const { body } = require('express-validator');
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const invoiceValidation = [
  body('date')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a valid integer'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Note must not exceed 1000 characters')
];

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', invoiceController.getAllInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/:id/download', invoiceController.downloadInvoice);
router.post('/', invoiceValidation, invoiceController.createInvoice);
router.put('/:id', invoiceValidation, invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
