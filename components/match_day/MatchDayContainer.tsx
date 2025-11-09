import React, { useState, useCallback, useMemo } from 'react';
import { Match, Player, Team, GameResult, GameState, Split, PlayerRole, Hero } from '../../types';
import { RosterSelectionScreen } from './RosterSelectionScreen';
import { LiveMatchScreen } from './LiveMatchScreen';
import { BanPickScreen } from './BanPickScreen';

interface MatchDayContainerProps {
    match: Match;
    playerTeam: Team;
    opponentTeam: Team;
    onMatchComplete: (match: Match, result: { scoreA: number, scoreB: number, gameResults: GameResult[] }, playerRoster: Player[], opponentRoster: Player[]) => void;
    simulateMatchFn: (teamA: Team, teamB: Team, rosterA: Player[], rosterB: Player[], picksA: Hero[], picksB: Hero[], format: 'BO1' | 'BO3' | 'BO5' | 'BO7', gameState?: GameState) => { scoreA: number, scoreB: number, gameResults: GameResult[] };
    gameState: GameState;
    split: Split;
    heroPool: Hero[];
}

type MatchPhase = 'roster_selection' | 'ban_pick' | 'live_match';

export const MatchDayContainer: React.FC<MatchDayContainerProps> = ({ match, playerTeam, opponentTeam, onMatchComplete, simulateMatchFn, gameState, split, heroPool }) => {
    const [phase, setPhase] = useState<MatchPhase>('roster_selection');
    const [playerRoster, setPlayerRoster] = useState<Player[]>([]);
    const [gameResults, setGameResults] = useState<GameResult[]>([]);
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [currentScore, setCurrentScore] = useState({ teamA: 0, teamB: 0 });

    const getMatchFormat = useCallback((): 'BO1' | 'BO3' | 'BO5' | 'BO7' => {
        if (gameState === GameState.Playoffs || gameState === GameState.PromotionRelegation) {
            if (match.round?.toLowerCase().includes('chung kết')) return 'BO7';
            return 'BO5';
        }
        if (gameState === GameState.MSI) {
            if (match.round === 'Vòng Bảng') {
                return 'BO1';
            }
            return 'BO5'; // Knockout stage
        }
        return 'BO3';
    }, [gameState, match.round]);

    const gamesToWin = { 'BO1': 1, 'BO3': 2, 'BO5': 3, 'BO7': 4 }[getMatchFormat()];
    
    const opponentRoster = useMemo(() => {
        const rolesOrder = [PlayerRole.Top, PlayerRole.Jungle, PlayerRole.Mid, PlayerRole.Adc, PlayerRole.Support];
        const availablePlayers = [...opponentTeam.roster];
        const starters: Record<PlayerRole, Player | null> = {
            [PlayerRole.Top]: null, [PlayerRole.Jungle]: null, [PlayerRole.Mid]: null, [PlayerRole.Adc]: null, [PlayerRole.Support]: null
        };

        // First pass: fill with on-role players
        for (const role of rolesOrder) {
            const bestPlayerForRole = availablePlayers
                .filter(p => p.role === role)
                .sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro))[0];
            
            if (bestPlayerForRole) {
                starters[role] = bestPlayerForRole;
                availablePlayers.splice(availablePlayers.findIndex(p => p.id === bestPlayerForRole.id), 1);
            }
        }

        // Second pass: fill empty slots with best remaining players
        for (const role of rolesOrder) {
            if (!starters[role] && availablePlayers.length > 0) {
                availablePlayers.sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
                starters[role] = availablePlayers.shift()!;
            }
        }
        
        const finalRoster = rolesOrder.map(role => starters[role]!);
        if (finalRoster.some(p => p === null || p === undefined)) {
            // Fallback to old logic if new logic fails to produce 5 players.
            return [...opponentTeam.roster].sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro)).slice(0, 5);
        }
        return finalRoster;
    }, [opponentTeam.roster]);

    const handleRosterConfirm = (selectedRoster: Player[]) => {
        setPlayerRoster(selectedRoster);
        setPhase('ban_pick');
    };
    
    const handleBanPickComplete = (playerPicks: Hero[], opponentPicks: Hero[]) => {
        const isPlayerTeamA = match.teamA.id === playerTeam.id;
        const teamA = isPlayerTeamA ? playerTeam : opponentTeam;
        const teamB = isPlayerTeamA ? opponentTeam : playerTeam;
        const rosterA = isPlayerTeamA ? playerRoster : opponentRoster;
        const rosterB = isPlayerTeamA ? opponentRoster : playerRoster;
        const picksA = isPlayerTeamA ? playerPicks : opponentPicks;
        const picksB = isPlayerTeamA ? opponentPicks : playerPicks;

        // Simulate only ONE game
        const result = simulateMatchFn(teamA, teamB, rosterA, rosterB, picksA, picksB, 'BO1', gameState);
        const newGame = result.gameResults[0];
        
        // Fix: Manually set the gameNumber based on the current state of the series.
        newGame.gameNumber = currentGameIndex + 1;
        
        setGameResults(prev => [...prev, newGame]);
        setPhase('live_match');
    };

    const handleGameEnd = () => {
        if (!gameResults[currentGameIndex]) return;

        const currentGame = gameResults[currentGameIndex];
        const newScore = { ...currentScore };
        const isPlayerTeamA = match.teamA.id === playerTeam.id;

        if (currentGame.winner === 'teamA') {
            newScore.teamA++;
        } else {
            newScore.teamB++;
        }
        setCurrentScore(newScore);

        const playerFinalScore = isPlayerTeamA ? newScore.teamA : newScore.teamB;
        const opponentFinalScore = isPlayerTeamA ? newScore.teamB : newScore.teamA;

        if (playerFinalScore >= gamesToWin || opponentFinalScore >= gamesToWin) {
            onMatchComplete(match, { scoreA: newScore.teamA, scoreB: newScore.teamB, gameResults: gameResults }, playerRoster, opponentRoster);
        } else {
            setCurrentGameIndex(prev => prev + 1);
            setPhase('ban_pick');
        }
    };
    

    const renderPhase = () => {
        switch (phase) {
            case 'roster_selection':
                return <RosterSelectionScreen team={playerTeam} onConfirm={handleRosterConfirm} />;
            case 'ban_pick':
                return <BanPickScreen 
                    playerTeam={playerTeam} 
                    opponentTeam={opponentTeam} 
                    onComplete={(picks) => handleBanPickComplete(picks.player, picks.opponent)}
                    gameNumber={currentGameIndex + 1}
                    playerRoster={playerRoster}
                    opponentRoster={opponentRoster}
                    heroPool={heroPool}
                />
            case 'live_match':
                if (gameResults && gameResults[currentGameIndex]) {
                    const isPlayerTeamA = match.teamA.id === playerTeam.id;
                    const seriesScore = {
                        player: isPlayerTeamA ? currentScore.teamA : currentScore.teamB,
                        opponent: isPlayerTeamA ? currentScore.teamB : currentScore.teamA
                    };
                    return <LiveMatchScreen 
                                match={match}
                                playerTeam={playerTeam}
                                opponentTeam={opponentTeam}
                                onGameEnd={handleGameEnd}
                                game={gameResults[currentGameIndex]}
                                seriesScore={seriesScore}
                                playerRoster={playerRoster}
                                opponentRoster={opponentRoster}
                            />;
                }
                return null;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            {renderPhase()}
        </div>
    );
};