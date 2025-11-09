import React, { useState } from 'react';
import { Player, getDisplayRank, PlayerRole } from '../types';
import { PotentialDisplay } from './PotentialDisplay';
import { RoleIcon } from './icons/RoleIcons';

interface PlayerTokenProps {
    player: Player;
    onSelect: (player: Player) => void;
    onRelease: (playerId: string) => void;
    canRelease: boolean;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ player, onSelect, onRelease, canRelease }) => {
    const handleReleaseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRelease(player.id);
    };

    return (
        <div 
            className="group relative flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 w-24 sm:w-28 text-center hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]"
        >
            {canRelease && (
                <button
                    onClick={handleReleaseClick}
                    className="absolute top-1 right-1 z-10 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label={`Thanh lý ${player.ign}`}
                    title="Thanh lý hợp đồng"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            )}
             <div
                onClick={() => onSelect(player)}
                className="w-full h-full flex flex-col items-center cursor-pointer"
                aria-label={`Xem chi tiết ${player.ign}`}
            >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-1">
                     <img src={player.avatarUrl} alt={player.ign} className="w-full h-full rounded-full object-cover border-2 border-gray-600 group-hover:border-cyan-400 transition-colors" />
                     <PotentialDisplay rank={getDisplayRank(player)} />
                     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 p-1.5 rounded-full border border-gray-700">
                        <RoleIcon role={player.role} className="w-5 h-5 text-cyan-400" />
                     </div>
                </div>
                <h3 className="text-sm font-bold tracking-wider text-white truncate w-full">{player.ign}</h3>
                <p className="text-xs text-gray-400">{player.role}</p>
            </div>
        </div>
    );
};

interface RosterPanelProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onReleasePlayer: (playerId: string) => void;
  isTransferWindowOpen: boolean;
}

export const RosterPanel: React.FC<RosterPanelProps> = ({ players, onSelectPlayer, onReleasePlayer, isTransferWindowOpen }) => {
  const [filterRole, setFilterRole] = useState<PlayerRole | 'all'>('all');

  const roleOrder = [PlayerRole.Top, PlayerRole.Jungle, PlayerRole.Mid, PlayerRole.Adc, PlayerRole.Support];

  const filteredAndSortedPlayers = players
    .filter(player => filterRole === 'all' || player.role === filterRole)
    .sort((a, b) => {
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    });

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-wider">ĐỘI HÌNH CHÍNH</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              filterRole === 'all' ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          Tất cả
        </button>
        {roleOrder.map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            title={`Lọc theo vị trí ${role}`}
            aria-label={`Lọc theo vị trí ${role}`}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                filterRole === role ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <RoleIcon role={role} className="w-4 h-4" />
            <span className="hidden sm:inline">{role}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center sm:justify-start items-start gap-4 flex-wrap min-h-[100px]">
        {filteredAndSortedPlayers.length > 0 ? (
            filteredAndSortedPlayers.map(player => (
                <PlayerToken key={player.id} player={player} onSelect={onSelectPlayer} onRelease={onReleasePlayer} canRelease={isTransferWindowOpen} />
            ))
        ) : (
             <p className="text-gray-400 italic text-center w-full py-8">Không có tuyển thủ nào cho vị trí này.</p>
        )}
      </div>
       {!isTransferWindowOpen && <p className="text-center text-xs text-yellow-400 mt-4 italic">Chức năng thanh lý chỉ mở trong kỳ chuyển nhượng.</p>}
       {players.length <= 5 && <p className="text-center text-xs text-yellow-400 mt-4 italic">Không thể thanh lý khi đội hình có 5 người hoặc ít hơn.</p>}
    </div>
  );
};