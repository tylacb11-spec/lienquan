export enum PromisedRole {
    Star = 'Ngôi Sao',
    Starter = 'Chính Thức',
    Substitute = 'Dự Bị',
}

export interface Contract {
  teamId: string;
  salary: number; // USD per year
  signingBonus: number; // one-time payment
  duration: number; // in years (1, 2, or 3)
  promisedRole: PromisedRole;
  endDate: string; // YYYY-MM-DD
}

export enum PersonalityTrait {
    Star = 'Ngôi Sao',
    HardWorker = 'Cần Cù',
    Captain = 'Đội Trưởng',
    Veteran = 'Cựu Binh',
    Toxic = 'Độc Hại',
}

export type PotentialRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TransferRecord {
  year: number;
  fromTeamName: string;
  toTeamName: string;
  fee: number; // Buyout fee or 0 for free agents
}

export interface Player {
  id: string;
  ign: string; // In-game name
  fullName: string;
  age: number;
  role: PlayerRole;
  nationality: string;
  mechanics: number; // 0-100
  macro: number; // 0-100
  potential: PotentialRank;
  morale: number; // 0-100, dynamic
  form: number; // 0-100, dynamic
  stamina: number; // 0-100, dynamic
  contract: Contract | null; // Can be a free agent
  avatarUrl: string;
  traits: PersonalityTrait[];
  achievements: string[];
  mvpAwards: number; // new
  transferHistory?: TransferRecord[]; // new
  heroStats?: Record<string, number>; // new: heroId -> count
}

export enum Tier {
    Tier1 = 'Hạng 1',
    Tier2 = 'Hạng 2',
}

export enum RegionName {
    AOG = 'Việt Nam (AOG)',
    KPL = 'Trung Quốc (KPL)',
    RPL = 'Thái Lan (RPL)',
    GCS = 'Đài Bắc Trung Hoa (GCS)',
    NA = 'Bắc Mỹ (NA)',
    EU = 'Châu Âu (EU)',
}

export enum Split {
    Spring = 'Mùa Xuân',
    Summer = 'Mùa Hè',
}

export enum StaffRole {
    HeadCoach = 'HLV Trưởng',
    Analyst = 'Phân Tích Viên',
    Manager = 'Quản Lý Đội',
    Psychologist = 'Bác Sĩ Tâm Lý',
}

export interface StaffMember {
    id: string;
    role: StaffRole;
    name: string;
    level: number; // 1-10
    description: string;
}

export enum FacilityType {
    GamingHouse = 'Gaming House',
    TrainingGear = 'Thiết Bị Tập Luyện',
    ScoutingDept = 'Phòng Tuyển Trạch',
    MediaStudio = 'Studio Truyền Thông',
}

export interface Facility {
    type: FacilityType;
    level: number; // 1-10
    description: string;
}

export enum SponsorSlot {
    Main = 'Tài Trợ Chính',
    Sleeve = 'Tay Áo',
    Headset = 'Tai Nghe',
    Chair = 'Ghế',
}

export enum SponsorObjectiveType {
    WIN_CHAMPIONSHIP = 'Vô địch giải đấu',
    REACH_FINALS = 'Lọt vào Chung kết',
    SIGN_STAR_PLAYER = 'Ký hợp đồng với Ngôi Sao',
    WIN_X_MATCHES = 'Thắng X trận Vòng Bảng',
    QUALIFY_FOR_WORLDS = 'Tham dự CKTG',
    PLAYER_HAS_HIGH_MVPS = 'Tuyển thủ có nhiều MVP',
}

export interface SponsorObjective {
    type: SponsorObjectiveType;
    description: string;
    isMet: boolean;
    targetValue?: number; // e.g., for WIN_X_MATCHES
}

export type SponsorPrestige = 'Local' | 'Regional' | 'National' | 'Global';

export interface Sponsor {
    id: string;
    name: string;
    logoUrl: string;
    slot: SponsorSlot;
    basePayment: number;
    objective: SponsorObjective;
    bonus: number;
    penalty: number;
    duration: number; // in seasons
    startYear: number;
    prestige: SponsorPrestige;
}


