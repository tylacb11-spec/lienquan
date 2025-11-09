import React, { useMemo } from 'react';
import { Team, Match } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

const TeamDisplay: React.FC<{ team: Team, record?: boolean, isChampion: boolean }> = ({ team, record = false, isChampion }) => (
    <div className="flex items-center space-x-3 bg-gray-800/60 p-2 rounded-md">
        {isChampion && <TrophyIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" title="Đương kim vô địch khu vực"/>}
        <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
            <p className="font-bold text-white truncate">{team.name}</p>
            {record && <p className="text-xs text-gray-400">{team.swissWins}-{team.swissLosses}</p>}
        </div>
    </div>
);

const MatchupDisplay: React.FC<{ match: Match }> = ({ match }) => (
    <div className="flex items-center justify-between text-sm py-2 px-3 bg-gray-900/60 rounded-md">
        <div className="flex items-center space-x-2 flex-1 justify-end text-right">
            <span className="font-bold truncate">{match.teamA.name}</span>
            <img src={match.teamA.logoUrl} alt={match.teamA.name} className="w-6 h-6 rounded-full" />
        </div>
        <span className="font-bold text-cyan-400 mx-3 text-lg">VS</span>
        <div className="flex items-center space-x-2 flex-1 justify-start text-left">
            <img src={match.teamB.logoUrl} alt={match.teamB.name} className="w-6 h-6 rounded-full" />
            <span className="font-bold truncate">{match.teamB.name}</span>
        </div>
    </div>
);


const RecordGroup: React.FC<{ title: string; teams: Team[]; color: string; championTeamIds: string[] }> = ({ title, teams, color, championTeamIds }) => {
    if (teams.length === 0) return null;
    return (
        <div className="bg-gray-900/40 p-3 rounded-lg">
            <h3 className={`text-lg font-bold mb-3 border-b-2 pb-2 ${color}`}>{title} ({teams.length})</h3>
            <div className="space-y-2">
                {teams.map(team => <TeamDisplay key={team.id} team={team} isChampion={championTeamIds.includes(team.id)} />)}
            </div>
        </div>
    );
};

interface SwissStagePanelProps {
    teams: Team[];
    matches: Match[];
    round: number;
    championTeamIds: string[];
}

export const SwissStagePanel: React.FC<SwissStagePanelProps> = ({ teams, matches, round, championTeamIds }) => {
    
    const { qualified, eliminated, inProgress } = useMemo(() => {
        const qualified: Team[] = [];
        const eliminated: Team[] = [];
        const inProgress: Team[] = [];

        teams.forEach(team => {
            if (team.swissWins === 3) {
                qualified.push(team);
            } else if (team.swissLosses === 3) {
                eliminated.push(team);
            } else {
                inProgress.push(team);
            }
        });
        return { qualified, eliminated, inProgress };
    }, [teams]);

    const teamsByRecord = useMemo(() => {
        return inProgress.reduce((acc, team) => {
            const record = `${team.swissWins}-${team.swissLosses}`;
            if (!acc[record]) {
                acc[record] = [];
            }
            acc[record].push(team);
            return acc;
        }, {} as Record<string, Team[]>);
    }, [inProgress]);

    const recordOrder = ['2-0', '2-1', '1-0', '1-1', '1-2', '0-1', '0-2'];
    const sortedInProgressGroups = Object.entries(teamsByRecord).sort(([a], [b]) => {
        const [aWins, aLosses] = a.split('-').map(Number);
        const [bWins, bLosses] = b.split('-').map(Number);
        if (aWins !== bWins) return bWins - aWins;
        return aLosses - bLosses;
    });

    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6">
            <header className="text-center">
                <h2 className="text-3xl font-bold text-yellow-300 tracking-wider animate-pulse uppercase">CKTG - Vòng Swiss</h2>
                <p className="text-xl font-semibold text-gray-300">Vòng {round}</p>
            </header>

            {/* Current Matchups */}
            {matches.length > 0 && (
                 <div className="bg-gray-900/40 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center">Các Cặp Đấu Vòng {round}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matches.map(match => <MatchupDisplay key={match.id} match={match} />)}
                    </div>
                </div>
            )}

            {/* Standings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedInProgressGroups.map(([record, teams]) => (
                     <RecordGroup key={record} title={`Nhóm ${record}`} teams={teams} color="text-cyan-400 border-cyan-400" championTeamIds={championTeamIds} />
                ))}
            </div>

            {/* Qualified & Eliminated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                <RecordGroup title="Đã Vượt Qua Vòng Bảng" teams={qualified} color="text-green-400 border-green-400" championTeamIds={championTeamIds} />
                <RecordGroup title="Đã Bị Loại" teams={eliminated} color="text-red-400 border-red-400" championTeamIds={championTeamIds} />
            </div>
        </div>
    );
};