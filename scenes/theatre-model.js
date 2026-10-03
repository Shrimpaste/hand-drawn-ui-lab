import { Spring, Action } from "../primitives/motion.js";
import {
  materials,
  materialPose,
  blendPose,
} from "../demos/material-motion.js";

export class TheatreModel {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.events = [];
    this.table = new Spring(0, { stiffness: 210, damping: 12 });
    this.leafReply = new Spring(0, { stiffness: 49, damping: 5 });
    this.paperReply = new Spring(0, { stiffness: 74, damping: 6 });
    this.clapper = new Spring(0, { stiffness: 145, damping: 6 });
    this.shade = new Spring(0, { stiffness: 82, damping: 7 });
    this.glow = new Spring(0, { stiffness: 38, damping: 14 });
    this.lookTimer = 0;
    this.lookAt = "";
    this.serial = 0;
    this.objects = Object.fromEntries(
      Object.keys(materials).map((kind) => {
        const o = {
          kind,
          count: 0,
          pose: materialPose(kind, 0),
          from: materialPose(kind, 0),
          lit: false,
        };
        const events =
          kind === "stone"
            ? [{ at: 0.13, name: "stone-impact" }]
            : kind === "bell"
              ? [
                  { at: 0.21, name: "bell" },
                  { at: 0.52, name: "bell-echo" },
                ]
              : materials[kind].events;
        o.action = new Action({
          duration: materials[kind].duration,
          events,
          onEvent: (e) => this.event(kind, e.name, o.serial),
        });
        return [kind, o];
      }),
    );
  }
  trigger(kind) {
    const o = this.objects[kind];
    if (!o) return;
    o.from = { ...o.pose };
    o.count++;
    o.serial = ++this.serial;
    if (kind === "lamp") o.lit = !o.lit;
    o.action.start();
  }
  event(kind, name, serial) {
    const event = { kind, name, serial };
    this.events.push(event);
    if (this.events.length > 40) this.events.shift();
    if (name === "stone-impact") {
      this.table.kick(20);
      this.leafReply.kick(0.95);
      this.paperReply.kick(-13);
      this.lookAt = "stone";
      this.lookTimer = 1.4;
    }
    if (name === "landing") {
      this.paperReply.kick(-5);
      this.leafReply.kick(0.32);
    }
    if (name === "bell") {
      this.lookAt = "bell";
      this.lookTimer = 1.2;
    }
    if (name === "lamp-switch") {
      this.glow.target = this.objects.lamp.lit ? 1 : 0;
      this.lookAt = "lamp";
      this.lookTimer = 1.8;
    }
    this.onEvent(event);
  }
  update(dt, reduced = false) {
    for (const o of Object.values(this.objects)) {
      o.action.update(dt);
      const target = materialPose(o.kind, o.action.elapsed);
      o.pose = blendPose(o.from, target, o.action.elapsed / 0.11);
    }
    this.clapper.target = -this.objects.bell.pose.angle * 1.65;
    this.shade.target = -this.objects.lamp.pose.angle * 0.6;
    for (const spring of [
      this.table,
      this.leafReply,
      this.paperReply,
      this.clapper,
      this.shade,
      this.glow,
    ])
      spring.update(dt, reduced);
    this.lookTimer = Math.max(0, this.lookTimer - dt);
    if (!this.lookTimer) this.lookAt = "";
  }
}
