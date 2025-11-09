import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Team, Player, Match, League, GameState, Split, Tier, RegionName, NewsItem, NewsItemType, GameResult, Hero, PlayerRole, HeroRole, FacilityType, StaffMember, Facility, PotentialRank, StaffRole, HistoricalRecord, ChampionInfo, SponsorSlot, Sponsor, SponsorObjectiveType, PersonalityTrait, TransferRecord, Toast, calculateBuyoutFee, PromisedRole, RandomEvent, RandomEventChoice, SponsorPrestige, SponsorObjective, HallOfFame } from './types';
import { TeamDetailModal } from './components/TeamDetailModal';
import { NewsPanel } from './components/NewsPanel';
import { PlayoffBracket } from './components/PlayoffBracket';
import { TeamManagementView } from './components/TeamManagementView';
import { ScoutingView } from './components/ScoutingView';
import { NegotiationModal } from './components/NegotiationModal';
import { PressConferenceModal } from './components/PressConferenceModal';
import { DramaEventModal } from './components/DramaEventModal';
import { MatchDayContainer } from './components/match_day/MatchDayContainer';
import { SwissStagePanel } from './components/SwissStagePanel';
import { MainMenu } from './components/MainMenu';
import { NewGameSetup } from './components/NewGameSetup';
import { HistoryView } from './components/HistoryView';
import { HERO_POOL as INITIAL_HERO_POOL } from './data/HeroData';
import { DashboardTabs, DashboardTab } from './components/DashboardTabs';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { RosterPanel } from './components/RosterPanel';
import { ManagementPanel } from './components/ManagementPanel';
import { StandingsPanel } from './components/StandingsPanel';
import { SchedulePanel } from './components/SchedulePanel';
import { SponsorshipModal } from './components/SponsorshipModal';
import { SPONSOR_POOL } from './data/SponsorData';
import { HeaderPanel } from './components/HeaderPanel';
import { GroupStagePanel } from './components/GroupStagePanel';
import { InternationalTournamentPanel } from './components/InternationalTournamentPanel';
import { ToastContainer } from './components/ToastContainer';
import { PromotionTournamentPanel } from './components/PromotionTournamentPanel';
import { RandomEventModal } from './components/RandomEventModal';
import { RANDOM_EVENTS } from './data/RandomEventData';
import { ConfirmationModal } from './components/ConfirmationModal';

const NEWS_ID_PREFIX = 'n-';
const SPONSOR_ID_PREFIX = 's-';
const MATCH_ID_PREFIX = 'm-';
let idCounter = 0;

const TIER1_PLAYOFF_PRIZES: Record<number, number> = { 1: 100000, 2: 50000, 3: 25000 }; // 3rd/4th get the same
const TIER2_PLAYOFF_PRIZES: Record<number, number> = { 1: 20000, 2: 10000, 3: 5000 };

const MSI_PRIZES: Record<number, number> = {
    1: 250000, // Champion
    2: 100000, // Runner-up
    4: 50000,  // 3rd-4th (Semi-finalists)
    8: 20000,  // 5th-8th (Quarter-finalists)
    16: 10000, // 9th-16th (Group Stage)
};

const WORLDS_PRIZES: Record<number, number> = {
    1: 500000,
    2: 200000,
    4: 100000,
    8: 50000,
    16: 25000, // Swiss Stage Participants
};


const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const NEW_HERO_NAMES = ['Zylos', 'Vexia', 'Kaelen', 'Lyra', 'Roric', 'Sylas', 'Fenrir', 'Elara', 'Orion', 'Seraphina'];

const calculateInitialRanks = (leaguesToRank: League[]): League[] => {
      return leaguesToRank.map(league => {
        // Initial sort can be by name as all stats are 0
        const sortedTeams = [...league.teams].sort((a, b) => a.name.localeCompare(b.name)); 
        return {
          ...league,
          teams: league.teams.map(team => ({
            ...team,
            rank: sortedTeams.findIndex(t => t.id === team.id) + 1,
          }))
        }
      })
};


const createSchedule = (teams: Team[]): Match[] => {
    const schedule: Match[] = [];
    if (teams.length < 2) return [];
    const scheduleTeams = [...teams];
    if (scheduleTeams.length % 2 !== 0) scheduleTeams.push({ id: 'bye', name: 'BYE' } as any);

    const numWeeks = (scheduleTeams.length - 1) * 2;
    for (let week = 1; week <= numWeeks; week++) {
        for (let i = 0; i < scheduleTeams.length / 2; i++) {
            const teamA = scheduleTeams[i];
            const teamB = scheduleTeams[scheduleTeams.length - 1 - i];
            if (teamA.id === 'bye' || teamB.id === 'bye') continue;

            const matchTeamA = week <= numWeeks / 2 ? teamA : teamB;
            const matchTeamB = week <= numWeeks / 2 ? teamB : teamA;

            schedule.push({
                id: `${MATCH_ID_PREFIX}${idCounter++}`,
                week,
                teamA: { id: matchTeamA.id, name: matchTeamA.name, logoUrl: matchTeamA.logoUrl },
                teamB: { id: matchTeamB.id, name: matchTeamB.name, logoUrl: matchTeamB.logoUrl },
                isPlayed: false,
            });
        }
        scheduleTeams.splice(1, 0, scheduleTeams.pop()!);
    }
    return schedule;
};

const createMsiGroupSchedule = (group: Team[], groupName: 'A' | 'B', year: number): Match[] => {
    const schedule: Match[] = [];
    if (group.length < 2 || group.length % 2 !== 0) {
        console.error("Group for MSI schedule must have an even number of teams.");
        return [];
    };

    const scheduleTeams = [...group];
    const numRounds = scheduleTeams.length - 1;

    for (let round = 1; round <= numRounds; round++) {
        for (let i = 0; i < scheduleTeams.length / 2; i++) {
            const teamA = scheduleTeams[i];
            const teamB = scheduleTeams[scheduleTeams.length - 1 - i];
            
            schedule.push({
                id: `msi-g${groupName}-r${round}-m${i}-${year}`,
                week: round, // Using 'week' for consistency
                isPlayed: false,
                group: groupName,
                teamA: { id: teamA.id, name: teamA.name, logoUrl: teamA.logoUrl },
                teamB: { id: teamB.id, name: teamB.name, logoUrl: teamB.logoUrl },
                round: `Vòng Bảng`
            });
        }
        // Rotate teams for the next round, keeping the first one fixed.
        scheduleTeams.splice(1, 0, scheduleTeams.pop()!);
    }
    return schedule;
};


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

