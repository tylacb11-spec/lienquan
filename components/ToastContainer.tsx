import React from 'react';
import { Toast as ToastType } from '../types';

const ICONS: Record<ToastType['type'], React.ReactNode> = {
    success: (
        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    info: (
        <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    ),
    error: (
         <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ),
};


interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-24 right-4 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(toast => (
                <div key={toast.id} className="animate-slide-in-right bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl flex items-start p-4">
                    <div className="flex-shrink-0">{ICONS[toast.type]}</div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="inline-flex text-gray-400 hover:text-white text-xl"
                            aria-label="Đóng"
                        >
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};