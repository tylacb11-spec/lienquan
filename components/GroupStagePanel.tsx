import React from 'react';
import { Team, Match } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

interface StandingsTableProps {
    title: string;
    teams: Team[];
    matches: Match[];
    championTeamIds: string[];
}

const MatchDisplay: React.FC<{ match: Match }> = ({ match }) => {
    const resultText = match.isPlayed && match.result ? `${match.result.scoreA} - ${match.result.scoreB}` : 'VS';
    return (
        <div className="flex items-center justify-between text-xs py-1 px-2 bg-gray-800/50 rounded-md">
            <div className="flex items-center space-x-1 flex-1 justify-end text-right">
                <span className="font-semibold truncate">{match.teamA.name}</span>
                <img src={match.teamA.logoUrl} alt={match.teamA.name} className="w-4 h-4 rounded-full" />
            </div>
            <span className={`font-bold text-sm mx-2 ${match.isPlayed ? 'text-white' : 'text-gray-500'}`}>{resultText}</span>
            <div className="flex items-center space-x-1 flex-1 justify-start text-left">
                <img src={match.teamB.logoUrl} alt={match.teamB.name} className="w-4 h-4 rounded-full" />
                <span className="font-semibold truncate">{match.teamB.name}</span>
            </div>
        </div>
    );
};


const StandingsTable: React.FC<StandingsTableProps> = ({ title, teams, matches, championTeamIds }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">{title}</h3>
        <div className="space-y-1">
             <div className="grid grid-cols-12 gap-2 px-2 sm:px-4 py-2 text-sm font-semibold text-gray-400">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Đội</div>
                <div className="col-span-2 text-center">Thắng</div>
                <div className="col-span-2 text-center">Bại</div>
            </div>
            {teams.map((team, index) => {
                const isPlayoffZone = index < 4;
                const borderClass = isPlayoffZone ? 'border-l-4 border-yellow-400' : '';
                const isChampion = championTeamIds.includes(team.id);
                return (
                    <div
                        key={team.id}
                        className={`grid grid-cols-12 gap-2 items-center px-2 sm:px-4 py-2 rounded-lg bg-gray-700/30 ${borderClass}`}
                    >
                        <div className="col-span-1 text-center font-bold">{index + 1}</div>
                        <div className="col-span-7 flex items-center space-x-2">
                            {isChampion && <TrophyIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" title="Đương kim vô địch khu vực" />}
                            <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="truncate">{team.name}</span>
                        </div>
                        <div className="col-span-2 text-center font-semibold text-green-400">{team.msiWins}</div>
                        <div className="col-span-2 text-center font-semibold text-red-400">{team.msiLosses}</div>
                    </div>
                );
            })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-gray-300 mb-2 text-center">Kết quả Vòng Bảng</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {matches.filter(m => m.isPlayed).sort((a,b) => a.id.localeCompare(b.id)).map(match => (
                    <MatchDisplay key={match.id} match={match} />
                ))}
            </div>
        </div>
    </div>
);


interface GroupStagePanelProps {
  teams: Team[];
  matches: Match[];
  championTeamIds: string[];
}

export const GroupStagePanel: React.FC<GroupStagePanelProps> = ({ teams, matches, championTeamIds }) => {
    const groupAMatches = matches.filter(m => m.group === 'A');
    const groupBMatches = matches.filter(m => m.group === 'B');
    
    const getTeamsFromMatches = (groupMatches: Match[]): Team[] => {
        const teamIds = new Set<string>();
        groupMatches.forEach(m => {
            teamIds.add(m.teamA.id);
            teamIds.add(m.teamB.id);
        });
        return teams.filter(t => teamIds.has(t.id));
    }

    const groupATeams = getTeamsFromMatches(groupAMatches).sort((a, b) => (b.msiWins || 0) - (a.msiWins || 0) || (a.msiLosses || 0) - (b.msiLosses || 0));
    const groupBTeams = getTeamsFromMatches(groupBMatches).sort((a, b) => (b.msiWins || 0) - (a.msiWins || 0) || (a.msiLosses || 0) - (b.msiLosses || 0));


    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6">
            <header className="text-center">
                <h2 className="text-3xl font-bold text-yellow-300 tracking-wider animate-pulse uppercase">MSI - Vòng Bảng</h2>
                <p className="text-gray-400">4 đội đứng đầu mỗi bảng sẽ tiến vào Vòng Knockout.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StandingsTable title="Bảng A" teams={groupATeams} matches={groupAMatches} championTeamIds={championTeamIds} />
                <StandingsTable title="Bảng B" teams={groupBTeams} matches={groupBMatches} championTeamIds={championTeamIds} />
            </div>
        </div>
    );
};