// --- MAIN APP COMPONENT ---
export const App: React.FC = () => {
    const [appState, setAppState] = useState<'main_menu' | 'new_game_setup' | 'game'>('main_menu');
    
    // Game State
    const [leagues, setLeagues] = useState<League[]>([]);
    const [playerTeamId, setPlayerTeamId] = useState<string>('');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [year, setYear] = useState(2024);
    const [gameState, setGameState] = useState<GameState>(GameState.RegularSeason);
    const [split, setSplit] = useState<Split>(Split.Spring);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'dashboard' | 'management' | 'match_day' | 'history'>('dashboard');
    const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [displayedLeagueRegion, setDisplayedLeagueRegion] = useState<RegionName>(RegionName.AOG);
    const [scoutedPlayerIds, setScoutedPlayerIds] = useState<Set<string>>(new Set());
    const [freeAgents, setFreeAgents] = useState<Player[]>([]);
    const [heroPool, setHeroPool] = useState<Hero[]>(INITIAL_HERO_POOL);
    const [gameHistory, setGameHistory] = useState<HistoricalRecord[]>([]);
    const [hallOfFame, setHallOfFame] = useState<HallOfFame | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Modals State
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
    const [negotiationFeedback, setNegotiationFeedback] = useState('');
    const [pressConferenceMatch, setPressConferenceMatch] = useState<{ match: Match, result: { scoreA: number; scoreB: number; }, opponentTeam: Team } | null>(null);
    const [dramaEvent, setDramaEvent] = useState<{ player: Player; description: string; } | null>(null);
    const [sponsorshipOffers, setSponsorshipOffers] = useState<{slot: SponsorSlot, offers: Sponsor[]} | null>(null);
    const [viewedPlayoffBracket, setViewedPlayoffBracket] = useState<{ title: string; matches: Match[]; champion: Team | null; } | null>(null);
    const [activeRandomEvent, setActiveRandomEvent] = useState<{ event: RandomEvent; context: any } | null>(null);
    const [postEventCallback, setPostEventCallback] = useState<(() => void) | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
    } | null>(null);
    
    const [matchDayInfo, setMatchDayInfo] = useState<{ match: Match, playerTeam: Team, opponentTeam: Team} | null>(null);
    
    // Worlds State
    const [worldsParticipants, setWorldsParticipants] = useState<Team[]>([]);
    const [worldsMatches, setWorldsMatches] = useState<Match[]>([]);
    const [swissRound, setSwissRound] = useState(0);
    const [worldChampion, setWorldChampion] = useState<ChampionInfo | null>(null);
    
    // Playoffs State
    const [playoffMatches, setPlayoffMatches] = useState<Match[]>([]);
    const [regionalChampion, setRegionalChampion] = useState<Team | null>(null);
    const [aiPlayoffResults, setAiPlayoffResults] = useState<Record<string, { matches: Match[], champion: Team }>>({});
    const [yearlyChampions, setYearlyChampions] = useState<{ year: number, split: Split, region: RegionName, champion: Team }[]>([]);


    // MSI State
    const [msiData, setMsiData] = useState<{ participants: Team[], groupMatches: Match[], knockoutMatches: Match[], champion?: Team } | null>(null);
    const [promotionMatches, setPromotionMatches] = useState<Match[]>([]);
    const msiCheckInProgress = useRef(false);

    const playerTeam = useMemo(() => {
        if (!playerTeamId) return null;
        return leagues.flatMap(l => l.teams).find(t => t.id === playerTeamId);
    }, [leagues, playerTeamId]);

     const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: Toast['type']) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000); // Remove after 5 seconds
    }, [removeToast]);

    const addNews = useCallback((title: string, content: string, author: string, type: NewsItemType = NewsItemType.GENERAL, metadata?: NewsItem['metadata']) => {
      const newItem: NewsItem = {
        id: `${NEWS_ID_PREFIX}${idCounter++}`,
        title,
        content,
        author,
        date: `${split} ${year}, Tuần ${currentWeek}`,
        type,
        metadata,
      };
      setNews(prev => [newItem, ...prev]);
    }, [split, year, currentWeek]);

    const isTransferWindowOpen = useMemo(() => {
        return [GameState.MidSeasonBreak, GameState.OffSeason, GameState.AITransferWindow, GameState.SeasonEnd].includes(gameState);
    }, [gameState]);

    const awardTrophyAndAchievements = (winningTeamId: string, trophyName: string, currentLeagues: League[]): League[] => {
        return currentLeagues.map(league => ({
            ...league,
            teams: league.teams.map(team => {
                if (team.id === winningTeamId) {
                    const updatedTeam = { ...team };
                    if (!updatedTeam.trophyRoom.includes(trophyName)) {
                        updatedTeam.trophyRoom = [...updatedTeam.trophyRoom, trophyName];
                    }
                    updatedTeam.roster = updatedTeam.roster.map(player => {
                        const playerAchievements = player.achievements || [];
                        if (!playerAchievements.includes(trophyName)) {
                            return { ...player, achievements: [...playerAchievements, trophyName] };
                        }
                        return player;
                    });
                    return updatedTeam;
                }
                return team;
            })
        }));
    };

    const awardPrizeMoneyToLeagues = useCallback((leaguesState: League[], teamId: string, amount: number, prizeName: string): League[] => {
        const newLeagues = JSON.parse(JSON.stringify(leaguesState));
        let teamFound = false;
        for (const league of newLeagues) {
            const team = league.teams.find((t: Team) => t.id === teamId);
            if (team) {
                team.finances.budget += amount;
                teamFound = true;
                if (teamId === playerTeamId) {
                     addToast(`Bạn đã nhận được ${formatCurrency(amount)} tiền thưởng từ ${prizeName}!`, 'success');
                }
                break;
            }
        }
        return newLeagues;
    }, [playerTeamId, addToast]);
    
    const generateRichNewsForMatch = useCallback((teamA: Team, teamB: Team, result: { scoreA: number; scoreB: number; gameResults: GameResult[] }, allLeagues: League[]) => {
        const winner = result.scoreA > result.scoreB ? teamA : teamB;
        const loser = result.scoreA > result.scoreB ? teamB : teamA;
        const score = `${result.scoreA}-${result.scoreB}`;
        
        if (teamA.id === playerTeamId || teamB.id === playerTeamId) {
            const playerWon = winner.id === playerTeamId;
            const opponentName = playerWon ? loser.name : winner.name;
            addToast(`Bạn đã ${playerWon ? 'thắng' : 'thua'} ${opponentName} với tỉ số ${score}!`, playerWon ? 'success' : 'error');
        }

        const isStomp = result.scoreA === 0 || result.scoreB === 0;
        const totalGames = result.gameResults.length;
        const totalKills = result.gameResults.reduce((sum, game) => sum + game.killsA + game.killsB, 0);
        const isBloody = totalGames > 0 && (totalKills / totalGames > 35);

        const mvpGame = result.gameResults.length > 0 ? result.gameResults[result.gameResults.length - 1] : null;
        const mvpPlayer = mvpGame ? allLeagues.flatMap(l => l.teams).flatMap(t => t.roster).find(p => p.id === mvpGame.mvpPlayerId) : null;
        
        const isImportantMatch = teamA.id === playerTeamId || teamB.id === playerTeamId || gameState !== GameState.RegularSeason;

        let title = '';
        let content = '';
        let type = NewsItemType.MATCH_RESULT;
        let metadata: NewsItem['metadata'] | undefined;

        if (mvpPlayer && isImportantMatch) {
            type = NewsItemType.MVP;
            title = `[P:${mvpPlayer.ign}] tỏa sáng, gồng gánh [T:${winner.name}] đến chiến thắng!`;
            
            if (mvpPlayer.mechanics > mvpPlayer.macro + 10) {
                content = `Với kỹ năng cá nhân ở một đẳng cấp khác, [P:${mvpPlayer.ign}] đã tạo ra vô số đột biến, giúp [T:${winner.name}] giành chiến thắng ${score} trước [T:${loser.name}]. Một màn trình diễn MVP không thể bàn cãi!`;
            } else if (mvpPlayer.macro > mvpPlayer.mechanics + 10) {
                content = `Bằng những quyết định di chuyển và kêu gọi giao tranh thông minh, [P:${mvpPlayer.ign}] đã dẫn dắt [T:${winner.name}] tới chiến thắng ${score}. Một bộ óc vĩ đại đằng sau thành công của cả đội.`;
            } else {
                content = `Không thể ngăn cản! [P:${mvpPlayer.ign}] chính là ngôi sao sáng nhất trong chiến thắng ${score} của [T:${winner.name}]. Màn trình diễn toàn diện của anh ấy đã định đoạt kết quả trận đấu.`;
            }
            metadata = {
                mvpPlayer: { ign: mvpPlayer.ign, avatarUrl: mvpPlayer.avatarUrl },
                winningTeam: { name: winner.name, logoUrl: winner.logoUrl },
                losingTeam: { name: loser.name, logoUrl: loser.logoUrl },
                score: score,
            };

        } else {
            title = `[T:${winner.name}] giành chiến thắng ${score} trước [T:${loser.name}]!`;
            if (isStomp) {
                content = `[T:${winner.name}] đã thể hiện sức mạnh vượt trội, hủy diệt [T:${loser.name}] với tỉ số trắng ${score}. Một chiến thắng không thể áp đảo hơn để khẳng định vị thế.`;
            } else if (isBloody) {
                 content = `Khán giả đã được chứng kiến một bữa tiệc giao tranh mãn nhãn với tổng cộng ${totalKills} điểm hạ gục. Liên tục là những pha ăn miếng trả miếng, nhưng cuối cùng [T:${winner.name}] là đội tận dụng cơ hội tốt hơn để kết thúc trận đấu với tỉ số ${score}.`;
            } else {
                 content = `Một trận đấu nghẹt thở đến giây phút cuối cùng! Sau một loạt giao tranh căng thẳng, [T:${winner.name}] đã thể hiện bản lĩnh và giành chiến thắng sít sao ${score} trước [T:${loser.name}].`;
            }
        }
        
        addNews(title, content, "Phóng Viên Thể Thao", type, metadata);

    }, [addNews, playerTeamId, addToast, gameState]);
    
    const handleSaveGame = useCallback(() => {
        if (!playerTeam) return;
        try {
            const gameStateToSave = {
                leagues,
                playerTeamId,
                currentWeek,
                year,
                gameState,
                split,
                news,
                scoutedPlayerIds: Array.from(scoutedPlayerIds),
                freeAgents,
                displayedLeagueRegion,
                view,
                dashboardTab,
                heroPool,
                gameHistory,
                hallOfFame,
                worldChampion,
                playoffMatches,
                regionalChampion,
                promotionMatches,
                msiData,
                aiPlayoffResults,
                yearlyChampions,
            };
            const dataStr = JSON.stringify(gameStateToSave, null, 2); // Pretty print JSON
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            link.download = `esports_manager_save_${playerTeam.name.replace(/\s/g, '_')}_${date}.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast("Đã lưu game thành công!", "success");
        } catch (error) {
            console.error("Failed to save game:", error);
            addToast("Lưu game thất bại!", "error");
        }
    }, [leagues, playerTeamId, currentWeek, year, gameState, split, news, scoutedPlayerIds, freeAgents, displayedLeagueRegion, view, dashboardTab, playerTeam, heroPool, gameHistory, hallOfFame, worldChampion, playoffMatches, regionalChampion, addToast, promotionMatches, msiData, aiPlayoffResults, yearlyChampions]);

    const handleLoadGameFromFile = useCallback((jsonContent: string) => {
        if (jsonContent) {
            try {
                const savedState = JSON.parse(jsonContent);
                setLeagues(savedState.leagues);
                setPlayerTeamId(savedState.playerTeamId);
                setCurrentWeek(savedState.currentWeek);
                setYear(savedState.year);
                setGameState(savedState.gameState);
                setSplit(savedState.split);
                setNews(savedState.news);
                setScoutedPlayerIds(new Set(savedState.scoutedPlayerIds)); // Convert back to Set
                setFreeAgents(savedState.freeAgents);
                setDisplayedLeagueRegion(savedState.displayedLeagueRegion);
                setView(savedState.view || 'dashboard');
                setDashboardTab(savedState.dashboardTab || 'overview');
                setHeroPool(savedState.heroPool || INITIAL_HERO_POOL);
                setGameHistory(savedState.gameHistory || []);
                setHallOfFame(savedState.hallOfFame || null);
                setWorldChampion(savedState.worldChampion || null);
                setPlayoffMatches(savedState.playoffMatches || []);
                setRegionalChampion(savedState.regionalChampion || null);
                setPromotionMatches(savedState.promotionMatches || []);
                setMsiData(savedState.msiData || null);
                setAiPlayoffResults(savedState.aiPlayoffResults || {});
                setYearlyChampions(savedState.yearlyChampions || []);
                setAppState('game');
                addToast("Tải game thành công!", "success");
            } catch (error) {
                console.error("Failed to load game from file:", error);
                addToast('Tải game thất bại. File save có thể đã bị hỏng.', "error");
            }
        } else {
            addToast('Không tìm thấy nội dung file save!', "error");
        }
    }, [addToast]);

    const handleNewGameStart = useCallback((teamId: string, customName: string, allLeagues: League[], initialFreeAgents: Player[]) => {
        const leaguesWithCustomName = JSON.parse(JSON.stringify(allLeagues));
        let originalTeam: Team | null = null;

        // Find the original team to get its name before modification
        for (const league of leaguesWithCustomName) {
            const team = league.teams.find((t: Team) => t.id === teamId);
            if (team) {
                originalTeam = { ...team }; // Copy it
                team.name = customName; // Rename it in the structure
                break;
            }
        }

        // If the name was actually changed, update all schedules
        if (originalTeam && originalTeam.name !== customName) {
            for (const league of leaguesWithCustomName) {
                for (const match of league.schedule) {
                    if (match.teamA.id === teamId) {
                        match.teamA.name = customName;
                    }
                    if (match.teamB.id === teamId) {
                        match.teamB.name = customName;
                    }
                }
            }
        }
        
        const rankedLeagues = calculateInitialRanks(leaguesWithCustomName);
        setLeagues(rankedLeagues);
        setPlayerTeamId(teamId);
        const playerLeague = rankedLeagues.find((l: League) => l.teams.some((t: Team) => t.id === teamId));
        setDisplayedLeagueRegion(playerLeague?.region || RegionName.AOG);
        
        // Reset all other game state variables
        setCurrentWeek(1);
        setYear(2024);
        setGameState(GameState.RegularSeason);
        setSplit(Split.Spring);
        setNews([]);
        setScoutedPlayerIds(new Set());
        setFreeAgents(initialFreeAgents);
        setView('dashboard');
        setDashboardTab('overview');
        setHeroPool(INITIAL_HERO_POOL);
        setGameHistory([]);
        setHallOfFame(null);
        setWorldChampion(null);
        setPlayoffMatches([]);
        setRegionalChampion(null);
        setMsiData(null);
        setPromotionMatches([]);
        setAiPlayoffResults({});
        setYearlyChampions([]);
        
        addNews('Sự nghiệp mới bắt đầu!', `Bạn đã tiếp quản [T:${customName}]. Chúc bạn may mắn!`, 'Ban Tổ Chức');
        
        setAppState('game');
    }, [addNews]);

    const updatePlayerStatsAfterMatch = (roster: Player[], wonMatch: boolean): Player[] => {
        return roster.map(player => {
            // Stamina decreases
            const newStamina = Math.max(0, player.stamina - getRandomNumber(15, 25));
            
            // Morale changes based on result
            const moraleChange = wonMatch ? getRandomNumber(5, 10) : -getRandomNumber(5, 10);
            const newMorale = Math.max(0, Math.min(100, player.morale + moraleChange));

            // Form changes based on result, but tends to revert to mean
            const baseSkill = (player.mechanics + player.macro) / 2;
            const formChange = wonMatch ? getRandomNumber(3, 7) : -getRandomNumber(3, 7);
            const newForm = Math.max(0, Math.min(100, player.form * 0.8 + baseSkill * 0.2 + formChange));
            
            return { ...player, stamina: newStamina, morale: newMorale, form: newForm };
        });
    };

    const applyMatchResultToLeagues = (
      currentLeagues: League[], 
      match: Match, 
      result: { scoreA: number, scoreB: number, gameResults: GameResult[] },
      rosterA: Player[],
      rosterB: Player[]
    ): League[] => {
        // Create a map to aggregate hero usage stats for all players in the match
        const heroStatsToAdd = new Map<string, Record<string, number>>();
        result.gameResults.forEach(game => {
            rosterA.forEach((player, i) => {
                const heroId = game.picks.teamA[i]?.id;
                if (!heroId) return;
                const stats = heroStatsToAdd.get(player.id) || {};
                stats[heroId] = (stats[heroId] || 0) + 1;
                heroStatsToAdd.set(player.id, stats);
            });
            rosterB.forEach((player, i) => {
                const heroId = game.picks.teamB[i]?.id;
                if (!heroId) return;
                const stats = heroStatsToAdd.get(player.id) || {};
                stats[heroId] = (stats[heroId] || 0) + 1;
                heroStatsToAdd.set(player.id, stats);
            });
        });

        let leaguesWithUpdates = [...currentLeagues];

        // Process MVP awards first across all leagues
        result.gameResults.forEach(game => {
            let mvpFound = false;
            leaguesWithUpdates = leaguesWithUpdates.map(league => {
                if (mvpFound) return league;
                return {
                    ...league,
                    teams: league.teams.map(team => {
                        const playerIndex = team.roster.findIndex(p => p.id === game.mvpPlayerId);
                        if (playerIndex !== -1) {
                            mvpFound = true;
                            const updatedRoster = [...team.roster];
                            updatedRoster[playerIndex] = { ...updatedRoster[playerIndex], mvpAwards: updatedRoster[playerIndex].mvpAwards + 1 };
                            return { ...team, roster: updatedRoster };
                        }
                        return team;
                    })
                };
            });
        });

      return leaguesWithUpdates.map(league => {
        const matchIndex = league.schedule.findIndex(m => m.id === match.id);
        if (matchIndex === -1) {
          return league;
        }

        const updatedSchedule = [...league.schedule];
        updatedSchedule[matchIndex] = {
          ...match,
          result: { scoreA: result.scoreA, scoreB: result.scoreB },
          isPlayed: true,
          gameResults: result.gameResults,
          teamA_Starters: rosterA,
          teamB_Starters: rosterB,
        };
        
        const updatedTeams = league.teams.map(team => {
            let updatedTeam = { ...team };
            const isTeamA = team.id === match.teamA.id;
            const isTeamB = team.id === match.teamB.id;
            
            if (isTeamA || isTeamB) {
                const wonMatch = (isTeamA && result.scoreA > result.scoreB) || (isTeamB && result.scoreB > result.scoreA);
                const matchRoster = isTeamA ? rosterA : rosterB;
                
                updatedTeam.roster = team.roster.map(player => {
                    if (matchRoster.some(p => p.id === player.id)) {
                        let updatedPlayer = updatePlayerStatsAfterMatch([player], wonMatch)[0];
                        
                        const statsToAdd = heroStatsToAdd.get(player.id);
                        if (statsToAdd) {
                            const newHeroStats = { ...(updatedPlayer.heroStats || {}) };
                            for (const heroId in statsToAdd) {
                                newHeroStats[heroId] = (newHeroStats[heroId] || 0) + statsToAdd[heroId];
                            }
                            updatedPlayer.heroStats = newHeroStats;
                        }
                        return updatedPlayer;
                    }
                    return player;
                });
                
                if (isTeamA) {
                    updatedTeam.wins = wonMatch ? team.wins + 1 : team.wins;
                    updatedTeam.losses = !wonMatch ? team.losses + 1 : team.losses;
                    updatedTeam.roundsWon += result.scoreA;
                    updatedTeam.roundsLost += result.scoreB;
                } else if (isTeamB) {
                    updatedTeam.wins = wonMatch ? team.wins + 1 : team.wins;
                    updatedTeam.losses = !wonMatch ? team.losses + 1 : team.losses;
                    updatedTeam.roundsWon += result.scoreB;
                    updatedTeam.roundsLost += result.scoreA;
                }
            }
          
            return updatedTeam;
        });

        return { ...league, teams: updatedTeams, schedule: updatedSchedule };
      });
    };

    const performWeeklyUpdates = (currentLeagues: League[]): League[] => {
        return currentLeagues.map(league => {
          const sortedTeams = [...league.teams].sort((a,b) => b.wins - a.wins || (a.roundsWon - a.roundsLost) - (b.roundsWon - b.roundsLost) || a.losses - b.losses);
            return {
                ...league,
                teams: league.teams.map(team => {
                    const rank = sortedTeams.findIndex(t => t.id === team.id) + 1;
                    let fanChange = 0;
                    let repChange = 0;
                    if (team.id !== playerTeamId) { // AI teams have simpler updates
                        if (rank <= 2) {
                            fanChange = getRandomNumber(100, 300);
                            repChange = Math.random() * 0.5;
                        } else if (rank >= 7) {
                            fanChange = -getRandomNumber(50, 150);
                            repChange = - (Math.random() * 0.5);
                        }
                    }
                    
                    const currentFanCount = team.fanCount || (team.tier === Tier.Tier1 ? 50000 : 10000);
                    
                    return {
                        ...team,
                        rank,
                        fanCount: Math.max(1000, currentFanCount + fanChange),
                        reputation: Math.max(0, Math.min(100, team.reputation + repChange)),
                        // Financial updates
                        finances: {
                            ...team.finances,
                            budget: team.finances.budget + team.finances.weeklyIncome - team.finances.salaryExpenses - team.finances.maintenanceCosts,
                        },
                        // Player stat recovery
                        roster: team.roster.map(player => ({
                            ...player,
                            stamina: Math.min(100, player.stamina + getRandomNumber(10, 20)), // Recover stamina
                            // Form slowly reverts to mean
                            form: Math.round(player.form * 0.95 + ((player.mechanics + player.macro) / 2) * 0.05) 
                        }))
                    }
                }),
            }
        });
    };

    const simulateMatchFn = (teamA: Team, teamB: Team, rosterA: Player[], rosterB: Player[], picksA: Hero[], picksB: Hero[], format: 'BO1' | 'BO3' | 'BO5' | 'BO7', gameState?: GameState): { scoreA: number, scoreB: number, gameResults: GameResult[] } => {
        const getPlayerEffectivePower = (player: Player, hero: Hero): number => {
            // 1. Combine player and hero stats (60% player, 40% hero)
            const effectiveMechanics = (player.mechanics * 0.6) + (hero.mechanics * 0.4);
            const effectiveMacro = (player.macro * 0.6) + (hero.macro * 0.4);
            const basePower = effectiveMechanics + effectiveMacro;

            // 2. Dynamic multipliers based on current condition
            const formMultiplier = 0.9 + (player.form / 100) * 0.2;
            const staminaMultiplier = 0.85 + (player.stamina / 100) * 0.15;
            const moraleMultiplier = 0.95 + (player.morale / 100) * 0.1;
            const dynamicMultiplier = formMultiplier * staminaMultiplier * moraleMultiplier;
            
            // 3. Off-role penalty (based on hero role vs player role)
            const isOffRole = {
                [PlayerRole.Top]: ![HeroRole.Warrior, HeroRole.Tank].includes(hero.role),
                [PlayerRole.Jungle]: ![HeroRole.Assassin, HeroRole.Warrior].includes(hero.role),
                [PlayerRole.Mid]: ![HeroRole.Mage, HeroRole.Assassin].includes(hero.role),
                [PlayerRole.Adc]: ![HeroRole.Marksman].includes(hero.role),
                [PlayerRole.Support]: ![HeroRole.Support, HeroRole.Tank].includes(hero.role),
            }[player.role];
            const offRolePenalty = isOffRole ? 0.80 : 1.0;

            return basePower * dynamicMultiplier * offRolePenalty;
        };
        
        const getTeamPower = (team: Team, roster: Player[], picks: Hero[]): number => {
            const individualPowerSum = roster.reduce((sum, player, index) => {
                // Fix: The `picks` array is ordered to correspond with the `roster` array by index.
                // The previous logic `picks.find(h => h.role === player.role)` was incorrect as it compared HeroRole with PlayerRole.
                const heroForPlayer = picks[index];
                if (!heroForPlayer) {
                    return sum;
                }
                return sum + getPlayerEffectivePower(player, heroForPlayer);
            }, 0);

            const analyst = team.staff.find(s => s.role === StaffRole.Analyst);
            const analystBonus = analyst ? 1 + (analyst.level * 0.01) : 1.0;

            let finalPower = individualPowerSum * analystBonus;
            
            if (gameState === GameState.PromotionRelegation) {
                if (team.tier === Tier.Tier2) finalPower *= 1.15;
                if (team.tier === Tier.Tier1) finalPower *= 0.9;
            }

            return finalPower;
        };
        
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
        
        const gamesToWin = { 'BO1': 1, 'BO3': 2, 'BO5': 3, 'BO7': 4 }[format];
        let scoreA = 0;
        let scoreB = 0;
        const gameResults: GameResult[] = [];
        
        let currentRosterA = JSON.parse(JSON.stringify(rosterA));
        let currentRosterB = JSON.parse(JSON.stringify(rosterB));

        for(let i = 1; i <= parseInt(format.slice(-1)); i++) {
            if (scoreA >= gamesToWin || scoreB >= gamesToWin) break;
            
            // Fix: Correctly generate picks for AI matches by mapping PlayerRole to valid HeroRoles.
            // If picks are provided (for player-controlled matches), use them. This is typically for a single game (BO1).
            const gamePicksA = (format === 'BO1' && picksA.length > 0) ? picksA : rosterA.map(p => {
                const validRoles = getValidHeroRolesForPlayerRole(p.role);
                return getRandom(heroPool.filter(h => validRoles.includes(h.role))) || getRandom(heroPool);
            });
            const gamePicksB = (format === 'BO1' && picksB.length > 0) ? picksB : rosterB.map(p => {
                const validRoles = getValidHeroRolesForPlayerRole(p.role);
                return getRandom(heroPool.filter(h => validRoles.includes(h.role))) || getRandom(heroPool);
            });

            const gamePowerA = getTeamPower(teamA, currentRosterA, gamePicksA);
            const gamePowerB = getTeamPower(teamB, currentRosterB, gamePicksB);

            const winner = Math.random() * (gamePowerA + gamePowerB) < gamePowerA ? 'teamA' : 'teamB';
            
            const [winningRoster, winningPicks] = winner === 'teamA' ? [currentRosterA, gamePicksA] : [currentRosterB, gamePicksB];
            
            if (winner === 'teamA') scoreA++; else scoreB++;

            const mvpCandidatesWithScores = winningRoster.map((p: Player, index: number) => ({
                player: p,
                mvpScore: getPlayerEffectivePower(p, winningPicks[index])
            }));

            const totalMvpScore = mvpCandidatesWithScores.reduce((sum: number, candidate: any) => sum + candidate.mvpScore, 0);
            let randomPick = Math.random() * totalMvpScore;
            let mvp: Player | null = null;

            for (const candidate of mvpCandidatesWithScores) {
                randomPick -= candidate.mvpScore;
                if (randomPick <= 0) { mvp = candidate.player; break; }
            }
            if (!mvp) mvp = mvpCandidatesWithScores.sort((a, b) => b.mvpScore - a.mvpScore)[0].player;
            
            const killsA = getRandomNumber(5, 25);
            const killsB = getRandomNumber(5, 25);

            gameResults.push({ 
                gameNumber: i, 
                winner, 
                duration: `${getRandomNumber(15, 25)}:${getRandomNumber(10, 59)}`, 
                events: [], 
                picks: { teamA: gamePicksA, teamB: gamePicksB },
                killsA: winner === 'teamA' ? Math.max(killsA, killsB) : Math.min(killsA, killsB),
                killsB: winner === 'teamB' ? Math.max(killsA, killsB) : Math.min(killsA, killsB),
                mvpPlayerId: mvp!.id,
            });

            currentRosterA = currentRosterA.map((p: Player) => ({...p, stamina: Math.max(0, p.stamina - getRandomNumber(8, 15))}));
            currentRosterB = currentRosterB.map((p: Player) => ({...p, stamina: Math.max(0, p.stamina - getRandomNumber(8, 15))}));
        }
        
        return { scoreA, scoreB, gameResults };
    };


    const simulateFullPlayoffs = (league: League): { matches: Match[], champion: Team | null } => {
        const sortedTeams = [...league.teams].sort((a, b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
        const top4 = sortedTeams.slice(0, 4);
        if (top4.length < 4) return { matches: [], champion: top4[0] || null };

        const semi1: Match = { id: `sim-pf1-${league.region}-${split}`, week: 15, teamA: {id: top4[0].id, name: top4[0].name, logoUrl: top4[0].logoUrl}, teamB: {id: top4[3].id, name: top4[3].name, logoUrl: top4[3].logoUrl}, isPlayed: false, round: 'Bán Kết' };
        const semi2: Match = { id: `sim-pf2-${league.region}-${split}`, week: 15, teamA: {id: top4[1].id, name: top4[1].name, logoUrl: top4[1].logoUrl}, teamB: {id: top4[2].id, name: top4[2].name, logoUrl: top4[2].logoUrl}, isPlayed: false, round: 'Bán Kết' };
        
        const semi1Result = simulateMatchFn(top4[0], top4[3], top4[0].roster, top4[3].roster, [], [], 'BO5', GameState.Playoffs);
        semi1.result = { scoreA: semi1Result.scoreA, scoreB: semi1Result.scoreB };
        semi1.isPlayed = true;
        const winner1 = semi1Result.scoreA > semi1Result.scoreB ? semi1.teamA : semi1.teamB;
        
        const semi2Result = simulateMatchFn(top4[1], top4[2], top4[1].roster, top4[2].roster, [], [], 'BO5', GameState.Playoffs);
        semi2.result = { scoreA: semi2Result.scoreA, scoreB: semi2Result.scoreB };
        semi2.isPlayed = true;
        const winner2 = semi2Result.scoreA > semi2Result.scoreB ? semi2.teamA : semi2.teamB;

        const finalMatch: Match = { id: `sim-final-${league.region}-${split}`, week: 16, round: 'Chung Kết', isPlayed: false, teamA: winner1, teamB: winner2 };
        const finalTeamA = league.teams.find(t => t.id === winner1.id)!;
        const finalTeamB = league.teams.find(t => t.id === winner2.id)!;
        const finalResult = simulateMatchFn(finalTeamA, finalTeamB, finalTeamA.roster, finalTeamB.roster, [], [], 'BO7', GameState.Playoffs);
        finalMatch.result = { scoreA: finalResult.scoreA, scoreB: finalResult.scoreB };
        finalMatch.isPlayed = true;
        const championInfo = finalResult.scoreA > finalResult.scoreB ? finalMatch.teamA : finalMatch.teamB;
        const champion = league.teams.find(t => t.id === championInfo.id)!;

        return { matches: [semi1, semi2, finalMatch], champion };
    };

    const handleResolveRandomEvent = (choice: RandomEventChoice) => {
        if (!playerTeam || !activeRandomEvent) return;

        const { context } = activeRandomEvent;
        const { effects, news: newsInfo } = choice;
        let updatedTeam = { ...playerTeam };
        let playerForNews: Player | undefined;

        // Apply effects
        if (effects.budget) {
            updatedTeam.finances = { ...updatedTeam.finances, budget: updatedTeam.finances.budget + effects.budget };
            addToast(`Ngân sách ${effects.budget > 0 ? '+' : ''}${formatCurrency(effects.budget)}`, 'info');
        }
        if (effects.fanCount) {
            updatedTeam.fanCount = (updatedTeam.fanCount || 0) + effects.fanCount;
            addToast(`Người hâm mộ ${effects.fanCount > 0 ? '+' : ''}${effects.fanCount.toLocaleString()}`, 'info');
        }
        if (effects.reputation) {
            updatedTeam.reputation = Math.max(0, Math.min(100, updatedTeam.reputation + effects.reputation));
            addToast(`Danh tiếng ${effects.reputation > 0 ? '+' : ''}${effects.reputation}`, 'info');
        }
        if (effects.playerStat) {
            let targetPlayer: Player | undefined;
            const { stat, change, target } = effects.playerStat;

            if (target === 'mvp_of_last_match' && context.mvpPlayerId) {
                targetPlayer = updatedTeam.roster.find(p => p.id === context.mvpPlayerId);
            } else if (target === 'lowest_morale') {
                targetPlayer = [...updatedTeam.roster].sort((a, b) => a.morale - b.morale)[0];
            } else { // random_player
                targetPlayer = getRandom(updatedTeam.roster);
            }

            if (targetPlayer) {
                playerForNews = targetPlayer;
                const targetPlayerId = targetPlayer.id;
                updatedTeam.roster = updatedTeam.roster.map(p => {
                    if (p.id === targetPlayerId) {
                        const newValue = Math.max(0, Math.min(100, (p[stat] as number) + change));
                        addToast(`${p.ign} ${stat} ${change > 0 ? '+' : ''}${change}`, 'info');
                        return { ...p, [stat]: newValue };
                    }
                    return p;
                });
            }
        }
        
        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeamId ? updatedTeam : t)
        })));
        
        if (newsInfo) {
            let finalContent = newsInfo.content.replace('{teamName}', playerTeam.name);
            if (playerForNews) {
                 finalContent = finalContent.replace('{playerName}', playerForNews.ign);
            }
            addNews(newsInfo.title, finalContent, "Báo Thể Thao", NewsItemType.GENERAL);
        }

        // Cleanup and chain to next modal if any
        setActiveRandomEvent(null);
        if (postEventCallback) {
            postEventCallback();
            setPostEventCallback(null);
        }
    };

    const handleMatchComplete = (match: Match, result: { scoreA: number, scoreB: number, gameResults: GameResult[] }, playerRoster: Player[], opponentRoster: Player[]) => {
        setIsLoading(true);

        const isPlayerTeamA = match.teamA.id === playerTeamId;
        const rosterA = isPlayerTeamA ? playerRoster : opponentRoster;
        const rosterB = isPlayerTeamA ? opponentRoster : playerRoster;
        
        let updatedLeagues = leagues;

        if (gameState === GameState.RegularSeason) {
            let leaguesAfterPlayerMatch = applyMatchResultToLeagues(leagues, match, result, rosterA, rosterB);
            
            const playerLeagueForNews = leaguesAfterPlayerMatch.find(l => l.schedule.some(m => m.id === match.id))!;
            const teamAForNews = playerLeagueForNews.teams.find(t => t.id === match.teamA.id)!;
            const teamBForNews = playerLeagueForNews.teams.find(t => t.id === match.teamB.id)!;
            generateRichNewsForMatch(teamAForNews, teamBForNews, result, leaguesAfterPlayerMatch);

            let leaguesAfterAllMatches = leaguesAfterPlayerMatch;

            for (const league of leaguesAfterAllMatches) {
                const matchesThisWeek = league.schedule.filter(m => m.week === match.week && !m.isPlayed);
                
                leaguesAfterAllMatches = matchesThisWeek.reduce((currentLeaguesState, aiMatch) => {
                    const teams = currentLeaguesState.flatMap(l => l.teams);
                    const teamA = teams.find(t => t.id === aiMatch.teamA.id)!;
                    const teamB = teams.find(t => t.id === aiMatch.teamB.id)!;
                    
                    const simRosterA = teamA.roster;
                    const simRosterB = teamB.roster;
                    const simResult = simulateMatchFn(teamA, teamB, simRosterA, simRosterB, [], [], 'BO3', GameState.RegularSeason);

                    if(league.region === playerLeagueForNews.region && league.tier === playerLeagueForNews.tier){
                        generateRichNewsForMatch(teamA, teamB, simResult, currentLeaguesState);
                    }
                    
                    return applyMatchResultToLeagues(currentLeaguesState, aiMatch, simResult, simRosterA, simRosterB);
                }, leaguesAfterAllMatches);
            }
            
            updatedLeagues = performWeeklyUpdates(leaguesAfterAllMatches);
            
            const playerLeagueForAdvancement = updatedLeagues.find(l => l.region === playerTeam!.region && l.tier === playerTeam!.tier)!;
            const numTeamsInLeague = playerLeagueForAdvancement.teams.length;
            const effectiveNumTeams = numTeamsInLeague % 2 === 0 ? numTeamsInLeague : numTeamsInLeague + 1;
            const endOfRegularSeason = (effectiveNumTeams - 1) * 2;
            
            if (match.week >= endOfRegularSeason) {
                if (playerLeagueForAdvancement.tier === Tier.Tier1) {
                    startPlayerPlayoffs(playerLeagueForAdvancement, updatedLeagues);
                } else {
                    if (split === Split.Spring) {
                        setGameState(GameState.MidSeasonBreak);
                    } else {
                        setGameState(GameState.OffSeason);
                    }
                    setTimeout(() => {
                        simulateAllAiPlayoffs(updatedLeagues.filter(l => l.tier === Tier.Tier1), updatedLeagues);
                    }, 50);
                }
            } else {
                setCurrentWeek(prev => prev + 1);
            }
        }

        // --- TOURNAMENT LOGIC ---
        if (gameState === GameState.Playoffs) {
            let updatedPlayoffMatches = playoffMatches.map(m => m.id === match.id ? {...m, isPlayed: true, result, gameResults: result.gameResults} : m);
            
            const semiFinals = updatedPlayoffMatches.filter(m => m.round === 'Bán Kết');
            if (match.round === 'Bán Kết' && semiFinals.every(m => m.isPlayed) && updatedPlayoffMatches.filter(m => m.round === 'Chung Kết').length === 0) {
                 const winner1 = semiFinals[0].result!.scoreA > semiFinals[0].result!.scoreB ? semiFinals[0].teamA : semiFinals[0].teamB;
                 const winner2 = semiFinals[1].result!.scoreA > semiFinals[1].result!.scoreB ? semiFinals[1].teamA : semiFinals[1].teamB;
                 const newFinal: Match = { id: `final-${split}-${year}`, week: 16, round: 'Chung Kết', isPlayed: false, teamA: winner1, teamB: winner2 };
                 updatedPlayoffMatches.push(newFinal);
                 addNews(`Chung kết Mùa ${split} đã được xác định!`, `[T:${winner1.name}] sẽ đối đầu với [T:${winner2.name}]!`, "Ban Tổ Chức");
            }

            if (match.round === 'Chung Kết') {
                const championInfo = result.scoreA > result.scoreB ? match.teamA : match.teamB;
                const championTeam = leagues.flatMap(l => l.teams).find(t => t.id === championInfo.id)!;
                setRegionalChampion(championTeam);
                setYearlyChampions(prev => [...prev, { year, split, region: championTeam.region, champion: championTeam }]);
                const trophyName = `Vô địch ${playerTeam?.region} ${split} ${year}`;
                updatedLeagues = awardTrophyAndAchievements(championTeam.id, trophyName, leagues);
                
                // Prize Money Distribution for Player's League
                const playerLeague = updatedLeagues.find(l => l.region === championTeam.region && l.tier === championTeam.tier)!;
                const PRIZE_MAP: Record<Tier, Record<number, number>> = { [Tier.Tier1]: TIER1_PLAYOFF_PRIZES, [Tier.Tier2]: TIER2_PLAYOFF_PRIZES };
                const prizes = PRIZE_MAP[playerLeague.tier];
                
                if (prizes) {
                    const prizeName = `${playerLeague.region} ${split} Playoffs`;
                    // Champion
                    updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, championTeam.id, prizes[1], prizeName);

                    // Runner-up
                    const runnerUpId = match.teamA.id === championTeam.id ? match.teamB.id : match.teamA.id;
                    if(prizes[2]) updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, runnerUpId, prizes[2], prizeName);

                    // Semi-finalists
                    const semiFinalMatches = updatedPlayoffMatches.filter(m => m.round === 'Bán Kết');
                    if(prizes[3]) {
                        semiFinalMatches.forEach(sf => {
                            const loserId = sf.result!.scoreA > sf.result!.scoreB ? sf.teamB.id : sf.teamA.id;
                            updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, loserId, prizes[3], prizeName);
                        });
                    }
                }
                
                addNews(
                    `Vô địch ${playerTeam?.region} ${split} ${year}!`,
                    `[T:${championTeam.name}] đã vượt qua tất cả để trở thành nhà vua của khu vực!`,
                    "Ban Tổ Chức",
                    NewsItemType.CHAMPIONSHIP_WIN,
                    { champion: { name: championTeam.name, logoUrl: championTeam.logoUrl } }
                );

                if (split === Split.Spring) {
                    setGameState(GameState.MidSeasonBreak); 
                } else { 
                    setGameState(GameState.OffSeason);
                }
            }
            setPlayoffMatches(updatedPlayoffMatches);
        } else if (gameState === GameState.PromotionRelegation) {
            const updatedPromotionMatches = promotionMatches.map(m =>
                m.id === match.id ? { ...m, isPlayed: true, result } : m
            );
            setPromotionMatches(updatedPromotionMatches);

            if (updatedPromotionMatches.every(m => m.isPlayed)) {
                // All promotion matches are done, apply changes
                const relegatedTeams: Team[] = [];
                const promotedTeams: Team[] = [];
                
                updatedPromotionMatches.forEach(m => {
                    const t1Team = leagues.flatMap(l=>l.teams).find(t => t.id === m.teamA.id)!;
                    const t2Team = leagues.flatMap(l=>l.teams).find(t => t.id === m.teamB.id)!;
                    const winnerIsT2 = m.result!.scoreA < m.result!.scoreB;
                    if(winnerIsT2) {
                        promotedTeams.push(t2Team);
                        relegatedTeams.push(t1Team);
                    }
                });

                if (promotedTeams.length > 0 || relegatedTeams.length > 0) {
                     updatedLeagues = updatedLeagues.map((league: League) => {
                        if (league.tier === Tier.Tier1) {
                            let newTeams = league.teams.filter((t: Team) => !relegatedTeams.some(rt => rt.id === t.id));
                            const promotedForThisRegion = promotedTeams.filter(pt => pt.region === league.region);
                            promotedForThisRegion.forEach(pt => pt.tier = Tier.Tier1);
                            newTeams = [...newTeams, ...promotedForThisRegion];
                            return {...league, teams: newTeams};
                        }
                        if (league.tier === Tier.Tier2) {
                            let newTeams = league.teams.filter((t: Team) => !promotedTeams.some(pt => pt.id === t.id));
                            const relegatedForThisRegion = relegatedTeams.filter(rt => rt.region === league.region);
                            relegatedForThisRegion.forEach(rt => rt.tier = Tier.Tier2);
                            newTeams = [...newTeams, ...relegatedForThisRegion];
                            return {...league, teams: newTeams};
                        }
                        return league;
                    });
                }
                setGameState(GameState.SeasonEnd);
            }
        } else if (gameState === GameState.MSI && msiData) {
            const updatedMsiData = JSON.parse(JSON.stringify(msiData));
            let updatedParticipants = updatedMsiData.participants;
        
            const isKnockoutStage = updatedMsiData.knockoutMatches?.length > 0;
            
            // --- 1. UPDATE PLAYER'S MATCH ---
            const targetMatchesForPlayer = isKnockoutStage ? updatedMsiData.knockoutMatches : updatedMsiData.groupMatches;
            const playerMatchIndex = targetMatchesForPlayer.findIndex((m: Match) => m.id === match.id);
        
            if (playerMatchIndex !== -1) {
                targetMatchesForPlayer[playerMatchIndex] = { ...match, isPlayed: true, result, gameResults: result.gameResults };
                if (!isKnockoutStage) { // Only update W/L for group stage
                    const winnerId = result.scoreA > result.scoreB ? match.teamA.id : match.teamB.id;
                    const loserId = result.scoreA > result.scoreB ? match.teamB.id : match.teamA.id;
                    
                    updatedParticipants = updatedParticipants.map((p: Team) => {
                        if (p.id === winnerId) return { ...p, msiWins: (p.msiWins || 0) + 1 };
                        if (p.id === loserId) return { ...p, msiLosses: (p.msiLosses || 0) + 1 };
                        return p;
                    });
                }
            }
        
            // --- 2. SIMULATE OTHER AI MATCHES IN THE SAME "ROUND" ---
            if (isKnockoutStage) {
                const currentRound = match.round;
                const aiMatchesInRound = updatedMsiData.knockoutMatches.filter((m: Match) => 
                    m.round === currentRound && !m.isPlayed && m.teamA.id !== playerTeamId && m.teamB.id !== playerTeamId
                );
        
                aiMatchesInRound.forEach((aiMatch: Match) => {
                    const teamA = updatedParticipants.find((t: Team) => t.id === aiMatch.teamA.id)!;
                    const teamB = updatedParticipants.find((t: Team) => t.id === aiMatch.teamB.id)!;
                    const simResult = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.MSI);
                    
                    const matchToUpdateIndex = updatedMsiData.knockoutMatches.findIndex((m: Match) => m.id === aiMatch.id);
                    if (matchToUpdateIndex !== -1) {
                        updatedMsiData.knockoutMatches[matchToUpdateIndex] = { ...aiMatch, isPlayed: true, result: simResult };
                    }
                });
            } else { // Group Stage - Simulates other matches in the same round (week).
                const currentRound = match.week;
                const aiMatchesInRound = updatedMsiData.groupMatches.filter((m: Match) => 
                    m.week === currentRound && !m.isPlayed
                );

                aiMatchesInRound.forEach((aiMatch: Match) => {
                    const teamA = updatedParticipants.find((t: Team) => t.id === aiMatch.teamA.id)!;
                    const teamB = updatedParticipants.find((t: Team) => t.id === aiMatch.teamB.id)!;
                    const simResult = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO1', GameState.MSI);
                    
                    const matchToUpdateIndex = updatedMsiData.groupMatches.findIndex((m: Match) => m.id === aiMatch.id);
                    if (matchToUpdateIndex !== -1) {
                        updatedMsiData.groupMatches[matchToUpdateIndex] = { ...aiMatch, isPlayed: true, result: simResult };
                    }

                    const winnerId = simResult.scoreA > simResult.scoreB ? teamA.id : teamB.id;
                    const loserId = simResult.scoreA > simResult.scoreB ? teamB.id : teamA.id;

                    updatedParticipants = updatedParticipants.map((p: Team) => {
                        if (p.id === winnerId) return { ...p, msiWins: (p.msiWins || 0) + 1 };
                        if (p.id === loserId) return { ...p, msiLosses: (p.msiLosses || 0) + 1 };
                        return p;
                    });
                });
            }
        
            // --- 3. CHECK FOR STAGE COMPLETION AND TRANSITION ---
            const allGroupMatchesPlayed = updatedMsiData.groupMatches.every((m: Match) => m.isPlayed);

            if (!isKnockoutStage && allGroupMatchesPlayed) {
                addNews("Vòng Bảng MSI Kết Thúc", "8 đội tuyển xuất sắc nhất đã được xác định và sẽ tiến vào Vòng Loại Trực Tiếp!", "Ban Tổ Chức MSI");

                const groupATeamIds = new Set<string>();
                updatedMsiData.groupMatches.filter((m: Match) => m.group === 'A').forEach((m: Match) => {
                    groupATeamIds.add(m.teamA.id);
                    groupATeamIds.add(m.teamB.id);
                });

                const groupBTeamIds = new Set<string>();
                updatedMsiData.groupMatches.filter((m: Match) => m.group === 'B').forEach((m: Match) => {
                    groupBTeamIds.add(m.teamB.id);
                    groupBTeamIds.add(m.teamB.id);
                });
                
                const groupAStandings = updatedParticipants
                    .filter((p: Team) => groupATeamIds.has(p.id))
                    .sort((a: Team, b: Team) => (b.msiWins || 0) - (a.msiWins || 0) || (a.msiLosses || 0) - (b.msiLosses || 0));

                const groupBStandings = updatedParticipants
                    .filter((p: Team) => groupBTeamIds.has(p.id))
                    .sort((a: Team, b: Team) => (b.msiWins || 0) - (a.msiWins || 0) || (a.msiLosses || 0) - (b.msiLosses || 0));

                const topA = groupAStandings.slice(0, 4);
                const topB = groupBStandings.slice(0, 4);

                if (topA.length === 4 && topB.length === 4) {
                    updatedMsiData.knockoutMatches = [
                        { id: `msi-qf-1-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topA[0].id, name: topA[0].name, logoUrl: topA[0].logoUrl }, teamB: { id: topB[3].id, name: topB[3].name, logoUrl: topB[3].logoUrl } },
                        { id: `msi-qf-2-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topB[1].id, name: topB[1].name, logoUrl: topB[1].logoUrl }, teamB: { id: topA[2].id, name: topA[2].name, logoUrl: topA[2].logoUrl } },
                        { id: `msi-qf-3-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topB[0].id, name: topB[0].name, logoUrl: topB[0].logoUrl }, teamB: { id: topA[3].id, name: topA[3].name, logoUrl: topA[3].logoUrl } },
                        { id: `msi-qf-4-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topA[1].id, name: topA[1].name, logoUrl: topA[1].logoUrl }, teamB: { id: topB[2].id, name: topB[2].name, logoUrl: topB[2].logoUrl } },
                    ];
                }
            } else if (isKnockoutStage) { // Check for knockout progression
                const allKnockoutMatchesInRound = updatedMsiData.knockoutMatches.filter((m: Match) => m.round === match.round);
                const roundComplete = allKnockoutMatchesInRound.every((m: Match) => m.isPlayed);

                if (roundComplete) {
                    if (match.round === 'Tứ kết') {
                        addNews("Vòng Tứ Kết MSI Kết Thúc", "Bốn đội mạnh nhất đã lộ diện và sẽ tiến vào Bán kết!", "Ban Tổ Chức MSI");
                        const qfWinners = allKnockoutMatchesInRound.map((m: Match) => 
                            m.result!.scoreA > m.result!.scoreB ? m.teamA : m.teamB
                        );
                        const semiFinalMatches = [
                            { id: `msi-sf-1-${year}`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[0], teamB: qfWinners[1] },
                            { id: `msi-sf-2-${year}`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[2], teamB: qfWinners[3] },
                        ];
                        updatedMsiData.knockoutMatches.push(...semiFinalMatches);
                    } else if (match.round === 'Bán kết') {
                        addNews("Vòng Bán Kết MSI Kết Thúc", "Hai đội cuối cùng sẽ tranh ngôi vô địch trong trận Chung kết!", "Ban Tổ Chức MSI");
                        const sfWinners = allKnockoutMatchesInRound.map((m: Match) => 
                            m.result!.scoreA > m.result!.scoreB ? m.teamA : m.teamB
                        );
                        const finalMatch = { id: `msi-final-${year}`, week: 3, round: 'Chung kết', isPlayed: false, teamA: sfWinners[0], teamB: sfWinners[1] };
                        updatedMsiData.knockoutMatches.push(finalMatch);
                    } else if (match.round === 'Chung kết') {
                        const championInfo = result.scoreA > result.scoreB ? match.teamA : match.teamB;
                        const championTeam = updatedParticipants.find((t: Team) => t.id === championInfo.id)!;
                        updatedMsiData.champion = championTeam;
            
                        const trophyName = `Vô địch MSI ${year}`;
                        updatedLeagues = awardTrophyAndAchievements(championTeam.id, trophyName, leagues);
                        
                        const prizeName = `MSI ${year}`;
                        const finalMatchFromData = updatedMsiData.knockoutMatches.find((m: Match) => m.round === 'Chung kết')!;
                        const runnerUpId = finalMatchFromData.teamA.id === championTeam.id ? finalMatchFromData.teamB.id : finalMatchFromData.teamA.id;
                        
                        const semiFinalMatches = updatedMsiData.knockoutMatches.filter((m: Match) => m.round === 'Bán kết');
                        const semiFinalLoserIds = semiFinalMatches.map(sf => sf.result!.scoreA > sf.result!.scoreB ? sf.teamB.id : sf.teamA.id);
            
                        const quarterFinalMatches = updatedMsiData.knockoutMatches.filter((m: Match) => m.round === 'Tứ kết');
                        const quarterFinalLoserIds = quarterFinalMatches.map(qf => qf.result!.scoreA > qf.result!.scoreB ? qf.teamB.id : qf.teamA.id);
                        
                        updatedParticipants.forEach((p: Team) => {
                            if (p.id === championTeam.id) updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, p.id, MSI_PRIZES[1], prizeName);
                            else if (p.id === runnerUpId) updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, p.id, MSI_PRIZES[2], prizeName);
                            else if (semiFinalLoserIds.includes(p.id)) updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, p.id, MSI_PRIZES[4], prizeName);
                            else if (quarterFinalLoserIds.includes(p.id)) updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, p.id, MSI_PRIZES[8], prizeName);
                            else updatedLeagues = awardPrizeMoneyToLeagues(updatedLeagues, p.id, MSI_PRIZES[16], prizeName);
                        });
                        
                        addNews(
                            `Vô địch MSI ${year}!`,
                            `[T:${championTeam.name}] đã xuất sắc vượt qua các đối thủ nặng ký để lên ngôi vương!`, 
                            "Ban Tổ Chức MSI",
                            NewsItemType.CHAMPIONSHIP_WIN,
                            { champion: { name: championTeam.name, logoUrl: championTeam.logoUrl } }
                        );
            
                        setGameState(GameState.MidSeasonBreak);
                    }
                }
            }

            setMsiData({ ...updatedMsiData, participants: updatedParticipants });
        }
        
        setLeagues(updatedLeagues);

        setTimeout(() => {
            setMatchDayInfo(null);
            setView('dashboard');

            const isPlayerInvolved = match.teamA.id === playerTeamId || match.teamB.id === playerTeamId;
            if (isPlayerInvolved && gameState !== GameState.MSI) { // MSI has its own flow
                const playerWon = (match.teamA.id === playerTeamId && result.scoreA > result.scoreB) || (match.teamB.id === playerTeamId && result.scoreB > result.scoreA);
                const opponentInfo = match.teamA.id === playerTeamId ? match.teamB : match.teamA;
                const opponentTeam = leagues.flatMap(l => l.teams).find(t => t.id === opponentInfo.id);

                // RANDOM EVENT TRIGGER
                if (Math.random() < 0.33 && opponentTeam) {
                    const eligibleEvents = RANDOM_EVENTS.filter(e => !e.condition || e.condition(playerWon));
                    if (eligibleEvents.length > 0) {
                        const chosenEvent = getRandom(eligibleEvents);
                        const mvpPlayerId = result.gameResults[result.gameResults.length - 1]?.mvpPlayerId;
                        
                        setPostEventCallback(() => () => setPressConferenceMatch({ match, result, opponentTeam }));
                        setActiveRandomEvent({
                            event: chosenEvent,
                            context: { mvpPlayerId, opponentName: opponentTeam.name, playerWon }
                        });
                    }
                } else if (opponentTeam) {
                    setPressConferenceMatch({ match, result, opponentTeam });
                }
            }
            setIsLoading(false);
        }, 1000);
    };
    
    const generateNewHero = (): Hero => {
        const existingNames = new Set(heroPool.map(h => h.name));
        let newName = '';
        do {
            newName = getRandom(NEW_HERO_NAMES);
        } while (existingNames.has(newName));

        return {
            id: `h${heroPool.length + 1}${Date.now()}`,
            name: newName,
            role: getRandom(Object.values(HeroRole)),
            imageUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${newName}&hairColor=ff69b4,00ffff,39ff14,ff4500,9400d3,ffd700,ffa500,ef476f,06d6a0,f72585`,
            mechanics: getRandomNumber(75, 90),
            macro: getRandomNumber(75, 90),
            colorVariations: ['#FFC107', '#2196F3', '#4CAF50', '#E91E63', '#9C27B0']
        };
    };

    const performAiTransfers = useCallback((currentLeagues: League[], currentFreeAgents: Player[]): { updatedLeagues: League[], updatedFreeAgents: Player[] } => {
        let leaguesCopy = JSON.parse(JSON.stringify(currentLeagues));
        let freeAgentsCopy = JSON.parse(JSON.stringify(currentFreeAgents));
    
        // --- 1. UPGRADE TRANSFERS ---
        let allAiTeams = leaguesCopy.flatMap((l: League) => l.teams).filter((t: Team) => t.id !== playerTeamId);
        
        for (const team of allAiTeams) {
            if (team.roster.length === 0) continue;
    
            const weakestPlayer = [...team.roster].sort((a, b) => (a.mechanics + a.macro) - (b.mechanics + b.macro))[0];
            const weakestPlayerOverall = weakestPlayer.mechanics + weakestPlayer.macro;
    
            const potentialReplacements = [
                ...freeAgentsCopy.map((p: Player) => ({ ...p, isFreeAgent: true, originalTeamId: null })),
                ...allAiTeams
                    .filter((t: Team) => t.id !== team.id)
                    .flatMap((t: Team) => t.roster.map((p: Player) => ({ ...p, isFreeAgent: false, originalTeamId: t.id })))
            ]
            .filter((p: Player) => 
                p.role === weakestPlayer.role && 
                (p.mechanics + p.macro) > weakestPlayerOverall // More aggressive upgrade logic
            )
            .sort((a: Player, b: Player) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    
            if (potentialReplacements.length === 0) continue;
    
            const target = potentialReplacements[0];
            const fee = target.isFreeAgent ? 0 : calculateBuyoutFee(target);
            const estimatedSalary = (target.contract?.salary || 40000) * 1.1;
    
            if (team.finances.budget > fee + estimatedSalary) {
                const fromTeamName = target.isFreeAgent ? "Tự Do" : leaguesCopy.flatMap((l: League) => l.teams).find((t: Team) => t.id === target.originalTeamId)!.name;
                
                team.finances.budget -= fee;
                const newPlayer = { ...target, contract: {
                    teamId: team.id,
                    salary: Math.round(estimatedSalary),
                    signingBonus: 0,
                    duration: 2,
                    promisedRole: PromisedRole.Starter,
                    endDate: `${year + 2}-12-31`
                }};
                delete (newPlayer as any).isFreeAgent;
                delete (newPlayer as any).originalTeamId;
                team.roster.push(newPlayer);
    
                if (target.isFreeAgent) {
                    freeAgentsCopy = freeAgentsCopy.filter((p: Player) => p.id !== target.id);
                } else {
                    const sourceTeam = leaguesCopy.flatMap((l: League) => l.teams).find((t: Team) => t.id === target.originalTeamId);
                    if (sourceTeam) {
                        sourceTeam.roster = sourceTeam.roster.filter((p: Player) => p.id !== target.id);
                        sourceTeam.finances.budget += fee;
                        // FIX: Recalculate salary for selling team
                        sourceTeam.finances.salaryExpenses = Math.round(sourceTeam.roster.reduce((sum: number, p: Player) => sum + (p.contract?.salary || 0), 0) / 52);
                    }
                }
                
                team.roster = team.roster.filter((p: Player) => p.id !== weakestPlayer.id);
                weakestPlayer.contract = null;
                freeAgentsCopy.push(weakestPlayer);
    
                team.finances.salaryExpenses = Math.round(team.roster.reduce((sum: number, p: Player) => sum + (p.contract?.salary || 0), 0) / 52);
    
                addNews(
                    `[Chuyển Nhượng] [P:${target.ign}] gia nhập [T:${team.name}]!`,
                    `[T:${team.name}] đã chiêu mộ thành công [P:${target.ign}] từ [T:${fromTeamName}]. Để dọn chỗ, họ đã thanh lý hợp đồng với [P:${weakestPlayer.ign}].`,
                    "Chuyên Gia Chuyển Nhượng",
                    NewsItemType.TRANSFER
                );
            }
        }
    
        // --- 2. MANDATORY ROSTER FILLING ---
        allAiTeams = leaguesCopy.flatMap((l: League) => l.teams).filter((t: Team) => t.id !== playerTeamId);
        allAiTeams.forEach((team: Team) => {
            while (team.roster.length < 5) {
                const neededRoles = Object.values(PlayerRole).filter(role => !team.roster.some(p => p.role === role));
                
                const potentialSignings = freeAgentsCopy
                    .filter((p: Player) => neededRoles.includes(p.role))
                    .sort((a: Player, b: Player) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    
                let playerToSign: Player | null = potentialSignings[0] || null;
    
                if (!playerToSign) {
                    const bestOverall = freeAgentsCopy
                        .sort((a: Player, b: Player) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
                    playerToSign = bestOverall[0] || null;
                }
    
                if (playerToSign) {
                    freeAgentsCopy = freeAgentsCopy.filter((p: Player) => p.id !== playerToSign!.id);
                    const newContractSalary = playerToSign.contract?.salary || 30000;
                    playerToSign.contract = {
                        teamId: team.id,
                        salary: newContractSalary,
                        signingBonus: 0,
                        duration: 1,
                        promisedRole: PromisedRole.Starter,
                        endDate: `${year + 1}-12-31`
                    };
                    team.roster.push(playerToSign);
                    team.finances.salaryExpenses = Math.round(team.roster.reduce((sum: number, p: Player) => sum + (p.contract?.salary || 0), 0) / 52);
    
                    addNews(
                        `[Chuyển Nhượng] [T:${team.name}] ký hợp đồng khẩn cấp!`,
                        `Do không đủ thành viên, [T:${team.name}] đã buộc phải ký hợp đồng với tuyển thủ tự do [P:${playerToSign.ign}] để lấp đầy đội hình.`,
                        "Ban Tổ Chức",
                        NewsItemType.TRANSFER
                    );
                } else {
                    break; 
                }
            }
        });
        
        return { updatedLeagues: leaguesCopy, updatedFreeAgents: freeAgentsCopy };
    }, [addNews, playerTeamId, year]);

    const performPromotionRelegation = useCallback((currentLeagues: League[]): { updatedLeagues: League[], promotions: Team[], relegations: Team[] } => {
        const leaguesCopy = JSON.parse(JSON.stringify(currentLeagues)) as League[];
        const leaguesByRegion = new Map<RegionName, League[]>();
        leaguesCopy.forEach(l => {
            if (!leaguesByRegion.has(l.region)) leaguesByRegion.set(l.region, []);
            leaguesByRegion.get(l.region)!.push(l);
        });

        const sortTeams = (teams: Team[]) => [...teams].sort((a, b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
        const allPromotions: Team[] = [];
        const allRelegations: Team[] = [];

        for (const [, regionLeagues] of leaguesByRegion.entries()) {
            const t1League = regionLeagues.find(l => l.tier === Tier.Tier1);
            const t2League = regionLeagues.find(l => l.tier === Tier.Tier2);

            if (t1League && t2League) {
                const relegatedFromT1 = sortTeams(t1League.teams).slice(-2);
                const promotedToT1 = sortTeams(t2League.teams).slice(0, 2);
                if (relegatedFromT1.length > 0 && promotedToT1.length > 0) {
                    t1League.teams = t1League.teams.filter(t => !relegatedFromT1.some(rt => rt.id === t.id));
                    t2League.teams = t2League.teams.filter(t => !promotedToT1.some(pt => pt.id === t.id));
                    relegatedFromT1.forEach(t => t.tier = Tier.Tier2);
                    promotedToT1.forEach(t => t.tier = Tier.Tier1);
                    t1League.teams.push(...promotedToT1);
                    t2League.teams.push(...relegatedFromT1);
                    allPromotions.push(...promotedToT1);
                    allRelegations.push(...relegatedFromT1);
                }
            }
        }
        
        const finalLeagues = Array.from(leaguesByRegion.values()).flat();
        return { updatedLeagues: finalLeagues, promotions: allPromotions, relegations: allRelegations };
    }, []);

    const generatePromotionRelegationNews = useCallback((promotions: Team[], relegations: Team[]) => {
        const changesByRegion = new Map<RegionName, { promoted: Team[], relegated: Team[] }>();

        promotions.forEach(team => {
            if (!changesByRegion.has(team.region)) changesByRegion.set(team.region, { promoted: [], relegated: [] });
            changesByRegion.get(team.region)!.promoted.push(team);
        });

        relegations.forEach(team => {
            if (!changesByRegion.has(team.region)) changesByRegion.set(team.region, { promoted: [], relegated: [] });
            changesByRegion.get(team.region)!.relegated.push(team);
        });

        for (const [region, changes] of changesByRegion.entries()) {
            if (region === RegionName.NA || region === RegionName.EU) continue;

            const promotedToT1 = changes.promoted.filter(t => t.tier === Tier.Tier1);
            const relegatedToT2 = changes.relegated.filter(t => t.tier === Tier.Tier2);
            const promotedToT2 = changes.promoted.filter(t => t.tier === Tier.Tier2);

            let content = '';
            if (promotedToT1.length > 0) content += `Các đội thăng hạng lên ${Tier.Tier1}: ${promotedToT1.map(t => `[T:${t.name}]`).join(', ')}. `;
            if (relegatedToT2.length > 0) content += `Các đội rớt hạng xuống ${Tier.Tier2}: ${relegatedToT2.map(t => `[T:${t.name}]`).join(', ')}. `;
            if (promotedToT2.length > 0) content += `Các đội thăng hạng lên ${Tier.Tier2}: ${promotedToT2.map(t => `[T:${t.name}]`).join(', ')}. `;

            if (content.trim()) {
                addNews(
                    `[${region}] Biến Động Lên/Xuống Hạng`,
                    content,
                    'Ban Tổ Chức',
                    NewsItemType.PROMOTION_RELEGATION,
                    { 
                        promoted: changes.promoted.map(t => ({ name: t.name, logoUrl: t.logoUrl })),
                        relegated: changes.relegated.map(t => ({ name: t.name, logoUrl: t.logoUrl }))
                    }
                );
            }
        }
    }, [addNews]);

    const updateHallOfFame = useCallback((leagues: League[]) => {
        const allTeams = leagues.flatMap(l => l.teams);
        const allPlayersWithTeamInfo = allTeams.flatMap(t => t.roster.map(p => ({
            ...p,
            teamName: t.name,
            teamLogoUrl: t.logoUrl,
        })));

        // 1. Most MVPs
        let topMvpPlayer: (Player & { teamName: string; teamLogoUrl: string; }) | null = null;
        if (allPlayersWithTeamInfo.length > 0) {
            topMvpPlayer = allPlayersWithTeamInfo.reduce((max, player) => player.mvpAwards > max.mvpAwards ? player : max);
        }
        
        const mostMvpsRecord = topMvpPlayer && topMvpPlayer.mvpAwards > 0 ? {
            player: {
                id: topMvpPlayer.id,
                ign: topMvpPlayer.ign,
                avatarUrl: topMvpPlayer.avatarUrl,
                teamName: topMvpPlayer.teamName,
                teamLogoUrl: topMvpPlayer.teamLogoUrl,
            },
            count: topMvpPlayer.mvpAwards,
        } : null;


        // 2. & 3. Most Titles
        let topDomesticTeam: { team: Team, count: number } | null = null;
        let topInternationalTeam: { team: Team, count: number } | null = null;

        allTeams.forEach(team => {
            const domesticTitles = team.trophyRoom.filter(t => t.includes('Vô địch') && !t.includes('MSI') && !t.includes('CKTG')).length;
            const internationalTitles = team.trophyRoom.filter(t => t.includes('MSI') || t.includes('CKTG')).length;

            if (domesticTitles > 0 && (!topDomesticTeam || domesticTitles > topDomesticTeam.count)) {
                topDomesticTeam = { team, count: domesticTitles };
            }
            if (internationalTitles > 0 && (!topInternationalTeam || internationalTitles > topInternationalTeam.count)) {
                topInternationalTeam = { team, count: internationalTitles };
            }
        });
        
        const mostDomesticTitlesRecord = topDomesticTeam ? {
            team: {
                id: topDomesticTeam.team.id,
                name: topDomesticTeam.team.name,
                logoUrl: topDomesticTeam.team.logoUrl,
            },
            count: topDomesticTeam.count
        } : null;

        const mostInternationalTitlesRecord = topInternationalTeam ? {
            team: {
                id: topInternationalTeam.team.id,
                name: topInternationalTeam.team.name,
                logoUrl: topInternationalTeam.team.logoUrl,
            },
            count: topInternationalTeam.count
        } : null;


        setHallOfFame({
            mostMvps: mostMvpsRecord,
            mostDomesticTitles: mostDomesticTitlesRecord,
            mostInternationalTitles: mostInternationalTitlesRecord,
        });
    }, []);

    const handleNewSeason = useCallback(() => {
        setIsLoading(true);

        let leaguesForNewSeason = JSON.parse(JSON.stringify(leagues));
        
        // --- PROMOTION & RELEGATION (Automatic End-of-Season) ---
        const { updatedLeagues: leaguesAfterPromotion, promotions, relegations } = performPromotionRelegation(leaguesForNewSeason);
        leaguesForNewSeason = leaguesAfterPromotion;
        if (promotions.length > 0 || relegations.length > 0) {
             generatePromotionRelegationNews(promotions, relegations);
        }

        // --- SPONSOR OBJECTIVE CHECK & CONTRACT EXPIRY ---
        let updatedLeaguesWithSponsorChanges = leaguesForNewSeason;
        let playerTeamForSponsorUpdate = updatedLeaguesWithSponsorChanges.flatMap((l: League) => l.teams).find((t: Team) => t.id === playerTeamId);
        
        if (playerTeamForSponsorUpdate) {
            let budgetChanges = 0;
            // Check Summer split results as that's the end-of-season split
            const summerChampionRecord = yearlyChampions.find(yc => yc.year === year && yc.split === Split.Summer && yc.region === playerTeamForSponsorUpdate.region);
            const isSummerChampion = summerChampionRecord?.champion.id === playerTeamId;

            const summerPlayoffResults = aiPlayoffResults[playerTeamForSponsorUpdate.region] || (playerTeamForSponsorUpdate.region === playerTeam?.region ? { matches: playoffMatches } : null);
            const finalMatch = summerPlayoffResults?.matches.find(m => m.round === 'Chung Kết');
            const madeSummerFinals = finalMatch && (finalMatch.teamA.id === playerTeamId || finalMatch.teamB.id === playerTeamId);

            const hasStar = playerTeamForSponsorUpdate.roster.some((p: Player) => p.traits.includes(PersonalityTrait.Star));
            const qualifiedForWorlds = worldsParticipants.some(p => p.id === playerTeamId);

            const remainingSponsors: Sponsor[] = [];
            const WEEKLY_INCOME_DIVISOR = 24;
            
            playerTeamForSponsorUpdate.sponsors.forEach((sponsor: Sponsor) => {
                let isExpired = sponsor.startYear + sponsor.duration <= year;

                // Objective Check for season-end goals of active contracts
                if (!isExpired && sponsor.startYear === year) {
                     let objectiveMet = false;
                     switch (sponsor.objective.type) {
                         case SponsorObjectiveType.WIN_CHAMPIONSHIP:
                             if (isSummerChampion) objectiveMet = true;
                             break;
                         case SponsorObjectiveType.REACH_FINALS:
                             if (madeSummerFinals) objectiveMet = true;
                             break;
                         case SponsorObjectiveType.SIGN_STAR_PLAYER:
                             if (hasStar) objectiveMet = true;
                             break;
                         case SponsorObjectiveType.WIN_X_MATCHES:
                             const summerWins = playerTeamForSponsorUpdate.wins; // wins are from summer split before reset
                             if (summerWins >= (sponsor.objective.targetValue || 99)) objectiveMet = true;
                             break;
                         case SponsorObjectiveType.QUALIFY_FOR_WORLDS:
                             if (qualifiedForWorlds) objectiveMet = true;
                             break;
                         case SponsorObjectiveType.PLAYER_HAS_HIGH_MVPS:
                             if (playerTeamForSponsorUpdate.roster.some(p => p.mvpAwards >= (sponsor.objective.targetValue || 5))) objectiveMet = true;
                             break;
                     }

                    if (objectiveMet) {
                        budgetChanges += sponsor.bonus;
                        addNews('Mục tiêu tài trợ đạt được!', `${sponsor.name} vui mừng thông báo [T:${playerTeamForSponsorUpdate.name}] đã hoàn thành mục tiêu và nhận được khoản thưởng ${formatCurrency(sponsor.bonus)}.`, 'Thông Cáo Báo Chí');
                    } else {
                        budgetChanges -= sponsor.penalty;
                        addNews('Không đạt mục tiêu tài trợ', `[T:${playerTeamForSponsorUpdate.name}] không hoàn thành mục tiêu của ${sponsor.name} và phải chịu một khoản phạt ${formatCurrency(sponsor.penalty)}.`, 'Thông Cáo Báo Chí');
                    }
                }

                if (isExpired) {
                     addNews('Hợp đồng hết hạn', `Hợp đồng tài trợ giữa [T:${playerTeamForSponsorUpdate.name}] và ${sponsor.name} đã kết thúc.`, 'Phóng Viên Kinh Tế');
                     playerTeamForSponsorUpdate.finances.weeklyIncome -= sponsor.basePayment / WEEKLY_INCOME_DIVISOR;
                } else {
                    remainingSponsors.push(sponsor);
                }
            });
            playerTeamForSponsorUpdate.sponsors = remainingSponsors;
            playerTeamForSponsorUpdate.finances.budget += budgetChanges;
            playerTeamForSponsorUpdate.finances.weeklyIncome = Math.round(playerTeamForSponsorUpdate.finances.weeklyIncome);
        }
        
        // --- RECORD HISTORY ---
        const msiChampionTeam = msiData?.champion || null;
        const msiChampion: ChampionInfo | null = msiChampionTeam 
            ? { teamId: msiChampionTeam.id, teamName: msiChampionTeam.name, teamLogoUrl: msiChampionTeam.logoUrl } 
            : null;
        const newRecord: HistoricalRecord = {
            year: year,
            regionalChampions: [],
            msiChampion: msiChampion,
            worldChampion: worldChampion,
        };

        const summerChampions = yearlyChampions.filter(yc => yc.year === year && yc.split === Split.Summer);
        newRecord.regionalChampions = summerChampions.map(yc => ({
             region: yc.region,
             champion: {
                 teamId: yc.champion.id,
                 teamName: yc.champion.name,
                 teamLogoUrl: yc.champion.logoUrl,
             }
        }));
        
        setGameHistory(prev => [...prev, newRecord]);

        // 1. Player Stat Progression
        let updatedLeaguesWithProgression = updatedLeaguesWithSponsorChanges.map((league: League) => ({
            ...league,
            teams: league.teams.map((team: Team) => {
                const headCoach = team.staff.find(s => s.role === StaffRole.HeadCoach);
                const trainingGear = team.facilities.find(f => f.type === FacilityType.TrainingGear);
                
                return {
                    ...team,
                    roster: team.roster.map(player => {
                        let newMechanics = player.mechanics;
                        let newMacro = player.macro;
                        let newAge = player.age + 1;

                        const potentialBonus: Record<PotentialRank, number> = { S: 4, A: 3, B: 2, C: 1, D: 0.5 };
                        
                        if (player.age < 24) { // Peak development phase
                            const staffBonus = (headCoach?.level || 1) / 4;
                            const facilityBonus = (trainingGear?.level || 1) / 4;
                            const improvement = getRandomNumber(1, 2) + potentialBonus[player.potential] + staffBonus + facilityBonus;
                            
                            newMechanics = Math.min(100, player.mechanics + improvement * (Math.random() * 0.5 + 0.75));
                            newMacro = Math.min(100, player.macro + improvement * (Math.random() * 0.5 + 0.75));

                        } else if (player.age >= 28) { // Decline phase
                            const decline = getRandomNumber(0, 2);
                            newMechanics = Math.max(40, player.mechanics - decline * Math.random());
                            newMacro = Math.max(40, player.macro - decline * Math.random());
                        }

                        return { ...player, age: newAge, mechanics: Math.round(newMechanics), macro: Math.round(newMacro) };
                    })
                };
            })
        }));
        
        // 2. Update hero meta and add new heroes
        let updatedHeroes = [...heroPool];
        const buffedHeroes: string[] = [];
        const nerfedHeroes: string[] = [];
        
        updatedHeroes = updatedHeroes.map(hero => {
            const change = getRandomNumber(-7, 7);
            if (change > 4) buffedHeroes.push(hero.name);
            if (change < -4) nerfedHeroes.push(hero.name);
            return {
                ...hero,
                mechanics: Math.max(40, Math.min(100, hero.mechanics + change)),
                macro: Math.max(40, Math.min(100, hero.macro - change/2)), // Change macro less
            };
        });

        const newHero1 = generateNewHero();
        const newHero2 = generateNewHero();
        updatedHeroes.push(newHero1, newHero2);
        setHeroPool(updatedHeroes);
        
        const newYear = year + 1;
        setYear(newYear);

        addNews(
            `Cập nhật meta Mùa ${newYear}!`,
            `Chào mừng 2 tướng mới: ${newHero1.name} & ${newHero2.name}. Các tướng được tăng sức mạnh gồm: ${buffedHeroes.slice(0,2).join(', ')}. Giảm sức mạnh: ${nerfedHeroes.slice(0,2).join(', ')}.`,
            'Ban Cân Bằng Game'
        );

        // 3. Reset leagues for the new season
        const leaguesWithResets = updatedLeaguesWithProgression.map((league: League) => ({
            ...league,
            teams: league.teams.map((team: Team) => ({ ...team, wins: 0, losses: 0, roundsWon: 0, roundsLost: 0, swissWins: 0, swissLosses: 0, opponentsPlayed: [], msiWins: 0, msiLosses: 0 })),
            schedule: createSchedule(league.teams),
        }));
        setLeagues(calculateInitialRanks(leaguesWithResets));
        updateHallOfFame(leaguesWithResets);
        
        // 4. Reset game state
        setCurrentWeek(1);
        setSplit(Split.Spring);
        setGameState(GameState.RegularSeason);
        setWorldsParticipants([]);
        setWorldsMatches([]);
        setWorldChampion(null);
        setPlayoffMatches([]);
        setRegionalChampion(null);
        setMsiData(null);
        msiCheckInProgress.current = false;
        setPromotionMatches([]);
        setAiPlayoffResults({});
        
        setTimeout(() => setIsLoading(false), 500);

    }, [heroPool, year, addNews, leagues, playerTeamId, worldChampion, regionalChampion, playoffMatches, msiData, yearlyChampions, aiPlayoffResults, freeAgents, promotionMatches, performPromotionRelegation, generatePromotionRelegationNews, playerTeam, worldsParticipants, updateHallOfFame]);

    const createSwissPairings = (teams: Team[], round: number): Match[] => {
        const newMatches: Match[] = [];
        const teamsToPair = [...teams.filter(t => t.swissWins! < 3 && t.swissLosses! < 3)];
        
        const groupedByRecord: Record<string, Team[]> = {};
        teamsToPair.forEach(team => {
            const record = `${team.swissWins}-${team.swissLosses}`;
            if (!groupedByRecord[record]) {
                groupedByRecord[record] = [];
            }
            groupedByRecord[record].push(team);
        });

        Object.values(groupedByRecord).forEach(group => {
            const shuffledGroup = group.sort(() => 0.5 - Math.random());
            for (let i = 0; i < shuffledGroup.length; i += 2) {
                if (shuffledGroup[i+1]) {
                    const teamA = shuffledGroup[i];
                    const teamB = shuffledGroup[i+1];
                    newMatches.push({
                        id: `worlds-s${round}-m${i/2}-${teamA.id}`,
                        week: round,
                        teamA: { id: teamA.id, name: teamA.name, logoUrl: teamA.logoUrl },
                        teamB: { id: teamB.id, name: teamB.name, logoUrl: teamB.logoUrl },
                        isPlayed: false,
                        round: `Swiss Vòng ${round}`
                    });
                }
            }
        });
        return newMatches;
    };
    
    const handleStartWorlds = () => {
        setIsLoading(true);
        addNews("CKTG Bắt đầu!", "16 đội tuyển hàng đầu thế giới đã sẵn sàng cho Vòng Swiss!", "Ban Tổ Chức");

        // Select 16 teams for Worlds
        const tier1Leagues = leagues.filter(l => l.tier === Tier.Tier1);
        let participants: Team[] = [];
        tier1Leagues.forEach(league => {
            const sortedTeams = [...league.teams].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
            participants.push(...sortedTeams.slice(0, 2)); // Top 2 from each region
        });
        // Add 3rd/4th from AOG and KPL
        const aogLeague = tier1Leagues.find(l => l.region === RegionName.AOG)!;
        const kplLeague = tier1Leagues.find(l => l.region === RegionName.KPL)!;
        participants.push(...[...aogLeague.teams].sort((a, b) => b.wins - a.wins || a.losses - b.losses).slice(2, 4));
        participants.push(...[...kplLeague.teams].sort((a, b) => b.wins - a.wins || a.losses - b.losses).slice(2, 4));
        
        const participantIds = new Set(participants.map(p => p.id));
        
        // Atomically update leagues and derive participants to prevent race conditions
        const updatedLeaguesWithSwissStats = leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => 
                participantIds.has(t.id) 
                ? { ...t, swissWins: 0, swissLosses: 0, opponentsPlayed: [] } 
                : t
            )
        }));
        setLeagues(updatedLeaguesWithSwissStats);

        const initialParticipants = updatedLeaguesWithSwissStats
            .flatMap(l => l.teams)
            .filter(t => participantIds.has(t.id));
        
        setWorldsParticipants(initialParticipants);
        setSwissRound(1);
        setWorldsMatches(createSwissPairings(initialParticipants, 1));
        setGameState(GameState.WorldsSwissStage);
        setIsLoading(false);
    };
    
    const handleSimulateSwissRound = () => {
        setIsLoading(true);
        let updatedParticipants = [...worldsParticipants];
        // Fix: Corrected invalid type comparison between HeroRole and PlayerRole.
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
        const aiGetPicks = (roster: Player[]) => roster.map(p => {
            const validRoles = getValidHeroRolesForPlayerRole(p.role);
            return getRandom(heroPool.filter(h => validRoles.includes(h.role))) || getRandom(heroPool);
        });

        worldsMatches.forEach(match => {
            const teamA = updatedParticipants.find(t => t.id === match.teamA.id)!;
            const teamB = updatedParticipants.find(t => t.id === match.teamB.id)!;
            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, aiGetPicks(teamA.roster), aiGetPicks(teamB.roster), 'BO3', GameState.WorldsSwissStage);
            
            const winner = result.scoreA > result.scoreB ? teamA : teamB;
            const loser = result.scoreA > result.scoreB ? teamB : teamA;

            winner.swissWins! += 1;
            loser.swissLosses! += 1;
            winner.opponentsPlayed!.push(loser.id);
            loser.opponentsPlayed!.push(winner.id);
            
             addNews(
                `[CKTG] [T:${teamA.name}] vs [T:${teamB.name}]`,
                `[T:${winner.name}] giành chiến thắng ${Math.max(result.scoreA, result.scoreB)}-${Math.min(result.scoreA, result.scoreB)}.`,
                "Phóng Viên CKTG",
                NewsItemType.MATCH_RESULT
            );
        });

        setWorldsParticipants(updatedParticipants);
        
        const qualified = updatedParticipants.filter(t => t.swissWins === 3);
        const eliminated = updatedParticipants.filter(t => t.swissLosses === 3);

        if (qualified.length >= 8 || eliminated.length >= 8 || swissRound >= 5) {
            // End of Swiss Stage
            addNews("Vòng Swiss Kết Thúc", `8 đội mạnh nhất đã lộ diện và sẽ tiến vào Vòng Loại Trực Tiếp!`, "Ban Tổ Chức");
            setGameState(GameState.WorldsPlayoffs);
            const quarterFinalists = qualified.slice(0, 8);
            const quarterFinalMatches = [];
            for(let i = 0; i < 4; i++) {
                const teamA = quarterFinalists[i];
                const teamB = quarterFinalists[7-i];
                quarterFinalMatches.push({
                     id: `worlds-qf-${i}`, week: 1, round: 'Tứ Kết', isPlayed: false,
                     teamA: { id: teamA.id, name: teamA.name, logoUrl: teamA.logoUrl },
                     teamB: { id: teamB.id, name: teamB.name, logoUrl: teamB.logoUrl },
                });
            }
            setWorldsMatches(quarterFinalMatches);
        } else {
            const nextRound = swissRound + 1;
            setSwissRound(nextRound);
            setWorldsMatches(createSwissPairings(updatedParticipants, nextRound));
        }

        setIsLoading(false);
    };
    
    const handleSimulateWorldsPlayoffs = () => {
        setIsLoading(true);
        const allTeams = worldsParticipants;
        // Fix: Corrected invalid type comparison between HeroRole and PlayerRole.
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
        const aiGetPicks = (roster: Player[]) => roster.map(p => {
            const validRoles = getValidHeroRolesForPlayerRole(p.role);
            return getRandom(heroPool.filter(h => validRoles.includes(h.role))) || getRandom(heroPool);
        });
        
        const qfMatches = worldsMatches.filter(m => m.round === 'Tứ Kết');
        const qfWinners: any[] = [];
        const qfLosers: any[] = [];
        qfMatches.forEach(match => {
            const teamA = allTeams.find(t => t.id === match.teamA.id)!;
            const teamB = allTeams.find(t => t.id === match.teamB.id)!;
            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, aiGetPicks(teamA.roster), aiGetPicks(teamB.roster), 'BO5', GameState.WorldsPlayoffs);
            if (result.scoreA > result.scoreB) { qfWinners.push(match.teamA); qfLosers.push(match.teamB); }
            else { qfWinners.push(match.teamB); qfLosers.push(match.teamA); }
        });

        const sfMatches: Match[] = [
            { id: `worlds-sf-0`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[0], teamB: qfWinners[1] },
            { id: `worlds-sf-1`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[2], teamB: qfWinners[3] },
        ];
        const sfWinners: any[] = [];
        const sfLosers: any[] = [];
        sfMatches.forEach(match => {
            const teamA = allTeams.find(t => t.id === match.teamA.id)!;
            const teamB = allTeams.find(t => t.id === match.teamB.id)!;
            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, aiGetPicks(teamA.roster), aiGetPicks(teamB.roster), 'BO5', GameState.WorldsPlayoffs);
            if (result.scoreA > result.scoreB) { sfWinners.push(match.teamA); sfLosers.push(match.teamA); }
            else { sfWinners.push(match.teamB); sfLosers.push(match.teamA); }
        });

        const finalMatch: Match = { id: `worlds-final`, week: 3, round: 'Chung kết', isPlayed: false, teamA: sfWinners[0], teamB: sfWinners[1] };
        const finalTeamA = allTeams.find(t => t.id === finalMatch.teamA.id)!;
        const finalTeamB = allTeams.find(t => t.id === finalMatch.teamB.id)!;
        const finalResult = simulateMatchFn(finalTeamA, finalTeamB, finalTeamA.roster, finalTeamB.roster, aiGetPicks(finalTeamA.roster), aiGetPicks(finalTeamB.roster), 'BO7', GameState.WorldsPlayoffs);
        const championInfo = finalResult.scoreA > finalResult.scoreB ? finalMatch.teamA : finalMatch.teamB;
        const runnerUpInfo = finalResult.scoreA > finalResult.scoreB ? finalMatch.teamB : finalMatch.teamA;
        
        const champion: ChampionInfo = { teamId: championInfo.id, teamName: championInfo.name, teamLogoUrl: championInfo.logoUrl };
        setWorldChampion(champion);

        let updatedLeaguesWithPrizes = awardTrophyAndAchievements(champion.teamId, `Vô địch CKTG ${year}`, leagues);

        // Prize distribution
        const prizeName = `CKTG ${year}`;
        const swissParticipants = allTeams.filter(t => !qfWinners.some(w => w.id === t.id) && !qfLosers.some(l => l.id === t.id));
        
        updatedLeaguesWithPrizes = awardPrizeMoneyToLeagues(updatedLeaguesWithPrizes, championInfo.id, WORLDS_PRIZES[1], prizeName);
        updatedLeaguesWithPrizes = awardPrizeMoneyToLeagues(updatedLeaguesWithPrizes, runnerUpInfo.id, WORLDS_PRIZES[2], prizeName);
        sfLosers.forEach(t => updatedLeaguesWithPrizes = awardPrizeMoneyToLeagues(updatedLeaguesWithPrizes, t.id, WORLDS_PRIZES[4], prizeName));
        qfLosers.forEach(t => updatedLeaguesWithPrizes = awardPrizeMoneyToLeagues(updatedLeaguesWithPrizes, t.id, WORLDS_PRIZES[8], prizeName));
        swissParticipants.forEach(t => updatedLeaguesWithPrizes = awardPrizeMoneyToLeagues(updatedLeaguesWithPrizes, t.id, WORLDS_PRIZES[16], prizeName));
        
        setLeagues(updatedLeaguesWithPrizes);
        
        setGameState(GameState.SeasonEnd);
        addNews(
            `Vô địch CKTG ${year}!`, 
            `[T:${champion.teamName}] đã nâng cao chiếc cúp danh giá và nhận ${formatCurrency(WORLDS_PRIZES[1])} tiền thưởng!`,
            "Ban Tổ Chức CKTG",
            NewsItemType.CHAMPIONSHIP_WIN,
            // Fix: Corrected property names for champion metadata in `addNews` call. The metadata object expects `logoUrl` but was given `teamLogoUrl`, and was trying to access `champion.logoUrl` on a `ChampionInfo` object which has `teamLogoUrl`.
            { champion: { name: champion.teamName, logoUrl: champion.teamLogoUrl } }
        );

        setIsLoading(false);
    };

    const simulateAllAiPlayoffs = useCallback((leaguesToSimulate: League[], allCurrentLeagues: League[]) => {
        const newAiPlayoffResults: Record<string, { matches: Match[], champion: Team }> = {};
        const newChampions: { year: number, split: Split, region: RegionName, champion: Team }[] = [];
        let leaguesWithPrizesAndTrophies = JSON.parse(JSON.stringify(allCurrentLeagues));
        
        const aiLeaguesToSim = leaguesToSimulate.filter(l => l.tier === Tier.Tier1);
        const PRIZE_MAP: Record<Tier, Record<number, number>> = { [Tier.Tier1]: TIER1_PLAYOFF_PRIZES, [Tier.Tier2]: TIER2_PLAYOFF_PRIZES };

        aiLeaguesToSim.forEach(aiLeague => {
            const freshAiLeague = allCurrentLeagues.find(l => l.region === aiLeague.region && l.tier === aiLeague.tier);
            if (!freshAiLeague) return;

            const result = simulateFullPlayoffs(freshAiLeague);
            if (!result.champion) return;
            
            newAiPlayoffResults[freshAiLeague.region] = result;
            newChampions.push({ year, split, region: freshAiLeague.region, champion: result.champion });
            
            const trophyName = `Vô địch ${freshAiLeague.region} ${split} ${year}`;
            leaguesWithPrizesAndTrophies = awardTrophyAndAchievements(result.champion.id, trophyName, leaguesWithPrizesAndTrophies);
            
            // Prize Money Distribution
            const prizes = PRIZE_MAP[freshAiLeague.tier];
            if (prizes) {
                const prizeName = `${freshAiLeague.region} ${split} Playoffs`;
                leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, result.champion.id, prizes[1], prizeName);

                const finalMatch = result.matches.find(m => m.round === 'Chung Kết');
                if (finalMatch) {
                    const runnerUpId = finalMatch.teamA.id === result.champion.id ? finalMatch.teamB.id : finalMatch.teamA.id;
                    if(prizes[2]) leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, runnerUpId, prizes[2], prizeName);
                }

                const semiFinalMatches = result.matches.filter(m => m.round === 'Bán Kết');
                if (prizes[3]) {
                    semiFinalMatches.forEach(sf => {
                        const loserId = sf.result!.scoreA > sf.result!.scoreB ? sf.teamB.id : sf.teamA.id;
                        leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, loserId, prizes[3], prizeName);
                    });
                }
            }

            addNews(
                `[${freshAiLeague.region}] Vô địch Mùa ${split}!`,
                `[T:${result.champion.name}] đã lên ngôi vương!`,
                "Bình Luận Viên Quốc Tế",
                NewsItemType.CHAMPIONSHIP_WIN,
                { champion: { name: result.champion.name, logoUrl: result.champion.logoUrl } }
            );
        });

        setLeagues(leaguesWithPrizesAndTrophies);
        setAiPlayoffResults(prev => ({...prev, ...newAiPlayoffResults}));
        setYearlyChampions(prev => [...prev, ...newChampions]);
    }, [year, split, addNews, awardPrizeMoneyToLeagues]);

    const startPlayerPlayoffs = (league: League, allLeagues: League[]) => {
        // Player's league playoffs
        const sortedTeams = [...league.teams].sort((a, b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
        const top4 = sortedTeams.slice(0, 4);
        
        const semi1: Match = { id: `pf1-${split}-${year}`, week: 15, teamA: {id: top4[0].id, name: top4[0].name, logoUrl: top4[0].logoUrl}, teamB: {id: top4[3].id, name: top4[3].name, logoUrl: top4[3].logoUrl}, isPlayed: false, round: 'Bán Kết' };
        const semi2: Match = { id: `pf2-${split}-${year}`, week: 15, teamA: {id: top4[1].id, name: top4[1].name, logoUrl: top4[1].logoUrl}, teamB: {id: top4[2].id, name: top4[2].name, logoUrl: top4[2].logoUrl}, isPlayed: false, round: 'Bán Kết' };
        
        setPlayoffMatches([semi1, semi2]);
        setRegionalChampion(null);

        // Set game state immediately so UI updates to show playoff bracket
        setGameState(GameState.Playoffs);
        addNews(`Vòng Playoff Mùa ${split} Bắt Đầu!`, `${top4.map(t => `[T:${t.name}]`).join(', ')} sẽ tranh tài cho chức vô địch!`, "Ban Tổ Chức");

        // Defer the heavy AI simulation to prevent UI freeze
        setTimeout(() => {
            simulateAllAiPlayoffs(allLeagues.filter(l => l.region !== league.region && l.tier === Tier.Tier1), allLeagues);
        }, 50);
    };

    const simulateFullMsi = useCallback((currentLeagues: League[]) => {
        setIsLoading(true);
        addNews("MSI Bắt đầu!", "16 đội tuyển hàng đầu từ 4 khu vực lớn nhất sẽ tranh tài!", "Ban Tổ Chức MSI");

        const majorRegions = [RegionName.AOG, RegionName.KPL, RegionName.RPL, RegionName.GCS];
        const tier1Leagues = currentLeagues.filter(l => l.tier === Tier.Tier1 && majorRegions.includes(l.region));
        
        let participants: Team[] = [];
        tier1Leagues.forEach(league => {
            const sortedTeams = [...league.teams].sort((a, b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
            participants.push(...sortedTeams.slice(0, 4)); // Top 4 from each major region
        });
        
        participants = participants.map(p => ({ ...p, msiWins: 0, msiLosses: 0 }));
        const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
        const groupA = shuffledParticipants.slice(0, 8);
        const groupB = shuffledParticipants.slice(8, 16);

        const groupMatches = [...createMsiGroupSchedule(groupA, 'A', year), ...createMsiGroupSchedule(groupB, 'B', year)];
        
        // Simulate Group Stage by round
        for (let round = 1; round <= 7; round++) { // 7 rounds for 8 teams
            const matchesThisRound = groupMatches.filter(m => m.week === round);
            matchesThisRound.forEach(match => {
                const teamA = participants.find(t => t.id === match.teamA.id)!;
                const teamB = participants.find(t => t.id === match.teamB.id)!;
                const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO1', GameState.MSI);
                match.isPlayed = true;
                match.result = result;
                const winnerId = result.scoreA > result.scoreB ? teamA.id : teamB.id;
                const loserId = result.scoreA > result.scoreB ? teamB.id : teamA.id;
                participants.find(p => p.id === winnerId)!.msiWins! += 1;
                participants.find(p => p.id === loserId)!.msiLosses! += 1;
            });
        }
        addNews("Vòng Bảng MSI Kết Thúc", "8 đội tuyển xuất sắc nhất đã được xác định!", "Ban Tổ Chức MSI");

        // Create Knockout Stage
        const groupAStandings = participants.filter(p => groupA.some(t => t.id === p.id)).sort((a,b) => b.msiWins! - a.msiWins! || a.msiLosses! - b.msiLosses!);
        const groupBStandings = participants.filter(p => groupB.some(t => t.id === p.id)).sort((a,b) => b.msiWins! - a.msiWins! || a.msiLosses! - b.msiLosses!);
        const topA = groupAStandings.slice(0, 4);
        const topB = groupBStandings.slice(0, 4);
        const knockoutMatches: Match[] = [
            { id: `msi-qf-1-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topA[0].id, name: topA[0].name, logoUrl: topA[0].logoUrl }, teamB: { id: topB[3].id, name: topB[3].name, logoUrl: topB[3].logoUrl } },
            { id: `msi-qf-2-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topB[1].id, name: topB[1].name, logoUrl: topB[1].logoUrl }, teamB: { id: topA[2].id, name: topA[2].name, logoUrl: topA[2].logoUrl } },
            { id: `msi-qf-3-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topB[0].id, name: topB[0].name, logoUrl: topB[0].logoUrl }, teamB: { id: topA[3].id, name: topA[3].name, logoUrl: topA[3].logoUrl } },
            { id: `msi-qf-4-${year}`, week: 1, round: 'Tứ kết', isPlayed: false, teamA: { id: topA[1].id, name: topA[1].name, logoUrl: topA[1].logoUrl }, teamB: { id: topB[2].id, name: topB[2].name, logoUrl: topB[2].logoUrl } },
        ];

        // Simulate Knockouts
        const qfWinners: any[] = [];
        knockoutMatches.filter(m => m.round === 'Tứ kết').forEach(match => {
            const teamA = participants.find(t => t.id === match.teamA.id)!;
            const teamB = participants.find(t => t.id === match.teamB.id)!;
            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.MSI);
            match.isPlayed = true;
            match.result = result;
            qfWinners.push(result.scoreA > result.scoreB ? match.teamA : match.teamB);
        });
        
        knockoutMatches.push({ id: `msi-sf-1-${year}`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[0], teamB: qfWinners[1] });
        knockoutMatches.push({ id: `msi-sf-2-${year}`, week: 2, round: 'Bán kết', isPlayed: false, teamA: qfWinners[2], teamB: qfWinners[3] });
        
        const sfWinners: any[] = [];
         knockoutMatches.filter(m => m.round === 'Bán kết').forEach(match => {
            const teamA = participants.find(t => t.id === match.teamA.id)!;
            const teamB = participants.find(t => t.id === match.teamB.id)!;
            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.MSI);
            match.isPlayed = true;
            match.result = result;
            sfWinners.push(result.scoreA > result.scoreB ? match.teamA : match.teamB);
        });

        knockoutMatches.push({ id: `msi-final-${year}`, week: 3, round: 'Chung kết', isPlayed: false, teamA: sfWinners[0], teamB: sfWinners[1] });
        const finalMatchFull = knockoutMatches.find(m => m.round === 'Chung kết')!;
        const teamA = participants.find(t => t.id === finalMatchFull.teamA.id)!;
        const teamB = participants.find(t => t.id === finalMatchFull.teamB.id)!;
        const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.MSI);
        finalMatchFull.isPlayed = true;
        finalMatchFull.result = result;

        const championInfo = result.scoreA > result.scoreB ? finalMatchFull.teamA : finalMatchFull.teamB;
        const championTeam = participants.find(t => t.id === championInfo.id)!;

        const trophyName = `Vô địch MSI ${year}`;
        let leaguesWithPrizesAndTrophies = awardTrophyAndAchievements(championTeam.id, trophyName, currentLeagues);
        
        // --- PRIZE MONEY DISTRIBUTION ---
        const finalMatch = knockoutMatches.find(m => m.round === 'Chung kết')!;
        const runnerUpId = finalMatch.teamA.id === championTeam.id ? finalMatch.teamB.id : finalMatch.teamA.id;
        
        const semiFinalMatches = knockoutMatches.filter(m => m.round === 'Bán kết');
        const semiFinalLoserIds = semiFinalMatches.map(sf => sf.result!.scoreA > sf.result!.scoreB ? sf.teamB.id : sf.teamA.id);

        const quarterFinalMatches = knockoutMatches.filter(m => m.round === 'Tứ kết');
        const quarterFinalLoserIds = quarterFinalMatches.map(qf => qf.result!.scoreA > qf.result!.scoreB ? qf.teamB.id : qf.teamA.id);
        
        const prizeName = `MSI ${year}`;
        participants.forEach(p => {
            if (p.id === championTeam.id) leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, p.id, MSI_PRIZES[1], prizeName);
            else if (p.id === runnerUpId) leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, p.id, MSI_PRIZES[2], prizeName);
            else if (semiFinalLoserIds.includes(p.id)) leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, p.id, MSI_PRIZES[4], prizeName);
            else if (quarterFinalLoserIds.includes(p.id)) leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, p.id, MSI_PRIZES[8], prizeName);
            else leaguesWithPrizesAndTrophies = awardPrizeMoneyToLeagues(leaguesWithPrizesAndTrophies, p.id, MSI_PRIZES[16], prizeName);
        });

        addNews(
            `Vô địch MSI ${year}!`,
            `[T:${championTeam.name}] đã xuất sắc vượt qua các đối thủ nặng ký để lên ngôi vương!`, 
            "Ban Tổ Chức MSI",
            NewsItemType.CHAMPIONSHIP_WIN,
            { champion: { name: championTeam.name, logoUrl: championTeam.logoUrl } }
        );
        
        setLeagues(leaguesWithPrizesAndTrophies);
        setMsiData({ participants, groupMatches, knockoutMatches, champion: championTeam });
        setIsLoading(false);
    }, [addNews, year, awardPrizeMoneyToLeagues, simulateMatchFn]);

    const startPlayerMsi = useCallback((currentLeagues: League[]) => {
        setIsLoading(true);
        addNews("MSI Bắt đầu!", "16 đội tuyển hàng đầu từ 4 khu vực lớn nhất sẽ tranh tài!", "Ban Tổ Chức MSI");

        const majorRegions = [RegionName.AOG, RegionName.KPL, RegionName.RPL, RegionName.GCS];
        const tier1Leagues = currentLeagues.filter(l => l.tier === Tier.Tier1 && majorRegions.includes(l.region));
        
        let participants: Team[] = [];
        tier1Leagues.forEach(league => {
            const sortedTeams = [...league.teams].sort((a, b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
            participants.push(...sortedTeams.slice(0, 4));
        });
        
        participants = participants.map(p => ({ ...p, msiWins: 0, msiLosses: 0 }));
        const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
        const groupA = shuffledParticipants.slice(0, 8);
        const groupB = shuffledParticipants.slice(8, 16);

        const groupMatches = [...createMsiGroupSchedule(groupA, 'A', year), ...createMsiGroupSchedule(groupB, 'B', year)];

        setMsiData({ participants, groupMatches, knockoutMatches: [], champion: undefined });
        setGameState(GameState.MSI);
        setIsLoading(false);
    }, [addNews, year]);

    useEffect(() => {
        if (gameState === GameState.MidSeasonBreak && !msiData && split === Split.Spring && !msiCheckInProgress.current) {
            msiCheckInProgress.current = true; // Acquire lock to prevent re-entry

            if (!playerTeam) {
                msiCheckInProgress.current = false; // Release lock on early exit
                return;
            }

            const majorRegions = [RegionName.AOG, RegionName.KPL, RegionName.RPL, RegionName.GCS];
            const playerLeague = leagues.find(l => l.region === playerTeam.region && l.tier === playerTeam.tier);
            
            if (!playerLeague) {
                setTimeout(() => simulateFullMsi(leagues), 50);
                return;
            }

            const sortedTeams = [...playerLeague.teams].sort((a,b) => b.wins - a.wins || (b.roundsWon - b.roundsLost) - (a.roundsWon - a.roundsLost) || a.losses - b.losses);
            const playerRankInLeague = sortedTeams.findIndex(t => t.id === playerTeam.id) + 1;
            
            const didPlayerQualify = playerTeam.tier === Tier.Tier1 && 
                                     majorRegions.includes(playerTeam.region) && 
                                     playerRankInLeague > 0 && playerRankInLeague <= 4;

            if (didPlayerQualify) {
                addToast("Chúc mừng! Đội của bạn đã đủ điều kiện tham dự MSI!", "success");
                setTimeout(() => startPlayerMsi(leagues), 50);
            } else {
                addToast("Đội của bạn không đủ điều kiện tham dự MSI. Giải đấu sẽ được mô phỏng.", "info");
                setTimeout(() => simulateFullMsi(leagues), 50);
            }
        }
    }, [gameState, msiData, split, leagues, playerTeam, simulateFullMsi, startPlayerMsi, addToast]);
    
    const handleAdvanceMSI = () => {
        if (!msiData || !playerTeam) return;
        setIsLoading(true);
    
        const isKnockout = msiData.knockoutMatches?.length > 0;
        const relevantMatches = isKnockout ? msiData.knockoutMatches : msiData.groupMatches;
    
        const nextPlayerMatch = relevantMatches.find(m => !m.isPlayed && (m.teamA.id === playerTeamId || m.teamB.id === playerTeamId));
    
        if (nextPlayerMatch) {
            const opponent = nextPlayerMatch.teamA.id === playerTeamId ? nextPlayerMatch.teamB : nextPlayerMatch.teamA;
            const opponentTeam = msiData.participants.find(t => t.id === opponent.id)!;
            setMatchDayInfo({ match: nextPlayerMatch, playerTeam, opponentTeam });
            setView('match_day');
            setIsLoading(false);
        } else {
            // Player has no more matches or has been eliminated. Simulate the next unplayed round for AI teams.
            let updatedMsiData = JSON.parse(JSON.stringify(msiData));
            let updatedParticipants = updatedMsiData.participants;
    
            if (!isKnockout) {
                const firstUnplayedMatch = updatedMsiData.groupMatches.find((m: Match) => !m.isPlayed);
                if (firstUnplayedMatch) {
                    const roundToSim = firstUnplayedMatch.week;
                    addToast(`Mô phỏng Vòng ${roundToSim} của Vòng Bảng MSI.`, "info");
                    const matchesThisRound = updatedMsiData.groupMatches.filter((m: Match) => m.week === roundToSim && !m.isPlayed);
                    
                    matchesThisRound.forEach((aiMatch: Match) => {
                        const teamA = updatedParticipants.find((t: Team) => t.id === aiMatch.teamA.id)!;
                        const teamB = updatedParticipants.find((t: Team) => t.id === aiMatch.teamB.id)!;
                        const simResult = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO1', GameState.MSI);
                        
                        const matchIdx = updatedMsiData.groupMatches.findIndex((m: Match) => m.id === aiMatch.id);
                        if (matchIdx !== -1) updatedMsiData.groupMatches[matchIdx] = { ...aiMatch, isPlayed: true, result: simResult };
    
                        const winnerId = simResult.scoreA > simResult.scoreB ? teamA.id : teamB.id;
                        const loserId = simResult.scoreA > simResult.scoreB ? teamB.id : teamA.id;
                        updatedParticipants = updatedParticipants.map((p: Team) => {
                            if (p.id === winnerId) return { ...p, msiWins: (p.msiWins || 0) + 1 };
                            if (p.id === loserId) return { ...p, msiLosses: (p.msiLosses || 0) + 1 };
                            return p;
                        });
                    });
                     updatedMsiData.participants = updatedParticipants;
                     setMsiData(updatedMsiData);
                }
                
                const allGroupMatchesPlayed = updatedMsiData.groupMatches.every((m: Match) => m.isPlayed);
                if (allGroupMatchesPlayed && !updatedMsiData.knockoutMatches.length) {
                    // Transition to knockout stage logic
                    const lastMatch = updatedMsiData.groupMatches[updatedMsiData.groupMatches.length - 1];
                    // handleMatchComplete contains the logic to create knockout matches
                    handleMatchComplete(lastMatch, lastMatch.result!, [], []);
                    return; 
                }
    
            } else { // AI simulation for knockout stage
                const firstUnplayedKnockout = updatedMsiData.knockoutMatches.find((m: Match) => !m.isPlayed);
                if (firstUnplayedKnockout) {
                    const roundToSim = firstUnplayedKnockout.round!;
                    addToast(`Mô phỏng ${roundToSim} MSI.`, "info");
                    const matchesThisRound = updatedMsiData.knockoutMatches.filter((m: Match) => m.round === roundToSim && !m.isPlayed);
                    
                    matchesThisRound.forEach((aiMatch: Match) => {
                        const teamA = updatedParticipants.find((t: Team) => t.id === aiMatch.teamA.id)!;
                        const teamB = updatedParticipants.find((t: Team) => t.id === aiMatch.teamB.id)!;
                        const simResult = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.MSI);
                        const matchIdx = updatedMsiData.knockoutMatches.findIndex((m: Match) => m.id === aiMatch.id);
                        if (matchIdx !== -1) updatedMsiData.knockoutMatches[matchIdx] = { ...aiMatch, isPlayed: true, result: simResult };
                    });
                     
                    const allRoundMatchesPlayed = updatedMsiData.knockoutMatches.filter((m: Match) => m.round === roundToSim).every((m: Match) => m.isPlayed);
                    if (allRoundMatchesPlayed) {
                         setMsiData(updatedMsiData);
                         const lastMatchOfRound = matchesThisRound[matchesThisRound.length - 1];
                         // handleMatchComplete contains logic to generate next round
                         handleMatchComplete(lastMatchOfRound, updatedMsiData.knockoutMatches.find((m:Match) => m.id === lastMatchOfRound.id)!.result!, [], []);
                         return;
                    } else {
                        setMsiData(updatedMsiData);
                    }
                } else if (updatedMsiData.champion) {
                     addToast(`MSI đã có nhà vô địch: ${updatedMsiData.champion.name}!`, "info");
                     setGameState(GameState.MidSeasonBreak);
                }
            }
            
            setIsLoading(false);
        }
    };
    
    const handleAdvancePlayoffs = () => {
        if (!playerTeam) return;
        setIsLoading(true);

        const unplayedMatches = playoffMatches.filter(m => !m.isPlayed);
        if (unplayedMatches.length === 0) {
            setIsLoading(false);
            return;
        }

        const nextRound = unplayedMatches[0].round!;
        const matchesInNextRound = unplayedMatches.filter(m => m.round === nextRound);
        const isPlayerInvolved = matchesInNextRound.some(m => m.teamA.id === playerTeamId || m.teamB.id === playerTeamId);

        if (isPlayerInvolved) {
            const playerMatch = matchesInNextRound.find(m => m.teamA.id === playerTeamId || m.teamB.id === playerTeamId)!;
            const opponent = playerMatch.teamA.id === playerTeamId ? playerMatch.teamB : playerMatch.teamA;
            const opponentTeam = leagues.flatMap(l => l.teams).find(t => t.id === opponent.id)!;
            setMatchDayInfo({ match: playerMatch, playerTeam, opponentTeam });
            setView('match_day');
            setIsLoading(false);
        } else { // Simulate all AI matches in this round
            const allTeams = leagues.flatMap(l => l.teams);
            let updatedMatches = [...playoffMatches];
            let newsContent = `Kết quả Playoff - ${nextRound}:\n`;

            matchesInNextRound.forEach(match => {
                const teamA = allTeams.find(t => t.id === match.teamA.id)!;
                const teamB = allTeams.find(t => t.id === match.teamB.id)!;
                const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.Playoffs);
                const matchIndex = updatedMatches.findIndex(m => m.id === match.id);
                if (matchIndex !== -1) {
                    updatedMatches[matchIndex] = { ...updatedMatches[matchIndex], isPlayed: true, result };
                }
                const winnerName = result.scoreA > result.scoreB ? teamA.name : teamB.name;
                newsContent += `[T:${winnerName}] thắng [T:${winnerName === teamA.name ? teamB.name : teamA.name}].\n`;
            });
            addNews(`Playoffs Mùa ${split}`, newsContent, "Phóng Viên Thể Thao");
            
            // Check if round is complete and advance bracket
            if (nextRound === 'Bán Kết') {
                const semiFinals = updatedMatches.filter(m => m.round === 'Bán Kết');
                if (semiFinals.every(m => m.isPlayed)) {
                    const winner1 = semiFinals[0].result!.scoreA > semiFinals[0].result!.scoreB ? semiFinals[0].teamA : semiFinals[0].teamB;
                    const winner2 = semiFinals[1].result!.scoreA > semiFinals[1].result!.scoreB ? semiFinals[1].teamA : semiFinals[1].teamB;
                    updatedMatches.push({ id: `final-${split}-${year}`, week: 16, round: 'Chung Kết', isPlayed: false, teamA: winner1, teamB: winner2 });
                    addNews(`Chung kết Mùa ${split} đã được xác định!`, `[T:${winner1.name}] sẽ đối đầu với [T:${winner2.name}]!`, "Ban Tổ Chức");
                }
            } else if (nextRound === 'Chung Kết') {
                const finalMatch = updatedMatches.find(m => m.round === 'Chung Kết')!;
                const result = finalMatch.result!;
                const championInfo = result.scoreA > result.scoreB ? finalMatch.teamA : finalMatch.teamB;
                const championTeam = allTeams.find(t => t.id === championInfo.id)!;
                setRegionalChampion(championTeam);
                setYearlyChampions(prev => [...prev, { year, split, region: championTeam.region, champion: championTeam }]);
                const trophyName = `Vô địch ${playerTeam?.region} ${split} ${year}`;
                let leaguesWithPrizes = awardTrophyAndAchievements(championTeam.id, trophyName, leagues);
                 
                const playerLeague = leaguesWithPrizes.find(l => l.region === championTeam.region && l.tier === championTeam.tier)!;
                const PRIZE_MAP: Record<Tier, Record<number, number>> = { [Tier.Tier1]: TIER1_PLAYOFF_PRIZES, [Tier.Tier2]: TIER2_PLAYOFF_PRIZES };
                const prizes = PRIZE_MAP[playerLeague.tier];
                
                if (prizes) {
                    const prizeName = `${playerLeague.region} ${split} Playoffs`;
                    leaguesWithPrizes = awardPrizeMoneyToLeagues(leaguesWithPrizes, championTeam.id, prizes[1], prizeName);
                    const runnerUpId = finalMatch.teamA.id === championTeam.id ? finalMatch.teamB.id : finalMatch.teamA.id;
                    if(prizes[2]) leaguesWithPrizes = awardPrizeMoneyToLeagues(leaguesWithPrizes, runnerUpId, prizes[2], prizeName);
                    const semiFinalMatches = updatedMatches.filter(m => m.round === 'Bán Kết');
                    if(prizes[3]) {
                        semiFinalMatches.forEach(sf => {
                            const loserId = sf.result!.scoreA > sf.result!.scoreB ? sf.teamB.id : sf.teamA.id;
                            leaguesWithPrizes = awardPrizeMoneyToLeagues(leaguesWithPrizes, loserId, prizes[3], prizeName);
                        });
                    }
                }

                setLeagues(leaguesWithPrizes);
                 addNews(
                    `Vô địch ${playerTeam?.region} ${split} ${year}!`,
                    `[T:${championTeam.name}] đã lên ngôi vương!`,
                    "Ban Tổ Chức",
                    NewsItemType.CHAMPIONSHIP_WIN,
                    { champion: { name: championTeam.name, logoUrl: championTeam.logoUrl } }
                );
                if (split === Split.Spring) setGameState(GameState.MidSeasonBreak);
                else setGameState(GameState.OffSeason);
            }
            
            setPlayoffMatches(updatedMatches);
            setIsLoading(false);
        }
    };


    const handleStartSummerSplit = useCallback(() => {
        setIsLoading(true);

        // --- PROMOTION & RELEGATION (Mid-Season) ---
        const { updatedLeagues: leaguesAfterPromotion, promotions, relegations } = performPromotionRelegation(leagues);
        if (promotions.length > 0 || relegations.length > 0) {
            generatePromotionRelegationNews(promotions, relegations);
        }

        const updatedLeaguesWithReset = leaguesAfterPromotion.map(league => ({
            ...league,
            teams: league.teams.map(team => ({
                ...team,
                wins: 0,
                losses: 0,
                roundsWon: 0,
                roundsLost: 0,
            })),
            schedule: createSchedule(league.teams) // Regenerate schedule
        }));
        setLeagues(calculateInitialRanks(updatedLeaguesWithReset));
        
        setSplit(Split.Summer);
        setCurrentWeek(1);
        setGameState(GameState.RegularSeason);
        setPlayoffMatches([]);
        setRegionalChampion(null);
        // Do not reset MSI data here, so it can be viewed in history
        addNews("Mùa Hè Bắt Đầu", "Các đội trở lại sau kỳ nghỉ. Giai đoạn 2 của mùa giải bắt đầu!", "Ban Tổ Chức");

        setIsLoading(false);
    }, [leagues, addNews, performPromotionRelegation, generatePromotionRelegationNews]);

    const handleSimulateAiTransfers = useCallback(() => {
        setIsLoading(true);
        addNews("Kỳ chuyển nhượng AI bắt đầu!", "Các đội AI đang tích cực tìm kiếm nhân tài và tái cấu trúc đội hình.", "Chuyên Gia Chuyển Nhượng");
        
        setTimeout(() => {
            const { updatedLeagues, updatedFreeAgents } = performAiTransfers(leagues, freeAgents);
            setLeagues(updatedLeagues);
            setFreeAgents(updatedFreeAgents);
            setGameState(GameState.AITransferWindow);
            setIsLoading(false);
        }, 500);
    }, [leagues, freeAgents, performAiTransfers, addNews]);

    const handleSimulateWeek = () => {
        if (!playerTeam) return;
        setIsLoading(true);
        
        const playerLeagueInfo = leagues.find(l => l.teams.some(t => t.id === playerTeamId));
        if (!playerLeagueInfo) {
            setIsLoading(false);
            console.error("Player league info not found");
            return;
        }

        const playerMatchThisWeek = playerLeagueInfo.schedule.find(m => m.week === currentWeek && !m.isPlayed && (m.teamA.id === playerTeamId || m.teamB.id === playerTeamId));

        if (playerMatchThisWeek) {
            const opponent = playerMatchThisWeek.teamA.id === playerTeamId ? playerMatchThisWeek.teamB : playerMatchThisWeek.teamA;
            const opponentTeam = leagues.flatMap(l => l.teams).find(t => t.id === opponent.id)!;
            setMatchDayInfo({ match: playerMatchThisWeek, playerTeam: playerTeam, opponentTeam });
            setView('match_day');
            setIsLoading(false);
            return;
        }

        let updatedLeagues = [...leagues];

        for (const league of leagues) {
            const matchesThisWeek = league.schedule.filter(m => m.week === currentWeek && !m.isPlayed);
            
            updatedLeagues = matchesThisWeek.reduce((currentLeaguesState, match) => {
                const teams = currentLeaguesState.flatMap(l => l.teams);
                const teamA = teams.find(t => t.id === match.teamA.id)!;
                const teamB = teams.find(t => t.id === match.teamB.id)!;
                
                const rosterA = teamA.roster;
                const rosterB = teamB.roster;
                const result = simulateMatchFn(teamA, teamB, rosterA, rosterB, [], [], 'BO3', GameState.RegularSeason);

                const isPlayerLeagueMatch = league.region === playerLeagueInfo.region && league.tier === playerLeagueInfo.tier;
                if(isPlayerLeagueMatch){
                    generateRichNewsForMatch(teamA, teamB, result, currentLeaguesState);
                }
                
                return applyMatchResultToLeagues(currentLeaguesState, match, result, rosterA, rosterB);
            }, updatedLeagues);
        }
        
        updatedLeagues = performWeeklyUpdates(updatedLeagues);
        setLeagues(updatedLeagues);

        if (Math.random() < 0.15) {
            const randomPlayer = playerTeam.roster[Math.floor(Math.random() * playerTeam.roster.length)];
            setDramaEvent({ player: randomPlayer, description: "Bị phát hiện có thái độ không đúng mực khi đang livestream." });
        }

        setTimeout(() => {
            const currentLeague = updatedLeagues.find(l => l.region === playerTeam!.region && l.tier === playerTeam!.tier)!;
            const numTeamsInLeague = currentLeague.teams.length;
            const effectiveNumTeams = numTeamsInLeague % 2 === 0 ? numTeamsInLeague : numTeamsInLeague + 1;
            const endOfRegularSeason = (effectiveNumTeams - 1) * 2;
            
            if (currentWeek >= endOfRegularSeason) {
                if (currentLeague.tier === Tier.Tier1) {
                    startPlayerPlayoffs(currentLeague, updatedLeagues);
                } else {
                    // Non-Tier 1 leagues go directly to the next phase.
                    // Update game state immediately for UI responsiveness.
                    if (split === Split.Spring) {
                        setGameState(GameState.MidSeasonBreak);
                    } else {
                        setGameState(GameState.OffSeason);
                    }
                    // Defer the heavy AI playoff simulation.
                    setTimeout(() => {
                        simulateAllAiPlayoffs(updatedLeagues.filter(l => l.tier === Tier.Tier1), updatedLeagues);
                    }, 50);
                }
            } else {
                setCurrentWeek(prev => prev + 1);
            }
            setIsLoading(false);
        }, 1000);
    };

    const simulateAllPromotionMatches = () => {
        let finalLeagues = JSON.parse(JSON.stringify(leagues));
        const finalPromotionMatches: Match[] = [];
        const relegatedTeams: Team[] = [];
        const promotedTeams: Team[] = [];

        for (const match of promotionMatches) {
            if (match.isPlayed) {
                finalPromotionMatches.push(match);
                continue;
            };

            const allTeams = finalLeagues.flatMap((l: League) => l.teams);
            const teamA = allTeams.find((t: Team) => t.id === match.teamA.id); // T1 team
            const teamB = allTeams.find((t: Team) => t.id === match.teamB.id); // T2 team

            if (!teamA || !teamB) continue;

            const result = simulateMatchFn(teamA, teamB, teamA.roster, teamB.roster, [], [], 'BO5', GameState.PromotionRelegation);
            const winner = result.scoreA > result.scoreB ? teamA : teamB;
            const loser = result.scoreA > result.scoreB ? teamB : teamA;

            if (winner.id === teamB.id) { // T2 team won
                promotedTeams.push(teamB);
                relegatedTeams.push(teamA);
                addNews(`[Phân Hạng] ${winner.name} THĂNG HẠNG!`, `${winner.name} đã đánh bại ${loser.name} với tỉ số ${Math.max(result.scoreA, result.scoreB)}-${Math.min(result.scoreA, result.scoreB)} để giành suất thi đấu tại Hạng 1 mùa sau!`, "Ban Tổ Chức");
            } else { // T1 team won
                addNews(`[Phân Hạng] ${winner.name} TRỤ HẠNG!`, `${winner.name} đã bảo vệ thành công vị trí tại Hạng 1 sau chiến thắng ${Math.max(result.scoreA, result.scoreB)}-${Math.min(result.scoreA, result.scoreB)} trước ${loser.name}.`, "Ban Tổ Chức");
            }
            finalPromotionMatches.push({...match, isPlayed: true, result});
        }

        setPromotionMatches(finalPromotionMatches);

        if (promotedTeams.length > 0 || relegatedTeams.length > 0) {
            finalLeagues = finalLeagues.map((league: League) => {
                if (league.tier === Tier.Tier1) {
                    let newTeams = league.teams.filter((t: Team) => !relegatedTeams.some(rt => rt.id === t.id));
                    const promotedForThisRegion = promotedTeams.filter(pt => pt.region === league.region);
                    promotedForThisRegion.forEach(pt => pt.tier = Tier.Tier1);
                    newTeams = [...newTeams, ...promotedForThisRegion];
                    return {...league, teams: newTeams};
                }
                if (league.tier === Tier.Tier2) {
                    let newTeams = league.teams.filter((t: Team) => !promotedTeams.some(pt => pt.id === t.id));
                    const relegatedForThisRegion = relegatedTeams.filter(rt => rt.region === league.region);
                    relegatedForThisRegion.forEach(rt => rt.tier = Tier.Tier2);
                    newTeams = [...newTeams, ...relegatedForThisRegion];
                    return {...league, teams: newTeams};
                }
                return league;
            });
        }
        
        setLeagues(finalLeagues);
        setGameState(GameState.SeasonEnd);
    };

     const handleAdvancePromotion = () => {
        setIsLoading(true);

        const playerMatch = promotionMatches.find(m => !m.isPlayed && (m.teamA.id === playerTeamId || m.teamB.id === playerTeamId));

        if (playerMatch && playerTeam) {
            const opponent = playerMatch.teamA.id === playerTeamId ? playerMatch.teamB : playerMatch.teamA;
            const opponentTeam = leagues.flatMap(l => l.teams).find(t => t.id === opponent.id)!;
            setMatchDayInfo({ match: playerMatch, playerTeam, opponentTeam });
            setView('match_day');
            setIsLoading(false);
        } else {
            // Player is not in promotion, or their match is done. Simulate the rest.
            simulateAllPromotionMatches();
            setIsLoading(false);
        }
    };

    const getStaffUpgradeCost = (level: number) => 5000 * (level + 1);
    const getFacilityUpgradeCost = (level: number) => 10000 * (level + 1);
    const MAX_LEVEL = 10;

    const handleUpgradeStaff = (staffId: string) => {
        if (!playerTeam) return;
        const staffMember = playerTeam.staff.find(s => s.id === staffId);
        if (!staffMember || staffMember.level >= MAX_LEVEL) return;

        const cost = getStaffUpgradeCost(staffMember.level);
        if (playerTeam.finances.budget < cost) {
            addToast("Không đủ ngân sách!", "error");
            return;
        }

        const updatedTeam = {
            ...playerTeam,
            finances: { ...playerTeam.finances, budget: playerTeam.finances.budget - cost },
            staff: playerTeam.staff.map(s => s.id === staffId ? { ...s, level: s.level + 1 } : s),
        };

        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeam.id ? updatedTeam : t),
        })));
    };

    const handleUpgradeFacility = (facilityType: FacilityType) => {
        if (!playerTeam) return;
        const facility = playerTeam.facilities.find(f => f.type === facilityType);
        if (!facility || facility.level >= MAX_LEVEL) return;

        const cost = getFacilityUpgradeCost(facility.level);
        if (playerTeam.finances.budget < cost) {
            addToast("Không đủ ngân sách!", "error");
            return;
        }

        const updatedTeam = {
            ...playerTeam,
            finances: { ...playerTeam.finances, budget: playerTeam.finances.budget - cost },
            facilities: playerTeam.facilities.map(f => f.type === facilityType ? { ...f, level: f.level + 1 } : f),
        };

        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeam.id ? updatedTeam : t),
        })));
    };

    const generateSponsorOffers = useCallback((teamReputation: number, slot: SponsorSlot, year: number, split: Split): Sponsor[] => {
        const offers: Sponsor[] = [];
        const numOffers = getRandomNumber(2, 3);
        const usedNames = new Set<string>();

        // 1. Determine eligible prestige levels based on reputation
        let eligiblePrestige: SponsorPrestige[] = ['Local'];
        if (teamReputation > 40) eligiblePrestige.push('Regional');
        if (teamReputation > 70) eligiblePrestige.push('National');
        if (teamReputation > 90) eligiblePrestige.push('Global');
        
        // 2. Filter sponsor pool
        const availableSponsors = SPONSOR_POOL.filter(s => 
            s.prestige.some(p => eligiblePrestige.includes(p))
        );

        for (let i = 0; i < numOffers; i++) {
            let sponsorInfo = getRandom(availableSponsors);
            if (!sponsorInfo || usedNames.has(sponsorInfo.name)) {
                // Avoid duplicates and handle empty pool
                sponsorInfo = getRandom(availableSponsors.filter(s => !usedNames.has(s.name))) || getRandom(SPONSOR_POOL);
            }
            if (!sponsorInfo) continue;
            
            usedNames.add(sponsorInfo.name);

            // 3. Determine offer prestige & payment
            const offerPrestige = getRandom(sponsorInfo.prestige.filter(p => eligiblePrestige.includes(p))) || sponsorInfo.prestige[0];
            
            const slotMultiplier = {
                [SponsorSlot.Main]: 1.5,
                [SponsorSlot.Sleeve]: 1.0,
                [SponsorSlot.Headset]: 0.8,
                [SponsorSlot.Chair]: 0.8,
            }[slot];

            const prestigeBasePayments: Record<SponsorPrestige, {min: number, max: number}> = {
                'Local': { min: 10000, max: 20000 },
                'Regional': { min: 25000, max: 50000 },
                'National': { min: 60000, max: 120000 },
                'Global': { min: 150000, max: 300000 },
            };
            const base = prestigeBasePayments[offerPrestige];
            const basePayment = Math.round((getRandomNumber(base.min, base.max) * (1 + teamReputation / 200) * slotMultiplier) / 1000) * 1000;
            
            // 4. Generate objective based on prestige
            let objectiveType: SponsorObjectiveType;
            let targetValue: number | undefined;
            let objectiveDescription = '';
            
            const prestigeObjectives: Record<SponsorPrestige, SponsorObjectiveType[]> = {
                'Local': [SponsorObjectiveType.WIN_X_MATCHES, SponsorObjectiveType.SIGN_STAR_PLAYER],
                'Regional': [SponsorObjectiveType.WIN_X_MATCHES, SponsorObjectiveType.REACH_FINALS, SponsorObjectiveType.PLAYER_HAS_HIGH_MVPS],
                'National': [SponsorObjectiveType.WIN_CHAMPIONSHIP, SponsorObjectiveType.REACH_FINALS, SponsorObjectiveType.QUALIFY_FOR_WORLDS],
                'Global': [SponsorObjectiveType.WIN_CHAMPIONSHIP, SponsorObjectiveType.QUALIFY_FOR_WORLDS],
            };

            objectiveType = getRandom(prestigeObjectives[offerPrestige]);
            
            // For simplicity, all season objectives will be evaluated against the Summer split / end of year results.
            const relevantSplit = 'Mùa Hè';

            switch(objectiveType) {
                case SponsorObjectiveType.WIN_X_MATCHES:
                    // Assuming 8 teams league, so 14 matches per split
                    const targetWinsMap: Record<SponsorPrestige, number> = { 'Local': 5, 'Regional': 7, 'National': 9, 'Global': 10 };
                    targetValue = targetWinsMap[offerPrestige];
                    objectiveDescription = `Thắng ít nhất ${targetValue} trận tại Vòng Bảng ${relevantSplit}`;
                    break;
                case SponsorObjectiveType.WIN_CHAMPIONSHIP:
                    objectiveDescription = `Vô địch giải ${relevantSplit}`;
                    break;
                case SponsorObjectiveType.REACH_FINALS:
                    objectiveDescription = `Lọt vào chung kết ${relevantSplit}`;
                    break;
                case SponsorObjectiveType.SIGN_STAR_PLAYER:
                    objectiveDescription = 'Sở hữu một tuyển thủ "Ngôi Sao" vào cuối mùa giải';
                    break;
                case SponsorObjectiveType.QUALIFY_FOR_WORLDS:
                    objectiveDescription = 'Giành quyền tham dự Chung Kết Thế Giới';
                    break;
                case SponsorObjectiveType.PLAYER_HAS_HIGH_MVPS:
                    targetValue = 5;
                    objectiveDescription = `Có một tuyển thủ đạt được ít nhất ${targetValue} danh hiệu MVP trong sự nghiệp`;
                    break;
                default:
                    objectiveDescription = 'Duy trì danh tiếng tốt';
                    break;
            }

            offers.push({
                id: `${SPONSOR_ID_PREFIX}${idCounter++}`,
                name: sponsorInfo.name,
                logoUrl: `https://api.dicebear.com/8.x/shapes/svg?seed=${sponsorInfo.name.replace(/\s/g, '')}`,
                slot,
                basePayment,
                prestige: offerPrestige,
                objective: {
                    type: objectiveType,
                    description: objectiveDescription,
                    isMet: false,
                    targetValue,
                },
                bonus: Math.round(basePayment * (getRandomNumber(20, 40) / 100) / 500) * 500,
                penalty: Math.round(basePayment * (getRandomNumber(10, 20) / 100) / 500) * 500,
                duration: getRandomNumber(1, 2),
                startYear: year,
            });
        }
        return offers;
    }, []);

    const handleFindSponsor = useCallback((slot: SponsorSlot) => {
        if (!playerTeam) return;
        const offers = generateSponsorOffers(playerTeam.reputation, slot, year, split);
        setSponsorshipOffers({ slot, offers });
    }, [playerTeam, generateSponsorOffers, year, split]);
    
    const handleAcceptSponsor = useCallback((newSponsor: Sponsor) => {
        if (!playerTeam) return;

        const WEEKLY_INCOME_DIVISOR = 24;

        const updatedTeam = { ...playerTeam };

        // Remove existing sponsor in the same slot and adjust income
        const oldSponsorInSlot = updatedTeam.sponsors.find(s => s.slot === newSponsor.slot);
        let updatedWeeklyIncome = updatedTeam.finances.weeklyIncome;
        if (oldSponsorInSlot) {
            updatedWeeklyIncome -= Math.round(oldSponsorInSlot.basePayment / WEEKLY_INCOME_DIVISOR);
        }
        
        const otherSponsors = updatedTeam.sponsors.filter(s => s.slot !== newSponsor.slot);
        
        // Add new sponsor and adjust income
        updatedWeeklyIncome += Math.round(newSponsor.basePayment / WEEKLY_INCOME_DIVISOR);
        
        updatedTeam.sponsors = [...otherSponsors, newSponsor];
        updatedTeam.finances = {
            ...updatedTeam.finances,
            weeklyIncome: updatedWeeklyIncome,
        };

        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeam.id ? updatedTeam : t)
        })));
        
        addNews(
            `Hợp đồng tài trợ mới!`,
            `[T:${playerTeam.name}] đã ký hợp đồng tài trợ ${newSponsor.slot} với ${newSponsor.name}.`,
            "Phóng Viên Kinh Tế"
        );
        
        addToast("Đã ký hợp đồng tài trợ thành công!", "success");
        setSponsorshipOffers(null);

    }, [playerTeam, leagues, addNews, addToast]);

    const handleScoutPlayer = (playerId: string, cost: number) => {
        if (!playerTeam || playerTeam.finances.budget < cost) {
            addToast("Không đủ ngân sách để do thám!", "error");
            return;
        }
        if (scoutedPlayerIds.has(playerId)) return;
        const updatedTeam = {
            ...playerTeam,
            finances: {
                ...playerTeam.finances,
                budget: playerTeam.finances.budget - cost,
            },
        };
        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeamId ? updatedTeam : t),
        })));
        setScoutedPlayerIds(prev => new Set(prev).add(playerId));
        addToast("Do thám thành công!", "success");
    };

    const handleFinalizeNegotiation = useCallback((player: Player, offer: { salary: number, signingBonus: number, duration: number, role: PromisedRole }) => {
        if (!playerTeam) return;
    
        // 1. Cost calculation & affordability check
        const buyoutFee = player.contract ? calculateBuyoutFee(player) : 0;
        const totalUpfrontCost = buyoutFee + offer.signingBonus;
    
        if (playerTeam.finances.budget < totalUpfrontCost) {
            setNegotiationFeedback(`Ngân sách không đủ. Cần ${formatCurrency(totalUpfrontCost)}.`);
            return;
        }
    
        // 2. AI acceptance logic
        const overall = (player.mechanics + player.macro) / 2;
        let desiredSalary = 20000 + (overall - 70) * 2500;
        
        const potentialMultipliers: Record<PotentialRank, number> = { S: 1.5, A: 1.3, B: 1.1, C: 1.0, D: 0.9 };
        desiredSalary *= potentialMultipliers[player.potential];
    
        if (player.age < 22) desiredSalary *= 1.2;
        else if (player.age > 28) desiredSalary *= 0.8;
    
        const roleValueMultipliers = { [PromisedRole.Star]: 1.3, [PromisedRole.Starter]: 1.0, [PromisedRole.Substitute]: 0.7 };
        const offeredRoleValue = roleValueMultipliers[offer.role];
        
        let desiredRoleValue = roleValueMultipliers[PromisedRole.Starter];
        if (player.potential === 'S' || overall > 88) {
            desiredRoleValue = roleValueMultipliers[PromisedRole.Star];
        } else if (player.potential === 'D' || overall < 65) {
            desiredRoleValue = roleValueMultipliers[PromisedRole.Substitute];
        }
    
        const offerValue = (offer.salary * offeredRoleValue) + (offer.signingBonus / offer.duration);
        const desiredValue = desiredSalary * desiredRoleValue;
        
        const acceptanceChance = Math.min(0.95, offerValue / desiredValue);
    
        if (Math.random() > acceptanceChance) {
            if (offeredRoleValue < desiredRoleValue && offer.role !== PromisedRole.Star) {
                setNegotiationFeedback("Tôi muốn một vai trò quan trọng hơn trong đội.");
            } else if (offer.salary < desiredSalary * 0.9) {
                setNegotiationFeedback("Mức lương này chưa tương xứng với giá trị của tôi.");
            } else {
                setNegotiationFeedback("Tôi cần một lời đề nghị hấp dẫn hơn một chút.");
            }
            return;
        }
    
        // 3. SUCCESSFUL NEGOTIATION
        const allTeams = leagues.flatMap(l => l.teams);
        const fromTeamName = player.contract ? allTeams.find(t => t.id === player.contract!.teamId)?.name || 'Một đội tuyển' : 'Tự do';
        
        const newPlayerForRoster: Player = {
            ...player,
            contract: {
                teamId: playerTeam.id,
                salary: offer.salary,
                signingBonus: offer.signingBonus,
                duration: offer.duration,
                promisedRole: offer.role,
                endDate: `${year + offer.duration}-12-31`,
            },
            transferHistory: [
                ...(player.transferHistory || []),
                { year, fromTeamName, toTeamName: playerTeam.name, fee: buyoutFee }
            ]
        };
    
        let leaguesCopy = JSON.parse(JSON.stringify(leagues));
        let freeAgentsCopy = [...freeAgents];
    
        // Remove player from source
        if (player.contract) { // From another team
            let sourceTeamUpdated = false;
            for (const league of leaguesCopy) {
                const teamIndex = league.teams.findIndex((t: Team) => t.id === player.contract!.teamId);
                if (teamIndex !== -1) {
                    const sourceTeam = league.teams[teamIndex];
                    sourceTeam.finances.budget += buyoutFee;
                    sourceTeam.roster = sourceTeam.roster.filter((p: Player) => p.id !== player.id);
                    sourceTeam.finances.salaryExpenses = Math.round(sourceTeam.roster.reduce((sum: number, p: Player) => sum + (p.contract?.salary || 0), 0) / 52);
                    sourceTeamUpdated = true;
                    break;
                }
            }
            if (!sourceTeamUpdated) { console.error("Could not find source team to update"); }
        } else { // From free agency
            freeAgentsCopy = freeAgentsCopy.filter(p => p.id !== player.id);
        }
    
        // Add player to player's team
        let playerTeamUpdated = false;
        for (const league of leaguesCopy) {
            const teamIndex = league.teams.findIndex((t: Team) => t.id === playerTeamId);
            if (teamIndex !== -1) {
                const teamToUpdate = league.teams[teamIndex];
                teamToUpdate.finances.budget -= totalUpfrontCost;
                teamToUpdate.roster.push(newPlayerForRoster);
                teamToUpdate.finances.salaryExpenses = Math.round(teamToUpdate.roster.reduce((sum: number, p: Player) => sum + (p.contract?.salary || 0), 0) / 52);
                playerTeamUpdated = true;
                break;
            }
        }
        if (!playerTeamUpdated) { console.error("Could not find player team to update"); return; }
        
        // Update state
        setLeagues(leaguesCopy);
        setFreeAgents(freeAgentsCopy);
    
        addNews(
            `[Chuyển Nhượng] BOM TẤN: [P:${player.ign}] gia nhập [T:${playerTeam.name}]!`,
            `[T:${playerTeam.name}] đã chính thức công bố bản hợp đồng mới với [P:${player.ign}], chuyển đến từ [T:${fromTeamName}] với một bản hợp đồng ${offer.duration} năm.`,
            "Chuyên Gia Chuyển Nhượng",
            NewsItemType.TRANSFER
        );
        addToast(`${player.ign} đã gia nhập đội của bạn!`, 'success');
    
        // Clean up
        setNegotiatingPlayer(null);
        setNegotiationFeedback('');
    }, [playerTeam, leagues, freeAgents, year, addNews, addToast]);


    const handlePressConferenceChoice = (effects: { morale: number; reputation: number }) => {
        if (!playerTeam) return;
        const updatedTeam = { ...playerTeam };
        updatedTeam.reputation = Math.max(0, Math.min(100, updatedTeam.reputation + effects.reputation));
        updatedTeam.roster = updatedTeam.roster.map(p => ({
            ...p,
            morale: Math.max(0, Math.min(100, p.morale + effects.morale))
        }));

        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeam.id ? updatedTeam : t)
        })));
        addToast(`Tinh thần đội ${effects.morale >= 0 ? '+' : ''}${effects.morale}, Danh tiếng ${effects.reputation >= 0 ? '+' : ''}${effects.reputation}`, 'info');
        setPressConferenceMatch(null);
    };

    const handleDramaResolve = (choice: 'fine' | 'bench' | 'ignore', player: Player) => {
        if (!playerTeam) return;
        let moraleChange = 0;
        let repChange = 0;
        let budgetChange = 0;
        let newsTitle = '';
        let newsContent = '';

        switch (choice) {
            case 'fine':
                moraleChange = -10;
                repChange = 5;
                budgetChange = 5000;
                newsTitle = `[T:${playerTeam.name}] phạt nội bộ [P:${player.ign}]`;
                newsContent = `Do vi phạm kỷ luật, [T:${playerTeam.name}] đã ra án phạt tiền đối với [P:${player.ign}].`;
                break;
            case 'bench':
                moraleChange = -20;
                repChange = 10;
                newsTitle = `[P:${player.ign}] bị cấm thi đấu`;
                newsContent = `[T:${playerTeam.name}] đã quyết định treo giò nội bộ [P:${player.ign}] sau sự cố truyền thông gần đây.`;
                break;
            case 'ignore':
                moraleChange = 5;
                repChange = -10;
                newsTitle = `[T:${playerTeam.name}] giữ im lặng`;
                newsContent = `Trước lùm xùm của [P:${player.ign}], ban quản lý [T:${playerTeam.name}] đã chọn cách không đưa ra bình luận nào.`;
                break;
        }

        const updatedTeam = { ...playerTeam };
        updatedTeam.reputation = Math.max(0, Math.min(100, updatedTeam.reputation + repChange));
        updatedTeam.finances.budget += budgetChange;
        updatedTeam.roster = updatedTeam.roster.map(p => 
            p.id === player.id ? { ...p, morale: Math.max(0, Math.min(100, p.morale + moraleChange)) } : p
        );

        setLeagues(leagues.map(l => ({
            ...l,
            teams: l.teams.map(t => t.id === playerTeam.id ? updatedTeam : t)
        })));
        addNews(newsTitle, newsContent, 'Phóng Viên Thể Thao', NewsItemType.DRAMA);
        addToast('Sự việc đã được xử lý.', 'info');
        setDramaEvent(null);
    };

    const handleReleasePlayer = useCallback((playerId: string) => {
        if (!isTransferWindowOpen) {
            addToast("Chức năng thanh lý chỉ mở trong kỳ chuyển nhượng.", "error");
            return;
        }

        const allTeams = leagues.flatMap(l => l.teams);
        const currentPlayerTeam = allTeams.find(t => t.id === playerTeamId);

        if (!currentPlayerTeam) {
            addToast("Lỗi: Không tìm thấy đội của bạn.", "error");
            return;
        }
        if (currentPlayerTeam.roster.length <= 5) {
            addToast("Không thể thanh lý, đội hình phải có ít nhất 5 người.", "error");
            return;
        }
        const playerToRelease = currentPlayerTeam.roster.find(p => p.id === playerId);
        if (!playerToRelease || !playerToRelease.contract) {
            addToast("Không tìm thấy tuyển thủ hoặc tuyển thủ không có hợp đồng.", "error");
            return;
        }
        const terminationFee = Math.round(playerToRelease.contract.salary * 0.75);
        if (currentPlayerTeam.finances.budget < terminationFee) {
            addToast(`Không đủ ngân sách! Cần ${formatCurrency(terminationFee)} để trả phí thanh lý.`, "error");
            return;
        }

        // All checks passed, now show modal.
        setConfirmationModal({
            isOpen: true,
            title: 'Xác nhận Thanh lý Hợp đồng',
            message: (
                <>
                    Bạn có chắc chắn muốn thanh lý hợp đồng của <strong className="text-white">{playerToRelease.ign}</strong>?
                    <br/><br/>
                    Bạn sẽ phải trả một khoản phí phạt là <strong className="text-red-400">{formatCurrency(terminationFee)}</strong>.
                </>
            ),
            onConfirm: () => {
                // Find player's team again to ensure we have the latest state
                const currentLeagues = leagues;
                const playerTeamForRelease = currentLeagues.flatMap(l => l.teams).find(t => t.id === playerTeamId);
                if (!playerTeamForRelease) return;

                const player = playerTeamForRelease.roster.find(p => p.id === playerId);
                if (!player) return;

                const terminationFee = Math.round(player.contract!.salary * 0.75);

                const releasedPlayer = { ...player, contract: null };

                const updatedTeam = {
                    ...playerTeamForRelease,
                    roster: playerTeamForRelease.roster.filter(p => p.id !== playerId),
                    finances: {
                        ...playerTeamForRelease.finances,
                        budget: playerTeamForRelease.finances.budget - terminationFee,
                    },
                };
                updatedTeam.finances.salaryExpenses = Math.round(updatedTeam.roster.reduce((sum, p) => sum + (p.contract?.salary || 0), 0) / 52);

                const newLeagues = currentLeagues.map(l => ({
                    ...l,
                    teams: l.teams.map(t => t.id === playerTeamId ? updatedTeam : t),
                }));

                setLeagues(newLeagues);
                setFreeAgents(prev => [...prev, releasedPlayer]);

                addNews(
                    `[Chuyển Nhượng] [T:${playerTeamForRelease.name}] thanh lý hợp đồng với [P:${player.ign}]`,
                    `[T:${playerTeamForRelease.name}] đã chính thức nói lời chia tay với [P:${player.ign}]. Anh ấy hiện là tuyển thủ tự do.`,
                    "Chuyên Gia Chuyển Nhượng",
                    NewsItemType.TRANSFER
                );
                addToast(`Đã thanh lý hợp đồng với ${player.ign}.`, 'success');

                setConfirmationModal(null); // Close modal
            },
            onCancel: () => setConfirmationModal(null) // Close modal on cancel
        });
    }, [leagues, playerTeamId, isTransferWindowOpen, addToast, addNews]);

    const getButtonTextAndAction = (): { text: string; action: () => void; disabled: boolean; } => {
        switch (gameState) {
            case GameState.RegularSeason:
                return { text: `Tuần ${currentWeek} >`, action: handleSimulateWeek, disabled: false };
            case GameState.Playoffs:
                return { text: 'Thi đấu Playoff', action: handleAdvancePlayoffs, disabled: false };
            case GameState.MidSeasonBreak:
                if (msiData && !msiData.champion) {
                    return { text: 'Thi đấu MSI', action: handleAdvanceMSI, disabled: false };
                }
                return { text: 'Bắt đầu Mùa Hè', action: handleStartSummerSplit, disabled: false };
            case GameState.MSI:
                 return { text: 'Thi đấu MSI', action: handleAdvanceMSI, disabled: false };
            case GameState.OffSeason:
                return { text: 'Bắt đầu kỳ CN AI', action: handleSimulateAiTransfers, disabled: false };
            case GameState.AITransferWindow:
                 return { text: 'Kết thúc kỳ CN', action: () => setGameState(GameState.OffSeason) , disabled: true };
            case GameState.SeasonEnd:
                if (split === Split.Summer && !worldsParticipants.length) {
                     return { text: 'Bắt đầu CKTG', action: handleStartWorlds, disabled: false };
                }
                return { text: 'Bắt đầu Mùa Mới', action: handleNewSeason, disabled: false };
            case GameState.WorldsSwissStage:
                 return { text: 'Mô phỏng Vòng Swiss', action: handleSimulateSwissRound, disabled: false };
            case GameState.WorldsPlayoffs:
                 return { text: 'Mô phỏng Playoff CKTG', action: handleSimulateWorldsPlayoffs, disabled: false };
            case GameState.PromotionRelegation:
                return { text: 'Thi đấu Phân hạng', action: handleAdvancePromotion, disabled: false };
            default:
                return { text: 'Tiếp tục', action: () => {}, disabled: true };
        }
    };
    const buttonInfo = getButtonTextAndAction();


    if (appState === 'main_menu') {
        return <MainMenu onNewGame={() => setAppState('new_game_setup')} onLoadGameFromFile={handleLoadGameFromFile} />;
    }

    if (appState === 'new_game_setup') {
        return <NewGameSetup onStartGame={handleNewGameStart} onBack={() => setAppState('main_menu')} />;
    }
    
    if (!playerTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Đang tải dữ liệu đội...</p>
            </div>
        );
    }
    
    const championTeamIds = yearlyChampions.filter(yc => yc.year === year && yc.split === split).map(yc => yc.champion.id);

    const managementPanelProps = {
        team: {
            name: playerTeam.name,
            tier: playerTeam.tier,
            wins: playerTeam.wins,
            losses: playerTeam.losses,
            fanCount: playerTeam.fanCount,
            fanEngagement: playerTeam.fanEngagement,
            reputation: playerTeam.reputation,
            rank: playerTeam.rank,
        },
        onNavigate: (v: 'dashboard' | 'management' | 'history') => setView(v),
        onShowTransfers: () => setDashboardTab('transfers'),
        isTransferWindowOpen: isTransferWindowOpen,
        onSaveGame: handleSaveGame,
    };
    
    const renderMainView = () => {
        switch (view) {
            case 'management':
                return <TeamManagementView 
                    team={playerTeam} 
                    onBack={() => setView('dashboard')} 
                    onUpgradeStaff={handleUpgradeStaff}
                    onUpgradeFacility={handleUpgradeFacility}
                    getStaffUpgradeCost={getStaffUpgradeCost}
                    getFacilityUpgradeCost={getFacilityUpgradeCost}
                    onReleasePlayer={handleReleasePlayer}
                    onFindSponsor={handleFindSponsor}
                    isTransferWindowOpen={isTransferWindowOpen}
                />;
            case 'match_day':
                if (matchDayInfo) {
                    return <MatchDayContainer 
                        match={matchDayInfo.match}
                        playerTeam={matchDayInfo.playerTeam}
                        opponentTeam={matchDayInfo.opponentTeam}
                        onMatchComplete={handleMatchComplete}
                        simulateMatchFn={simulateMatchFn}
                        gameState={gameState}
                        split={split}
                        heroPool={heroPool}
                    />;
                }
                return null;
            case 'history':
                return <HistoryView history={gameHistory} hallOfFame={hallOfFame} onBack={() => setView('dashboard')} />;
            case 'dashboard':
            default:
                if (gameState === GameState.WorldsSwissStage) {
                    return <SwissStagePanel teams={worldsParticipants} matches={worldsMatches} round={swissRound} championTeamIds={championTeamIds} />;
                }
                 if (gameState === GameState.WorldsPlayoffs) {
                    return <InternationalTournamentPanel title="CKTG - Vòng Loại Trực Tiếp" matches={worldsMatches} champion={worldChampion ? leagues.flatMap(l=>l.teams).find(t => t.id === worldChampion.teamId) : null} championTeamIds={championTeamIds} />;
                }
                if (gameState === GameState.Playoffs) {
                    return <PlayoffBracket title={`${playerTeam.region} ${split} Playoffs`} matches={playoffMatches} champion={regionalChampion} />;
                }
                 if (gameState === GameState.PromotionRelegation) {
                    return <PromotionTournamentPanel matches={promotionMatches} />;
                }
                return (
                    <DashboardTabs
                        managementPanelProps={managementPanelProps}
                        playerTeam={playerTeam}
                        leagues={leagues}
                        news={news}
                        currentWeek={currentWeek}
                        gameState={gameState}
                        playerTeamId={playerTeamId}
                        displayedLeagueRegion={displayedLeagueRegion}
                        setDisplayedLeagueRegion={setDisplayedLeagueRegion}
                        onSelectPlayer={setSelectedPlayer}
                        onSelectTeam={(teamId) => setSelectedTeam(leagues.flatMap(l => l.teams).find(t => t.id === teamId) || null)}
                        onShowPlayoffs={(region) => {
                            const result = aiPlayoffResults[region] || (region === playerTeam.region ? { matches: playoffMatches, champion: regionalChampion } : null);
                            if (result) {
                                setViewedPlayoffBracket({ title: `${region} ${split} Playoffs`, ...result });
                            }
                        }}
                        msiData={msiData}
                        onReleasePlayer={handleReleasePlayer}
                        isTransferWindowOpen={isTransferWindowOpen}
                        championTeamIds={championTeamIds}
                        activeTab={dashboardTab}
                        setActiveTab={setDashboardTab}
                        freeAgents={freeAgents}
                        scoutedPlayerIds={scoutedPlayerIds}
                        onScoutPlayer={handleScoutPlayer}
                        onStartNegotiation={setNegotiatingPlayer}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans pt-24 pb-8 px-4">
             <HeaderPanel 
                onSimulate={buttonInfo.action}
                isLoading={isLoading}
                teamName={playerTeam.name}
                stage={gameState}
                split={split}
                year={year}
                buttonText={buttonInfo.text}
                isButtonDisabled={buttonInfo.disabled}
             />
             <main className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {renderMainView()}
                </div>
                <div className="hidden lg:block lg:col-span-1">
                     {view === 'dashboard' && <ManagementPanel {...managementPanelProps} />}
                </div>
             </main>
             
             {/* Modals */}
             <ToastContainer toasts={toasts} removeToast={removeToast} />
             {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} heroPool={heroPool} />}
             {selectedTeam && <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
             {negotiatingPlayer && <NegotiationModal player={negotiatingPlayer} teamBudget={playerTeam.finances.budget} onFinalize={handleFinalizeNegotiation} onClose={() => setNegotiatingPlayer(null)} feedback={negotiationFeedback} />}
             {pressConferenceMatch && <PressConferenceModal match={pressConferenceMatch.match} result={pressConferenceMatch.result} playerTeam={playerTeam} opponentTeam={pressConferenceMatch.opponentTeam} onChoice={handlePressConferenceChoice} onClose={() => setPressConferenceMatch(null)} />}
             {dramaEvent && <DramaEventModal event={dramaEvent} onResolve={handleDramaResolve} onClose={() => setDramaEvent(null)} />}
             {sponsorshipOffers && <SponsorshipModal slot={sponsorshipOffers.slot} offers={sponsorshipOffers.offers} onAccept={handleAcceptSponsor} onClose={() => setSponsorshipOffers(null)} />}
             {viewedPlayoffBracket && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewedPlayoffBracket(null)}><PlayoffBracket title={viewedPlayoffBracket.title} matches={viewedPlayoffBracket.matches} champion={viewedPlayoffBracket.champion} /></div>}
             {activeRandomEvent && <RandomEventModal eventData={activeRandomEvent} team={playerTeam} onResolve={handleResolveRandomEvent} />}
             {confirmationModal && <ConfirmationModal isOpen={confirmationModal.isOpen} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} onCancel={() => setConfirmationModal(null)} />}

        </div>
    );
};
