import React, { useState } from 'react';
import { HistoricalRecord, HallOfFame } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

const RecordCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-yellow-500/30 shadow-lg flex flex-col items-center text-center h-full">
        <h3 className="text-xl font-bold text-yellow-300 tracking-wider uppercase mb-4">{title}</h3>
        {children}
    </div>
);

const HallOfFamePanel: React.FC<{ hallOfFame: HallOfFame | null }> = ({ hallOfFame }) => {
    if (!hallOfFame) {
        return (
            <div className="text-center py-8 text-gray-400">
                Đang tổng hợp dữ liệu vĩ đại nhất...
            </div>
        );
    }
    
    const { mostMvps, mostDomesticTitles, mostInternationalTitles } = hallOfFame;

    return (
        <div className="mb-8 p-4 bg-gray-900/50 rounded-xl">
             <h2 className="text-3xl font-bold mb-6 text-center text-yellow-300 tracking-wider">ĐẠI SẢNH HUYỀN THOẠI</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RecordCard title="Tuyển thủ vĩ đại nhất">
                    {mostMvps ? (
                        <div className="flex flex-col items-center">
                            <img src={mostMvps.player.avatarUrl} alt={mostMvps.player.ign} className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2"/>
                            <p className="text-2xl font-bold text-white">{mostMvps.player.ign}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <img src={mostMvps.player.teamLogoUrl} alt={mostMvps.player.teamName} className="w-5 h-5 rounded-full"/>
                                <span>{mostMvps.player.teamName}</span>
                            </div>
                            <div className="mt-4 flex items-center space-x-2 text-yellow-400">
                                <TrophyIcon className="w-8 h-8"/>
                                <span className="text-3xl font-bold">{mostMvps.count}</span>
                                <span className="text-lg">MVPs</span>
                            </div>
                        </div>
                    ) : <p className="text-gray-500 mt-12">Chưa có dữ liệu</p>}
                </RecordCard>

                <RecordCard title="Thế lực quốc nội">
                     {mostDomesticTitles ? (
                        <div className="flex flex-col items-center">
                            <img src={mostDomesticTitles.team.logoUrl} alt={mostDomesticTitles.team.name} className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2"/>
                            <p className="text-2xl font-bold text-white">{mostDomesticTitles.team.name}</p>
                             <div className="mt-8 flex items-center space-x-2 text-yellow-400">
                                <TrophyIcon className="w-8 h-8"/>
                                <span className="text-3xl font-bold">{mostDomesticTitles.count}</span>
                                <span className="text-lg">chức vô địch</span>
                            </div>
                        </div>
                    ) : <p className="text-gray-500 mt-12">Chưa có dữ liệu</p>}
                </RecordCard>

                 <RecordCard title="Bá chủ quốc tế">
                     {mostInternationalTitles ? (
                        <div className="flex flex-col items-center">
                            <img src={mostInternationalTitles.team.logoUrl} alt={mostInternationalTitles.team.name} className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2"/>
                            <p className="text-2xl font-bold text-white">{mostInternationalTitles.team.name}</p>
                             <div className="mt-8 flex items-center space-x-2 text-yellow-400">
                                <TrophyIcon className="w-8 h-8"/>
                                <span className="text-3xl font-bold">{mostInternationalTitles.count}</span>
                                <span className="text-lg">chức vô địch</span>
                            </div>
                        </div>
                    ) : <p className="text-gray-500 mt-12">Chưa có dữ liệu</p>}
                </RecordCard>
             </div>
        </div>
    );
}
interface HistoryViewProps {
  history: HistoricalRecord[];
  hallOfFame: HallOfFame | null;
  onBack: () => void;
}

const ChampionCard: React.FC<{ title: string; champion: { teamName: string; teamLogoUrl: string } | null }> = ({ title, champion }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg text-center h-full flex flex-col justify-between">
        <div>
            <h4 className="text-xl font-bold text-cyan-300 mb-3">{title}</h4>
            {champion ? (
                <div className="flex flex-col items-center space-y-2">
                    <img src={champion.teamLogoUrl} alt={champion.teamName} className="w-20 h-20 rounded-full mb-2 border-4 border-yellow-400" />
                    <p className="text-2xl font-bold text-white tracking-wider">{champion.teamName}</p>
                </div>
            ) : (
                <p className="text-gray-500 italic mt-8">Chưa có nhà vô địch</p>
            )}
        </div>
        <TrophyIcon className="w-16 h-16 text-yellow-400/80 mx-auto mt-4" />
    </div>
);


export const HistoryView: React.FC<HistoryViewProps> = ({ history, hallOfFame, onBack }) => {
    const sortedHistory = [...history].sort((a, b) => b.year - a.year);
    const [selectedYear, setSelectedYear] = useState<number | null>(sortedHistory.length > 0 ? sortedHistory[0].year : null);

    const selectedRecord = sortedHistory.find(r => r.year === selectedYear);

    return (
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 space-y-6">
            <header className="flex justify-between items-center pb-4 border-b border-gray-700/50">
                <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">LỊCH SỬ & THÀNH TÍCH</h2>
                <button onClick={onBack} className="bg-gray-700/50 px-4 py-2 rounded-md hover:bg-gray-600/70 transition-colors text-gray-200 font-semibold flex items-center">
                    <span className="mr-2 text-xl">&larr;</span> Quay lại
                </button>
            </header>

            <HallOfFamePanel hallOfFame={hallOfFame} />

            {history.length > 0 ? (
                <>
                    <h2 className="text-3xl font-bold text-center text-cyan-300 tracking-wider border-t border-gray-700 pt-6">LỊCH SỬ CÁC MÙA GIẢI</h2>
                    {/* Year Selector */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {sortedHistory.map(record => (
                            <button
                                key={record.year}
                                onClick={() => setSelectedYear(record.year)}
                                className={`px-4 py-2 font-semibold rounded-md transition-colors text-lg ${selectedYear === record.year ? 'bg-cyan-500 text-white' : 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300'}`}
                            >
                                Mùa {record.year}
                            </button>
                        ))}
                    </div>

                    {/* Champions Display */}
                    {selectedRecord && (
                        <div className="animate-fade-in space-y-8">
                            {/* International Champions */}
                            <div className="flex flex-col md:flex-row justify-center gap-6">
                                <div className="w-full md:w-1/2 lg:w-1/3">
                                     <ChampionCard title="Vô Địch MSI" champion={selectedRecord.msiChampion} />
                                </div>
                                <div className="w-full md:w-1/2 lg:w-1/3">
                                     <ChampionCard title="Vô Địch Thế Giới" champion={selectedRecord.worldChampion} />
                                </div>
                            </div>
                            
                            {/* Regional Champions */}
                            <div>
                                <h3 className="text-2xl font-bold text-center text-yellow-300 mb-4 tracking-wider">NHÀ VÔ ĐỊCH KHU VỰC</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedRecord.regionalChampions.map(({ region, champion }) => (
                                        <div key={region} className="bg-gray-900/50 p-3 rounded-lg flex items-center space-x-3">
                                            <img src={champion.teamLogoUrl} alt={champion.teamName} className="w-12 h-12 rounded-full border-2 border-gray-600" />
                                            <div>
                                                <p className="text-xs text-cyan-300 font-semibold">{region}</p>
                                                <p className="font-bold text-white truncate">{champion.teamName}</p>
                                            </div>
                                            <TrophyIcon className="w-8 h-8 text-yellow-400 ml-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                 <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">Chưa có dữ liệu lịch sử nào được ghi nhận.</p>
                </div>
            )}
        </div>
    );
};