import React from 'react';

// 劇場の案内役：トリュフの妖精「ボンボ」（オリジナルキャラクター）
const MOUTHS = {
  idle: <path d="M88 150 q12 12 24 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />,
  happy: <path d="M84 146 q16 26 32 0 z" fill="#5a1222" stroke="#2a0d05" strokeWidth="4" strokeLinejoin="round" />,
  cheer: <path d="M82 144 q18 32 36 0 z" fill="#5a1222" stroke="#2a0d05" strokeWidth="4" strokeLinejoin="round" />,
  wave: <path d="M86 148 q14 16 28 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />,
  wow: <ellipse cx="100" cy="153" rx="9" ry="11" fill="#5a1222" stroke="#2a0d05" strokeWidth="4" />,
  oops: <path d="M88 156 q6 -6 12 0 t12 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />,
  sad: <path d="M88 158 q12 -12 24 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />,
};

export default function Mascot({ mood = 'idle', size = 200 }) {
  const happyEyes = mood === 'happy' || mood === 'cheer';
  return (
    <svg viewBox="0 0 200 230" width={size} height={size * 1.15} className={`mascot mood-${mood}`} overflow="visible">
      <ellipse className="m-shadow" cx="100" cy="220" rx="52" ry="8" fill="#2a0618" opacity="0.3" />
      <g className="m-body">
        <ellipse cx="76" cy="206" rx="17" ry="9" fill="#3a170c" />
        <ellipse cx="124" cy="206" rx="17" ry="9" fill="#3a170c" />
        <g className="m-arm-l">
          <path d="M44 140 q-26 -4 -30 -30" stroke="#4a2418" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="14" cy="108" r="9" fill="#fff1d6" stroke="#4a2418" strokeWidth="3" />
        </g>
        <g className="m-arm-r">
          <path d="M156 140 q26 -4 30 -30" stroke="#4a2418" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="186" cy="108" r="9" fill="#fff1d6" stroke="#4a2418" strokeWidth="3" />
        </g>
        <circle cx="100" cy="135" r="68" fill="url(#g-truffle)" stroke="#2a0d05" strokeWidth="4" />
        <path d="M36 112 Q52 72 100 66 Q148 72 164 112 Q154 122 144 110 Q134 126 122 110 Q110 128 98 110 Q86 126 76 110 Q64 124 54 110 Q44 122 36 112Z"
          fill="#ff9ecf" stroke="#d6336c" strokeWidth="3" strokeLinejoin="round" />
        {[[60, 96, 20, '#fff'], [82, 84, -30, '#3fa7ff'], [108, 80, 40, '#ffd23f'], [132, 90, -10, '#3ddc97'], [146, 104, 30, '#fff'], [92, 98, 70, '#ff4d6d'], [120, 100, -50, '#fff']].map(([x, y, a, col], i) => (
          <rect key={i} x={x} y={y} width="10" height="4" rx="2" fill={col} transform={`rotate(${a} ${x + 5} ${y + 2})`} />
        ))}
        <path d="M104 62 q2 -22 22 -32" stroke="#3d8b3d" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M118 36 q14 -10 22 2 q-12 8 -22 -2z" fill="#5cc35c" stroke="#2f7a2f" strokeWidth="2" />
        <circle cx="102" cy="62" r="15" fill="#e0284a" stroke="#8a0f26" strokeWidth="3" />
        <ellipse cx="96" cy="56" rx="5" ry="3" fill="#fff" opacity="0.7" />
        <ellipse cx="62" cy="120" rx="22" ry="12" fill="#fff" opacity="0.12" transform="rotate(-25 62 120)" />
        {happyEyes ? (
          <g>
            <path d="M68 132 q10 -14 20 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M112 132 q10 -14 20 0" stroke="#2a0d05" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g className="m-eyes">
            <ellipse cx="78" cy="130" rx="12" ry="14" fill="#fff" stroke="#2a0d05" strokeWidth="3" />
            <ellipse cx="122" cy="130" rx="12" ry="14" fill="#fff" stroke="#2a0d05" strokeWidth="3" />
            <circle cx={mood === 'sad' ? 78 : 80} cy={mood === 'sad' ? 135 : 132} r="7" fill="#2a0d05" />
            <circle cx={mood === 'sad' ? 122 : 124} cy={mood === 'sad' ? 135 : 132} r="7" fill="#2a0d05" />
            <circle cx="83" cy="128" r="2.5" fill="#fff" />
            <circle cx="127" cy="128" r="2.5" fill="#fff" />
          </g>
        )}
        <ellipse cx="62" cy="150" rx="10" ry="6" fill="#ff7aa8" opacity="0.65" />
        <ellipse cx="138" cy="150" rx="10" ry="6" fill="#ff7aa8" opacity="0.65" />
        {MOUTHS[mood] || MOUTHS.idle}
        {mood === 'sad' && <path d="M140 118 q6 10 0 16 q-6 -6 0 -16z" fill="#8fd3ff" className="m-tear" />}
      </g>
    </svg>
  );
}
