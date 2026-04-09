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
 * Animation: Blinking cursor.
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
      .group:hover .query-cursor { animation: blink 1s step-end infinite; }
    `}</style>
    <path
      d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 5l-2 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      className="query-cursor"
      x1="7"
      y1="19"
      x2="17"
      y2="19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0"
    />
  </svg>
);

/**
 * 2. TableIcon
 * Represents a data viewer/grid.
 * Animation: Highlighting rows sequentially.
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
      @keyframes rowHighlight { 0%, 100% { opacity: 0; } 50% { opacity: 0.2; } }
      .group:hover .table-row-1 { animation: rowHighlight 2s infinite; }
      .group:hover .table-row-2 { animation: rowHighlight 2s infinite 1s; }
    `}</style>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="2" />
    <line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="2" />
    <line x1="9" y1="9" x2="9" y2="21" stroke={color} strokeWidth="2" />
    <rect className="table-row-1" x="10" y="10" width="10" height="4" fill={color} opacity="0" />
    <rect className="table-row-2" x="10" y="16" width="10" height="4" fill={color} opacity="0" />
  </svg>
);

/**
 * 3. ManagementIcon
 * Represents database management/gears.
 * Animation: Slow rotation of the gear.
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
      @keyframes spin-gear { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .group:hover .mgmt-gear { animation: spin-gear 8s linear infinite; transform-origin: 12px 12px; }
    `}</style>
    <path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="mgmt-gear"
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 4. SecurityIcon
 * Represents encryption/shield.
 * Animation: Pulse effect.
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
      @keyframes breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .group:hover .sec-pulse { animation: breathe 2s ease-in-out infinite; }
    `}</style>
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="sec-pulse"
      d="M12 8v4M12 16h.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 5. SpeedIcon
 * Represents performance.
 * Animation: Path drawing.
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
      @keyframes dash { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
      .group:hover .speed-bolt { stroke-dasharray: 100; animation: dash 1.5s linear infinite; }
    `}</style>
    <path
      className="speed-bolt"
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. MinimalIcon
 * Represents focus.
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
      @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse-dot { 0%, 100% { r: 3; } 50% { r: 4; } }
      .group:hover .min-ring { animation: spin-ring 10s linear infinite; transform-origin: 12px 12px; }
      .group:hover .min-dot { animation: pulse-dot 2s ease-in-out infinite; }
    `}</style>
    <circle className="min-ring" cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
    <circle className="min-dot" cx="12" cy="12" r="3" fill={color} />
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
      @keyframes snap { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
      .group:hover .plug-top { animation: snap 1s ease-in-out infinite; }
    `}</style>
    <path d="M18 13V15C18 16.1046 17.1046 17 16 17H8C6.89543 17 6 16.1046 6 15V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 17V21M15 17V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path className="plug-top" d="M12 2L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      @keyframes screen-glow { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.4; } }
      .group:hover .comp-screen { animation: screen-glow 3s ease-in-out infinite; }
    `}</style>
    <rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <path d="M8 21h8M12 17v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <rect className="comp-screen" x="5" y="6" width="14" height="8" fill={color} opacity="0.1" />
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
      @keyframes float-piece { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      .group:hover .puzzle-piece { animation: float-piece 2s ease-in-out infinite; }
    `}</style>
    <path
      d="M12 4V2m0 6v-2m0 6v-2m0 6v-2m-8-8H2m6 0h-2m6 0h-2m6 0h-2m-8 8H2m6 0h-2m6 0h-2m6 0h-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect className="puzzle-piece" x="16" y="8" width="4" height="4" fill={color} opacity="0.5" />
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
      @keyframes keypress { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      .group:hover .key-1 { animation: keypress 1s infinite; }
      .group:hover .key-2 { animation: keypress 1s infinite 0.2s; }
      .group:hover .key-3 { animation: keypress 1s infinite 0.4s; }
    `}</style>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <rect className="key-1" x="6" y="9" width="2" height="2" rx="0.5" fill={color} opacity="0.4" />
    <rect className="key-2" x="11" y="9" width="2" height="2" rx="0.5" fill={color} opacity="0.4" />
    <rect className="key-3" x="16" y="9" width="2" height="2" rx="0.5" fill={color} opacity="0.4" />
    <rect x="7" y="13" width="10" height="2" rx="0.5" fill={color} opacity="0.4" />
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
      .group:hover .term-cursor { animation: blink 1s step-end infinite; }
    `}</style>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M6 9l3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line className="term-cursor" x1="11" y1="15" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      @keyframes tab-glow { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.5; } }
      .group:hover .layout-tab { animation: tab-glow 2s ease-in-out infinite; }
    `}</style>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="2" />
    <line x1="9" y1="3" x2="9" y2="9" stroke={color} strokeWidth="2" />
    <line x1="15" y1="3" x2="15" y2="9" stroke={color} strokeWidth="2" />
    <rect className="layout-tab" x="4" y="4" width="4" height="4" fill={color} opacity="0.1" />
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
      @keyframes folder-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      .group:hover .folder-content { animation: folder-scale 2s ease-in-out infinite; transform-origin: 12px 14px; }
    `}</style>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path className="folder-content" d="M12 11v6M9 14h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      @keyframes cpu-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
      .group:hover .cpu-core { animation: cpu-pulse 1s ease-in-out infinite; }
    `}</style>
    <rect x="5" y="5" width="14" height="14" rx="1" stroke={color} strokeWidth="2" />
    <rect className="cpu-core" x="9" y="9" width="6" height="6" fill={color} opacity="0.2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M7 2v3M7 19v3M17 2v3M17 19v3M2 7h3M19 7h3M2 17h3M19 17h3" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      @keyframes color-fade { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      .group:hover .pal-1 { animation: color-fade 2s infinite; }
      .group:hover .pal-2 { animation: color-fade 2s infinite 0.5s; }
      .group:hover .pal-3 { animation: color-fade 2s infinite 1s; }
    `}</style>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" />
    <circle className="pal-1" cx="7.5" cy="11.5" r="1.5" fill={color} />
    <circle className="pal-2" cx="12" cy="7.5" r="1.5" fill={color} />
    <circle className="pal-3" cx="16.5" cy="11.5" r="1.5" fill={color} />
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
      @keyframes bar-1 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.7); } }
      @keyframes bar-2 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.5); } }
      @keyframes bar-3 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.8); } }
      .group:hover .bar-1 { animation: bar-1 2s ease-in-out infinite; transform-origin: bottom; }
      .group:hover .bar-2 { animation: bar-2 2s ease-in-out infinite; transform-origin: bottom; }
      .group:hover .bar-3 { animation: bar-3 2s ease-in-out infinite; transform-origin: bottom; }
    `}</style>
    <path className="bar-3" d="M18 20V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path className="bar-2" d="M12 20V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path className="bar-1" d="M6 20V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
      .group:hover .bot-eye { animation: blink 3s step-end infinite; }
    `}</style>
    <rect x="3" y="11" width="18" height="10" rx="2" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2" />
    <path d="M12 7v4M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth="2" />
    <circle className="bot-eye" cx="8" cy="16" r="1.5" fill={color} />
    <circle className="bot-eye" cx="16" cy="16" r="1.5" fill={color} />
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
      @keyframes team-glow { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      .group:hover .team-dot { animation: team-glow 4s ease-in-out infinite; }
    `}</style>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" />
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" stroke={color} strokeWidth="2" />
    <path d="M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" />
    <circle className="team-dot" cx="9" cy="7" r="1" fill={color} opacity="0" />
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
      @keyframes sparkle-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      @keyframes sparkle-fade { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      .group:hover .sparkle-main { animation: sparkle-scale 1.5s ease-in-out infinite; transform-origin: 12px 9px; }
      .group:hover .sparkle-dot-1 { animation: sparkle-fade 2s infinite; }
      .group:hover .sparkle-dot-2 { animation: sparkle-fade 2s infinite 1s; }
    `}</style>
    <path
      className="sparkle-main"
      d="M12 3l1.5 4.5H18l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5L12 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle className="sparkle-dot-1" cx="5" cy="5" r="1" fill={color} opacity="0" />
    <circle className="sparkle-dot-2" cx="19" cy="8" r="1" fill={color} opacity="0" />
  </svg>
);
