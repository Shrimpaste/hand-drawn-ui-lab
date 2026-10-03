import { PaperMotion } from '../primitives/paper-motion.js';
import { InkTransition } from '../primitives/ink.js';
import { paperTexture, colors, stroke } from '../primitives/sketch.js';
import { penText, prose } from '../primitives/lettering.js';
import { PaperAudio } from '../primitives/audio.js';
import { Residue } from '../primitives/residue.js';

/** Host plumbing only; each scene owns its layout, artwork and action grammar. */
export class Study {
  constructor({name,height=720,mobileHeight=1100}){
    Object.assign(this,{name,height,mobileHeight});this.outer=document.querySelector('.scene');this.paper=document.querySelector('.paper-stage');this.canvas=document.querySelector('#art');this.ctx=this.canvas.getContext('2d');this.overlay=document.querySelector('.scene-controls');
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.sound=new PaperAudio({enabled:localStorage.getItem('art-lab-sound')!=='off'});this.residue=new Residue();this.paperMotion=new PaperMotion({amplitudeX:.025,amplitudeY:.018,rotate:.0011});this.buttons=[];this.time=0;this.last=0;this.samples=[];this.paused=false;this.texture=paperTexture();this.intro=new InkTransition({writeSeconds:1.1});this.intro.setVisible(true,this.reduced);
    document.querySelector('#gentle').checked=this.reduced;document.querySelector('#gentle').onchange=e=>{this.reduced=e.target.checked;this.onReduced?.();};
    const soundButton=document.querySelector('#audio');const soundLabel=()=>{soundButton.setAttribute('aria-pressed',String(this.sound.enabled));soundButton.textContent=this.sound.enabled?'♫ 声音开':'♫ 声音关';};soundLabel();soundButton.onclick=()=>{this.sound.enabled=!this.sound.enabled;localStorage.setItem('art-lab-sound',this.sound.enabled?'on':'off');this.sound.unlock();soundLabel();};
    for(const event of ['pointerdown','keydown'])window.addEventListener(event,()=>this.sound.unlock(),{capture:true});
    this.outer.addEventListener('pointermove',e=>{const r=this.outer.getBoundingClientRect();this.paperMotion.point(e.clientX-r.left,e.clientY-r.top,r.width,r.height);this.pointer=this.point(e);this.onPointer?.(this.pointer,e);});
    this.outer.addEventListener('pointerleave',()=>{this.paperMotion.leave();this.pointer=null;this.onLeave?.();});
    window.addEventListener('resize',()=>this.resize());document.addEventListener('visibilitychange',()=>{this.paused=document.hidden;if(this.paused){cancelAnimationFrame(this.raf);this.sound.writing(false);}else{this.last=0;this.raf=requestAnimationFrame(t=>this.frame(t));}});
    this.resize();window.artLab={get state(){return window.currentStudy.debug?.()||{};},get metrics(){const s=window.currentStudy.samples,sorted=[...s].sort((a,b)=>a-b);return{frames:s.length,mean:s.reduce((a,b)=>a+b,0)/(s.length||1),p95:sorted[Math.floor(sorted.length*.95)]};}};window.currentStudy=this;
  }
  resize(){this.mobile=this.outer.clientWidth<650;this.w=this.mobile?440:1040;this.h=this.mobile?this.mobileHeight:this.height;this.scale=this.outer.clientWidth/this.w;this.dpr=Math.min(devicePixelRatio||1,2);const cssHeight=this.h*this.scale;this.outer.style.height=`${cssHeight}px`;this.paper.style.height=`${cssHeight}px`;this.canvas.width=Math.round(this.outer.clientWidth*this.dpr);this.canvas.height=Math.round(cssHeight*this.dpr);this.layout?.();}
  point(e){const r=this.outer.getBoundingClientRect(),p=this.paperMotion.fromScreen(e.clientX-r.left,e.clientY-r.top);return{x:p.x/this.scale,y:p.y/this.scale};}
  button(id,label,action){const el=document.createElement('button');el.id=id;el.type='button';el.className='hit';el.setAttribute('aria-label',label);el.textContent=label;this.overlay.append(el);const b={el,ink:new InkTransition({writeSeconds:.36,eraseSeconds:.2}),hover:false,focused:false};
    const change=()=>{const next=b.hover||b.focused;b.ink.setVisible(next&&!el.disabled,this.reduced);if(next)this.sound.play('hover');};el.onpointerenter=()=>{b.hover=true;change();};el.onpointerleave=()=>{b.hover=false;change();};el.onfocus=()=>{b.focused=el.matches(':focus-visible');change();};el.onblur=()=>{b.focused=false;change();};el.onpointerdown=()=>{b.focused=false;change();};el.onkeydown=()=>{b.focused=true;change();};el.onclick=e=>{if(!el.disabled)action(e);};this.buttons.push(b);return b;
  }
  place(button,x,y,w,h,angle=0){const el=button.el||button;el.style.left=`${(x-w/2)/this.w*100}%`;el.style.top=`${(y-h/2)/this.h*100}%`;el.style.width=`${w/this.w*100}%`;el.style.height=`${h/this.h*100}%`;el.style.transform=`rotate(${angle}rad)`;}
  announce(text){document.querySelector('#announcement').textContent=text;}
  heading(title,subtitle,number){const c=this.ctx;penText(c,number,18,25,{size:12,color:colors.red,progress:this.intro.progress});prose(c,title,18,90,{size:this.mobile?34:47,italic:true});prose(c,subtitle,20,126,{size:this.mobile?15:17,color:'#88806e'});stroke(c,[[20,150],[this.w-20,150]],{color:colors.faint,width:.7,progress:this.intro.progress});}
  start(){this.raf=requestAnimationFrame(t=>this.frame(t));}
  frame(now){if(this.paused)return;const dt=Math.min(.04,this.last?(now-this.last)/1000:1/60);this.last=now;this.time+=dt;const start=performance.now();this.intro.update(dt);this.paperMotion.update(dt,{width:this.w*this.scale,height:this.h*this.scale,unit:80,reduced:this.reduced});this.paper.style.transform=this.paperMotion.cssTransform;let writing=false,erasing=false;
    for(const b of this.buttons){b.ink.setVisible(!b.el.disabled&&(b.hover||b.focused),this.reduced);b.ink.update(dt);b.el.dataset.ink=b.ink.progress.toFixed(3);if(b.ink.progress>0&&b.ink.progress<1){writing=true;erasing ||= !b.ink.target;}}
    this.update?.(dt);this.residue.update(dt);const c=this.ctx;c.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);c.clearRect(0,0,this.w,this.h);c.fillStyle=c.createPattern(this.texture,'repeat');c.fillRect(0,0,this.w,this.h);this.draw?.(c);this.sound.writing(writing||this.isWriting?.(),erasing||this.isErasing?.());this.samples.push(performance.now()-start);if(this.samples.length>180)this.samples.shift();this.raf=requestAnimationFrame(t=>this.frame(t));
  }
}

