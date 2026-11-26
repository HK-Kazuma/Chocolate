import React from 'react';

// 全SVGで共有するグラデーション定義
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="g-lolly" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ff9db0" />
          <stop offset="0.55" stopColor="#ff4d6d" />
          <stop offset="1" stopColor="#c9183c" />
        </radialGradient>
        <linearGradient id="g-choco" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f5238" />
          <stop offset="1" stopColor="#3f1d12" />
        </linearGradient>
        <linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4b0" />
          <stop offset="0.45" stopColor="#f2c14e" />
          <stop offset="1" stopColor="#b77a16" />
        </linearGradient>
        <radialGradient id="g-cotton" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff0f8" />
          <stop offset="0.6" stopColor="#ffb3dc" />
          <stop offset="1" stopColor="#f77fbf" />
        </radialGradient>
        <linearGradient id="g-mac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8f5e0" />
          <stop offset="1" stopColor="#36b896" />
        </linearGradient>
        <radialGradient id="g-star" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset="0.5" stopColor="#ffcc2e" />
          <stop offset="1" stopColor="#f08a00" />
        </radialGradient>
        <radialGradient id="g-heart" cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e3c2ff" />
          <stop offset="0.5" stopColor="#a35cf2" />
          <stop offset="1" stopColor="#5b18a8" />
        </radialGradient>
        <radialGradient id="g-truffle" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#a8664a" />
          <stop offset="0.6" stopColor="#6a3420" />
          <stop offset="1" stopColor="#3a170c" />
        </radialGradient>
        <radialGradient id="g-gold" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff7d0" />
          <stop offset="0.5" stopColor="#f6c94f" />
          <stop offset="1" stopColor="#b9821b" />
        </radialGradient>
        <linearGradient id="g-velvet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d0620" />
          <stop offset="0.5" stopColor="#c8163f" />
          <stop offset="1" stopColor="#6d0620" />
        </linearGradient>
        <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
    </svg>
  );
}

const STAR_PTS = Array.from({ length: 10 }, (_, i) => {
  const a = (-90 + i * 36) * (Math.PI / 180);
  const rad = i % 2 === 0 ? 41 : 20;
  return `${(50 + Math.cos(a) * rad).toFixed(1)},${(53 + Math.sin(a) * rad).toFixed(1)}`;
}).join(' ');

