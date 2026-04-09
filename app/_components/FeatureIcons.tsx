"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * 1. QueryIcon
 * Represents SQL execution/editor.
 * Animation: Blinking cursor and typing effect.
 */
export const QueryIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes type { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }
      .group:hover .query-cursor { animation: blink 1s step-end infinite; }
      .group:hover .query-line { animation: type 1.5s ease-out forwards; stroke-dasharray: 10; }
    `}</style>
    <path
      d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 5l-2 14"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      className="query-cursor"
      x1="14"
      y1="19"
      x2="19"
      y2="19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0"
    />
    <line
      className="query-line"
      x1="5"
      y1="19"
      x2="12"
      y2="19"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

/**
 * 2. TableIcon
 * Represents a data viewer/grid.
 * Animation: Scanning row highlight.
 */
export const TableIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes scan { 
        0% { transform: translateY(0); opacity: 0; } 
        10%, 90% { opacity: 0.3; }
        100% { transform: translateY(12px); opacity: 0; } 
      }
      .group:hover .table-scan { animation: scan 2s linear infinite; }
    `}</style>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.2" opacity="0.5" />
    <line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="1.2" opacity="0.5" />
    <line x1="9" y1="3" x2="9" y2="21" stroke={color} strokeWidth="1.2" opacity="0.5" />
    <rect
      className="table-scan"
      x="4"
      y="4"
      width="16"
      height="5"
      fill={color}
      opacity="0"
    />
  </svg>
);

/**
 * 3. ManagementIcon
 * Represents database management/gears.
 * Animation: Dual gears rotating.
 */
export const ManagementIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes rotate-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      .group:hover .gear-big { animation: rotate-cw 8s linear infinite; transform-origin: 9px 12px; }
      .group:hover .gear-small { animation: rotate-ccw 6s linear infinite; transform-origin: 18px 8px; }
    `}</style>
    {/* Big Gear */}
    <path
      className="gear-big"
      d="M12.9 12a3.9 3.9 0 10-7.8 0 3.9 3.9 0 007.8 0z M9 15.1v.9 M9 8v.9 M12.1 12h.9 M5 12h.9 M11.2 14.2l.6.6 M6.2 9.2l.6.6 M11.2 9.8l.6-.6 M6.2 14.8l.6-.6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Small Gear */}
    <circle
      className="gear-small"
      cx="18"
      cy="8"
      r="3"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray="2 2"
    />
  </svg>
);

/**
 * 4. SecurityIcon
 * Represents encryption/shield.
 * Animation: Lock shackle closing.
 */
export const SecurityIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes lock-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
      .group:hover .lock-shackle { animation: lock-down 0.5s ease-out forwards; }
    `}</style>
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="9" y="11" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    <path
      className="lock-shackle"
      d="M10 11V9a2 2 0 114 0v2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      transform="translate(0, -1)"
    />
  </svg>
);

/**
 * 5. SpeedIcon
 * Represents performance.
 * Animation: Bolt pulse and speed streaks.
 */
export const SpeedIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes bolt-glow { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 0px ${color}); } 50% { opacity: 0.8; filter: drop-shadow(0 0 2px ${color}); } }
      @keyframes streak { 0% { transform: translateX(-10px); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateX(10px); opacity: 0; } }
      .group:hover .bolt-main { animation: bolt-glow 1s ease-in-out infinite; }
      .group:hover .speed-streak { animation: streak 0.8s linear infinite; }
    `}</style>
    <path
      className="bolt-main"
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line className="speed-streak" x1="4" y1="4" x2="8" y2="4" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <line className="speed-streak" x1="2" y1="8" x2="6" y2="8" stroke={color} strokeWidth="1" strokeLinecap="round" style={{ animationDelay: '0.2s' }} />
  </svg>
);

/**
 * 6. MinimalIcon
 */
export const MinimalIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes core-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      .group:hover .min-outer { animation: rotate-slow 12s linear infinite; transform-origin: 12px 12px; }
      .group:hover .min-core { animation: core-pulse 2s ease-in-out infinite; transform-origin: 12px 12px; }
    `}</style>
    <circle className="min-outer" cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" strokeDasharray="3 6" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" opacity="0.3" />
    <circle className="min-core" cx="12" cy="12" r="2" fill={color} />
  </svg>
);

