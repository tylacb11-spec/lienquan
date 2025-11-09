import React from 'react';

interface ManagementPanelProps {
  team: { 
    name: string, 
    tier: string, 
    wins: number, 
    losses: number,
    fanCount?: number,
    fanEngagement?: number,
    reputation: number,
    rank?: number,
  };
  onNavigate: (view: 'dashboard' | 'management' | 'history') => void;
  onShowTransfers: () => void;
  isTransferWindowOpen?: boolean;
  onSaveGame: () => void;
}

const StatDisplay: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
    <div className={`bg-gray-900/50 p-3 rounded-lg text-center ${className}`}>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-cyan-300">{value}</p>
    </div>
);

export const ManagementPanel: React.FC<ManagementPanelProps> = ({ team, onNavigate, onShowTransfers, isTransferWindowOpen, onSaveGame }) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6 lg:sticky top-24">
      <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">BẢNG ĐIỀU KHIỂN</h2>
      
      <div className="grid grid-cols-2 gap-4">
          <StatDisplay label="Thứ Hạng" value={team.rank ? `#${team.rank}` : '-'} />
          <StatDisplay label="Thắng-Bại" value={`${team.wins}-${team.losses}`} />
          <StatDisplay label="Hạng Giải Đấu" value={team.tier} />
          <StatDisplay label="Danh Tiếng" value={`${Math.round(team.reputation)}`} />
          <StatDisplay label="Số Lượng Fan" value={team.fanCount?.toLocaleString('vi-VN') || 0} className="col-span-2" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
          <button onClick={() => onNavigate('management')} className="bg-cyan-700/50 p-2 rounded-md hover:bg-cyan-600/70 transition-colors text-white font-semibold disabled:bg-gray-600/30 disabled:text-gray-400 disabled:cursor-not-allowed">Quản lý Đội</button>
          <button onClick={onShowTransfers} className="bg-yellow-600/50 p-2 rounded-md hover:bg-yellow-500/70 transition-colors text-white font-semibold disabled:bg-gray-600/30 disabled:text-gray-400 disabled:cursor-not-allowed" disabled={!isTransferWindowOpen}>Chuyển Nhượng</button>
          <button onClick={onSaveGame} className="bg-green-700/50 p-2 rounded-md hover:bg-green-600/70 transition-colors text-white font-semibold">Lưu Game</button>
          <button onClick={() => onNavigate('history')} className="bg-gray-700/50 p-2 rounded-md hover:bg-gray-600/70 transition-colors text-white font-semibold">Lịch sử giải đấu</button>
      </div>
    </div>
  );
};