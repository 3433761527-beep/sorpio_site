import { useEffect, useRef, useState } from "react";
import { youtubeId } from "./youtube";
type Player = { destroy: () => void; getIframe: () => HTMLIFrameElement };
type API = {
  Player: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => Player;
};
const ytWindow = window as Window & {
  YT?: API;
  onYouTubeIframeAPIReady?: () => void;
};
let loading: Promise<API> | null = null;
function loadAPI() {
  if (ytWindow.YT?.Player) return Promise.resolve(ytWindow.YT);
  if (loading) return loading;
  loading = new Promise<API>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    const prior = ytWindow.onYouTubeIframeAPIReady;
    const timer = setTimeout(() => {
      script.remove();
      reject(Error("连接官方播放器超时，请检查网络后重试。"));
    }, 15000);
    ytWindow.onYouTubeIframeAPIReady = () => {
      prior?.();
      clearTimeout(timer);
      if (ytWindow.YT?.Player) resolve(ytWindow.YT);
      else reject(Error("播放器暂时不可用"));
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      reject(Error("无法连接YouTube，请检查网络后重试。"));
    };
    document.head.append(script);
  }).catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}
export default function YouTubeMV({
  url,
  title,
  onPlaying,
}: {
  url: string;
  title: string;
  onPlaying: () => void;
}) {
  const id = youtubeId(url),
    host = useRef<HTMLDivElement>(null),
    callback = useRef(onPlaying);
  callback.current = onPlaying;
  const [open, setOpen] = useState(false),
    [attempt, setAttempt] = useState(0),
    [status, setStatus] = useState(""),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!open || !id) return;
    let disposed = false,
      player: Player | undefined,
      recorded = false;
    setStatus("正在连接官方播放器…");
    const timeout = setTimeout(() => {
      if (!disposed)
        setStatus("播放器加载较慢。请检查能否访问YouTube，或打开原站观看。");
    }, 18000);
    loadAPI()
      .then((api) => {
        if (disposed || !host.current) return;
        const mount = document.createElement("div");
        host.current.replaceChildren(mount);
        player = new api.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "270",
          videoId: id,
          playerVars: {
            playsinline: 1,
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            origin: location.origin,
          },
          events: {
            onReady: () => {
              if (!disposed) {
                clearTimeout(timeout);
                setStatus("轻点播放器中的播放按钮，听完整首MV。");
                const frame = player?.getIframe();
                if (frame) {
                  frame.title = "官方MV播放器";
                  frame.referrerPolicy = "strict-origin-when-cross-origin";
                  frame.allow =
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                  frame.allowFullscreen = true;
                }
              }
            },
            onStateChange: (event: { data: number }) => {
              if (disposed) return;
              setPlaying(event.data === 1);
              if (event.data === 1) {
                setStatus("官方MV正在播放");
                if (!recorded) {
                  recorded = true;
                  callback.current();
                }
              } else if (event.data === 2) setStatus("MV已暂停");
              else if (event.data === 0)
                setStatus("MV播放结束，愿这段旋律陪着你。");
            },
            onError: () => {
              if (!disposed) {
                clearTimeout(timeout);
                setPlaying(false);
                setStatus(
                  "官方播放器暂时无法播放。视频可能限制嵌入，或当前网络无法访问YouTube。请打开原站观看。",
                );
              }
            },
          },
        });
      })
      .catch((e) => {
        if (!disposed) {
          clearTimeout(timeout);
          setStatus(e.message);
        }
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      player?.destroy();
    };
  }, [open, id, attempt]);
  if (!id)
    return <p role="alert">MV链接无效，请管理员填写YouTube的HTTPS视频链接。</p>;
  return (
    <div className={`mv-card ${playing ? "music-playing" : ""}`}>
      <span className="eyebrow">AN OFFICIAL MUSIC VIDEO</span>
      <h3>{title} · 官方MV</h3>
      {!open ? (
        <button className="primary" onClick={() => setOpen(true)}>
          打开官方MV播放器 ↗
        </button>
      ) : (
        <div className="mv-frame" ref={host} />
      )}
      <p role="status" className="muted">
        {status || "点击后连接YouTube；不会自动播放。"}
      </p>
      <p className="muted">
        需要能够访问YouTube的网络。视频关闭后会停止播放，不能作为跨页面背景音频。
      </p>
      <div className="mv-actions">
        {open && (
          <button onClick={() => setAttempt((n) => n + 1)}>重新连接</button>
        )}
        <a
          href={"https://www.youtube.com/watch?v=" + id}
          target="_blank"
          rel="noreferrer"
        >
          在YouTube打开完整MV ↗
        </a>
      </div>
    </div>
  );
}
