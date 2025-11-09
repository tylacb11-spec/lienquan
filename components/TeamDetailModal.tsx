import React from 'react';
import { Team } from '../types';
import { PlayerCard } from './PlayerCard';
import { TrophyIcon } from './icons/TrophyIcon';

const TrophyRoomPanel: React.FC<{ trophies: string[] }> = ({ trophies }) => (
    <div className="mt-6">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Phòng Cúp</h3>
        {trophies.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có danh hiệu nào.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trophies.map((trophy, index) => (
                    <div key={index} className="flex items-center bg-gray-900/50 p-2 rounded-md">
                        <TrophyIcon className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                        <p className="text-sm text-yellow-200">{trophy}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const StatDisplay: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-cyan-300">{value}</p>
    </div>
);

interface TeamDetailModalProps {
  team: Team;
  onClose: () => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800/80 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-lg md:max-w-3xl lg:max-w-6xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <img src={team.logoUrl} alt={team.name} className="w-12 h-12 rounded-full"/>
            <div>
                <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">{team.name}</h2>
                <p className="text-sm text-gray-400">{team.region} - {team.tier}</p>
            </div>
             <div className="flex items-center space-x-6 pl-6">
                <StatDisplay label="Fan" value={team.fanCount?.toLocaleString('vi-VN') || 0} />
                <StatDisplay label="Danh Tiếng" value={Math.round(team.reputation)} />
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors text-3xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
            aria-label="Đóng"
          >
            &times;
          </button>
        </header>
        <main className="p-4 sm:p-6 overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {team.roster.sort((a, b) => {
              const roleOrder = ['Đường Tà Thần', 'Đi Rừng', 'Đường Giữa', 'Xạ Thủ', 'Trợ Thủ'];
              return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
            }).map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
           <TrophyRoomPanel trophies={team.trophyRoom} />
        </main>
      </div>
    </div>
  );
};