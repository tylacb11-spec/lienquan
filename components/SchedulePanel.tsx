import React from 'react';
import { Match } from '../types';

interface CompactMatchCardProps {
  match: Match;
  isCurrent: boolean;
  playerTeamName: string;
}

const CompactMatchCard: React.FC<CompactMatchCardProps> = ({ match, isCurrent, playerTeamName }) => {
    // Determine win/loss for styling
    const playerWon = match.isPlayed && match.result && (
        (match.teamA.name === playerTeamName && match.result.scoreA > match.result.scoreB) ||
        (match.teamB.name === playerTeamName && match.result.scoreB > match.result.scoreA)
    );

    const resultText = match.isPlayed && match.result
        ? `${match.result.scoreA} - ${match.result.scoreB}`
        : 'VS';
    
    const statusText = match.isPlayed ? (playerWon ? 'Thắng' : 'Bại') : 'Sắp diễn ra';
    const statusColor = match.isPlayed 
        ? (playerWon ? 'text-green-400' : 'text-red-400') 
        : 'text-yellow-400';

    return (
        <div className={`
            bg-gray-800/60 rounded-lg p-3 transition-all duration-300 border border-gray-700 flex-1 min-w-[280px]
            ${isCurrent ? 'border-cyan-400 shadow-md shadow-cyan-500/10 scale-105' : 'hover:bg-gray-700/80'}
        `}>
            <div className="flex justify-between items-center text-xs mb-2">
                <h3 className="font-bold text-gray-300">Tuần {match.week}</h3>
                <span className={`font-semibold px-1.5 py-0.5 rounded ${statusColor} bg-black/20`}>
                    {statusText}
                </span>
            </div>
            <div className="flex items-center justify-between">
                {/* Team A */}
                <div className="flex-1 flex items-center space-x-2">
                    <img src={match.teamA.logoUrl || `https://picsum.photos/seed/${match.teamA.name.replace(/\s/g, '')}/64/64`} alt={match.teamA.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"/>
                    <span className="font-bold text-sm truncate">{match.teamA.name}</span>
                </div>

                {/* Result */}
                <div className="mx-2 text-center">
                    <span className={`text-xl font-bold ${match.isPlayed ? 'text-white' : 'text-gray-500'}`}>{resultText}</span>
                </div>

                {/* Team B */}
                <div className="flex-1 flex items-center space-x-2 justify-end text-right">
                    <span className="font-bold text-sm truncate">{match.teamB.name}</span>
                    <img src={match.teamB.logoUrl} alt={match.teamB.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"/>
                </div>
            </div>
        </div>
    );
};


interface SchedulePanelProps {
  schedule: Match[];
  currentWeek: number;
  playerTeamName: string;
}

export const SchedulePanel: React.FC<SchedulePanelProps> = ({ schedule, currentWeek, playerTeamName }) => {
  // Filter for player's matches and sort them chronologically
  const playerMatches = schedule
    .filter(m => m.teamA.name === playerTeamName || m.teamB.name === playerTeamName)
    .sort((a, b) => a.week - b.week || (a.id > b.id ? 1 : -1)); // stable sort by week

  // Find the index of the first unplayed (upcoming) match
  const upcomingMatchIndex = playerMatches.findIndex(m => !m.isPlayed);
  
  let matchesToShow: Match[];

  if (upcomingMatchIndex === -1 && playerMatches.length > 0) {
    // All matches are played, show the last 3
    matchesToShow = playerMatches.slice(-3);
  } else if (upcomingMatchIndex !== -1) {
    // Show the previous match, the upcoming one, and the one after that
    const startIndex = Math.max(0, upcomingMatchIndex - 1);
    const endIndex = Math.min(playerMatches.length, upcomingMatchIndex + 2);
    matchesToShow = playerMatches.slice(startIndex, endIndex);
  } else {
    matchesToShow = [];
  }
  
  // The "current" match to highlight is the first unplayed one
  const currentMatch = upcomingMatchIndex !== -1 ? playerMatches[upcomingMatchIndex] : null;

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-wider">LỊCH THI ĐẤU</h2>
      {matchesToShow.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-4">
          {matchesToShow.map(match => (
            <CompactMatchCard 
              key={match.id} 
              match={match} 
              isCurrent={match.id === currentMatch?.id}
              playerTeamName={playerTeamName}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">Không có trận đấu nào trong lịch trình.</p>
      )}
    </div>
  );
};