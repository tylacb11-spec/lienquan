import React, { useState, useEffect, useMemo } from 'react';
import { Team, Player, Match, League, Tier, RegionName, PlayerRole, PotentialRank, PersonalityTrait, PromisedRole, StaffMember, StaffRole, Facility, FacilityType } from '../types';
import { REAL_PLAYERS } from '../data/PlayerData';

// --- DATA GENERATION (scoped to this component) ---

const POP_CULTURE_NAMES = [
    // Anime & Manga
    'Luffy', 'Zoro', 'Sanji', 'Goku', 'Vegeta', 'Naruto', 'Sasuke', 'Ichigo', 'Levi', 'Eren',
    'Mikasa', 'Saitama', 'Genos', 'Deku', 'Bakugo', 'Todoroki', 'Light', 'Ryuk', 'Gojo', 'Tanjiro',
    'Gintoki', 'Spike', 'Alucard', 'Asuka', 'Conan', 'Lelouch', 'Edward', 'Alphonse', 'Roy', 'Riza',
    'Saber', 'Archer', 'Rin', 'Kirito', 'Asuna', 'Meliodas', 'Ban', 'Escanor', 'Gon', 'Killua',
    'Kurapika', 'Leorio', 'Hisoka', 'Jotaro', 'Dio', 'Joseph', 'Giorno', 'Josuke', 'Natsu', 'Lucy',
    'Gray', 'Erza', 'Satoru', 'Yuji', 'Kenshin', 'Kaoru', 'Sanosuke', 'Yahiko', 'Sesshomaru',
    'Inuyasha', 'Kagome', 'Miroku', 'Sango', 'Shikamaru', 'Kakashi', 'Gaara', 'Hinata', 'Itachi',

    // Comics (Marvel/DC)
    'Stark', 'Rogers', 'Parker', 'Banner', 'Thor', 'Logan', 'Wade', 'Wayne', 'Kent', 'Diana', 'Strange',
    'TChalla', 'Quill', 'Gamora', 'Drax', 'Groot', 'Rocket', 'Barton', 'Romanoff', 'Wilson', 'Maximoff',
    'Vision', 'Rhodes', 'Lang', 'Pym', 'Danvers', 'Fury', 'Coulson', 'Joker', 'Harley', 'Riddler',
    'Crane', 'Penguin', 'Luthor', 'Zod', 'Flash', 'Arrow', 'Thawne', 'Slade', 'Grayson', 'Todd', 'Drake',
    'Gordon', 'Alfred', 'Xavier', 'Magneto', 'Storm', 'Jean', 'Cyclops', 'Beast', 'Iceman', 'Angel', 'Colossus',
    'Wolverine', 'Deadpool', 'Cable', 'Domino', 'Thanos', 'Loki', 'Odin', 'Hela', 'Valkyrie', 'Heimdall',

    // Video Games
    'Kratos', 'Atreus', 'Aloy', 'Joel', 'Ellie', 'Nathan', 'Drake', 'Lara', 'Croft', 'Mario', 'Luigi',
    'Link', 'Zelda', 'Samus', 'Cloud', 'Sephiroth', 'Tifa', 'Aerith', 'Geralt', 'Ciri', 'Yennefer',
    'Triss', 'Ezio', 'Altair', 'Shepard', 'Garrus', 'Tali', 'MasterChief', 'Cortana', 'Doomguy', 'Gordon',
    'Freeman', 'Ryu', 'Ken', 'ChunLi', 'SolidSnake', 'BigBoss', 'Dante', 'Vergil', 'Nero', 'Leon',
    'Claire', 'Jill', 'Chris', 'Kain', 'Raziel', 'Sylvanas', 'Arthas', 'Illidan', 'Tracer', 'Genji',
    'Reinhardt', 'Winston', 'Mercy', 'Lucio', 'Widowmaker', 'Reaper', 'Soldier', 'Pharah', 'Dva',
    'Pacman', 'Sonic', 'Tails', 'Knuckles', 'Eggman', 'Scorpion', 'Subzero', 'Raiden', 'LuiKang',

    // Movies/TV/Books
    'Neo', 'Trinity', 'Morpheus', 'Skywalker', 'Vader', 'Solo', 'Leia', 'Kenobi', 'Yoda', 'Frodo',
    'Gandalf', 'Aragorn', 'Legolas', 'Gimli', 'Potter', 'Granger', 'Weasley', 'Snape', 'Dumbledore',
    'Sherlock', 'Watson', 'Bond', 'Bourne', 'Wick', 'Ripley', 'Connor', 'Durden', 'Gump', 'Rocky',
    'Rambo', 'McFly', 'Indy', 'Katniss', 'Snow', 'Lannister', 'Targaryen', 'JonSnow', 'Walter', 'Jesse',
    'Soprano', 'Sheldon', 'Pikachu', 'Charmander', 'Squirtle', 'Bulbasaur', 'Mewtwo', 'Lucario', 'Evee',
    'Snorlax', 'Gengar', 'Kirk', 'Spock', 'Picard', 'Data', 'Riker', 'Worf', 'Anakin', 'Obiwan', 'Maul',
    'Palpatine', 'Baggins', 'Gollum', 'Saruman', 'Sauron', 'Malone', 'Deckard', 'Batty', 'Forrest',

    // Mythology & History
    'Zeus', 'Hades', 'Poseidon', 'Apollo', 'Ares', 'Hermes', 'Odin', 'Freya', 'Anubis', 'Ra',
    'Horus', 'Osiris', 'Caesar', 'Cleopatra', 'Napoleon', 'Genghis', 'Khan', 'Edison', 'Tesla', 'Newton',
    'Einstein', 'Darwin', 'Socrates', 'Plato', 'Aristotle', 'Hannibal', 'Leonidas', 'Achilles', 'Hector',
    'Odysseus', 'Hercules', 'Perseus', 'Orion', 'Dracula', 'Gilgamesh', 'Enkidu', 'Ishtar', 'Merlin',
    'Arthur', 'Lancelot', 'Gawain', 'Morgana', 'Beowulf', 'Grendel', 'Cuchulainn', 'Fionn', 'SunTzu',

    // Concepts & Misc
    'Panda', 'Tiger', 'Wolf', 'Eagle', 'Falcon', 'Viper', 'Cobra', 'Phoenix', 'Ghost', 'Shadow',
    'Wraith', 'Reaper', 'Zero', 'Omega', 'Alpha', 'Echo', 'Maverick', 'Iceman', 'Goose', 'Vortex',
    'Blaze', 'Storm', 'Rogue', 'Havoc', 'Raptor', 'Titan', 'Juggernaut', 'Spectre', 'Nomad', 'Prophet',
    'Blizzard', 'Cyclone', 'Tempest', 'Hurricane', 'Tsunami', 'Quake', 'Comet', 'Meteor', 'Nova', 'Pulsar',
    'Nebula', 'Galaxy', 'Ronin', 'Samurai', 'Ninja', 'Shogun', 'Knight', 'Gladiator', 'Spartan'
];
let namePool: string[] = [];

