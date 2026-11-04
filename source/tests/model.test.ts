import test from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  validateConfig,
  defaults,
  normalize,
  shuffle,
  gridSize,
} from "../src/model.ts";

test("nineteen personal notes and only the final math answer reveal 19", () => {
  assert.equal(defaults.personal.name, "毛艺蓉");
  assert.equal(defaults.personal.notes.length, 19);
  assert.ok(defaults.personal.notes.every((n) => n.trim().length > 0));
  assert.ok(defaults.math.slice(0, -1).every((q) => q.answer !== 19));
});
test("Chinese whitespace and punctuation do not hide the keyword", () => {
  assert.equal(normalize(" 幸， 福！　"), "幸福");
  assert.ok(normalize("我很 幸！福").includes(normalize("幸福")));
});
test("all configured math steps are correct and end in 19", () => {
  validateConfig(defaults);
  let v = 0;
  defaults.math.forEach((q) => {
    v = calculate(q.expression, v);
    assert.equal(v, q.answer);
  });
  assert.equal(v, 19);
});
test("reject wrong intermediate and final answers and code injection", () => {
  const c = structuredClone(defaults);
  c.math[0].answer = 13;
  assert.throws(() => validateConfig(c));
  c.math = [{ expression: "2 + 8", answer: 10, hint: "" }];
  assert.throws(() => validateConfig(c), /19/);
  assert.throws(() => calculate("alert(1)"));
  assert.throws(() => calculate("2*9"));
  assert.throws(() => calculate("19 - -2"));
});
test("signed integer chains work", () => {
  assert.equal(calculate("-5 + 30 - 6"), 19);
  assert.equal(calculate("{prev}+2-2", 19), 19);
});
test("shuffle preserves all pieces and never starts solved", () => {
  for (const n of [9, 16, 25, 36, 12, 17]) {
    for (let j = 0; j < 20; j++) {
      const a = shuffle(n);
      assert.deepEqual(
        [...a].sort((a, b) => a - b),
        Array.from({ length: n }, (_, i) => i),
      );
      assert.ok(a.some((v, i) => v !== i));
    }
    const { rows, cols } = gridSize(n);
    assert.equal(rows * cols, n);
  }
});
test("invalid palettes, puzzle counts and unsafe media URLs cannot publish", () => {
  for (const mutate of [
    (c: typeof defaults) => {
      c.colors[0].hex = "red";
    },
    (c: typeof defaults) => {
      c.colors[1].hex = c.colors[0].hex;
    },
    (c: typeof defaults) => {
      c.puzzle.allowed = [0];
    },
    (c: typeof defaults) => {
      c.music.url = "javascript:alert(1)";
    },
  ]) {
    const c = structuredClone(defaults);
    mutate(c);
    assert.throws(() => validateConfig(c));
  }
});
