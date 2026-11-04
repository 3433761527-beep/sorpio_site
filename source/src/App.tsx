import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  Headphones,
  Music2,
  Volume2,
  Sparkles,
  Settings,
  Check,
  X,
  Heart,
  RotateCcw,
} from "lucide-react";
import {
  defaults,
  emptyProgress,
  names,
  subtitles,
  type Config,
  type Progress,
} from "./model";
import { cloud, getConfig, loadProgress, saveProgress } from "./cloud";
import { Starfield } from "./Effects";
import { Stage } from "./Stages";
import Admin from "./Admin";
import StarMap from "./StarMap";
import Happiness from "./Happiness";
import GameRoom from "./GameRoom";
import Opening, { CompletionBloom, StageAtmosphere } from "./Opening";
export default function App() {
  const [config, setConfig] = useState<Config>(defaults),
    [progress, setProgress] = useState<Progress>(emptyProgress),
    [active, setActive] = useState<number | null>(null),
    [admin, setAdmin] = useState(
      /\/admin\/?$/.test(location.pathname) || location.hash === "#admin",
    ),
    [status, setStatus] = useState("正在读取星空…"),
    [ready, setReady] = useState(false),
    [help, setHelp] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [introVisible, setIntroVisible] = useState(() => {
    try {
      return sessionStorage.getItem("starry-opening-seen") !== "1";
    } catch {
      return true;
    }
  });
  const [bloom, setBloom] = useState(0);
  const closeIntro = useCallback(() => {
    setIntroVisible(false);
    try {
      sessionStorage.setItem("starry-opening-seen", "1");
    } catch {
      /* Private browsing can reject storage. */
    }
  }, []);
  useEffect(() => {
    if (!bloom) return;
    const timer = setTimeout(() => setBloom(0), 1900);
    return () => clearTimeout(timer);
  }, [bloom]);
  const audio = useRef<HTMLAudioElement>(null);
  const pending = useRef<Progress | null>(null);
  const current = useRef<Progress>(emptyProgress);
  const chain = useRef(Promise.resolve());
  const visited = Array.from(
    new Set([
      ...((progress.results.exploration as { visited?: number[] } | undefined)
        ?.visited || []),
      ...progress.completed,
    ]),
  );
  function openStage(id: number) {
    const p = current.current;
    const known = Array.from(
      new Set([
        ...((p.results.exploration as { visited?: number[] } | undefined)
          ?.visited || []),
        ...p.completed,
      ]),
    );
    const next = names.findIndex((_, i) => !known.includes(i));
    if (!known.includes(id) && next !== -1 && id !== next) return;
    if (!known.includes(id))
      commit({
        ...p,
        results: { ...p.results, exploration: { visited: [...known, id] } },
        updatedAt: new Date().toISOString(),
      });
    setActive(id);
  }
  useEffect(() => {
    Promise.all([getConfig(), loadProgress()])
      .then(([c, p]) => {
        setConfig(c);
        setProgress(p);
        current.current = p;
        setReady(true);
        setStatus(cloud ? "云端已连接" : "本机预览 · 尚未连接云端");
      })
      .catch((e) => {
        setStatus(`连接失败：${e.message}；请重试`);
      });
  }, []);
  useEffect(() => {
    if (active === null && !help) return;
    const prev = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>(".stage-modal");
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        setHelp(false);
      }
      if (e.key === "Tab" && dialog) {
        const items = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a,input:not(:disabled),textarea,select",
          ),
        ).filter((x) => x.offsetParent !== null);
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
    addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      removeEventListener("keydown", key);
      prev?.focus();
    };
  }, [active, help]);
  useEffect(() => {
    if (active !== null && active !== 0) {
      audio.current?.pause();
      setPlaying(false);
    }
  }, [active]);
  useEffect(() => {
    const cb = () =>
      setAdmin(
        location.hash === "#admin" || /\/admin\/?$/.test(location.pathname),
      );
    addEventListener("hashchange", cb);
    return () => removeEventListener("hashchange", cb);
  }, []);
  function saveBonus(value: unknown) {
    saveExtra("happiness", value);
  }
  function saveExtra(key: string, value: unknown) {
    commit({
      ...current.current,
      results: { ...current.current.results, [key]: value },
      updatedAt: new Date().toISOString(),
    });
  }
  function commit(next: Progress) {
    current.current = next;
    setProgress(next);
    pending.current = next;
    setStatus(cloud ? "正在保存到云端…" : "正在保存…");
    chain.current = chain.current.then(async () => {
      try {
        await saveProgress(next);
        if (pending.current === next) {
          pending.current = null;
          setStatus(cloud ? "已保存到云端" : "已保存于本机预览");
        }
      } catch (e) {
        setStatus(`保存失败，请点重试：${(e as Error).message}`);
      }
    });
  }
  function record(id: number, result: unknown, done = true) {
    const p = current.current;
    if (done && !p.completed.includes(id)) setBloom(Date.now());
    const next = {
      ...p,
      completed: done
        ? Array.from(new Set([...p.completed, id])).sort((a, b) => a - b)
        : p.completed,
      results: { ...p.results, [String(id)]: result },
      updatedAt: new Date().toISOString(),
    };
    commit(next);
  }
  async function retry() {
    try {
      if (pending.current) {
        await saveProgress(pending.current);
        pending.current = null;
      } else {
        const [c, p] = await Promise.all([getConfig(), loadProgress()]);
        setConfig(c);
        setProgress(p);
        current.current = p;
        setReady(true);
      }
      setStatus(cloud ? "云端已连接" : "本机预览 · 尚未连接云端");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function toggleMusic() {
    if (!audio.current || !config.music.url) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      try {
        if (audio.current.error) audio.current.load();
        await audio.current.play();
        setPlaying(true);
        record(0, { played: true });
      } catch (e) {
        setStatus(`音乐播放失败，请重试：${(e as Error).message}`);
      }
    }
  }
  function close() {
    setActive(null);
  }
  return (
    <>
      {introVisible && !admin && (
        <Opening
          name={config.personal?.name || "毛艺蓉"}
          sender={config.personal?.senderName || "李雨桐"}
          onClose={closeIntro}
        />
      )}
      {bloom > 0 && <CompletionBloom key={bloom} />}
      <div inert={introVisible && !admin}>
        <Starfield complete={progress.completed.length === 11} />
        <div className="nebula" />
        <audio
          ref={audio}
          src={config.music.url || undefined}
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {admin ? (
          <Admin
            config={config}
            onPublished={setConfig}
            exit={() => {
              history.replaceState(null, "", import.meta.env.BASE_URL);
              setAdmin(false);
            }}
          />
        ) : (
          <>
            <header className="nav">
              <a href={import.meta.env.BASE_URL} className="brand">
                <span className="brand-star">✧</span> A LITTLE STARRY SKY
              </a>
              <nav>
                <span className="nav-date">
                  NOVEMBER 09 <i /> SCORPIO
                </span>
                <button
                  className={`sound-control ${playing ? "on" : ""}`}
                  onClick={() =>
                    config.music.url ? void toggleMusic() : openStage(0)
                  }
                  aria-label={playing ? "暂停音乐" : "开启音乐"}
                >
                  <Music2 size={15} />
                  <span>{playing ? "音乐播放中" : "开启音乐"}</span>
                  <span className="equalizer">
                    <i />
                    <i />
                    <i />
                  </span>
                </button>
              </nav>
            </header>
            <main className="home">
              <div className="intro">
                <div className="eyebrow">
                  <span /> A UNIVERSE, JUST FOR YOU <span />
                </div>
                <h1>
                  A Little <em>Starry Sky</em>
                </h1>
                <p className="intro-cn">
                  {config.personal?.name || "毛艺蓉"}，你的每一岁，我都很在意。
                </p>
                <p className="intro-sub">
                  11 颗星星，11 份小小的心意。
                  <br className="mobile-br" /> 你的生日故事，从这里开始。
                </p>
                <div className="birthday-tag">
                  <span>11.09</span>
                  <i />
                  <span>19 岁，正闪耀</span>
                  <Sparkles size={13} />
                </div>
              </div>
              <StarMap
                completed={progress.completed}
                ready={ready}
                visited={visited}
                open={openStage}
                visible={active === null}
                name={config.personal?.name || "毛艺蓉"}
              />

              <section className="journey-bar">
                <div className="journey-icon">✧</div>
                <div>
                  <p>
                    你的星空，正在一点点亮起{" "}
                    <span>
                      {progress.completed.length} <small>/ 11</small>
                    </span>
                  </p>
                  <div className="progress-track">
                    <i
                      style={{
                        width: `${(progress.completed.length / 11) * 100}%`,
                      }}
                    />
                  </div>
                  <small>
                    {progress.completed.length === 11
                      ? "天蝎座已点亮。愿你的每一天，都有星光。"
                      : "每一颗被点亮的星，都是属于你的独家记忆。"}
                  </small>
                </div>
                <button
                  className="journey-go"
                  disabled={!ready}
                  onClick={() => {
                    const next = names.findIndex(
                      (_, i) => !visited.includes(i),
                    );
                    const unfinished = names.findIndex(
                      (_, i) => !progress.completed.includes(i),
                    );
                    openStage(
                      next === -1
                        ? unfinished === -1
                          ? 10
                          : unfinished
                        : next,
                    );
                  }}
                  aria-label="继续探索"
                >
                  <ArrowRight size={19} />
                </button>
              </section>
              <Happiness
                disabled={!ready}
                personal={config.personal || defaults.personal}
                value={progress.results["happiness"]}
                onSave={(value) => saveBonus(value)}
              />
              <div className="home-note">
                <Headphones size={13} />
                <span>戴上耳机，慢慢探索。今晚，整个星空都属于你。</span>
                <button onClick={() => setHelp(true)}>
                  探索指南 <ArrowUpRight size={12} />
                </button>
                <button
                  className="replay-opening"
                  onClick={() => setIntroVisible(true)}
                >
                  重看雨桐的邀请 ✧
                </button>
              </div>
              {config.personal?.gamesEnabled !== false && (
                <GameRoom
                  name={config.personal?.name || "毛艺蓉"}
                  value={progress.results.games}
                  mergeValue={progress.results.game2048}
                  onMergeSave={(v) => saveExtra("game2048", v)}
                  onSave={(v) => saveExtra("games", v)}
                  disabled={!ready}
                />
              )}
            </main>
            <footer>
              <span>
                MADE WITH <Heart size={10} /> & A LITTLE STARDUST
              </span>
              <div>
                <button className="sync-status" onClick={() => void retry()}>
                  {status}
                </button>
                <a
                  href={`${import.meta.env.BASE_URL}admin/`}
                  onClick={(e) => {
                    e.preventDefault();
                    location.hash = "admin";
                    setAdmin(true);
                  }}
                  aria-label="管理员后台"
                >
                  <Settings size={13} />
                </a>
              </div>
            </footer>
            {active !== null && (
              <div
                className="modal-backdrop"
                onClick={(e) => {
                  if (e.target === e.currentTarget) close();
                }}
              >
                <section
                  key={active}
                  className="stage-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-label={names[active]}
                >
                  <div className="stage-top">
                    <button onClick={close}>
                      <ChevronLeft size={15} /> 返回星空
                    </button>
                    <span>STAR {String(active + 1).padStart(2, "0")} / 11</span>
                    <button onClick={close} aria-label="关闭">
                      <X size={19} />
                    </button>
                  </div>
                  <div className="stage-heading">
                    <span className="eyebrow">A LITTLE GIFT FOR YOU</span>
                    <h2>{names[active]}</h2>
                    <p>{subtitles[active]}</p>
                  </div>
                  <StageAtmosphere id={active} />
                  <Stage
                    key={active}
                    id={active}
                    config={config}
                    progress={progress}
                    record={record}
                    audio={audio}
                    playing={playing}
                    toggleMusic={toggleMusic}
                  />
                  <div className="stage-bottom">
                    {progress.completed.includes(active) ? (
                      <span className="saved">
                        <Check size={14} /> 这颗星星已被你点亮
                      </span>
                    ) : (
                      <span>✧ 每个小小的瞬间，都值得珍藏</span>
                    )}
                    <button
                      onClick={() =>
                        active < 10 ? openStage(active + 1) : close()
                      }
                    >
                      {active < 10 ? "下一颗星" : "回到星空"}{" "}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
              </div>
            )}
            {help && (
              <div className="modal-backdrop">
                <section
                  className="stage-modal guide"
                  role="dialog"
                  aria-modal="true"
                  aria-label="探索指南"
                >
                  <button
                    className="close"
                    onClick={() => setHelp(false)}
                    aria-label="关闭"
                  >
                    <X />
                  </button>
                  <span className="eyebrow">A SMALL GUIDE</span>
                  <h2>慢一点，也没关系。</h2>
                  <p>
                    沿着星图，从第一颗星开始。每颗星星都有一份独立的礼物；完成后，它会为你发光。
                  </p>
                  <p>
                    你的进度会自动保存。正式连接云端后，同一浏览器可继续上次旅程；清除浏览器数据会更换访客身份。
                  </p>
                  <p>
                    在 iPhone 的 Safari 中，点“分享 →
                    添加到主屏幕”，就能收藏这片星空。音乐需要你亲手轻点播放。
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      setHelp(false);
                      openStage(0);
                    }}
                  >
                    从第一颗星开始 <ArrowRight size={14} />
                  </button>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
