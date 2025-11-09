import React from 'react';
import { Player } from '../types';

interface DramaEventModalProps {
    event: { player: Player; description: string; };
    onResolve: (choice: 'fine' | 'bench' | 'ignore', player: Player) => void;
    onClose: () => void;
}

export const DramaEventModal: React.FC<DramaEventModalProps> = ({ event, onResolve, onClose }) => {
    const { player, description } = event;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-red-500/30 rounded-xl shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-red-400 tracking-wider animate-pulse">SỰ CỐ TRUYỀN THÔNG</h2>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex items-center space-x-4 bg-gray-900/40 p-3 rounded-lg">
                        <img src={player.avatarUrl} alt={player.ign} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="text-lg font-bold">{player.ign}</p>
                            <p className="text-gray-300">{description}</p>
                        </div>
                    </div>
                    <p className="text-center font-semibold text-gray-300">Bạn sẽ xử lý thế nào?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => onResolve('fine', player)}
                            className="bg-yellow-600/50 p-3 rounded-md hover:bg-yellow-500/70 transition-colors"
                        >
                            <p className="font-bold">Phạt Tiền</p>
                            <p className="text-xs text-yellow-200">(-Tinh thần, +Danh tiếng)</p>
                        </button>
                         <button
                            onClick={() => onResolve('bench', player)}
                            className="bg-red-600/50 p-3 rounded-md hover:bg-red-500/70 transition-colors"
                        >
                            <p className="font-bold">Cấm Thi Đấu</p>
                            <p className="text-xs text-red-200">(--Tinh thần, ++Danh tiếng)</p>
                        </button>
                         <button
                            onClick={() => onResolve('ignore', player)}
                            className="bg-gray-600/50 p-3 rounded-md hover:bg-gray-500/70 transition-colors"
                        >
                            <p className="font-bold">Ngó Lơ</p>
                            <p className="text-xs text-gray-200">(+Tinh thần, --Danh tiếng)</p>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};