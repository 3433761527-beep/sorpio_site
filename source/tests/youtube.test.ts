import test from "node:test";
import assert from "node:assert/strict";
import { youtubeId } from "../src/youtube.ts";
test("parse official HTTPS YouTube watch, share and embed links", () => {
  for (const u of [
    "https://www.youtube.com/watch?v=xkc3lo7Bgeo",
    "https://youtu.be/xkc3lo7Bgeo?si=abc",
    "https://www.youtube-nocookie.com/embed/xkc3lo7Bgeo",
    "https://m.youtube.com/watch?v=xkc3lo7Bgeo",
  ])
    assert.equal(youtubeId(u), "xkc3lo7Bgeo");
});
test("reject script URLs, lookalike hosts and invalid IDs", () => {
  for (const u of [
    "javascript:alert(1)",
    "http://youtube.com/watch?v=xkc3lo7Bgeo",
    "https://youtube.com.evil.test/watch?v=xkc3lo7Bgeo",
    "https://evil.test/embed/xkc3lo7Bgeo",
    "https://youtube.com/watch?v=oops",
  ])
    assert.equal(youtubeId(u), null);
});
