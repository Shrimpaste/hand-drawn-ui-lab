import { Puppet, pawnAnimator } from "../src/vendor/reference-motion.js";
import { visitorRig, visitorProfiles } from "./guide-rig.js";
import { Spring } from "../primitives/motion.js";
import { visitorStride } from "./visitor-locomotion.js";
import { visitorReaction } from "./visitor-reactions.js";

/** New art/anchors, actual reference layered solver. No reference sprite textures. */
export class GuideMotion {
  constructor(seed = 127, character = "mushroom") {
    this.seed = seed;
    this.character = character;
    this.profile = visitorProfiles[character];
    const guideRig = visitorRig(character);
    this.puppet = new Puppet(
      { rig: guideRig, id: guideRig.id },
      { seed, poseFps: 0, accMax: 60 },
    );
    pawnAnimator.rest(this.puppet, "w", seed);
    // The source rest preset shares nested config objects; a visitor owns its tuning.
    this.puppet.idle.cfg = structuredClone(this.puppet.idle.cfg);
    Object.assign(this.puppet.idle.cfg.breath, this.profile.breath);
    if (character === "rabbit")
      Object.assign(this.puppet.idle.cfg.ears, {
        gap: [1.8, 4.8],
        angle: [0.08, 0.18],
      });
    if (character === "owl")
      Object.assign(this.puppet.idle.cfg.look, { smooth: 0.16, wander: 0.28 });
    this.gait = new Spring(0, { stiffness: 95, damping: 18 });
    this.phase = 0;
    this.idle = 0;
    this.elapsed = 0;
    this.state = "awake";
    this.hovering = false;
    this.direction = 0;
    this.reduced = false;
    this.seated = 0;
    // A continuously sampled walk replaces chess travel, retaining the same pose channels.
    this.puppet.play(
      {
        duration: Infinity,
        idle: { breath: true, blink: true, look: true, ears: true },
        sample: () => {
          const stride = visitorStride(
            this.character,
            this.phase,
            this.reduced ? 0 : this.gait.value,
            this.direction,
            this.seated,
          );
          const gesture = this.gesture || {};
          stride.lift += gesture.lift || 0;
          stride.lean += gesture.lean || 0;
          stride.sx *= gesture.sx || 1;
          stride.sy *= gesture.sy || 1;
          // A short nose twitch belongs to the rabbit, not a generic idle wobble.
          if (this.character === "rabbit") {
            const sniff =
              this.state === "awake" && !this.reduced
                ? Math.sin(this.elapsed * (this.hovering ? 24 : 13)) *
                  (this.hovering
                    ? 0.05
                    : Math.max(0, Math.cos(this.elapsed * 0.8)) ** 10 * 0.035)
                : 0;
            stride.props.nose = {
              sx: 1 + sniff,
              sy: 1 - sniff,
              dy: sniff * 0.007,
            };
          }
          return stride;
        },
        eventsIn: () => [],
      },
      { layer: "locomotion", fade: 0.12 },
    );
  }
  options() {
    return { side: "w", seed: this.seed, reduced: this.reduced };
  }
  wake() {
    this.idle = 0;
    if (this.state === "asleep") {
      this.state = "awake";
      this.puppet.clear("sleep", 0.28);
      this.puppet.jolt(0.22);
    }
  }
  react(state) {
    this.wake();
    this.elapsed = 0;
    this.state = state;
    this.puppet.clear("emotion", 0.16);
    this.puppet.clear("hover", 0.16);
    this.puppet.clear("sleep", 0.28);
    this.hovering = false;
    if (state === "asleep")
      this.puppet.play(pawnAnimator.sleepy(this.options()), {
        layer: "sleep",
        fade: 0.35,
      });
    if (state === "nervous")
      this.puppet.play(pawnAnimator.nervous(this.options()), {
        layer: "emotion",
        fade: 0.22,
      });
    if (state === "hello")
      this.puppet.play(
        visitorReaction(
          this.character,
          "hello",
          pawnAnimator.victory(this.options()),
        ),
        {
          layer: "emotion",
          fade: 0.18,
          onEnd: () => {
            if (this.state === "hello") this.state = "awake";
          },
        },
      );
    if (state === "carry")
      this.puppet.play(pawnAnimator.napping(this.options()), {
        layer: "sleep",
        fade: 0.28,
      });
  }
  update(
    dt,
    {
      speed = 0,
      walkPhase,
      groundX,
      seated = 0,
      look = 0,
      lookY = 0,
      active = false,
      hover = false,
      reduced = false,
    } = {},
  ) {
    this.seated = Math.max(0, Math.min(1, seated));
    if (reduced !== this.reduced) {
      this.reduced = reduced;
      if (this.state !== "awake") this.react(this.state);
      this.hovering = false;
      this.puppet.clear("hover", 0);
    }
    this.elapsed += dt;
    this.direction += (look - this.direction) * (1 - Math.exp(-dt * 14));
    if (active || speed > 3) this.wake();
    else this.idle += dt;
    if (this.idle > 14 && this.state === "awake") this.react("asleep");
    if (this.state === "nervous" && this.elapsed > 4.2) {
      this.state = "awake";
      this.puppet.clear("emotion", 0.3);
    }
    if (this.state === "carry" && this.elapsed > 6.2) {
      this.state = "awake";
      this.idle = 0;
      this.puppet.clear("sleep", 0.25);
    }
    this.gait.target = this.state === "carry" ? 0 : Math.min(1, speed / 130);
    this.gait.update(dt, reduced);
    if (walkPhase !== undefined) this.phase = walkPhase;
    else this.phase += ((speed * dt) / this.profile.stride) * Math.PI;
    if (groundX !== undefined) {
      if (!this.hasGround) this.puppet.relocate(groundX / 160, this.puppet.y);
      else this.puppet.x = groundX / 160;
      this.hasGround = true;
    } else this.puppet.x += (speed * dt * look) / 160;
    this.puppet.lookAt(this.puppet.x + look * 2.5, -lookY * 2.5);
    if (hover !== this.hovering && this.state === "awake") {
      this.hovering = hover;
      if (hover)
        this.puppet.play(
          visitorReaction(
            this.character,
            "hover",
            pawnAnimator.hover({ ...this.options(), reduced }),
          ),
          {
            layer: "hover",
            fade: 0.25,
          },
        );
      else this.puppet.clear("hover", 0.25);
    }
    this.puppet.idleEnabled = !reduced;
    // Keep action lifecycles progressing in gentle mode; freeze only idle/boil/gait.
    this.puppet.update(dt);
    if (reduced) this.puppet.springs.settle();
    return this.pose;
  }
  get pose() {
    return {
      puppet: this.puppet,
      carry: this.state === "carry" ? this.elapsed : -1,
      state: this.state,
      character: this.character,
    };
  }
}
