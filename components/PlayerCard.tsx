import React, { useState, useEffect, useRef } from 'react';
import { Player, PlayerRole, PotentialRank, PersonalityTrait, getDisplayRank } from '../types';
import { RoleIcon } from './icons/RoleIcons';
import { TrophyIcon } from './icons/TrophyIcon';
import { PotentialDisplay } from './PotentialDisplay';

const UpArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.28 9.68a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" /></svg>
);
const DownArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.97-4.07a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 4.07V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
);


interface StatBarProps {
  label: string;
  value: number;
  colorClass: string;
  description: string;
  trend: 'up' | 'down' | null;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, colorClass, description, trend }) => (
  <div className="relative group w-full px-1">
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg border border-cyan-500/30">
      <p className="font-bold text-cyan-300 mb-1">{label}</p>
      {description}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
    </div>
    
    <div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold text-gray-300 mb-1">
      <span>{label}</span>
      <span className="flex items-center">
        {trend === 'up' && <UpArrowIcon className="w-3 h-3 text-green-400 mr-0.5" />}
        {trend === 'down' && <DownArrowIcon className="w-3 h-3 text-red-400 mr-0.5" />}
        {Math.round(value)}
      </span>
    </div>
    <div className="h-2 w-full bg-gray-700 rounded-full">
      <div
        className={`h-2 rounded-full ${colorClass}`}
        style={{ width: `${Math.round(value)}%` }}
      ></div>
    </div>
  </div>
);

const TraitBadge: React.FC<{ trait: PersonalityTrait }> = ({ trait }) => {
    let color = 'bg-gray-600 text-gray-200';
    switch (trait) {
        case PersonalityTrait.Star: color = 'bg-yellow-500/80 text-white'; break;
        case PersonalityTrait.HardWorker: color = 'bg-blue-500/80 text-white'; break;
        case PersonalityTrait.Captain: color = 'bg-green-500/80 text-white'; break;
        case PersonalityTrait.Veteran: color = 'bg-purple-500/80 text-white'; break;
        case PersonalityTrait.Toxic: color = 'bg-red-500/80 text-white'; break;
    }
    return (
        <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${color}`}>
            {trait}
        </span>
    );
};

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [statChanges, setStatChanges] = useState<Record<string, 'up' | 'down' | null>>({});
  // FIX: The call `useRef<Player>()` is invalid because when a generic type is provided, an initial value is expected.
  // The fix is to provide an initial value of `null` and adjust the type to `Player | null`.
  const prevPlayerRef = useRef<Player | null>(null);

  useEffect(() => {
    const prevPlayer = prevPlayerRef.current;
    if (prevPlayer) {
      const changes: Record<string, 'up' | 'down' | null> = {};
      const threshold = 1; // Minimum change to show an arrow
      let hasChanges = false;

      (['mechanics', 'macro', 'morale', 'form', 'stamina'] as const).forEach(stat => {
          const diff = player[stat] - prevPlayer[stat];
          if (Math.abs(diff) >= threshold) {
              changes[stat] = diff > 0 ? 'up' : 'down';
              hasChanges = true;
          } else {
              changes[stat] = null;
          }
      });

      if (hasChanges) {
        setIsAnimating(true);
        setStatChanges(changes);
        const timer = setTimeout(() => {
            setIsAnimating(false);
            setStatChanges({});
        }, 1200); // Matches CSS animation duration
        return () => clearTimeout(timer);
      }
    }
    prevPlayerRef.current = player;
  }, [player]);
    
  const getRoleColor = (role: PlayerRole) => {
    switch (role) {
      case PlayerRole.Top: return 'border-red-500';
      case PlayerRole.Jungle: return 'border-green-500';
      case PlayerRole.Mid: return 'border-blue-500';
      case PlayerRole.Adc: return 'border-yellow-500';
      case PlayerRole.Support: return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 border-b-4 ${getRoleColor(player.role)} transition-all duration-300 hover:bg-gray-700/70 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col hover:-translate-y-2 hover:scale-[1.02]`}>
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-1 sm:mb-2">
        <img src={player.avatarUrl} alt={player.ign} className={`w-full h-full rounded-full object-cover border-2 border-gray-600 ${isAnimating ? 'animate-stat-update' : ''}`} />
        <PotentialDisplay rank={getDisplayRank(player)} />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 p-1 sm:p-1.5 rounded-full">
          <RoleIcon role={player.role} className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
        </div>
      </div>

      <div className="text-center flex-1">
        <h3 className="text-base sm:text-lg font-bold tracking-wider text-white truncate">{player.ign}</h3>
        <p className="text-xs text-gray-400">{player.role}</p>
        <p className="text-[11px] sm:text-xs text-gray-500">Tuổi: {player.age.toFixed(0)} | QT: {player.nationality}</p>
      </div>
      
       <div className="my-1.5 sm:my-2 flex flex-wrap gap-1 justify-center items-center">
            {player.traits.map(trait => <TraitBadge key={trait} trait={trait} />)}
            {player.mvpAwards > 0 && (
                <div className="flex items-center space-x-1 bg-cyan-800/60 px-2 py-0.5 rounded-full" title={`${player.mvpAwards} lần đoạt MVP`}>
                    <TrophyIcon className="w-3 h-3 text-cyan-300" />
                    <span className="text-xs font-bold text-cyan-200">{player.mvpAwards}</span>
                </div>
            )}
        </div>
      
      <div className="mt-2 space-y-3 sm:space-y-4 flex-grow">
        <StatBar label="Kỹ năng" value={player.mechanics} trend={statChanges.mechanics} colorClass="bg-gradient-to-r from-sky-500 to-cyan-400" description="Khả năng xử lý cá nhân, phản xạ và độ chính xác khi sử dụng tướng." />
        <StatBar label="Chiến thuật" value={player.macro} trend={statChanges.macro} colorClass="bg-gradient-to-r from-violet-500 to-purple-400" description="Sự am hiểu về trận đấu, khả năng di chuyển, kiểm soát mục tiêu và ra quyết định lớn." />
        <StatBar label="Tinh thần" value={player.morale} trend={statChanges.morale} colorClass="bg-gradient-to-r from-amber-500 to-yellow-400" description="Ý chí thi đấu và sự tự tin. Bị ảnh hưởng bởi kết quả và các sự kiện." />
        <StatBar label="Phong độ" value={player.form} trend={statChanges.form} colorClass="bg-gradient-to-r from-lime-500 to-green-400" description="Trạng thái thi đấu hiện tại. Dao động qua các tuần nhưng sẽ quay về mức trung bình." />
        <StatBar label="Thể Lực" value={player.stamina} trend={statChanges.stamina} colorClass="bg-gradient-to-r from-red-500 to-orange-400" description="Sức bền của tuyển thủ. Giảm dần qua các trận đấu và cần thời gian để hồi phục." />
      </div>

      {player.achievements && player.achievements.length > 0 && (
        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-gray-700/50">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2 text-center">Thành Tích</h4>
          <ul className="space-y-1 max-h-14 sm:max-h-16 overflow-y-auto pr-2">
            {player.achievements.slice(0).reverse().map((achievement, index) => (
              <li key={index} className="flex items-start text-[11px] sm:text-xs text-yellow-300/90 leading-tight">
                <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0 text-yellow-400" />
                <span className="flex-1">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
