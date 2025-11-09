

import React, { useState, useMemo } from 'react';
import { Player, PlayerRole, Team } from '../../types';
import { RoleIcon } from '../icons/RoleIcons';

interface RosterSlotProps {
    role: PlayerRole;
    player: Player | null;
    onDrop: (role: PlayerRole, player: Player) => void;
    onRemove: (role: PlayerRole) => void;
}

const RosterSlot: React.FC<RosterSlotProps> = ({ role, player, onDrop, onRemove }) => {
    const [isHovering, setIsHovering] = useState(false);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(true);
    };
    
    const handleDragLeave = () => {
        setIsHovering(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
        const playerData = JSON.parse(e.dataTransfer.getData('player'));
        onDrop(role, playerData);
    };

    const isOffRole = player && player.role !== role;

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 relative
                ${isHovering ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-600 bg-gray-800/50'}
                ${isOffRole ? 'border-yellow-500' : ''}`}
        >
            <RoleIcon role={role} className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-sm font-bold text-gray-400">{role}</span>
            {player && (
                <div className="absolute inset-0 bg-gray-900/90 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                    <img src={player.avatarUrl} alt={player.ign} className="w-12 h-12 rounded-full mb-1 border-2 border-cyan-400" />
                    <p className="font-bold text-sm text-white truncate w-full">{player.ign}</p>
                    {isOffRole && <p className="text-xs text-yellow-400 font-semibold animate-pulse">Trái Sở Trường!</p>}
                    <button onClick={() => onRemove(role)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center">&times;</button>
                </div>
            )}
        </div>
    );
};

interface PlayerPoolCardProps {
    player: Player;
    isSelected: boolean;
}

const PlayerPoolCard: React.FC<PlayerPoolCardProps> = ({ player, isSelected }) => {
    const handleDragStart = (e: React.DragEvent, player: Player) => {
        e.dataTransfer.setData('player', JSON.stringify(player));
    };

    return (
        <div 
            draggable={!isSelected}
            onDragStart={(e) => handleDragStart(e, player)}
            className={`p-2 rounded-lg flex items-center space-x-3 transition-all duration-200
                ${isSelected ? 'bg-gray-700 opacity-50' : 'bg-gray-800 hover:bg-gray-700 cursor-grab'}`}
        >
            <img src={player.avatarUrl} alt={player.ign} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-bold">{player.ign}</p>
                <p className="text-xs text-gray-400">{player.role}</p>
            </div>
        </div>
    );
};


interface RosterSelectionScreenProps {
    team: Team;
    onConfirm: (selectedRoster: Player[]) => void;
}

export const RosterSelectionScreen: React.FC<RosterSelectionScreenProps> = ({ team, onConfirm }) => {
    const [starters, setStarters] = useState<Record<PlayerRole, Player | null>>({
        [PlayerRole.Top]: null,
        [PlayerRole.Jungle]: null,
        [PlayerRole.Mid]: null,
        [PlayerRole.Adc]: null,
        [PlayerRole.Support]: null,
    });
    
    const rolesOrder = [PlayerRole.Top, PlayerRole.Jungle, PlayerRole.Mid, PlayerRole.Adc, PlayerRole.Support];

    const selectedPlayerIds = useMemo(() => {
        return new Set(Object.values(starters).filter((p): p is Player => p !== null).map(p => p.id));
    }, [starters]);

    const isRosterComplete = useMemo(() => {
        return Object.values(starters).every(p => p !== null);
    }, [starters]);

    const handleDrop = (role: PlayerRole, player: Player) => {
        // If player is already in another slot, remove them
        let newStarters: Record<PlayerRole, Player | null> = { ...starters };
        // Fix: Replace for...in with a more type-safe method to find and remove the player from their old slot.
        const existingEntry = Object.entries(newStarters).find(([, p]) => p?.id === player.id);
        if (existingEntry) {
            newStarters[existingEntry[0] as PlayerRole] = null;
        }

        newStarters[role] = player;
        setStarters(newStarters);
    };
    
    const handleRemove = (role: PlayerRole) => {
        setStarters(prev => ({...prev, [role]: null}));
    };

    const handleAutoFill = () => {
        const availablePlayers = [...team.roster];
        const newStarters: Record<PlayerRole, Player | null> = {
            [PlayerRole.Top]: null,
            [PlayerRole.Jungle]: null,
            [PlayerRole.Mid]: null,
            [PlayerRole.Adc]: null,
            [PlayerRole.Support]: null,
        };

        // First pass: fill with on-role players
        for (const role of rolesOrder) {
            let bestPlayerForRole: Player | null = null;
            let bestPlayerIndex = -1;

            for (let i = 0; i < availablePlayers.length; i++) {
                const p = availablePlayers[i];
                if (p.role === role) {
                    if (!bestPlayerForRole || (p.mechanics + p.macro > bestPlayerForRole.mechanics + bestPlayerForRole.macro)) {
                        bestPlayerForRole = p;
                        bestPlayerIndex = i;
                    }
                }
            }
            
            if (bestPlayerForRole) {
                newStarters[role] = bestPlayerForRole;
                availablePlayers.splice(bestPlayerIndex, 1);
            }
        }

        // Second pass: fill empty slots with best remaining players
        for (const role of rolesOrder) {
            if (!newStarters[role] && availablePlayers.length > 0) {
                availablePlayers.sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
                newStarters[role] = availablePlayers.shift()!;
            }
        }
        setStarters(newStarters);
    };

    const handleConfirmClick = () => {
        if (!isRosterComplete) return;
        const finalRoster = rolesOrder
            .map(role => starters[role])
            .filter((player): player is Player => player !== null);
        onConfirm(finalRoster);
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-gray-700 animate-fade-in">
            <h1 className="text-3xl font-bold text-cyan-300 tracking-wider text-center mb-2">CHỌN ĐỘI HÌNH RA SÂN</h1>
            <p className="text-center text-gray-400 mb-6">Kéo và thả tuyển thủ hoặc dùng chức năng Tối ưu đội hình.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                    onClick={handleAutoFill}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                >
                    Pick Đội Nhanh
                </button>
                    <button
                    onClick={handleConfirmClick}
                    disabled={!isRosterComplete}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Xác Nhận Đội Hình
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-900/40 p-4 rounded-lg">
                    <h2 className="font-bold text-xl mb-4 text-gray-300">Danh sách đội</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {team.roster.map(p => <PlayerPoolCard key={p.id} player={p} isSelected={selectedPlayerIds.has(p.id)} />)}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {rolesOrder.map(role => (
                            <RosterSlot key={role} role={role} player={starters[role]} onDrop={handleDrop} onRemove={handleRemove} />
                        ))}
                    </div>
                    {/* Fix: Replaced complex and potentially unsafe off-role check with a clearer, more type-safe version using Object.entries. */}
                    {/* Fix: Add explicit type annotation for the destructured parameters to resolve 'unknown' type error. */}
                    {Object.entries(starters).some(([role, player]: [string, Player | null]) => player && player.role !== (role as PlayerRole)) && (
                        <div className="text-center p-2 bg-yellow-600/20 text-yellow-300 rounded-md text-sm font-semibold">
                            Cảnh báo: Có tuyển thủ thi đấu trái sở trường, chỉ số sẽ bị giảm 20%!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
