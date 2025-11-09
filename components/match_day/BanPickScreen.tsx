import React, { useState, useEffect, useMemo } from 'react';
import { Team, Player, Hero, PlayerRole, HeroRole } from '../../types';

interface BanPickScreenProps {
    playerTeam: Team;
    opponentTeam: Team;
    onComplete: (picks: { player: Hero[], opponent: Hero[] }) => void;
    gameNumber: number;
    playerRoster: Player[];
    opponentRoster: Player[];
    heroPool: Hero[];
}

const HeroCard: React.FC<{ hero: Hero; onClick: () => void; isDisabled: boolean; isPicked: boolean; isBanned: boolean; }> = ({ hero, onClick, isDisabled, isPicked, isBanned }) => {
    let stateClasses = '';
    if (isBanned) stateClasses = 'grayscale brightness-50';
    else if (isPicked) stateClasses = 'opacity-50';

    return (
        <button
            onClick={onClick}
            disabled={isDisabled || isBanned || isPicked}
            className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200 transform disabled:cursor-not-allowed group ${!isDisabled && !isBanned && !isPicked ? 'hover:scale-105' : ''}`}
        >
            <img src={hero.imageUrl} alt={hero.name} className={`w-full h-full object-cover ${stateClasses}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <p className="absolute bottom-1 left-2 text-sm font-bold text-white group-hover:text-cyan-300">{hero.name}</p>
            {isBanned && <div className="absolute inset-0 bg-red-800/70 flex items-center justify-center font-bold text-xl text-white">BANNED</div>}
            {isPicked && <div className="absolute inset-0 bg-gray-800/70 flex items-center justify-center font-bold text-xl text-white">PICKED</div>}
        </button>
    );
};

const PickSlot: React.FC<{ player?: Player, hero?: Hero, isPicking?: boolean }> = ({ player, hero, isPicking }) => (
    <div className={`flex flex-col items-center p-1.5 rounded-md min-w-0 h-full justify-between ${isPicking ? 'bg-cyan-500/30 animate-pulse' : 'bg-gray-800/50'}`}>
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center mb-1">
            {hero ? <img src={hero.imageUrl} alt={hero.name} className="w-full h-full object-cover rounded-md" /> : <span className="text-gray-500 text-xl lg:text-2xl">?</span>}
        </div>
        <div className="w-full text-center">
            <p className="font-bold text-xs lg:text-sm truncate">{player?.ign || '...'}</p>
            <p className="text-[10px] lg:text-xs text-gray-400">{player?.role || '...'}</p>
        </div>
    </div>
);


const BanSlot: React.FC<{ hero?: Hero }> = ({ hero }) => (
    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800/50 rounded-md flex items-center justify-center flex-shrink-0">
        {hero ? <img src={hero.imageUrl} alt={hero.name} className="w-full h-full object-cover rounded-md grayscale" /> : <span className="text-gray-500 text-xl font-bold">X</span>}
    </div>
);

const rolesOrder: PlayerRole[] = [PlayerRole.Top, PlayerRole.Jungle, PlayerRole.Mid, PlayerRole.Adc, PlayerRole.Support];

// Helper to get suitable hero roles for a player's role.
const getValidHeroRolesForPlayerRole = (playerRole: PlayerRole): HeroRole[] => {
    switch(playerRole) {
        case PlayerRole.Top: return [HeroRole.Warrior, HeroRole.Tank];
        case PlayerRole.Jungle: return [HeroRole.Assassin, HeroRole.Warrior];
        case PlayerRole.Mid: return [HeroRole.Mage, HeroRole.Assassin];
        case PlayerRole.Adc: return [HeroRole.Marksman];
        case PlayerRole.Support: return [HeroRole.Support, HeroRole.Tank];
        default: return Object.values(HeroRole);
    }
};

const getRandom = (arr: any[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;


// --- AI LOGIC HELPERS ---

// AI Ban Strategies
const banMeta = (available: Hero[]) => getRandom(available.slice(0, 5));

const banTargetPlayer = (available: Hero[], targetRoster: Player[]) => {
    const bestPlayer = [...targetRoster].sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro))[0];
    if (!bestPlayer) return banMeta(available);
    
    const validRoles = getValidHeroRolesForPlayerRole(bestPlayer.role);
    const targets = available.filter(h => validRoles.includes(h.role)).sort((a,b) => (b.mechanics+b.macro) - (a.mechanics+a.macro)).slice(0, 3);
    return getRandom(targets) || banMeta(available);
};

