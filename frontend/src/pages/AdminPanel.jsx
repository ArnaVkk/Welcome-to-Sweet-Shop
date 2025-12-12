import { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const AdminPanel = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  const categories = ['chocolate', 'candy', 'cake', 'cookie', 'ice-cream', 'pastry', 'traditional', 'other'];

  const [formData, setFormData] = useState({
    name: '',
    category: 'candy',
    price: '',
    quantity: '',
    description: ''
  });

  const fetchSweets = async () => {
    try {
      const response = await sweetsAPI.getAll();
      setSweets(response.data.sweets);
    } catch (error) {
      toast.error('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', category: 'candy', price: '', quantity: '', description: '' });
    setShowAddForm(false);
    setEditingSweet(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0
    };

    try {
      if (editingSweet) {
        await sweetsAPI.update(editingSweet._id, data);
        toast.success('Sweet updated successfully!');
      } else {
        await sweetsAPI.create(data);
        toast.success('Sweet added successfully!');
      }
      resetForm();
      fetchSweets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (sweet) => {
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      description: sweet.description || ''
    });
    setEditingSweet(sweet);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;

    try {
      await sweetsAPI.delete(id);
      toast.success('Sweet deleted!');
      fetchSweets();
    } catch (error) {
      toast.error('Failed to delete sweet');
    }
  };

  const handleRestock = async () => {
    if (!restockModal || restockQty < 1) return;

    try {
      await sweetsAPI.restock(restockModal._id, restockQty);
      toast.success(`Restocked ${restockQty} items!`);
      setRestockModal(null);
      setRestockQty(10);
      fetchSweets();
    } catch (error) {
      toast.error('Restock failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500">Manage your sweet inventory</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="btn btn-primary"
        >
          + Add New Sweet
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSweet ? 'Edit Sweet' : 'Add New Sweet'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-24 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingSweet ? 'Update' : 'Add Sweet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Restock: {restockModal.name}</h2>
            <p className="text-gray-500 mb-4">Current stock: {restockModal.quantity}</p>
            
            <div className="mb-4">
              <label className="label">Add Quantity</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setRestockModal(null)} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleRestock} className="flex-1 btn btn-success">
                Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Sweet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sweets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <span className="text-4xl block mb-2">📦</span>
                    No sweets in inventory. Add some!
                  </td>
                </tr>
              ) : (
                sweets.map(sweet => (
                  <tr key={sweet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sweet.name}</div>
                      {sweet.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{sweet.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full capitalize">
                        {sweet.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{sweet.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${sweet.quantity < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {sweet.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setRestockModal(sweet)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => handleEdit(sweet)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sweet._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-purple-600">{sweets.length}</div>
          <div className="text-gray-500">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-green-600">
            {sweets.filter(s => s.quantity > 0).length}
          </div>
          <div className="text-gray-500">In Stock</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-red-600">
            {sweets.filter(s => s.quantity === 0).length}
          </div>
          <div className="text-gray-500">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
