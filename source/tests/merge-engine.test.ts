import test from "node:test";
import assert from "node:assert/strict";
import {
  slide,
  spawn,
  hasMoves,
  validTiles,
  type Tile,
} from "../src/merge-engine.ts";
function board(values: number[]): Tile[] {
  return values
    .map((n, i) => ({ id: i + 1, x: i % 4, y: Math.floor(i / 4), n }))
    .filter((t) => t.n);
}
function row(t: Tile[], y = 0) {
  return [0, 1, 2, 3].map((x) => t.find((t) => t.x === x && t.y === y)?.n || 0);
}
test("merge once per turn; no chain merging or incorrect score", () => {
  const m = slide(board([2, 2, 2, 2]), "left");
  assert.deepEqual(row(m.tiles), [4, 4, 0, 0]);
  assert.equal(m.score, 8);
  assert.deepEqual(row(slide(board([2, 2, 4, 0]), "left").tiles), [4, 4, 0, 0]);
  assert.deepEqual(
    row(slide(board([2, 0, 2, 4]), "right").tiles),
    [0, 0, 4, 4],
  );
});
test("four directions preserve tile sums; stationary move stays unchanged", () => {
  const b = board([2, 0, 4, 2, 2, 4, 4, 8, 0, 4, 8, 16, 2, 0, 0, 16]);
  for (const d of ["left", "right", "up", "down"] as const) {
    const m = slide(b, d);
    assert.equal(
      m.tiles.reduce((s, t) => s + t.n, 0),
      b.reduce((s, t) => s + t.n, 0),
    );
    assert.equal(
      new Set(m.tiles.map((t) => t.y * 4 + t.x)).size,
      m.tiles.length,
    );
  }
  assert.equal(slide(board([2, 4, 8, 16]), "left").changed, false);
  assert.equal(
    slide(board([2, 0, 0, 0, 2]), "up").tiles.find(
      (t) => t.x === 0 && t.y === 0,
    )?.n,
    4,
  );
  assert.equal(
    slide(board([2, 0, 0, 0, 2]), "down").tiles.find(
      (t) => t.x === 0 && t.y === 3,
    )?.n,
    4,
  );
});
test("2048 win is genuine; full board detects game over; spawn uses an empty cell", () => {
  assert.equal(slide(board([1024, 1024]), "left").tiles[0].n, 2048);
  const full = board([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]);
  assert.equal(hasMoves(full), false);
  assert.equal(spawn(full), full);
  const b = board([2, 2, 4, 8, 4, 8, 2, 4, 8, 2, 4, 8, 2, 4, 8, 2]);
  assert.equal(hasMoves(b), true);
  const s = spawn(board([2, 4]), () => 0);
  assert.equal(s.length, 3);
  assert.equal(s[2].x, 2);
  assert.equal(s[2].n, 2);
  assert.equal(validTiles(s), true);
  assert.equal(
    validTiles([
      { id: 1, x: 0, y: 0, n: 3 },
      { id: 2, x: 1, y: 0, n: 2 },
    ]),
    false,
  );
});
