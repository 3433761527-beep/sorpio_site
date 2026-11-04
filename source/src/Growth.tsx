import { useEffect, useRef, useState } from "react";
export function Growth({
  config,
  onDone,
}: {
  config: { blessing: string; seconds: number; dress: string };
  onDone: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null),
    callback = useRef(onDone);
  callback.current = onDone;
  const [finished, setFinished] = useState(false),
    [run, setRun] = useState(0),
    [started, setStarted] = useState(false),
    [stage, setStage] = useState(0);
  const labels = [
    "婴儿 · 世界的第一束光",
    "幼儿 · 摇摇晃晃地出发",
    "小女孩 · 把好奇装进口袋",
    "学生 · 认真写下每个明天",
    "少女 · 开始有自己的宇宙",
    "成年 · 成为闪闪发光的你",
  ];
  useEffect(() => {
    if (!started) return;
    const c = ref.current!,
      ctx = c.getContext("2d")!;
    let raf = 0,
      start = 0,
      last = -1;
    const total = config.seconds * 1000;
    function draw(t: number) {
      if (!start) start = t;
      const p = Math.min((t - start) / total, 1),
        s = Math.min(Math.floor(p * 6), 5),
        u = (p * 6) % 1;
      if (last !== s) {
        last = s;
        setStage(s);
      }
      ctx.imageSmoothingEnabled = false;
      const backgrounds = [
        "#25213c",
        "#29283f",
        "#252f40",
        "#303047",
        "#322b48",
        "#26223d",
      ];
      ctx.fillStyle = backgrounds[s];
      ctx.fillRect(0, 0, 640, 380);
      const time = (t - start) / 1000;
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = `rgba(237,220,191,${0.25 + Math.sin(time + i) * 0.15})`;
        ctx.fillRect((i * 79) % 640, 20 + ((i * 43) % 220), 2, 2);
      }
      ctx.fillStyle = "#42405b";
      ctx.fillRect(0, 310, 640, 70);
      ctx.fillStyle = "#6a5b79";
      ctx.fillRect(0, 310, 640, 4);
      const scale = 4;
      ctx.save();
      const height = 48 + p * 56;
      const walk = Math.sin(time * 6);
      ctx.translate(320 + Math.sin(time * 0.6) * 45, 310 + Math.abs(walk) * -3);
      ctx.scale(scale, scale);
      const headY = -height / scale;
      function rect(x: number, y: number, w: number, h: number, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.round(x),
          Math.round(y),
          Math.round(w),
          Math.round(h),
        );
      }
      const skin = "#f2c8ac",
        hair = "#352b36",
        dress = config.dress;
      const leg = 2 + p * 8,
        body = 5 + p * 7;
      rect(-5, headY, 10, 9, hair);
      rect(-4, headY + 3, 8, 7, skin);
      rect(-5, headY, 10, 3, hair);
      rect(-5, headY + 3, 2, 9, hair);
      if (s > 1) rect(4, headY + 4, 2, 10 + p * 3, hair);
      rect(-2, headY + 5, 1, 1, "#493744");
      rect(2, headY + 5, 1, 1, "#493744");
      rect(0, headY + 8, 2, 1, "#bc7c82");
      const by = headY + 10;
      rect(-4, by, 8, body, dress);
      if (s < 1) {
        rect(-7, by, 14, 9, "#dbbfd1");
        rect(-5, by + 7, 10, 3, "#c8adcc");
      } else {
        rect(-5, by + body - 3, 10, 5, dress);
        rect(-4, by + body + 2, 3, leg + walk * 1.4, skin);
        rect(1, by + body + 2, 3, leg - walk * 1.4, skin);
        rect(-5, by + body + leg + 1 + walk, 4, 2, hair);
        rect(1, by + body + leg + 1 - walk, 4, 2, hair);
        rect(-7, by + 2 + walk, 3, body - 1, skin);
        rect(4, by + 2 - walk, 3, body - 1, skin);
        if (s === 3) {
          rect(5, by + 4, 5, 8, "#a7bacb");
          rect(6, by + 5, 3, 1, "#e2d8bd");
        }
        if (s >= 4) {
          rect(-3, by, 6, 2, "#e5d8c3");
          rect(3, headY + 2, 3, 2, "#deb3c8");
        }
      }
      ctx.restore();
      if (s === 2) {
        ctx.fillStyle = "#8c91a0";
        ctx.fillRect(90, 270, 30, 40);
        ctx.fillStyle = "#b2adbd";
        ctx.fillRect(95, 264, 20, 8);
      }
      if (s === 3) {
        ctx.fillStyle = "#8e7c93";
        ctx.fillRect(450, 250, 90, 12);
        ctx.fillRect(460, 262, 8, 48);
        ctx.fillRect(520, 262, 8, 48);
      }
      for (let i = 0; i < 8; i++) {
        const x = 260 + Math.sin(time + i * 2) * 100,
          y = 260 - ((time * 30 + i * 40) % 190);
        ctx.fillStyle = `rgba(225,206,167,${(1 - (260 - y) / 190) * 0.8})`;
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.fillStyle = "#d5c2db";
      ctx.font = "12px monospace";
      ctx.fillText(
        `${Math.min(19, Math.floor(p * 20))} YEARS OF LITTLE MIRACLES`,
        20,
        355,
      );
      if (p < 1) raf = requestAnimationFrame(draw);
      else {
        setFinished(true);
        callback.current();
      }
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [started, run, config.seconds, config.dress]);
  return (
    <>
      <div className="growth-stage">
        <canvas
          ref={ref}
          width={640}
          height={380}
          aria-label="原创像素女孩的连续成长动画"
        />
        {!started && (
          <div className="growth-start">
            <span>✧</span>
            <p>每一岁的你，都在成为自己。</p>
            <button className="primary" onClick={() => setStarted(true)}>
              播放成长故事
            </button>
          </div>
        )}
      </div>
      <p className="centered growth-label">
        {started ? labels[stage] : "从一声啼哭，到十九岁的星光。"}
      </p>
      <div className="growth-dots">
        {labels.map((x, i) => (
          <span key={x} className={started && i <= stage ? "active" : ""} />
        ))}
      </div>
      {finished && (
        <div className="reveal">
          <p>{config.blessing}</p>
          <button
            className="subtle"
            onClick={() => {
              setFinished(false);
              setRun((n) => n + 1);
            }}
          >
            再看一次成长故事
          </button>
        </div>
      )}
    </>
  );
}
