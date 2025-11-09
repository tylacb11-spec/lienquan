import React, { useState, useMemo } from 'react';
import { Team, Player, League, Tier, PlayerRole } from '../types';
import { ScoutedPlayerCard } from './ScoutedPlayerCard';
import { RoleIcon } from './icons/RoleIcons';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

interface ScoutingViewProps {
  playerTeam: Team;
  allLeagues: League[];
  freeAgents: Player[];
  onBack: () => void;
  scoutedPlayerIds: Set<string>;
  onScoutPlayer: (playerId: string, cost: number) => void;
  onStartNegotiation: (player: Player) => void;
  onReleasePlayer: (playerId: string) => void;
  isTransferWindowOpen: boolean;
}

const FilterButton: React.FC<{ label: string; onClick: () => void; isActive: boolean; disabled?: boolean; }> = ({ label, onClick, isActive, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
            isActive && !disabled ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        } disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
    >
        {label}
    </button>
);

const RosterManagementCard: React.FC<{ player: Player, onRelease: () => void, canRelease: boolean, rosterSize: number }> = ({ player, onRelease, canRelease, rosterSize }) => {
    const handleReleaseClick = () => {
        onRelease();
    };

    let title = "Thanh lý hợp đồng";
    if (!canRelease) title = "Chỉ có thể thanh lý trong kỳ chuyển nhượng.";
    else if (rosterSize <= 5) title = "Đội hình phải có ít nhất 5 người.";

    return (
        <div className="bg-gray-800/70 p-3 rounded-md flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <img src={player.avatarUrl} alt={player.ign} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-bold text-lg">{player.ign}</p>
                    <p className="text-sm text-gray-400">{player.role}</p>
                </div>
                <div className="text-sm">
                    <p className="text-gray-400">Lương: <span className="font-semibold text-white">{formatCurrency(player.contract?.salary || 0)}/năm</span></p>
                    <p className="text-gray-400">Hết hạn: <span className="font-semibold text-white">{player.contract?.endDate}</span></p>
                </div>
            </div>
            <button
                onClick={handleReleaseClick}
                disabled={!canRelease || rosterSize <= 5}
                className="bg-red-600/50 text-white font-semibold px-4 py-2 text-sm rounded-md hover:bg-red-500/70 transition-colors disabled:bg-gray-600/30 disabled:text-gray-400 disabled:cursor-not-allowed"
                title={title}
            >
                Thanh lý
            </button>
        </div>
    )
};

