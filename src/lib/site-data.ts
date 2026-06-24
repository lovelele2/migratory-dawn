export const primaryNav = [
  { href: "/", label: "日出" },
  { href: "/globe", label: "地球仪" },
  { href: "/write", label: "写信" },
  { href: "/inbox", label: "收件箱" },
] as const;

export const sunriseSource = {
  label: "精选真实日出",
  status: "在 Windy 选片接入前启用演示回退",
  place: "新西兰 奥克兰",
  time: "06:13 当地时间",
  attribution: "精选日出影像，演示安全占位",
  birdStatus: "鸟正在日出边缘盘旋，等待取件。",
};

export const cameraReviews = [
  {
    location: "澳大利亚 霍巴特",
    label: "直播",
    score: "87",
    freshness: "2 分钟前",
    decision: "保留",
    note: "直播播放器，清晨地平线清晰。",
  },
  {
    location: "新西兰 基督城",
    label: "今日延时",
    score: "74",
    freshness: "4 分钟前",
    decision: "备用",
    note: "晨光很好，直播失效时可回退。",
  },
  {
    location: "智利 瓦尔帕莱索",
    label: "实时相机图像",
    score: "61",
    freshness: "9 分钟前",
    decision: "拒绝",
    note: "图像偏软，不适合主页使用。",
  },
] as const;

export const inboxLetters = [
  {
    subject: "来自大阪的日出信",
    status: "已送达",
    route: "大阪 → 雷克雅未克",
    time: "18 分钟前送达",
    excerpt: "我看着天空从灰变金，想起了你的海岸。",
  },
  {
    subject: "等待取件",
    status: "等待日出取件",
    route: "首尔 → 布宜诺斯艾利斯",
    time: "明天 05:41 取件",
    excerpt: "请在南方的日出里把这封信带过去。",
  },
  {
    subject: "飞行中",
    status: "飞行中",
    route: "开普敦 → 台北",
    time: "鸟在 12 分钟前取走",
    excerpt: "路途很长，但晨光正在朝正确的方向移动。",
  },
] as const;
