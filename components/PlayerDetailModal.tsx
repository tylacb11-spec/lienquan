import React, { useMemo } from 'react';
import { Player, TransferRecord, Hero } from '../types';
import { PlayerCard } from './PlayerCard';

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  heroPool: Hero[];
}

const TransferHistoryPanel: React.FC<{ history?: TransferRecord[] }> = ({ history }) => (
    <div className="mt-4 bg-gray-900/50 p-3 rounded-lg">
        <h3 className="text-lg font-bold text-cyan-300 mb-2">Lịch sử chuyển nhượng</h3>
        {(!history || history.length === 0) ? (
            <p className="text-gray-500 italic">Chưa có thông tin chuyển nhượng.</p>
        ) : (
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
                {[...history].reverse().map((record, index) => (
                    <div key={index} className="grid grid-cols-5 items-center bg-gray-800/60 p-2 rounded">
                        <span className="font-bold col-span-1">{record.year}</span>
                        <div className="flex items-center space-x-2 col-span-4 text-xs sm:text-sm">
                           <span className="truncate flex-1 text-right">{record.fromTeamName}</span>
                           <span className="text-cyan-400 font-bold text-lg">&rarr;</span>
                           <span className="truncate flex-1 text-left">{record.toTeamName}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const HeroStatsPanel: React.FC<{ stats?: Record<string, number>, heroPool: Hero[] }> = ({ stats, heroPool }) => {
    const mostPlayed = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats)
            .map(([heroId, count]) => {
                const hero = heroPool.find(h => h.id === heroId);
                return { hero, count };
            })
            .filter((item): item is { hero: Hero; count: number } => Boolean(item.hero))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [stats, heroPool]);

    return (
        <div className="mt-4 bg-gray-900/50 p-3 rounded-lg">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">Thống Kê Tướng</h3>
            {mostPlayed.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có dữ liệu thi đấu.</p>
            ) : (
                <div className="space-y-2">
                    {mostPlayed.map(({ hero, count }) => (
                        <div key={hero.id} className="flex items-center bg-gray-800/60 p-2 rounded-md">
                            <img src={hero.imageUrl} alt={hero.name} className="w-10 h-10 rounded-md mr-3" />
                            <div className="flex-1">
                                <p className="font-bold text-white">{hero.name}</p>
                                <p className="text-xs text-gray-400">{hero.role}</p>
                            </div>
                            <p className="text-lg font-bold text-cyan-300">{count} <span className="text-sm font-normal text-gray-400">lần</span></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose, heroPool }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-detail-heading"
    >
      <div 
        className="bg-gray-800/80 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
            <h2 id="player-detail-heading" className="text-xl font-bold text-cyan-300">Chi tiết tuyển thủ</h2>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors text-3xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
                aria-label="Đóng"
            >
                &times;
            </button>
        </header>
        <main className="p-4 overflow-y-auto">
           <PlayerCard player={player} />
           <HeroStatsPanel stats={player.heroStats} heroPool={heroPool} />
           <TransferHistoryPanel history={player.transferHistory} />
        </main>
      </div>
    </div>
  );
};