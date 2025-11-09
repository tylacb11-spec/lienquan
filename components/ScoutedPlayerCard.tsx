import React from 'react';
import { Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { RoleIcon } from './icons/RoleIcons';
import { PotentialDisplay } from './PotentialDisplay';

interface ScoutedPlayerCardProps {
  player: Player & { teamName?: string; teamLogo?: string };
  isScouted: boolean;
  onScout: () => void;
  scoutingCost: number;
  playerBudget: number;
  onStartNegotiation: (player: Player) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

export const ScoutedPlayerCard: React.FC<ScoutedPlayerCardProps> = ({ player, isScouted, onScout, scoutingCost, playerBudget, onStartNegotiation }) => {
  if (isScouted) {
    return (
        <div>
            <PlayerCard player={player} />
            <div className="mt-2">
                 <button 
                    onClick={() => onStartNegotiation(player)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                 >
                    {player.contract ? 'Mua Lại Hợp Đồng' : 'Ký Hợp Đồng'}
                </button>
            </div>
        </div>
    );
  }

  const getHint = (p: Player): string => {
    const overall = p.mechanics + p.macro;
    if (p.potential === 'S' || p.potential === 'A') {
        if (p.mechanics > 88) return "Thiên tài Kỹ năng";
        if (p.macro > 88) return "Bộ óc Chiến thuật";
    }
    if (overall > 170) return "Cực kỳ Toàn diện";
    if (p.mechanics > 85) return "Kỹ năng Tốt";
    if (p.macro > 85) return "Tư duy Sắc bén";
    return "Tiềm năng Hứa hẹn";
  };

  const hint = getHint(player);
  const canAffordScout = playerBudget >= scoutingCost;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border-b-4 border-gray-600 flex flex-col h-full">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <img src={player.avatarUrl} alt={player.ign} className="w-full h-full rounded-full object-cover border-2 border-gray-600 filter blur-sm brightness-50 saturate-200" />
        <PotentialDisplay rank={player.potential} />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 p-1.5 rounded-full">
          <RoleIcon role={player.role} className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      <div className="text-center flex-1">
        <h3 className="text-lg font-bold tracking-wider text-white truncate">{player.ign}</h3>
        <p className="text-xs text-gray-400">{player.role}</p>
        <div className="flex items-center justify-center space-x-2 mt-1">
            <img src={player.teamLogo} alt={player.teamName} className="w-4 h-4 rounded-full"/>
            <p className="text-xs text-gray-500">{player.teamName || 'Tự do'}</p>
        </div>
      </div>
      
      <div className="mt-3 flex-grow flex flex-col justify-center items-center text-center p-4 bg-gray-900/40 rounded-md">
        <p className="text-lg font-bold text-cyan-400">{hint}</p>
        <p className="text-sm text-gray-500">Chỉ số chi tiết bị ẩn</p>
      </div>
      
       <div className="mt-3">
            <button 
                onClick={onScout}
                disabled={!canAffordScout}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold py-2 px-3 rounded-lg hover:from-cyan-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700"
            >
                Thu thập thông tin
                <span className="block text-xs font-normal">{formatCurrency(scoutingCost)}</span>
            </button>
        </div>
    </div>
  );
};