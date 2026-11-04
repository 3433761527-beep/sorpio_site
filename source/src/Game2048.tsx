import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { friends, SanrioFriend } from "./SanrioFriends";
import {
  hasMoves,
  slide,
  spawn,
  validTiles,
  type Direction,
  type Tile,
} from "./merge-engine";
type Snapshot = {
  tiles: Tile[];
  score: number;
  best: number;
  moves: number;
  continued: boolean;
  undo?: { tiles: Tile[]; score: number; moves: number };
};
function fresh(best = 0): Snapshot {
  return {
    tiles: spawn(spawn([])),
    score: 0,
    best,
    moves: 0,
    continued: false,
  };
}
function restore(value: unknown): Snapshot {
  const s = value as Snapshot | undefined;
  if (
    !s ||
    !validTiles(s.tiles) ||
    ![s.score, s.best, s.moves].every((n) => Number.isSafeInteger(n) && n >= 0)
  )
    return fresh();
  return {
    ...s,
    continued: s.continued === true,
    undo:
      s.undo &&
      validTiles(s.undo.tiles) &&
      [s.undo.score, s.undo.moves].every(
        (n) => Number.isSafeInteger(n) && n >= 0,
      )
        ? s.undo
        : undefined,
  };
}
export default function Game2048({
  name,
  value,
  onSave,
}: {
  name: string;
  value: unknown;
  onSave: (v: Snapshot) => void;
}) {
  const [state, setState] = useState(() => restore(value));
  const current = useRef(state);
  const [confirmReset, setConfirmReset] = useState(false);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const won = state.tiles.some((t) => t.n >= 2048) && !state.continued;
  const over = !hasMoves(state.tiles);
  function commit(s: Snapshot) {
    current.current = s;
    setState(s);
    onSave(s);
  }
  function move(d: Direction) {
    const s = current.current;
    if ((s.tiles.some((t) => t.n >= 2048) && !s.continued) || confirmReset)
      return;
    const m = slide(s.tiles, d);
    if (!m.changed) return;
    const score = s.score + m.score;
    commit({
      tiles: spawn(m.tiles),
      score,
      best: Math.max(s.best, score),
      moves: s.moves + 1,
      continued: s.continued,
      undo: { tiles: s.tiles, score: s.score, moves: s.moves },
    });
  }
  function key(e: KeyboardEvent) {
    const directions: Record<string, Direction> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
    };
    if (directions[e.key]) {
      e.preventDefault();
      move(directions[e.key]);
    }
  }
  function down(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
  }
  function up(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x,
      dy = e.clientY - g.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    move(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up",
    );
  }
  return (
    <div className="merge-game">
      <span className="eyebrow">TEN LITTLE FRIENDS · 2048</span>
      <h3>把可爱，一点点合在一起。</h3>
      <p className="merge-instructions">
        滑动棋盘，让相同数字合并。十位小伙伴，陪你向2048出发。
      </p>
      <div className="merge-scores">
        <span>
          本局 <b>{state.score}</b>
        </span>
        <span>
          最佳 <b>{state.best}</b>
        </span>
        <span>
          步数 <b>{state.moves}</b>
        </span>
      </div>
      <div className="merge-board-wrap">
        <div
          className="merge-board"
          role="group"
          aria-label="2048棋盘，滑动或使用方向键移动"
          tabIndex={0}
          onKeyDown={key}
          onPointerDown={down}
          onPointerUp={up}
          onPointerCancel={() => {
            gesture.current = null;
          }}
        >
          <div className="merge-cells" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          {state.tiles.map((t) => {
            const index = Math.min(9, Math.log2(t.n) - 1);
            return (
              <div
                key={t.id}
                className={`merge-tile level-${index} ${t.merged ? "tile-merged" : ""}`}
                style={{
                  left: `calc(${t.x} * (100% + var(--tile-gap)) / 4)`,
                  top: `calc(${t.y} * (100% + var(--tile-gap)) / 4)`,
                }}
                aria-label={`${t.n}，${friends[index]}，第${t.y + 1}行第${t.x + 1}列`}
              >
                <div className="merge-tile-inner">
                  <SanrioFriend index={index} />
                  <strong>{t.n}</strong>
                </div>
              </div>
            );
          })}
        </div>
        {(won || over || confirmReset) && (
          <div
            className="merge-overlay"
            role="group"
            aria-label={
              won ? "2048达成" : confirmReset ? "重新开始确认" : "本局结束"
            }
          >
            <span className="merge-celebrate">{won ? "✧" : "♡"}</span>
            <h4>
              {confirmReset
                ? "开始新的一局？"
                : won
                  ? `${name}，2048达成！`
                  : "小伙伴们都挤在一起啦"}
            </h4>
            <p>
              {confirmReset
                ? "当前棋盘会重置，最佳成绩会保留。"
                : won
                  ? "愿快乐也像方块一样，越积越多。"
                  : "没有可以合并的数字了。休息一下，再试一次。"}
            </p>
            {confirmReset ? (
              <>
                <button
                  onClick={() => {
                    commit(fresh(current.current.best));
                    setConfirmReset(false);
                  }}
                >
                  重新开始
                </button>
                <button onClick={() => setConfirmReset(false)}>接着玩</button>
              </>
            ) : won ? (
              <button
                onClick={() => commit({ ...current.current, continued: true })}
              >
                继续收集快乐
              </button>
            ) : (
              <button onClick={() => commit(fresh(current.current.best))}>
                再来一局
              </button>
            )}
          </div>
        )}
      </div>
      <p className="merge-status" aria-live="polite">
        {state.moves
          ? `已走${state.moves}步 · 当前最高方块${Math.max(...state.tiles.map((t) => t.n))}`
          : "向任意方向滑动，开始你的第一步。"}
      </p>
      <div className="merge-controls">
        <button
          disabled={!state.undo || confirmReset}
          onClick={() => {
            const s = current.current;
            if (s.undo)
              commit({
                ...s,
                ...s.undo,
                continued: s.continued,
                undo: undefined,
              });
          }}
        >
          ↶ 撤回一步
        </button>
        <button onClick={() => setConfirmReset(true)}>重新开始</button>
      </div>
      <div className="merge-directions" aria-label="方向控制">
        {(
          [
            ["up", "↑"],
            ["left", "←"],
            ["down", "↓"],
            ["right", "→"],
          ] as const
        ).map(([d, label]) => (
          <button
            key={d}
            onClick={() => move(d)}
            disabled={won || over || confirmReset}
            aria-label={`向${{ up: "上", left: "左", down: "下", right: "右" }[d]}移动`}
          >
            {label}
          </button>
        ))}
      </div>
      <details className="friend-collection">
        <summary>认识十位小伙伴 · 数字图鉴</summary>
        <div>
          {friends.map((f, i) => (
            <span key={f}>
              <SanrioFriend index={i} />
              <b>{2 ** (i + 1)}</b>
              <small>{f}</small>
            </span>
          ))}
        </div>
        <p>
          角色顺序参考
          <a
            href="https://corporate.sanrio.co.jp/news/20260628_01.html"
            target="_blank"
            rel="noreferrer"
          >
            2026三丽鸥官方人气榜前十
          </a>
          。这里是手绘角色演绎，非官方素材。角色版权归SANRIO所有。
        </p>
      </details>
    </div>
  );
}
