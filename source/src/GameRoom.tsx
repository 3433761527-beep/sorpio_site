import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Sparkles,
  RotateCcw,
  X,
  Pause,
  Play,
  Check,
  Trophy,
} from "lucide-react";
import { Bunny } from "./Happiness";
import Game2048 from "./Game2048";
import {
  makeDeck,
  catches,
  clampBasket,
  hitsNext,
  trailPoints,
} from "./game-engine";
type GameId = "catch" | "memory" | "trail";
type Result = { score: number; seconds: number; won: boolean };
type RecordData = {
  best: number;
  plays: number;
  last: Result;
  playedAt: string;
};
export type GameRecords = Partial<Record<GameId, RecordData>>;
const gameInfo = [
  {
    id: "catch" as const,
    icon: "✦",
    name: "接住幸运星",
    line: "把19颗小幸运，装进口袋",
    tag: "轻轻拖动 · 45秒",
  },
  {
    id: "memory" as const,
    icon: "♡",
    name: "回忆翻翻牌",
    line: "找到每一对心有灵犀",
    tag: "翻开配对 · 不限时",
  },
  {
    id: "trail" as const,
    icon: "✧",
    name: "星轨连连看",
    line: "亲手连出属于你的天蝎座",
    tag: "按序连线 · 可接着玩",
  },
];
export default function GameRoom({
  name,
  value,
  onSave,
  disabled,
  mergeValue,
  onMergeSave,
}: {
  name: string;
  value: unknown;
  onSave: (v: GameRecords) => void;
  disabled: boolean;
  mergeValue: unknown;
  onMergeSave: (v: unknown) => void;
}) {
  const records = (value || {}) as GameRecords;
  const [selected, setSelected] = useState<GameId | "2048" | null>(null);
  function save(id: GameId, result: Result) {
    const old = records[id];
    const best =
      id === "catch"
        ? Math.max(old?.best || 0, result.score)
        : Math.min(old?.best ?? Infinity, result.score);
    onSave({
      ...records,
      [id]: {
        best,
        plays: (old?.plays || 0) + 1,
        last: result,
        playedAt: new Date().toISOString(),
      },
    });
  }
  return (
    <section id="play" className="game-room" aria-label="小兔星星游乐场">
      <div className="game-room-title">
        <div>
          <span className="eyebrow">PLAY A LITTLE, SMILE A LOT</span>
          <h2>
            {name}的星星游乐场 <span>✧</span>
          </h2>
          <p>惊喜可以慢慢拆，快乐也可以玩着收集。</p>
        </div>
        <span className="game-room-mascot">
          <Bunny />
        </span>
      </div>
      <div className="game-cards">
        <button
          disabled={disabled}
          aria-pressed={selected === "2048"}
          className={selected === "2048" ? "selected" : ""}
          onClick={() => setSelected((s) => (s === "2048" ? null : "2048"))}
        >
          <span className="game-card-symbol">2048</span>
          <h3>可爱合合乐</h3>
          <p>十位三丽鸥小伙伴，越合越快乐</p>
          <small>滑动合并 · 自动存档</small>
        </button>
        {gameInfo.map((g) => (
          <button
            key={g.id}
            disabled={disabled}
            aria-pressed={selected === g.id}
            className={selected === g.id ? "selected" : ""}
            onClick={() => setSelected((s) => (s === g.id ? null : g.id))}
          >
            <span className="game-card-symbol">{g.icon}</span>
            <h3>{g.name}</h3>
            <p>{g.line}</p>
            <small>{g.tag}</small>
            {records[g.id] && (
              <span className="game-best">
                <Trophy size={10} />
                {g.id === "catch"
                  ? `${records[g.id]!.best} / 19`
                  : g.id === "memory"
                    ? `${records[g.id]!.best} 步`
                    : `${records[g.id]!.best} 秒`}
              </span>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <div className="game-panel">
          <button
            className="game-close"
            aria-label="收起小游戏"
            onClick={() => setSelected(null)}
          >
            <X size={16} />
          </button>
          {selected === "2048" ? (
            <Game2048 name={name} value={mergeValue} onSave={onMergeSave} />
          ) : selected === "catch" ? (
            <CatchGame name={name} onFinish={(r) => save("catch", r)} />
          ) : selected === "memory" ? (
            <MemoryGame name={name} onFinish={(r) => save("memory", r)} />
          ) : (
            <TrailGame name={name} onFinish={(r) => save("trail", r)} />
          )}
          <p className="game-save-note">
            小游戏成绩单独收藏，不改变11颗生日星星的完成进度。保存状态见页面底部。
          </p>
        </div>
      )}
    </section>
  );
}
function RoundEnd({
  name,
  message,
  score,
  restart,
}: {
  name: string;
  message: string;
  score: string;
  restart: () => void;
}) {
  return (
    <div className="game-round-end" role="status">
      <span>✧ ♡ ✧</span>
      <h3>
        {name}，{message}
      </h3>
      <p>{score}</p>
      <button className="primary" onClick={restart}>
        <RotateCcw size={14} /> 再玩一次
      </button>
    </div>
  );
}
function CatchGame({
  name,
  onFinish,
}: {
  name: string;
  onFinish: (r: Result) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    basket = useRef(160),
    pauseRef = useRef(false),
    finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [round, setRound] = useState(0),
    [score, setScore] = useState(0),
    [seconds, setSeconds] = useState(45),
    [ended, setEnded] = useState(false),
    [paused, setPaused] = useState(false);
  function start() {
    setScore(0);
    setSeconds(45);
    setEnded(false);
    setPaused(false);
    pauseRef.current = false;
    setRound((n) => n + 1);
  }
  useEffect(() => {
    if (!round) return;
    const c = canvas.current!,
      ctx = c.getContext("2d")!;
    let width = c.clientWidth,
      height = 340,
      last = 0,
      elapsed = 0,
      spawn = 0,
      count = 0,
      raf = 0,
      done = false,
      lastSecond = 45;
    const stars: {
        x: number;
        y: number;
        r: number;
        speed: number;
        angle: number;
      }[] = [],
      particles: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
      }[] = [];
    function resize() {
      const old = width;
      width = c.clientWidth;
      const d = Math.min(devicePixelRatio, 2);
      c.width = width * d;
      c.height = height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      basket.current = clampBasket(
        old ? (basket.current / old) * width : width / 2,
        width,
      );
    }
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();
    basket.current = width / 2;
    function visibility() {
      if (document.hidden) {
        pauseRef.current = true;
        setPaused(true);
      }
    }
    document.addEventListener("visibilitychange", visibility);
    function finish() {
      if (done) return;
      done = true;
      setEnded(true);
      setScore(count);
      finishRef.current({
        score: count,
        seconds: Math.round(elapsed),
        won: count === 19,
      });
    }
    function draw(t: number) {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#252039");
      grad.addColorStop(1, "#32273f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(230,211,241,${0.2 + Math.sin(t / 1100 + i) * 0.1})`;
        ctx.fillRect((i * 67) % width, 15 + ((i * 41) % 280), 1.4, 1.4);
      }
      if (!pauseRef.current && !done) {
        elapsed += dt;
        spawn += dt;
        if (spawn > 0.52) {
          spawn = 0;
          stars.push({
            x: 20 + Math.random() * (width - 40),
            y: -14,
            r: 6 + Math.random() * 3,
            speed: 82 + Math.random() * 30,
            angle: Math.random() * 6,
          });
        }
        const remain = Math.max(0, Math.ceil(45 - elapsed));
        if (remain !== lastSecond) {
          lastSecond = remain;
          setSeconds(remain);
        }
      }
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        if (!pauseRef.current && !done) s.y += s.speed * dt;
        if (
          !done &&
          !pauseRef.current &&
          catches(s, basket.current, width, height)
        ) {
          stars.splice(i, 1);
          count++;
          setScore(count);
          for (let j = 0; j < 9; j++) {
            const a = (j * 7) / 9;
            particles.push({
              x: s.x,
              y: s.y,
              vx: Math.cos(a) * 45,
              vy: Math.sin(a) * 45,
              life: 1,
            });
          }
          if (count >= 19) finish();
          continue;
        }
        if (s.y > height + 15) {
          stars.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.shadowBlur = 13;
        ctx.shadowColor = "#edd1a7";
        ctx.fillStyle = "#ecd2a8";
        ctx.font = `${s.r * 2.7}px Georgia`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦", 0, 0);
        ctx.restore();
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!pauseRef.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt * 1.8;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = "#f6d6e6";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 7);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      const x = basket.current,
        y = height - 42;
      ctx.fillStyle = "#f0e4ee";
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 27, 15, 0, 0, 7);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 14, y - 14, 5, 16, -0.25, 0, 7);
      ctx.ellipse(x + 14, y - 14, 5, 16, 0.25, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#bda5d2";
      ctx.fillRect(x - 25, y + 8, 50, 8);
      ctx.fillStyle = "#7d658b";
      ctx.beginPath();
      ctx.arc(x - 8, y, 1.8, 0, 7);
      ctx.arc(x + 8, y, 1.8, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#e3adc7";
      ctx.beginPath();
      ctx.ellipse(x - 17, y + 4, 5, 2.5, 0, 0, 7);
      ctx.ellipse(x + 17, y + 4, 5, 2.5, 0, 0, 7);
      ctx.fill();
      if (elapsed >= 45 && !done) finish();
      if (!done) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [round]);
  function move(clientX: number) {
    if (!canvas.current) return;
    const r = canvas.current.getBoundingClientRect();
    basket.current = clampBasket(clientX - r.left, r.width);
  }
  return (
    <>
      <div className="game-instructions">
        <h3>接住幸运星</h3>
        <p>用手指拖动小兔篮子，把19颗幸运星收好。</p>
      </div>
      <div className="game-hud">
        <span>✦ {score} / 19</span>
        <span>{seconds}s</span>
        {round > 0 && !ended && (
          <button
            onClick={() => {
              pauseRef.current = !pauseRef.current;
              setPaused(pauseRef.current);
            }}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
            {paused ? "继续" : "暂停"}
          </button>
        )}
      </div>
      <div className="catch-board">
        <canvas
          ref={canvas}
          width="360"
          height="340"
          tabIndex={0}
          role="application"
          aria-label="接星星游戏，左右拖动或用左右方向键移动小兔"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "touch") move(e.clientX);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              basket.current = clampBasket(
                basket.current + (e.key === "ArrowRight" ? 25 : -25),
                e.currentTarget.clientWidth,
              );
            }
          }}
        />
        {!round && (
          <div className="catch-intro">
            <span>✦</span>
            <p>一口袋星星，送给被偏爱的你。</p>
            <button className="primary" onClick={start}>
              开始收集幸运 <ArrowRight size={14} />
            </button>
          </div>
        )}
        {paused && !ended && (
          <div className="catch-paused">
            <p>小兔在等你回来。</p>
            <button
              className="primary"
              onClick={() => {
                pauseRef.current = false;
                setPaused(false);
              }}
            >
              继续接星星 <Play size={14} />
            </button>
          </div>
        )}
      </div>
      {ended && (
        <RoundEnd
          name={name}
          message={score === 19 ? "你把幸运收满啦！" : "小小的幸运也值得收藏。"}
          score={`这次接住了 ${score} 颗星星。${score === 19 ? "愿十九岁的每一天，都有小惊喜。" : "再试一次，小兔会陪着你。"}`}
          restart={start}
        />
      )}
    </>
  );
}
const faces = ["✦", "☾", "♡", "✿", "♧", "✧"];
function MemoryGame({
  name,
  onFinish,
}: {
  name: string;
  onFinish: (r: Result) => void;
}) {
  const [deck, setDeck] = useState(() => makeDeck()),
    [first, setFirst] = useState<number | null>(null),
    [second, setSecond] = useState<number | null>(null),
    [matched, setMatched] = useState<number[]>([]),
    [moves, setMoves] = useState(0),
    [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    started = useRef(0),
    finished = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setDeck(makeDeck());
    setFirst(null);
    setSecond(null);
    setMatched([]);
    setMoves(0);
    setWon(false);
    started.current = 0;
    finished.current = false;
  }
  function flip(i: number) {
    if (
      second !== null ||
      first === i ||
      matched.includes(deck[i].value) ||
      finished.current
    )
      return;
    if (!started.current) started.current = performance.now();
    if (first === null) {
      setFirst(i);
      return;
    }
    const n = moves + 1;
    setMoves(n);
    setSecond(i);
    if (deck[first].value === deck[i].value) {
      const next = [...matched, deck[i].value];
      setMatched(next);
      setFirst(null);
      setSecond(null);
      if (next.length === 6) {
        finished.current = true;
        timer.current = setTimeout(() => {
          setWon(true);
          onFinish({
            score: n,
            seconds: Math.round((performance.now() - started.current) / 1000),
            won: true,
          });
        }, 550);
      }
    } else
      timer.current = setTimeout(() => {
        setFirst(null);
        setSecond(null);
      }, 800);
  }
  return (
    <>
      <div className="game-instructions">
        <h3>回忆翻翻牌</h3>
        <p>每次翻开两张，找到6对藏在信封里的小心意。</p>
      </div>
      <div className="game-hud">
        <span>配对 {matched.length} / 6</span>
        <span>{moves} 步</span>
        <button onClick={reset}>
          <RotateCcw size={12} /> 重开
        </button>
      </div>
      <div className="memory-board">
        {deck.map((card, i) => {
          const open =
            first === i || second === i || matched.includes(card.value);
          return (
            <button
              key={card.id}
              className={`memory-card ${open ? "face-up" : ""} ${matched.includes(card.value) ? "matched" : ""}`}
              aria-label={
                matched.includes(card.value)
                  ? `已配对 ${faces[card.value]}`
                  : open
                    ? `已翻开 ${faces[card.value]}`
                    : `翻开第${i + 1}张卡片`
              }
              aria-pressed={open}
              disabled={matched.includes(card.value) || won}
              onClick={() => flip(i)}
            >
              <span className="memory-card-inner">
                <span className="card-back">
                  ✧<small>A LITTLE LOVE</small>
                </span>
                <span className={`card-front face-${card.value}`}>
                  {faces[card.value]}
                  {matched.includes(card.value) && <Check size={12} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {won && (
        <RoundEnd
          name={name}
          message="每一份心意，都找到了另一半。"
          score={`用 ${moves} 步找到了全部6对。谢谢你认真翻开这些小小的偏爱。`}
          restart={reset}
        />
      )}
    </>
  );
}
function TrailGame({
  name,
  onFinish,
}: {
  name: string;
  onFinish: (r: Result) => void;
}) {
  const [count, setCount] = useState(0),
    [seconds, setSeconds] = useState(0),
    [won, setWon] = useState(false);
  const current = useRef(0),
    start = useRef(0),
    holding = useRef(false);
  function reset() {
    setCount(0);
    setWon(false);
    setSeconds(0);
    current.current = 0;
    start.current = 0;
    holding.current = false;
  }
  function touch(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    if (
      current.current >= 11 ||
      !hitsNext(
        current.current,
        e.clientX - r.left,
        e.clientY - r.top,
        r.width,
        r.height,
      )
    )
      return;
    connect();
  }
  function connect() {
    if (current.current >= 11) return;
    if (!start.current) start.current = performance.now();
    current.current++;
    setCount(current.current);
    if (current.current === 11) {
      const t = Math.max(
        1,
        Math.round((performance.now() - start.current) / 1000),
      );
      setSeconds(t);
      setWon(true);
      onFinish({ score: t, seconds: t, won: true });
    }
  }
  return (
    <>
      <div className="game-instructions">
        <h3>星轨连连看</h3>
        <p>从01连到11。拖动或依次轻点，可以分几次慢慢连完。</p>
      </div>
      <div className="game-hud">
        <span>已连接 {count} / 11</span>
        <span>
          {won ? "天蝎座完成" : `下一颗 ${String(count + 1).padStart(2, "0")}`}
        </span>
        <button onClick={reset}>
          <RotateCcw size={12} /> 重连
        </button>
      </div>
      <svg
        className="trail-board"
        viewBox="0 0 400 360"
        preserveAspectRatio="none"
        role="application"
        aria-label="按数字顺序连接天蝎座，亦可用下方按钮逐颗连接"
        onPointerDown={(e) => {
          holding.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          touch(e);
        }}
        onPointerMove={(e) => {
          if (holding.current) touch(e);
        }}
        onPointerUp={() => (holding.current = false)}
        onPointerCancel={() => (holding.current = false)}
      >
        <defs>
          <radialGradient id="trail-halo">
            <stop stopColor="#c7a9e6" stopOpacity=".2" />
            <stop offset="1" stopColor="#c7a9e6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {trailPoints.map((p, i) => (
          <g key={i}>
            {i > 0 && i < count && (
              <path
                d={`M${trailPoints[i - 1][0] * 4} ${trailPoints[i - 1][1] * 3.6}L${p[0] * 4} ${p[1] * 3.6}`}
                className="game-trail-line"
              />
            )}
            {i === count && (
              <circle
                cx={p[0] * 4}
                cy={p[1] * 3.6}
                r="30"
                fill="url(#trail-halo)"
              />
            )}
            <circle
              cx={p[0] * 4}
              cy={p[1] * 3.6}
              r={i === count ? 13 : 10}
              className={
                i < count
                  ? "trail-dot connected"
                  : i === count
                    ? "trail-dot next"
                    : "trail-dot"
              }
            />
            <text
              x={p[0] * 4}
              y={p[1] * 3.6 + 3.5}
              className={i < count ? "connected-number" : ""}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>
      {!won && (
        <button className="subtle" onClick={connect}>
          轻点连接下一颗 · {String(count + 1).padStart(2, "0")}{" "}
          <Sparkles size={12} />
        </button>
      )}
      {won && (
        <RoundEnd
          name={name}
          message="你的指尖，画出了十一月的浪漫。"
          score={`${seconds} 秒，亲手连成一片天蝎座。愿你每次抬头，都有星光回应。`}
          restart={reset}
        />
      )}
    </>
  );
}
