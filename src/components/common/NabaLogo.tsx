import React from 'react';

interface NabaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showText?: boolean;
  showSubtitle?: boolean;
}

export const NabaLogo: React.FC<NabaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showText = true,
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Official NABA Academy Emblem: Open Book & Graduation Cap Geometry */}
      <div
        className={`${iconSizes[size]} shrink-0 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-200 group-hover:scale-105 shadow-xs ${
          isLight
            ? 'bg-[#082B50] text-[#D6A53A] border border-[#D6A53A]/30'
            : 'bg-[#082B50] text-[#D6A53A] border border-[#061E38]'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[85%] h-[85%]"
          aria-hidden="true"
        >
          {/* Subtle Outer Academic Octagon / Shield */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="9"
            fill={isLight ? '#061E38' : '#082B50'}
            stroke="#D6A53A"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Graduation Cap (Mortarboard) Crest */}
          <polygon
            points="24,8 37,14 24,20 11,14"
            fill="#D6A53A"
            stroke={isLight ? '#FFFFFF' : '#061E38'}
            strokeWidth="0.8"
          />
          {/* Cap Skull Cap */}
          <path
            d="M17 17.5V22C17 24.5 20.1 26.5 24 26.5C27.9 26.5 31 24.5 31 22V17.5"
            fill="#B88725"
            stroke="#D6A53A"
            strokeWidth="0.8"
          />
          {/* Cap Tassel */}
          <path
            d="M37 14V22.5C37 23.3 36.5 24 35.5 24"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Open Book - Left Page */}
          <path
            d="M24 38C19 35 13 35 8 37V26C13 24 19 24 24 26.5V38Z"
            fill="#EFF3F8"
            stroke="#D6A53A"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Open Book - Right Page */}
          <path
            d="M24 38C29 35 35 35 40 37V26C35 24 29 24 24 26.5V38Z"
            fill="#FFFFFF"
            stroke="#D6A53A"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Open Book Inner Lines (Knowledge Pages) */}
          <path
            d="M11 28.5C14.5 27.5 18 28 21 29.5"
            stroke="#082B50"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M11 31.5C14.5 30.5 18 31 21 32.5"
            stroke="#082B50"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M27 29.5C30 28 33.5 27.5 37 28.5"
            stroke="#082B50"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M27 32.5C30 31 33.5 30.5 37 31.5"
            stroke="#082B50"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Central Spine */}
          <path
            d="M24 26V39"
            stroke="#D6A53A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-tight ${
                size === 'sm'
                  ? 'text-xs sm:text-sm'
                  : size === 'lg'
                  ? 'text-lg md:text-xl'
                  : size === 'xl'
                  ? 'text-2xl md:text-3xl'
                  : 'text-sm md:text-base'
              } ${isLight ? 'text-white' : 'text-[#082B50]'}`}
            >
              أكاديمية نبا
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-semibold tracking-wider uppercase ${
                size === 'sm' ? 'text-[8.5px]' : 'text-[10px]'
              } ${isLight ? 'text-[#D6A53A]' : 'text-[#607086]'}`}
            >
              NABA Academy
            </span>
          )}
        </div>
      )}
    </div>
  );
};
