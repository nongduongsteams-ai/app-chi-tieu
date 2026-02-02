import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tag, FileBarChart, LogOut, Sparkles, Mail } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
    const navItems = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
        { to: '/expenses', icon: <Receipt size={20} />, label: 'Khoản chi' },
        { to: '/categories', icon: <Tag size={20} />, label: 'Danh mục' },
        { to: '/reports', icon: <FileBarChart size={20} />, label: 'Báo cáo' },
    ];

    return (
        <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-white to-gray-50 border-r shadow-lg">
            {/* Header - App Title */}
            <div className="p-6 border-b bg-gradient-to-r from-primary to-purple-600">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Receipt className="text-white" size={28} />
                    <h1 className="text-2xl font-bold text-white">App Chi tiêu</h1>
                </div>
                <p className="text-center text-white/80 text-xs font-medium">Quản lý tài chính thông minh</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Author Info - Super VIP */}
            <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <p className="text-xs font-semibold text-purple-900">Phát triển bởi</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Nông Dưỡng
                    </p>
                    <p className="text-xs text-gray-600 font-medium">© 2026</p>
                    <a
                        href="mailto:nongvanduong1988@gmail.com"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition group"
                    >
                        <Mail size={12} className="group-hover:scale-110 transition" />
                        <span className="group-hover:underline">nongvanduong1988@gmail.com</span>
                    </a>
                </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t bg-white">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
