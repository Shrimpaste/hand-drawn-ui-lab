import { describe, it, expect } from "vitest";
import { Control } from "../src/engine/controls.js";

describe("semantic state after story and keyboard changes", () => {
  it("updates pressed state when the model changes outside a button click", () => {
    let on = false;
    const attrs = new Map([["aria-pressed", "false"]]);
    const control = {
      isOn: () => !on, isPressed: () => on,
      el: { getAttribute: (k) => attrs.get(k), setAttribute: (k, v) => attrs.set(k, v) },
      hidden: false, vis: 1, hover: false, focus: false, disabled: false, always: false,
      label: { ink: { setVisible() {} }, update() {} },
      resp: { update() {} }, depth: null,
    };
    on = true;
    Control.prototype.update.call(control, 1 / 60, true, null);
    expect(attrs.get("aria-pressed")).toBe("true");
    on = false;
    Control.prototype.update.call(control, 1 / 60, true, null);
    expect(attrs.get("aria-pressed")).toBe("false");
  });
});
