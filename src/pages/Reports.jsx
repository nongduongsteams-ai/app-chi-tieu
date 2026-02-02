import React, { useState, useEffect } from 'react';
import { getData } from '../api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

const Reports = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState('excel'); // 'excel' or 'csv'
    const [selectedCategories, setSelectedCategories] = useState([]);

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
        if (catRes.success) {
            const cats = catRes.data || [];
            setCategories(cats);
            // Select all by default
            setSelectedCategories(cats.map(c => c.category_name));
        }
        setLoading(false);
    };

    // Filter expenses by selected month
    const getFilteredExpenses = () => {
        return expenses.filter(exp => {
            return exp.expense_date.startsWith(filterMonth);
        });
    };

    // Calculate stats from filtered expenses
    const getStats = () => {
        const filtered = getFilteredExpenses();
        const total = filtered.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        const count = filtered.length;

        // Group by category
        const byCategory = {};
        filtered.forEach(exp => {
            const cat = exp.category;
            byCategory[cat] = (byCategory[cat] || 0) + (Number(exp.amount) || 0);
        });

        return { total, count, byCategory };
    };

    const toggleCategory = (categoryName) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(c => c !== categoryName);
            } else {
                return [...prev, categoryName];
            }
        });
    };

    const toggleAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(c => c.category_name));
        }
    };

    const openExportModal = (type) => {
        setExportType(type);
        setShowExportModal(true);
    };

    const performExport = () => {
        let dataToExport;

        // Filter by categories
        if (selectedCategories.length === categories.length) {
            // All categories - use filtered by month
            dataToExport = getFilteredExpenses();
        } else if (selectedCategories.length === 0) {
            alert('Vui lòng chọn ít nhất 1 danh mục');
            return;
        } else {
            // Filter by selected categories
            dataToExport = getFilteredExpenses().filter(exp =>
                selectedCategories.includes(exp.category)
            );
        }

        if (dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        // Export
        if (exportType === 'excel') {
            exportToExcel(dataToExport);
        } else {
            exportToCSV(dataToExport);
        }

        setShowExportModal(false);
    };

    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        const fileName = selectedCategories.length === categories.length
            ? `expenses_${filterMonth}_all.xlsx`
            : `expenses_${filterMonth}_selected.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const exportToCSV = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = selectedCategories.length === categories.length
            ? `expenses_${filterMonth}_all.csv`
            : `expenses_${filterMonth}_selected.csv`;
        a.download = fileName;
        a.click();
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    const stats = getStats();
    const categoryData = stats.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({
        name,
        value
    })) : [];

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Báo cáo</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => openExportModal('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        <Download size={16} />
                        Excel
                    </button>
                    <button
                        onClick={() => openExportModal('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        <Download size={16} />
                        CSV
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                <input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">Tổng chi tiêu</h3>
                    <p className="text-3xl font-bold text-primary mt-2">
                        {stats.total.toLocaleString()} đ
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">Số giao dịch</h3>
                    <p className="text-3xl font-bold text-secondary mt-2">{stats.count}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-400 uppercase">Trung bình/giao dịch</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.count > 0 ? (stats.total / stats.count).toLocaleString(0) : 0} đ
                    </p>
                </div>
            </div>

            {categoryData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Chi tiêu theo danh mục</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${((entry.value / stats.total) * 100).toFixed(1)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Biểu đồ cột</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                                <Bar dataKey="value" fill="#4F46E5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">Không có dữ liệu cho tháng {filterMonth}</p>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Filter size={24} />
                                Xuất dữ liệu {exportType === 'excel' ? 'Excel' : 'CSV'}
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-3">
                                    Chọn danh mục muốn xuất ({selectedCategories.length}/{categories.length}):
                                </p>

                                {/* Select All */}
                                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border-2 border-primary cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.length === categories.length}
                                        onChange={toggleAllCategories}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="font-bold text-primary">Tất cả danh mục</span>
                                </label>

                                {/* Category List */}
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.category_name)}
                                                onChange={() => toggleCategory(cat.category_name)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="flex-1">{cat.category_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 mb-3">
                                    Tháng: <strong>{filterMonth}</strong> •
                                    Danh mục: <strong>{selectedCategories.length === categories.length ? 'Tất cả' : `${selectedCategories.length} danh mục`}</strong>
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={performExport}
                                        className={`flex-1 px-4 py-2 rounded-lg text-white transition ${exportType === 'excel'
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                            }`}
                                    >
                                        Xuất {exportType === 'excel' ? 'Excel' : 'CSV'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
