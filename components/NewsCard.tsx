import React from 'react';
import { NewsItem, NewsItemType } from '../types';
import { NewsIcon } from './icons/NewsIcons';
import { TrophyIcon } from './icons/TrophyIcon';

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
    </svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
);


// Helper for rich text
const renderFormattedText = (text: string) => {
    const parts = text.split(/(\[T:[^\]]+\]|\[P:[^\]]+\])/g);
    return (
        <>
            {parts.map((part, index) => {
                const teamMatch = part.match(/\[T:([^\]]+)\]/);
                if (teamMatch?.[1]) return <span key={index} className="font-bold text-cyan-400">{teamMatch[1]}</span>;
                const playerMatch = part.match(/\[P:([^\]]+)\]/);
                if (playerMatch?.[1]) return <span key={index} className="font-bold text-yellow-400">{playerMatch[1]}</span>;
                return part;
            })}
        </>
    );
};

// --- Specialized Card Components ---

const ChampionshipNewsCard: React.FC<{ item: NewsItem }> = ({ item }) => (
    <div className="relative bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600 rounded-xl p-4 border-2 border-yellow-300 shadow-2xl animate-champion-glow overflow-hidden">
        <TrophyIcon className="absolute -top-4 -left-4 w-28 h-28 text-white/10" />
        <div className="relative z-10 text-center">
            <h3 className="text-xl font-black text-gray-900 tracking-wider uppercase">{item.title}</h3>
            <div className="my-4 flex flex-col items-center">
                <img src={item.metadata?.champion?.logoUrl} alt={item.metadata?.champion?.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
                <p className="mt-2 text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {renderFormattedText(`[T:${item.metadata?.champion?.name || ''}]`)}
                </p>
            </div>
            <p className="text-md font-semibold text-gray-800">{renderFormattedText(item.content)}</p>
            <div className="text-xs text-yellow-800/80 mt-3">{item.date}</div>
        </div>
    </div>
);

const MvpNewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
    const { mvpPlayer, winningTeam, losingTeam, score } = item.metadata || {};
    return (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 hover:bg-gray-700/80 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                    <img src={mvpPlayer?.avatarUrl} alt={mvpPlayer?.ign} className="w-20 h-20 rounded-full border-2 border-green-400" />
                    <div className="text-center">
                        <p className="font-bold text-green-300 text-sm">MVP TRẬN ĐẤU</p>
                        <p className="font-bold text-white text-lg">{mvpPlayer?.ign}</p>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-white mb-2">{renderFormattedText(item.title)}</h3>
                    <div className="flex items-center justify-around bg-gray-900/50 p-2 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                            <img src={winningTeam?.logoUrl} alt={winningTeam?.name} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-sm truncate">{winningTeam?.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-400">{score}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate">{losingTeam?.name}</span>
                            <img src={losingTeam?.logoUrl} alt={losingTeam?.name} className="w-8 h-8 rounded-full" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{renderFormattedText(item.content)}</p>
                </div>
            </div>
             <div className="text-xs text-gray-500 flex items-center justify-between border-t border-gray-700/50 pt-2 mt-3">
                <span className="font-semibold">{item.author}</span>
                <span>{item.date}</span>
            </div>
        </div>
    );
};

const PromotionRelegationCard: React.FC<{ item: NewsItem }> = ({ item }) => {
    const { promoted, relegated } = item.metadata || {};
    return (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
             <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-900/50 flex items-center justify-center text-cyan-400">
                    <NewsIcon type={item.type} className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-white">{item.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold text-green-400 mb-2 text-center">THĂNG HẠNG</h4>
                    <div className="space-y-2">
                        {promoted?.map(team => (
                            <div key={team.name} className="flex items-center bg-green-900/40 p-2 rounded-md">
                                <ArrowUpIcon className="w-5 h-5 text-green-400 mr-2" />
                                <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="font-bold text-sm">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-red-400 mb-2 text-center">RỚT HẠNG</h4>
                    <div className="space-y-2">
                        {relegated?.map(team => (
                            <div key={team.name} className="flex items-center bg-red-900/40 p-2 rounded-md">
                                <ArrowDownIcon className="w-5 h-5 text-red-400 mr-2" />
                                <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="font-bold text-sm">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-between border-t border-gray-700/50 pt-2 mt-4">
                <span className="font-semibold">{item.author}</span>
                <span>{item.date}</span>
            </div>
        </div>
    );
};

const DefaultNewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
     const getIconColor = () => {
        switch (item.type) {
            case NewsItemType.MATCH_RESULT: return 'text-yellow-400';
            case NewsItemType.DRAMA: return 'text-red-400';
            case NewsItemType.TRANSFER: return 'text-blue-400';
            default: return 'text-cyan-400';
        }
    };
    return (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 hover:bg-gray-700/80 transition-all duration-300 flex space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gray-900/50 flex items-center justify-center ${getIconColor()}`}>
                <NewsIcon type={item.type} className="w-7 h-7" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-white mb-1">{renderFormattedText(item.title)}</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{renderFormattedText(item.content)}</p>
                <div className="text-xs text-gray-500 flex items-center justify-between border-t border-gray-700/50 pt-2">
                    <span className="font-semibold">{item.author}</span>
                    <span>{item.date}</span>
                </div>
            </div>
        </div>
    );
}

// --- Main Router Component ---

export const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
    switch (item.type) {
        case NewsItemType.CHAMPIONSHIP_WIN:
            return <ChampionshipNewsCard item={item} />;
        case NewsItemType.MVP:
            return <MvpNewsCard item={item} />;
        case NewsItemType.PROMOTION_RELEGATION:
            return <PromotionRelegationCard item={item} />;
        default:
            return <DefaultNewsCard item={item} />;
    }
};
