import React from 'react';

const logoImg = '/logo.jpg';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-12' }) => {
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="BookMyHomez - Your Happy Home Partner"
        className="w-full h-full object-contain max-h-full block rounded-sm"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
