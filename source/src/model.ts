import { youtubeId } from "./youtube.ts";
export type Media = {
  id: string;
  url: string;
  title: string;
  description: string;
};
export type Question = { expression: string; answer: number; hint: string };
export type Config = {
  personal: {
    name: string;
    senderName?: string;
    dedication: string;
    notes: string[];
    gamesEnabled?: boolean;
  };
  music: { url: string; title: string; cover: string; youtubeUrl?: string };
  egg: { keyword: string; text: string; sound: string };
  colors: { name: string; hex: string }[];
  growth: { blessing: string; seconds: number; dress: string };
  puzzle: { url: string; allowed: number[]; message: string };
  math: Question[];
  memories: Media[];
  sky: string;
  chats: Media[];
  letter: {
    title: string;
    body: string;
    image: string;
    font: string;
    envelope: string;
  };
  birthday: { segments: Media[]; message: string };
};
export type Progress = {
  completed: number[];
  results: Record<string, unknown>;
  updatedAt: string;
};
export const names = [
  "开启音乐",
  "三个心情词语",
  "今晚的三个颜色",
  "慢慢长大的你",
  "拼起一段回忆",
  "藏在数字里的祝福",
  "我们的回忆相册",
  "交换一片天空",
  "故事的第一句话",
  "一封只属于你的信",
  "十九岁的生日愿望",
];
export const subtitles = [
  "让旋律，陪你走进今晚",
  "把此刻的心情，寄给星星",
  "为今夜，染上你的颜色",
  "每一岁的你，都值得被爱",
  "把散落的时光，重新拼好",
  "兜兜转转，答案一直是你",
  "有些瞬间，想和你再看一遍",
  "在不同的地方，看同一片天",
  "还记得，我们是怎样开始的吗",
  "有些话，想慢慢说给你听",
  "把愿望交给星空",
];
export const defaults: Config = {
  personal: {
    name: "毛艺蓉",
    senderName: "李雨桐",
    dedication: "生日是一个好理由，把平时没说够的在意，认真说给你听。",
    notes: [
      "毛艺蓉，这片星空有你的名字，也有我认真准备的心意。",
      "你随口说的小事，也值得被认真听见。",
      "今天可以把“要懂事”放一放，好好做一个被偏爱的小朋友。",
      "愿你每次分享快乐，都有人笑着接住。",
      "不开心的时候，来这里领一个抱抱。慢一点也没关系。",
      "你有自己的节奏，花和星星都不用赶路。",
      "十九岁的愿望，可以很大，也可以只是今天吃到喜欢的甜点。",
      "愿你被温柔对待，也有说“不”的底气。",
      "你认真生活的样子，本身就闪着光。",
      "愿你每次抬头，都能找到一颗站在你这边的星星。",
      "你喜欢的颜色、旋律和小小的心愿，都值得拥有专属的位置。",
      "毛艺蓉，你的感受很重要。开心和难过，都可以好好说。",
      "愿你的每一个“我想试试”，都能得到一点勇气和很多支持。",
      "累了就停靠一下，这里一直给你留着一片柔软的天空。",
      "希望你喜欢自己，也常常感到：有人很喜欢这样的你。",
      "愿普通的日子里，也有突然收到的小惊喜。",
      "成长可以慢慢来，你的每一岁都值得被珍惜。",
      "愿你永远保有可爱的小任性，也拥有奔向自由的力量。",
      "十九岁快乐，毛艺蓉。愿幸福一件接一件，轻轻落在你的生活里。",
    ],
  },
  music: { url: "", title: "属于今晚的旋律", cover: "" },
  egg: {
    keyword: "幸福",
    text: "愿幸福不只是此刻，而是往后的每一天。",
    sound: "",
  },
  colors: [
    { name: "星云紫", hex: "#aa9bd8" },
    { name: "月光白", hex: "#eee5d5" },
    { name: "暮色蓝", hex: "#829dbf" },
    { name: "玫瑰粉", hex: "#d8a8b9" },
    { name: "流星金", hex: "#dabd83" },
    { name: "薄荷绿", hex: "#93b9ac" },
  ],
  growth: { blessing: "你成为了1岁的大人", seconds: 24, dress: "#b29ad5" },
  puzzle: {
    url: "",
    allowed: [9, 16, 25, 36],
    message: "散落的回忆，终于又完整了。",
  },
  math: [
    {
      expression: "7 + 8 - 3",
      answer: 12,
      hint: "先把 7 和 8 相加，再减去 3。",
    },
    {
      expression: "{prev} + 23 - 8",
      answer: 27,
      hint: "把上一题的答案带进来，先加 23，再减 8。",
    },
    {
      expression: "{prev} - 19 + 11 - 11",
      answer: 8,
      hint: "慢慢来，依次加减就好。",
    },
    {
      expression: "{prev} + 26 - 7 + 5 - 13",
      answer: 19,
      hint: "先加26，减7，加5，再减13。最后的答案在等你。",
    },
  ],
  memories: [],
  sky: "",
  chats: [],
  letter: {
    title: "给毛艺蓉的一封偏爱",
    body: "亲爱的毛艺蓉：\n\n生日快乐。\n\n做这份礼物的时候，我想了很多种方式，想把‘你很重要’这句话，说得再认真一点。最后，我替你藏了十一颗星星。\n\n你可以慢慢点开，也可以在喜欢的地方多停留一会儿。这里的每一个小小的安排，都是想让你在某个瞬间觉得：原来，有人把我放在心上。\n\n十九岁，愿你拥有仰望星空的勇气，也拥有把日子过成喜欢模样的自由。愿你遇到开心的事，有人听你分享；觉得疲惫的时候，有一处能安心停靠。\n\n毛艺蓉，你的感受值得被认真听见，你的小小心愿也值得被珍藏。希望这片星空可以陪你记住：你值得温柔，也值得幸福。\n\n新的故事才刚刚开始。\n愿你一路有光，心里有爱。\n\n来自那个认真为你准备了这份礼物的人",
    image: "",
    font: "serif",
    envelope: "#b9a0b8",
  },
  birthday: { segments: [], message: "祝你19岁生日快乐！" },
};
export const emptyProgress: Progress = {
  completed: [],
  results: {},
  updatedAt: "",
};
export function normalize(s: string) {
  return s.normalize("NFKC").replace(/[\p{P}\p{Z}\s]/gu, "");
}
export function calculate(expression: string, previous = 0) {
  const s = expression
    .replaceAll("{prev}", String(previous))
    .replace(/\s/g, "");
  if (!/^[+-]?\d+(?:[+-]\d+)*$/.test(s))
    throw new Error("题目仅支持整数加减和 {prev}");
  return (s.match(/[+-]?\d+/g) || []).reduce((a, b) => a + Number(b), 0);
}
export function validateConfig(c: Config) {
  if (c.music.youtubeUrl && !youtubeId(c.music.youtubeUrl))
    throw Error("MV地址必须为有效的YouTube HTTPS视频链接");
  if (!c.personal?.name?.trim() || c.personal.name.length > 40)
    throw Error("请填写礼物主人的名字（40字以内）");
  if (
    !c.personal.notes.length ||
    c.personal.notes.some((n) => !n.trim() || n.length > 400) ||
    c.personal.notes.length > 100
  )
    throw Error("请填写1–100张非空的偏爱纸条，每张400字以内");
  if (
    c.colors.length < 3 ||
    c.colors.some((x) => !/^#[0-9a-f]{6}$/i.test(x.hex) || !x.name)
  )
    throw Error("至少配置三种有效颜色");
  if (
    new Set(c.colors.map((x) => x.hex.toLowerCase())).size !== c.colors.length
  )
    throw Error("颜色不能重复");
  if (!c.egg.keyword.trim()) throw Error("彩蛋关键词不能为空");
  if (
    !c.puzzle.allowed.length ||
    c.puzzle.allowed.some((n) => !Number.isInteger(n) || n < 4 || n > 144)
  )
    throw Error("拼图数量须为 4–144 的整数");
  if (c.growth.seconds < 6 || c.growth.seconds > 120)
    throw Error("成长动画时长须为 6–120 秒");
  if (!c.math.length) throw Error("至少一道数学题");
  let result = 0;
  c.math.forEach((q, i) => {
    result = calculate(q.expression, result);
    if (result !== q.answer) throw Error(`第 ${i + 1} 题答案应为 ${result}`);
  });
  if (result !== 19) throw Error("最后一题结果必须为 19");
  const urls = [
    c.music.url,
    c.music.cover,
    c.egg.sound,
    c.puzzle.url,
    c.sky,
    c.letter.image,
    ...c.memories.map((x) => x.url),
    ...c.chats.map((x) => x.url),
    ...c.birthday.segments.map((x) => x.url),
  ];
  if (urls.some((u) => u && !/^https:\/\//.test(u)))
    throw Error("媒体地址必须为 HTTPS 云端地址");
  if ([...c.memories, ...c.chats, ...c.birthday.segments].some((x) => !x.url))
    throw Error("请上传媒体或移除空白项目");
  if (!["serif", "sans-serif", "cursive"].includes(c.letter.font))
    throw Error("请选择支持的字体");
  if (
    !/^#[0-9a-f]{6}$/i.test(c.growth.dress) ||
    !/^#[0-9a-f]{6}$/i.test(c.letter.envelope)
  )
    throw Error("服装和信封需使用十六进制颜色");
}
export function gridSize(n: number) {
  let rows = Math.floor(Math.sqrt(n));
  while (n % rows !== 0) rows--;
  return { rows, cols: n / rows };
}
export function shuffle(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}
