import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, RotateCcw, X, Sparkles } from "lucide-react";
import { names } from "./model";
const wide = [
  [13, 13],
  [24, 28],
  [12, 43],
  [42, 35],
  [57, 44],
  [75, 55],
  [80, 72],
  [65, 86],
  [45, 90],
  [31, 75],
  [42, 61],
];
const narrow = [
  [18, 10],
  [30, 23],
  [14, 38],
  [53, 33],
  [71, 46],
  [81, 60],
  [73, 76],
  [58, 87],
  [33, 94],
  [15, 77],
  [27, 61],
];
// A stylized Scorpius: three stars form the crown; Antares leads into the curved tail.
const links = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
];
const whispers = [
  "你不用一直闪闪发光，安静的你也很值得被爱。",
  "愿所有小小的幸福，都愿意在你身边多停留一会儿。",
  "今天的主角是你。可以任性一点，也可以被偏爱多一点。",
  "温柔与坚定，可以同时属于你。",
  "这片星空一直留着你的位置，不用急，慢慢来。",
];
type Dust = {
  id: number;
  x: number;
  y: number;
  points: { x: number; y: number; size: number }[];
};
export default function StarMap({
  completed,
  ready,
  open,
  visible,
  name,
  visited,
}: {
  completed: number[];
  ready: boolean;
  open: (i: number) => void;
  visible: boolean;
  name: string;
  visited: number[];
}) {
  const ref = useRef<HTMLElement>(null),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]),
    last = useRef(completed),
    counter = useRef(0);
  const [compact, setCompact] = useState(
      matchMedia("(max-width:760px)").matches,
    ),
    [awake, setAwake] = useState(false),
    [replay, setReplay] = useState(0),
    [dust, setDust] = useState<Dust[]>([]),
    [whisper, setWhisper] = useState(-1),
    [toast, setToast] = useState(""),
    [comet, setComet] = useState(0),
    [newLight, setNewLight] = useState(-1);
  const points = compact ? narrow : wide;
  const all = completed.length === 11;
  const currentStar = names.findIndex((_, i) => !visited.includes(i));
  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }
  function message(text: string) {
    setToast(text);
    later(() => setToast(""), 4800);
  }
  useEffect(() => {
    const mq = matchMedia("(max-width:760px)");
    const change = () => setCompact(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAwake(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!visible) return;
    const fresh = completed.filter((i) => !last.current.includes(i));
    last.current = completed;
    if (fresh.length) {
      setNewLight(fresh[fresh.length - 1]);
      message(
        all
          ? `${name}，你把整片天蝎座都点亮了。`
          : "星空又多了一束光，因为你刚刚来过。",
      );
      later(() => setNewLight(-1), 3500);
    }
  }, [completed, visible]);
  function sparkle(x: number, y: number) {
    const id = ++counter.current;
    setDust((d) => [
      ...d.slice(-5),
      {
        id,
        x,
        y,
        points: Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          const r = 25 + Math.random() * 42;
          return {
            x: Math.cos(a) * r,
            y: Math.sin(a) * r,
            size: 2 + Math.random() * 3,
          };
        }),
      },
    ]);
    later(() => setDust((d) => d.filter((p) => p.id !== id)), 1600);
  }
  function shooting() {
    const id = ++counter.current;
    setComet(id);
    later(() => setComet((c) => (c === id ? 0 : c)), 5200);
    message(`一颗流星为${name}出发。愿你的心愿，慢慢有回音。`);
  }
  return (
    <section
      ref={ref}
      className={`starmap dream-map ${awake ? "awake" : ""} ${all ? "all-lit" : ""} ${replay > 0 ? "replaying" : ""}`}
      aria-label="十一颗生日星星"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button,a")) return;
        const r = e.currentTarget.getBoundingClientRect();
        sparkle(e.clientX - r.left, e.clientY - r.top);
      }}
    >
      <div className="map-caption">
        <span>SCORPIUS · YOUR BIRTHDAY SKY</span>
        <span>
          按 01—11 轻点，星光会记住你 <ArrowUpRight size={12} />
        </span>
      </div>
      <div className="scorpio-watermark" aria-hidden="true">
        ♏
      </div>
      <div className="galactic-ribbon" aria-hidden="true" />
      <button
        className="moon moon-button"
        aria-label="听听月亮的悄悄话"
        aria-expanded={whisper >= 0}
        onClick={() => setWhisper((i) => (i + 1) % whispers.length)}
      >
        <span className="moon-face">·ᴗ·</span>
      </button>
      <span className="orbit-label">eleven little reasons to smile</span>
      {whisper >= 0 && (
        <div className="moon-whisper" role="status">
          <button aria-label="收起月亮悄悄话" onClick={() => setWhisper(-1)}>
            <X size={12} />
          </button>
          <small>月亮悄悄说</small>
          <p>
            {name}，{whispers[whisper]}
          </p>
          <span>再次轻点月亮，还有一句。</span>
        </div>
      )}
      <svg
        className="constellation"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="scorpio-line">
            <stop stopColor="#bc9fd6" stopOpacity=".15" />
            <stop offset=".5" stopColor="#e4c8ef" stopOpacity=".55" />
            <stop offset="1" stopColor="#b3a2dc" stopOpacity=".18" />
          </linearGradient>
        </defs>
        {links.map(([a, b], i) => (
          <g key={`${i}-${replay}`}>
            <path
              className="dream-link"
              pathLength="1"
              d={`M${points[a].join(" ")} L${points[b].join(" ")}`}
              style={
                {
                  "--wake-delay": `${Math.max(a, b) * 0.38 + 0.5}s`,
                } as CSSProperties
              }
            />
            {visited.includes(a) && visited.includes(b) && (
              <path
                className="visited-link"
                pathLength="1"
                d={`M${points[a].join(" ")} L${points[b].join(" ")}`}
              />
            )}
            {completed.includes(a) && completed.includes(b) && (
              <path
                key={all ? "final" : "partial"}
                className={`lit-link ${all ? "complete-link" : ""}`}
                pathLength="1"
                d={`M${points[a].join(" ")} L${points[b].join(" ")}`}
                style={{ "--link-delay": `${i * 0.17}s` } as CSSProperties}
              />
            )}
          </g>
        ))}
      </svg>
      {names.map((title, i) => (
        <button
          key={`${i}-${replay}`}
          disabled={!ready}
          className={`star-node s${i} ${visited.includes(i) ? "visited" : ""} ${i === currentStar ? "current-star" : ""} ${completed.includes(i) ? "lit" : ""} ${newLight === i ? "new-light" : ""} ${i === 3 ? "antares" : ""}`}
          style={
            {
              left: `${points[i][0]}%`,
              top: `${points[i][1]}%`,
              "--wake-delay": `${i * 0.38 + 0.15}s`,
              "--twinkle-delay": `${i * 0.43}s`,
            } as CSSProperties
          }
          aria-disabled={!visited.includes(i) && i !== currentStar}
          onClick={() => {
            if (!visited.includes(i) && i !== currentStar) {
              message(
                `下一份心意藏在 ${String(currentStar + 1).padStart(2, "0")} 号星星。按数字慢慢打开吧。`,
              );
              return;
            }
            open(i);
          }}
          aria-label={`第${i + 1}颗星：${title}${completed.includes(i) ? "，已完成" : ""}`}
        >
          <span className="star-aura" />
          <span className="star-halo" />
          <span className="star-symbol">✦</span>
          <span className="star-orbit-dot" />
          <span className="star-label">
            <small>{String(i + 1).padStart(2, "0")}</small> {title}
            {completed.includes(i) && <Check size={10} />}
          </span>
        </button>
      ))}
      {dust.map((d) => (
        <div
          className="touch-stardust"
          key={d.id}
          style={{ left: d.x, top: d.y }}
          aria-hidden="true"
        >
          <span className="dust-ring" />
          {d.points.map((p, i) => (
            <i
              key={i}
              style={
                {
                  "--dx": `${p.x}px`,
                  "--dy": `${p.y}px`,
                  width: p.size,
                  height: p.size,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
      {comet > 0 && (
        <div className="comet-track">
          <button
            key={comet}
            className="wish-comet"
            aria-label="接住这颗流星"
            onClick={() => {
              setComet(0);
              message(`接住啦。${name}，你值得被认真偏爱。`);
            }}
          >
            <span>✦</span>
            <i />
          </button>
        </div>
      )}
      {toast && (
        <div className="sky-toast" role="status">
          ✧ {toast}
        </div>
      )}
      <div className="star-map-footer">
        <button
          onClick={() => setReplay((n) => n + 1)}
          aria-label="回望已点亮的星星"
        >
          <RotateCcw size={11} /> 回望点亮的星星
        </button>
        <span>轻点空白，留下一点星尘</span>
        <button onClick={shooting}>
          <Sparkles size={11} /> 送我一颗流星
        </button>
      </div>
    </section>
  );
}
