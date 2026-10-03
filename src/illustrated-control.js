import { InkTransition } from './ink.js';

/** A semantic DOM button with an atlas illustration and a write/erase ink label. */
export class IllustratedControl {
  constructor(button, { atlas, icon, hoverIcon, drawIcon, lettering, textKey, label, onHover, reduced = () => false, state = () => false }) {
    Object.assign(this, { button, atlas, icon, hoverIcon, drawIcon, lettering, textKey, label, onHover, reduced, state });
    this.ink = new InkTransition(); this.hovered = false; this.focused = false; this.elapsed = 0;
    button.classList.add('illustrated-control'); button.removeAttribute('title'); button.setAttribute('aria-label', label);
    button.replaceChildren();
    this.canvas = document.createElement('canvas'); this.canvas.className = 'control-art'; this.canvas.setAttribute('aria-hidden', 'true');
    this.labelCanvas = document.createElement('canvas'); this.labelCanvas.className = 'ink-tooltip'; this.labelCanvas.setAttribute('aria-hidden', 'true');
    const accessible = document.createElement('span'); accessible.className = 'sr-only'; accessible.textContent = label;
    button.append(this.canvas, this.labelCanvas, accessible);
    const set = () => {
      const active = !button.disabled && (this.hovered || this.focused);
      this.ink.setVisible(active, this.reduced());
      if (active) this.onHover?.();
    };
    const events = { pointerenter: () => { this.hovered = true; set(); }, pointerleave: () => { this.hovered = false; set(); },
      focus: () => { this.focused = button.matches(':focus-visible'); set(); }, blur: () => { this.focused = false; set(); },
      pointerdown: () => { this.focused = false; set(); }, keydown: () => { this.focused = true; set(); } };
    this.disposeListeners = [];
    for (const [name, callback] of Object.entries(events)) {
      button.addEventListener(name, callback); this.disposeListeners.push(() => button.removeEventListener(name, callback));
    }
  }
  get writing() { return this.ink.progress > 0 && this.ink.progress < 1; }
  update(dt) {
    this.dt = dt;
    this.elapsed += dt;
    this.ink.setVisible(!this.button.disabled && (this.hovered || this.focused), this.reduced());
    this.ink.update(dt); this.draw();
  }
  draw() {
    const dpr = Math.min(devicePixelRatio || 1, 2), progress = this.ink.progress;
    const width = 60, height = 48;
    if (this.canvas.width !== Math.round(width * dpr)) { this.canvas.width = Math.round(width * dpr); this.canvas.height = Math.round(height * dpr); }
    const c = this.canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, width * dpr / 2, height * dpr / 2); c.clearRect(-width / 2, -height / 2, width, height);
    const active = !this.button.disabled && (this.hovered || this.focused);
    const key = typeof this.icon === 'function' ? this.icon(this.state(), active) : active && this.hoverIcon ? this.hoverIcon : this.icon;
    const entry = this.atlas.get(key);
    if (this.drawIcon) this.drawIcon(c, { active, disabled: this.button.disabled, width, height, dt: this.dt });
    else if (entry) {
      const density = entry.meta?.ppu || this.atlas.data.ppu || entry.scale, scale = Math.min(42 / entry.w, 37 / entry.h) * density;
      const cx = (entry.trim.x - entry.pivot[0] + entry.w / 2) / density * scale;
      const cy = (entry.trim.y - entry.pivot[1] + entry.h / 2) / density * scale;
      const angle = active && !this.reduced() ? Math.sin(this.elapsed * 7) * .045 : 0;
      c.rotate(angle); this.atlas.draw(c, key, { x: -cx, y: cy, scale, alpha: this.button.disabled ? .35 : 1 });
    }
    const labelWidth = 148, labelHeight = 58;
    if (this.labelCanvas.width !== Math.round(labelWidth * dpr)) { this.labelCanvas.width = Math.round(labelWidth * dpr); this.labelCanvas.height = Math.round(labelHeight * dpr); }
    const t = this.labelCanvas.getContext('2d'); t.setTransform(dpr, 0, 0, dpr, labelWidth * dpr / 2, labelHeight * dpr / 2);
    t.clearRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight);
    const textEntry = this.lettering.get(this.textKey);
    if (textEntry && progress > 0) {
      const density = textEntry.scale, scale = Math.min(128 / textEntry.w, 32 / textEntry.h) * density;
      const cx = (textEntry.trim.x - textEntry.pivot[0] + textEntry.w / 2) / density * scale;
      const cy = (textEntry.trim.y - textEntry.pivot[1] + textEntry.h / 2) / density * scale;
      const shiver = this.ink.target ? 0 : Math.sin(this.ink.elapsed * 120) * .6;
      this.lettering.draw(t, this.textKey, { x: -cx + shiver, y: cy, text: true, scale, progress, revealPixels: 256 });
    }
    this.button.dataset.inkProgress = progress.toFixed(3);
  }
  dispose() { for (const remove of this.disposeListeners) remove(); }
}
