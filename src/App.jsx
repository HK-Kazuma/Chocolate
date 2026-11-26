import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SvgDefs, CandySVG } from './components/Candy';
import Mascot from './components/Mascot';
import { Background, Foreground, Valance, Curtains } from './components/Scenery';
import GameScreen from './components/GameScreen';
import { LEVELS, ACHIEVEMENTS } from './levels';
import { initAudio, sfx, setMusic, setSfx } from './audio';

const STORE_KEY = 'sugar-stage-v1';
const loadSave = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.stars) return { melted: 0, ach: {}, best: {}, ...s };
  } catch { /* 保存できない環境でも遊べる */ }
  return { stars: {}, best: {}, ach: {}, melted: 0 };
};
const writeSave = (s) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* noop */ } };

function useStageScale() {
  const [s, setS] = useState(1);
  useEffect(() => {
    const f = () => setS(Math.min(window.innerWidth / 1600, window.innerHeight / 900));
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return s;
}

const Star = ({ on, size = 22 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={`mini-star ${on ? 'on' : ''}`}>
    <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" strokeWidth="7" strokeLinejoin="round" />
  </svg>
);

function TitleScreen({ onStart, onHowTo, onAch, save }) {
  const totalStars = Object.values(save.stars).reduce((a, b) => a + b, 0);
  const achCount = Object.keys(save.ach).length;
  return (
    <div className="title-screen">
      <div className="float-candies">
        {[[150, 150, 0, null], [1360, 150, 4, null], [150, 320, 2, null], [1380, 320, 3, 'h'], [470, 330, 5, null], [1040, 330, 1, 'bomb'], [1360, 600, 0, 'rainbow']].map(([x, y, t, sp], i) => (
          <div key={i} className="float-candy" style={{ left: x, top: y, animationDelay: `${-i * 0.7}s` }}>
            <CandySVG type={t} special={sp} />
          </div>
        ))}
      </div>
      <div className="logo">
        <div className="logo-en">
          {'SUGAR STAGE'.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.09}s` }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </div>
        <div className="logo-ja">シュガー・ステージ</div>
        <div className="logo-sub">〜 夢見るお菓子劇場 〜</div>
      </div>
      <div className="title-mascot">
        <div className="speech big">いらっしゃい！<br />今夜の主役はキミだよ♪</div>
        <Mascot mood="wave" size={190} />
      </div>
      <div className="title-menu">
        <button className="btn primary huge" onClick={onStart}>開演する</button>
        <button className="btn" onClick={onHowTo}>あそびかた</button>
        <button className="btn" onClick={onAch}>実績 {achCount}/{ACHIEVEMENTS.length}</button>
      </div>
      <div className="ticket-stub">
        <span>全5幕</span><span className="sep" />
        <Star on size={20} /><span>{totalStars} / 15</span>
      </div>
    </div>
  );
}

const TICKET_POS = [[270, 470], [535, 395], [800, 470], [1065, 395], [1330, 470]];

function SelectScreen({ save, onPlay, onBack, onAch, onHowTo }) {
  const unlocked = (i) => i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0;
  const path = TICKET_POS.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y + 20}`).join(' ');
  return (
    <div className="select-screen">
      <h2 className="screen-title">演目をえらぶ</h2>
      <svg className="select-path" viewBox="0 0 1600 900">
        <path d={path} stroke="#fff" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d={path} stroke="#ff4d6d" strokeWidth="16" fill="none" strokeDasharray="18 18" className="cane" />
      </svg>
      {LEVELS.map((lv, i) => {
        const open = unlocked(i);
        const st = save.stars[lv.id] || 0;
        const [x, y] = TICKET_POS[i];
        return (
          <button key={lv.id} className={`ticket ${open ? '' : 'locked'} ${st ? 'cleared' : ''}`}
            style={{ left: x - 115, top: y - 150, animationDelay: `${i * 0.08}s` }}
            onClick={() => (open ? onPlay(i) : sfx.nope())}>
            <div className="ticket-act">{lv.act}</div>
            <div className="ticket-name">{lv.name}</div>
            <div className="ticket-goals">
              {lv.goals.map((g, j) => (
                <div key={j} className="tg">
                  {g.kind === 'collect' && <span className="tg-icon"><CandySVG type={g.type} special={null} /></span>}
                  {g.kind === 'tiles' && <span className="tg-icon tile-icon"><span className="drip d1" /></span>}
                  <span>{g.kind === 'score' ? `${g.target.toLocaleString()}点` : g.kind === 'collect' ? `×${g.count}` : 'チョコ床'}</span>
                </div>
              ))}
            </div>
            <div className="ticket-moves">手数 {lv.moves}</div>
            <div className="ticket-stars">{[0, 1, 2].map((s) => <Star key={s} on={s < st} size={26} />)}</div>
            {save.best[lv.id] ? <div className="ticket-best">ベスト {save.best[lv.id].toLocaleString()}</div> : null}
            {!open && <div className="lock"><svg viewBox="0 0 40 48" width="20"><rect x="4" y="20" width="32" height="26" rx="5" fill="#f6c94f" stroke="#9a6510" strokeWidth="3" /><path d="M11 20 v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="#9a6510" strokeWidth="5" /><circle cx="20" cy="32" r="4" fill="#9a6510" /></svg><span>前の幕をクリア</span></div>}
          </button>
        );
      })}
      <div className="select-bottom">
        <button className="btn ghost" onClick={onBack}>◀ タイトルへ</button>
        <button className="btn" onClick={onHowTo}>あそびかた</button>
        <button className="btn" onClick={onAch}>実績 {Object.keys(save.ach).length}/{ACHIEVEMENTS.length}</button>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="ribbon">{title}</div>
        <div className="modal-body">{children}</div>
        <button className="btn primary" onClick={onClose}>とじる</button>
      </div>
    </div>
  );
}

function HowTo({ onClose }) {
  const rows = [
    [<CandySVG type={0} />, '入れ替えて3つそろえる', 'となりのお菓子をドラッグ（または2回クリック）で入れ替え。縦か横に3つ以上そろうと消えます。'],
    [<CandySVG type={3} special="h" />, '4つそろえる → ストライプ', '1列まるごと消せるお菓子に。矢印の向きに消えます。'],
    [<CandySVG type={1} special="bomb" />, 'L字・T字 → ラッピング', '金の包み紙のお菓子。周りの3×3マスを吹き飛ばします。'],
    [<CandySVG type={0} special="rainbow" />, '5つそろえる → レインボードロップ', '入れ替えた相手と同じ種類のお菓子をすべて消します。'],
    [<CandySVG type={5} special="v" />, 'スペシャル同士を入れ替え', '十字消し・巨大爆発など、組み合わせでもっと豪華な演出に！'],
    [<div className="tile-icon big"><span className="drip d1" /></div>, 'チョコの床', '上でお菓子を消すと溶けます。濃いチョコは2回必要です。'],
  ];
  return (
    <Modal title="あそびかた" onClose={onClose}>
      <div className="howto">
        {rows.map(([icon, h, p], i) => (
          <div className="howto-row" key={i}>
            <div className="howto-icon">{icon}</div>
            <div><b>{h}</b><p>{p}</p></div>
          </div>
        ))}
      </div>
      <p className="howto-foot">手数がなくなる前に目標を達成するとクリア。余った手数は「カーテンコール」でボーナス得点に変わります。</p>
    </Modal>
  );
}

function Achievements({ save, onClose }) {
  return (
    <Modal title="実績" onClose={onClose}>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`ach ${save.ach[a.id] ? 'got' : ''}`}>
            <div className="medal"><Star on={!!save.ach[a.id]} size={34} /></div>
            <div><b>{save.ach[a.id] ? a.name : '？？？'}</b><p>{a.desc}</p></div>
          </div>
        ))}
      </div>
      <p className="howto-foot">溶かしたチョコの床：{save.melted} 枚</p>
    </Modal>
  );
}

