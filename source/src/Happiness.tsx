import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Mail,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Check,
} from "lucide-react";
import { type Config } from "./model";
type Keepsakes = {
  favorites: number[];
  hugs: number;
  moments: { id: string; text: string; date: string }[];
};
const empty: Keepsakes = { favorites: [], hugs: 0, moments: [] };
export function Bunny({ hug = false }: { hug?: boolean }) {
  return (
    <svg
      className={`moon-bunny ${hug ? "hugging" : ""}`}
      viewBox="0 0 160 180"
      role="img"
      aria-label="原创星星邮差小兔"
    >
      <defs>
        <radialGradient id="bunny-fur">
          <stop stopColor="#fff8f2" />
          <stop offset="1" stopColor="#e5dce8" />
        </radialGradient>
        <linearGradient id="bunny-scarf" x2="1" y2="1">
          <stop stopColor="#d7c3e9" />
          <stop offset="1" stopColor="#b4a0d0" />
        </linearGradient>
      </defs>
      <ellipse cx="82" cy="167" rx="38" ry="5" fill="#aa87bf" opacity=".12" />
      <g className="bunny-body">
        <g className="bunny-ears">
          <ellipse
            cx="57"
            cy="48"
            rx="12"
            ry="34"
            transform="rotate(-13 57 48)"
            fill="url(#bunny-fur)"
          />
          <ellipse
            cx="58"
            cy="47"
            rx="5"
            ry="23"
            transform="rotate(-13 58 47)"
            fill="#edc6d8"
          />
          <path
            d="M94 72C83 56 87 12 101 14C116 16 109 42 108 51C106 63 109 70 107 75"
            fill="url(#bunny-fur)"
          />
          <path
            d="M99 59C94 46 96 25 101 25C106 26 103 48 102 59"
            fill="#edc6d8"
          />
        </g>
        <ellipse cx="82" cy="132" rx="29" ry="32" fill="url(#bunny-fur)" />
        <ellipse cx="63" cy="158" rx="15" ry="8" fill="#e9deed" />
        <ellipse cx="102" cy="158" rx="15" ry="8" fill="#e9deed" />
        <ellipse cx="81" cy="86" rx="40" ry="33" fill="url(#bunny-fur)" />
        <ellipse cx="55" cy="95" rx="10" ry="5" fill="#efbfce" opacity=".7" />
        <ellipse cx="107" cy="95" rx="10" ry="5" fill="#efbfce" opacity=".7" />
        <g className="bunny-eyes" fill="#65546d">
          <ellipse cx="66" cy="86" rx="2.8" ry="3.5" />
          <ellipse cx="96" cy="86" rx="2.8" ry="3.5" />
        </g>
        <path
          d="M77 94Q81 100 85 94M81 94V97"
          fill="none"
          stroke="#967a93"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M57 113Q82 121 107 112L107 123Q83 133 57 124Z"
          fill="url(#bunny-scarf)"
        />
        <path d="M95 121L108 126L103 148L92 143Z" fill="#c4afdc" />
        <g className="bunny-letter">
          <rect
            x="59"
            y="128"
            width="45"
            height="28"
            rx="4"
            fill="#f3e4d9"
            transform="rotate(-7 81 142)"
          />
          <path
            d="m60 132 22 12 20-17"
            stroke="#c4a6b7"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M81 140C75 134 70 142 82 149C94 140 87 134 81 140"
            fill="#d39bb7"
          />
        </g>
        <g className="bunny-paws" fill="url(#bunny-fur)">
          <ellipse
            cx="56"
            cy="136"
            rx="9"
            ry="13"
            transform="rotate(-32 56 136)"
          />
          <ellipse
            cx="106"
            cy="136"
            rx="9"
            ry="13"
            transform="rotate(32 106 136)"
          />
        </g>
        <path d="m117 64 3 7 7 2-7 3-3 7-3-7-7-3 7-2z" fill="#e6cb91" />
      </g>
    </svg>
  );
}
export default function Happiness({
  personal,
  value,
  onSave,
  disabled = false,
}: {
  personal: Config["personal"];
  value: unknown;
  onSave: (v: Keepsakes) => void;
  disabled?: boolean;
}) {
  const data = { ...empty, ...(value as Partial<Keepsakes> | undefined) };
  const [mode, setMode] = useState<"notes" | "jar" | "hug" | null>(null),
    [index, setIndex] = useState(0),
    [moment, setMoment] = useState(""),
    [hugging, setHugging] = useState(false),
    [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const notes = personal.notes.length
    ? personal.notes
    : ["愿你每天，都有一点小小的幸福。"];
  function hug() {
    setMode("hug");
    setHugging(true);
    onSave({ ...data, hugs: data.hugs + 1 });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHugging(false), 2600);
  }
  return (
    <section
      className={`happiness-station ${mode ? "expanded" : ""}`}
      aria-label={`${personal.name}的幸福补给站`}
    >
      <div className="happiness-summary">
        <button
          className="bunny-greeting"
          aria-label="让星星邮差送来一个拥抱"
          onClick={hug}
          disabled={disabled}
        >
          <Bunny hug={hugging} />
          <span className="bunny-sparkle one">✧</span>
          <span className="bunny-sparkle two">♡</span>
        </button>
        <div className="happiness-copy">
          <span className="eyebrow">A LITTLE EXTRA LOVE</span>
          <h2>
            {personal.name}的幸福补给站 <span>♡</span>
          </h2>
          <p>{personal.dedication}</p>
          <div className="happiness-actions">
            <button disabled={disabled} onClick={hug}>
              <Heart size={12} /> 领取一个抱抱
            </button>
            <button
              disabled={disabled}
              onClick={() => {
                setMode(mode === "notes" ? null : "notes");
                setNotice("");
              }}
            >
              <Mail size={12} /> {notes.length} 张偏爱小纸条
            </button>
            <button
              disabled={disabled}
              onClick={() => {
                setMode(mode === "jar" ? null : "jar");
                setNotice("");
              }}
            >
              <Sparkles size={12} /> 幸福存钱罐
            </button>
          </div>
        </div>
      </div>
      {mode && (
        <div className={`happiness-panel ${mode}`}>
          <button
            className="happiness-close"
            onClick={() => setMode(null)}
            aria-label="收起幸福小惊喜"
          >
            <X size={15} />
          </button>
          {mode === "hug" ? (
            <div className="hug-note" key={data.hugs}>
              <div className="hug-hearts" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--heart-x": `${(i - 4) * 24}px`,
                        "--heart-delay": `${i * 0.1}s`,
                      } as React.CSSProperties
                    }
                  >
                    ♡
                  </i>
                ))}
              </div>
              <span className="tiny-heart">♡</span>
              <h3>{personal.name}，给你一个认真准备的抱抱。</h3>
              <p>
                今天辛苦了。开心可以分享，难过也可以慢慢说。
                <br />
                这一小会儿，安心做个被照顾的人吧。
              </p>
              <small>星星邮差已送达第 {data.hugs} 个抱抱</small>
              <button className="subtle" disabled={disabled} onClick={hug}>
                再抱一会儿 <Heart size={12} />
              </button>
            </div>
          ) : mode === "notes" ? (
            <div className="love-note">
              <span className="note-pin">✦</span>
              <small>
                JUST FOR {personal.name} · {String(index + 1).padStart(2, "0")}{" "}
                / {notes.length}
              </small>
              <p key={index}>{notes[index]}</p>
              <div className="note-controls">
                <button
                  aria-label="上一张偏爱小纸条"
                  onClick={() =>
                    setIndex((i) => (i - 1 + notes.length) % notes.length)
                  }
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  disabled={disabled}
                  className={data.favorites.includes(index) ? "bookmarked" : ""}
                  onClick={() => {
                    onSave({
                      ...data,
                      favorites: data.favorites.includes(index)
                        ? data.favorites.filter((n) => n !== index)
                        : [...data.favorites, index],
                    });
                    setNotice(
                      data.favorites.includes(index)
                        ? "已从收藏中取出"
                        : "这份偏爱，已经替你收好。",
                    );
                  }}
                >
                  {data.favorites.includes(index) ? (
                    <Check size={12} />
                  ) : (
                    <Bookmark size={12} />
                  )}{" "}
                  {data.favorites.includes(index) ? "已经收好" : "把这句话收好"}
                </button>
                <button
                  aria-label="下一张偏爱小纸条"
                  onClick={() => {
                    setIndex((i) => (i + 1) % notes.length);
                    setNotice("");
                  }}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
              {notice && (
                <p className="keepsake-notice" role="status">
                  {notice} · 保存状态见页面底部
                </p>
              )}
              <div className="favorite-notes">
                {data.favorites.map(
                  (i) =>
                    notes[i] && (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`查看收藏的第${i + 1}张小纸条`}
                      >
                        ♡ {String(i + 1).padStart(2, "0")}
                      </button>
                    ),
                )}
              </div>
            </div>
          ) : (
            <div className="happiness-jar">
              <span className="jar-illustration" aria-hidden="true">
                ✧<i>♡</i>✧
              </span>
              <h3>把今天的一点幸福，存起来。</h3>
              <p>
                喜欢的甜点、一句被记住的话、一个好天气…
                <br />
                你的小小开心，我也想认真珍藏。
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!moment.trim()) return;
                  onSave({
                    ...data,
                    moments: [
                      {
                        id: crypto.randomUUID(),
                        text: moment.trim(),
                        date: new Date().toISOString(),
                      },
                      ...data.moments,
                    ].slice(0, 100),
                  });
                  setMoment("");
                  setNotice("又存好一颗幸福糖。保存状态见页面底部。");
                }}
              >
                <label className="sr-only" htmlFor="happy-moment">
                  今天的幸福瞬间
                </label>
                <input
                  id="happy-moment"
                  maxLength={120}
                  value={moment}
                  onChange={(e) => setMoment(e.target.value)}
                  placeholder="今天让我开心的一件小事…"
                  required
                />
                <button
                  disabled={disabled || !moment.trim()}
                  aria-label="存入幸福瞬间"
                >
                  <Heart size={15} />
                </button>
              </form>
              {notice && (
                <p className="keepsake-notice" role="status">
                  {notice}
                </p>
              )}
              <div className="happy-moments">
                {data.moments.map((m) => (
                  <div key={m.id}>
                    <span>✧</span>
                    <p>
                      {m.text}
                      <small>
                        {new Date(m.date).toLocaleDateString("zh-CN")}
                      </small>
                    </p>
                    <button
                      aria-label={`移除幸福瞬间：${m.text}`}
                      disabled={disabled}
                      onClick={() =>
                        onSave({
                          ...data,
                          moments: data.moments.filter((x) => x.id !== m.id),
                        })
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <small className="jar-privacy">
                收藏的小纸条和幸福瞬间会保存，送礼人可以在后台查看。
              </small>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
