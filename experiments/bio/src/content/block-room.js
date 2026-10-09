// "共同代谢阻断" room: report section 1 and figure 1, told at the report's depth.
// Wording follows the seminar report (FBP1缺陷与糖代谢紊乱研讨报告); numbers in the gauges are schematic,
// anchored on the case's single time point (blood glucose 3.2, lactate 2.5 mmol/L).

export const TITLE = "共同的瓶颈 · 糖异生卡在 FBP1";
export const SUBTITLE = "研讨报告 · 一 病例定位与共同代谢阻断（图 1）· 肝细胞胞质示意";

/** patient: FBP1 defective; fed: diet glucose arrives; stress: infection / vomiting; iv: IV glucose;
 * sugars: diet sugars brought in; spot: routes in the spotlight; nodes: molecules pointed at. */
export const DEFAULT_STATE = { patient: false, fed: true, stress: false, iv: false, sugars: [], spot: [], nodes: [] };

export const STEPS = [
  {
    id: "supply",
    say: "肝脏怎样维持血糖",
    state: { patient: false, fed: true, setGlycogen: 1 },
    beats: [
      { say: "肝细胞把葡萄糖送回血液，维持血糖", state: { nodes: ["glcOut"] } },
      { say: "进食时，膳食葡萄糖直接吸收入血", state: { spot: ["diet"] }, fine: "葡萄糖的吸收及其利用通路，本病都保留" },
      { say: "空腹时，先分解肝糖原：G1P → G6P → 葡萄糖", state: { fed: false, spot: ["glycogen"], nodes: ["g1p", "g6p"] } },
      { say: "同时启动糖异生：用乳酸、甘油和生糖氨基酸造糖", state: { spot: ["lactate", "alanine", "glycerol"] }, fine: "糖异生与脂肪动员在空腹早期已并行启动，并非糖原耗竭后才开始" },
    ],
    note: {
      kicker: "一 · 供糖",
      title: "血糖靠供给与利用的动态平衡",
      key: "三条供糖途径：吸收、糖原分解、糖异生",
      body: [
        "<b>肠道吸收</b>：食物中的糖经消化吸收入血。<b>肝糖原分解</b>：肝糖原经 G1P、G6P 形成游离葡萄糖，储量有限，禁食时逐渐不足。<b>糖异生</b>：以肝脏为主、肾皮质亦参与，利用乳酸、甘油和生糖氨基酸。",
        "餐后胰岛素促进摄糖与储存、抑制肝糖输出；空腹时胰高血糖素促进肝糖原分解和糖异生。",
        "<p class='muted'>图中分子是碳流的示意，数量和速度不代表真实通量；通路省略了部分中间步骤。</p>",
      ],
    },
  },
  {
    id: "route",
    say: "各条糖异生路线汇到同一处",
    state: { patient: false, fed: false },
    beats: [
      { say: "乳酸、丙氨酸先变成丙酮酸，再经线粒体转成 PEP", state: { spot: ["lactate", "alanine"], nodes: ["pyr", "oaa", "pep"] }, fine: "经多步反应，部分在线粒体内进行" },
      { say: "甘油经甘油-3-磷酸变成磷酸二羟丙酮", state: { spot: ["glycerol"], nodes: ["g3p", "tri"] } },
      { say: "两个磷酸丙糖合成果糖-1,6-二磷酸", state: { spot: ["lactate", "alanine", "glycerol"], nodes: ["tri", "f16bp"] }, fine: "DHAP：磷酸二羟丙酮；GAP：甘油醛-3-磷酸" },
      { say: "FBP1 把它水解为果糖-6-磷酸，再到葡萄糖", state: { spot: ["lactate", "alanine", "glycerol"], nodes: ["f16bp", "f6p", "g6p"] }, pulse: "fbp1", fine: "果糖-1,6-二磷酸 + H₂O → 果糖-6-磷酸 + Pi" },
    ],
    note: {
      kicker: "二 · 共同出口",
      title: "多种底物都要经过 FBP1",
      key: "F-1,6-BP → F6P 是共同的必经步骤",
      body: [
        "乳酸经乳酸脱氢酶转为丙酮酸，参与 Cori 循环；肌肉输出的丙氨酸经转氨形成丙酮酸，汇入同一路径（葡萄糖—丙氨酸循环）。甘油经甘油-3-磷酸和 DHAP 进入。",
        "这些三碳单位形成果糖-1,6-二磷酸后，由 FBP1 催化水解生成果糖-6-磷酸和无机磷酸。FBP1 与糖酵解中的磷酸果糖激酶 1 共同构成受不同调节的两条反应方向。",
        "<p class='muted'>FBP1 编码的果糖-1,6-二磷酸酶 1 是肝脏及肾脏糖异生的重要胞质酶。[3,4]</p>",
      ],
    },
  },
  {
    id: "block",
    say: "患儿的 FBP1 受阻",
    state: { patient: true, fed: false },
    beats: [
      { say: "患儿的 FBP1 变异：c.960_961insG", state: { nodes: ["f16bp"] }, pulse: "fbp1", fine: "第 321 位起移码，第 333 位提前终止" },
      { say: "果糖-1,6-二磷酸堆在瓶颈前，下游得不到补充", state: { nodes: ["f16bp", "f6p"] } },
      { say: "乳酸、丙氨酸、甘油都卡在同一步", state: { spot: ["lactate", "alanine", "glycerol"] } },
      { say: "受阻的碳流回丙酮酸和乳酸池：血乳酸升高", state: { spot: ["spill"], nodes: ["lacOut"] }, fine: "本例乳酸 2.5 mmol/L，只能直接证明轻度高乳酸血症" },
    ],
    note: {
      kicker: "三 · 阻断",
      title: "一个瓶颈，卡住几条路线",
      key: "乳酸转为血糖的净通量下降",
      body: [
        "FBP1 受损使乳酸的回收路径在下游受阻；丙氨酸、甘油也汇入同一瓶颈。受阻之前的碳骨架可沿糖酵解方向进入丙酮酸和乳酸池。",
        "外周持续生成乳酸、糖异生再利用下降，共同促成乳酸积聚；感染发热和抽搐还可能增加乳酸负荷。",
        "<p class='muted'>基因线索与 Kikawa 等（1997）报道的第 7 外显子 960/961insG 变异吻合（ClinVar：p.Ser321Valfs*13）。确诊需结合双等位基因致病变异，必要时补充酶活性证据。[13,14]</p>",
      ],
    },
  },
  {
    id: "bypass",
    say: "哪些糖能绕过瓶颈",
    state: { patient: true, fed: false, setGlycogen: 0.8 },
    beats: [
      { say: "肝糖原经 G1P 进入，在瓶颈之后", state: { spot: ["glycogen"], nodes: ["g1p"] }, fine: "所以 FBP1 缺陷仍保留肝糖原供糖的主干" },
      { say: "乳糖中的半乳糖经 G1P 进入，同样绕过", state: { sugars: ["galactose"], spot: ["galactose"], nodes: ["gal1p", "g1p"] }, fine: "以乳糖酶和半乳糖代谢正常为前提" },
      { say: "甘露糖经 M6P 变成果糖-6-磷酸，也绕过 FBP1", state: { sugars: ["galactose", "mannose"], spot: ["mannose"], nodes: ["m6p", "f6p"] }, fine: "路径可行，不等于推荐大剂量补充" },
      { say: "果糖在肝内变成 DHAP，必须经过瓶颈", state: { sugars: ["galactose", "mannose", "fructose"], spot: ["fructose"], nodes: ["f1p", "tri"] }, fine: "蔗糖含一个果糖单位，同样需要限制" },
    ],
    note: {
      kicker: "四 · 入口",
      title: "看糖从哪里进入通路",
      key: "入口在瓶颈之后才能绕过",
      body: [
        "乳糖中的半乳糖经半乳糖-1-磷酸、UDP 糖反应形成葡萄糖-1-磷酸，继而转为 G6P；甘露糖由己糖激酶生成 M6P，再由磷酸甘露糖异构酶转为果糖-6-磷酸。二者都在阻断后的中间产物水平进入。",
        "果糖在肝内经果糖-1-磷酸生成 DHAP 与甘油醛，后者可转为 GAP；重新形成葡萄糖需要 FBP1，较大负荷可加重代谢失代偿。",
        "<p class='muted'>甘露糖是 mannose，甘露醇是 mannitol，二者不同。稳定期果糖和蔗糖的允许量应个体化制定。[5,7,8]</p>",
      ],
    },
  },
  {
    id: "crisis",
    say: "感染、禁食时为何反复发作",
    state: { patient: true, fed: false, setGlycogen: 1 },
    beats: [
      { say: "感染、呕吐、拒食：外源葡萄糖减少", state: { stress: true } },
      { say: "能量消耗增加，肝糖原被很快用完", state: { spot: ["glycogen"] } },
      { say: "供糖只能靠糖异生，而它被卡住：血糖下降", state: { spot: ["lactate", "alanine", "glycerol"], nodes: ["f16bp"] }, fine: "本例血糖 3.2 mmol/L；单一时点不足以独立解释抽搐" },
      { say: "静脉葡萄糖直接入血，绕过 FBP1", state: { iv: true, spot: ["iv"] }, fine: "补糖改变燃料供需，并未修复 FBP1 缺陷" },
    ],
    note: {
      kicker: "五 · 危象",
      title: "进食正常时缓解，感染时反复发作",
      key: "糖原趋于耗竭后，FBP1 缺陷才显现",
      body: [
        "患儿仍可吸收和利用膳食葡萄糖，肝糖原分解的主干通路也能暂时供糖。感染使能量消耗增加，呕吐和拒食减少糖的摄入，肝糖原因而较快消耗；供糖越来越依赖糖异生，FBP1 缺陷因而显现。",
        "静脉葡萄糖直接入血，绕过 FBP1 满足组织供能，降低对内源糖异生的依赖；随血糖恢复，脂解和肝生酮随之下降。",
        "<p class='muted'>图中血糖、乳酸读数是示意模型，只在病例时点对齐 3.2 与 2.5 mmol/L；题干缺少连续化验，不能认定各项异常均由补糖单独纠正。[2,5,12]</p>",
      ],
    },
  },
];

