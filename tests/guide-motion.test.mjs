import test from "node:test";
import assert from "node:assert/strict";
import { GuideMotion } from "../scenes/guide-motion.js";

const advance = (actor, seconds, input = {}) => {
  for (let t = 0; t < seconds; t += 1 / 60) actor.update(1 / 60, input);
};
const finiteRig = (actor) => {
  for (const part of actor.puppet.instances()) {
    assert.ok(
      [...part.m, ...part.t, part.alpha, part.progress].every(Number.isFinite),
    );
  }
};

test("guide retains gait phase through stop, restart and reversal; its rig stays finite", () => {
  const actor = new GuideMotion();
  finiteRig(actor);
  advance(actor, 1, { speed: 140, look: 1, active: true });
  const phase = actor.phase,
    moving = actor.gait.value;
  actor.update(1 / 60, { speed: 0 });
  assert.equal(actor.phase, phase);
  assert.ok(actor.gait.value > 0 && actor.gait.value < moving);
  advance(actor, 0.65);
  assert.ok(actor.gait.value < 0.01);
  actor.update(1 / 60, { speed: 90, look: -1, active: true });
  assert.ok(actor.phase > phase);
  for (let i = 0; i < 180; i++) {
    actor.update(1 / 60, {
      speed: i < 80 ? 120 : 0,
      look: i % 60 < 30 ? -1 : 1,
    });
    finiteRig(actor);
  }
});

test("sleep and carry tracks leave when a new reaction interrupts them", () => {
  const actor = new GuideMotion();
  advance(actor, 14.1);
  assert.equal(actor.state, "asleep");
  advance(actor, 0.5);
  actor.react("hello");
  advance(actor, 0.6);
  assert.notEqual(actor.puppet.out.mood, "sleepy");
  actor.react("carry");
  advance(actor, 1);
  actor.react("nervous");
  advance(actor, 0.6);
  assert.equal(actor.state, "nervous");
  assert.notEqual(actor.puppet.out.mood, "sleepy");
  finiteRig(actor);
  advance(actor, 4.5);
  assert.equal(actor.state, "awake");
});

test("gentle mode progresses reactions and restores interaction after ant carry", () => {
  const actor = new GuideMotion();
  actor.update(1 / 60, { reduced: true });
  actor.react("carry");
  advance(actor, 6.5, { reduced: true });
  assert.equal(actor.state, "awake");
  assert.equal(actor.pose.carry, -1);
  assert.equal(actor.puppet.idleEnabled, false);
  for (const spring of Object.values(actor.puppet.springs.s))
    assert.equal(spring.w, 0);
  finiteRig(actor);
  actor.react("asleep");
  advance(actor, 0.5, { reduced: true });
  actor.update(1 / 60, { active: true, reduced: true });
  assert.equal(actor.state, "awake");
});
