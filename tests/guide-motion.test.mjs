import test from "node:test";
import assert from "node:assert/strict";
import { GuideMotion } from "../scenes/guide-motion.js";
import { visitorRig } from "../scenes/guide-rig.js";
import { armArtworkRotation } from "../scenes/guide-render-pose.js";
import { GalleryWalk } from "../scenes/gallery-model.js";

test("rabbit travels during paired airborne steps while owl alternates its talons", () => {
  const actors = [new GuideMotion(192, "rabbit"), new GuideMotion(193, "owl")];
  const walking = actors.map((a) => {
    const g = new GalleryWalk(300, 600);
    g.character = a.character;
    g.stride = a.profile.stride;
    g.walkTo(1800, 600);
    return g;
  });
  const evidence = actors.map(() => ({
    pairDifference: 0,
    maxLift: 0,
    air: [],
    ground: [],
  }));
  for (let i = 0; i < 420; i++)
    actors.forEach((actor, n) => {
      const g = walking[n],
        x = g.x;
      g.update(1 / 120);
      actor.update(1 / 120, {
        speed: g.speed,
        walkPhase: g.phase,
        groundX: g.x,
        active: true,
        look: 1,
      });
      const feet = actor.puppet
        .instances()
        .filter((p) => p.part.startsWith("foot"));
      evidence[n].pairDifference = Math.max(
        evidence[n].pairDifference,
        Math.abs(feet[0].t[1] - feet[1].t[1]),
      );
      evidence[n].maxLift = Math.max(
        evidence[n].maxLift,
        actor.puppet.out.lift,
      );
      if (i > 100 && n === 0) {
        const t = (g.phase / (Math.PI * 2)) % 1;
        if (t > 0.35 && t < 0.65) evidence[n].air.push((g.x - x) * 120);
        if (t < 0.16 || t > 0.85) evidence[n].ground.push((g.x - x) * 120);
      }
      finiteRig(actor);
    });
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  assert.ok(
    evidence[0].pairDifference < 0.001,
    "rabbit's hind feet must land as a pair",
  );
  assert.ok(
    evidence[1].pairDifference > 0.018,
    "owl must transfer weight between talons",
  );
  assert.ok(evidence[0].maxLift > evidence[1].maxLift * 3);
  assert.ok(
    avg(evidence[0].air) > avg(evidence[0].ground) * 4,
    "rabbit must translate mainly in flight rather than sliding during crouch",
  );
});

test("sleeping visitor arms remain continuous across authored drawing-state switches", () => {
  for (const character of ["mushroom", "rabbit", "owl"]) {
    const actor = new GuideMotion(127, character),
      rig = visitorRig(character);
    actor.react("asleep");
    const previous = new Map(),
      states = new Set();
    for (let frame = 0; frame < 1800; frame++) {
      actor.update(1 / 60);
      for (const part of actor.puppet
        .instances()
        .filter((p) => p.part.startsWith("arm"))) {
        // Transform a real artwork tip through the same matrix and artwork
        // rotation used by drawRigGuide, rather than testing only clip degrees.
        const r = armArtworkRotation(part, rig),
          x = -24 * Math.sin(r),
          y = 24 * Math.cos(r);
        const [a, b, c, d] = part.m;
        const tip = [
          part.t[0] * 160 + a * x - b * y,
          -part.t[1] * 160 - c * x + d * y,
        ];
        const old = previous.get(part.part);
        if (old)
          assert.ok(
            Math.hypot(tip[0] - old[0], tip[1] - old[1]) < 10,
            `${character} ${part.part} jumps at frame ${frame} (${part.state})`,
          );
        previous.set(part.part, tip);
        states.add(part.state);
      }
    }
    assert.deepEqual([...states].sort(), ["down", "out", "up"]);
  }
});

test("rabbit and owl rigs use separate anatomy, attachment motion and finite reaction blends", () => {
  const rabbit = new GuideMotion(192, "rabbit"),
    owl = new GuideMotion(193, "owl");
  assert.notEqual(rabbit.profile.stride, owl.profile.stride);
  assert.notEqual(
    rabbit.puppet.idle.cfg.breath.period,
    owl.puppet.idle.cfg.breath.period,
  );
  const r = visitorRig("rabbit"),
    o = visitorRig("owl");
  assert.ok(r.parts.earL && r.parts.earR);
  assert.equal(r.parts.cap, undefined);
  assert.notEqual(r.parts.earL.spring.k, r.parts.earR.spring.k);
  assert.ok(o.parts.armL.z > o.parts.body.z);
  for (const actor of [rabbit, owl]) {
    advance(actor, 1.5, { speed: 145, look: 1, active: true });
    const phase = actor.phase;
    advance(actor, 0.7, { speed: 130, look: -1, active: true });
    assert.ok(actor.phase > phase);
    finiteRig(actor);
    for (const state of ["hello", "asleep", "nervous", "carry"]) {
      actor.react(state);
      advance(actor, 0.6);
      finiteRig(actor);
    }
    advance(actor, 6.5, { reduced: true });
    assert.equal(actor.state, "awake");
    finiteRig(actor);
  }
});

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
