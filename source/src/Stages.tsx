import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Play,
  Pause,
  Check,
  Upload,
  Download,
  Shuffle,
  Eye,
  ArrowLeft,
  ArrowRight,
  Mail,
  Volume2,
} from "lucide-react";
import {
  normalize,
  gridSize,
  shuffle,
  type Config,
  type Progress,
  type Media,
} from "./model";
import { upload, download } from "./cloud";
import { chime, Fireworks } from "./Effects";
import { Growth } from "./Growth";
type Props = {
  id: number;
  config: Config;
  progress: Progress;
  record: (id: number, result: unknown, done?: boolean) => void;
  audio: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  toggleMusic: () => Promise<void>;
};
function Done({ children }: { children: React.ReactNode }) {
  return (
    <div className="reveal">
      <span>✧</span>
      <p>{children}</p>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span>✧</span>
      <p>{text}</p>
      <small>请管理员在后台上传素材并发布。</small>
    </div>
  );
}
export function Stage(p: Props) {
  const { config: c, record: r, id } = p;
  return (
    <div className="stage-content">
      {id === 0 ? (
        <Music {...p} />
      ) : id === 1 ? (
        <Mood {...p} />
      ) : id === 2 ? (
        <Colors {...p} />
      ) : id === 3 ? (
        <Growth config={c.growth} onDone={() => r(3, { grown: true })} />
      ) : id === 4 ? (
        <Puzzle {...p} />
      ) : id === 5 ? (
        <MathGame {...p} />
      ) : id === 6 ? (
        <Album {...p} items={c.memories} />
      ) : id === 7 ? (
        <Sky {...p} />
      ) : id === 8 ? (
        <Album {...p} items={c.chats} chat />
      ) : id === 9 ? (
        <Letter {...p} />
      ) : (
        <Birthday {...p} />
      )}
    </div>
  );
}
function Music({ config: c, audio, playing, toggleMusic }: Props) {
  const [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(1);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const update = () => {
      setTime(a.currentTime);
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    };
    a.addEventListener("timeupdate", update);
    a.addEventListener("loadedmetadata", update);
    update();
    return () => {
      a.removeEventListener("timeupdate", update);
      a.removeEventListener("loadedmetadata", update);
    };
  }, [audio]);
  return (
    <div className={`music-card ${playing ? "music-playing" : ""}`}>
      <div className="record-cover">
        {c.music.cover ? (
          <img src={c.music.cover} alt="歌曲封面" />
        ) : (
          <div className="vinyl">
            <span>✦</span>
          </div>
        )}
        <div className="music-sparks">✧ · ✦ · ✧</div>
      </div>
      <small>TONIGHT'S SOUNDTRACK</small>
      <h3>{c.music.title}</h3>
      {!c.music.url ? (
        <Empty text="今晚的旋律，还在等待被放进来。" />
      ) : (
        <>
          <input
            aria-label="播放进度"
            type="range"
            min="0"
            max={duration || 1}
            step=".1"
            value={time}
            onChange={(e) => {
              if (audio.current) audio.current.currentTime = +e.target.value;
            }}
          />
          <div className="time-row">
            <span>
              {Math.floor(time / 60)}:
              {String(Math.floor(time % 60)).padStart(2, "0")}
            </span>
            <span>
              {Math.floor(duration / 60)}:
              {String(Math.floor(duration % 60)).padStart(2, "0")}
            </span>
          </div>
          <button
            className="round-play"
            onClick={() => void toggleMusic()}
            aria-label={playing ? "暂停" : "播放"}
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <label className="volume">
            <Volume2 size={15} />
            <input
              aria-label="音量"
              type="range"
              min="0"
              max="1"
              step=".05"
              value={volume}
              onChange={(e) => {
                setVolume(+e.target.value);
                if (audio.current) audio.current.volume = +e.target.value;
              }}
            />
          </label>
          <small>iPhone 的实际音量由设备音量键控制。</small>
        </>
      )}
    </div>
  );
}
function Mood({ config: c, record, progress }: Props) {
  const old = progress.results["1"] as { words?: string[] } | undefined;
  const [words, setWords] = useState(old?.words || ["", "", ""]),
    [reveal, setReveal] = useState(false),
    [egg, setEgg] = useState(false);
  const sound = useRef<HTMLAudioElement>(null);
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const w = words.map((x) => x.trim());
          if (w.some((x) => !normalize(x))) return;
          setReveal(true);
          const hit = w.some((x) =>
            normalize(x).includes(normalize(c.egg.keyword)),
          );
          setEgg(hit);
          if (hit) {
            if (sound.current) void sound.current.play().catch(() => chime());
            else chime();
          }
          record(1, { words: w, egg: hit });
        }}
      >
        <div className="mood-inputs">
          {words.map((w, i) => (
            <label key={i}>
              <span>0{i + 1}</span>
              <input
                required
                maxLength={30}
                value={w}
                onChange={(e) => {
                  setReveal(false);
                  setWords(words.map((v, j) => (i === j ? e.target.value : v)));
                }}
                placeholder={["此刻，我有点…", "也有一点…", "还有满满的…"][i]}
                aria-label={`心情词语 ${i + 1}`}
              />
            </label>
          ))}
        </div>
        <button className="primary" disabled={words.some((x) => !normalize(x))}>
          把心情寄给星星 <ArrowRight size={15} />
        </button>
      </form>
      {c.egg.sound && <audio ref={sound} src={c.egg.sound} preload="auto" />}
      {reveal && (
        <div className="word-reveal">
          {words.map((w, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.5}s` }}>
              {w}
            </span>
          ))}
        </div>
      )}
      {reveal && egg && <Done>{c.egg.text}</Done>}
    </>
  );
}
function Colors({ config: c, record, progress }: Props) {
  const old = progress.results["2"] as { colors?: string[] } | undefined;
  const [selected, setSelected] = useState<string[]>(
      old?.colors?.filter((x) => c.colors.some((y) => y.hex === x)) || [],
    ),
    [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <div className="color-options">
        {c.colors.map((x) => (
          <button
            key={x.hex}
            aria-pressed={selected.includes(x.hex)}
            className={selected.includes(x.hex) ? "selected" : ""}
            onClick={() => {
              setConfirmed(false);
              setSelected((a) =>
                a.includes(x.hex)
                  ? a.filter((y) => y !== x.hex)
                  : a.length < 3
                    ? [...a, x.hex]
                    : a,
              );
            }}
          >
            <span style={{ background: x.hex }}>
              {selected.includes(x.hex) && <Check size={20} />}
            </span>
            {x.name}
          </button>
        ))}
      </div>
      <p className="muted centered">
        选出三个不同的颜色 · {selected.length} / 3
      </p>
      <button
        className="primary"
        disabled={selected.length !== 3}
        onClick={() => {
          record(2, { colors: selected });
          setConfirmed(true);
        }}
      >
        收藏我的调色盘
      </button>
      {confirmed && (
        <>
          <div className="palette">
            {selected.map((hex) => (
              <div key={hex} style={{ background: hex }}>
                <span>
                  {c.colors.find((x) => x.hex === hex)?.name}
                  <small>{hex}</small>
                </span>
              </div>
            ))}
          </div>
          <Done>这三种颜色，成为今晚独一无二的你。</Done>
        </>
      )}
    </>
  );
}
function Puzzle({ config: c, record }: Props) {
  const [n, setN] = useState(c.puzzle.allowed[0]),
    [tiles, setTiles] = useState(() => shuffle(c.puzzle.allowed[0])),
    [selected, setSelected] = useState<number | null>(null),
    [preview, setPreview] = useState(false),
    [won, setWon] = useState(false);
  const board = useRef<HTMLDivElement>(null),
    drag = useRef<{ index: number; x: number; y: number } | null>(null);
  const { rows, cols } = gridSize(n);
  function reset(count = n) {
    setN(count);
    setTiles(shuffle(count));
    setSelected(null);
    setWon(false);
  }
  function swap(a: number, b: number) {
    if (won || a === b) return;
    const next = [...tiles];
    [next[a], next[b]] = [next[b], next[a]];
    setTiles(next);
    setSelected(null);
    if (next.every((v, i) => v === i)) {
      setWon(true);
      chime();
      record(4, { pieces: n, completed: true });
    }
  }
  function pick(i: number) {
    if (selected === null) setSelected(i);
    else if (selected === i) setSelected(null);
    else swap(selected, i);
  }
  return c.puzzle.url ? (
    <>
      <div className="puzzle-toolbar">
        <label>
          碎片数{" "}
          <select value={n} onChange={(e) => reset(+e.target.value)}>
            {c.puzzle.allowed.map((v) => (
              <option key={v} value={v}>
                {v} 片
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setPreview(!preview)}>
          <Eye size={15} />
          {preview ? "收起原图" : "看一眼原图"}
        </button>
        <button onClick={() => reset()}>
          <Shuffle size={15} /> 打乱
        </button>
      </div>
      {preview && (
        <img className="original-preview" src={c.puzzle.url} alt="拼图原图" />
      )}
      <p className="muted centered">拖动碎片交换位置，也可以依次轻点两块。</p>
      <div
        className={`puzzle-board ${won ? "won" : ""}`}
        ref={board}
        style={{
          gridTemplateColumns: `repeat(${cols},1fr)`,
          aspectRatio: `${cols}/${rows}`,
        }}
      >
        {tiles.map((tile, index) => (
          <button
            key={index}
            aria-label={`位置 ${index + 1}，碎片 ${tile + 1}`}
            className={selected === index ? "picked" : ""}
            style={{
              backgroundImage: `url("${c.puzzle.url}")`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              backgroundPosition: `${cols === 1 ? 0 : ((tile % cols) / (cols - 1)) * 100}% ${rows === 1 ? 0 : (Math.floor(tile / cols) / (rows - 1)) * 100}%`,
            }}
            onPointerDown={(e) => {
              drag.current = { index, x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d) return;
              const rect = board.current!.getBoundingClientRect();
              if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) {
                pick(index);
                return;
              }
              if (
                e.clientX < rect.left ||
                e.clientX >= rect.right ||
                e.clientY < rect.top ||
                e.clientY >= rect.bottom
              )
                return;
              const target =
                Math.floor(((e.clientY - rect.top) / rect.height) * rows) *
                  cols +
                Math.floor(((e.clientX - rect.left) / rect.width) * cols);
              swap(d.index, target);
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pick(index);
              }
            }}
          >
            <span>{tile + 1}</span>
          </button>
        ))}
      </div>
      {won && <Done>{c.puzzle.message}</Done>}
    </>
  ) : (
    <Empty text="一张照片，藏着一整段回忆。" />
  );
}
function MathGame({ config: c, record }: Props) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  const q = c.math[index];
  return done ? (
    <Done>
      答案是 19。
      <br />
      祝你19岁生日快乐！
    </Done>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(answer) !== q.answer || !answer.trim()) {
          setError(q.hint);
          return;
        }
        setError("");
        setAnswer("");
        if (index === c.math.length - 1) {
          setDone(true);
          record(5, { answer: 19, count: c.math.length });
          chime();
        } else setIndex(index + 1);
      }}
    >
      <p className="centered muted">
        第 {index + 1} 道 / 共 {c.math.length} 道
      </p>
      <div className="equation">
        {q.expression.replaceAll(
          "{prev}",
          String(index ? c.math[index - 1].answer : 0),
        )}{" "}
        <span>= ?</span>
      </div>
      <input
        className="answer"
        aria-label="计算结果"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="你的答案"
        required
      />
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary">
        {index === c.math.length - 1 ? "揭晓答案" : "下一道小谜题"}{" "}
        <ArrowRight size={15} />
      </button>
    </form>
  );
}
function Album({
  items,
  chat = false,
  record,
  progress,
  id,
}: Props & { items: Media[]; chat?: boolean }) {
  const [index, setIndex] = useState(0),
    [zoom, setZoom] = useState(false),
    [note, setNote] = useState(""),
    [saved, setSaved] = useState(false);
  const touch = useRef(0);
  const old = progress.results[String(id)] as
    | { notes?: Record<string, string> }
    | undefined;
  const [notes, setNotes] = useState<Record<string, string>>(old?.notes || {});
  const item = items[index];
  useEffect(() => {
    setNote(notes[item?.id] || "");
    setSaved(false);
  }, [index, item?.id]);
  if (!item)
    return (
      <Empty
        text={
          chat
            ? "故事的第一句话，值得好好收藏。"
            : "回忆相册，等待属于你们的照片。"
        }
      />
    );
  function turn(d: number) {
    setIndex((i) => (i + d + items.length) % items.length);
  }
  return (
    <>
      <div
        className={chat ? "chat-timeline" : "polaroid"}
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 45) turn(dx < 0 ? 1 : -1);
        }}
      >
        {chat && (
          <div className="phone-top">
            ◉ <span>我们的最初</span> •••
          </div>
        )}
        <button
          className="photo-button"
          onClick={() => setZoom(true)}
          aria-label="放大照片"
        >
          <img
            src={item.url}
            alt={item.title || `回忆 ${index + 1}`}
            loading="lazy"
          />
        </button>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="album-nav">
        <button onClick={() => turn(-1)} aria-label="上一张">
          <ArrowLeft size={18} />
        </button>
        <span>
          {String(index + 1).padStart(2, "0")}{" "}
          <small>/ {String(items.length).padStart(2, "0")}</small>
        </span>
        <button onClick={() => turn(1)} aria-label="下一张">
          <ArrowRight size={18} />
        </button>
      </div>
      {!chat && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = { ...notes, [item.id]: note.trim() };
            setNotes(next);
            record(id, { notes: next });
            setSaved(true);
          }}
        >
          <label className="field">
            看到这张照片，你想说…
            <textarea
              maxLength={2000}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              placeholder="留下此刻的感受"
              required
            />
          </label>
          <button className="primary">
            {saved ? "已记录 · 查看页面底部保存状态" : "保存这份感受"}
          </button>
        </form>
      )}
      {chat && (
        <button
          className="primary"
          onClick={() => record(id, { viewed: true })}
        >
          收藏故事的开始
        </button>
      )}
      {zoom && (
        <div
          className="lightbox"
          role="dialog"
          aria-label="放大查看"
          onClick={() => setZoom(false)}
        >
          <button onClick={() => setZoom(false)} aria-label="关闭大图">
            ×
          </button>
          <img src={item.url} alt={item.title} />
          <span>轻点任意位置关闭</span>
        </div>
      )}
    </>
  );
}
async function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(Error("图片加载失败，请确认地址和跨域权限"));
    image.src = url;
  });
}
function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  ctx.drawImage(
    img,
    (w - img.width * scale) / 2,
    (h - img.height * scale) / 2,
    img.width * scale,
    img.height * scale,
  );
}
function Sky({ config: c, record }: Props) {
  const [file, setFile] = useState<File | null>(null),
    [url, setUrl] = useState(""),
    [result, setResult] = useState(""),
    [blob, setBlob] = useState<Blob | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result);
    },
    [result],
  );
  async function blend() {
    if (!url || !c.sky) return;
    setBusy(true);
    setError("");
    try {
      const [a, b] = await Promise.all([loadImage(c.sky), loadImage(url)]);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d")!;
      cover(ctx, a, 1200, 1600);
      const layer = document.createElement("canvas");
      layer.width = 1200;
      layer.height = 1600;
      const l = layer.getContext("2d")!;
      cover(l, b, 1200, 1600);
      l.globalCompositeOperation = "destination-in";
      const gradient = l.createLinearGradient(0, 0, 1200, 1600);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.45, "rgba(0,0,0,.45)");
      gradient.addColorStop(1, "rgba(0,0,0,1)");
      l.fillStyle = gradient;
      l.fillRect(0, 0, 1200, 1600);
      ctx.drawImage(layer, 0, 0);
      ctx.fillStyle = "rgba(44,30,74,.12)";
      ctx.fillRect(0, 0, 1200, 1600);
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1200,
          y = Math.random() * 1600,
          r = Math.random() * 2 + 0.5;
        ctx.fillStyle = `rgba(255,241,215,${0.25 + Math.random() * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = "#fff6e9";
      ctx.font = "italic 42px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("Under the same sky", 600, 1470);
      ctx.font = "20px Georgia";
      ctx.fillText("A LITTLE STARRY SKY · 11.09", 600, 1530);
      const output = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error("合成失败"))),
          "image/jpeg",
          0.92,
        ),
      );
      setBlob(output);
      setResult(URL.createObjectURL(output));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!blob || !file) return;
    setBusy(true);
    try {
      const [original, merged] = await Promise.all([
        upload(file),
        upload(blob),
      ]);
      record(7, { original, merged });
      setError("已提交云端保存；请查看页面底部同步状态。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {!c.sky ? (
        <Empty text="等待管理员寄来第一片天空。" />
      ) : (
        <>
          <div className="sky-pair">
            <div>
              <img src={c.sky} alt="对方拍摄的天空" />
              <span>我的天空</span>
            </div>
            <label>
              {url ? (
                <img src={url} alt="你上传的天空" />
              ) : (
                <span>
                  <Upload size={23} />
                  <br />
                  寄来你的天空
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setResult("");
                  setBlob(null);
                }}
              />
              <small>你的天空 · 点击更换</small>
            </label>
          </div>
          <button
            className="primary"
            disabled={!file || busy}
            onClick={() => void blend()}
          >
            {busy
              ? "正在处理…"
              : result
                ? "重新融合我们的天空"
                : "融合我们的天空"}{" "}
            ✧
          </button>
        </>
      )}
      {error && (
        <p role="status" className="error">
          {error}
        </p>
      )}
      {result && (
        <>
          <img
            className="merged-sky"
            src={result}
            alt="由两张天空照片渐变融合的新图片"
          />
          <div className="actions">
            <button
              disabled={busy}
              onClick={() => blob && download(blob, "our-starry-sky.jpg")}
            >
              <Download size={15} /> 保存到设备
            </button>
            <button disabled={busy} onClick={() => void save()}>
              收藏到云端
            </button>
          </div>
          <small className="muted">
            Safari 可点击保存，或长按合成图片存储到“照片”。
          </small>
        </>
      )}
    </>
  );
}
function Letter({ config: c, record }: Props) {
  const [open, setOpen] = useState(false),
    [unfold, setUnfold] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <>
      <div
        className={`letter-scene ${open ? "opened" : ""} ${unfold ? "unfolded" : ""}`}
        style={{ "--envelope": c.letter.envelope } as React.CSSProperties}
      >
        <div className="envelope">
          <div className="envelope-back" />
          <article
            className="letter-paper"
            style={{ fontFamily: c.letter.font }}
          >
            <h3>{c.letter.title}</h3>
            {c.letter.image && <img src={c.letter.image} alt="专属信件原图" />}
            <div>{c.letter.body}</div>
          </article>
          <div className="envelope-front" />
          <div className="envelope-flap" />
          <span className="wax-seal">✦</span>
        </div>
      </div>
      {!open ? (
        <button
          className="primary"
          onClick={() => {
            setOpen(true);
            timer.current = setTimeout(() => {
              setUnfold(true);
              record(9, { opened: true });
            }, 2700);
          }}
        >
          <Mail size={16} /> 亲手打开这封信
        </button>
      ) : (
        <p className="centered muted">
          {unfold ? "慢慢读，我一直都在。" : "有些心意，正在缓缓展开…"}
        </p>
      )}
    </>
  );
}
function Birthday({ config: c, record, progress }: Props) {
  const [segment, setSegment] = useState(0),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState(""),
    [wish, setWish] = useState(""),
    [blown, setBlown] = useState(false),
    [out, setOut] = useState(false);
  const audio = useRef<HTMLAudioElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pendingPlay = useRef(false);
  const ready =
    c.birthday.segments.length > 0 && segment >= c.birthday.segments.length;
  const doneRef = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      audio.current?.pause();
    },
    [],
  );
  const palette = (progress.results["2"] as { colors?: string[] } | undefined)
    ?.colors;
  async function playNext() {
    if (
      playing ||
      pendingPlay.current ||
      ready ||
      !c.birthday.segments.length ||
      !audio.current
    )
      return;
    pendingPlay.current = true;
    setError("");
    try {
      if (audio.current.error) audio.current.load();
      await audio.current.play();
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
      setError(`播放失败，点击背景重试。${(e as Error).message}`);
    } finally {
      pendingPlay.current = false;
    }
  }
  return (
    <div
      className={`birthday-scene ${blown ? "blown" : ""}`}
      style={
        { "--party-accent": palette?.[0] || "#b5a0cf" } as React.CSSProperties
      }
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("button,input,textarea,a"))
          void playNext();
      }}
    >
      <div className="cake-halo" />
      <div className="cake">
        <div className="candles">
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="candle" key={i}>
              <i className="flame" />
              <span />
            </div>
          ))}
        </div>
        <div className="cake-top">19</div>
        <div className="cake-layer" />
        <div className="cake-plate" />
      </div>
      {!c.birthday.segments.length ? (
        <Empty text="生日歌还未上传，蜡烛暂时不能吹灭。" />
      ) : !ready ? (
        <>
          <p className="birthday-instruction">
            {playing
              ? "这段旋律，只唱给你听…"
              : "轻点这片星空，播放下一段生日歌"}
          </p>
          <div className="segment-dots">
            {c.birthday.segments.map((s, i) => (
              <span
                key={s.id}
                className={
                  i < segment
                    ? "done"
                    : i === segment && playing
                      ? "playing"
                      : ""
                }
              />
            ))}
          </div>
          <small>
            第 {Math.min(segment + 1, c.birthday.segments.length)} /{" "}
            {c.birthday.segments.length} 段 · {playing ? "播放中" : "等待轻点"}
          </small>
          <button
            className="subtle"
            disabled={playing}
            onClick={() => void playNext()}
          >
            {playing ? "正在播放，请稍候" : "播放下一段"}
          </button>
          <audio
            ref={audio}
            src={c.birthday.segments[segment]?.url}
            preload="auto"
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onEnded={() => {
              if (doneRef.current) return;
              doneRef.current = true;
              setPlaying(false);
              setSegment((i) => i + 1);
            }}
            onLoadedMetadata={() => {
              doneRef.current = false;
            }}
            onError={() => {
              setPlaying(false);
              setError("音频加载失败，请检查网络后点击重试。");
            }}
          />
          {c.birthday.segments[segment + 1] && (
            <audio
              src={c.birthday.segments[segment + 1].url}
              preload="auto"
              aria-hidden="true"
            />
          )}
        </>
      ) : !blown ? (
        <div className="wish-form">
          <h3>现在，可以许愿了</h3>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            maxLength={2000}
            placeholder="写下愿望，或在心里默默许愿…"
            aria-label="生日愿望"
          />
          <button
            className="primary"
            onClick={() => {
              if (!ready) return;
              setBlown(true);
              timer.current = setTimeout(() => {
                setOut(true);
                record(10, { wish, songsCompleted: true, candlesOut: true });
              }, 1600);
            }}
          >
            许好了，吹灭蜡烛
          </button>
          <small>写下的愿望会保存，管理员可以查看。</small>
        </div>
      ) : (
        <div className="final-wish">
          <h3>Happy 19th Birthday</h3>
          <p>{c.birthday.message}</p>
          <small>
            {out
              ? "轻点背景，让烟花为你盛开。"
              : "愿你的每个心愿，都慢慢实现。"}
          </small>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {out && <Fireworks />}
    </div>
  );
}
