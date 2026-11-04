import test from "node:test";
import assert from "node:assert/strict";
import {
  makeDeck,
  clampBasket,
  catches,
  hitsNext,
  trailPoints,
} from "../src/game-engine.ts";
test("memory deck has six unique pairs and stable distinct card ids", () => {
  for (let i = 0; i < 20; i++) {
    const d = makeDeck();
    assert.equal(d.length, 12);
    assert.equal(new Set(d.map((c) => c.id)).size, 12);
    for (let face = 0; face < 6; face++)
      assert.equal(d.filter((c) => c.value === face).length, 2);
  }
});
test("basket stays on the board and only catches stars at its opening", () => {
  assert.equal(clampBasket(-500, 320), 27);
  assert.equal(clampBasket(900, 320), 293);
  assert.ok(catches({ x: 100, y: 294, r: 7 }, 100, 320, 340));
  assert.equal(catches({ x: 200, y: 294, r: 7 }, 100, 320, 340), false);
  assert.equal(catches({ x: 100, y: 50, r: 7 }, 100, 320, 340), false);
});
test("the next trail star uses actual touch distances on every phone width", () => {
  for (const width of [280, 320, 390, 460]) {
    for (let i = 0; i < 11; i++) {
      const [x, y] = trailPoints[i];
      assert.ok(hitsNext(i, (x / 100) * width, (y / 100) * 350, width, 350));
      assert.equal(hitsNext(i, -50, -50, width, 350), false);
    }
    assert.equal(hitsNext(11, 10, 10, width, 350), false);
  }
});
