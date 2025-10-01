import React from 'react';

type IconProps = {
    className?: string;
};

export const FishIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.254 1.954C11.53 1.396 12.47 1.396 12.746 1.954L14.7 6.007C14.807 6.223 15.05 6.36 15.309 6.319L19.81 5.378C20.422 5.26 20.944 5.922 20.732 6.502L19.232 10.997C19.14 11.274 19.278 11.57 19.539 11.721L23.41 14.116C23.94 14.43 23.94 15.223 23.41 15.537L19.539 17.932C19.278 18.083 19.14 18.379 19.232 18.656L20.732 23.151C20.944 23.731 20.422 24.393 19.81 24.282L15.31 23.34C15.05 23.299 14.807 23.436 14.7 23.652L12.746 27.705C12.47 28.263 11.53 28.263 11.254 27.705L9.3 23.652C9.193 23.436 8.95 23.299 8.691 23.34L4.19 24.282C3.578 24.393 3.056 23.731 3.268 23.151L4.768 18.656C4.86 18.379 4.722 18.083 4.461 17.932L0.59 15.537C0.06 15.223 0.06 14.43 0.59 14.116L4.461 11.721C4.722 11.57 4.86 11.274 4.768 10.997L3.268 6.502C3.056 5.922 3.578 5.26 4.19 5.378L8.691 6.319C8.95 6.36 9.193 6.223 9.3 6.007L11.254 1.954Z" transform="scale(0.8) translate(2, -2)" />
    </svg>
);

export const GoldFishIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l-4-4m0 0l4-4m-4 4h12M4 14l4 4m0 0l-4 4m4-4H8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const JunkIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const BootIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V7a2 2 0 012-2h4a2 2 0 012 2v12M4 19h8m0 0l4-4m-4 4v-4m4 4h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0l-4-4m4 4V3" />
    </svg>
);

export const RockIcon: React.FC<IconProps> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
);

export const TreasureIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16M8 12l4-4 4 4M4 12l8 8 8-8" />
    </svg>
);

export const BombIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CoinIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8C9.791 8 8 9.791 8 12c0 2.209 1.791 4 4 4s4-1.791 4-4c0-1.845-1.243-3.41-3-3.829M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

export const LevelIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);