// Location-based prefixes for more realistic Tier 2/3 team names
const AOG_CITIES = ['Hanoi', 'Da Nang', 'Can Tho', 'Hai Phong', 'Nha Trang', 'Hue', 'Vung Tau', 'Bien Hoa'];
const KPL_CITIES = ['Guangzhou', 'Shenzhen', 'Hangzhou', 'Nanjing', 'Wuhan', 'Xi\'an', 'Tianjin', 'Suzhou'];
const RPL_CITIES = ['Chiang Mai', 'Phuket', 'Pattaya', 'Nonthaburi', 'Ayutthaya', 'Khon Kaen', 'Udon Thani'];
const GCS_CITIES = ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Taoyuan', 'Hsinchu', 'Keelung'];
const NA_CITIES = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Miami', 'Toronto', 'Vancouver'];
const EU_CITIES = ['Paris', 'Berlin', 'Madrid', 'Rome', 'London', 'Amsterdam', 'Stockholm', 'Warsaw'];

// Suffixes for team names
const WESTERN_NOUNS = ['Phoenix', 'Ghosts', 'Vipers', 'Titans', 'Aces', 'Raptors', 'Strikers', 'Dragons', 'Serpents', 'Ronin', 'Blades', 'Falcons', 'Warriors', 'Guardians', 'Hunters', 'Esports', 'Gaming'];
const VIETNAMESE_SUFFIX = ['Phantom', 'Buffaloes', 'Titans', 'Eagles', 'Legends', 'Palace', 'United'];
const CHINESE_SUFFIX = ['Dragons', 'Pandas', 'Tigers', 'Lions', 'Eagles', 'Knights', 'Emperors', 'Guardians', 'Gaming'];
const THAI_SUFFIX = ['Elephants', 'Tigers', 'Vipers', 'Warriors', 'Kings', 'Strikers', 'Gladiators', 'Esports', 'United'];
const GCS_SUFFIX = ['Samurai', 'Oni', 'Kitsune', 'Dragons', 'Ronin', 'Ninjas', 'Shoguns', 'Emperors', 'Gaming'];