const banHighImpactRole = (available: Hero[]) => {
    const highImpactRoles: HeroRole[] = [HeroRole.Assassin, HeroRole.Marksman];
    const targets = available.filter(h => highImpactRoles.includes(h.role)).slice(0, 3);
    return getRandom(targets) || banMeta(available);
};

const protectCarryBan = (available: Hero[], ownRoster: Player[]) => {
    const ourCarry = ownRoster.find(p => p.role === PlayerRole.Adc);
    if (!ourCarry) return null; // Strategy fails if no carry

    // Find strong assassins to ban
    const assassins = available.filter(h => h.role === HeroRole.Assassin);
    assassins.sort((a, b) => b.mechanics - a.mechanics); // Sort by mechanics

    return assassins.length > 0 ? assassins[0] : null; // Ban the top assassin
};

const banPlayerStrongestHero = (available: Hero[], playerRoster: Player[]) => {
    const bestPlayer = [...playerRoster].sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro))[0];
    if (!bestPlayer) return null;
    
    const validRoles = getValidHeroRolesForPlayerRole(bestPlayer.role);
    const targets = available.filter(h => validRoles.includes(h.role)).sort((a,b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    
    return targets.length > 0 ? targets[0] : null; // Ban the absolute best hero for their role
};

const banToProtectWeakLink = (available: Hero[], ownRoster: Player[]) => {
    const weakLink = [...ownRoster].sort((a, b) => (a.mechanics + a.macro) - (b.mechanics + b.macro))[0];
    if (!weakLink) return null;

    // Simple counter logic: if weak link is ADC or an immobile Mid, ban a top assassin.
    if (weakLink.role === PlayerRole.Adc || weakLink.role === PlayerRole.Mid) {
        const assassins = available.filter(h => h.role === HeroRole.Assassin).sort((a,b) => b.mechanics - a.mechanics);
        return assassins.length > 0 ? assassins[0] : null;
    }
    return null; // This strategy is less effective for other roles, so it can fail.
};


// AI Pick Logic
const getAiPick = (
    availableHeroes: Hero[], 
    playerForRole: Player, 
    ownPicksSoFar: Hero[], 
    opponentPicksSoFar: Hero[]
): Hero | null => {
    const validHeroRoles = getValidHeroRolesForPlayerRole(playerForRole.role);
    let candidates = availableHeroes.filter(h => validHeroRoles.includes(h.role));

    if (candidates.length === 0) {
        candidates = availableHeroes; // Fallback to any available hero
    }
    if (candidates.length === 0) {
        return null; // No heroes left
    }


    const scoredCandidates = candidates.map(hero => {
        let score = (hero.mechanics + hero.macro) * 0.7; // Base score

        // Synergy check
        const ownRoles = ownPicksSoFar.map(h => h.role);
        if (ownRoles.includes(HeroRole.Assassin) && (hero.role === HeroRole.Assassin || hero.role === HeroRole.Tank)) {
            score += 15; // Dive synergy
        }
        if (ownRoles.includes(HeroRole.Mage) && hero.role === HeroRole.Tank) {
            score += 10; // Frontline for mage
        }

        // Counter check (simple version)
        const opponentRoles = opponentPicksSoFar.map(h => h.role);
        const opponentAssassins = opponentRoles.filter(r => r === HeroRole.Assassin).length;
        if ((hero.role === HeroRole.Tank || hero.role === HeroRole.Support) && opponentAssassins > 0) {
            score += 12; // Need peel for assassins
        }
        const opponentTanks = opponentRoles.filter(r => r === HeroRole.Tank).length;
        if (hero.role === HeroRole.Marksman && opponentTanks > 1) {
            score += 10; // Need tank shredder
        }

        // Player preference (simulated)
        if (playerForRole.mechanics > 88 && hero.mechanics > 88) score += 8;
        if (playerForRole.macro > 88 && hero.macro > 88) score += 8;
        
        // Add randomness
        score += Math.random() * 5;

        return { hero, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // Add diversity logic
    const randomFactor = Math.random();
    if (randomFactor < 0.65 || scoredCandidates.length < 2) { // 65% chance to pick the best, or if only one choice
        return scoredCandidates[0]?.hero || null;
    } else if (randomFactor < 0.9) { // 25% chance to pick the 2nd best
        return scoredCandidates[1]?.hero || scoredCandidates[0]?.hero || null;
    } else { // 10% chance to pick from top 5 (surprise pick)
        const top5 = scoredCandidates.slice(0, 5);
        return getRandom(top5)?.hero || scoredCandidates[0]?.hero || null;
    }
}


export const BanPickScreen: React.FC<BanPickScreenProps> = ({ playerTeam, opponentTeam, onComplete, gameNumber, playerRoster, opponentRoster, heroPool }) => {
    const [phase, setPhase] = useState<string>('ban');
    const [turn, setTurn] = useState<'player' | 'opponent'>('player');
    const [playerBans, setPlayerBans] = useState<Hero[]>([]);
    const [opponentBans, setOpponentBans] = useState<Hero[]>([]);
    const [playerPicks, setPlayerPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
    const [opponentPicks, setOpponentPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    const pickOrder: { team: 'player' | 'opponent', role: PlayerRole }[] = useMemo(() => [
        { team: 'player', role: rolesOrder[0] }, // P1 Top
        { team: 'opponent', role: rolesOrder[0] }, // O1 Top
        { team: 'opponent', role: rolesOrder[1] }, // O2 Jungle
        { team: 'player', role: rolesOrder[1] }, // P2 Jungle
        { team: 'player', role: rolesOrder[2] }, // P3 Mid
        { team: 'opponent', role: rolesOrder[2] }, // O3 Mid
        { team: 'opponent', role: rolesOrder[3] }, // O4 ADC
        { team: 'player', role: rolesOrder[3] }, // P4 ADC
        { team: 'player', role: rolesOrder[4] }, // P5 Supp
        { team: 'opponent', role: rolesOrder[4] }, // O5 Supp
    ], []);

    const currentPickIndex = useMemo(() => playerPicks.filter(Boolean).length + opponentPicks.filter(Boolean).length, [playerPicks, opponentPicks]);

    const statusText = useMemo(() => {
        if (phase === 'ban') {
            const totalBans = playerBans.length + opponentBans.length;
            if (totalBans >= 4) return "Chuẩn bị chọn tướng...";
            return turn === 'player' ? 'Đến lượt bạn CẤM' : 'Đối phương đang CẤM';
        }
        if (phase === 'pick') {
             if (currentPickIndex >= 10) return "Hoàn tất chọn tướng!";
             const currentPickTurn = pickOrder[currentPickIndex];
             return currentPickTurn.team === 'player' ? `Đến lượt bạn CHỌN cho vị trí ${currentPickTurn.role}` : `Đối phương đang CHỌN cho ${currentPickTurn.role}`;
        }
        return `Ván ${gameNumber}`;
    }, [phase, turn, playerBans, opponentBans, currentPickIndex, gameNumber, pickOrder]);
    
    const pickedOrBannedIds = useMemo(() => {
        const bannedIds = [...playerBans, ...opponentBans].map(h => h.id);
        const pickedIds = [...playerPicks, ...opponentPicks].filter((h): h is Hero => h !== null).map(h => h.id);
        return new Set([...bannedIds, ...pickedIds]);
    }, [playerBans, opponentBans, playerPicks, opponentPicks]);

    const handleConfirm = () => {
        if (!selectedHero || turn !== 'player') return;

        if (phase === 'ban') {
            setPlayerBans(prev => [...prev, selectedHero]);
            setTurn('opponent');
        } else if (phase === 'pick') {
            const pickInfo = pickOrder[currentPickIndex];
            const roleIndex = rolesOrder.indexOf(pickInfo.role);
            if(roleIndex !== -1 && !playerPicks[roleIndex]) {
                const newPicks = [...playerPicks];
                newPicks[roleIndex] = selectedHero;
                setPlayerPicks(newPicks);
            }
            const nextPickIndex = currentPickIndex + 1;
            if(nextPickIndex < pickOrder.length) {
                setTurn(pickOrder[nextPickIndex].team);
            }
        }
        setSelectedHero(null);
    };

    const aiAction = () => {
        const availableHeroes = heroPool.filter(h => !pickedOrBannedIds.has(h.id))
                                       .sort((a,b) => (b.mechanics + b.macro) - (a.mechanics+a.macro));
    
        if (phase === 'ban' && turn === 'opponent' && opponentBans.length < 2) {
            
            const banStrategies = [
                () => banMeta(availableHeroes), 
                () => banTargetPlayer(availableHeroes, playerRoster), 
                () => banHighImpactRole(availableHeroes),
                () => protectCarryBan(availableHeroes, opponentRoster),
                () => banPlayerStrongestHero(availableHeroes, playerRoster),
                () => banToProtectWeakLink(availableHeroes, opponentRoster),
            ];
            
            let heroToBan: Hero | null | undefined = null;
            // Try a few strategies to ensure a ban happens even if some fail (return null)
            for (let i=0; i < 3; i++) {
                const chosenStrategy = getRandom(banStrategies);
                heroToBan = chosenStrategy();
                if (heroToBan) break;
            }

            if (!heroToBan) { // Ultimate fallback
                heroToBan = banMeta(availableHeroes);
            }
    
            if (heroToBan) {
                setOpponentBans(prev => [...prev, heroToBan]);
            }
    
            setTurn('player');
    
        } else if (phase === 'pick' && turn === 'opponent') {
            const pickInfo = pickOrder[currentPickIndex];
            const roleIndex = rolesOrder.indexOf(pickInfo.role);
    
            if (roleIndex !== -1 && !opponentPicks[roleIndex]) {
                const opponentPlayer = opponentRoster.find(p => p.role === pickInfo.role) || opponentRoster[roleIndex];
                
                if (!opponentPlayer) { 
                    console.error("AI could not find a player for role:", pickInfo.role);
                } else {
                    const ownPicks = opponentPicks.filter((h): h is Hero => h !== null);
                    const oppPicks = playerPicks.filter((h): h is Hero => h !== null);
                    const heroToPick = getAiPick(availableHeroes, opponentPlayer, ownPicks, oppPicks);
                    
                    if (heroToPick) {
                        const newPicks = [...opponentPicks];
                        newPicks[roleIndex] = heroToPick;
                        setOpponentPicks(newPicks);
                    }
                }
                
                const nextPickIndex = currentPickIndex + 1;
                if(nextPickIndex < pickOrder.length) {
                    setTurn(pickOrder[nextPickIndex].team);
                }
            }
        }
    };
    
    const handleAutoBanPick = () => {
        const availableHeroesSet = new Set(heroPool.map(h => h.id));
        const getAvailableHeroes = () => [...heroPool].filter(h => availableHeroesSet.has(h.id))
            .sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    
        let finalPlayerBans: Hero[] = [];
        let finalOpponentBans: Hero[] = [];
        const finalPlayerPicks: (Hero | null)[] = Array(5).fill(null);
        const finalOpponentPicks: (Hero | null)[] = Array(5).fill(null);
    
        const playerBanStrategies = [
            () => banTargetPlayer(getAvailableHeroes(), opponentRoster), 
            () => banHighImpactRole(getAvailableHeroes()),
            () => banMeta(getAvailableHeroes()),
            () => banToProtectWeakLink(getAvailableHeroes(), playerRoster),
        ];
        const opponentBanStrategies = [
            () => banTargetPlayer(getAvailableHeroes(), playerRoster), 
            () => protectCarryBan(getAvailableHeroes(), opponentRoster), 
            () => banMeta(getAvailableHeroes()),
            () => banPlayerStrongestHero(getAvailableHeroes(), playerRoster),
        ];

        // Perform bans
        for (let i = 0; i < 2; i++) {
            let pBan = getRandom(playerBanStrategies)();
            if (pBan) { finalPlayerBans.push(pBan); availableHeroesSet.delete(pBan.id); }
            
            let oBan = getRandom(opponentBanStrategies)();
            if (oBan) { finalOpponentBans.push(oBan); availableHeroesSet.delete(oBan.id); }
        }
    
        // Perform picks
        pickOrder.forEach(({ team, role }) => {
            const roster = team === 'player' ? playerRoster : opponentRoster;
            const currentPicks = team === 'player' ? finalPlayerPicks : finalOpponentPicks;
            const opponentCurrentPicks = team === 'player' ? finalOpponentPicks : finalPlayerPicks;
            
            const playerForRole = roster.find(p => p.role === role) || roster[rolesOrder.indexOf(role)];
            if (!playerForRole) return;

            const ownPicksSoFar = currentPicks.filter((h): h is Hero => h !== null);
            const opponentPicksSoFar = opponentCurrentPicks.filter((h): h is Hero => h !== null);

            const heroToPick = getAiPick(getAvailableHeroes(), playerForRole, ownPicksSoFar, opponentPicksSoFar);
            
            if (heroToPick) {
                const roleIndex = rolesOrder.indexOf(role);
                currentPicks[roleIndex] = heroToPick;
                availableHeroesSet.delete(heroToPick.id);
            }
        });
    
        setPlayerBans(finalPlayerBans);
        setOpponentBans(finalOpponentBans);
        setPlayerPicks(finalPlayerPicks);
        setOpponentPicks(finalOpponentPicks);
        setPhase('pick');
    };

    useEffect(() => {
        if (turn === 'opponent') {
            const timer = setTimeout(aiAction, 1500);
            return () => clearTimeout(timer);
        }
    }, [turn, phase, playerBans.length, opponentBans.length, currentPickIndex]);

    useEffect(() => {
        if (playerBans.length >= 2 && opponentBans.length >= 2 && phase === 'ban') {
            const timer = setTimeout(() => setPhase('pick'), 2000);
            return () => clearTimeout(timer);
        }
    }, [playerBans.length, opponentBans.length, phase]);

    useEffect(() => {
        if (currentPickIndex >= 10) {
             const timer = setTimeout(() => {
                const finalPlayerPicks = rolesOrder.map(role => playerPicks[rolesOrder.indexOf(role)]);
                const finalOpponentPicks = rolesOrder.map(role => opponentPicks[rolesOrder.indexOf(role)]);
                onComplete({
                    player: finalPlayerPicks.filter((p): p is Hero => p !== null),
                    opponent: finalOpponentPicks.filter((p): p is Hero => p !== null),
                });
             }, 2000);
             return () => clearTimeout(timer);
        }
    }, [currentPickIndex, onComplete, playerPicks, opponentPicks]);

    const sortedHeroPool = useMemo(() => [...heroPool].sort((a,b) => a.name.localeCompare(b.name)), [heroPool]);
    
    const getRoleIndex = (role: PlayerRole) => rolesOrder.indexOf(role);

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-gray-700 animate-fade-in">
            <header className="text-center mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-cyan-300 tracking-wider">BAN / PICK - VÁN {gameNumber}</h1>
                <p className="text-lg lg:text-xl font-semibold text-yellow-300">{statusText}</p>
            </header>
            
            <div className="flex justify-between items-center bg-gray-900/40 p-2 rounded-lg mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img src={playerTeam.logoUrl} alt={playerTeam.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex-shrink-0" />
                    <span className="text-lg lg:text-xl font-bold text-blue-300 truncate">{playerTeam.name}</span>
                </div>
                
                <div className="flex items-center space-x-1.5">
                    {Array(2).fill(0).map((_, i) => <BanSlot key={`p-ban-${i}`} hero={playerBans[i]} />)}
                    <span className="text-lg lg:text-xl font-bold text-red-500 mx-1 lg:mx-2">CẤM</span>
                    {Array(2).fill(0).map((_, i) => <BanSlot key={`o-ban-${i}`} hero={opponentBans[i]} />)}
                </div>

                <div className="flex items-center space-x-3 flex-1 min-w-0 justify-end">
                    <span className="text-lg lg:text-xl font-bold text-red-300 truncate">{opponentTeam.name}</span>
                    <img src={opponentTeam.logoUrl} alt={opponentTeam.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex-shrink-0" />
                </div>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
                {playerRoster.map(p => (
                    <PickSlot 
                        key={`player-pick-${p.id}`}
                        player={p} 
                        hero={playerPicks[getRoleIndex(p.role)] || undefined} 
                        isPicking={phase === 'pick' && turn === 'player' && pickOrder[currentPickIndex]?.role === p.role}
                    />
                ))}
                {opponentRoster.map(p => (
                     <PickSlot 
                        key={`opp-pick-${p.id}`}
                        player={p} 
                        hero={opponentPicks[getRoleIndex(p.role)] || undefined} 
                        isPicking={phase === 'pick' && turn === 'opponent' && pickOrder[currentPickIndex]?.role === p.role}
                    />
                ))}
            </div>

            <div className="w-full">
                <button
                    onClick={handleAutoBanPick}
                    disabled={currentPickIndex > 0 || playerBans.length > 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                >
                   Nhờ Trợ Lý Cấm Chọn
                </button>
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[40vh] overflow-y-auto p-2 bg-gray-900/30 rounded-lg">
                    {sortedHeroPool.map(hero => (
                        <HeroCard 
                            key={hero.id} 
                            hero={hero}
                            onClick={() => setSelectedHero(hero)}
                            isDisabled={turn !== 'player' || (selectedHero?.id === hero.id)}
                            isPicked={pickedOrBannedIds.has(hero.id) && !playerBans.some(b => b.id === hero.id) && !opponentBans.some(b => b.id === hero.id)}
                            isBanned={playerBans.some(b => b.id === hero.id) || opponentBans.some(b => b.id === hero.id)}
                        />
                    ))}
                </div>
                <div className="mt-2">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedHero || turn !== 'player'}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {phase === 'ban' ? 'Cấm Tướng' : 'Chọn Tướng'}
                    </button>
                </div>
            </div>

        </div>
    );
};