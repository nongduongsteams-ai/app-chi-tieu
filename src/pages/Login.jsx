import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { setUser, getPlatform } from '../utils/auth';
import { jwtDecode } from "jwt-decode";
import { Receipt } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const user = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                platform: getPlatform()
            };
            setUser(user);
            onLoginSuccess(user);
        } catch (e) {
            console.error("Login Error", e);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary via-purple-500 to-secondary text-white">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-gray-900 flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Receipt size={48} className="text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">App Chi tiêu</h1>
                <p className="text-gray-500 mb-8 text-center">Quản lý chi tiêu gia đình thông minh</p>

                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                    useOneTap
                />

                <p className="mt-6 text-xs text-gray-400">
                    Powered by Antigravity
                </p>
            </div>
        </div>
    );
};

export default Login;
