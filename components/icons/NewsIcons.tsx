import React from 'react';
import { NewsItemType } from '../../types';
import { TrophyIcon } from './TrophyIcon';

const GeneralIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const DramaIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
     </svg>
);

const TransferIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 20l-4-4 4-4"></path>
        <path d="M10 16H3"></path>
        <path d="M10 4l4 4-4 4"></path>
        <path d="M14 8h7"></path>
    </svg>
);

const MvpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
);

const PromotionRelegationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14m7-7l-7 7-7-7" />
        <path d="M12 19V5m7 7l-7-7-7 7" />
    </svg>
);


export const NewsIcon: React.FC<{ type: NewsItemType; className?: string }> = ({ type, className }) => {
  switch (type) {
    case NewsItemType.MATCH_RESULT:
      return <TrophyIcon className={className} />;
    case NewsItemType.DRAMA:
      return <DramaIcon className={className} />;
    case NewsItemType.TRANSFER:
      return <TransferIcon className={className} />;
    case NewsItemType.MVP:
      return <MvpIcon className={className} />;
    case NewsItemType.CHAMPIONSHIP_WIN:
      return <TrophyIcon className={className} />;
    case NewsItemType.PROMOTION_RELEGATION:
      return <PromotionRelegationIcon className={className} />;
    case NewsItemType.GENERAL:
    default:
      return <GeneralIcon className={className} />;
  }
};