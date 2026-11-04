import { useEffect, useRef, useState } from "react";

export function IllustratedGirl({ host = false }: { host?: boolean }) {
  return (
    <svg
      viewBox="0 0 240 330"
      className={`illustrated-girl ${host ? "host-girl" : "phone-girl"}`}
      aria-hidden="true"
    >
      <ellipse cx="120" cy="315" rx="66" ry="9" fill="#b391ce" opacity=".15" />
      <path
        d="M76 110Q52 46 88 28Q133-3 163 36Q195 64 169 164L69 161Z"
        fill={host ? "#382947" : "#50364f"}
      />
      <path
        d="M98 263L96 301Q87 317 104 315L115 306L116 263M133 263L135 303Q137 317 151 315L153 308L150 263"
        fill="#f4d2cb"
        stroke="#ddadb9"
        strokeWidth="2"
      />
      <path
        d="M91 308Q98 300 111 306L110 317L87 317Q83 311 91 308M136 306Q146 301 154 308L158 317L136 317Z"
        fill="#bb99c5"
      />
      <path
        d="M95 145Q119 132 144 145L165 266Q121 287 74 266Z"
        fill={host ? "#d6c4ec" : "#efc8d8"}
        stroke="#f6e8fb"
        strokeWidth="2"
      />
      <path
        d="M95 148L119 175L144 148M84 231Q120 250 157 231M81 250Q121 270 161 250"
        fill="none"
        stroke="#fdf3ff"
        strokeWidth="4"
        opacity=".75"
      />
      <path d="M114 144L121 167L128 144" fill="#fff1e0" />
      <g className="girl-arm-wave">
        <path
          d="M146 151Q174 171 182 137L186 110"
          fill="none"
          stroke="#d6c4ec"
          strokeWidth="19"
          strokeLinecap="round"
        />
        <path
          d="M186 113L184 96M186 112L194 98M186 112L199 106"
          stroke="#f4d2cb"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M94 155Q72 174 82 198L108 194"
        fill="none"
        stroke={host ? "#d6c4ec" : "#efc8d8"}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <ellipse cx="120" cy="84" rx="43" ry="49" fill="#f7dcd1" />
      <path
        d="M76 80Q74 27 119 26Q165 24 166 81L152 57L145 68L128 43Q113 67 76 80"
        fill={host ? "#382947" : "#50364f"}
      />
      <g className="girl-eyes" fill="#49364b">
        <ellipse cx="102" cy="88" rx="3.3" ry="5" />
        <ellipse cx="138" cy="88" rx="3.3" ry="5" />
      </g>
      <g fill="#ed9db3" opacity=".55">
        <ellipse cx="91" cy="102" rx="9" ry="4" />
        <ellipse cx="149" cy="102" rx="9" ry="4" />
      </g>
      <path
        d="M113 105Q120 113 128 105"
        fill="none"
        stroke="#b37388"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M155 46L159 37L164 46L174 49L164 53L160 63L156 53L146 49Z"
        fill="#f6dfab"
      />
      <path
        d="M118 190L123 180L128 190L139 192L130 200L132 210L122 205L112 210L114 200L106 192Z"
        fill="#f3dfb5"
      />
      {!host && (
        <g className="girl-phone">
          <rect
            x="101"
            y="157"
            width="33"
            height="58"
            rx="6"
            fill="#777297"
            stroke="#f2e5fc"
            strokeWidth="2"
          />
          <rect x="105" y="163" width="25" height="43" rx="3" fill="#c7b6ef" />
          <path
            d="M113 180L118 171L123 180L130 184L122 188L118 197L114 188L107 184Z"
            fill="#fff4ce"
          />
          <path
            className="phone-tap-hand"
            d="M151 202L127 186"
            stroke="#f7dcd1"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

export default function Opening({
  name,
  sender,
  onClose,
}: {
  name: string;
  sender: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skip.current?.focus();
    const timers = [
      window.setTimeout(() => setPhase(1), 3900),
      window.setTimeout(() => setPhase(2), 6900),
      window.setTimeout(() => setPhase(3), 10800),
    ];
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLButtonElement>(".opening button"),
        ).filter((b) => b.offsetParent !== null);
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className={`opening opening-phase-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${sender}的星空邀请`}
    >
      <div className="opening-grain" />
      <div className="opening-top">
        <span>A LETTER FROM THE STARS</span>
        <button ref={skip} onClick={onClose}>
          跳过开场 ↗
        </button>
      </div>
      <div className="opening-stars" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 37 + 7) % 100}%`,
              top: `${(i * 53 + 11) % 100}%`,
              animationDelay: `${i * -0.31}s`,
            }}
          />
        ))}
      </div>
      <div className="opening-phone-scene" aria-hidden={phase > 0}>
        <div className="room-moon" />
        <div className="room-window" />
        <div className="phone-girl-wrap">
          <IllustratedGirl />
        </div>
        <div className="touch-ring" />
        <div className="room-floor" />
      </div>
      <div className="phone-portal" aria-hidden="true">
        <div />
        <i />
        <i />
        <i />
        <span>✦</span>
      </div>
      <div className="opening-host" aria-hidden={phase < 2}>
        <div className="host-orbit" />
        <IllustratedGirl host />
        <span className="host-name">{sender} · 在星光里等你</span>
      </div>
      <div className="opening-copy" aria-live="polite" key={phase}>
        <span className="eyebrow">
          {
            [
              "01 · A LITTLE TOUCH",
              "02 · INTO YOUR UNIVERSE",
              "03 · SOMEONE IS WAITING",
              "11.09 · ONLY FOR YOU",
            ][phase]
          }
        </span>
        <h1>
          {phase === 0
            ? "轻触一下，惊喜正在靠近。"
            : phase === 1
              ? "穿过这一束光，抵达我们的星空。"
              : phase === 2
                ? `${name}，19岁生日快乐。`
                : `我是${sender}，想把这片星空送给你。`}
        </h1>
        <p>
          {phase === 0
            ? "一个平常的夜晚，一份只属于你的邀请。"
            : phase === 1
              ? "现实慢慢退后，星星开始为你亮起。"
              : phase === 2
                ? "你的每一岁、每一种心情，我都想认真珍藏。"
                : "一起走走吧。11颗星星，藏着我为你准备的小小心意。"}
        </p>
        {phase === 3 && (
          <button className="opening-enter" onClick={onClose}>
            牵住星光，一起出发 <span>✧</span>
          </button>
        )}
      </div>
      <div className="opening-progress" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i className={phase >= i ? "lit" : ""} key={i} />
        ))}
      </div>
    </div>
  );
}

const symbols = ["♫", "♡", "◒", "✿", "▧", "19", "▱", "☁", "❞", "✉", "♧"];
export function StageAtmosphere({ id }: { id: number }) {
  return (
    <div className={`stage-atmosphere atmosphere-${id}`} aria-hidden="true">
      <span>{symbols[id]}</span>
      <i />
      <i />
      <i />
      <i />
      <i />
      <svg viewBox="0 0 240 50">
        <path d="M0 35Q60 5 120 28T240 18" />
        <path d="M0 44Q60 14 120 37T240 27" />
      </svg>
    </div>
  );
}
export function CompletionBloom() {
  return (
    <div className="completion-bloom" aria-hidden="true">
      {Array.from({ length: 20 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--angle": `${i * 18}deg`,
              "--reach": `${65 + (i % 4) * 24}px`,
              animationDelay: `${(i % 3) * 0.07}s`,
            } as React.CSSProperties
          }
        >
          ✦
        </i>
      ))}
    </div>
  );
}
