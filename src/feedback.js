import { clamp01 } from './ink.js';

/** Local sound grammar: paper tick, little voice, foot tap and landing thump. */
export class SketchAudio {
  constructor({ enabled = true } = {}) { this.enabled = enabled; this.last = new Map(); }
  unlock() {
    if (!this.enabled) return;
    try { this.context ||= new AudioContext(); this.context.resume().catch(() => {}); } catch {}
  }
  play(name = 'select', { pan = 0, pitch = 0, strength = 1 } = {}) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const c = this.context, now = c.currentTime;
    const kind = /hover|greet/.test(name) ? 'hover' : /land|impact/.test(name) ? 'land'
      : /step|hoof|foot|tap/.test(name) ? 'step' : /sleep|zzz/.test(name) ? 'sleep'
        : /victory|happy|ding/.test(name) ? 'happy' : 'select';
    if (now - (this.last.get(kind) ?? -10) < (kind === 'hover' ? .075 : .045)) return;
    this.last.set(kind, now);
    const sink = c.createGain(), panner = c.createStereoPanner();
    panner.pan.value = Math.max(-.8, Math.min(.8, pan));
    sink.connect(panner).connect(c.destination);
    const duration = kind === 'land' ? .15 : kind === 'step' ? .055 : .13;
    const gain = ({ hover: .012, select: .028, land: .045, step: .025, sleep: .012, happy: .022 })[kind] * Math.min(1.3, strength);
    sink.gain.setValueAtTime(0, now); sink.gain.linearRampToValueAtTime(gain, now + .004);
    sink.gain.exponentialRampToValueAtTime(.0001, now + duration);
    const oscillator = c.createOscillator();
    const base = ({ hover: 820, select: 510, land: 155, step: 290, sleep: 360, happy: 960 })[kind] * 2 ** (pitch / 12);
    oscillator.type = kind === 'step' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(base, now);
    oscillator.frequency.exponentialRampToValueAtTime(base * (kind === 'land' ? .42 : .75), now + duration);
    oscillator.connect(sink); oscillator.start(now); oscillator.stop(now + duration + .01);
    oscillator.onended = () => { oscillator.disconnect(); sink.disconnect(); panner.disconnect(); };
  }
  /** One quiet filtered noise source, reused while any label is being written. */
  writing(active) {
    if (!this.enabled || this.context?.state !== 'running') active = false;
    if (active && !this.scratch) {
      const c = this.context, buffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (.5 + .5 * Math.sin(i * .011));
      const source = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
      source.buffer = buffer; source.loop = true; filter.type = 'bandpass'; filter.frequency.value = 2400; filter.Q.value = .7;
      gain.gain.value = 0; source.connect(filter).connect(gain).connect(c.destination); source.start();
      this.scratch = { source, filter, gain };
    }
    if (this.scratch) this.scratch.gain.gain.setTargetAtTime(active ? .006 : 0, this.context.currentTime, .015);
  }
  dispose() { this.scratch?.source.stop(); this.context?.close(); }
}

/** Sprite particles driven by the original character's semantic events. */
export class SketchFeedback {
  constructor({ atlas, rig, groundScale = 1, audio = new SketchAudio() }) {
    Object.assign(this, { atlas, rig, groundScale, audio }); this.particles = [];
    this.counts = { dust: 0, impact: 0, sound: 0 };
  }
  clear() { this.particles.length = 0; }
  cue(event, { x = event.x ?? 0, y = event.y ?? 0, seed = 1, reduced = false } = {}) {
    if (event.kind === 'sound' || event.kind === 'impact') {
      this.counts[event.kind]++; this.audio.play(event.kind === 'impact' ? 'land' : event.name, {
        pan: x / 5, pitch: seed % 7 - 3, strength: event.data?.strength ?? 1,
      });
    }
    if (event.kind !== 'particle') return;
    const data = event.data || {}, name = event.name || 'puff';
    const count = name === 'dust' ? reduced ? 1 : 3 : 1;
    if (name === 'dust') this.counts.dust++;
    const part = name === 'dust' ? 'puff' : ({ stars: 'star', leaves: 'leafG' }[name] || name);
    if (!this.rig.parts[part]) return;
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + seed * .37;
      this.particles.push({ part, x: x + (data.u || 0), y: y + (data.v || 0), age: 0,
        vx: name === 'dust' ? Math.cos(angle) * .38 : 0, vy: name === 'dust' ? Math.sin(angle) * .17 : name === 'zzz' ? .15 : .06,
        scale: (data.scale || 1) * (name === 'dust' ? .7 : 1), life: name === 'dust' ? .5 : .8,
        seed: seed + i * 7, flat: this.rig.parts[part].batch === 'flat' });
    }
  }
  update(dt) {
    for (const p of this.particles) p.age += dt;
    this.particles = this.particles.filter(p => p.age < p.life);
  }
  draw(ctx) {
    for (const p of this.particles) {
      const part = this.rig.parts[p.part], age = p.age / p.life;
      const states = p.part === 'puff' ? ['a', 'b', 'c'] : p.part === 'poof' ? ['p0', 'p1', 'p2', 'p3'] : [part.default];
      const state = part.states[states[Math.min(states.length - 1, Math.floor(age * states.length))]];
      const key = `fx/${state.frames[Math.floor(p.age * 8 + p.seed) % state.frames.length]}`;
      const scale = p.scale * (p.part === 'puff' ? .65 + age * .55 : 1);
      const alpha = Math.min(1, p.age / .025) * clamp01((1 - age) / .6) * .85;
      this.atlas.draw(ctx, key, { x: p.x + p.vx * p.age, y: p.y * this.groundScale + p.vy * p.age,
        scale, alpha, ppu: this.rig.scale.ppu,
        matrix: p.flat ? [1, 0, 0, this.groundScale] : [1, 0, 0, 1] });
    }
  }
}