/**
 * 7. PlugIcon
 */
export const PlugIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes connect { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
      @keyframes spark { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      .group:hover .plug-head { animation: connect 1s ease-in-out infinite; }
      .group:hover .plug-spark { animation: spark 0.5s step-end infinite; }
    `}</style>
    <path d="M18 15V17a2 2 0 01-2 2H8a2 2 0 01-2-2v-2" stroke={color} strokeWidth="1.8" />
    <path className="plug-head" d="M9 5v4M15 5v4M8 9h8v3a2 2 0 01-2 2H10a2 2 0 01-2-2V9z" stroke={color} strokeWidth="1.8" />
    <circle className="plug-spark" cx="12" cy="14" r="1" fill={color} opacity="0" />
  </svg>
);

/**
 * 8. ComputerIcon
 */
export const ComputerIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes signal { 
        0% { transform: scale(0.8); opacity: 0; } 
        50% { opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .group:hover .signal-wave { animation: signal 2s infinite; transform-origin: 12px 9px; }
    `}</style>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M8 20h8M12 16v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle className="signal-wave" cx="12" cy="9" r="3" stroke={color} strokeWidth="1" opacity="0" />
    <circle cx="12" cy="9" r="1.5" fill={color} />
  </svg>
);

/**
 * 9. PuzzleIcon
 */
export const PuzzleIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes puzzle-fit { 
        0% { transform: translate(4px, -4px); opacity: 0.5; }
        100% { transform: translate(0, 0); opacity: 1; }
      }
      .group:hover .puzzle-moving { animation: puzzle-fit 0.6s ease-out forwards; }
    `}</style>
    <path d="M10 3H5a2 2 0 00-2 2v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M3 14v5a2 2 0 002 2h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 21h5a2 2 0 002-2v-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M21 10V5a2 2 0 00-2-2h-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <rect className="puzzle-moving" x="11" y="11" width="6" height="6" rx="1" fill={color} />
  </svg>
);

/**
 * 10. KeyboardIcon
 */
export const KeyboardIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes press { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(1px); opacity: 0.5; } }
      .group:hover .key-a { animation: press 0.8s infinite; }
      .group:hover .key-b { animation: press 0.8s infinite 0.2s; }
      .group:hover .key-c { animation: press 0.8s infinite 0.4s; }
    `}</style>
    <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <rect className="key-a" x="5" y="9" width="3" height="2" rx="0.5" fill={color} opacity="0.8" />
    <rect className="key-b" x="10.5" y="9" width="3" height="2" rx="0.5" fill={color} opacity="0.8" />
    <rect className="key-c" x="16" y="9" width="3" height="2" rx="0.5" fill={color} opacity="0.8" />
    <rect x="7" y="13" width="10" height="2" rx="0.5" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

/**
 * 11. TerminalIcon
 */
export const TerminalIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      .group:hover .terminal-cursor { animation: blink 1s step-end infinite; }
    `}</style>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M6 9l2.5 3L6 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <line className="terminal-cursor" x1="10" y1="15" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 12. LayoutIcon
 */
export const LayoutIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes tab-switch { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
      .group:hover .tab-item { animation: tab-switch 2s infinite; }
    `}</style>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
    <rect className="tab-item" x="5" y="6" width="3" height="1.5" fill={color} opacity="0.8" />
    <rect className="tab-item" x="10.5" y="6" width="3" height="1.5" fill={color} opacity="0.2" style={{ animationDelay: '0.6s' }} />
    <rect className="tab-item" x="16" y="6" width="3" height="1.5" fill={color} opacity="0.2" style={{ animationDelay: '1.2s' }} />
  </svg>
);

/**
 * 13. FolderIcon
 */
