import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div 
                className="bg-gray-800 border border-yellow-500/30 rounded-xl shadow-2xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-700">
                    <h2 id="confirmation-title" className="text-xl font-bold text-yellow-300">{title}</h2>
                </header>
                <main className="p-6">
                    <p className="text-gray-300">{message}</p>
                </main>
                <footer className="p-4 flex justify-end gap-4 bg-gray-900/30 rounded-b-xl">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 font-semibold rounded-md transition-colors bg-gray-700/50 text-white hover:bg-gray-600/70"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 font-semibold rounded-md transition-colors bg-red-600/50 text-white hover:bg-red-500/70"
                    >
                        Xác nhận
                    </button>
                </footer>
            </div>
        </div>
    );
};