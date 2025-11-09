import React, { useState, useEffect, useCallback } from 'react';
import { Match, Team, GameResult, Player, Hero, PlayerRole } from '../../types';

const ObjectiveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM2 10a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm16 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM4 16a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 14a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

interface Ping {
    id: number;
    top: string;
    left: string;
    color: string;
    description: string;
    type: 'objective';
}

interface Fight {
    id: number;
    top: string;
    left: string;
    teamA_heroes: Hero[]; // Corresponds to match.teamA
    teamB_heroes: Hero[]; // Corresponds to match.teamB
    winner: 'teamA' | 'teamB';
    defeatedHero: Hero;
}

interface GameEndState {
    showExplosion: boolean;
    loserBasePosition: { top: string; left: string } | null;
}

const MapEventPing: React.FC<{ ping: Ping }> = ({ ping }) => (
    <div 
        className="group absolute transition-opacity duration-500 animate-fade-in" 
        style={{ top: ping.top, left: ping.left, transform: 'translate(-50%, -50%)' }}
    >
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg border border-cyan-500/30">
            {ping.description}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
        </div>
        
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <div className="absolute inset-0 rounded-full opacity-75 animate-ping" style={{ backgroundColor: ping.color }}></div>
            <div className="relative w-full h-full rounded-full border-2 flex items-center justify-center text-white" style={{ borderColor: ping.color, backgroundColor: `${ping.color}40` }}>
                <ObjectiveIcon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const HeroOnMap: React.FC<{ hero: Hero; position: { top: string; left: string }; isAlive: boolean; isPlayerTeam: boolean }> = ({ hero, position, isAlive, isPlayerTeam }) => {
    const borderColor = isPlayerTeam ? 'border-blue-500' : 'border-red-500';
    return (
        <div
            className="absolute"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)',
                transition: 'top 1.5s ease-in-out, left 1.5s ease-in-out, opacity 0.5s, filter 0.5s',
            }}
        >
            <img
                src={hero.imageUrl}
                alt={hero.name}
                className={`w-10 h-10 rounded-full object-cover border-2 ${borderColor} ${!isAlive ? 'grayscale opacity-50' : 'shadow-md shadow-black/50'}`}
            />
        </div>
    );
};

interface HeroState {
    position: { top: string; left: string };
    isAlive: boolean;
    role: PlayerRole;
}