export const FolderIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes pop-up { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
      .group:hover .file-pop { animation: pop-up 1.5s ease-in-out infinite; }
    `}</style>
    <path d="M2 6a2 2 0 012-2h5l2 3h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke={color} strokeWidth="1.8" />
    <rect className="file-pop" x="8" y="10" width="8" height="6" rx="1" fill={color} opacity="0.3" />
  </svg>
);

/**
 * 14. CPUIcon
 */
export const CPUIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes flow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
      .group:hover .circuit-path { stroke-dasharray: 4 4; animation: flow 2s linear infinite; }
    `}</style>
    <rect x="6" y="6" width="12" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <rect x="10" y="10" width="4" height="4" fill={color} />
    <path className="circuit-path" d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth="1.5" />
    <path d="M7 2v4M17 2v4M7 18v4M17 18v4M2 7h4M2 17h4M18 7h4M18 17h4" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

/**
 * 15. PaletteIcon
 */
export const PaletteIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes palette-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .group:hover .palette-spinner { animation: palette-spin 10s linear infinite; transform-origin: 12px 12px; }
    `}</style>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke={color} strokeWidth="1.8" />
    <g className="palette-spinner">
      <circle cx="12" cy="6" r="1.5" fill={color} />
      <circle cx="17.2" cy="9" r="1.5" fill={color} opacity="0.7" />
      <circle cx="17.2" cy="15" r="1.5" fill={color} opacity="0.5" />
      <circle cx="12" cy="18" r="1.5" fill={color} opacity="0.3" />
      <circle cx="6.8" cy="15" r="1.5" fill={color} opacity="0.5" />
      <circle cx="6.8" cy="9" r="1.5" fill={color} opacity="0.7" />
    </g>
  </svg>
);

/**
 * 16. ChartIcon
 */
export const ChartIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes grow-bar { 0% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.4); } }
      .group:hover .bar-anim { animation: grow-bar 2s ease-in-out infinite; transform-origin: bottom; }
    `}</style>
    <path d="M3 20h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path className="bar-anim" d="M7 16V9" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0s' }} />
    <path className="bar-anim" d="M12 16V5" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0.3s' }} />
    <path className="bar-anim" d="M17 16V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: '0.6s' }} />
  </svg>
);

/**
 * 17. RobotIcon
 */
export const RobotIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes blink-eye { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
      .group:hover .eye-anim { animation: blink-eye 4s infinite; transform-origin: center; }
    `}</style>
    <rect x="4" y="9" width="16" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M9 9V7a3 3 0 016 0v2M12 4V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle className="eye-anim" cx="8.5" cy="14.5" r="1.2" fill={color} />
    <circle className="eye-anim" cx="15.5" cy="14.5" r="1.2" fill={color} />
    <path d="M10 18h4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);

/**
 * 18. TeamIcon
 */
export const TeamIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes pop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      .group:hover .person-pop { animation: pop 2s ease-in-out infinite; }
    `}</style>
    <path className="person-pop" d="M14 19v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1" stroke={color} strokeWidth="1.8" />
    <circle className="person-pop" cx="8" cy="10" r="3" stroke={color} strokeWidth="1.8" />
    <path d="M22 19v-1a3 3 0 00-2.5-2.94" stroke={color} strokeWidth="1.5" opacity="0.6" />
    <path d="M16 7.1a3 3 0 011 5.8" stroke={color} strokeWidth="1.5" opacity="0.6" />
  </svg>
);

/**
 * 19. SparkleIcon
 */
export const SparkleIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor", className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <style>{`
      @keyframes sparkle-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes sparkle-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } }
      .group:hover .sparkle-container { animation: sparkle-rotate 10s linear infinite; transform-origin: 12px 12px; }
      .group:hover .sparkle-star { animation: sparkle-pulse 2s ease-in-out infinite; transform-origin: 12px 12px; }
    `}</style>
    <g className="sparkle-container">
      <path
        className="sparkle-star"
        d="M12 4l1.5 5.5H19l-4.5 3.5 1.7 5.5-4.2-3.3-4.2 3.3L9.5 13 5 9.5h5.5L12 4z"
        fill={color}
        opacity="0.9"
      />
      <circle cx="5" cy="5" r="0.8" fill={color} />
      <circle cx="19" cy="19" r="0.8" fill={color} />
      <circle cx="19" cy="5" r="0.8" fill={color} />
      <circle cx="5" cy="19" r="0.8" fill={color} />
    </g>
  </svg>
);
