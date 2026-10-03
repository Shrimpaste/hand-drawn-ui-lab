import { clamp01, strokeCoverage } from './ink.js';

export async function readJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`加载失败：${path} (${response.status})`);
  return response.json();
}

export async function loadImage(path) {
  const image = new Image();
  image.src = path;
  await image.decode();
  return image;
}

export class Atlas {
  constructor(data, pages, options = {}) {
    this.data = data;
    this.pages = pages;
    this.ramps = options.ramps;
    this.manifest = options.manifest;
    this.cache = new Map();
    this.timePages = options.timePages || [];
    this.revealCache = new Map();
  }
  static async load(base, name, options = {}) {
    const data = await readJSON(`${base}/${name}.atlas.json`);
    const pages = await Promise.all(data.pages.map(p => loadImage(`${base}/${options.a8 ? 'a8/' : ''}${p.color}`)));
    const timePages = await Promise.all(data.pages.map(p => p.time ? loadImage(`${base}/${options.a8 ? 'a8/' : ''}${p.time}`) : null));
    return new Atlas(data, pages, { ...options, timePages });
  }
  get(key) { return this.data.entries[key]; }
  // Read alpha-only lettering through the reference's pressure → RGB ramp.
  lettering(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const entry = this.get(key);
    const surface = document.createElement('canvas');
    surface.width = entry.w; surface.height = entry.h;
    const ctx = surface.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(this.pages[entry.page], entry.x, entry.y, entry.w, entry.h, 0, 0, entry.w, entry.h);
    const pixels = ctx.getImageData(0, 0, entry.w, entry.h);
    const rampName = this.manifest?.frames?.[key]?.ramp || (key.includes('.cool.') ? 'cool' : key.includes('.warm.') ? 'warm' : 'neutral');
    const ramp = this.ramps[rampName] || Object.values(this.ramps)[0];
    for (let i = 0; i < pixels.data.length; i += 4) {
      const a = pixels.data[i];
      pixels.data[i] = ramp[a * 3]; pixels.data[i + 1] = ramp[a * 3 + 1]; pixels.data[i + 2] = ramp[a * 3 + 2]; pixels.data[i + 3] = a;
    }
    ctx.putImageData(pixels, 0, 0);
    this.cache.set(key, surface);
    return surface;
  }
  /** Reveal at display resolution, keeping one mutable raster per sprite, not frame copies. */
  revealed(key, progress, { text = false, pixels = 160 } = {}) {
    const entry = this.get(key), timePage = this.timePages[entry.page];
    if (!entry.hasTime || !timePage) return null;
    const maxSize = Math.min(Math.max(32, Math.ceil(pixels / 32) * 32), 768);
    const ratio = Math.min(1, maxSize / Math.max(entry.w, entry.h));
    const w = Math.max(1, Math.round(entry.w * ratio)), h = Math.max(1, Math.round(entry.h * ratio));
    const cacheKey = `${key}|${w}|${h}`;
    let record = this.revealCache.get(cacheKey);
    if (!record) {
      const surface = document.createElement('canvas'); surface.width = w; surface.height = h;
      const c = surface.getContext('2d', { willReadFrequently: true });
      if (text) c.drawImage(this.lettering(key), 0, 0, w, h);
      else c.drawImage(this.pages[entry.page], entry.x, entry.y, entry.w, entry.h, 0, 0, w, h);
      const original = c.getImageData(0, 0, w, h);
      c.clearRect(0, 0, w, h);
      c.drawImage(timePage, entry.x, entry.y, entry.w, entry.h, 0, 0, w, h);
      const timePixels = c.getImageData(0, 0, w, h).data;
      const thresholds = new Uint8Array(w * h);
      for (let i = 0; i < thresholds.length; i++) thresholds[i] = timePixels[i * 4];
      record = { surface, c, original, thresholds, output: c.createImageData(w, h), step: -1 };
      record.output.data.set(original.data);
      // Bound memory even when a host project has a large dynamic catalog.
      if (this.revealCache.size >= 96) this.revealCache.delete(this.revealCache.keys().next().value);
      this.revealCache.set(cacheKey, record);
    }
    const step = Math.round(clamp01(progress) * 128);
    if (step !== record.step) {
      const p = step / 128, data = record.output.data, source = record.original.data;
      for (let i = 0; i < record.thresholds.length; i++) {
        data[i * 4 + 3] = Math.round(source[i * 4 + 3] * strokeCoverage(p, record.thresholds[i]));
      }
      record.c.putImageData(record.output, 0, 0); record.step = step;
    }
    return record.surface;
  }
  draw(ctx, key, { x = 0, y = 0, ppu, matrix = [1, 0, 0, 1], translate = [0, 0], alpha = 1, scale = 1, text = false, progress = 1, revealPixels = 160 } = {}) {
    const entry = this.get(key);
    if (!entry || alpha < .003 || progress <= 0) return;
    const density = ppu || entry.meta?.ppu || this.data.ppu || entry.scale;
    const left = (entry.trim.x - entry.pivot[0]) / density;
    const top = (entry.trim.y - entry.pivot[1]) / density;
    const [a, b, c, d] = matrix;
    ctx.save();
    ctx.translate(x + translate[0] * scale, -y - translate[1] * scale);
    ctx.transform(a * scale, -c * scale, -b * scale, d * scale, 0, 0);
    ctx.globalAlpha *= alpha;
    const surface = progress < 1 ? this.revealed(key, progress, { text, pixels: revealPixels }) : null;
    if (surface) ctx.drawImage(surface, left, top, entry.w / density, entry.h / density);
    else if (text) ctx.drawImage(this.lettering(key), left, top, entry.w / density, entry.h / density);
    else ctx.drawImage(this.pages[entry.page], entry.x, entry.y, entry.w, entry.h, left, top, entry.w / density, entry.h / density);
    ctx.restore();
  }
}
