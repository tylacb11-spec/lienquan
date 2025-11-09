import React from 'react';
import { PlayerRole } from '../../types';

export const TopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3v2.586L5.707 8.879a1 1 0 0 0-.293.707V13.5a1 1 0 0 0 1 1h1.586l3.293 3.293A1 1 0 0 0 12 18.5V21" />
    <path d="m9 3 10 10" />
    <path d="m9 3 1.5 4.5" />
    <path d="M12.5 7.5 9 3" />
    <path d="M15 3v2.586l-3.293 3.293a1 1 0 0 0-.293.707V13.5a1 1 0 0 0 1 1h1.586l3.293 3.293A1 1 0 0 0 19 18.5V21" />
  </svg>
);

export const JungleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m15.5 9-4 4" />
    <path d="m8.5 13 4-4" />
    <path d="M14 17H8" />
  </svg>
);

export const MidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 21h1" />
    <path d="M12 18v3" />
    <path d="M12 3v9" />
    <path d="m16 9-3 3-3-3" />
    <path d="M3 13h18" />
  </svg>
);

export const AdcIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 21 18-18" />
    <path d="M5 12h14" />
    <path d="m18 15 3-3-3-3" />
    <path d="m6 9-3 3 3 3" />
  </svg>
);

export const SupportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17.5 3c-1.79 0-3.08 1.1-4.5 2.14C11.58 4.11 10.29 3 8.5 3A4.91 4.91 0 0 0 4 7.78c0 4.22 3 12.22 6 12.22 1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M12 12v.01" />
  </svg>
);

export const RoleIcon: React.FC<{ role: PlayerRole; className?: string }> = ({ role, className }) => {
  switch (role) {
    case PlayerRole.Top:
      return <TopIcon className={className} />;
    case PlayerRole.Jungle:
      return <JungleIcon className={className} />;
    case PlayerRole.Mid:
      return <MidIcon className={className} />;
    case PlayerRole.Adc:
      return <AdcIcon className={className} />;
    case PlayerRole.Support:
      return <SupportIcon className={className} />;
    default:
      return null;
  }
};
