// FBP1 structure room: text and the state each step puts the 3D scene in.
// Structural statements are measured from the crystal coordinates (see scripts/build-structure.mjs)
// or come from UniProt P09467 and the course report; inferences are marked as such.

export const TITLE = "FBP1 · 糖异生的关口";
export const SUBTITLE = "人肝果糖-1,6-二磷酸酶 · 同四聚体 · 晶体结构 7C9Q / 7CWE / 7CVH";

/** The 3D state before any step or beat changes it. rtOn: let AMP binding turn R into T. */
export const DEFAULT_STATE = { focus: -1, dock: false, rxn: false, amp: false, rtOn: false, mut: false, tail: false };

/**
 * Each step: a lecture page (`note`, long form, folded away by default) and beats (one short
 * sentence at a time, large on screen). `fine` is a smaller caveat line; {chain} is the examined
 * subunit letter. Beat fields: state (merged on), rxnTo (reaction clock mark, s), spots, measure, pulse.
 */
export const STEPS = [
  {
    id: "fold",
    say: "四条链，四个活性位点",
    state: { focus: -1 },
    beats: [
      { say: "四条相同的链，拼成一个同四聚体" },
      { say: "每条链 338 个氨基酸，各用一种颜色", fine: "晶体里每条链可见 312 个残基，57–71 位柔性环未解出" },
      { say: "每条链各有一个活性位点和一个 AMP 位点", pulse: "hot" },
      { say: "两个位点相距约 31.5 Å，各管一件事", measure: "siteAmp", fine: "活性位点管催化，AMP 位点管调节" },
    ],
    note: {
      kicker: "一 · 结构",
      title: "同四聚体：四条链各 338 个氨基酸",
      key: "每条链：一个活性位点，一个 AMP 位点",
      body: [
        "FBP1 编码的果糖1,6二磷酸酶1是肝脏及肾脏<em>糖异生</em>的重要胞质酶。图中是人肝酶晶体结构的 Cα 带状图：四个亚基各用一种颜色，螺旋、折叠和无规卷曲分别画成宽带、箭头和细线。",
        "四聚体是“二聚体的二聚体”，三条二重轴互相垂直。每个亚基自带一个催化位点（底物 F-1,6-BP 与 Mg²⁺）和一个别构 AMP 位点，两者在同一条链上相距约 <b>31.5 Å</b>（按本图坐标测得）。",
        "<p class='muted'>拖动旋转；点圆圈进入活性位点或 AMP 位点。虚线是晶体中看不到的 57–71 位柔性环；N 端 1–9 位也未画出。来源：7C9Q（AMP＋Mg²⁺）、7CWE（R 态）、7CVH（底物＋Mg²⁺）。</p>",
      ],
    },
  },
  {
    id: "site",
    say: "底物进入活性位点",
    state: { focus: 0, dock: true },
    beats: [
      { say: "镜头推进：这是 {chain} 链的活性位点", fine: "底物与 Mg²⁺ 取自 7CVH，叠合后放入，位置约准确到 1 Å" },
      { say: "底物 F-1,6-BP：C1 和 C6 各连一个磷酸", spots: [{ atom: "P1", text: "C1 磷酸" }, { atom: "P2", text: "C6 磷酸" }] },
      { say: "两个 Mg²⁺ 夹住磷酸，侧链用虚线固定它", spots: [{ mg: 0 }, { mg: 1 }], fine: "虚线：3.3 Å 内的极性原子对，取自晶体坐标" },
      { say: "要切断的是 C1 上的磷酸酯键", spots: [{ between: ["P1", "O1"], text: "C1–O–P" }] },
    ],
    note: {
      kicker: "二 · 活性位点",
      title: "F-1,6-BP 夹在两个 Mg²⁺ 之间",
      key: "F-1,6-BP + H₂O → F6P + Pi",
      body: [
        "镜头推进到 A 链的活性位点。底物 F-1,6-BP 是带两个磷酸基的呋喃果糖：C1 和 C6 各连一个磷酸。两个 Mg²⁺（绿球）与磷酸氧靠得很近，周围的 Asp、Glu、Tyr、Lys 等侧链用虚线表示氢键或金属配位（距离小于 3.3 Å 的极性原子对，取自晶体坐标）。",
        "FBP1 切断的是 <b>C1 上的磷酸酯键</b>，C6 磷酸保留在 F6P 上。",
        "<p class='muted'>底物与 Mg²⁺ 的坐标来自 7CVH，经催化域（残基 190–335）叠合后放入每个状态；位置准确到约 1 Å，仅用于说明空间关系。</p>",
      ],
    },
  },
  {
    id: "react",
    say: "水进攻磷，Pi 离开",
    state: { focus: 0, dock: true, rxn: true },
    beats: [
      { say: "水分子从背面靠近 C1 上的磷原子", rxnTo: 2.6, fine: "示意时间线，不是量子化学轨迹" },
      { say: "P–O1 键拉长、断开，质子落在 O1 上", rxnTo: 5.2 },
      { say: "Pi 带着水中的氧离开，F6P 留下", rxnTo: 9 },
      { say: "不可逆：糖异生靠这一步绕开 PFK-1", rxnTo: 9, fine: "F-1,6-BP + H₂O → F6P + Pi" },
    ],
    note: {
      kicker: "三 · 水解",
      title: "一个水分子，一个磷酸基",
      key: "F6P 留下，Pi 离开",
      body: [
        "水分子从离去基团 O1 的对侧靠近 C1 磷酸的磷原子；P–O1 键拉长、断开，质子落到 O1 上形成 F6P 的 C1–OH，无机磷酸（Pi）带着水中的氧离开活性位点。",
        "这一步不可逆，是糖异生绕开糖酵解 PFK-1 的那一步：<em>果糖1,6二磷酸 + H₂O → 果糖6磷酸 + Pi</em>。FBP1 缺陷时，乳酸、丙氨酸、甘油来的三碳单位都卡在这里。",
        "<p class='muted'>这是净反应的示意时间线，不是量子化学轨迹；质子转移的具体路径和 Mg²⁺ 的精确分工仍在研究中。点“水解”可重放。</p>",
      ],
    },
  },
  {
    id: "amp",
    say: "AMP 结合，四聚体转动",
    state: { focus: -1, amp: true },
    beats: [
      { say: "AMP 结合在远离活性位点的口袋里" },
      { say: "结合后，亚基相对转动：R 态变成 T 态", state: { rtOn: true }, fine: "R→T 是两个晶体构象之间的线性内插，不是真实轨迹" },
      { say: "T 态抑制酶活性：能量不足时糖异生减速" },
    ],
    note: {
      kicker: "四 · 别构调节",
      title: "AMP 结合后，酶从 R 态转到 T 态",
      key: "能量不足时抑制糖异生",
      body: [
        "AMP 是 FBP1 的别构抑制剂，结合在远离活性位点的口袋里（UniProt：AMP 结合残基包括 18–22、28–32、113–114、141）。<b>果糖2,6二磷酸</b>则与底物竞争活性位点。",
        "把无配体 R 态（7CWE）与 AMP 结合态（7C9Q）叠合，Cα 平均相差约 <b>3.5 Å</b>：亚基之间发生相对转动，柔性较大的环（B 因子高处）闪动最明显。图中 R→T 是两个晶体构象之间的线性内插，不是真实的转变轨迹。",
        "<p class='muted'>胰高血糖素使果糖2,6二磷酸降低、减少对 FBP1 的抑制，但<em>不能</em>修复缺陷的酶：病例中促糖异生信号增强而产糖不增加。</p>",
      ],
    },
  },
  {
    id: "mutation",
    say: "C 端被改写，在第 333 位终止",
    state: { focus: -1 },
    beats: [
      { say: "病例变异 c.960_961insG：321 位起移码", state: { tail: true } },
      { say: "321–332 被改写，333 位提前终止", state: { mut: true } },
      { say: "这段 C 端离活性位点最近约 20.7 Å", measure: "tailSite", fine: "也不在 AMP 位点附近" },
      { say: "它为何使酶失活，本例未测定", fine: "不能由图推断；需要酶活性或蛋白水平的证据" },
    ],
    note: {
      kicker: "五 · 病例变异",
      title: "c.960_961insG：Ser321 起移码",
      key: "p.Ser321Valfs*13",
      body: [
        "第7外显子插入一个 G 后，从第 321 位起读框整体错位：321–332 共 12 个残基被改写，第 333 位出现提前终止密码子，原来的 333–338 缺失。红色标出的正是这一段（晶体中 321–336 可见）。",
        "在本图坐标里，这段 C 端距离活性位点最近处约 <b>20.7 Å</b>，也不在 AMP 位点附近；它为什么会使酶失活（折叠失稳、四聚体装配受损或被降解）本例未测定，<em>不能由图推断</em>。",
        "<p class='muted'>推断：FBP1 共 7 个外显子，第 7 个是最后一个，终止密码子落在最后一个外显子的移码通常不触发 NMD，可能表达出被截短改写的蛋白；这需要酶活性或蛋白水平的证据。变异命名以检测报告为准。</p>",
      ],
    },
  },
];

export const LABELS = {
  chips: { substrate: "底物", react: "水解", amp: "AMP", mut: "突变", reset: "重置", back: "共同瓶颈" },
  hints: { substrate: "放入 F-1,6-BP", react: "播放水解", amp: "别构：R→T", mut: "321 位移码", reset: "回到全景", back: "回到糖异生全景（肝细胞）" },
  beat: { prev: "上一句", next: "下一句" },
  lecture: { open: "展开讲义", close: "收起讲义", hint: "讲义：这一步的完整文字" },
  site: "活性位点",
  ampSite: "AMP 位点",
  tail: "C 端 321→",
  subunit: "亚基",
  gap: "57–71 无序环（晶体中缺失）",
  helix: "螺旋",
  strand: "β 折叠",
  hover: (id, n) => `亚基 ${id} · 晶体中 ${n} 个残基`,
  hintDrag: "拖动旋转 · 点圆圈进入 · 空格或→下一句",
  r: "R 态",
  t: "T 态",
};