/** Names and one-line roles shown when a molecule is pointed at. */
export const NODE_INFO = {
  glcOut: ["葡萄糖", "经 GLUT2 出肝入血"],
  glc: ["葡萄糖", "内质网中由 G6P 酶生成"],
  g6p: ["葡萄糖-6-磷酸", "G6P 酶去磷酸化为葡萄糖"],
  g1p: ["葡萄糖-1-磷酸", "糖原和半乳糖由此进入"],
  gn: ["肝糖原", "储量有限，禁食时逐渐耗尽"],
  galIn: ["半乳糖", "来自乳糖"],
  gal: ["半乳糖", "经 Leloir 途径进入"],
  gal1p: ["半乳糖-1-磷酸", "经 UDP 糖反应转为 G1P"],
  f6p: ["果糖-6-磷酸", "FBP1 的产物"],
  manIn: ["甘露糖", "mannose，不是甘露醇"],
  man: ["甘露糖", "己糖激酶生成 M6P"],
  m6p: ["甘露糖-6-磷酸", "磷酸甘露糖异构酶转为 F6P"],
  f16bp: ["果糖-1,6-二磷酸", "FBP1 的底物：瓶颈所在"],
  tri: ["磷酸丙糖", "DHAP / GAP，两个合成 F-1,6-BP"],
  fruIn: ["果糖", "蔗糖中也有一个果糖单位"],
  fru: ["果糖", "肝内经果糖-1-磷酸代谢"],
  f1p: ["果糖-1-磷酸", "裂解为 DHAP 与甘油醛"],
  glyIn: ["甘油", "脂肪组织水解甘油三酯释放"],
  gly: ["甘油", "磷酸化为甘油-3-磷酸"],
  g3p: ["甘油-3-磷酸", "氧化为 DHAP"],
  lacIn: ["乳酸", "来自红细胞和肌肉"],
  lac: ["乳酸", "乳酸脱氢酶转为丙酮酸"],
  lacOut: ["乳酸", "受阻时回流入血：血乳酸升高"],
  alaIn: ["丙氨酸", "肌肉输出的生糖氨基酸"],
  ala: ["丙氨酸", "转氨形成丙酮酸"],
  pyr: ["丙酮酸", "乳酸和丙氨酸在此汇合"],
  oaa: ["草酰乙酸", "线粒体内由丙酮酸羧化生成"],
  pep: ["磷酸烯醇式丙酮酸", "PEP，经多步反应到磷酸丙糖"],
};

