const KEY = 'expense_app_user';

export const setUser = (user) => {
    localStorage.setItem(KEY, JSON.stringify(user));
};

export const getUser = () => {
    const u = localStorage.getItem(KEY);
    return u ? JSON.parse(u) : null;
};

export const removeUser = () => {
    localStorage.removeItem(KEY);
};

export const isWeb = () => {
    // Basic check, can be improved with Capacitor helper
    return typeof window !== 'undefined';
};

export const getPlatform = () => {
    // In Capacitor, we can check platform. 
    // Ideally use Capacitor.getPlatform() but for simple check:
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'ios';
    return 'web';
};
