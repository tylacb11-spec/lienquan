import React, { useState, useEffect, useRef } from 'react';

interface MainMenuProps {
    onNewGame: () => void;
    onLoadGameFromFile: (jsonContent: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGameFromFile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                onLoadGameFromFile(content);
            }
        };
        reader.onerror = () => {
            console.error("Error reading file.");
            alert("Không thể đọc file đã chọn.");
        };
        reader.readAsText(file);
        
        // Reset file input value to allow loading the same file again
        event.target.value = '';
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
            />
            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-black text-cyan-300 tracking-tighter" style={{ textShadow: '0 0 15px rgba(56, 189, 248, 0.4)'}}>
                    Quản Lý Đội Tuyển Esports
                </h1>
                <p className="text-lg md:text-xl text-gray-400">
                    Xây dựng di sản của bạn. Dẫn dắt đội tuyển đến đỉnh vinh quang.
                </p>
            </div>
            <div className="mt-12 flex flex-col space-y-4 w-full max-w-xs">
                <button
                    onClick={onNewGame}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    Sự Nghiệp Mới
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-4 px-6 rounded-lg text-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    Tải File Save
                </button>
            </div>
        </div>
    );
};