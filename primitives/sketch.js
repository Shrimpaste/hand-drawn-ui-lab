// Original drawing tools. The jitter belongs to a stroke, never to a RAF frame.
export const colors = { ink: '#554e42', blue: '#657985', red: '#ae6b55', green: '#89977b', yellow: '#c8a15b', paper: '#f3eedf', faint: '#c8c0ac' };
export function random(seed = 1) { let s = seed | 0; return () => { let t = s += 0x6d2b79f5; t = Math.imul(t ^ t >>> 15, 1 | t); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function roughPoints(points, seed = 1, amount = .6) {
  const r = random(seed); return points.map(([x,y]) => [x + (r()-.5)*amount*2, y + (r()-.5)*amount*2]);
}
export function length(points) { return points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0); }
export function partial(points, distance) {
  const result = [points[0]];
  for (let i=1;i<points.length && distance>0;i++) {
    const a=points[i-1], b=points[i], span=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if (distance<span) { const t=distance/span; result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); break; }
    result.push(b); distance-=span;
  }
  return result;
}
export function stroke(ctx, points, { color=colors.ink, width=1.5, seed=1, jitter=.55, progress=1, alpha=1 }={}) {
  if (progress<=0 || points.length<2) return;
  const path=roughPoints(points,seed,jitter), visible=progress<1?partial(path,length(path)*progress):path;
  ctx.save(); ctx.globalAlpha*=alpha; ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath(); ctx.moveTo(...visible[0]); for(const p of visible.slice(1)) ctx.lineTo(...p); ctx.stroke(); ctx.restore();
}
export function ovalPoints(x,y,rx,ry,seed=1) {
  const r=random(seed), phase=r()*6.28;
  return Array.from({length:65},(_,i)=>{ const t=i/64*Math.PI*2, v=1+.018*Math.sin(t*3+phase); return [x+Math.cos(t)*rx*v,y+Math.sin(t)*ry*v]; });
}
export function oval(ctx,x,y,rx,ry,options={}) { stroke(ctx,ovalPoints(x,y,rx,ry,options.seed),options); }
export function fillShape(ctx,points,color,alpha=1) {
  ctx.save(); ctx.globalAlpha*=alpha; ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(...points[0]); for(const p of points.slice(1)) ctx.lineTo(...p); ctx.closePath(); ctx.fill(); ctx.restore();
}
export function hatch(ctx,points,{color=colors.green,gap=6,seed=1,alpha=.45}={}) {
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]), minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),h=maxY-minY;
  ctx.save(); ctx.beginPath(); ctx.moveTo(...points[0]); for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip();
  let n=0; for(let x=minX-h;x<maxX+h;x+=gap)stroke(ctx,[[x,minY-4],[x+h+8,maxY+4]],{color,width:.75,seed:seed+n++,alpha,jitter:1});
  ctx.restore();
}
export function paperTexture(width=256,height=256,seed=827) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d'),r=random(seed);
  ctx.fillStyle=colors.paper;ctx.fillRect(0,0,width,height);
  for(let i=0;i<width*height/6;i++){ctx.fillStyle=r()>.5?'rgba(78,59,38,.035)':'rgba(255,255,255,.18)';ctx.fillRect(r()*width,r()*height,r()*1.1+.2,r()*1.2+.3);}
  return canvas;
}
export function sheet(ctx,w,h,{color='#fbf7e9',seed=1,lift=0}={}) {
  const pts=roughPoints([[-w/2,-h/2],[w/2,-h/2+1],[w/2-1,h/2],[-w/2+2,h/2-1],[-w/2,-h/2]],seed,1.2);
  ctx.save();ctx.shadowColor='rgba(75,58,33,.13)';ctx.shadowBlur=7+lift*14;ctx.shadowOffsetY=3+lift*9;
  fillShape(ctx,pts,color);ctx.restore();stroke(ctx,pts,{seed,color:'#bcb39d',width:.8,jitter:.3});
}
export function tape(ctx,x,y,w=65,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const pts=[[-w/2,-10],[w/2,-9],[w/2-2,10],[-w/2+1,9],[-w/2,-10]];fillShape(ctx,pts,'#d8bf87',.4);hatch(ctx,pts,{color:'#a69365',alpha:.2,gap:4});stroke(ctx,pts,{color:'#bca779',alpha:.4,width:.6});ctx.restore();}
