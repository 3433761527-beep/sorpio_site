export type Direction = "left" | "right" | "up" | "down";
export type Tile = {
  id: number;
  x: number;
  y: number;
  n: number;
  merged?: boolean;
};
export function slide(tiles: Tile[], direction: Direction) {
  const result: Tile[] = [];
  let score = 0;
  for (let line = 0; line < 4; line++) {
    const positions = Array.from({ length: 4 }, (_, i) =>
      direction === "left"
        ? [i, line]
        : direction === "right"
          ? [3 - i, line]
          : direction === "up"
            ? [line, i]
            : [line, 3 - i],
    );
    const source = positions
      .map(([x, y]) => tiles.find((t) => t.x === x && t.y === y))
      .filter((t): t is Tile => !!t);
    let slot = 0;
    for (let i = 0; i < source.length; i++) {
      const tile = source[i];
      const merged = source[i + 1]?.n === tile.n;
      const n = merged ? tile.n * 2 : tile.n;
      if (merged) {
        score += n;
        i++;
      }
      const [x, y] = positions[slot++];
      result.push({ ...tile, x, y, n, merged });
    }
  }
  const changed =
    tiles.length !== result.length ||
    result.some((t) => {
      const old = tiles.find((o) => o.id === t.id);
      return !old || old.x !== t.x || old.y !== t.y || old.n !== t.n;
    });
  return { tiles: result, score, changed };
}
export function spawn(
  tiles: Tile[],
  random: () => number = Math.random,
): Tile[] {
  const empty = Array.from({ length: 16 }, (_, i) => [
    i % 4,
    Math.floor(i / 4),
  ]).filter(([x, y]) => !tiles.some((t) => t.x === x && t.y === y));
  if (!empty.length) return tiles;
  const [x, y] =
    empty[Math.min(empty.length - 1, Math.floor(random() * empty.length))];
  return [
    ...tiles,
    {
      id: Math.max(0, ...tiles.map((t) => t.id)) + 1,
      x,
      y,
      n: random() < 0.9 ? 2 : 4,
    },
  ];
}
export function hasMoves(tiles: Tile[]) {
  return (
    tiles.length < 16 ||
    (["left", "right", "up", "down"] as Direction[]).some(
      (d) => slide(tiles, d).changed,
    )
  );
}
export function validTiles(value: unknown): value is Tile[] {
  if (!Array.isArray(value) || value.length < 2 || value.length > 16)
    return false;
  const ids = new Set<number>(),
    cells = new Set<number>();
  return value.every((t) => {
    if (
      !t ||
      !Number.isSafeInteger(t.id) ||
      t.id < 1 ||
      !Number.isInteger(t.x) ||
      !Number.isInteger(t.y) ||
      t.x < 0 ||
      t.x > 3 ||
      t.y < 0 ||
      t.y > 3 ||
      !Number.isSafeInteger(t.n) ||
      t.n < 2 ||
      t.n > 1073741824 ||
      !Number.isInteger(Math.log2(t.n)) ||
      ids.has(t.id) ||
      cells.has(t.y * 4 + t.x)
    )
      return false;
    ids.add(t.id);
    cells.add(t.y * 4 + t.x);
    return true;
  });
}