export default function App() {
  const scale = useStageScale();
  const [started, setStarted] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [screen, setScreen] = useState('title');
  const [levelIdx, setLevelIdx] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [modal, setModal] = useState(null);
  const [save, setSave] = useState(loadSave);
  const saveRef = useRef(save);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState({ sfx: true, music: true });
  const transitioning = useRef(false);

  const commit = (next) => { saveRef.current = next; setSave(next); writeSave(next); };

  const unlock = useCallback((id) => {
    const s = saveRef.current;
    if (s.ach[id]) return;
    commit({ ...s, ach: { ...s.ach, [id]: Date.now() } });
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    const tid = Date.now() + Math.random();
    setToasts((t) => [...t, { id: tid, ...a }]);
    sfx.achieve();
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3200);
  }, []);

  const addMelted = useCallback((n) => {
    const s = saveRef.current;
    const melted = s.melted + n;
    commit({ ...s, melted });
    if (melted >= 50) unlock('melt50');
  }, [unlock]);

  const onWin = useCallback((id, stars, score) => {
    const s = saveRef.current;
    const next = {
      ...s,
      stars: { ...s.stars, [id]: Math.max(s.stars[id] || 0, stars) },
      best: { ...s.best, [id]: Math.max(s.best[id] || 0, score) },
    };
    commit(next);
    unlock('firstWin');
    if (stars === 3) unlock('threeStars');
    if (LEVELS.every((l) => next.stars[l.id])) unlock('allClear');
  }, [unlock]);

  const go = (fn) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setModal(null);
    setCurtainOpen(false);
    sfx.curtain();
    setTimeout(() => {
      fn();
      setTimeout(() => { setCurtainOpen(true); sfx.curtain(); transitioning.current = false; }, 350);
    }, 900);
  };

  const begin = () => {
    if (started) return;
    initAudio();
    setStarted(true);
    sfx.curtain();
    setTimeout(() => setCurtainOpen(true), 150);
  };

  const toggleSetting = (k) => {
    setSettings((s) => {
      const n = { ...s, [k]: !s[k] };
      if (k === 'music') setMusic(n.music);
      if (k === 'sfx') setSfx(n.sfx);
      return n;
    });
    sfx.click();
  };

  const playLevel = (i) => { sfx.click(); go(() => { setLevelIdx(i); setGameKey((k) => k + 1); setScreen('game'); }); };

  return (
    <div className="viewport">
      <SvgDefs />
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <Background variant={screen === 'game' ? 'game' : 'title'} />
        {screen === 'title' && (
          <TitleScreen save={save}
            onStart={() => { sfx.click(); go(() => setScreen('select')); }}
            onHowTo={() => { sfx.click(); setModal('howto'); }}
            onAch={() => { sfx.click(); setModal('ach'); }} />
        )}
        {screen === 'select' && (
          <SelectScreen save={save} onPlay={playLevel}
            onBack={() => { sfx.click(); go(() => setScreen('title')); }}
            onHowTo={() => { sfx.click(); setModal('howto'); }}
            onAch={() => { sfx.click(); setModal('ach'); }} />
        )}
        {screen === 'game' && (
          <GameScreen key={gameKey} level={LEVELS[levelIdx]} ready={curtainOpen}
            onWin={onWin} unlock={unlock} addMelted={addMelted}
            settings={settings} toggleSetting={toggleSetting}
            hasNext={levelIdx < LEVELS.length - 1}
            onRetry={() => go(() => setGameKey((k) => k + 1))}
            onNext={() => playLevel(levelIdx + 1)}
            onMenu={() => go(() => setScreen('select'))} />
        )}
        <Foreground />
        {modal === 'howto' && <HowTo onClose={() => { sfx.click(); setModal(null); }} />}
        {modal === 'ach' && <Achievements save={save} onClose={() => { sfx.click(); setModal(null); }} />}
        <Curtains open={curtainOpen}>
          {!started && (
            <button className="start-sign" onClick={begin}>
              <span className="sign-en">SUGAR STAGE</span>
              <span className="sign-ja">シュガー・ステージ</span>
              <span className="sign-cta">クリックして開演</span>
            </button>
          )}
        </Curtains>
        <Valance />
        <div className="toasts">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <Star on size={30} />
              <div><small>実績解除</small><b>{t.name}</b></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
