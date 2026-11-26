// ===== シュガー・ステージ ゲームエンジン（純粋関数中心） =====
export const SIZE = 8;

let _id = 1;
export const makeCandy = (type, special = null, fall = 0, delay = 0) => ({ id: _id++, type, special, fall, delay });
export const key = (r, c) => r * SIZE + c;
export const rc = (k) => [Math.floor(k / SIZE), k % SIZE];
export const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
const rand = (n) => Math.floor(Math.random() * n);

export const same = (a, b) =>
  !!a && !!b && a.special !== 'rainbow' && b.special !== 'rainbow' && a.type === b.type;

export const cloneGrid = (g) => g.map((row) => row.slice());

export const adjacent = (k1, k2) => {
  const [r1, c1] = rc(k1);
  const [r2, c2] = rc(k2);
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
};

// 初期盤面：最初から揃っていない＆必ず手がある
export function createBoard(nTypes, intro = true) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const g = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) {
        let t;
        do {
          t = rand(nTypes);
        } while (
          (c >= 2 && row[c - 1].type === t && row[c - 2].type === t) ||
          (r >= 2 && g[r - 1][c].type === t && g[r - 2][c].type === t)
        );
        row.push(makeCandy(t, null, intro ? SIZE + 1 : 0, intro ? c * 0.035 + (SIZE - r) * 0.045 : 0));
      }
      g.push(row);
    }
    if (findMove(g)) return g;
  }
  throw new Error('board generation failed');
}

export function findRuns(g) {
  const runs = [];
  for (let r = 0; r < SIZE; r++) {
    let c = 0;
    while (c < SIZE) {
      let e = c + 1;
      while (e < SIZE && same(g[r][c], g[r][e])) e++;
      if (e - c >= 3) {
        const cells = [];
        for (let x = c; x < e; x++) cells.push(key(r, x));
        runs.push({ dir: 'h', cells });
      }
      c = e;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let r = 0;
    while (r < SIZE) {
      let e = r + 1;
      while (e < SIZE && same(g[r][c], g[e][c])) e++;
      if (e - r >= 3) {
        const cells = [];
        for (let y = r; y < e; y++) cells.push(key(y, c));
        runs.push({ dir: 'v', cells });
      }
      r = e;
    }
  }
  return runs;
}

// 交差する列をまとめ、スペシャル生成を決める
export function findGroups(g, preferred = []) {
  const runs = findRuns(g);
  let groups = [];
  for (const run of runs) {
    const hits = groups.filter((gr) => run.cells.some((k) => gr.keys.has(k)));
    let target;
    if (!hits.length) {
      target = { keys: new Set(), runs: [] };
      groups.push(target);
    } else {
      target = hits[0];
      for (const h of hits.slice(1)) {
        h.keys.forEach((k) => target.keys.add(k));
        target.runs.push(...h.runs);
      }
      groups = groups.filter((gr) => !hits.slice(1).includes(gr));
    }
    run.cells.forEach((k) => target.keys.add(k));
    target.runs.push(run);
  }

  return groups.map((gr) => {
    const cells = [...gr.keys];
    const longest = gr.runs.reduce((a, b) => (b.cells.length > a.cells.length ? b : a));
    const hasH = gr.runs.some((r) => r.dir === 'h');
    const hasV = gr.runs.some((r) => r.dir === 'v');
    let special = null;
    if (longest.cells.length >= 5) special = 'rainbow';
    else if (hasH && hasV) special = 'bomb';
    else if (longest.cells.length === 4) special = longest.dir === 'h' ? 'v' : 'h';

    let at = null;
    if (special) {
      const free = cells.filter((k) => {
        const [r, c] = rc(k);
        return !g[r][c].special;
      });
      const pref = preferred.filter((k) => free.includes(k));
      if (pref.length) at = pref[0];
      else if (special === 'bomb') {
        const hKeys = new Set(gr.runs.filter((r) => r.dir === 'h').flatMap((r) => r.cells));
        at = gr.runs.filter((r) => r.dir === 'v').flatMap((r) => r.cells).find((k) => hKeys.has(k) && free.includes(k)) ?? null;
      }
      if (at == null) {
        const mid = longest.cells[Math.floor(longest.cells.length / 2)];
        at = free.includes(mid) ? mid : free[0] ?? null;
      }
    }
    const [r0, c0] = rc(cells[0]);
    return { cells, type: g[r0][c0].type, special: at != null ? special : null, at };
  });
}

export function mostCommonType(g) {
  const count = {};
  g.forEach((row) => row.forEach((cell) => {
    if (cell && cell.special !== 'rainbow') count[cell.type] = (count[cell.type] || 0) + 1;
  }));
  let best = 0, bestN = -1;
  Object.entries(count).forEach(([t, n]) => { if (n > bestN) { best = +t; bestN = n; } });
  return best;
}

// 消去セルを特殊効果の連鎖込みで展開する
export function expandClears(g, initial, opts = {}) {
  const protect = opts.protect || new Set();
  const noActivate = opts.noActivate || new Set();
  const rainbowTypes = opts.rainbowTypes || new Map();
  const clear = new Set();
  const effects = [];
  const queue = [...initial];
  const push = (r, c) => { if (inBounds(r, c)) queue.push(key(r, c)); };

  while (queue.length) {
    const k = queue.shift();
    if (clear.has(k) || protect.has(k)) continue;
    const [r, c] = rc(k);
    const cell = g[r][c];
    if (!cell) continue;
    clear.add(k);
    if (!cell.special || noActivate.has(k)) continue;

    switch (cell.special) {
      case 'h':
        for (let x = 0; x < SIZE; x++) push(r, x);
        effects.push({ kind: 'lineH', r, c });
        break;
      case 'v':
        for (let y = 0; y < SIZE; y++) push(y, c);
        effects.push({ kind: 'lineV', r, c });
        break;
      case 'cross':
        for (let i = 0; i < SIZE; i++) { push(r, i); push(i, c); }
        effects.push({ kind: 'lineH', r, c }, { kind: 'lineV', r, c });
        break;
      case 'bigcross':
        for (let d = -1; d <= 1; d++) {
          for (let i = 0; i < SIZE; i++) { push(r + d, i); push(i, c + d); }
          if (inBounds(r + d, 0)) effects.push({ kind: 'lineH', r: r + d, c });
          if (inBounds(0, c + d)) effects.push({ kind: 'lineV', r, c: c + d });
        }
        break;
      case 'bomb':
      case 'bomb2': {
        const rad = cell.special === 'bomb' ? 1 : 2;
        for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) push(r + dr, c + dc);
        effects.push({ kind: 'bomb', r, c, radius: rad });
        break;
      }
      case 'rainbow': {
        const t = rainbowTypes.has(k) ? rainbowTypes.get(k) : mostCommonType(g);
        const targets = [];
        for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
          const o = g[y][x];
          if (o && o.special !== 'rainbow' && o.type === t) { targets.push(key(y, x)); queue.push(key(y, x)); }
        }
        effects.push({ kind: 'rainbow', r, c, targets });
        break;
      }
      default:
        break;
    }
  }
  return { clear, effects };
}

