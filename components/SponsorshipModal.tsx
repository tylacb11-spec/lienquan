import React from 'react';
import { Sponsor, SponsorSlot, SponsorPrestige } from '../types';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

interface SponsorshipModalProps {
    slot: SponsorSlot;
    offers: Sponsor[];
    onAccept: (offer: Sponsor) => void;
    onClose: () => void;
}

const OfferCard: React.FC<{ offer: Sponsor, onAccept: (offer: Sponsor) => void }> = ({ offer, onAccept }) => {
    const prestigeStyles: Record<SponsorPrestige, string> = {
        Local: 'bg-green-700 text-green-200 border-green-500',
        Regional: 'bg-blue-700 text-blue-200 border-blue-500',
        National: 'bg-purple-700 text-purple-200 border-purple-500',
        Global: 'bg-yellow-700 text-yellow-200 border-yellow-500',
    };
    
    return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
        <div>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <img src={offer.logoUrl} alt={offer.name} className="w-12 h-12 rounded-lg" />
                    <h4 className="text-xl font-bold text-white">{offer.name}</h4>
                </div>
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${prestigeStyles[offer.prestige]}`}>
                    {offer.prestige}
                </span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Thanh toán cơ bản/mùa:</span>
                    <span className="font-semibold text-green-400">{formatCurrency(offer.basePayment)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Mục tiêu:</span>
                    <span className="font-semibold text-gray-300 text-right">{offer.objective.description}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Thưởng nếu đạt:</span>
                    <span className="font-semibold text-yellow-400">{formatCurrency(offer.bonus)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Phạt nếu không đạt:</span>
                    <span className="font-semibold text-red-400">{formatCurrency(offer.penalty)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400">Thời hạn:</span>
                    <span className="font-semibold text-gray-300">{offer.duration} mùa</span>
                </div>
            </div>
        </div>
        <button
            onClick={() => onAccept(offer)}
            className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
            Chấp Nhận
        </button>
    </div>
)};

export const SponsorshipModal: React.FC<SponsorshipModalProps> = ({ slot, offers, onAccept, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">Đề Nghị Tài Trợ cho vị trí: {slot}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {offers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offers.map(offer => <OfferCard key={offer.id} offer={offer} onAccept={onAccept} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 italic">Hiện không có đề nghị nào cho vị trí này.</p>
                    )}
                </main>
            </div>
        </div>
    );
};