const TacticalMap: React.FC<{
    pings: Ping[];
    gameEndState: GameEndState;
    heroStates: Record<string, HeroState>;
    playerHeroes: Hero[];
    opponentHeroes: Hero[];
}> = ({ pings, gameEndState, heroStates, playerHeroes, opponentHeroes }) => {
    return (
        <div className="w-full aspect-square bg-gray-800 rounded-lg relative overflow-hidden shadow-lg">
            <img 
                src="https://cdn2.fptshop.com.vn/unsafe/2021_1_20_637467548581279283_ban-do-lien-quan.jpg" 
                alt="Bản đồ chiến thuật" 
                className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0">
                {pings.map((ping) => <MapEventPing key={ping.id} ping={ping} />)}
                
                {playerHeroes.map(hero => {
                    const state = heroStates[hero.id];
                    if (!state) return null;
                    return <HeroOnMap key={hero.id} hero={hero} position={state.position} isAlive={state.isAlive} isPlayerTeam={true} />;
                })}
                {opponentHeroes.map(hero => {
                    const state = heroStates[hero.id];
                    if (!state) return null;
                    return <HeroOnMap key={hero.id} hero={hero} position={state.position} isAlive={state.isAlive} isPlayerTeam={false} />;
                })}
                
                {gameEndState.showExplosion && gameEndState.loserBasePosition && (
                    <img 
                        src="https://media.tenor.com/2pPO_n_i90IAAAAi/explosion-transparent.gif"
                        alt="Explosion"
                        className="absolute w-48 h-48"
                        style={{
                            top: gameEndState.loserBasePosition.top,
                            left: gameEndState.loserBasePosition.left,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

interface TimelineEvent {
    time: number;
    event: string;
    ping?: Omit<Ping, 'id'>;
    fight?: Omit<Fight, 'id'>;
}

const generateDetailedEvents = (
    game: GameResult, 
    playerTeam: Team, opponentTeam: Team, 
    playerPicks: Hero[], opponentPicks: Hero[], 
    isPlayerTeamA: boolean
): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    
    const randomTime = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

    const POSITIONS = {
        top: { top: 25, left: 20 },
        mid: { top: 50, left: 50 },
        bot: { top: 80, left: 75 },
        jungle_A: { top: 60, left: 30 },
        jungle_B: { top: 40, left: 70 },
    };
    
    const getRandomPosition = () => {
        const keys = Object.keys(POSITIONS) as (keyof typeof POSITIONS)[];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const { top, left } = POSITIONS[key];
        return {
            top: `${top + randomTime(-5, 5)}%`,
            left: `${left + randomTime(-5, 5)}%`,
        };
    };

    const teamA = isPlayerTeamA ? playerTeam : opponentTeam;
    const teamB = isPlayerTeamA ? opponentTeam : playerTeam;
    const picksA = isPlayerTeamA ? playerPicks : opponentPicks;
    const picksB = isPlayerTeamA ? opponentPicks : playerPicks;

    const createSkirmish = (time: number, numA: number, numB: number, winner: 'teamA' | 'teamB') => {
        const availablePicksA = [...picksA];
        const availablePicksB = [...picksB];
        
        const teamA_heroes = Array.from({ length: numA }, () => {
            const index = Math.floor(Math.random() * availablePicksA.length);
            return availablePicksA.splice(index, 1)[0];
        }).filter(Boolean);

        const teamB_heroes = Array.from({ length: numB }, () => {
            const index = Math.floor(Math.random() * availablePicksB.length);
            return availablePicksB.splice(index, 1)[0];
        }).filter(Boolean);
        
        if (teamA_heroes.length === 0 || teamB_heroes.length === 0) return;

        const [winningHeroes, losingHeroes] = winner === 'teamA' ? [teamA_heroes, teamB_heroes] : [teamB_heroes, teamA_heroes];
        const winningHero = winningHeroes[0];
        const defeatedHero = losingHeroes[0];
        
        timeline.push({
            time: randomTime(400, 600),
            event: `${time}:${randomTime(10, 59)} - [P:${winningHero.name}] đã hạ gục [P:${defeatedHero.name}] trong một pha giao tranh!`,
            fight: { ...getRandomPosition(), teamA_heroes, teamB_heroes, winner, defeatedHero },
        });
    };

    timeline.push({ time: 250, event: `00:00 - VÁN ${game.gameNumber} BẮT ĐẦU!` });
    
    const totalKills = game.killsA + game.killsB;
    const winnerKills = game.winner === 'teamA' ? game.killsA : game.killsB;
    let killsAccountedFor = 0;

    while(killsAccountedFor < totalKills) {
        const time = Math.floor(2 + killsAccountedFor * (18 / totalKills));
        const winner = Math.random() < (winnerKills / totalKills) ? game.winner : (game.winner === 'teamA' ? 'teamB' : 'teamA');
        
        const type = Math.random();
        if (type < 0.4) createSkirmish(time, 1, 1, winner); // 1v1
        else if (type < 0.7) createSkirmish(time, 2, 1, winner); // 2v1 gank
        else if (type < 0.9) createSkirmish(time, 2, 2, winner); // 2v2
        else createSkirmish(time, 3, 2, winner); // 3v2 or small teamfight
        
        killsAccountedFor++;
    }

    const winnerName = game.winner === 'teamA' ? teamA.name : teamB.name;
    
    if (Math.random() > 0.3) {
        timeline.push({ 
            time: 500, 
            event: `08:${randomTime(10,59)} - ${winnerName} kiểm soát thành công Rồng!`,
            ping: { top: `${POSITIONS.bot.top}%`, left: `${POSITIONS.bot.left}%`, color: '#a78bfa', description: `${winnerName} ăn Rồng!`, type: 'objective' }
        });
    }

    if (Math.random() > 0.3) {
        timeline.push({ 
            time: 250, 
            event: `17:${randomTime(10,59)} - ${winnerName} có được bùa lợi Caesar!`,
            ping: { top: `${POSITIONS.top.top}%`, left: `${POSITIONS.top.left}%`, color: '#f59e0b', description: `${winnerName} ăn Caesar!`, type: 'objective' }
        });
    }

    timeline.push({ time: 500, event: `${game.duration} - NHÀ CHÍNH NỔ TUNG! ${winnerName} giành chiến thắng VÁN ${game.gameNumber}!` });

    return timeline.sort((a, b) => a.event.localeCompare(b.event));
}

interface LiveMatchScreenProps {
    match: Match;
    playerTeam: Team;
    opponentTeam: Team;
    game: GameResult;
    seriesScore: { player: number; opponent: number };
    onGameEnd: () => void;
    playerRoster: Player[];
    opponentRoster: Player[];
}

const PlayerDisplay: React.FC<{player: Player, hero: Hero, isPlayerTeam: boolean}> = ({ player, hero, isPlayerTeam }) => (
    <div className={`flex items-center space-x-2 md:space-x-3 ${isPlayerTeam ? '' : 'flex-row-reverse'}`}>
        <img src={player.avatarUrl} alt={player.ign} className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-gray-600" />
        <img src={hero.imageUrl} alt={hero.name} className="w-8 h-8 md:w-12 md:h-12 rounded-md" />
        <div className={isPlayerTeam ? 'text-left' : 'text-right'}>
            <p className="text-sm md:text-base font-bold truncate">{player.ign}</p>
            <p className="text-xs md:text-sm text-gray-400 truncate">{hero.name}</p>
        </div>
    </div>
);

const LANE_POSITIONS = {
    player: {
        [PlayerRole.Top]: { top: '35%', left: '15%' },
        [PlayerRole.Jungle]: { top: '60%', left: '40%' },
        [PlayerRole.Mid]: { top: '55%', left: '45%' },
        [PlayerRole.Adc]: { top: '85%', left: '65%' },
        [PlayerRole.Support]: { top: '80%', left: '70%' },
    },
    opponent: {
        [PlayerRole.Top]: { top: '15%', left: '35%' },
        [PlayerRole.Jungle]: { top: '40%', left: '60%' },
        [PlayerRole.Mid]: { top: '45%', left: '55%' },
        [PlayerRole.Adc]: { top: '65%', left: '85%' },
        [PlayerRole.Support]: { top: '70%', left: '80%' },
    }
};

export const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ match, playerTeam, opponentTeam, game, seriesScore, onGameEnd, playerRoster, opponentRoster }) => {
    const [mapPings, setMapPings] = useState<Ping[]>([]);
    const [heroStates, setHeroStates] = useState<Record<string, HeroState>>({});
    const [isSimulating, setIsSimulating] = useState(true);
    const [animatedScores, setAnimatedScores] = useState({ player: 0, opponent: 0 });
    const [gameEndState, setGameEndState] = useState<GameEndState>({ showExplosion: false, loserBasePosition: null });
    const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
    
    const isPlayerTeamA = match.teamA.id === playerTeam.id;

    useEffect(() => {
        setMapPings([]);
        setIsSimulating(true);
        setAnimatedScores({ player: 0, opponent: 0 });
        setGameEndState({ showExplosion: false, loserBasePosition: null });
        setWinnerMessage(null);
        
        const playerPicks = isPlayerTeamA ? game.picks.teamA : game.picks.teamB;
        const opponentPicks = isPlayerTeamA ? game.picks.teamB : game.picks.teamA;

        const initialStates: Record<string, HeroState> = {};
        playerRoster.forEach((player, index) => {
            const hero = playerPicks[index];
            if (hero) {
                initialStates[hero.id] = {
                    position: LANE_POSITIONS.player[player.role],
                    isAlive: true,
                    role: player.role,
                };
            }
        });
        opponentRoster.forEach((player, index) => {
            const hero = opponentPicks[index];
            if (hero) {
                initialStates[hero.id] = {
                    position: LANE_POSITIONS.opponent[player.role],
                    isAlive: true,
                    role: player.role,
                };
            }
        });
        setHeroStates(initialStates);

        const timeline = generateDetailedEvents(game, playerTeam, opponentTeam, playerPicks, opponentPicks, isPlayerTeamA);
        const timeoutIds: number[] = [];
        let cumulativeDelay = 0;

        timeline.forEach(item => {
            cumulativeDelay += item.time;
            const timeoutId = window.setTimeout(() => {
                const eventId = Date.now() + Math.random();
                if (item.ping) {
                    const newPing = { ...item.ping, id: eventId };
                    setMapPings(prev => [...prev, newPing]);
                    const pingTimeoutId = window.setTimeout(() => {
                        setMapPings(current => current.filter(p => p.id !== newPing.id));
                    }, 8000);
                    timeoutIds.push(pingTimeoutId);
                }
                if (item.fight) {
                    const fightPosition = { top: item.fight.top, left: item.fight.left };
                    const allInvolvedHeroes = [...item.fight.teamA_heroes, ...item.fight.teamB_heroes];
                    
                    setHeroStates(currentStates => {
                        const newStates = { ...currentStates };
                        allInvolvedHeroes.forEach(hero => {
                            if (newStates[hero.id]) {
                                newStates[hero.id] = { ...newStates[hero.id], position: fightPosition };
                            }
                        });
                        return newStates;
                    });

                    const fightEndTimeoutId = window.setTimeout(() => {
                        const { defeatedHero } = item.fight!;
                        setHeroStates(currentStates => {
                            const newStates = { ...currentStates };
                            if (newStates[defeatedHero.id]) {
                                newStates[defeatedHero.id].isAlive = false;
                            }
                            return newStates;
                        });

                        const winnerIsPlayer = (isPlayerTeamA && item.fight!.winner === 'teamA') || (!isPlayerTeamA && item.fight!.winner === 'teamB');
                        setAnimatedScores(prev => ({
                            ...prev,
                            [winnerIsPlayer ? 'player' : 'opponent']: prev[winnerIsPlayer ? 'player' : 'opponent'] + 1
                        }));

                        const respawnTimeoutId = window.setTimeout(() => {
                            setHeroStates(currentStates => {
                                const newStates = { ...currentStates };
                                if (newStates[defeatedHero.id]) {
                                    const isPlayerHero = playerPicks.some(p => p.id === defeatedHero.id);
                                    const basePosition = isPlayerHero ? { top: '85%', left: '15%' } : { top: '15%', left: '85%' };
                                    newStates[defeatedHero.id] = { ...newStates[defeatedHero.id], position: basePosition, isAlive: true };
                                }
                                return newStates;
                            });

                            const moveToLaneTimeoutId = window.setTimeout(() => {
                                setHeroStates(currentStates => {
                                    const newStates = { ...currentStates };
                                    if (newStates[defeatedHero.id]) {
                                        const isPlayerHero = playerPicks.some(p => p.id === defeatedHero.id);
                                        const originalPosition = (isPlayerHero ? LANE_POSITIONS.player : LANE_POSITIONS.opponent)[newStates[defeatedHero.id].role];
                                        newStates[defeatedHero.id] = { ...newStates[defeatedHero.id], position: originalPosition };
                                    }
                                    return newStates;
                                });
                            }, 100);
                            timeoutIds.push(moveToLaneTimeoutId);

                        }, 7000); // Respawn time
                        timeoutIds.push(respawnTimeoutId);


                        const moveBackTimeoutId = window.setTimeout(() => {
                             setHeroStates(currentStates => {
                                const newStates = { ...currentStates };
                                allInvolvedHeroes.forEach(hero => {
                                    if (hero.id !== defeatedHero.id && newStates[hero.id]) {
                                        const isPlayerHero = playerPicks.some(p => p.id === hero.id);
                                        const originalPosition = (isPlayerHero ? LANE_POSITIONS.player : LANE_POSITIONS.opponent)[newStates[hero.id].role];
                                        newStates[hero.id] = { ...newStates[hero.id], position: originalPosition };
                                    }
                                });
                                return newStates;
                            });
                        }, 2000);
                        timeoutIds.push(moveBackTimeoutId);
                    }, 2500); // Fight duration
                    timeoutIds.push(fightEndTimeoutId);
                }
            }, cumulativeDelay);
            timeoutIds.push(timeoutId);
        });
        
        const finalTimeoutId = window.setTimeout(() => {
            const winnerName = game.winner === 'teamA' ? match.teamA.name : match.teamB.name;
            setWinnerMessage(`Đội ${winnerName} chiến thắng!`);

            const playerLost = (isPlayerTeamA && game.winner === 'teamB') || (!isPlayerTeamA && game.winner === 'teamA');
            setGameEndState({
                showExplosion: true,
                loserBasePosition: playerLost ? { top: '85%', left: '15%' } : { top: '15%', left: '85%' }
            });

            const enableButtonTimeoutId = window.setTimeout(() => {
                setIsSimulating(false);
            }, 3000);
            timeoutIds.push(enableButtonTimeoutId);

        }, cumulativeDelay + 1000);
        timeoutIds.push(finalTimeoutId);
        
        return () => {
            timeoutIds.forEach(clearTimeout);
        };

    }, [game, playerTeam, opponentTeam, isPlayerTeamA, playerRoster, opponentRoster]);

    const teamAPicks = game.picks.teamA;
    const teamBPicks = game.picks.teamB;
    const playerPicks = isPlayerTeamA ? teamAPicks : teamBPicks;
    const opponentPicks = isPlayerTeamA ? teamBPicks : teamAPicks;
    const playerStarters = playerRoster;
    const opponentStarters = opponentRoster;
    
    return (
         <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 animate-fade-in space-y-4">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300 tracking-wider">TRỰC TIẾP VÁN {game.gameNumber}</h1>
                <p className="text-lg text-gray-400">Tỉ số loạt trận: {seriesScore.player} - {seriesScore.opponent}</p>
            </header>
            
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 space-y-2">
                     <div className="flex items-center space-x-2 p-2 bg-blue-900/40 rounded-t-lg">
                        <img src={playerTeam.logoUrl} alt={playerTeam.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                        <span className="text-lg font-bold text-blue-300 truncate">{playerTeam.name}</span>
                    </div>
                    {playerStarters.map((p, i) => <PlayerDisplay key={p.id} player={p} hero={playerPicks[i]} isPlayerTeam={true} />)}
                </div>
                
                <div className="col-span-6 flex flex-col gap-4 relative">
                    <div className="relative">
                        <TacticalMap 
                            pings={mapPings} 
                            gameEndState={gameEndState} 
                            heroStates={heroStates}
                            playerHeroes={playerPicks}
                            opponentHeroes={opponentPicks}
                        />
                         {winnerMessage && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-fade-in z-20 pointer-events-none">
                                <h2 
                                    className="text-4xl lg:text-5xl font-black text-yellow-300 tracking-wider text-center"
                                    style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.7), 0 0 25px rgba(253, 224, 71, 0.5)' }}
                                >
                                    {winnerMessage}
                                </h2>
                            </div>
                        )}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-lg text-center flex items-center justify-center space-x-4 border border-gray-700 w-auto z-10">
                            <div className="flex flex-col items-center">
                                <img src={playerTeam.logoUrl} alt={playerTeam.name} className="w-8 h-8 md:w-12 md:h-12 rounded-full mb-1"/>
                                <span className="text-2xl md:text-4xl font-bold text-blue-400 transition-all duration-300">{animatedScores.player}</span>
                            </div>
                            <span className="text-2xl md:text-4xl text-gray-500 font-light">:</span>
                            <div className="flex flex-col items-center">
                                <img src={opponentTeam.logoUrl} alt={opponentTeam.name} className="w-8 h-8 md:w-12 md:h-12 rounded-full mb-1"/>
                                <span className="text-2xl md:text-4xl font-bold text-red-400 transition-all duration-300">{animatedScores.opponent}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onGameEnd}
                        disabled={isSimulating}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isSimulating ? `Đang mô phỏng...` : `Kết thúc ván ${game.gameNumber}`}
                    </button>
                </div>
                
                <div className="col-span-3 space-y-2">
                    <div className="flex items-center flex-row-reverse space-x-2 space-x-reverse p-2 bg-red-900/40 rounded-t-lg">
                        <img src={opponentTeam.logoUrl} alt={opponentTeam.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                        <span className="text-lg font-bold text-red-300 truncate">{opponentTeam.name}</span>
                    </div>
                    {opponentStarters.map((p, i) => <PlayerDisplay key={p.id} player={p} hero={opponentPicks[i]} isPlayerTeam={false} />)}
                </div>
            </div>
        </div>
    );
};