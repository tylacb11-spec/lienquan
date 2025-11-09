import React, { useState } from 'react';
import { Team, StaffMember, Facility, StaffRole, FacilityType, Player, Sponsor, SponsorSlot } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

const MAX_LEVEL = 10;

const getStaffDescription = (role: StaffRole, level: number): string => {
    switch (role) {
        case StaffRole.HeadCoach:
            return `Cải thiện khả năng phát triển Macro của tuyển thủ. Giảm ${level * 1}% Tinh thần bị mất khi thua.`;
        case StaffRole.Analyst:
            return `Tăng ${level * 1}% sức mạnh tổng thể trong trận đấu. Mở khóa thông tin tướng tủ của đối phương khi do thám.`;
        case StaffRole.Manager:
            return `Giảm ${level * 0.5}% lương yêu cầu của tuyển thủ mới. Tăng ${formatCurrency(level * 50)} thu nhập hàng tuần.`;
        case StaffRole.Psychologist:
            return `Tăng ${level * 2}% tốc độ hồi phục Tinh thần mỗi tuần. Giảm tỉ lệ xảy ra drama.`;
        default:
            return "Chưa có mô tả.";
    }
};

const getFacilityDescription = (type: FacilityType, level: number): string => {
    switch (type) {
        case FacilityType.GamingHouse:
            return `Tăng ${level * 2.5}% tốc độ hồi phục Thể Lực hàng tuần và một chút Tinh thần.`;
        case FacilityType.TrainingGear:
            return `Cải thiện khả năng phát triển Kỹ năng của tuyển thủ. Tăng ${level * 1}% Phong độ nhận được khi thắng.`;
        case FacilityType.ScoutingDept:
            return `Giảm ${level * 5}% chi phí do thám tuyển thủ. Tăng độ chính xác của báo cáo tiềm năng.`;
        case FacilityType.MediaStudio:
            return `Tăng ${level * 1.5}% lượng fan mới mỗi tuần. Cải thiện tốc độ tăng Danh tiếng.`;
        default:
            return "Chưa có mô tả.";
    }
};