// Real-world inspired team names for Tier 1
const REAL_TEAM_NAMES: Record<RegionName, string[]> = {
    [RegionName.AOG]: ['Saigon Phantom', 'One Star Esports', 'Box Gaming', 'Team Flash', 'The Daredevil Team', 'Super Nova', 'Black Sarus Sports', 'FPL'],
    [RegionName.KPL]: ['Chongqing Wolves', 'eStar Pro', 'AG Super Play', 'TTG', 'Weibo Gaming', 'DRG.GK', 'EDward Gaming', 'Xianyou Gaming'],
    [RegionName.RPL]: ['Talon', 'Bacon Time', 'Buriram United Esports', 'Valencia CF Esports', 'eArena', 'Full Sense', 'PSG Esports', 'Hydra'],
    [RegionName.GCS]: ['Hong Kong Attitude', 'BanMei Gaming', 'Flash Wolves', 'ONE Team Esports', 'Deep Cross Gaming', 'BRO Esports', 'ANK Esports', 'HEAVY'],
    [RegionName.NA]: ['Cloud9', 'Team Liquid', 'TSM', '100 Thieves', 'Evil Geniuses', 'FlyQuest', 'Dignitas', 'Immortals'],
    [RegionName.EU]: ['G2 Esports', 'Fnatic', 'MAD Lions', 'Team Vitality', 'Excel Esports', 'SK Gaming', 'Team Heretics', 'KOI'],
};


let idCounter = Math.floor(Math.random() * 10000); // Randomize initial counter to reduce ID collision on re-renders
const PLAYER_ID_PREFIX = 'p-';
const TEAM_ID_PREFIX = 't-';
const MATCH_ID_PREFIX = 'm-';

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getFlagForRegion = (region: RegionName): string => {
    switch (region) {
        case RegionName.AOG: return '🇻🇳';
        case RegionName.KPL: return '🇨🇳';
        case RegionName.RPL: return '🇹🇭';
        case RegionName.GCS: return '🇹🇼';
        case RegionName.NA: return '🇺🇸';
        case RegionName.EU: return '🇪🇺';
        default: return '';
    }
};

const getUniqueName = (): string => {
    if (namePool.length > 0) {
        return namePool.pop()!;
    }
    // Fallback to old system if we run out of names
    const GAMER_ADJECTIVES = ['Shadow', 'Crimson', 'Azure', 'Golden', 'Silent', 'Cosmic', 'Quantum', 'Velocity', 'Omega', 'Astral', 'Inferno', 'Glacial', 'Storm', 'Phantom'];
    const GAMER_NOUNS = ['Blade', 'Dragon', 'Ghost', 'Viper', 'Titan', 'Ace', 'Raptor', 'Striker', 'Serpent', 'Ronin', 'Falcon', 'Warrior', 'Guardian', 'Hunter', 'Reaper', 'Spectre'];
    return `${getRandom(GAMER_ADJECTIVES)}${getRandom(GAMER_NOUNS)}${idCounter++}`; // add counter for more uniqueness
};

const getNationalityForRegion = (region?: RegionName): string => {
    if (!region) { // For free agents, pick a random region's nationality
        const allRegions = Object.values(RegionName);
        region = getRandom(allRegions);
    }
    switch (region) {
        case RegionName.AOG: return 'VN';
        case RegionName.KPL: return 'CN';
        case RegionName.RPL: return 'TH';
        case RegionName.GCS: return 'TW';
        case RegionName.NA: return 'US';
        case RegionName.EU: return 'DE'; // Using Germany as a proxy for EU
        default: return 'VN';
    }
};

type PlayerArchetype = 'Prodigy' | 'Mastermind' | 'Star' | 'RolePlayer' | 'Talent';

