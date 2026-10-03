import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Character, continuousTravel } from '../src/character.js';

const atlas = JSON.parse(fs.readFileSync(new URL('../assets/chars/cast.atlas.json', import.meta.url)));
const kinds = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
for (const side of ['w', 'b']) for (const kind of kinds) {
  test(`${side}-${kind}: all playable actions emit finite transforms and existing atlas frames`, () => {
    const rig = JSON.parse(fs.readFileSync(new URL(`../assets/chars/${side}-${kind}.json`, import.meta.url)));
    const actor = new Character(rig, { seed: 127 });
    const context = { side, seed: 127, reduced: false, off: [-2, -1], dist: Math.sqrt(5), facing: 1, from: [-1, 0], strength: 1 };
    for (const reduced of [false, true]) for (const action of ['hover', 'select', 'deselect', 'move', 'victory', 'napping', 'gag', 'refuse']) {
      actor.puppet.cancelAll(0);
      const clip = actor.animator[action]({ ...context, reduced });
      actor.puppet.play(clip, { layer: 'test', fade: 0 });
      const duration = Number.isFinite(clip.duration) ? clip.duration : 2;
      for (let t = 0; t < duration + .1; t += 1 / 30) {
        actor.update(1 / 30);
        for (const instance of actor.puppet.instances()) {
          assert.ok(atlas.entries[`${rig.id}/${instance.frame}`], `${action}: ${instance.frame}`);
          assert.ok([...instance.m, ...instance.t, instance.alpha, instance.progress].every(Number.isFinite), `${action}: non-finite transform`);
        }
        assert.ok(actor.puppet.ground().every(Number.isFinite));
      }
    }
  });
}
test('continuous travel decouples positional motion from hand-drawn pose sampling', () => {
  const original = { duration: 1, sample: t => ({ x: t * 3, y: -t, lift: t * t, lean: t, sx: 1 - t / 10 }) };
  // Use the same fn/sample contract as the extracted clip class.
  original.fn = original.sample; original.sample = function(t) { return this.fn(t); };
  const clip = continuousTravel(original);
  const first = clip.sample(.101), second = clip.sample(.111);
  assert.equal(first.lean, second.lean);
  assert.equal(first.sx, second.sx);
  assert.ok(second.x > first.x); assert.ok(second.lift > first.lift);
});
