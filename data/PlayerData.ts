import { PlayerRole, RegionName, Tier } from '../types';

export interface RealPlayerData {
    ign: string;
    role: PlayerRole;
    mechanics?: number;
    macro?: number;
}

export const REAL_PLAYERS: Partial<Record<RegionName, Record<string, RealPlayerData[]>>> = {
    [RegionName.AOG]: {
        'Saigon Phantom': [
            { ign: 'Kuga', role: PlayerRole.Top, mechanics: 88, macro: 87 },
            { ign: 'Yiwei', role: PlayerRole.Top, mechanics: 89, macro: 88 },
            { ign: 'Jiro', role: PlayerRole.Jungle, mechanics: 90, macro: 89 },
            { ign: 'Bang', role: PlayerRole.Jungle, mechanics: 94, macro: 92 },
            { ign: 'Fish', role: PlayerRole.Mid, mechanics: 92, macro: 90 },
            { ign: 'Phoenix', role: PlayerRole.Adc, mechanics: 92, macro: 86 },
            { ign: 'Khoa', role: PlayerRole.Support, mechanics: 83, macro: 93 },
        ],
        'One Star Esports': [
            { ign: 'BirdLB', role: PlayerRole.Top, mechanics: 89, macro: 86 },
            { ign: 'Stark', role: PlayerRole.Jungle, mechanics: 90, macro: 89 },
            { ign: 'Zet', role: PlayerRole.Mid, mechanics: 89, macro: 87 },
            { ign: 'Sea', role: PlayerRole.Adc, mechanics: 90, macro: 85 },
            { ign: 'Phuscc', role: PlayerRole.Support, mechanics: 80, macro: 89 },
        ],
        'Box Gaming': [
            { ign: 'TriNguyen', role: PlayerRole.Top, mechanics: 85, macro: 84 },
            { ign: 'QuangHai', role: PlayerRole.Jungle, mechanics: 87, macro: 88 },
            { ign: 'Ciara', role: PlayerRole.Mid, mechanics: 87, macro: 86 },
            { ign: 'BOX Anne', role: PlayerRole.Adc, mechanics: 88, macro: 82 },
            { ign: 'Tama', role: PlayerRole.Support, mechanics: 81, macro: 90 },
        ],
        'Team Flash': [
            { ign: 'Bear', role: PlayerRole.Top, mechanics: 85, macro: 86 },
            { ign: 'Gray', role: PlayerRole.Jungle, mechanics: 90, macro: 90 },
            { ign: 'Maris', role: PlayerRole.Mid, mechanics: 89, macro: 88 },
            { ign: 'BeTroc', role: PlayerRole.Adc, mechanics: 88, macro: 84 },
            { ign: 'Yutan', role: PlayerRole.Support, mechanics: 80, macro: 89 },
        ],
        'The Daredevil Team': [
            { ign: 'Nolan', role: PlayerRole.Top, mechanics: 87, macro: 85 },
            { ign: 'Kaisa', role: PlayerRole.Jungle, mechanics: 86, macro: 87 },
            { ign: 'Aliyah', role: PlayerRole.Mid, mechanics: 87, macro: 86 },
            { ign: 'TNhân', role: PlayerRole.Adc, mechanics: 88, macro: 82 },
            { ign: 'Ara', role: PlayerRole.Support, mechanics: 79, macro: 88 },
        ],
        'Super Nova': [
            { ign: 'Acacia', role: PlayerRole.Top, mechanics: 83, macro: 82 },
            { ign: 'Tss', role: PlayerRole.Jungle, mechanics: 84, macro: 84 },
            { ign: 'Boka', role: PlayerRole.Mid, mechanics: 85, macro: 83 },
            { ign: 'Triết', role: PlayerRole.Adc, mechanics: 86, macro: 80 },
            { ign: 'QHuann', role: PlayerRole.Support, mechanics: 77, macro: 85 },
        ],
        'Black Sarus Sports': [
            { ign: 'TaricT', role: PlayerRole.Top, mechanics: 83, macro: 84 },
            { ign: 'River', role: PlayerRole.Jungle, mechanics: 85, macro: 84 },
            { ign: 'Judas', role: PlayerRole.Mid, mechanics: 84, macro: 83 },
            { ign: 'Ducky', role: PlayerRole.Adc, mechanics: 86, macro: 82 },
            { ign: 'Case', role: PlayerRole.Support, mechanics: 78, macro: 87 },
        ],
        'FPL': [
            { ign: 'Alan', role: PlayerRole.Top, mechanics: 82, macro: 81 },
            { ign: 'Bờm', role: PlayerRole.Jungle, mechanics: 83, macro: 83 },
            { ign: 'Chu', role: PlayerRole.Mid, mechanics: 84, macro: 82 },
            { ign: 'Shy', role: PlayerRole.Adc, mechanics: 85, macro: 79 },
            { ign: 'ProE', role: PlayerRole.Support, mechanics: 80, macro: 88 },
        ],
        'Hanoi Phantom': [
            { ign: 'Luffy', role: PlayerRole.Top, mechanics: 78, macro: 75 },
            { ign: 'Zoro', role: PlayerRole.Jungle, mechanics: 80, macro: 72 },
            { ign: 'Sanji', role: PlayerRole.Mid, mechanics: 77, macro: 78 },
            { ign: 'Nami', role: PlayerRole.Adc, mechanics: 75, macro: 74 },
            { ign: 'Chopper', role: PlayerRole.Support, mechanics: 68, macro: 82 },
        ],
        'Da Nang Buffaloes': [
            { ign: 'Hasagi', role: PlayerRole.Top, mechanics: 81, macro: 72 },
            { ign: 'Yasuo', role: PlayerRole.Jungle, mechanics: 82, macro: 70 },
            { ign: 'Yone', role: PlayerRole.Mid, mechanics: 80, macro: 75 },
            { ign: 'Jinx', role: PlayerRole.Adc, mechanics: 79, macro: 71 },
            { ign: 'Braum', role: PlayerRole.Support, mechanics: 70, macro: 80 },
        ],
        'Can Tho Titans': [
            { ign: 'Garen', role: PlayerRole.Top, mechanics: 75, macro: 79 },
            { ign: 'Jarvan', role: PlayerRole.Jungle, mechanics: 76, macro: 78 },
            { ign: 'Lux', role: PlayerRole.Mid, mechanics: 78, macro: 77 },
            { ign: 'Vayne', role: PlayerRole.Adc, mechanics: 81, macro: 70 },
            { ign: 'Leona', role: PlayerRole.Support, mechanics: 72, macro: 81 },
        ],
         'Hai Phong Eagles': [
            { ign: 'Jayce', role: PlayerRole.Top, mechanics: 79, macro: 74 },
            { ign: 'Vi', role: PlayerRole.Jungle, mechanics: 78, macro: 75 },
            { ign: 'Viktor', role: PlayerRole.Mid, mechanics: 79, macro: 78 },
            { ign: 'Caitlyn', role: PlayerRole.Adc, mechanics: 80, macro: 72 },
            { ign: 'Thresh', role: PlayerRole.Support, mechanics: 74, macro: 82 },
        ],
        'Hue Legends': [
            { ign: 'Darius', role: PlayerRole.Top, mechanics: 76, macro: 73 },
            { ign: 'XinZhao', role: PlayerRole.Jungle, mechanics: 77, macro: 74 },
            { ign: 'Zed', role: PlayerRole.Mid, mechanics: 83, macro: 69 },
            { ign: 'Ezreal', role: PlayerRole.Adc, mechanics: 82, macro: 71 },
            { ign: 'Alistar', role: PlayerRole.Support, mechanics: 71, macro: 79 },
        ],
        'Vung Tau Palace': [
            { ign: 'Fiora', role: PlayerRole.Top, mechanics: 82, macro: 70 },
            { ign: 'LeeSin', role: PlayerRole.Jungle, mechanics: 83, macro: 72 },
            { ign: 'Ahri', role: PlayerRole.Mid, mechanics: 80, macro: 76 },
            { ign: 'KaiSa', role: PlayerRole.Adc, mechanics: 81, macro: 73 },
            { ign: 'Janna', role: PlayerRole.Support, mechanics: 69, macro: 83 },
        ],
        'Bien Hoa United': [
            { ign: 'Renekton', role: PlayerRole.Top, mechanics: 77, macro: 75 },
            { ign: 'Graves', role: PlayerRole.Jungle, mechanics: 79, macro: 74 },
            { ign: 'Syndra', role: PlayerRole.Mid, mechanics: 78, macro: 78 },
            { ign: 'Lucian', role: PlayerRole.Adc, mechanics: 80, macro: 74 },
            { ign: 'Nautilus', role: PlayerRole.Support, mechanics: 73, macro: 80 },
        ],
        'Nha Trang Gaming': [
            { ign: 'Camille', role: PlayerRole.Top, mechanics: 80, macro: 73 },
            { ign: 'Elise', role: PlayerRole.Jungle, mechanics: 79, macro: 76 },
            { ign: 'Orianna', role: PlayerRole.Mid, mechanics: 77, macro: 81 },
            { ign: 'Xayah', role: PlayerRole.Adc, mechanics: 79, macro: 75 },
            { ign: 'Rakan', role: PlayerRole.Support, mechanics: 75, macro: 79 },
        ],
    },
    [RegionName.KPL]: {
        'Chongqing Wolves': [
            { ign: 'Fly', role: PlayerRole.Top, mechanics: 90, macro: 94 },
            { ign: 'XiaoPang', role: PlayerRole.Jungle, mechanics: 93, macro: 89 },
            { ign: 'Xiangyu', role: PlayerRole.Mid, mechanics: 88, macro: 91 },
            { ign: 'Demon', role: PlayerRole.Adc, mechanics: 92, macro: 87 },
            { ign: 'YiXing', role: PlayerRole.Support, mechanics: 83, macro: 95 },
        ],
        'eStar Pro': [
            { ign: 'Zimo', role: PlayerRole.Top, mechanics: 92, macro: 90 },
            { ign: 'Huahai', role: PlayerRole.Jungle, mechanics: 96, macro: 94 },
            { ign: 'Qingrong', role: PlayerRole.Mid, mechanics: 93, macro: 92 },
            { ign: 'Yizheng', role: PlayerRole.Adc, mechanics: 91, macro: 88 },
            { ign: 'Ziyang', role: PlayerRole.Support, mechanics: 85, macro: 97 },
        ],
        'AG Super Play': [
            { ign: 'Aze', role: PlayerRole.Top, mechanics: 89, macro: 88 },
            { ign: 'Weiyang', role: PlayerRole.Jungle, mechanics: 91, macro: 90 },
            { ign: 'Zhongdan', role: PlayerRole.Mid, mechanics: 90, macro: 89 },
            { ign: 'Jiumei', role: PlayerRole.Adc, mechanics: 92, macro: 86 },
            { ign: 'Daoshu', role: PlayerRole.Support, mechanics: 82, macro: 93 },
        ],
        'TTG': [
            { ign: 'Qingqing', role: PlayerRole.Top, mechanics: 91, macro: 89 },
            { ign: '不然', role: PlayerRole.Jungle, mechanics: 92, macro: 91 },
            { ign: 'Zidou', role: PlayerRole.Mid, mechanics: 89, macro: 90 },
            { ign: 'Fengxiao', role: PlayerRole.Adc, mechanics: 90, macro: 88 },
            { ign: 'Fanfan', role: PlayerRole.Support, mechanics: 84, macro: 94 },
        ],
        'Weibo Gaming': [
            { ign: 'Zhengyi', role: PlayerRole.Top, mechanics: 88, macro: 87 },
            { ign: 'Nuanfeng', role: PlayerRole.Jungle, mechanics: 90, macro: 89 },
            { ign: 'Hua', role: PlayerRole.Mid, mechanics: 89, macro: 88 },
            { ign: 'Qiaoxi', role: PlayerRole.Adc, mechanics: 91, macro: 85 },
            { ign: 'Xing', role: PlayerRole.Support, mechanics: 83, macro: 92 },
        ],
        'DRG.GK': [
            { ign: 'Baofeng', role: PlayerRole.Top, mechanics: 87, macro: 88 },
            { ign: 'Menglan', role: PlayerRole.Jungle, mechanics: 93, macro: 88 },
            { ign: 'Qingfeng', role: PlayerRole.Mid, mechanics: 91, macro: 90 },
            { ign: 'Dream', role: PlayerRole.Adc, mechanics: 90, macro: 86 },
            { ign: 'Aqi', role: PlayerRole.Support, mechanics: 84, macro: 91 },
        ],
        'EDward Gaming': [
            { ign: 'Sol', role: PlayerRole.Top, mechanics: 86, macro: 86 },
            { ign: 'Chen', role: PlayerRole.Jungle, mechanics: 88, macro: 87 },
            { ign: 'Ming', role: PlayerRole.Mid, mechanics: 89, macro: 88 },
            { ign: 'Roc', role: PlayerRole.Adc, mechanics: 89, macro: 84 },
            { ign: 'Yuan', role: PlayerRole.Support, mechanics: 82, macro: 90 },
        ],
        'Xianyou Gaming': [
            { ign: 'Luo', role: PlayerRole.Top, mechanics: 85, macro: 85 },
            { ign: 'Xiaoyi', role: PlayerRole.Jungle, mechanics: 87, macro: 86 },
            { ign: 'Ling', role: PlayerRole.Mid, mechanics: 88, macro: 87 },
            { ign: 'Dou', role: PlayerRole.Adc