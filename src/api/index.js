import axios from 'axios';

// Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyqkn7g09BgoKC4wgtewFyCkreHtqQ4vR97uF8teDHQ8nCRvKK2H3dXz8bgLpArgfQn/exec';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'text/plain;charset=utf-8', // data sent as text/plain to avoid CORS preflight issues with GAS
    },
});

export const getData = async (action, params = {}) => {
    try {
        const response = await api.get('', {
            params: { action, ...params }
        });
        return response.data;
    } catch (error) {
        console.error("API Error", error);
        return { success: false, message: error.message };
    }
};

export const postData = async (action, data = {}) => {
    try {
        // GAS doesn't handle OPTIONS/Preflight well for application/json sometimes. 
        // Sending as text/plain and parsing in GAS is a common workaround.
        const response = await api.post('', JSON.stringify({ action, ...data }));
        return response.data;
    } catch (error) {
        console.error("API Error", error);
        return { success: false, message: error.message };
    }
};

export default api;