/** Shorter tags written next to the molecules on the page. */
export const NODE_TAG = {
  glcOut: "葡萄糖 → 血",
  glc: "葡萄糖",
  g6p: "G6P",
  g1p: "G1P",
  gn: "肝糖原",
  gal: "半乳糖",
  gal1p: "Gal-1-P",
  f6p: "果糖-6-磷酸",
  man: "甘露糖",
  m6p: "M6P",
  f16bp: "果糖-1,6-二磷酸",
  tri: "DHAP / GAP",
  fru: "果糖",
  f1p: "F1P",
  gly: "甘油",
  g3p: "甘油-3-磷酸",
  lac: "乳酸",
  lacOut: "乳酸 → 血",
  ala: "丙氨酸",
  pyr: "丙酮酸",
  oaa: "草酰乙酸",
  pep: "PEP",
};

export const LABELS = {
  chips: { patient: "FBP1 缺陷", fast: "禁食·感染", iv: "静脉葡萄糖", reset: "重置", deep: "看结构 →" },
  hints: { patient: "切换正常肝 / 患儿", fast: "切换进食 / 禁食感染", iv: "静脉补糖", reset: "回到第一步", deep: "打开 FBP1 晶体结构室" },
  lecture: { open: "展开讲义", close: "收起讲义", hint: "讲义：这一步的完整文字" },
  hint: "指向分子看名字 · 点放大镜看特写 · 空格或→下一句",
  fbp1: "FBP1",
  fbp1Hint: "FBP1 四聚体（晶体结构 7C9Q）· 点击看特写",
  blocked: "受阻",
  blood: "血液",
  portal: "门静脉血",
  cell: "肝细胞胞质",
  mito: "线粒体",
  er: "内质网",
  gauge: { glucose: "血糖", lactate: "血乳酸", unit: "mmol/L", note: "示意读数，病例时点 3.2 / 2.5" },
  blood_diet: "膳食葡萄糖",
  blood_iv: "静脉葡萄糖",
};

