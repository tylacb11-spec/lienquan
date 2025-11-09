

import React from 'react';
import { Match, Team } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

const TeamWithTrophy: React.FC<{ team: { id: string, name: string, logoUrl: string }, isChampion: boolean, isReversed?: boolean }> = ({ team, isChampion, isReversed = false }) => (
    <div className={`flex items-center space-x-2 ${isReversed ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full" />
        <span className="truncate">{team.name}</span>
        {isChampion && <TrophyIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
    </div>
);


interface MatchupCardProps {
    match: Match;
    championTeamIds: string[];
}

const MatchupCard: React.FC<MatchupCardProps> = ({ match, championTeamIds }) => {
    const { teamA, teamB, result, isPlayed } = match;

    const didTeamAWin = isPlayed && result && result.scoreA > result.scoreB;
    const didTeamBWin = isPlayed && result && result.scoreB > result.scoreA;

    const teamAClasses = `flex items-center justify-between p-2 rounded-t-lg ${didTeamAWin ? 'bg-green-500/30 font-bold' : 'bg-gray-700/50'}`;
    const teamBClasses = `flex items-center justify-between p-2 rounded-b-lg ${didTeamBWin ? 'bg-green-500/30 font-bold' : 'bg-gray-700/50'}`;

    return (
        <div className="bg-gray-800/80 rounded-lg shadow-md border border-gray-700 w-full min-w-[200px]">
            <div className={teamAClasses}>
                <TeamWithTrophy team={teamA} isChampion={championTeamIds.includes(teamA.id)} />
                {isPlayed && <span className="font-mono text-lg">{result?.scoreA}</span>}
            </div>
            <div className={teamBClasses}>
                 <TeamWithTrophy team={teamB} isChampion={championTeamIds.includes(teamB.id)} />
                {isPlayed && <span className="font-mono text-lg">{result?.scoreB}</span>}
            </div>
        </div>
    );
};

interface BracketRoundProps {
    title: string;
    matches: Match[];
    championTeamIds: string[];
}

const BracketRound: React.FC<BracketRoundProps> = ({ title, matches, championTeamIds }) => (
    <div className="flex flex-col justify-around items-center gap-4 h-full">
        <h3 className="text-xl font-bold text-cyan-300 mb-4">{title}</h3>
        {matches.map(match => <MatchupCard key={match.id} match={match} championTeamIds={championTeamIds} />)}
    </div>
);


interface InternationalTournamentPanelProps {
  matches: Match[];
  champion?: Team | null;
  title: string;
  championTeamIds: string[];
}

export const InternationalTournamentPanel: React.FC<InternationalTournamentPanelProps> = ({ matches, champion, title, championTeamIds }) => {
    
    const rounds = matches.reduce((acc, match) => {
        const round = match.round || 'Unknown';
        if (!acc[round]) {
            acc[round] = [];
        }
        acc[round].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const roundOrder = ['Tứ kết', 'Bán kết', 'Chung kết'];
    const orderedRounds = roundOrder.map(r => rounds[r]).filter(Boolean);

    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-300 tracking-wider animate-pulse uppercase">{title}</h2>
            
            {champion && (
                <div className="text-center mb-8 p-4 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-lg shadow-xl">
                    <h3 className="text-2xl font-black text-gray-900">NHÀ VÔ ĐỊCH THẾ GIỚI</h3>
                    <p className="text-4xl font-bold text-white flex items-center justify-center space-x-3">
                        <img src={champion.logoUrl} alt={champion.name} className="w-12 h-12 rounded-full" />
                        <span>{champion.name.toUpperCase()}</span>
                    </p>
                </div>
            )}
            
            <div className="w-full overflow-x-auto p-4">
                <div className="flex items-start justify-center space-x-8 min-w-max">
                    {orderedRounds.map((roundMatches, index) => (
                       <BracketRound key={index} title={roundMatches[0].round || `Vòng ${index+1}`} matches={roundMatches} championTeamIds={championTeamIds} />
                    ))}
                </div>
            </div>
        </div>
    );
};