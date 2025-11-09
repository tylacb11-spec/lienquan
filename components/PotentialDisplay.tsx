import React from 'react';
import { PotentialRank } from '../types';

export const PotentialDisplay: React.FC<{ rank: PotentialRank }> = ({ rank }) => {
    const rankStyles: Record<PotentialRank, string> = {
        S: 'bg-purple-500 text-purple-100 border-purple-400',
        A: 'bg-sky-500 text-sky-100 border-sky-400',
        B: 'bg-green-500 text-green-100 border-green-400',
        C: 'bg-gray-500 text-gray-100 border-gray-400',
        D: 'bg-orange-500 text-orange-100 border-orange-400',
    };
    return (
         <div className={`absolute top-0 right-0 text-[10px] sm:text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${rankStyles[rank]}`}>
            {rank}
        </div>
    );
};