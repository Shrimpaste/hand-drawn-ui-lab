import { random, oval, stroke, colors } from './sketch.js';
import { clamp } from './motion.js';

/** Small, finite residues. No idle particles; each mark belongs to an action. */
export class Residue {
  constructor({limit=100}={}){this.items=[];this.limit=limit;this.serial=0;this.total=0;}
  emit(kind,x,y,{strength=1,color=colors.faint,reduced=false}={}){
    const r=random(++this.serial*771),count=reduced?1:kind==='ring'?1:kind==='leaf'?4:5;
    for(let i=0;i<count;i++){const a=r()*Math.PI*2,s=(8+r()*18)*strength;this.items.push({kind,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.42-5,age:0,life:kind==='ring'?.43:.55+r()*.22,size:1.1+r()*1.8,color,seed:i+this.serial*41});}
    this.total+=count;this.items=this.items.slice(-this.limit);
  }
  update(dt){for(const p of this.items)p.age+=dt;this.items=this.items.filter(p=>p.age<p.life);}
  draw(ctx){for(const p of this.items){const t=p.age/p.life,decay=1-t,fade=clamp(p.age/.025)*decay*decay,spread=1-Math.exp(-p.age*4);const x=p.x+p.vx*spread*.5,y=p.y+p.vy*spread*.5;
    if(p.kind==='ring')oval(ctx,p.x,p.y,6+t*21,2+t*5,{color:p.color,width:.8,alpha:fade*.65,seed:p.seed,jitter:.7});
    else if(p.kind==='leaf')stroke(ctx,[[x-3,y+2],[x,y-3],[x+2,y]],{color:p.color,width:1,alpha:fade,seed:p.seed});
    else oval(ctx,x,y,p.size*(.6+t),p.size*(.4+t*.5),{color:p.color,width:.8,alpha:fade*.7,seed:p.seed});
  }}
}

/** Each passed point gets its own birth time; fading follows the moving subject. */
export class TravelTrail {
  constructor(from,to,{spacing=.32,life=.9}={}){this.from=from;this.to=to;this.life=life;this.reached=0;this.age=0;this.marks=[];const d=Math.hypot(to[0]-from[0],to[1]-from[1]);this.steps=Math.min(40,Math.max(2,Math.ceil(d/spacing)));}
  update(dt,reached){this.age+=dt;this.reached=Math.max(this.reached,clamp(reached));for(let i=this.marks.length;i<this.steps*this.reached;i++)this.marks.push({t:i/this.steps,birth:this.age});}
  get visible(){return this.marks.map(m=>({...m,alpha:clamp(1-(this.age-m.birth)/this.life)**2})).filter(m=>m.alpha>.005);}
  get done(){return this.reached>=1&&this.visible.length===0;}
}