const createPlayer = (role: PlayerRole, tier: Tier, region?: RegionName, ignSeed?: string, baseMechanics?: number, baseMacro?: number): Player => {
  const ign = ignSeed || getUniqueName();
  let mechanics = 0;
  let macro = 0;

  if (baseMechanics && baseMacro) {
      mechanics = baseMechanics + getRandomNumber(-2, 2);
      macro = baseMacro + getRandomNumber(-2, 2);
  } else {
// Fix: Removed `Tier.Tier3` from the `tierArchetypes` object as it does not exist in the `Tier` enum.
      const tierArchetypes: Record<Tier, PlayerArchetype[]> = {
          [Tier.Tier1]: ['Prodigy', 'Prodigy', 'Mastermind', 'Mastermind', 'Star', 'Star', 'Star', 'RolePlayer'],
          [Tier.Tier2]: ['Prodigy', 'Mastermind', 'Star', 'RolePlayer', 'RolePlayer', 'RolePlayer', 'Talent', 'Talent'],
      };
      
      const archetype = getRandom(tierArchetypes[tier]);

      switch (archetype) {
          case 'Prodigy':
              mechanics = getRandomNumber(tier === Tier.Tier1 ? 88 : 80, tier === Tier.Tier1 ? 98 : 92);
              macro = getRandomNumber(tier === Tier.Tier1 ? 70 : 65, tier === Tier.Tier1 ? 82 : 78);
              break;
          case 'Mastermind':
              mechanics = getRandomNumber(tier === Tier.Tier1 ? 70 : 65, tier === Tier.Tier1 ? 82 : 78);
              macro = getRandomNumber(tier === Tier.Tier1 ? 88 : 80, tier === Tier.Tier1 ? 98 : 92);
              break;
          case 'Star':
              mechanics = getRandomNumber(tier === Tier.Tier1 ? 82 : 75, tier === Tier.Tier1 ? 92 : 85);
              macro = getRandomNumber(tier === Tier.Tier1 ? 82 : 75, tier === Tier.Tier1 ? 92 : 85);
              break;
          case 'RolePlayer':
// Fix: Removed conditional logic based on the non-existent `Tier.Tier3`. The logic is simplified as `tier` will never be `Tier.Tier3`.
              mechanics = getRandomNumber(65, 78);
// Fix: Removed conditional logic based on the non-existent `Tier.Tier3`. The logic is simplified as `tier` will never be `Tier.Tier3`.
              macro = getRandomNumber(65, 78);
              break;
          case 'Talent':
              mechanics = getRandomNumber(50, 65);
              macro = getRandomNumber(50, 65);
              break;
      }
  }
  
// Fix: Removed `Tier.Tier3` from the `potentialPool` object as it does not exist in the `Tier` enum.
  const potentialPool: Record<Tier, PotentialRank[]> = {
      [Tier.Tier1]: ['S', 'A', 'A', 'B', 'B', 'B', 'C', 'C'],
      [Tier.Tier2]: ['A', 'B', 'B', 'B', 'C', 'C', 'C', 'D'],
  };

  return {
    id: `${PLAYER_ID_PREFIX}${idCounter++}`,
    ign: ign,
    fullName: 'Nguyen Van A',
    age: getRandomNumber(18, 28),
    role: role,
    nationality: getNationalityForRegion(region),
    mechanics: Math.max(40, Math.min(100, mechanics)),
    macro: Math.max(40, Math.min(100, macro)),
    potential: getRandom(potentialPool[tier]),
    morale: 80,
    form: 80,
    stamina: 100,
    contract: null,
    avatarUrl: `https://api.dicebear.com/8.x/lorelei/svg?seed=${ign.replace(/\s/g, '')}&hairColor=ff69b4,00ffff,39ff14,ff4500,9400d3,ffd700,ffa500,ef476f,06d6a0,f72585`,
    traits: [getRandom(Object.values(PersonalityTrait))],
    achievements: [],
    mvpAwards: 0,
    transferHistory: [],
  };
};

