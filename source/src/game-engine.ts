export const trailPoints = [
  [18, 10],
  [30, 23],
  [14, 38],
  [53, 33],
  [71, 46],
  [81, 60],
  [73, 76],
  [58, 87],
  [33, 92],
  [15, 77],
  [27, 61],
];
export function makeDeck(pairs = 6, random = Math.random) {
  const deck = Array.from({ length: pairs * 2 }, (_, id) => ({
    id,
    value: id % pairs,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export function clampBasket(x: number, width: number) {
  return Math.max(27, Math.min(width - 27, x));
}
export function catches(
  star: { x: number; y: number; r: number },
  basket: number,
  width: number,
  height: number,
) {
  return (
    star.x >= basket - 27 - star.r &&
    star.x <= basket + 27 + star.r &&
    star.y >= height - 51 - star.r &&
    star.y <= height - 29 + star.r &&
    star.x >= 0 &&
    star.x <= width
  );
}
export function hitsNext(
  index: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const p = trailPoints[index];
  return (
    !!p && Math.hypot(x - (p[0] / 100) * width, y - (p[1] / 100) * height) <= 24
  );
}
