import React, { useMemo } from 'react';

const RAYS = 28;

function CandyTree({ x, y, s = 1, delay = 0, flip = false }) {
  const crown = [[0, -250, 70], [-60, -215, 56], [62, -212, 58], [-30, -290, 52], [38, -285, 50], [-80, -260, 40], [86, -258, 42], [0, -200, 50]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="sway" style={{ animationDelay: `${delay}s` }}>
        <path d="M-12 0 Q-6 -110 -10 -200 L10 -200 Q6 -110 12 0Z" fill="#fff4e6" stroke="#c98f9e" strokeWidth="3" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M-11 ${-20 - i * 28} L11 ${-34 - i * 28} L11 ${-24 - i * 28} L-11 ${-10 - i * 28}Z`} fill="#e8384f" />
        ))}
        {crown.map(([cx, cy, r], i) => <circle key={`a${i}`} cx={cx} cy={cy} r={r + 3} fill="#d9488f" />)}
        {crown.map(([cx, cy, r], i) => <circle key={`b${i}`} cx={cx} cy={cy} r={r} fill={i % 2 ? '#ffb3d9' : '#ffc6e2'} />)}
        {crown.map(([cx, cy, r], i) => <circle key={`c${i}`} cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.32} fill="#fff" opacity="0.45" />)}
        {[[-40, -240], [30, -300], [70, -230], [-70, -280], [10, -220], [50, -270]].map(([bx, by], i) => (
          <g key={`f${i}`} transform={`translate(${bx} ${by})`}>
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-6" rx="4" ry="6" fill="#fff" transform={`rotate(${a})`} />)}
            <circle r="3" fill="#ffd23f" />
          </g>
        ))}
      </g>
    </g>
  );
}

function GiantLolly({ x, y, s = 1, colors = ['#ff4d6d', '#fff'], delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-7" y="-10" width="14" height="230" rx="7" fill="#fff6e8" stroke="#d9bf98" strokeWidth="2" />
      <g className="spin-slow" style={{ animationDelay: `${delay}s` }}>
        <circle r="62" fill={colors[0]} stroke="#7a0f2a" strokeWidth="4" />
        <path d="M0 0 a8 8 0 0 1 16 0 a16 16 0 0 1 -32 0 a24 24 0 0 1 48 0 a32 32 0 0 1 -64 0 a40 40 0 0 1 80 0 a48 48 0 0 1 -96 0"
          fill="none" stroke={colors[1]} strokeWidth="9" strokeLinecap="round" />
      </g>
      <ellipse cx="-22" cy="-30" rx="18" ry="8" fill="#fff" opacity="0.45" transform="rotate(-30 -22 -30)" />
    </g>
  );
}

function Balloon({ x, color, dur, delay, s = 1 }) {
  return (
    <g className="balloon" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} 0) scale(${s})`}>
        <path d="M0 40 q6 30 -4 60 q-8 30 4 60" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" />
        <ellipse cx="0" cy="0" rx="26" ry="32" fill={color} />
        <path d="M-4 31 l4 9 l4 -9z" fill={color} />
        <ellipse cx="-9" cy="-12" rx="7" ry="10" fill="#fff" opacity="0.45" />
      </g>
    </g>
  );
}

