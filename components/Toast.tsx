import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 3000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Entrance animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        info: <Info size={20} />,
        warning: <AlertTriangle size={20} />
    };

    const styles = {
        success: 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500/50 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]',
        error: 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500/50 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)]',
        info: 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500/50 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)]',
        warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500/50 text-white shadow-[0_0_25px_rgba(234,179,8,0.4)]'
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-[200] transition-all duration-300 ease-out ${isVisible && !isExiting
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`${styles[type]} border-2 rounded-2xl px-6 py-4 min-w-[300px] max-w-md shadow-2xl backdrop-blur-sm flex items-center gap-3 group`}>
                <div className="flex-shrink-0">
                    {icons[type]}
                </div>
                <p className="flex-1 font-medium text-sm leading-relaxed">
                    {message}
                </p>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-all duration-200 opacity-70 hover:opacity-100"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// Toast Container Component
interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        // Listen for custom toast events
        const handleToast = (event: CustomEvent<{ message: string; type: ToastType }>) => {
            const newToast: ToastMessage = {
                id: Date.now().toString(),
                message: event.detail.message,
                type: event.detail.type
            };
            setToasts(prev => [...prev, newToast]);
        };

        window.addEventListener('show-toast' as any, handleToast);
        return () => window.removeEventListener('show-toast' as any, handleToast);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                    style={{
                        transform: `translateY(-${index * 10}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

// Helper function to show toasts
export const showToast = (message: string, type: ToastType = 'info') => {
    const event = new CustomEvent('show-toast', {
        detail: { message, type }
    });
    window.dispatchEvent(event);
};
