import { Puppet, pawnAnimator, knightAnimator, bishopAnimator, rookAnimator, queenAnimator, kingAnimator } from './vendor/reference-motion.js';

export const animators = {
  pawn: pawnAnimator, knight: knightAnimator, bishop: bishopAnimator,
  rook: rookAnimator, queen: queenAnimator, king: kingAnimator,
};

/** A game-independent character: original rig, idle generator and action clips. */
export class Character {
  constructor(rig, { seed = 1, x = 0, y = 0 } = {}) {
    this.id = rig.id; this.kind = rig.type; this.side = rig.side; this.seed = seed;
    this.animator = animators[this.kind];
    this.puppet = new Puppet({ rig, id: rig.id }, { seed, x, y, poseFps: 12 });
    this.moving = false; this.sleeping = false;
    this.animator.rest(this.puppet, this.side, seed);
  }
  play(action, context = {}, playback = {}) {
    const options = { side: this.side, seed: this.seed, reduced: false, ...context };
    const clip = this.animator[action](options);
    return this.puppet.play(clip, { layer: 'reaction', ...playback });
  }
  update(dt) { this.puppet.update(dt); }
  lookAt(x, y) { this.puppet.lookAt(x, y); }
}

/** Preserve stepped hand-drawn poses, but let travel and lift move continuously. */
export function continuousTravel(originalClip, poseFps = 12) {
  const clip = Object.create(originalClip);
  clip.fn = t => {
    const smooth = originalClip.sample(t);
    const pose = originalClip.sample(Math.floor(t * poseFps) / poseFps);
    return { ...pose, x: smooth.x, y: smooth.y, lift: smooth.lift };
  };
  return clip;
}

/** ctx is already expressed in world units; the ground is foreshortened. */
export function drawCharacter(ctx, atlas, character, { x, y, groundScale = 1, progress = 1 } = {}) {
  const puppet = character.puppet;
  const ground = puppet.ground(); x ??= ground[0]; y ??= ground[1];
  for (const instance of puppet.instances()) {
    let matrix = instance.m, translate = instance.t;
    if (instance.batch === 'flat') {
      matrix = [matrix[0], matrix[1], matrix[2] * groundScale, matrix[3] * groundScale];
      translate = [translate[0], translate[1] * groundScale];
    }
    let key = `${character.id}/${instance.frame}`;
    const ink = Math.min(progress, instance.progress);
    if (ink < 1) {
      const part = instance.frame.split('.')[0];
      const timed = `${character.id}/${part}.idle.0`;
      if (atlas.get(timed)?.hasTime) key = timed;
    }
    const timed = atlas.get(key)?.hasTime;
    atlas.draw(ctx, key, {
      x, y: y * groundScale, matrix, translate,
      alpha: instance.alpha * (timed ? 1 : Math.max(0, Math.min(1, (ink - .4) / .6))),
      progress: timed ? ink : 1, ppu: puppet.rig.scale.ppu,
    });
  }
}
