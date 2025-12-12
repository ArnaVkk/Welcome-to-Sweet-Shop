const { validationResult } = require('express-validator');
const { Sweet } = require('../models');

/**
 * @desc    Get all sweets (with optional filtering)
 * @route   GET /api/sweets
 * @access  Public
 */
const getAllSweets = async (req, res, next) => {
  try {
    const { category, search, inStock, sortBy, order } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by stock
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    } else if (inStock === 'false') {
      query.quantity = 0;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }
    
    const sweets = await Sweet.find(query).sort(sortOptions);
    
    res.json({
      count: sweets.length,
      sweets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single sweet by ID
 * @route   GET /api/sweets/:id
 * @access  Public
 */
const getSweetById = async (req, res, next) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    
    res.json({ sweet });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    next(error);
  }
};

/**
 * @desc    Create a new sweet
 * @route   POST /api/sweets
 * @access  Private (Admin only)
 */
const createSweet = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, price, quantity, description, imageUrl } = req.body;

    const sweet = new Sweet({
      name,
      category,
      price,
      quantity: quantity || 0,
      description: description || '',
      imageUrl: imageUrl || ''
    });

    await sweet.save();

    res.status(201).json({
      message: 'Sweet created successfully',
      sweet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a sweet
 * @route   PUT /api/sweets/:id
 * @access  Private (Admin only)
 */
const updateSweet = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, price, quantity, description, imageUrl } = req.body;

    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    // Update fields
    if (name !== undefined) sweet.name = name;
    if (category !== undefined) sweet.category = category;
    if (price !== undefined) sweet.price = price;
    if (quantity !== undefined) sweet.quantity = quantity;
    if (description !== undefined) sweet.description = description;
    if (imageUrl !== undefined) sweet.imageUrl = imageUrl;

    await sweet.save();

    res.json({
      message: 'Sweet updated successfully',
      sweet
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    next(error);
  }
};

/**
 * @desc    Delete a sweet
 * @route   DELETE /api/sweets/:id
 * @access  Private (Admin only)
 */
const deleteSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({
      message: 'Sweet deleted successfully',
      sweet
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    next(error);
  }
};

/**
 * @desc    Purchase a sweet (decrease quantity)
 * @route   POST /api/sweets/:id/purchase
 * @access  Private (Authenticated users)
 */
const purchaseSweet = async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: sweet.quantity 
      });
    }

    // Decrease quantity
    sweet.quantity -= quantity;
    await sweet.save();

    res.json({
      message: 'Purchase successful',
      sweet,
      purchased: quantity
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    next(error);
  }
};

/**
 * @desc    Restock a sweet (increase quantity)
 * @route   POST /api/sweets/:id/restock
 * @access  Private (Admin only)
 */
const restockSweet = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    // Increase quantity
    sweet.quantity += quantity;
    await sweet.save();

    res.json({
      message: 'Restock successful',
      sweet,
      added: quantity
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    next(error);
  }
};

module.exports = {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
};