export interface Team {
    id: string;
    name: string;
    logoUrl: string;
    tier: Tier;
    region: RegionName;
    roster: Player[];
    wins: number;
    losses: number;
    roundsWon: number; // new
    roundsLost: number; // new
    power?: number; // Overall team strength for simulation
    rank?: number;
    fanCount?: number;
    fanEngagement?: number; // 0-100
    reputation: number; // 0-100, for sponsors and media
    staff: StaffMember[];
    facilities: Facility[];
    finances: {
        budget: number;
        weeklyIncome: number;
        salaryExpenses: number;
        maintenanceCosts: number; // new
    };
    trophyRoom: string[];
    sponsors: Sponsor[];
    swissWins?: number;
    swissLosses?: number;
    opponentsPlayed?: string[];
    msiWins?: number;
    msiLosses?: number;
}

export interface GameEvent {
  time: string; // e.g., "02:15"
  description: string;
  teamId?: string; // which team initiated the event
}

export interface GameResult {
  gameNumber: number;
  winner: 'teamA' | 'teamB';
  duration: string;
  events: GameEvent[];
  picks: {
    teamA: Hero[];
    teamB: Hero[];
  };
  killsA: number; // new
  killsB: number; // new
  mvpPlayerId: string; // new
}

export interface Match {
    id: string;
    week: number;
    teamA: { id: string, name: string; logoUrl: string; };
    teamB: { id: string, name: string; logoUrl: string; };
    result?: { scoreA: number; scoreB: number; }; // e.g. 3-2
    isPlayed: boolean;
    round?: string; // e.g. 'Quarterfinals', 'Semifinals'
    gameResults?: GameResult[];
    teamA_Starters?: Player[];
    teamB_Starters?: Player[];
    group?: 'A' | 'B';
}

export enum GameState {
    RegularSeason = 'Vòng Bảng',
    Playoffs = 'Vòng Playoff',
    MSI = 'Mid-Season Invitational',
    WorldsSwissStage = 'CKTG - Vòng Swiss',
    WorldsPlayoffs = 'CKTG - Vòng Loại Trực Tiếp',
    PromotionRelegation = 'Vòng Phân Hạng',
    MidSeasonBreak = 'Nghỉ Giữa Mùa',
    OffSeason = 'Nghỉ Hết Mùa',
    AITransferWindow = 'Kỳ Chuyển Nhượng AI',
    SeasonEnd = 'Kết Thúc Mùa Giải',
    MATCH_DAY = 'Ngày Thi Đấu',
}

export enum PlayerRole {
    Top = 'Đường Tà Thần',
    Jungle = 'Đi Rừng',
    Mid = 'Đường Giữa',
    Adc = 'Xạ Thủ',
    Support = 'Trợ Thủ',
}

export interface League {
    tier: Tier;
    region: RegionName;
    teams: Team[];
    schedule: Match[];
}

export enum NewsItemType {
    MATCH_RESULT = 'Kết quả trận đấu',
    DRAMA = 'Drama',
    TRANSFER = 'Chuyển nhượng',
    GENERAL = 'Tin tức chung',
    PLAYER_DEV = 'Tuyển thủ phát triển',
    MVP = 'MVP Trận Đấu',
    CHAMPIONSHIP_WIN = 'Vô địch',
    PROMOTION_RELEGATION = 'Lên/Xuống hạng',
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  type: NewsItemType;
  metadata?: {
    promoted?: { name: string, logoUrl: string }[];
    relegated?: { name: string, logoUrl: string }[];
    champion?: { name: string, logoUrl: string };
    mvpPlayer?: { ign: string, avatarUrl: string };
    winningTeam?: { name: string, logoUrl: string };
    losingTeam?: { name: string, logoUrl: string };
    score?: string;
  };
}


export enum HeroRole {
    Warrior = 'Đấu Sĩ',
    Mage = 'Pháp Sư',
    Assassin = 'Sát Thủ',
    Marksman = 'Xạ Thủ',
    Support = 'Trợ Thủ',
    Tank = 'Đỡ Đòn',
}

