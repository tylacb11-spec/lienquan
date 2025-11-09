

import React from 'react';
import { Match, Team } from '../types';

interface MatchupCardProps {
    match?: Match;
    teamA?: { name: string; logoUrl: string };
    teamB?: { name: string; logoUrl: string };
    title: string;
}

const MatchupCard: React.FC<MatchupCardProps> = ({ match, teamA, teamB, title }) => {
    const displayTeamA = match?.teamA || teamA;
    const displayTeamB = match?.teamB || teamB;

    const didTeamAWin = match?.isPlayed && match.result && match.result.scoreA > match.result.scoreB;
    const didTeamBWin = match?.isPlayed && match.result && match.result.scoreB > match.result.scoreA;

    const teamAClasses = `flex items-center p-2 rounded-t-md ${didTeamAWin ? 'bg-green-500/30 font-bold' : 'bg-gray-700/50'}`;
    const teamBClasses = `flex items-center p-2 rounded-b-md ${didTeamBWin ? 'bg-green-500/30 font-bold' : 'bg-gray-700/50'}`;

    return (
        <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 w-full">
            <div className="text-center py-2 border-b border-gray-600">
                <h4 className="font-bold text-cyan-400">{title}</h4>
            </div>
            <div className="p-2 space-y-1">
                <div className={teamAClasses}>
                    {displayTeamA ? (
                        <>
                            <img src={displayTeamA.logoUrl} alt={displayTeamA.name} className="w-8 h-8 rounded-full mr-3" />
                            <span className="flex-1">{displayTeamA.name}</span>
                            {match?.isPlayed && <span className="font-mono text-lg">{match.result?.scoreA}</span>}
                        </>
                    ) : <span className="text-gray-500">Chờ kết quả</span>}
                </div>
                 <div className={teamBClasses}>
                    {displayTeamB ? (
                        <>
                            <img src={displayTeamB.logoUrl} alt={displayTeamB.name} className="w-8 h-8 rounded-full mr-3" />
                            <span className="flex-1">{displayTeamB.name}</span>
                            {match?.isPlayed && <span className="font-mono text-lg">{match.result?.scoreB}</span>}
                        </>
                    ) : <span className="text-gray-500">Chờ kết quả</span>}
                </div>
            </div>
        </div>
    );
};

interface PlayoffBracketProps {
  matches: Match[];
  champion?: Team | null;
  title: string;
}

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({ matches, champion, title }) => {
    // Use case-insensitive matching for robustness against "Bán Kết" vs "Bán kết" etc.
    const semiFinals = matches.filter(m => m.round?.toLowerCase().includes('bán kết'));
    const quarterFinals = matches.filter(m => m.round?.toLowerCase().includes('tứ kết'));
    const final = matches.find(m => m.round?.toLowerCase().includes('chung kết'));
    
    const firstRoundMatches = quarterFinals.length > 0 ? quarterFinals : semiFinals;
    const firstRoundTitle = quarterFinals.length > 0 ? 'Tứ Kết' : 'Bán Kết';
    
    // In a 4-team bracket, semi-finals lead directly to the final.
    // In an 8-team bracket (like worlds), quarters -> semis -> final. This component only shows one step before the final.
    // This logic handles a simple 4-team bracket structure.
    
    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400 tracking-wider uppercase">{title}</h2>
            
            {champion && (
                <div className="text-center mb-8 p-4 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-lg shadow-xl animate-pulse">
                    <h3 className="text-2xl font-black text-gray-900">NHÀ VÔ ĐỊCH</h3>
                    <p className="text-4xl font-bold text-white flex items-center justify-center space-x-3">
                        <img src={champion.logoUrl} alt={champion.name} className="w-12 h-12 rounded-full" />
                        <span>{champion.name.toUpperCase()}</span>
                    </p>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                {/* Semi-Finals Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    {firstRoundMatches.length > 0 ? (
                        firstRoundMatches.map((match, index) => (
                            <MatchupCard
                                key={match.id}
                                match={match}
                                title={`${firstRoundTitle} ${index + 1}`}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">Chưa có trận đấu nào.</p>
                    )}
                </div>

                {/* Connectors */}
                 <div className="w-full md:w-1/3 flex flex-col items-center relative h-32 md:h-auto">
                    <div className="hidden md:block w-1/2 h-[2px] bg-gray-600 absolute top-1/2 left-0"></div>
                    <div className="hidden md:block w-1/2 h-[2px] bg-gray-600 absolute top-1/2 right-0"></div>
                    <div className="hidden md:block h-full w-[2px] bg-gray-600 absolute" style={{height: 'calc(50% + 3rem)', top: '25%'}}></div>
                     <div className="block md:hidden h-1/2 w-[2px] bg-gray-600 absolute top-0"></div>
                    <div className="block md:hidden h-1/2 w-[2px] bg-gray-600 absolute bottom-0"></div>
                </div>

                {/* Final Column */}
                <div className="w-full md:w-1/3 flex items-center justify-center">
                    <MatchupCard match={final} title="Chung Kết"/>
                </div>
            </div>
        </div>
    );
};