const createTeam = (name: string, tier: Tier, region: RegionName): Team => {
  const teamId = `${TEAM_ID_PREFIX}${idCounter++}`;
  
  const realRosterData = REAL_PLAYERS[region]?.[name];
  let roster: Player[];

  if (tier === Tier.Tier1 && realRosterData) {
      roster = realRosterData.map(realPlayer => {
          const player = createPlayer(
              realPlayer.role, 
              tier, 
              region, 
              realPlayer.ign, 
              realPlayer.mechanics, 
              realPlayer.macro
          );
          player.ign = realPlayer.ign;
          player.contract = {
              teamId: teamId,
              salary: getRandomNumber(40000, 120000),
              signingBonus: 0,
              duration: 2,
              promisedRole: PromisedRole.Starter,
              endDate: '2025-12-31',
          };
          return player;
      });
  } else {
       roster = Object.values(PlayerRole).map(role => {
          const player = createPlayer(role, tier, region);
          player.contract = {
            teamId: teamId,
            salary: getRandomNumber(20000, 80000),
            signingBonus: 0,
            duration: 2,
            promisedRole: PromisedRole.Starter,
            endDate: '2025-12-31',
          };
          return player;
      });
  }


  return {
    id: teamId,
    name: name,
    logoUrl: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${name.replace(/\s/g, '')}`,
    tier: tier,
    region: region,
    roster: roster,
    wins: 0,
    losses: 0,
    roundsWon: 0,
    roundsLost: 0,
    reputation: tier === Tier.Tier1 ? 70 : (tier === Tier.Tier2 ? 50 : 30),
    fanCount: tier === Tier.Tier1 ? getRandomNumber(40000, 100000) : getRandomNumber(5000, 30000),
    staff: Object.values(StaffRole).map(role => ({ 
        id: `${idCounter++}`, 
        role: role, 
        name: 'Staff Name', 
        level: role === StaffRole.HeadCoach ? 4 : 3, 
        description: `Tăng ${role === StaffRole.HeadCoach ? 'Macro' : 'chỉ số khác'} cho đội.` 
    })),
    facilities: Object.values(FacilityType).map(type => ({ type: type, level: 3, description: `Cải thiện ${type === FacilityType.GamingHouse ? 'hồi phục' : 'hiệu quả'}.` })),
    finances: {
      budget: 250000,
      weeklyIncome: 10000,
      salaryExpenses: Math.round(roster.reduce((sum, p) => sum + (p.contract?.salary || 0), 0) / 52),
      maintenanceCosts: 3000,
    },
    trophyRoom: [],
    sponsors: [],
  };
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

const generateRandomTeamName = (usedNames: Set<string>, region: RegionName): string => {
    let name: string;
    let prefixList: string[], suffixList: string[];

    switch (region) {
        case RegionName.AOG: prefixList = AOG_CITIES; suffixList = VIETNAMESE_SUFFIX; break;
        case RegionName.KPL: prefixList = KPL_CITIES; suffixList = CHINESE_SUFFIX; break;
        case RegionName.RPL: prefixList = RPL_CITIES; suffixList = THAI_SUFFIX; break;
        case RegionName.GCS: prefixList = GCS_CITIES; suffixList = GCS_SUFFIX; break;
        case RegionName.NA: prefixList = NA_CITIES; suffixList = WESTERN_NOUNS; break;
        case RegionName.EU: prefixList = EU_CITIES; suffixList = WESTERN_NOUNS; break;
        default: prefixList = NA_CITIES; suffixList = WESTERN_NOUNS; break;
    }

    do {
        name = `${getRandom(prefixList)} ${getRandom(suffixList)}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
};


interface NewGameSetupProps {
    onStartGame: (teamId: string, customName: string, leagues: League[], freeAgents: Player[]) => void;
    onBack: () => void;
}

export const NewGameSetup: React.FC<NewGameSetupProps> = ({ onStartGame, onBack }) => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [freeAgents, setFreeAgents] = useState<Player[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [customTeamName, setCustomTeamName] = useState<string>('');
    const [activeRegion, setActiveRegion] = useState<RegionName>(RegionName.AOG);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const generateWorld = () => {
            // Initialize the name pool for generated players
            const usedPlayerNames = new Set<string>();
            Object.values(REAL_PLAYERS).forEach(region => 
                Object.values(region).forEach(team => 
                    team.forEach(player => usedPlayerNames.add(player.ign))
                )
            );
            namePool = [...POP_CULTURE_NAMES]
                .filter(name => !usedPlayerNames.has(name))
                .sort(() => 0.5 - Math.random());


            const usedTeamNames = new Set<string>();
            const tier1NamesByRegion = JSON.parse(JSON.stringify(REAL_TEAM_NAMES)); // Deep copy to mutate
            Object.values(tier1NamesByRegion).forEach((names: any) => {
                names.sort(() => 0.5 - Math.random());
                names.forEach((name: string) => usedTeamNames.add(name));
            });
            
            const allLeagues: League[] = [];
            for (const region of Object.values(RegionName)) {
                for (const tier of Object.values(Tier)) {
                    const teams = Array.from({ length: 8 }, () => {
                        let teamName: string;
                        if (tier === Tier.Tier1 && tier1NamesByRegion[region].length > 0) {
                            teamName = tier1NamesByRegion[region].pop();
                        } else {
                            teamName = generateRandomTeamName(usedTeamNames, region);
                        }
                        return createTeam(teamName, tier, region);
                    });
                    allLeagues.push({
                        tier,
                        region,
                        teams,
                        schedule: createSchedule(teams),
                    });
                }
            }
            setLeagues(allLeagues);
            setFreeAgents(Array.from({ length: 30 }, () => createPlayer(getRandom(Object.values(PlayerRole)), getRandom(Object.values(Tier)))));
            setIsLoading(false);
        };
        generateWorld();
    }, []);

    const leaguesByRegion = useMemo(() => {
        return leagues.reduce((acc, league) => {
            if (!acc[league.region]) {
                acc[league.region] = [];
            }
            acc[league.region].push(league);
            return acc;
        }, {} as Record<RegionName, League[]>);
    }, [leagues]);

    const selectedTeam = useMemo(() => {
        if (!selectedTeamId) return null;
        return leagues.flatMap(l => l.teams).find(t => t.id === selectedTeamId);
    }, [leagues, selectedTeamId]);

    useEffect(() => {
        if (selectedTeam) {
            setCustomTeamName(selectedTeam.name);
        } else {
            setCustomTeamName('');
        }
    }, [selectedTeam]);

    const handleStart = () => {
        if (selectedTeamId && customTeamName.trim()) {
            onStartGame(selectedTeamId, customTeamName.trim(), leagues, freeAgents);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Đang tạo thế giới...</div>;
    }

    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 animate-fade-in space-y-6">
            <header className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">CHỌN ĐỘI TUYỂN</h2>
                <button onClick={onBack} className="bg-gray-700/50 px-4 py-2 rounded-md hover:bg-gray-600/70 transition-colors text-gray-200 font-semibold">&larr; Quay lại</button>
            </header>

            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-700 pb-4">
                {Object.values(RegionName).map(region => (
                    <button
                        key={region}
                        onClick={() => setActiveRegion(region)}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeRegion === region ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                    >
                        <span>{getFlagForRegion(region)}</span>
                        <span>{region}</span>
                    </button>
                ))}
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6">
                {(leaguesByRegion[activeRegion] || []).sort((a,b) => a.tier.localeCompare(b.tier)).map(league => (
                    <div key={`${league.region}-${league.tier}`}>
                        <h3 className="text-2xl font-bold text-yellow-300 mb-3">{league.tier}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {league.teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeamId(team.id)}
                                    className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${selectedTeamId === team.id ? 'bg-cyan-800/70 border-cyan-400 scale-105' : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-lg" />
                                        <span className="font-bold text-white truncate">{team.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="pt-6 border-t border-gray-700/50 flex flex-col items-center">
                {selectedTeamId && (
                    <div className="my-4 w-full max-w-md animate-fade-in">
                        <label htmlFor="team-name-input" className="block text-sm font-medium text-gray-300 mb-2 text-center">
                            Tên Đội Của Bạn
                        </label>
                        <input
                            id="team-name-input"
                            type="text"
                            value={customTeamName}
                            onChange={(e) => setCustomTeamName(e.target.value)}
                            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white text-center text-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                            placeholder="Nhập tên đội của bạn"
                        />
                    </div>
                )}
                <button 
                    onClick={handleStart} 
                    disabled={!selectedTeamId || !customTeamName.trim()}
                    className="w-full max-w-md bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Bắt đầu sự nghiệp
                </button>
                {!selectedTeamId && <p className="text-sm text-gray-400 mt-2">Vui lòng chọn một đội để bắt đầu.</p>}
            </footer>
        </div>
    );
};