import test from 'node:test';
import assert from 'node:assert/strict';
import {Spring,Action} from '../primitives/motion.js';
import {TravelTrail,Residue} from '../primitives/residue.js';
import {roughPoints,partial} from '../primitives/sketch.js';
import {Notebook} from '../demos/notebook-model.js';
import {materialPose,materials} from '../demos/material-motion.js';

test('inertia stays finite through repeated redirection and irregular frame intervals, then settles',()=>{
 const s=new Spring(0,{stiffness:150,damping:20});for(let i=0;i<100;i++){s.target=i%2?20:-20;s.update(i%3?.016:.25);assert.ok(Number.isFinite(s.value+s.velocity));assert.ok(Math.abs(s.value)<100);}
 s.target=5;for(let i=0;i<400;i++)s.update(1/60);assert.ok(Math.abs(s.value-5)<.001);s.target=-30;s.update(.02,true);assert.equal(s.value,-30);assert.equal(s.velocity,0);
});
test('semantic action emits crossed beats once including zero and duration, and restarts cleanly',()=>{
 const seen=[],a=new Action({duration:.7,events:[{at:.7,name:'settle'},{at:0,name:'notice'},{at:.2,name:'takeoff'}],onEvent:e=>seen.push(e.name)});a.start();a.update(.5);a.update(.8);a.update(1);assert.deepEqual(seen,['notice','takeoff','settle']);assert.equal(a.active,false);a.start();a.update(.7);assert.deepEqual(seen.slice(3),['notice','takeoff','settle']);
});
test('the same touch keeps stone near the floor while paper, leaf and creature follow different paths',()=>{
 const peaks={};for(const [kind,spec]of Object.entries(materials)){let peak=0;for(let t=0;t<=spec.duration;t+=.007){const p=materialPose(kind,t);assert.ok(Object.values(p).every(Number.isFinite));peak=Math.max(peak,Math.abs(p.y));}peaks[kind]=peak;}
 assert.ok(peaks.stone<3);assert.ok(peaks.paper>18);assert.ok(peaks.leaf>26);assert.ok(peaks.creature>43);assert.equal(peaks.bell,0);assert.equal(peaks.lamp,0);
});
test('travel marks retain their reached amount and each fade from their own creation time',()=>{
 const trail=new TravelTrail([0,0],[4,0],{spacing:1,life:.8});trail.update(.1,.25);const first=trail.marks[0];trail.update(.4,.75);assert.equal(trail.marks[0],first);assert.ok(trail.visible.at(-1).alpha>trail.visible[0].alpha);trail.update(.1,.1);assert.equal(trail.reached,.75);trail.update(.1,1);trail.update(.9,1);assert.equal(trail.done,true);
 const residue=new Residue({limit:6});for(let i=0;i<10;i++)residue.emit('dust',2,3);assert.equal(residue.items.length,6);residue.update(1);assert.equal(residue.items.length,0);
});
test('notebook edits and reorder undo in order without overwriting an independently edited note',()=>{
 const b=new Notebook();const initial=b.snapshot();const task=b.add('  Learn a line  ');assert.equal(task.text,'Learn a line');b.rename(task.id,'Keep a line');b.reorder(task.id,0);b.toggle(task.id);b.remove(task.id);b.note='A later note';for(let i=0;i<5;i++)assert.equal(b.undo(),true);assert.deepEqual(b.tasks,initial.tasks);assert.equal(b.note,'A later note');assert.equal(b.undo(),false);const saved=new Notebook(b.snapshot());assert.deepEqual(saved.snapshot(),b.snapshot());
 for(let i=0;i<8;i++)b.add(`item ${i}`);assert.equal(b.tasks.length,8);assert.equal(b.add('overflow'),null);assert.equal(b.reorder('missing',0),false);
});
test('hand-drawn imperfections stay attached to a path and reveal ends within its actual segments',()=>{
 const path=[[0,0],[10,0],[10,20]];assert.deepEqual(roughPoints(path,8),roughPoints(path,8));assert.notDeepEqual(roughPoints(path,8),roughPoints(path,9));assert.deepEqual(partial(path,15),[[0,0],[10,0],[10,5]]);
});