/**
 * Click-in close-ups. `at` is the ring on the page, `focus` the camera target, `zoom` the camera
 * scale. Each line owns one animation phase (dur, s). sayPatient/finePatient replace the line
 * while the patient's FBP1 is shown. Depth: the textbook steps behind the report's "经多步反应".
 */
export const CLOSEUPS = [
  {
    id: "mito",
    label: "线粒体：丙酮酸 → PEP",
    at: [392, 664],
    focus: [392, 650],
    zoom: 2.2,
    lines: [
      { say: "丙酮酸进入线粒体", dur: 2.6 },
      { say: "加上一个 CO₂，羧化成草酰乙酸", fine: "丙酮酸羧化酶催化，消耗 ATP", dur: 3.4 },
      { say: "再脱去 CO₂、加上磷酸，成为 PEP", fine: "PEPCK 催化，消耗 GTP；线粒体与胞质间的穿梭从略", dur: 3.6 },
    ],
  },
  {
    id: "triose",
    label: "两个三碳合成六碳",
    at: [402, 534],
    focus: [430, 540],
    zoom: 2.3,
    lines: [
      { say: "DHAP 和 GAP：两个三碳的磷酸丙糖", dur: 2.6 },
      { say: "醛缩酶把它们连成一个六碳分子", fine: "这一步可逆；糖酵解中方向相反", dur: 3.2 },
      { say: "生成果糖-1,6-二磷酸，送往 FBP1", dur: 2.8 },
    ],
  },
  {
    id: "fbp1",
    label: "FBP1：水解一个磷酸",
    at: [514, 352],
    focus: [430, 380],
    zoom: 2.1,
    deep: true,
    lines: [
      { say: "果糖-1,6-二磷酸进入 FBP1 的活性位点", dur: 2.8 },
      { say: "水分子进攻，C1 上的磷酸离开成为 Pi", fine: "两个 Mg²⁺ 参与；原子细节见晶体结构室", sayPatient: "患儿：酶失去功能，这一步几乎不发生", finePatient: "移码改写 C 端，第 333 位提前终止", dur: 3.4 },
      { say: "果糖-6-磷酸离开，继续走向葡萄糖", sayPatient: "底物堆在瓶颈前，碳流回丙酮酸和乳酸", dur: 3 },
    ],
  },
  {
    id: "er",
    label: "内质网：葡萄糖出肝",
    at: [330, 202],
    focus: [250, 190],
    zoom: 2.2,
    lines: [
      { say: "葡萄糖-6-磷酸进入内质网", dur: 2.8 },
      { say: "葡萄糖-6-磷酸酶切去磷酸", fine: "肌肉缺乏此酶，肌糖原不能直接补充血糖", dur: 3.2 },
      { say: "葡萄糖经 GLUT2 出肝，进入血液", dur: 3 },
    ],
  },
  {
    id: "fructose",
    label: "果糖：裂成两个三碳",
    at: [680, 548],
    focus: [650, 560],
    zoom: 2.2,
    lines: [
      { say: "果糖进入肝细胞，先变成果糖-1-磷酸", fine: "果糖激酶催化，消耗 ATP", dur: 3 },
      { say: "醛缩酶 B 把它裂解为 DHAP 和甘油醛", fine: "遗传性果糖不耐受（ALDOB 缺陷）卡在这一步，与 FBP1 缺乏不同", dur: 3.4 },
      { say: "这些三碳要经过 FBP1 才能变回葡萄糖", fine: "所以果糖、蔗糖需要限制", dur: 3 },
    ],
  },
];

export const CLOSEUP_LABELS = {
  back: "返回全景",
  replay: "再看一遍",
  next: "下一个特写",
  deep: "看晶体结构",
  ring: "点击看特写",
  keys: "空格或→下一句 · ←上一句 · Esc 返回全景",
  title: "特写",
  hints: { back: "退出特写（Esc）", replay: "从头播放这个特写", next: "去下一个特写", deep: "打开 FBP1 晶体结构室" },
};
