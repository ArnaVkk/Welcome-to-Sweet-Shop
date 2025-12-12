import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { sweetsAPI } from '../services/api';

const SweetCard = ({ sweet, onUpdate }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    if (sweet.quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    setPurchasing(true);
    try {
      await sweetsAPI.purchase(sweet._id, quantity);
      toast.success(`Purchased ${quantity} ${sweet.name}!`);
      onUpdate?.();
      setQuantity(1);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const isOutOfStock = sweet.quantity === 0;

  const getCategoryEmoji = (category) => {
    const emojis = {
      chocolate: '🍫',
      candy: '🍬',
      cake: '🎂',
      cookie: '🍪',
      'ice-cream': '🍦',
      pastry: '🥐',
      traditional: '🍯',
      other: '🍭'
    };
    return emojis[category] || '🍭';
  };

  return (
    <div className={`card ${isOutOfStock ? 'opacity-75' : ''}`}>
      {/* Category Badge */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
          <span className="text-6xl">{getCategoryEmoji(sweet.category)}</span>
        </div>
        <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-purple-600 capitalize">
          {sweet.category}
        </span>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{sweet.name}</h3>
        {sweet.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{sweet.description}</p>
        )}

        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-purple-600">
            ₹{sweet.price.toFixed(2)}
          </span>
          <span className={`text-sm ${sweet.quantity < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {sweet.quantity} in stock
          </span>
        </div>

        {/* Purchase Controls */}
        {!isOutOfStock && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(sweet.quantity, quantity + 1))}
                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                disabled={quantity >= sweet.quantity}
              >
                +
              </button>
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing || isOutOfStock}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {purchasing ? 'Buying...' : 'Buy Now'}
            </button>
          </div>
        )}

        {isOutOfStock && isAdmin && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Go to Admin Panel to restock
          </p>
        )}
      </div>
    </div>
  );
};

export default SweetCard;
