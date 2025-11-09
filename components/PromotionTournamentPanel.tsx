import React from 'react';
import { Match } from '../types';

interface MatchupCardProps {
    match: Match;
    title: string;
}

const MatchupCard: React.FC<MatchupCardProps> = ({ match, title }) => {
    const { teamA, teamB, result, isPlayed } = match;

    const didTeamAWin = isPlayed && result && result.scoreA > result.scoreB;
    const didTeamBWin = isPlayed && result && result.scoreB > result.scoreA;
    
    // Giả định teamA từ Hạng 1 và teamB từ Hạng 2
    const teamAStatus = didTeamAWin ? 'TRỤ HẠNG' : 'RỚT HẠNG';
    const teamBStatus = didTeamBWin ? 'THĂNG HẠNG' : 'Ở LẠI HẠNG 2';

    const TeamRow: React.FC<{team: any, score?: number, hasWon: boolean, status: string}> = ({team, score, hasWon, status}) => (
         <div className={`flex items-center justify-between p-3 rounded-md transition-all duration-300 ${hasWon ? 'bg-green-600/40 border-green-500' : 'bg-red-600/40 border-red-500'} border-l-4`}>
            <div className="flex items-center space-x-3">
                <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full" />
                <div className="flex flex-col">
                    <span className="font-bold text-white">{team.name}</span>
                    {isPlayed && <span className={`text-xs font-semibold ${hasWon ? 'text-green-300' : 'text-red-300'}`}>{status}</span>}
                </div>
            </div>
            {isPlayed && <span className="text-2xl font-mono font-bold text-white">{score}</span>}
        </div>
    );

    return (
        <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 w-full max-w-md mx-auto">
            <div className="text-center py-2 border-b border-gray-600">
                <h4 className="font-bold text-cyan-400">{title}</h4>
            </div>
            <div className="p-3 space-y-2">
                <TeamRow team={teamA} score={result?.scoreA} hasWon={didTeamAWin} status={teamAStatus} />
                <div className="text-center font-bold text-gray-400">VS</div>
                <TeamRow team={teamB} score={result?.scoreB} hasWon={didTeamBWin} status={teamBStatus} />
            </div>
        </div>
    );
};


interface PromotionTournamentPanelProps {
  matches: Match[];
}

export const PromotionTournamentPanel: React.FC<PromotionTournamentPanelProps> = ({ matches }) => {
    if (matches.length === 0) return null;
    
    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-red-400 tracking-wider animate-pulse">VÒNG PHÂN HẠNG</h2>
            <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
                Hai đội cuối bảng Hạng 1 sẽ đối đầu với hai đội dẫn đầu Hạng 2. Kẻ thắng sẽ giành quyền thi đấu tại giải đấu cao nhất mùa sau.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                {matches.map((match, index) => (
                     <MatchupCard key={match.id} match={match} title={`Trận ${index + 1}`} />
                ))}
            </div>
        </div>
    );
};