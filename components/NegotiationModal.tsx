import React, { useState, useMemo } from 'react';
import { Player, PromisedRole, calculateBuyoutFee } from '../types';

// Helper
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

// Component for a single negotiation parameter
const OfferInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg">
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        {children}
    </div>
);

// Main Modal Component
interface NegotiationModalProps {
    player: Player;
    teamBudget: number;
    onFinalize: (player: Player, offer: { salary: number, signingBonus: number, duration: number, role: PromisedRole }) => void;
    onClose: () => void;
    feedback: string;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({ player, teamBudget, onFinalize, onClose, feedback }) => {
    const [salary, setSalary] = useState(player.contract?.salary || 50000);
    const [signingBonus, setSigningBonus] = useState(10000);
    const [duration, setDuration] = useState(1);
    const [role, setRole] = useState<PromisedRole>(PromisedRole.Starter);

    const buyoutFee = useMemo(() => player.contract ? calculateBuyoutFee(player) : 0, [player]);
    const totalUpfrontCost = signingBonus + buyoutFee;
    const canAfford = teamBudget >= totalUpfrontCost;

    const handleMakeOffer = () => {
        if (!canAfford) return;
        onFinalize(player, { salary, signingBonus, duration, role });
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-gray-800 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">Đàm Phán Hợp Đồng</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </header>

                <main className="p-6 overflow-y-auto space-y-6">
                    {/* Player Info */}
                    <div className="flex items-center space-x-4 bg-gray-900/40 p-4 rounded-lg">
                        <img src={player.avatarUrl} alt={player.ign} className="w-16 h-16 rounded-full" />
                        <div>
                            <h3 className="text-2xl font-bold">{player.ign}</h3>
                            <p className="text-gray-400">{player.role} | {player.age} tuổi</p>
                        </div>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className="p-3 bg-yellow-600/30 border border-yellow-500 rounded-lg text-center text-yellow-200 animate-fade-in">
                            <p className="font-semibold">Phản hồi của tuyển thủ:</p>
                            <p className="italic">"{feedback}"</p>
                        </div>
                    )}

                    {/* Offer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OfferInput label={`Lương Hàng Năm (${formatCurrency(salary)})`}>
                            <input
                                type="range"
                                min="10000"
                                max="300000"
                                step="5000"
                                value={salary}
                                onChange={(e) => setSalary(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </OfferInput>

                        <OfferInput label={`Thưởng Ký Hợp Đồng (${formatCurrency(signingBonus)})`}>
                            <input
                                type="range"
                                min="0"
                                max="100000"
                                step="5000"
                                value={signingBonus}
                                onChange={(e) => setSigningBonus(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </OfferInput>
                        
                        <OfferInput label="Thời Hạn Hợp Đồng">
                            <div className="flex justify-around">
                                {[1, 2, 3].map(d => (
                                    <button key={d} onClick={() => setDuration(d)} className={`px-4 py-1 rounded ${duration === d ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        {d} năm
                                    </button>
                                ))}
                            </div>
                        </OfferInput>
                        
                        <OfferInput label="Vai Trò Hứa Hẹn">
                             <div className="flex justify-around">
                                {Object.values(PromisedRole).map(r => (
                                    <button key={r} onClick={() => setRole(r)} className={`px-3 py-1 text-sm rounded ${role === r ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </OfferInput>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-900/50 p-4 rounded-lg text-sm space-y-2">
                        <h4 className="font-bold text-lg text-cyan-400 mb-2">Tóm Tắt Tài Chính</h4>
                        {buyoutFee > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phí phá vỡ hợp đồng:</span>
                                <span className="font-semibold text-red-400">{formatCurrency(buyoutFee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Thưởng ký hợp đồng:</span>
                            <span className="font-semibold text-red-400">{formatCurrency(signingBonus)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-700">
                            <span className="font-bold">TỔNG CHI PHÍ BAN ĐẦU:</span>
                            <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-500'}`}>{formatCurrency(totalUpfrontCost)}</span>
                        </div>
                        <div className="flex justify-between">
                             <span className="text-gray-400">Ngân sách còn lại:</span>
                             <span className="font-semibold">{formatCurrency(teamBudget - totalUpfrontCost)}</span>
                        </div>
                    </div>
                </main>
                
                <footer className="p-4 border-t border-gray-700">
                     <button
                        onClick={handleMakeOffer}
                        disabled={!canAfford}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                     >
                        Đưa ra lời đề nghị
                     </button>
                </footer>
            </div>
        </div>
    );
};
