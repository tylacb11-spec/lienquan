import React, { useState, useMemo, useEffect } from 'react';
import { Team, Match, League, RegionName, Tier, GameState } from '../types';

interface StandingsPanelProps {
  leagues: League[];
  playerTeamId: string;
  selectedRegion: RegionName;
  onSelectRegion: (region: RegionName) => void;
  onSelectTeam: (teamId: string) => void;
  onShowPlayoffs: (region: RegionName) => void;
  gameState: GameState;
  currentWeek: number;
  playerTeamName: string;
}

const CompactMatchDisplay: React.FC<{ match: Match }> = ({ match }) => {
    return (
        <div className="flex items-center justify-between text-sm py-2 px-3 bg-gray-900/40 rounded-md">
            <div className="flex items-center space-x-2 flex-1 justify-end text-right">
                <span className="font-bold truncate">{match.teamA.name}</span>
                <img src={match.teamA.logoUrl} alt={match.teamA.name} className="w-5 h-5 rounded-full" />
            </div>
            <span className="font-bold text-cyan-400 mx-3">VS</span>
             <div className="flex items-center space-x-2 flex-1 justify-start text-left">
                <img src={match.teamB.logoUrl} alt={match.teamB.name} className="w-5 h-5 rounded-full" />
                <span className="font-bold truncate">{match.teamB.name}</span>
            </div>
        </div>
    );
};

const getFlagForRegion = (region: RegionName): string => {
    switch (region) {
        case RegionName.AOG: return '🇻🇳';
        case RegionName.KPL: return '🇨🇳';
        case RegionName.RPL: return '🇹🇭';
        case RegionName.GCS: return '🇹🇼';
        case RegionName.NA: return '🇺🇸';
        case RegionName.EU: return '🇪🇺';
        default: return '';
    }
};

export const StandingsPanel: React.FC<StandingsPanelProps> = ({ leagues, playerTeamId, selectedRegion, onSelectRegion, onSelectTeam, onShowPlayoffs, gameState, currentWeek, playerTeamName }) => {
  const playerTeam = leagues.flatMap(l => l.teams).find(t => t.id === playerTeamId);
  const playerRegion = playerTeam?.region;
  const playerTier = playerTeam?.tier || Tier.Tier1;

  const [selectedTier, setSelectedTier] = useState<Tier>(playerTier);
  
  // Reset tier selection when region changes
  useEffect(() => {
    if (selectedRegion === playerRegion) {
        setSelectedTier(playerTier);
    } else {
        setSelectedTier(Tier.Tier1);
    }
  }, [selectedRegion, playerRegion, playerTier]);

  const selectedLeague = leagues.find(l => l.region === selectedRegion && l.tier === selectedTier);

  if (!selectedLeague) {
    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-wider uppercase">BẢNG XẾP HẠNG</h2>
            <p className="text-gray-400">Không tìm thấy thông tin giải đấu.</p>
        </div>
    );
  }

  const sortedTeams = [...selectedLeague.teams].sort((a, b) => {
    if (a.wins !== b.wins) {
      return b.wins - a.wins;
    }
    const diffA = a.roundsWon - a.roundsLost;
    const diffB = b.roundsWon - b.roundsLost;
    if (diffA !== diffB) {
        return diffB - diffA;
    }
    return a.losses - b.losses;
  });

  const isPlayoffTime = gameState === GameState.Playoffs || gameState === GameState.MidSeasonBreak || gameState === GameState.OffSeason;

  // Upcoming match only shows for the player's league.
  const upcomingMatch = selectedRegion === playerRegion && selectedTier === playerTier
    ? selectedLeague.schedule
        .filter(m => !m.isPlayed && (m.teamA.name === playerTeamName || m.teamB.name === playerTeamName))
        .sort((a, b) => a.week - b.week)[0]
    : null;
    
  const getZoneIndicator = (index: number, tier: Tier): { class: string, text?: string } => {
        const numTeams = sortedTeams.length;
        if (tier === Tier.Tier1) {
            if (index < 4) return { class: 'border-l-4 border-yellow-400', text: 'Vào Playoff' };
            if (index >= numTeams - 2) return { class: 'border-l-4 border-red-500', text: 'Vòng Phân Hạng' };
        }
        if (tier === Tier.Tier2) {
            if (index < 2) return { class: 'border-l-4 border-green-400', text: 'Vòng Phân Hạng' };
        }
        return { class: '' };
    };

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider uppercase">BẢNG XẾP HẠNG</h2>
        {selectedLeague.tier === Tier.Tier1 && (
            <button 
                onClick={() => onShowPlayoffs(selectedRegion)}
                disabled={!isPlayoffTime}
                className="bg-yellow-600/50 text-white font-semibold px-3 py-1 text-sm rounded-md hover:bg-yellow-500/70 transition-colors disabled:bg-gray-600/30 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                Xem Playoff
            </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(RegionName).map(region => (
            <button
                key={region}
                onClick={() => onSelectRegion(region)}
                className={`flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    selectedRegion === region ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
                <span>{getFlagForRegion(region)}</span>
                <span>{region.split(' ')[0]}</span>
            </button>
        ))}
      </div>

       <div className="flex justify-center flex-wrap gap-2 mb-4 bg-gray-900/40 p-2 rounded-md">
        {Object.values(Tier).map(tier => (
            <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
                    selectedTier === tier ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
                {tier}
            </button>
        ))}
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 text-sm font-semibold text-gray-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Đội</div>
          <div className="col-span-2 text-center">Thắng</div>
          <div className="col-span-2 text-center">Bại</div>
          <div className="col-span-2 text-center">HS</div>
        </div>
        {sortedTeams.map((team, index) => {
          const isPlayerTeam = team.id === playerTeamId;
          const zone = getZoneIndicator(index, selectedLeague.tier);
          const differential = team.roundsWon - team.roundsLost;

          return (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className={`
                w-full grid grid-cols-12 gap-2 items-center px-2 sm:px-4 py-2 rounded-lg
                transition-all duration-200 text-left
                ${isPlayerTeam ? 'bg-cyan-800/50 hover:bg-cyan-700/60' : 'bg-gray-700/30 hover:bg-gray-600/50'}
                ${zone.class}
              `}
            >
              <div className="col-span-1 text-center font-bold">{index + 1}</div>
              <div className="col-span-5 flex items-center space-x-3">
                <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="truncate">{team.name}</span>
              </div>
              <div className="col-span-2 text-center font-semibold text-green-400">{team.wins}</div>
              <div className="col-span-2 text-center font-semibold text-red-400">{team.losses}</div>
              <div className={`col-span-2 text-center font-semibold ${differential > 0 ? 'text-green-300' : differential < 0 ? 'text-red-300' : 'text-gray-300'}`}>
                {differential > 0 ? `+${differential}` : differential}
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-3 italic text-center space-y-1">
          <p className="flex items-center justify-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>Top 4 Hạng 1 vào Playoff.</p>
          <p className="flex items-center justify-center"><span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>Top 2 Hạng 2 thi đấu Vòng Phân Hạng.</p>
          <p className="flex items-center justify-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>2 đội cuối Hạng 1 thi đấu Vòng Phân Hạng.</p>
      </div>

      {upcomingMatch && (
        <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-3 text-cyan-300 tracking-wider text-center">TRẬN ĐẤU TIẾP THEO (TUẦN {upcomingMatch.week})</h3>
            <CompactMatchDisplay match={upcomingMatch} />
        </div>
      )}
    </div>
  );
};