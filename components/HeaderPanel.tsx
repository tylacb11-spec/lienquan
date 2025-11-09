import React from 'react';

interface HeaderPanelProps {
  onSimulate: () => void;
  isLoading: boolean;
  teamName: string;
  stage: string;
  split: string;
  year: number;
  buttonText: string;
  isButtonDisabled?: boolean;
}

export const HeaderPanel: React.FC<HeaderPanelProps> = ({ onSimulate, isLoading, teamName, stage, split, year, buttonText, isButtonDisabled }) => {
    const stageDisplay = stage.includes('Mùa') || stage.includes('CKTG') || stage.includes('MSI') ? stage : `${split} - ${stage}`;

    return (
        <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm shadow-lg p-3 z-30 border-b border-gray-700">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-white truncate">{teamName}</h1>
                    <p className="text-sm text-cyan-300 font-semibold">{year} - {stageDisplay}</p>
                </div>
                <div className="flex-1 flex justify-end">
                     <button
                        onClick={onSimulate}
                        disabled={isLoading || isButtonDisabled}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2 min-w-[200px] text-center"
                    >
                        {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </>
                        ) : (
                        <span>{buttonText}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};