const FinancesPanel: React.FC<{ finances: Team['finances'] }> = ({ finances }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Tổng Quan Tài Chính</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                <p className="text-sm text-gray-400">Ngân Sách</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(finances.budget)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Thu Nhập / Tuần</p>
                <p className="text-lg text-gray-200">{formatCurrency(finances.weeklyIncome)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Lương / Tuần</p>
                <p className="text-lg text-red-400">{formatCurrency(finances.salaryExpenses)}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">Phí Duy Trì / Tuần</p>
                <p className="text-lg text-yellow-400">{formatCurrency(finances.maintenanceCosts)}</p>
            </div>
        </div>
    </div>
);

interface UpgradePanelProps {
    budget: number;
    onUpgrade: (id: any) => void;
    getUpgradeCost: (level: number) => number;
}

interface StaffPanelProps extends UpgradePanelProps {
    staff: StaffMember[];
    onUpgrade: (id: string) => void;
}

const StaffPanel: React.FC<StaffPanelProps> = ({ staff, budget, onUpgrade, getUpgradeCost }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg h-full">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Ban Huấn Luyện</h3>
        <div className="space-y-3">
            {staff.map(member => {
                const cost = getUpgradeCost(member.level);
                const canAfford = budget >= cost;
                const isMaxLevel = member.level >= MAX_LEVEL;
                return (
                    <div key={member.id} className="bg-gray-800/70 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{member.role}</p>
                                <p className="text-sm text-gray-400">{member.name}</p>
                            </div>
                            <p className="font-bold text-lg text-yellow-400">Cấp {member.level}</p>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 italic">{getStaffDescription(member.role, member.level)}</p>
                        {!isMaxLevel && (
                             <button
                                onClick={() => onUpgrade(member.id)}
                                disabled={!canAfford || isMaxLevel}
                                className="mt-2 w-full text-sm font-semibold py-1 rounded-md transition-colors bg-green-600/50 text-white hover:bg-green-500/70 disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Nâng cấp ({formatCurrency(cost)})
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

interface FacilitiesPanelProps extends UpgradePanelProps {
    facilities: Facility[];
    onUpgrade: (type: FacilityType) => void;
}

const FacilitiesPanel: React.FC<FacilitiesPanelProps> = ({ facilities, budget, onUpgrade, getUpgradeCost }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg h-full">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Cơ Sở Vật Chất</h3>
        <div className="space-y-3">
            {facilities.map(facility => {
                 const cost = getUpgradeCost(facility.level);
                 const canAfford = budget >= cost;
                 const isMaxLevel = facility.level >= MAX_LEVEL;
                return (
                    <div key={facility.type} className="bg-gray-800/70 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                            <p className="font-bold">{facility.type}</p>
                            <p className="font-bold text-lg text-yellow-400">Cấp {facility.level}</p>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 italic">{getFacilityDescription(facility.type, facility.level)}</p>
                         {!isMaxLevel && (
                             <button
                                onClick={() => onUpgrade(facility.type)}
                                disabled={!canAfford || isMaxLevel}
                                className="mt-2 w-full text-sm font-semibold py-1 rounded-md transition-colors bg-green-600/50 text-white hover:bg-green-500/70 disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Nâng cấp ({formatCurrency(cost)})
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
);

const TrophyRoomPanel: React.FC<{ trophies: string[] }> = ({ trophies }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Phòng Cúp</h3>
        {trophies.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có danh hiệu nào.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trophies.map((trophy, index) => (
                    <div key={index} className="flex items-center bg-gray-800/70 p-2 rounded-md">
                        <TrophyIcon className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                        <p className="text-sm text-yellow-200">{trophy}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

interface RosterManagementPanelProps {
    roster: Player[];
    onReleasePlayer: (playerId: string) => void;
    isTransferWindowOpen: boolean;
}

const RosterManagementPanel: React.FC<RosterManagementPanelProps> = ({ roster, onReleasePlayer, isTransferWindowOpen }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Quản lý Đội hình</h3>
        <div className="space-y-2">
            {roster.map(player => (
                <div key={player.id} className="bg-gray-800/70 p-2 rounded-md flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src={player.avatarUrl} alt={player.ign} className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="font-bold">{player.ign}</p>
                            <p className="text-sm text-gray-400">{player.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onReleasePlayer(player.id)}
                        disabled={roster.length <= 5 || !isTransferWindowOpen}
                        className="bg-red-600/50 text-white font-semibold px-3 py-1 text-sm rounded-md hover:bg-red-500/70 transition-colors disabled:bg-gray-600/30 disabled:text-gray-400 disabled:cursor-not-allowed"
                        aria-label={`Thanh lý hợp đồng của ${player.ign}`}
                    >
                        Thanh lý
                    </button>
                </div>
            ))}
            {roster.length <= 5 && <p className="text-xs text-yellow-400 italic mt-2 text-center">Bạn phải có tối thiểu 5 tuyển thủ trong đội hình.</p>}
            {!isTransferWindowOpen && <p className="text-xs text-yellow-400 italic mt-2 text-center">Chức năng thanh lý chỉ mở trong kỳ chuyển nhượng.</p>}
        </div>
    </div>
);

interface SponsorshipPanelProps {
    sponsors: Sponsor[];
    onFindSponsor: (slot: SponsorSlot) => void;
}

const SponsorshipPanel: React.FC<SponsorshipPanelProps> = ({ sponsors, onFindSponsor }) => {
    const sponsorSlots = Object.values(SponsorSlot);
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-cyan-300 mb-3">Hợp Đồng Tài Trợ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sponsorSlots.map(slot => {
                    const sponsor = sponsors.find(s => s.slot === slot);
                    return (
                        <div key={slot} className="bg-gray-800/70 p-3 rounded-md">
                            <h4 className="font-bold text-lg text-yellow-300">{slot}</h4>
                            {sponsor ? (
                                <div>
                                    <p className="font-semibold text-white">{sponsor.name}</p>
                                    <p className="text-sm text-gray-400">Cơ bản/mùa: {formatCurrency(sponsor.basePayment)}</p>
                                    <p className="text-xs italic text-gray-500 mt-1">Mục tiêu: {sponsor.objective.description}</p>
                                    <p className="text-xs text-gray-500">Hết hạn: Mùa giải {sponsor.startYear + sponsor.duration - 1}</p>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">Vị trí trống</p>
                                    <button
                                        onClick={() => onFindSponsor(slot)}
                                        className="mt-2 text-sm bg-cyan-600/50 px-3 py-1 rounded-md hover:bg-cyan-500/70"
                                    >
                                        Tìm nhà tài trợ
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

type ManagementTab = 'roster' | 'upgrades' | 'sponsors';

interface TeamManagementViewProps {
  team: Team;
  onBack: () => void;
  onUpgradeStaff: (staffId: string) => void;
  onUpgradeFacility: (facilityType: FacilityType) => void;
  getStaffUpgradeCost: (level: number) => number;
  getFacilityUpgradeCost: (level: number) => number;
  onReleasePlayer: (playerId: string) => void;
  onFindSponsor: (slot: SponsorSlot) => void;
  isTransferWindowOpen: boolean;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({ team, onBack, onUpgradeStaff, onUpgradeFacility, getStaffUpgradeCost, getFacilityUpgradeCost, onReleasePlayer, onFindSponsor, isTransferWindowOpen }) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>('upgrades');

  const TabButton: React.FC<{tabId: ManagementTab, children: React.ReactNode}> = ({ tabId, children }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-gray-900/50 text-cyan-300' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}>
        {children}
    </button>
  );

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6">
      <header className="flex justify-between items-center pb-4 border-b border-gray-700/50">
        <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">QUẢN LÝ ĐỘI</h2>
        <button
            onClick={onBack}
            className="bg-red-800/60 px-4 py-2 rounded-md hover:bg-red-700/70 transition-colors text-red-100 font-semibold flex items-center"
        >
          <span className="mr-2 text-xl">&larr;</span> Quay lại
        </button>
      </header>

      <FinancesPanel finances={team.finances} />

      {/* Tabs */}
      <div className="border-b border-gray-700/50">
        <TabButton tabId="upgrades">Nâng Cấp</TabButton>
        <TabButton tabId="roster">Đội Hình & Cúp</TabButton>
        <TabButton tabId="sponsors">Tài Trợ & PR</TabButton>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'roster' && (
            <div className="space-y-6">
                <RosterManagementPanel roster={team.roster} onReleasePlayer={onReleasePlayer} isTransferWindowOpen={isTransferWindowOpen} />
                <TrophyRoomPanel trophies={team.trophyRoom} />
            </div>
        )}
        {activeTab === 'upgrades' && (
             <div className="grid md:grid-cols-2 gap-6">
                <StaffPanel
                    staff={team.staff}
                    budget={team.finances.budget}
                    onUpgrade={onUpgradeStaff}
                    getUpgradeCost={getStaffUpgradeCost}
                />
                <FacilitiesPanel
                    facilities={team.facilities}
                    budget={team.finances.budget}
                    onUpgrade={onUpgradeFacility}
                    getUpgradeCost={getFacilityUpgradeCost}
                />
            </div>
        )}
        {activeTab === 'sponsors' && (
            <SponsorshipPanel sponsors={team.sponsors} onFindSponsor={onFindSponsor} />
        )}
      </div>

    </div>
  );
};