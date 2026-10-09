import { describe, it, expect } from "vitest";
import { wrapByWidth, revealState } from "../src/engine/fontlayout.js";

// 1 unit per CJK char, 0.5 per other char
const measure = (s) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 1 : 0.5), 0);

describe("wrapByWidth", () => {
  it("keeps short text on one line and reports its width", () => {
    const l = wrapByWidth("活性位点", Infinity, measure);
    expect(l.lines).toEqual(["活性位点"]);
    expect(l.width).toBe(4);
  });
  it("breaks CJK anywhere and honours explicit newlines", () => {
    const l = wrapByWidth("一二三四五六\n七", 4, measure);
    expect(l.lines).toEqual(["一二三四", "五六", "七"]);
    expect(l.width).toBe(4);
  });
  it("does not start a line with closing punctuation", () => {
    const l = wrapByWidth("一二三，四五", 3, measure);
    expect(l.lines.every((s) => !/^[，。、：；！？）]/.test(s))).toBe(true);
    expect(l.lines.join("")).toBe("一二三，四五");
  });
  it("wraps Latin runs at spaces when possible", () => {
    const l = wrapByWidth("F6P and Pi leave", 5, measure);
    expect(l.lines.join(" ")).toBe("F6P and Pi leave");
    expect(l.lines.every((s) => measure(s) <= 5)).toBe(true);
  });
});

describe("revealState", () => {
  it("maps progress to a count of written characters with a partial last one", () => {
    expect(revealState(0, 10)).toEqual({ whole: 0, part: 0 });
    expect(revealState(0.55, 10)).toEqual({ whole: 5, part: 0.5 });
    expect(revealState(1, 10)).toEqual({ whole: 10, part: 0 });
  });
});