export function Background({ variant = 'game' }) {
  const sparkles = useMemo(
    () => Array.from({ length: 34 }, () => ({
      x: Math.random() * 1600, y: 60 + Math.random() * 700, s: 0.5 + Math.random(), d: Math.random() * 4,
    })),
    []
  );
  return (
    <svg className="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0b45" />
          <stop offset="0.35" stopColor="#7a1a5e" />
          <stop offset="0.7" stopColor="#d4467a" />
          <stop offset="1" stopColor="#ffb0b8" />
        </linearGradient>
        <radialGradient id="g-glow" cx="50%" cy="52%" r="50%">
          <stop offset="0" stopColor="#fff2c9" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff2c9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-spot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff7d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#g-sky)" />
      <g className="rays" style={{ transformOrigin: '800px 470px' }}>
        {Array.from({ length: RAYS }, (_, i) => {
          const a0 = (i / RAYS) * Math.PI * 2;
          const a1 = ((i + 1) / RAYS) * Math.PI * 2;
          return (
            <path key={i}
              d={`M800 470 L${800 + Math.cos(a0) * 1300} ${470 + Math.sin(a0) * 1300} L${800 + Math.cos(a1) * 1300} ${470 + Math.sin(a1) * 1300}Z`}
              fill={i % 2 ? '#35c4b2' : '#ffe9c7'} opacity={i % 2 ? 0.2 : 0.16} />
          );
        })}
      </g>
      <circle cx="800" cy="470" r="560" fill="url(#g-glow)" />
      {/* 綿あめの雲 */}
      {[[200, 150, 1], [1250, 110, 1.3], [700, 90, 0.8]].map(([x, y, s], i) => (
        <g key={i} className="cloud" style={{ animationDelay: `${-i * 14}s` }}>
          <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.85">
            {[[0, 0, 40], [45, -12, 48], [95, 0, 38], [30, 18, 34], [70, 18, 36]].map(([cx, cy, r], j) => (
              <circle key={j} cx={cx} cy={cy} r={r} fill={j % 2 ? '#ffd6ea' : '#ffe8f3'} />
            ))}
          </g>
        </g>
      ))}
      {/* スポットライト */}
      <path className="spot spot-l" d="M380 0 L560 0 L900 900 L250 900Z" fill="url(#g-spot)" />
      <path className="spot spot-r" d="M1040 0 L1220 0 L1350 900 L700 900Z" fill="url(#g-spot)" />
      {/* 風船 */}
      <Balloon x={160} color="#ff6b8b" dur={19} delay={-3} />
      <Balloon x={470} color="#4fd1b0" dur={23} delay={-12} s={0.8} />
      <Balloon x={1150} color="#ffc93c" dur={21} delay={-7} />
      <Balloon x={1450} color="#a35cf2" dur={25} delay={-17} s={0.9} />
      <Balloon x={820} color="#ff9ecf" dur={27} delay={-20} s={0.7} />
      {/* 遠景のクリームの丘 */}
      <path d="M0 720 Q200 640 400 700 T800 690 T1200 700 T1600 670 V900 H0Z" fill="#f7b6cf" />
      <path d="M0 760 Q250 700 520 760 T1060 750 T1600 740 V900 H0Z" fill="#fde3d0" />
      {[120, 330, 600, 900, 1180, 1440].map((x, i) => (
        <path key={i} d={`M${x - 30} 760 q10 34 18 4 q8 40 20 2 q10 26 22 -4`} fill="#fde3d0" />
      ))}
      <CandyTree x={250} y={800} s={0.95} />
      <CandyTree x={1360} y={800} s={1.05} delay={-2} flip />
      {variant === 'title' && (
        <>
          <GiantLolly x={400} y={600} s={0.9} delay={-4} />
          <GiantLolly x={1220} y={560} s={1.05} colors={['#4fd1b0', '#fff']} />
        </>
      )}
      {sparkles.map((sp, i) => (
        <g key={i} className="sparkle" style={{ animationDelay: `${sp.d}s` }}>
          <path transform={`translate(${sp.x} ${sp.y}) scale(${sp.s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff6c9" />
        </g>
      ))}
    </svg>
  );
}

function Rose({ x, y, s = 1, color = '#ff4d6d', dark = '#b5133c', delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="sway-sm" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx="-38" cy="18" rx="30" ry="13" fill="#3f9a5a" transform="rotate(-20 -38 18)" />
        <ellipse cx="40" cy="20" rx="30" ry="13" fill="#2f8048" transform="rotate(25 40 20)" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-26" rx="24" ry="30" fill={color} stroke={dark} strokeWidth="2" transform={`rotate(${a})`} />
        ))}
        <circle r="30" fill={color} stroke={dark} strokeWidth="2" />
        <path d="M0 0 a5 5 0 0 1 10 0 a10 10 0 0 1 -20 0 a15 15 0 0 1 30 0 a20 20 0 0 1 -40 0" fill="none" stroke={dark} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="-12" cy="-16" rx="10" ry="5" fill="#fff" opacity="0.35" transform="rotate(-30 -12 -16)" />
      </g>
    </g>
  );
}

function Daisy({ x, y, s = 1, color = '#fff', center = '#ffc21f', delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="sway-sm" style={{ animationDelay: `${delay}s` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx="0" cy="-22" rx="9" ry="20" fill={color} stroke="#e7a3c0" strokeWidth="1.5" transform={`rotate(${i * 36})`} />
        ))}
        <circle r="13" fill={center} stroke="#c86a00" strokeWidth="2" />
      </g>
    </g>
  );
}

export function Foreground() {
  return (
    <svg className="fg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <g>
        <Rose x={40} y={880} s={1.5} />
        <Daisy x={150} y={870} s={1.1} color="#ffd6ea" delay={-1} />
        <Rose x={250} y={895} s={1.1} color="#ff9ecf" dark="#d6336c" delay={-2} />
        <Daisy x={350} y={890} s={0.8} delay={-0.5} />
        <Rose x={450} y={905} s={0.9} color="#ffb36b" dark="#c8661a" delay={-1.5} />
        <Daisy x={1150} y={900} s={0.8} color="#d7f5ff" delay={-2.2} />
        <Rose x={1250} y={900} s={1.0} color="#ff9ecf" dark="#d6336c" delay={-0.8} />
        <Daisy x={1350} y={875} s={1.1} delay={-1.8} />
        <Rose x={1460} y={888} s={1.3} color="#ff4d6d" delay={-2.6} />
        <Daisy x={1560} y={860} s={1.0} color="#ffd6ea" delay={-0.3} />
      </g>
    </svg>
  );
}

// 上部の飾り幕（バランス）
export function Valance() {
  const scallops = 16;
  const w = 1600 / scallops;
  let d = 'M0 0 H1600 V52 ';
  for (let i = scallops - 1; i >= 0; i--) d += `Q${i * w + w / 2} 96 ${i * w} 52 `;
  d += 'Z';
  return (
    <svg className="valance" viewBox="0 0 1600 110" preserveAspectRatio="none">
      <defs>
        <pattern id="p-fold" width="50" height="110" patternUnits="userSpaceOnUse">
          <rect width="50" height="110" fill="#a3102f" />
          <rect x="0" width="12" height="110" fill="#7a0a22" opacity="0.7" />
          <rect x="30" width="8" height="110" fill="#d22a52" opacity="0.5" />
        </pattern>
      </defs>
      <path d={d} fill="url(#p-fold)" stroke="#5c0618" strokeWidth="3" />
      <path d={d.replace('M0 0 H1600 V52 ', 'M0 52 ').replace('Z', '')} fill="none" stroke="#f6c94f" strokeWidth="5" />
      {Array.from({ length: scallops }, (_, i) => (
        <g key={i} className="tassel" style={{ animationDelay: `${(i % 4) * 0.4}s` }}>
          <line x1={i * w} y1="52" x2={i * w} y2="74" stroke="#f6c94f" strokeWidth="3" />
          <path d={`M${i * w - 7} 74 h14 l-3 22 h-8z`} fill="#f6c94f" stroke="#b9821b" strokeWidth="1.5" />
          <circle cx={i * w} cy="74" r="5" fill="#ffe08a" />
        </g>
      ))}
      <rect x="0" y="0" width="1600" height="14" fill="#5c0618" />
      <rect x="0" y="14" width="1600" height="4" fill="#f6c94f" />
    </svg>
  );
}

export function Curtains({ open, children }) {
  return (
    <div className={`curtains ${open ? 'open' : 'closed'}`}>
      <div className="curtain left"><div className="fringe" /></div>
      <div className="curtain right"><div className="fringe" /></div>
      <div className="tieback left" />
      <div className="tieback right" />
      {children}
    </div>
  );
}
