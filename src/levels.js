// お菓子の種類（オリジナルデザイン）
export const CANDIES = [
  { name: 'うずまきロリポップ', color: '#ff4d6d' },
  { name: 'ゴールドチョコバー', color: '#8a4c35' },
  { name: 'ふわふわ綿あめ', color: '#ff9ecf' },
  { name: 'ミントマカロン', color: '#4fd1b0' },
  { name: 'スターキャンディ', color: '#ffc21f' },
  { name: 'ハートボンボン', color: '#a05cf0' },
];

export const LEVELS = [
  {
    id: 1,
    act: '第一幕',
    name: '開演のベル',
    moves: 15,
    types: 5,
    goals: [{ kind: 'score', target: 6000 }],
    stars: [6000, 11000, 16000],
    intro: 'ようこそ劇場へ！まずは 6000点 をめざしてね♪',
  },
  {
    id: 2,
    act: '第二幕',
    name: 'わたあめの森',
    moves: 20,
    types: 5,
    goals: [
      { kind: 'collect', type: 2, count: 18 },
      { kind: 'collect', type: 0, count: 18 },
    ],
    stars: [7000, 12000, 17000],
    intro: '森のおやつを集めよう！綿あめとロリポップが必要だよ',
  },
  {
    id: 3,
    act: '第三幕',
    name: 'とろけるチョコの床',
    moves: 25,
    types: 5,
    goals: [{ kind: 'tiles' }],
    tiles: [
      '........',
      '..1111..',
      '.111111.',
      '.11..11.',
      '.11..11.',
      '.111111.',
      '..1111..',
      '........',
    ],
    stars: [9000, 15000, 21000],
    intro: '床のチョコをぜんぶ溶かして！上でお菓子をそろえると溶けるよ',
  },
  {
    id: 4,
    act: '第四幕',
    name: '星くずキャンディの嵐',
    moves: 25,
    types: 6,
    goals: [
      { kind: 'collect', type: 4, count: 18 },
      { kind: 'collect', type: 1, count: 18 },
    ],
    stars: [9000, 15000, 21000],
    intro: 'お菓子が6種類に！スペシャルを作って一気に集めよう',
  },
  {
    id: 5,
    act: 'フィナーレ',
    name: '夢の大劇場',
    moves: 30,
    types: 6,
    goals: [
      { kind: 'tiles' },
      { kind: 'collect', type: 5, count: 14 },
    ],
    tiles: [
      '........',
      '.1....1.',
      '..1111..',
      '..1221..',
      '..1221..',
      '..1111..',
      '.1....1.',
      '........',
    ],
    stars: [12000, 19000, 26000],
    intro: 'いよいよフィナーレ！分厚いチョコは2回で溶けるよ',
  },
];

export const ACHIEVEMENTS = [
  { id: 'firstWin', name: '初日の幕開け', desc: 'はじめてステージをクリア' },
  { id: 'combo5', name: '甘い大合唱', desc: '1手で5連鎖を達成' },
  { id: 'rainbow', name: 'にじいろの奇跡', desc: 'レインボードロップを作る' },
  { id: 'specialSwap', name: '夢の共演', desc: 'スペシャル同士を入れ替える' },
  { id: 'bigClear', name: 'スタンディングオベーション', desc: '1手で40個以上消す' },
  { id: 'melt50', name: 'ショコラティエ', desc: 'チョコの床を合計50枚溶かす' },
  { id: 'threeStars', name: '満員御礼', desc: 'どこかのステージで★3' },
  { id: 'allClear', name: 'グランドフィナーレ', desc: '全ステージをクリア' },
];

export const COMBO_WORDS = ['', '', 'スイート！', 'デリシャス！', 'ゴージャス！', 'ファンタスティック！', 'ショータイム！！'];
