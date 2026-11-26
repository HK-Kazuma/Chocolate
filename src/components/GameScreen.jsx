import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SIZE, rc, key, adjacent, inBounds, cloneGrid, createBoard, findGroups,
  expandClears, applyGravity, findMove, shuffleBoard, parseTiles,
} from '../engine';
import { CANDIES, COMBO_WORDS } from '../levels';
import { CandySVG } from './Candy';
import Mascot from './Mascot';
import { sfx } from '../audio';

export const CELL = 76;
const BOARD_PX = SIZE * CELL;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const FRAME = BOARD_PX + 36;
// 額縁まわりの電球（劇場のマーキー風）
const BULBS = (() => {
  const out = [];
  const per = 9;
  for (let i = 0; i < per; i++) {
    const t = 18 + (i / (per - 1)) * (FRAME - 36);
    out.push([t, 0], [t, FRAME], [0, t], [FRAME, t]);
  }
  return out;
})();

const LINES = {
  combo: ['すごいすごい！', 'とろけちゃう〜！', '拍手喝采だね！', '会場が沸いてるよ！'],
  special: ['スペシャルお菓子の完成！', 'キラキラだ〜！', 'それを使ってみて！'],
  rainbow: ['にじいろドロップだ！となりと入れ替えてみて！'],
  nope: ['そこは揃わないみたい…', 'おっと、もう一度！', '同じお菓子を3つ並べてね'],
  low: ['あと少し！がんばって！', '残りわずか…ドキドキ！'],
  normal: ['いい感じ！', 'おいしそう♪', 'その調子！'],
};

// ---------- 盤面の1マス ----------
const Piece = React.memo(function Piece({ cell, r, c, popping, selected, hinted, onDown }) {
  let cls = 'piece';
  if (selected) cls += ' selected';
  if (hinted) cls += ' hinted';
  if (popping) cls += ' popping';
  const k = key(r, c);
  return (
    <div className={cls} style={{ transform: `translate(${c * CELL}px, ${r * CELL}px)` }}
      onPointerDown={(e) => onDown(e, k)} data-k={k}>
      <div className={cell.fall ? 'piece-inner falling' : 'piece-inner'}
        style={cell.fall ? { '--fall': `${-cell.fall * CELL}px`, animationDelay: `${cell.delay || 0}s` } : undefined}>
        <div className="piece-art"><CandySVG type={cell.type} special={cell.special} /></div>
      </div>
    </div>
  );
});

function Tile({ r, c, v }) {
  return (
    <div className={`tile layer${v}`} style={{ transform: `translate(${c * CELL}px, ${r * CELL}px)` }}>
      <span className="drip d1" /><span className="drip d2" />
      {v > 1 && <span className="nut" />}
    </div>
  );
}

function Effect({ fx }) {
  const cx = (fx.c + 0.5) * CELL;
  const cy = (fx.r + 0.5) * CELL;
  switch (fx.kind) {
    case 'lineH': return <div className="fx-line h" style={{ top: cy }} />;
    case 'lineV': return <div className="fx-line v" style={{ left: cx }} />;
    case 'bomb': {
      const s = (fx.radius * 2 + 1) * CELL * 1.25;
      return <div className="fx-bomb" style={{ left: cx, top: cy, width: s, height: s }} />;
    }
    case 'rainbow':
      return (
        <svg className="fx-rainbow" width={BOARD_PX} height={BOARD_PX}>
          {fx.targets.map((k, i) => {
            const [r, c] = rc(k);
            return (
              <line key={k} x1={cx} y1={cy} x2={(c + 0.5) * CELL} y2={(r + 0.5) * CELL}
                stroke={['#ff4d6d', '#ff9f1c', '#ffd23f', '#3ddc97', '#3fa7ff', '#a35cf2'][i % 6]}
                strokeWidth="6" strokeLinecap="round" />
            );
          })}
          <circle cx={cx} cy={cy} r="30" fill="#fff" className="fx-rb-core" />
        </svg>
      );
    case 'burst':
      return (
        <div className="fx-burst" style={{ left: cx, top: cy }}>
          {fx.parts.map((p, i) => (
            <i key={i} style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, background: p.col, width: p.s, height: p.s, borderRadius: p.round ? '50%' : '2px' }} />
          ))}
        </div>
      );
    case 'score':
      return <div className={`fx-score ${fx.big ? 'big' : ''}`} style={{ left: cx, top: cy }}>+{fx.value}</div>;
    case 'melt':
      return <div className="fx-melt" style={{ left: cx, top: cy }} />;
    case 'born':
      return <div className="fx-born" style={{ left: cx, top: cy }} />;
    default:
      return null;
  }
}

