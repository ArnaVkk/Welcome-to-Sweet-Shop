const express = require('express');
const { body } = require('express-validator');
const {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} = require('../controllers/sweet.controller');
const { authenticate, isAdmin } = require('../middleware');

const router = express.Router();

// Validation rules
const sweetValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'traditional', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const updateSweetValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'traditional', 'other'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Public routes
router.get('/', getAllSweets);
router.get('/:id', getSweetById);

// Protected routes (Authenticated users)
router.post('/:id/purchase', authenticate, purchaseSweet);

// Admin only routes
router.post('/', authenticate, isAdmin, sweetValidation, createSweet);
router.put('/:id', authenticate, isAdmin, updateSweetValidation, updateSweet);
router.delete('/:id', authenticate, isAdmin, deleteSweet);
router.post('/:id/restock', authenticate, isAdmin, restockSweet);

module.exports = router;