const RB_COLORS = ['#ff4d6d', '#ff9f1c', '#ffd23f', '#3ddc97', '#3fa7ff', '#a35cf2'];
const RB_SECTORS = RB_COLORS.map((col, i) => {
  const a0 = ((i * 60 - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
  const p = (a) => `${(50 + Math.cos(a) * 36).toFixed(2)} ${(50 + Math.sin(a) * 36).toFixed(2)}`;
  return { col, d: `M50 50 L${p(a0)} A36 36 0 0 1 ${p(a1)} Z` };
});

const COTTON = [[36, 42, 17], [58, 34, 19], [67, 52, 16], [48, 56, 18], [30, 58, 12], [50, 23, 13]];

export function CandyArt({ type, special }) {
  if (special === 'rainbow') {
    return (
      <g className="rb-spin">
        <circle cx="50" cy="50" r="39" fill="#fff" opacity="0.9" />
        {RB_SECTORS.map((s) => <path key={s.col} d={s.d} fill={s.col} />)}
        <circle cx="50" cy="50" r="15" fill="#fff4e0" stroke="#fff" strokeWidth="3" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x="48" y="18" width="4" height="9" rx="2" fill="#fff" transform={`rotate(${a + 30} 50 50)`} />
        ))}
        <circle cx="45" cy="45" r="4" fill="#ff8fc7" />
        <circle cx="55" cy="53" r="3" fill="#3fa7ff" />
        <ellipse cx="36" cy="28" rx="9" ry="4" fill="#fff" opacity="0.6" transform="rotate(-35 36 28)" />
      </g>
    );
  }
  switch (type) {
    case 0:
      return (
        <g>
          <rect x="46" y="60" width="8" height="36" rx="4" fill="#fff6e8" stroke="#dcc4a0" strokeWidth="1.5" />
          <circle cx="50" cy="40" r="31" fill="url(#g-lolly)" stroke="#a5122f" strokeWidth="2.5" />
          <path d="M50 40 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0 a24 24 0 0 1 -48 0"
            fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.92" />
          <ellipse cx="37" cy="25" rx="9" ry="4.5" fill="#fff" opacity="0.6" transform="rotate(-30 37 25)" />
          <path d="M50 73 l-11 -6 v12z M50 73 l11 -6 v12z" fill="#ff8fc7" stroke="#d6336c" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      );
    case 1:
      return (
        <g transform="rotate(-8 50 50)">
          <rect x="20" y="10" width="60" height="80" rx="8" fill="url(#g-choco)" stroke="#2e140b" strokeWidth="2.5" />
          {[0, 1].map((i) => [0, 1, 2].map((j) => (
            <g key={`${i}${j}`}>
              <rect x={26 + i * 25} y={16 + j * 17} width="21" height="13" rx="3" fill="#7d432d" stroke="#4a2418" strokeWidth="1.5" />
              <rect x={28 + i * 25} y={18 + j * 17} width="12" height="3" rx="1.5" fill="#b0715a" opacity="0.7" />
            </g>
          )))}
          <path d="M18 62 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 V88 q0 4 -4 4 H22 q-4 0 -4 -4Z" fill="url(#g-foil)" stroke="#9a6510" strokeWidth="2" strokeLinejoin="round" />
          <rect x="18" y="72" width="64" height="9" fill="#d6336c" />
          <circle cx="50" cy="76.5" r="6" fill="#fff1d6" stroke="#9a6510" strokeWidth="1.5" />
          <path d="M28 66 l6 20" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M45 64 L50 97 L55 64Z" fill="#fff3dc" stroke="#d9bd8f" strokeWidth="1.5" strokeLinejoin="round" />
          {COTTON.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 1.5} fill="#e0569a" />)}
          {COTTON.map(([x, y, r], i) => <circle key={`i${i}`} cx={x} cy={y} r={r} fill="url(#g-cotton)" />)}
          <circle cx="40" cy="36" r="5" fill="#fff" opacity="0.7" />
          <circle cx="58" cy="28" r="3.5" fill="#fff" opacity="0.6" />
          <circle cx="62" cy="50" r="2.5" fill="#fff" opacity="0.6" />
        </g>
      );
    case 3:
      return (
        <g>
          <ellipse cx="50" cy="66" rx="35" ry="16" fill="url(#g-mac)" stroke="#1f8a70" strokeWidth="2.5" />
          <rect x="17" y="47" width="66" height="14" rx="7" fill="#fff4dc" stroke="#e0c38f" strokeWidth="2" />
          <path d="M16 46 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 7 0 q3 5 6 0" fill="none" stroke="#5ed3b5" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="38" rx="35" ry="20" fill="url(#g-mac)" stroke="#1f8a70" strokeWidth="2.5" />
          <ellipse cx="40" cy="30" rx="15" ry="5" fill="#fff" opacity="0.55" />
          <circle cx="63" cy="34" r="2" fill="#fff" opacity="0.6" />
        </g>
      );
    case 4:
      return (
        <g>
          <polygon points={STAR_PTS} fill="url(#g-star)" stroke="#c86a00" strokeWidth="4" strokeLinejoin="round" />
          <path d="M40 36 q6 -6 14 -4" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
          <circle cx="44" cy="54" r="3" fill="#7a3b00" />
          <circle cx="58" cy="54" r="3" fill="#7a3b00" />
          <path d="M46 61 q5 5 10 0" stroke="#7a3b00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="39" cy="60" r="3.5" fill="#ff8f6b" opacity="0.6" />
          <circle cx="63" cy="60" r="3.5" fill="#ff8f6b" opacity="0.6" />
        </g>
      );
    case 5:
    default:
      return (
        <g>
          <path d="M50 88 C18 66 10 46 17 31 C24 16 45 15 50 31 C55 15 76 16 83 31 C90 46 82 66 50 88Z" fill="url(#g-heart)" stroke="#47107f" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M23 44 q7 -8 13 0 t13 0 t13 0 t13 0" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M30 58 q6 -6 11 0 t11 0 t11 0" stroke="#ff9ecf" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="32" cy="30" rx="8" ry="4" fill="#fff" opacity="0.6" transform="rotate(-35 32 30)" />
        </g>
      );
  }
}

// スペシャルの背面装飾
function SpecialBack({ special }) {
  if (special === 'bomb') {
    return (
      <g className="wrap-pulse">
        <path d="M50 50 L4 30 L10 50 L4 70Z" fill="url(#g-gold)" stroke="#9a6510" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 50 L96 30 L90 50 L96 70Z" fill="url(#g-gold)" stroke="#9a6510" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="40" fill="#fff3b0" opacity="0.55" filter="url(#f-soft)" />
      </g>
    );
  }
  if (special === 'h' || special === 'v') {
    const rot = special === 'v' ? 90 : 0;
    return (
      <g transform={`rotate(${rot} 50 50)`}>
        <rect x="2" y="38" width="96" height="24" rx="12" fill="#fff" opacity="0.85" className="stripe-glow" />
        <rect x="2" y="44" width="96" height="12" rx="6" fill="#ff8fc7" />
        <path d="M3 50 l9 -9 v18z M97 50 l-9 -9 v18z" fill="#d6336c" className="arrow-pulse" />
      </g>
    );
  }
  return null;
}

function SpecialFront({ special }) {
  if (special === 'h' || special === 'v') {
    const rot = special === 'v' ? 90 : 0;
    return (
      <g transform={`rotate(${rot} 50 50)`} opacity="0.75">
        <path d="M22 40 h56 M18 50 h64 M22 60 h56" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6" />
      </g>
    );
  }
  if (special === 'bomb') {
    return (
      <g>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#f6c94f" strokeWidth="3" strokeDasharray="4 6" className="rb-spin" />
      </g>
    );
  }
  return null;
}

export const CandySVG = React.memo(function CandySVG({ type, special, size = '100%' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="candy-svg" overflow="visible">
      <ellipse cx="50" cy="94" rx="26" ry="5" fill="#2a0618" opacity="0.25" />
      <SpecialBack special={special} />
      <CandyArt type={type} special={special} />
      <SpecialFront special={special} />
    </svg>
  );
});
