import React from 'react';
import { RosterPanel } from './RosterPanel';
import { SchedulePanel } from './SchedulePanel';
import { ManagementPanel } from './ManagementPanel';
import { StandingsPanel } from './StandingsPanel';
import { NewsPanel } from './NewsPanel';
import { Team, Player, Match, League, GameState, RegionName, NewsItem } from '../types';
import { InternationalTournamentPanel } from './InternationalTournamentPanel';
import { GroupStagePanel } from './GroupStagePanel';
import { ScoutingView } from './ScoutingView';

export type DashboardTab = 'overview' | 'league' | 'roster' | 'transfers';

const TabButton: React.FC<{ tabId: DashboardTab, activeTab: DashboardTab, onClick: (tab: DashboardTab) => void, children: React.ReactNode, disabled?: boolean }> = ({ tabId, activeTab, onClick, children, disabled }) => (
    <button
        onClick={() => onClick(tabId)}
        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-4 ${
            activeTab === tabId ? 'text-cyan-300 border-cyan-400' : 'text-gray-400 border-transparent hover:bg-gray-700/50'
        } disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
        aria-selected={activeTab === tabId}
        role="tab"
        disabled={disabled}
    >
        {children}
    </button>
);


interface DashboardTabsProps {
    managementPanelProps: React.ComponentProps<typeof ManagementPanel>;
    playerTeam: Team;
    leagues: League[];
    news: NewsItem[];
    currentWeek: number;
    gameState: GameState;
    playerTeamId: string;
    displayedLeagueRegion: RegionName;
    setDisplayedLeagueRegion: (region: RegionName) => void;
    onSelectPlayer: (player: Player) => void;
    onSelectTeam: (teamId: string) => void;
    onShowPlayoffs: (region: RegionName) => void;
    msiData: { participants: Team[], groupMatches: Match[], knockoutMatches?: Match[], champion?: Team } | null;
    onReleasePlayer: (playerId: string) => void;
    isTransferWindowOpen: boolean;
    championTeamIds: string[];
    activeTab: DashboardTab;
    setActiveTab: (tab: DashboardTab) => void;
    freeAgents: Player[];
    scoutedPlayerIds: Set<string>;
    onScoutPlayer: (playerId: string, cost: number) => void;
    onStartNegotiation: (player: Player) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = (props) => {
    const { 
        managementPanelProps, 
        playerTeam, 
        leagues, 
        news, 
        currentWeek, 
        gameState, 
        playerTeamId, 
        displayedLeagueRegion, 
        setDisplayedLeagueRegion, 
        onSelectPlayer,
        onSelectTeam,
        onShowPlayoffs,
        msiData,
        onReleasePlayer,
        isTransferWindowOpen,
        championTeamIds,
        activeTab,
        setActiveTab,
        freeAgents,
        scoutedPlayerIds,
        onScoutPlayer,
        onStartNegotiation,
    } = props;
    
    const playerLeague = leagues.find(l => l.region === playerTeam.region && l.tier === playerTeam.tier);

    const renderContent = () => {
        switch (activeTab) {
            case 'roster':
                return (
                    <RosterPanel
                        players={playerTeam.roster}
                        onSelectPlayer={onSelectPlayer}
                        onReleasePlayer={onReleasePlayer}
                        isTransferWindowOpen={isTransferWindowOpen}
                    />
                );
            case 'league':
                return (
                    <>
                        {leagues.length > 0 && (
                            <StandingsPanel 
                              leagues={leagues}
                              playerTeamId={playerTeamId}
                              selectedRegion={displayedLeagueRegion}
                              onSelectRegion={setDisplayedLeagueRegion}
                              onSelectTeam={onSelectTeam}
                              currentWeek={currentWeek}
                              playerTeamName={playerTeam.name}
                              onShowPlayoffs={onShowPlayoffs}
                              gameState={gameState}
                            />
                        )}
                    </>
                );
             case 'transfers':
                return (
                    <ScoutingView
                        playerTeam={playerTeam}
                        allLeagues={leagues}
                        freeAgents={freeAgents}
                        onBack={() => setActiveTab('overview')}
                        scoutedPlayerIds={scoutedPlayerIds}
                        onScoutPlayer={onScoutPlayer}
                        onStartNegotiation={onStartNegotiation}
                        onReleasePlayer={onReleasePlayer}
                        isTransferWindowOpen={isTransferWindowOpen}
                    />
                );
            case 'overview':
            default:
                return (
                    <>
                        {playerLeague && gameState === GameState.RegularSeason && (
                            <SchedulePanel 
                                schedule={playerLeague.schedule} 
                                currentWeek={currentWeek} 
                                playerTeamName={playerTeam.name} 
                            />
                        )}
                         {gameState === GameState.MSI && msiData && (
                            <div className="space-y-4">
                                <GroupStagePanel teams={msiData.participants} matches={msiData.groupMatches} championTeamIds={championTeamIds} />
                                {msiData.knockoutMatches && (
                                    <InternationalTournamentPanel title="MSI - Vòng Loại Trực Tiếp" matches={msiData.knockoutMatches} champion={msiData.champion} championTeamIds={championTeamIds} />
                                )}
                            </div>
                        )}
                        <NewsPanel news={news} />
                        <div className="lg:hidden">
                            <ManagementPanel {...managementPanelProps} />
                        </div>
                    </>
                );
        }
    };

    return (
        <div>
            <div className="flex justify-around bg-gray-800/50 rounded-t-lg border-b-2 border-gray-700" role="tablist">
                <TabButton tabId="overview" activeTab={activeTab} onClick={setActiveTab}>Tổng Quan</TabButton>
                <TabButton tabId="league" activeTab={activeTab} onClick={setActiveTab}>Giải Đấu</TabButton>
                <TabButton tabId="roster" activeTab={activeTab} onClick={setActiveTab}>Đội Hình</TabButton>
                <TabButton tabId="transfers" activeTab={activeTab} onClick={setActiveTab} disabled={!isTransferWindowOpen}>Chuyển Nhượng</TabButton>
            </div>
            <div className="py-4 space-y-4" role="tabpanel">
                <div key={activeTab} className="animate-fade-in space-y-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};