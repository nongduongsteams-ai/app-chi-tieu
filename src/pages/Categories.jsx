import React, { useState, useEffect } from 'react';
import { getData, postData } from '../api';
import { Plus, Trash2, Tag, X, TrendingUp, Edit2 } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ category_name: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [catRes, statsRes] = await Promise.all([
            getData('getCategories'),
            getData('getStats')
        ]);

        if (catRes.success) setCategories(catRes.data || []);
        if (statsRes.success) setStats(statsRes.data);
        setLoading(false);
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                category_name: category.category_name,
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ category_name: '', description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ category_name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = editingCategory ? 'editCategory' : 'addCategory';
        const payload = {
            ...formData,
            status: 'active'
        };

        if (editingCategory) {
            payload.id = editingCategory.id;
        }

        const res = await postData(action, payload);

        if (res.success) {
            fetchData();
            closeModal();
        } else {
            alert('Lỗi: ' + res.message);
        }
    };

    const handleDelete = async (id) => {
        const res = await postData('deleteCategory', { id });

        if (res.success) {
            fetchData();
            setDeleteConfirm(null);
        } else {
            alert('Lỗi: ' + res.message);
        }
    };

    const getCategoryAmount = (categoryName) => {
        if (!stats || !stats.byCategory) return 0;
        return stats.byCategory[categoryName] || 0;
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Danh mục chi</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                    <Plus size={20} />
                    Thêm danh mục
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const amount = getCategoryAmount(cat.category_name);
                    return (
                        <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Tag className="text-primary" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{cat.category_name}</h3>
                                        <p className="text-xs text-gray-500">{cat.status}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => openModal(cat)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Sửa danh mục"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(cat)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Xóa danh mục"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{cat.description}</p>

                            {/* Category Statistics */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <TrendingUp size={16} />
                                        <span className="text-xs font-medium">Tổng chi</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">
                                            {amount.toLocaleString()} đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                                <input
                                    type="text"
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                                >
                                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa danh mục <strong>"{deleteConfirm.category_name}"</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