export const ScoutingView: React.FC<ScoutingViewProps> = ({ playerTeam, allLeagues, freeAgents, onBack, scoutedPlayerIds, onScoutPlayer, onStartNegotiation, onReleasePlayer, isTransferWindowOpen }) => {
    const [internalTab, setInternalTab] = useState<'search' | 'roster'>('search');
    const [filterTier, setFilterTier] = useState<Tier | 'all'>('all');
    const [filterRole, setFilterRole] = useState<PlayerRole | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'free_agent'>('all');

    const allPlayers = useMemo(() => {
        const leaguePlayers = allLeagues
            .flatMap(league => league.teams)
            .flatMap(team => team.roster.map(player => ({ ...player, teamName: team.name, teamLogo: team.logoUrl, teamTier: team.tier })))
            .filter(p => p.contract?.teamId !== playerTeam.id);
        
        // Fix: Replaced non-existent `Tier.Tier3` with `null`. This resolves the TypeScript error and ensures free agents are correctly handled by the tier filter.
        const freeAgentPlayers = freeAgents.map(player => ({...player, teamName: 'Tự do', teamLogo: 'https://api.dicebear.com/8.x/initials/svg?seed=FA', teamTier: null })); 

        return [...leaguePlayers, ...freeAgentPlayers];
    }, [allLeagues, playerTeam.id, freeAgents]);

    const filteredPlayers = useMemo(() => {
        return allPlayers.filter(p => {
            const roleMatch = filterRole === 'all' || p.role === filterRole;
    
            if (filterStatus === 'free_agent') {
                return p.contract === null && roleMatch;
            }
    
            const tierMatch = filterTier === 'all' || p.teamTier === filterTier;
            return tierMatch && roleMatch;
    
        }).sort((a,b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    }, [allPlayers, filterTier, filterRole, filterStatus]);

    const SCOUTING_COST = 5000;

    const renderSearchTab = () => (
        <>
             <div className="space-y-4">
                 <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Lọc theo Tình Trạng</h3>
                    <div className="flex flex-wrap gap-2">
                        <FilterButton label="Tất cả" onClick={() => setFilterStatus('all')} isActive={filterStatus === 'all'} />
                        <FilterButton label="Tuyển thủ Tự do" onClick={() => setFilterStatus('free_agent')} isActive={filterStatus === 'free_agent'} />
                    </div>
                </div>
                <div>
                    <h3 className={`text-lg font-semibold mb-2 ${filterStatus === 'free_agent' ? 'text-gray-500' : 'text-gray-300'}`}>
                        Lọc theo Hạng {filterStatus === 'free_agent' && <span className="text-xs italic">(Vô hiệu hóa)</span>}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <FilterButton label="Tất cả" onClick={() => setFilterTier('all')} isActive={filterTier === 'all'} disabled={filterStatus === 'free_agent'} />
                        {Object.values(Tier).map(tier => (
                            <FilterButton key={tier} label={tier} onClick={() => setFilterTier(tier)} isActive={filterTier === tier} disabled={filterStatus === 'free_agent'} />
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Lọc theo Vị Trí</h3>
                    <div className="flex flex-wrap gap-2">
                        <FilterButton label="Tất cả" onClick={() => setFilterRole('all')} isActive={filterRole === 'all'} />
                        {Object.values(PlayerRole).map(role => (
                            <FilterButton key={role} label={role} onClick={() => setFilterRole(role)} isActive={filterRole === role} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                    <ScoutedPlayerCard
                        key={player.id}
                        player={player}
                        isScouted={scoutedPlayerIds.has(player.id)}
                        onScout={() => onScoutPlayer(player.id, SCOUTING_COST)}
                        scoutingCost={SCOUTING_COST}
                        playerBudget={playerTeam.finances.budget}
                        onStartNegotiation={onStartNegotiation}
                    />
                )) : <p className="text-gray-400 italic col-span-full text-center py-8">Không tìm thấy tuyển thủ nào phù hợp.</p>}
            </div>
        </>
    );

    const renderRosterTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3">Lời Đề Nghị Từ Đội Khác</h3>
                <div className="bg-gray-900/50 p-6 rounded-lg text-center">
                    <p className="text-gray-500 italic">Hiện chưa có lời đề nghị nào cho tuyển thủ của bạn.</p>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-3">Quản Lý Đội Hình Hiện Tại</h3>
                <div className="space-y-3">
                    {playerTeam.roster.sort((a,b) => {
                        const roleOrder = [PlayerRole.Top, PlayerRole.Jungle, PlayerRole.Mid, PlayerRole.Adc, PlayerRole.Support];
                        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
                    }).map(player => (
                        <RosterManagementCard 
                            key={player.id} 
                            player={player} 
                            onRelease={() => onReleasePlayer(player.id)} 
                            canRelease={isTransferWindowOpen} 
                            rosterSize={playerTeam.roster.length}
                        />
                    ))}
                     {!isTransferWindowOpen && <p className="text-xs text-yellow-400 italic mt-2 text-center">Chức năng thanh lý chỉ mở trong kỳ chuyển nhượng.</p>}
                </div>
            </div>
        </div>
    );

    return (
         <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6">
            <header className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">TRUNG TÂM CHUYỂN NHƯỢỢNG</h2>
                <button 
                    onClick={onBack} 
                    className="bg-gray-700/50 px-4 py-2 rounded-md hover:bg-gray-600/70 transition-colors text-gray-200 font-semibold flex items-center"
                >
                    <span className="mr-2 text-xl">&larr;</span> Quay lại
                </button>
            </header>

            {/* Internal Tabs */}
            <div className="flex border-b border-gray-700">
                <button onClick={() => setInternalTab('search')} className={`px-4 py-2 font-semibold transition-colors ${internalTab === 'search' ? 'text-cyan-300 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                    Tìm Kiếm
                </button>
                <button onClick={() => setInternalTab('roster')} className={`px-4 py-2 font-semibold transition-colors ${internalTab === 'roster' ? 'text-cyan-300 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                    Đội Của Bạn
                </button>
            </div>

            {internalTab === 'search' && renderSearchTab()}
            {internalTab === 'roster' && renderRosterTab()}
        </div>
    );
};
