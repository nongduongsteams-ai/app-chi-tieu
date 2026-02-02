import React, { useEffect, useState } from 'react';
import { getData } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days'); // '7days', '1month', 'all'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [statsRes, expensesRes] = await Promise.all([
                getData('getStats'),
                getData('getExpenses')
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (expensesRes.success) setExpenses(expensesRes.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Filter expenses by time range
    const getFilteredExpenses = () => {
        const today = new Date();
        const startDate = new Date();

        if (timeRange === '7days') {
            startDate.setDate(today.getDate() - 7);
        } else if (timeRange === '1month') {
            startDate.setMonth(today.getMonth() - 1);
        } else {
            // 'all' - return all expenses
            return expenses;
        }

        return expenses.filter(exp => {
            const expDate = new Date(exp.expense_date);
            return expDate >= startDate;
        });
    };

    // Calculate stats for filtered data
    const getFilteredStats = () => {
        const filteredExpenses = getFilteredExpenses();
        const total = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        const count = filteredExpenses.length;

        // Group by category
        const byCategory = {};
        filteredExpenses.forEach(exp => {
            const cat = exp.category;
            byCategory[cat] = (byCategory[cat] || 0) + (Number(exp.amount) || 0);
        });

        return { total, count, byCategory };
    };

    // Generate chart data
    const getChartData = () => {
        const filteredExpenses = getFilteredExpenses();
        if (!filteredExpenses.length) return [];

        // Group ALL expenses by date first
        const expensesByDate = {};
        filteredExpenses.forEach(exp => {
            const date = exp.expense_date;
            if (!expensesByDate[date]) {
                expensesByDate[date] = 0;
            }
            expensesByDate[date] += Number(exp.amount) || 0;
        });

        // Get all unique dates and sort them
        const allDates = Object.keys(expensesByDate).sort();

        if (allDates.length === 0) return [];

        // For "all time", limit to last 90 days or actual data range (whichever is smaller)
        let datesToShow = allDates;
        if (timeRange === '7days') {
            datesToShow = allDates.slice(-7);
        } else if (timeRange === '1month') {
            datesToShow = allDates.slice(-30);
        } else {
            // For "all", show last 90 days or all data if less than 90 days
            datesToShow = allDates.slice(-90);
        }

        // Convert to chart format
        return datesToShow.map(date => ({
            name: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            amt: expensesByDate[date]
        }));
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    const filteredStats = getFilteredStats();
    const chartData = getChartData();

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Tổng quan</h2>

                {/* Time Range Filter */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setTimeRange('7days')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${timeRange === '7days'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        7 ngày
                    </button>
                    <button
                        onClick={() => setTimeRange('1month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${timeRange === '1month'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        1 tháng
                    </button>
                    <button
                        onClick={() => setTimeRange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${timeRange === 'all'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase">Tổng chi tiêu</h3>
                            <p className="text-3xl font-bold text-primary mt-2">
                                {filteredStats.total.toLocaleString()} đ
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <DollarSign className="text-primary" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase">Số giao dịch</h3>
                            <p className="text-3xl font-bold text-secondary mt-2">
                                {filteredStats.count}
                            </p>
                        </div>
                        <div className="p-3 bg-secondary/10 rounded-lg">
                            <ShoppingCart className="text-secondary" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 uppercase">Trung bình/giao dịch</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {filteredStats.count > 0 ? (filteredStats.total / filteredStats.count).toLocaleString(0) : 0} đ
                            </p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <TrendingUp className="text-gray-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">
                    Chi tiêu {timeRange === '7days' ? '7 ngày gần đây' : timeRange === '1month' ? '30 ngày gần đây' : 'tất cả thời gian'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                        <Area type="monotone" dataKey="amt" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Top Categories */}
            {filteredStats.byCategory && Object.keys(filteredStats.byCategory).length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Chi tiêu theo danh mục</h3>
                    <div className="space-y-3">
                        {Object.entries(filteredStats.byCategory)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([category, amount]) => {
                                const percentage = ((amount / filteredStats.total) * 100).toFixed(1);
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{category}</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {amount.toLocaleString()} đ ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
