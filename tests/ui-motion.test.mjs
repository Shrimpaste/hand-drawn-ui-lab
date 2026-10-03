import test from 'node:test';
import assert from 'node:assert/strict';
import { InkTransition, DrawingSequence, strokeCoverage } from '../src/ink.js';
import { PaperMotion } from '../src/paper-motion.js';
import { SketchFeedback } from '../src/feedback.js';
import fs from 'node:fs';

test('interrupted handwriting erases from the visible amount and can resume without flashing', () => {
  const ink = new InkTransition(); ink.setVisible(true); ink.update(.12);
  assert.ok(ink.progress > .3 && ink.progress < .5);
  const before = ink.progress; ink.setVisible(false); assert.equal(ink.update(0), before);
  ink.update(.05); assert.ok(ink.progress < before);
  const erased = ink.progress; ink.setVisible(true); assert.equal(ink.update(0), erased);
  ink.update(.3); assert.equal(ink.progress, 1);
  ink.setVisible(false); ink.update(.18); assert.equal(ink.progress, 0);
});
test('stroke time ordering and opening gates keep unpainted UI noninteractive', () => {
  assert.equal(strokeCoverage(0, 0), 0); assert.equal(strokeCoverage(1, 255), 1);
  assert.equal(strokeCoverage(.5, 200), 0); assert.equal(strokeCoverage(.5, 50), 1);
  const opening = new DrawingSequence(); opening.update(2);
  assert.ok(opening.progress(.3,3.2)>0); assert.equal(opening.interactive,false);
  opening.update(1.6); assert.equal(opening.interactive,true);
  opening.restart(true); assert.equal(opening.done,true); assert.equal(opening.progress(2,1),1);
  opening.setReduced(false); assert.equal(opening.done,true); assert.equal(opening.interactive,true);
});
test('paper input stays attached to its drawn square throughout lag and return to center', () => {
  const paper = new PaperMotion(); paper.point(1280,50,1280,800);
  for(let i=0;i<90;i++) {
    paper.update(1/60,{width:1280,height:800,unit:70});
    const visible=paper.toScreen(742,318), original=paper.fromScreen(visible.x,visible.y);
    assert.ok(Math.abs(original.x-742)<1e-9); assert.ok(Math.abs(original.y-318)<1e-9);
  }
  assert.ok(Math.abs(paper.matrix[4])>1);
  paper.leave(); paper.update(5,{width:1280,height:800,unit:70,reduced:true});
  assert.ok(Math.abs(paper.matrix[4])<.001);
});
test('dust and landing cues use event ground positions, create finite particles and expire', () => {
  const rig=JSON.parse(fs.readFileSync(new URL('../assets/chars/fx.json',import.meta.url),'utf8'));
  const sounds=[], feedback=new SketchFeedback({rig,atlas:{},audio:{play:(...args)=>sounds.push(args)}});
  feedback.cue({kind:'particle',name:'dust',x:2,y:-1,data:{u:.1}},{seed:127});
  assert.equal(feedback.particles.length,3); assert.equal(feedback.counts.dust,1);
  for(const p of feedback.particles) { assert.equal(p.x,2.1); assert.equal(p.y,-1); assert.ok(Number.isFinite(p.vx+p.vy)); }
  feedback.cue({kind:'impact',x:2,y:-1}); assert.equal(sounds[0][0],'land');
  feedback.update(.6); assert.equal(feedback.particles.length,0);
});
