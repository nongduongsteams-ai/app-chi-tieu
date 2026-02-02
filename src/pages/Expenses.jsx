import React, { useState, useEffect } from 'react';
import { getData, postData } from '../api';
import { getUser } from '../utils/auth';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const user = getUser();

    const [formData, setFormData] = useState({
        expense_date: new Date().toISOString().split('T')[0],
        expense_time: new Date().toTimeString().slice(0, 5),
        category: '',
        amount: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [expRes, catRes] = await Promise.all([
            getData('getExpenses'),
            getData('getCategories')
        ]);

        if (expRes.success) setExpenses(expRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            created_by: user.name,
            email: user.email,
            platform: 'web'
        };

        const action = editingExpense ? 'editExpense' : 'addExpense';
        if (editingExpense) payload.id = editingExpense.id;

        const res = await postData(action, payload);

        if (res.success) {
            fetchData();
            closeModal();
        } else {
            alert('Lỗi: ' + res.message);
        }
    };

    const handleDelete = async (id) => {
        const res = await postData('deleteExpense', {
            id,
            email: user.email
        });

        if (res.success) {
            fetchData();
            setDeleteConfirm(null);
        } else {
            alert('Lỗi: ' + res.message);
        }
    };

    const openModal = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                expense_date: expense.expense_date,
                expense_time: expense.expense_time || '',
                category: expense.category,
                amount: expense.amount,
                location: expense.location || '',
                description: expense.description || ''
            });
        } else {
            setEditingExpense(null);
            setFormData({
                expense_date: new Date().toISOString().split('T')[0],
                expense_time: new Date().toTimeString().slice(0, 5),
                category: '',
                amount: '',
                location: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingExpense(null);
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = !filterCategory || exp.category === filterCategory;
        return matchSearch && matchCategory;
    });

    if (loading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Quản lý Khoản Chi</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                    <Plus size={20} />
                    Thêm khoản chi
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                    ))}
                </select>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nơi chi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Chưa có khoản chi nào
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {expense.expense_date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{expense.location || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{expense.description || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                                        {Number(expense.amount).toLocaleString()} đ
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openModal(expense)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(expense)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingExpense ? 'Sửa khoản chi' : 'Thêm khoản chi'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                                <input
                                    type="date"
                                    value={formData.expense_date}
                                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ</label>
                                <input
                                    type="time"
                                    value={formData.expense_time}
                                    onChange={(e) => setFormData({ ...formData, expense_time: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nơi chi</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    placeholder="Ví dụ: Cửa hàng Vinmart, Quán cơm..."
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
                                    {editingExpense ? 'Cập nhật' : 'Thêm'}
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
                            Bạn có chắc chắn muốn xóa khoản chi "{deleteConfirm.description}"?
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

export default Expenses;
