import { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import SweetCard from '../components/SweetCard';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'chocolate', label: '🍫 Chocolate' },
    { value: 'candy', label: '🍬 Candy' },
    { value: 'cake', label: '🎂 Cake' },
    { value: 'cookie', label: '🍪 Cookie' },
    { value: 'ice-cream', label: '🍦 Ice Cream' },
    { value: 'pastry', label: '🥐 Pastry' },
    { value: 'traditional', label: '🍯 Traditional' },
    { value: 'other', label: '🍭 Other' }
  ];

  const fetchSweets = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (inStockOnly) params.inStock = 'true';

      const response = await sweetsAPI.getAll(params);
      setSweets(response.data.sweets);
    } catch (error) {
      console.error('Failed to fetch sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, [category, inStockOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSweets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome to Sweet Shop
        </h1>
        <p className="text-gray-600">Discover delicious treats that make every moment sweeter! 🍬</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search sweets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* In Stock Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Sweets Grid */}
      {sweets.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🍭</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No sweets found</h2>
          <p className="text-gray-500">
            {search || category ? 'Try adjusting your filters' : 'Check back soon for delicious treats!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map(sweet => (
            <SweetCard 
              key={sweet._id} 
              sweet={sweet} 
              onUpdate={fetchSweets}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 text-center text-gray-500">
        Showing {sweets.length} sweet{sweets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default Dashboard;