function useCountUp(target) {
  const [v, setV] = useState(target);
  const vRef = useRef(target);
  useEffect(() => {
    let raf;
    const tick = () => {
      const d = target - vRef.current;
      if (Math.abs(d) < 1) { vRef.current = target; setV(target); return; }
      vRef.current += d * 0.18;
      setV(Math.round(vRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function GoalIcon({ goal }) {
  if (goal.kind === 'collect') return <CandySVG type={goal.type} special={null} />;
  if (goal.kind === 'tiles') return <div className="tile-icon"><span className="drip d1" /></div>;
  return (
    <svg viewBox="0 0 100 100"><polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="url(#g-gold)" stroke="#9a6510" strokeWidth="4" strokeLinejoin="round" /></svg>
  );
}

function Result({ result, level, onNext, onRetry, onMenu, hasNext }) {
  const [shown, setShown] = useState(0);
  const score = useCountUp(result.score);
  useEffect(() => {
    if (!result.won) return undefined;
    const ts = [0, 1, 2].filter((i) => i < result.stars).map((i) => setTimeout(() => { setShown(i + 1); sfx.star(i); }, 700 + i * 450));
    return () => ts.forEach(clearTimeout);
  }, [result]);
  const confetti = useMemo(() => Array.from({ length: result.won ? 90 : 0 }, () => ({
    x: Math.random() * 1600, d: Math.random() * 1.5, t: 2.5 + Math.random() * 2.5,
    col: pick(['#ff4d6d', '#ffd23f', '#4fd1b0', '#ff9ecf', '#a35cf2', '#fff', '#f6c94f']),
    w: 8 + Math.random() * 10, rot: Math.random() * 360,
  })), [result.won]);
  return (
    <div className="overlay result-overlay">
      {confetti.map((p, i) => (
        <i key={i} className="confetti" style={{ left: p.x, background: p.col, width: p.w, height: p.w * 0.45, animationDelay: `${p.d}s`, animationDuration: `${p.t}s`, '--rot': `${p.rot}deg` }} />
      ))}
      <div className={`result-card ${result.won ? 'won' : 'lost'}`}>
        <div className="ribbon">{result.won ? 'ブラボー！' : '幕が下りた…'}</div>
        <div className="result-act">{level.act}「{level.name}」</div>
        {result.won ? (
          <div className="result-stars">
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 100 100" className={`rstar ${i < shown ? 'on' : ''} s${i}`}>
                <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" strokeWidth="5" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        ) : (
          <div className="result-mascot"><Mascot mood="sad" size={130} /></div>
        )}
        <div className="result-score"><span>スコア</span><b>{score.toLocaleString()}</b></div>
        <p className="result-msg">
          {result.won
            ? (result.stars === 3 ? '満員の客席から、鳴りやまない拍手！' : '見事な公演でした！★3もめざしてみよう')
            : 'あと少しで目標達成！もう一度挑戦しよう'}
        </p>
        <div className="result-btns">
          {result.won && hasNext && <button className="btn primary" onClick={onNext}>次の演目へ ▶</button>}
          <button className={`btn ${result.won && hasNext ? '' : 'primary'}`} onClick={onRetry}>もう一度</button>
          <button className="btn ghost" onClick={onMenu}>演目選択へ</button>
        </div>
      </div>
    </div>
  );
}

// ---------- ゲーム画面 ----------
export default function GameScreen({ level, ready, onWin, onMenu, onRetry, onNext, hasNext, unlock, addMelted, settings, toggleSetting }) {
  const nT = level.types;
  const [grid, setGrid] = useState(() => createBoard(nT, true));
  const gRef = useRef(grid);
  const initialTiles = useMemo(() => parseTiles(level.tiles), [level]);
  const totalTiles = useMemo(() => (initialTiles ? initialTiles.flat().reduce((a, b) => a + b, 0) : 0), [initialTiles]);
  const [tiles, setTiles] = useState(initialTiles);
  const tRef = useRef(initialTiles);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [moves, setMoves] = useState(level.moves);
  const movesRef = useRef(level.moves);
  const [collected, setCollected] = useState({});
  const colRef = useRef({});
  const [popping, setPopping] = useState(() => new Set());
  const [effects, setEffects] = useState([]);
  const [selected, setSelected] = useState(null);
  const selRef = useRef(null);
  const [busy, setBusy] = useState(true);
  const busyRef = useRef(true);
  const [banner, setBanner] = useState(null);
  const [hint, setHint] = useState(null);
  const [phase, setPhase] = useState('intro');
  const phaseRef = useRef('intro');
  const [mood, setMood] = useState('wave');
  const [speech, setSpeech] = useState(level.intro);
  const [showBoard, setShowBoard] = useState(false);
  const [result, setResult] = useState(null);
  const [shake, setShake] = useState(false);
  const mounted = useRef(true);
  const fxId = useRef(1);

  const displayScore = useCountUp(score);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const wait = useCallback((ms) => new Promise((res, rej) => setTimeout(() => (mounted.current ? res() : rej(new Error('unmounted'))), ms)), []);
  const updGrid = (g) => { gRef.current = g; setGrid(g); };
  const setBusyBoth = (v) => { busyRef.current = v; setBusy(v); };
  const setPhaseBoth = (p) => { phaseRef.current = p; setPhase(p); };
  const setSel = (k) => { selRef.current = k; setSelected(k); };

  const moodTimer = useRef(null);
  const react = (m, line) => {
    setMood(m);
    if (line) setSpeech(line);
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => { if (mounted.current && phaseRef.current === 'play') setMood('idle'); }, 1600);
  };

  const addEffects = (list) => {
    const withIds = list.map((fx) => {
      const out = { ...fx, id: fxId.current++ };
      if (fx.kind === 'burst') {
        out.parts = Array.from({ length: 7 }, () => {
          const a = Math.random() * Math.PI * 2;
          const d = 30 + Math.random() * 50;
          return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - 15, col: Math.random() < 0.3 ? '#fff6c9' : CANDIES[fx.type]?.color || '#fff', s: 6 + Math.random() * 8, round: Math.random() < 0.6 };
        });
      }
      return out;
    });
    setEffects((prev) => [...prev, ...withIds]);
    const ids = new Set(withIds.map((f) => f.id));
    setTimeout(() => { if (mounted.current) setEffects((prev) => prev.filter((f) => !ids.has(f.id))); }, 950);
  };

  const showBanner = (text, tone = 'pink') => {
    const id = fxId.current++;
    setBanner({ text, tone, id });
    setTimeout(() => { if (mounted.current) setBanner((b) => (b && b.id === id ? null : b)); }, 1200);
  };

  // ---- 開演：幕が上がったら盤面にお菓子が降ってくる ----
  useEffect(() => {
    if (!ready) return undefined;
    let alive = true;
    (async () => {
      await wait(250);
      setShowBoard(true);
      await wait(1100);
      if (!alive) return;
      setBusyBoth(false);
      setPhaseBoth('play');
      setMood('idle');
    })().catch(() => {});
    return () => { alive = false; };
  }, [ready, wait]);

  const goalsMet = () => level.goals.every((g) => {
    if (g.kind === 'score') return scoreRef.current >= g.target;
    if (g.kind === 'collect') return (colRef.current[g.type] || 0) >= g.count;
    if (g.kind === 'tiles') return tRef.current.every((row) => row.every((v) => v === 0));
    return true;
  });

  // ---- 連鎖処理 ----
  async function cascade({ preferred = [], forced = null } = {}) {
    let combo = 0;
    let first = true;
    for (;;) {
      const g = gRef.current;
      let initial = [];
      let noActivate = new Set();
      let rainbowTypes = new Map();
      const creations = [];
      const protect = new Set();
      if (first && forced) {
        initial = [...forced.initial];
        noActivate = forced.noActivate || noActivate;
        rainbowTypes = forced.rainbowTypes || rainbowTypes;
      }
      const groups = findGroups(g, first ? preferred : []);
      for (const gr of groups) {
        for (const k of gr.cells) if (k !== gr.at) initial.push(k);
        if (gr.special && gr.at != null) { creations.push({ k: gr.at, special: gr.special }); protect.add(gr.at); }
      }
      first = false;
      if (!initial.length && !creations.length) break;
      combo++;

      const { clear, effects: fx } = expandClears(g, initial, { protect, noActivate, rainbowTypes });
      const popIds = new Set();
      const newCol = { ...colRef.current };
      const visual = [];
      let rs = 0, cs = 0;
      clear.forEach((k) => {
        const [r, c] = rc(k);
        const cell = g[r][c];
        popIds.add(cell.id);
        if (cell.special !== 'rainbow') newCol[cell.type] = (newCol[cell.type] || 0) + 1;
        visual.push({ kind: 'burst', r, c, type: cell.type });
        rs += r; cs += c;
      });
      let melted = 0;
      if (tRef.current) {
        const nt = tRef.current.map((row) => row.slice());
        [...clear, ...creations.map((x) => x.k)].forEach((k) => {
          const [r, c] = rc(k);
          if (nt[r][c] > 0) { nt[r][c]--; melted++; visual.push({ kind: 'melt', r, c }); }
        });
        tRef.current = nt;
        setTiles(nt);
        if (melted) addMelted(melted);
      }
      const gained = Math.round(clear.size * 60 * (1 + (combo - 1) * 0.5) + creations.length * 150 + fx.length * 120 + melted * 40);
      const n = Math.max(clear.size, 1);
      visual.push({ kind: 'score', r: rs / n, c: cs / n, value: gained, big: gained >= 1000 });
      creations.forEach(({ k }) => { const [r, c] = rc(k); visual.push({ kind: 'born', r, c }); });

      setPopping(popIds);
      addEffects([...fx, ...visual]);
      sfx.pop(combo);
      if (fx.some((f) => f.kind === 'bomb')) { sfx.bomb(); setShake(true); setTimeout(() => mounted.current && setShake(false), 350); }
      if (fx.some((f) => f.kind === 'lineH' || f.kind === 'lineV')) sfx.line();
      if (fx.some((f) => f.kind === 'rainbow')) sfx.rainbow();
      if (creations.length) sfx.special();

      scoreRef.current += gained;
      setScore(scoreRef.current);
      colRef.current = newCol;
      setCollected(newCol);

      if (combo >= 2) showBanner(COMBO_WORDS[Math.min(combo, COMBO_WORDS.length - 1)], combo >= 4 ? 'gold' : 'pink');
      if (combo >= 5) unlock('combo5');
      if (clear.size >= 40) unlock('bigClear');
      if (creations.some((x) => x.special === 'rainbow')) { unlock('rainbow'); react('wow', pick(LINES.rainbow)); }
      else if (creations.length) react('happy', pick(LINES.special));
      else if (combo >= 3) react('cheer', pick(LINES.combo));
      else if (combo === 1 && phaseRef.current === 'play') react('happy', null);

      await wait(fx.length ? 340 : 250);

      const ng = cloneGrid(g);
      clear.forEach((k) => { const [r, c] = rc(k); ng[r][c] = null; });
      creations.forEach(({ k, special }) => {
        const [r, c] = rc(k);
        ng[r][c] = { ...ng[r][c], special, fall: 0 };
      });
      setPopping(new Set());
      updGrid(applyGravity(ng, nT));
      await wait(450);
    }
    return combo;
  }

  async function curtainCall() {
    setPhaseBoth('rush');
    showBanner('カーテンコール！', 'gold');
    setMood('cheer');
    setSpeech('残った手数がボーナスに変わるよ！');
    await wait(1000);
    const conv = Math.min(movesRef.current, 12);
    let g = gRef.current;
    for (let i = 0; i < conv; i++) {
      const free = [];
      g.forEach((row, r) => row.forEach((cell, c) => { if (!cell.special) free.push([r, c]); }));
      if (!free.length) break;
      const [r, c] = pick(free);
      g = cloneGrid(g);
      g[r][c] = { ...g[r][c], special: Math.random() < 0.5 ? 'h' : 'v', fall: 0 };
      updGrid(g);
      movesRef.current--;
      setMoves(movesRef.current);
      scoreRef.current += 150;
      setScore(scoreRef.current);
      addEffects([{ kind: 'born', r, c }]);
      sfx.special();
      await wait(140);
    }
    if (movesRef.current > 0) {
      scoreRef.current += movesRef.current * 300;
      setScore(scoreRef.current);
      movesRef.current = 0;
      setMoves(0);
    }
    await wait(300);
    const specials = [];
    gRef.current.forEach((row, r) => row.forEach((cell, c) => { if (cell.special) specials.push(key(r, c)); }));
    if (specials.length) await cascade({ forced: { initial: specials } });
  }

  function finish(won) {
    setPhaseBoth(won ? 'win' : 'lose');
    const s = scoreRef.current;
    const stars = won ? Math.max(1, level.stars.filter((t) => s >= t).length) : 0;
    setHint(null);
    if (won) {
      sfx.win();
      setMood('cheer');
      setSpeech('ブラボー！最高の舞台だったよ！');
      onWin(level.id, stars, s);
    } else {
      sfx.lose();
      setMood('sad');
      setSpeech('うう…もう一回やってみよう！');
    }
    setTimeout(() => { if (mounted.current) setResult({ won, stars, score: s }); }, won ? 500 : 700);
  }

  async function afterTurn() {
    if (goalsMet()) {
      await curtainCall();
      finish(true);
      return;
    }
    if (movesRef.current <= 0) { finish(false); return; }
    if (movesRef.current <= 3) react('wow', pick(LINES.low));
    if (!findMove(gRef.current)) {
      showBanner('シャッフル！', 'pink');
      setSpeech('動かせるお菓子がないから、並べ替えるね！');
      await wait(600);
      updGrid(shuffleBoard(gRef.current));
      await wait(500);
    }
  }

  async function attemptSwap(k1, k2) {
    if (busyRef.current || phaseRef.current !== 'play' || !adjacent(k1, k2)) return;
    setBusyBoth(true);
    setSel(null);
    setHint(null);
    try {
      const g = gRef.current;
      const [r1, c1] = rc(k1);
      const [r2, c2] = rc(k2);
      const A = g[r1][c1];
      const B = g[r2][c2];
      const sw = cloneGrid(g);
      sw[r1][c1] = B;
      sw[r2][c2] = A;
      sfx.swap();
      updGrid(sw);
      await wait(210);

      let forced = null;
      if (A.special === 'rainbow' || B.special === 'rainbow') {
        const rbKey = A.special === 'rainbow' ? k2 : k1;
        const other = A.special === 'rainbow' ? B : A;
        const otherKey = A.special === 'rainbow' ? k1 : k2;
        if (other.special === 'rainbow') {
          const all = [];
          for (let i = 0; i < SIZE * SIZE; i++) all.push(i);
          forced = { initial: all, noActivate: new Set([k1, k2]) };
          addEffects([{ kind: 'bomb', r: 3.5, c: 3.5, radius: 4 }]);
          unlock('specialSwap');
        } else if (other.special) {
          const cg = cloneGrid(sw);
          const targets = [otherKey];
          cg.forEach((row, r) => row.forEach((cell, c) => {
            if (!cell.special && cell.type === other.type) {
              cg[r][c] = { ...cell, special: other.special === 'bomb' ? 'bomb' : (Math.random() < 0.5 ? 'h' : 'v'), fall: 0 };
              targets.push(key(r, c));
            }
          }));
          const [rr, rcc] = rc(rbKey);
          updGrid(cg);
          sfx.rainbow();
          addEffects([{ kind: 'rainbow', r: rr, c: rcc, targets }]);
          await wait(600);
          forced = { initial: [rbKey, ...targets], noActivate: new Set([rbKey]) };
          unlock('specialSwap');
        } else {
          forced = { initial: [rbKey], rainbowTypes: new Map([[rbKey, other.type]]) };
        }
        react('wow', 'にじいろマジック！');
      } else if (A.special && B.special) {
        const set = new Set([A.special, B.special]);
        let combined = 'cross';
        if (set.has('bomb') && (set.has('h') || set.has('v'))) combined = 'bigcross';
        else if (set.has('bomb')) combined = 'bomb2';
        const cg = cloneGrid(sw);
        cg[r2][c2] = { ...A, special: combined };
        updGrid(cg);
        forced = { initial: [k2, k1], noActivate: new Set([k1]) };
        unlock('specialSwap');
        react('wow', 'スペシャル同士の共演だ！');
      } else if (!findGroups(sw, [k1, k2]).length) {
        sfx.nope();
        updGrid(g);
        react('oops', pick(LINES.nope));
        await wait(230);
        return;
      }

      movesRef.current--;
      setMoves(movesRef.current);
      await cascade({ preferred: [k1, k2], forced });
      await afterTurn();
    } catch (e) {
      if (e.message !== 'unmounted') console.error(e);
    } finally {
      if (mounted.current) setBusyBoth(false);
    }
  }

  const attemptRef = useRef(attemptSwap);
  attemptRef.current = attemptSwap;

  const tap = (k) => {
    if (busyRef.current || phaseRef.current !== 'play') return;
    const s = selRef.current;
    if (s == null) { setSel(k); sfx.select(); }
    else if (s === k) setSel(null);
    else if (adjacent(s, k)) attemptRef.current(s, k);
    else { setSel(k); sfx.select(); }
  };
  const tapRef = useRef(tap);
  tapRef.current = tap;

  // ---- ドラッグ / クリック操作 ----
  const dragRef = useRef(null);
  const onDown = useCallback((e, k) => {
    e.preventDefault();
    dragRef.current = { k, x: e.clientX, y: e.clientY, moved: false };
  }, []);
  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d || d.moved) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      d.moved = true;
      const [r, c] = rc(d.k);
      const [r2, c2] = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
      if (inBounds(r2, c2)) attemptRef.current(d.k, key(r2, c2));
    };
    const up = () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (d && !d.moved) tapRef.current(d.k);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  // ---- 放置ヒント ----
  useEffect(() => {
    if (busy || phase !== 'play') return undefined;
    const t = setTimeout(() => setHint(findMove(gRef.current)), 7000);
    return () => clearTimeout(t);
  }, [busy, phase, grid]);

  const showHint = () => {
    if (busy || phase !== 'play') return;
    sfx.click();
    setHint(findMove(gRef.current));
    setSpeech('光っているお菓子を入れ替えてみて！');
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'h' || e.key === 'H') showHint();
      if (e.key === 'Escape') setSel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const hintSet = useMemo(() => new Set(hint || []), [hint]);
  const starMax = level.stars[2] * 1.08;
  const progress = Math.min(1, score / starMax);
  const remainingTiles = tiles ? tiles.flat().reduce((a, b) => a + b, 0) : 0;

  const goalRows = level.goals.map((g, i) => {
    let cur, max, label;
    if (g.kind === 'score') { cur = Math.min(score, g.target); max = g.target; label = `スコア ${g.target.toLocaleString()}`; }
    else if (g.kind === 'collect') { cur = Math.min(collected[g.type] || 0, g.count); max = g.count; label = CANDIES[g.type].name; }
    else { cur = totalTiles - remainingTiles; max = totalTiles; label = 'チョコの床を溶かす'; }
    const done = cur >= max;
    return (
      <div className={`goal ${done ? 'done' : ''}`} key={i}>
        <div className="goal-icon"><GoalIcon goal={g} /></div>
        <div className="goal-body">
          <div className="goal-label">{label}</div>
          <div className="goal-bar"><span style={{ width: `${(cur / max) * 100}%` }} /></div>
        </div>
        <div className="goal-count">{done ? <span className="check">✔</span> : g.kind === 'score' ? `${Math.round((cur / max) * 100)}%` : `${cur}/${max}`}</div>
      </div>
    );
  });

  return (
    <div className={`game phase-${phase}`}>
      {/* 左パネル：案内役と目標 */}
      <aside className="panel left-panel">
        <div className="panel-ribbon"><small>{level.act}</small>{level.name}</div>
        <div className="mascot-wrap">
          <div className="speech" key={speech}>{speech}</div>
          <Mascot mood={mood} size={150} />
        </div>
        <div className="goals">
          <h3>今日の目標</h3>
          {goalRows}
        </div>
        <div className="legend">
          <h3>スペシャルの作り方</h3>
          <div className="legend-row">
            <div><span className="lg-icon"><CandySVG type={3} special="h" /></span>4つ並べる</div>
            <div><span className="lg-icon"><CandySVG type={1} special="bomb" /></span>L・T字</div>
            <div><span className="lg-icon"><CandySVG type={0} special="rainbow" /></span>5つ並べる</div>
          </div>
        </div>
      </aside>

      {/* 盤面 */}
      <div className={`board-frame ${shake ? 'shake' : ''}`} style={{ left: 800 - BOARD_PX / 2 - 18, top: 112 }}>
        {BULBS.map(([x, y], i) => <i key={i} className="bulb" style={{ left: x, top: y, animationDelay: `${(i % 3) * 0.3}s` }} />)}
        <div className="board" style={{ width: BOARD_PX, height: BOARD_PX }}>
          <div className="pieces">
            {tiles && tiles.map((row, r) => row.map((v, c) => (v > 0 ? <Tile key={`t${r}-${c}-${v}`} r={r} c={c} v={v} /> : null)))}
            {showBoard && grid.map((row, r) => row.map((cell, c) => (
              <Piece key={cell.id} cell={cell} r={r} c={c}
                popping={popping.has(cell.id)}
                selected={selected === key(r, c)}
                hinted={hintSet.has(key(r, c))}
                onDown={onDown} />
            )))}
          </div>
          <div className="fx-layer">
            {effects.map((fx) => <Effect key={fx.id} fx={fx} />)}
          </div>
          {banner && <div key={banner.id} className={`banner tone-${banner.tone}`}>{banner.text}</div>}
        </div>
      </div>

      {/* 右パネル：スコア・手数・操作 */}
      <aside className="panel right-panel">
        <div className="score-box">
          <div className="label">SCORE</div>
          <div className="score-num">{displayScore.toLocaleString()}</div>
          <div className="star-bar">
            <span className="fill" style={{ width: `${progress * 100}%` }} />
            {level.stars.map((t, i) => (
              <svg key={i} viewBox="0 0 100 100" className={`mark ${score >= t ? 'on' : ''}`} style={{ left: `${(t / starMax) * 100}%` }}>
                <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" strokeWidth="6" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        </div>
        <div className={`moves-badge ${moves <= 3 ? 'low' : ''}`}>
          <div className="label">のこり手数</div>
          <div className="moves-num" key={moves}>{moves}</div>
        </div>
        <div className="ctrl-grid">
          <button className="btn small" onClick={showHint} disabled={busy || phase !== 'play'}>ヒント</button>
          <button className="btn small" onClick={() => { sfx.click(); onRetry(); }}>やり直す</button>
          <button className={`btn small toggle ${settings.sfx ? 'on' : ''}`} onClick={() => toggleSetting('sfx')}>効果音 {settings.sfx ? 'ON' : 'OFF'}</button>
          <button className={`btn small toggle ${settings.music ? 'on' : ''}`} onClick={() => toggleSetting('music')}>BGM {settings.music ? 'ON' : 'OFF'}</button>
        </div>
        <button className="btn ghost wide" onClick={() => { sfx.click(); onMenu(); }}>演目選択へ戻る</button>
        <p className="tip">ドラッグまたは2回クリックで<br />となりのお菓子と入れ替え</p>
      </aside>

      {result && (
        <Result result={result} level={level} hasNext={hasNext}
          onNext={onNext} onRetry={onRetry} onMenu={onMenu} />
      )}
    </div>
  );
}