export interface Hero {
    id: string;
    name: string;
    role: HeroRole;
    imageUrl: string;
    mechanics: number;
    macro: number;
    colorVariations?: string[];
}

export interface ChampionInfo {
  teamId: string;
  teamName: string;
  teamLogoUrl: string;
}

export interface HistoricalRecord {
  year: number;
  regionalChampions: {
    region: RegionName;
    champion: ChampionInfo;
  }[];
  msiChampion: ChampionInfo | null;
  worldChampion: ChampionInfo | null;
}

export interface MvpRecordHolder {
    id: string;
    ign: string;
    avatarUrl: string;
    teamName: string;
    teamLogoUrl: string;
}

export interface TeamRecordHolder {
    id: string;
    name: string;
    logoUrl: string;
}

export interface HallOfFame {
  mostMvps: {
    player: MvpRecordHolder;
    count: number;
  } | null;
  mostDomesticTitles: {
    team: TeamRecordHolder;
    count: number;
  } | null;
  mostInternationalTitles: {
    team: TeamRecordHolder;
    count: number;
  } | null;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
}

export interface RandomEventChoice {
  text: string;
  effects: {
    budget?: number;
    fanCount?: number;
    reputation?: number;
    playerStat?: {
      stat: 'mechanics' | 'macro' | 'morale' | 'form';
      change: number;
      target: 'random_player' | 'mvp_of_last_match' | 'lowest_morale';
    };
  };
  news?: {
    title: string;
    content: string;
  };
}

export interface RandomEvent {
  id: string;
  title: string;
  description: (teamName: string, opponentName?: string, playerName?: string) => string; // Function to generate dynamic text
  imageUrl?: string;
  choices: RandomEventChoice[];
  condition?: (playerWon: boolean) => boolean; // Optional condition for the event to appear
}


export const getDisplayRank = (player: Player): PotentialRank => {
    const mechanics = player.mechanics;
    const macro = player.macro;

    // Cấp S (Siêu sao / World Class)
    if (mechanics >= 90 && macro >= 90) return 'S';

    // Cấp A (Xuất sắc / Elite)
    if ((mechanics > 90 || macro > 90) || (mechanics > 80 && macro > 80)) return 'A';

    // Cấp B (Chuyên nghiệp / Professional)
    const isBalancedB = mechanics > 65 && macro > 65;
    const isSmartB = macro > 80 && (mechanics >= 50 && mechanics <= 65);
    const isFastB = mechanics > 80 && (macro >= 50 && macro <= 65);
    if (isBalancedB || isSmartB || isFastB) return 'B';

    // Cấp C (Trung bình / Rotational)
    if (mechanics >= 50 && mechanics < 70 && macro >= 50 && macro < 70) return 'C';
    
    // Cấp D (Cần phát triển / Needs Development)
    return 'D';
};

export const calculateBuyoutFee = (player: Player): number => {
    if (!player.contract) return 0;

    let value = player.contract.salary;

    // Stat multiplier (base 80 OVR = 1x)
    const overall = (player.mechanics + player.macro) / 2;
    const statMultiplier = 1 + ((overall - 80) / 40); // 100 OVR = 1.5x, 60 OVR = 0.5x
    value *= Math.max(0.5, statMultiplier);

    // Potential multiplier
    const potentialMultipliers: Record<PotentialRank, number> = { S: 1.5, A: 1.3, B: 1.1, C: 1.0, D: 0.9 };
    value *= potentialMultipliers[player.potential];

    // Age factor (peak value at 22-24)
    let ageFactor = 1.0;
    if (player.age < 22) ageFactor = 1.2;
    else if (player.age > 28) ageFactor = 0.8;
    else if (player.age > 26) ageFactor = 0.9;
    value *= ageFactor;

    // Achievements/MVP bonus
    const mvpBonus = player.mvpAwards * 7500;
    const achievementBonus = player.achievements.length * 15000;
    value += mvpBonus + achievementBonus;
    
    // Make sure fee isn't absurdly low
    const minimumFee = player.contract.salary * 1.5;
    
    // Round to nearest 1000
    return Math.round(Math.max(value, minimumFee) / 1000) * 1000;
};