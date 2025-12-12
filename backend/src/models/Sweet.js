const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sweet name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'traditional', 'other'],
      message: 'Invalid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for search functionality
sweetSchema.index({ name: 'text', category: 'text', description: 'text' });

// Virtual for stock status
sweetSchema.virtual('inStock').get(function() {
  return this.quantity > 0;
});

// Ensure virtuals are included in JSON
sweetSchema.set('toJSON', { virtuals: true });
sweetSchema.set('toObject', { virtuals: true });

const Sweet = mongoose.model('Sweet', sweetSchema);

module.exports = Sweet;
