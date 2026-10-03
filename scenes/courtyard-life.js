import { Spring, smooth } from "../primitives/motion.js";

/** Small object-specific responses; a second touch retains the moving pose. */
export class CourtyardLife {
  constructor() {
    this.lit = false;
    this.glow = new Spring(0, { stiffness: 60, damping: 17 });
    this.fish = new Spring(0, { stiffness: 70, damping: 13 });
    this.can = new Spring(0, { stiffness: 65, damping: 14 });
    this.flower = new Spring(0, { stiffness: 45, damping: 11 });
    this.bird = new Spring(0, { stiffness: 52, damping: 13 });
    this.sway = new Spring(0, { stiffness: 60, damping: 7 });
    this.age = { pond: 99, water: 99, bench: 99, flowers: 99 };
    this.count = { pond: 0, lamp: 0, water: 0, bench: 0, flowers: 0 };
    this.ripples = [];
    this.events = [];
  }
  touch(kind) {
    if (!(kind in this.count)) return;
    this.count[kind]++;
    if (kind === "lamp") this.lit = !this.lit;
    else
      this.age[kind] =
        (kind === "water" && this.can.value > 0.45) ||
        (kind === "bench" && this.bird.value > 0.6)
          ? 0.6
          : 0;
    if (kind === "pond") this.ripples = [...this.ripples, { age: 0 }].slice(-4);
    if (kind === "flowers") this.sway.kick(0.32);
  }
  update(dt, reduced = false) {
    this.events = [];
    for (const kind of Object.keys(this.age)) {
      const before = this.age[kind];
      this.age[kind] += dt;
      if (kind === "water" && before < 0.85 && this.age.water >= 0.85) {
        this.age.flowers = 0;
        this.sway.kick(0.45);
        this.events.push("water-lands");
      }
    }
    this.ripples = this.ripples
      .map((r) => ({ age: r.age + dt }))
      .filter((r) => r.age < 2.7);
    this.glow.target = +this.lit;
    this.fish.target =
      smooth((this.age.pond - 0.22) / 0.35) *
      (1 - smooth((this.age.pond - 2.2) / 0.6));
    this.can.target =
      smooth(this.age.water / 0.65) *
      (1 - smooth((this.age.water - 2.5) / 0.65));
    this.flower.target = 1 - smooth((this.age.flowers - 6) / 2);
    this.bird.target =
      smooth(this.age.bench / 0.6) * (1 - smooth((this.age.bench - 7) / 1));
    for (const channel of [
      this.glow,
      this.fish,
      this.can,
      this.flower,
      this.bird,
      this.sway,
    ])
      channel.update(dt, reduced);
  }
  get pose() {
    return {
      glow: this.glow.value,
      fish: this.fish.value,
      can: this.can.value,
      flower: this.flower.value,
      bird: this.bird.value,
      sway: this.sway.value,
    };
  }
  reset() {
    this.lit = false;
    for (const k of Object.keys(this.age)) this.age[k] = 99;
    for (const k of Object.keys(this.count)) this.count[k] = 0;
    for (const spring of [
      this.glow,
      this.fish,
      this.can,
      this.flower,
      this.bird,
      this.sway,
    ])
      spring.snap(0);
    this.ripples = [];
  }
}