function hasMatchAt(g, r, c) {
  const cell = g[r][c];
  let n = 1;
  for (let x = c - 1; x >= 0 && same(g[r][x], cell); x--) n++;
  for (let x = c + 1; x < SIZE && same(g[r][x], cell); x++) n++;
  if (n >= 3) return true;
  n = 1;
  for (let y = r - 1; y >= 0 && same(g[y][c], cell); y--) n++;
  for (let y = r + 1; y < SIZE && same(g[y][c], cell); y++) n++;
  return n >= 3;
}

// 有効な入れ替えを1つ返す（ヒント用）
export function findMove(g) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const r2 = r + dr, c2 = c + dc;
      if (!inBounds(r2, c2)) continue;
      const a = g[r][c], b = g[r2][c2];
      const pair = [key(r, c), key(r2, c2)];
      if (a.special === 'rainbow' || b.special === 'rainbow' || (a.special && b.special)) { moves.push(pair); continue; }
      const t = cloneGrid(g);
      t[r][c] = b; t[r2][c2] = a;
      if (hasMatchAt(t, r, c) || hasMatchAt(t, r2, c2)) moves.push(pair);
    }
  }
  return moves.length ? moves[rand(moves.length)] : null;
}

// 落下と補充。新しいお菓子は上から落ちてくる
export function applyGravity(g, nTypes) {
  const ng = cloneGrid(g);
  for (let c = 0; c < SIZE; c++) {
    let write = SIZE - 1;
    for (let r = SIZE - 1; r >= 0; r--) {
      if (ng[r][c]) {
        const cell = ng[r][c];
        ng[r][c] = null;
        ng[write][c] = cell;
        write--;
      }
    }
    const n = write + 1;
    for (let r = write; r >= 0; r--) ng[r][c] = makeCandy(rand(nTypes), null, n, (write - r) * 0.02);
  }
  return ng;
}

// 手詰まり時のシャッフル（同じidのまま移動するのでアニメーションする）
export function shuffleBoard(g) {
  const cells = g.flat();
  for (let attempt = 0; attempt < 300; attempt++) {
    for (let i = cells.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    const ng = [];
    for (let r = 0; r < SIZE; r++) ng.push(cells.slice(r * SIZE, r * SIZE + SIZE).map((c) => ({ ...c, fall: 0 })));
    if (!findRuns(ng).length && findMove(ng)) return ng;
  }
  return g;
}

export function parseTiles(pattern) {
  if (!pattern) return null;
  return pattern.map((row) => row.split('').map((ch) => (ch === '.' ? 0 : +ch)));
}
