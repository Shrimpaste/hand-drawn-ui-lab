import { Study } from './runtime.js';
import { Notebook } from './notebook-model.js';
import { Spring, clamp } from '../primitives/motion.js';
import { InkTransition } from '../primitives/ink.js';
import { sheet, tape, stroke, colors, oval } from '../primitives/sketch.js';
import { penText, prose } from '../primitives/lettering.js';
import { leaf } from './art.js';

let data;try{data=JSON.parse(localStorage.getItem('ui-lab-notebook')||'{}');}catch{data={};}
const book=new Notebook(data||{}),study=new Study({name:'notebook',height:780,mobileHeight:1340}),rows=new Map();let drag=null,pendingDelete=null,editing=null,changes=0;
const newInput=document.createElement('input');newInput.id='next-thing';newInput.className='note-input';newInput.maxLength=38;newInput.setAttribute('aria-label','下一件小事');newInput.placeholder='下一件小事…';study.overlay.append(newInput);
const editor=document.createElement('input');editor.className='note-input';editor.id='edit-task';editor.maxLength=38;editor.setAttribute('aria-label','修改事项');editor.hidden=true;study.overlay.append(editor);
const note=document.createElement('textarea');note.id='small-note';note.className='note-editor';note.setAttribute('aria-label','随手记');note.maxLength=320;note.value=book.note;study.overlay.append(note);
const save=()=>{try{localStorage.setItem('ui-lab-notebook',JSON.stringify(book.snapshot()));}catch{}changes++;};
note.addEventListener('input',()=>{book.note=note.value;save();});
const add=study.button('add-task','写下一件小事',()=>{const task=book.add(newInput.value);if(!task){study.announce(book.tasks.length>=8?'这一页最多容纳八件小事。':'先写一点文字吧。');return;}newInput.value='';sync();save();study.sound.play('paper-pin');study.announce(`已记下${task.text}`);});
const undo=study.button('undo-note','撤销最近的事项操作',()=>{if(pendingDelete||drag)return;if(book.undo()){note.value=book.note;sync();save();study.sound.play('erase');study.announce('恢复了上一笔。');}});
newInput.onkeydown=e=>{if(e.key==='Enter')add.el.click();};
function commitEdit(cancel=false){if(!editing)return;if(!cancel&&book.rename(editing,editor.value)){save();study.sound.play('select');}editing=null;editor.hidden=true;sync();}
editor.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commitEdit();}if(e.key==='Escape'){e.preventDefault();commitEdit(true);}};editor.onblur=()=>commitEdit();
function sync(){
 for(const [id,r]of rows){if(!book.tasks.some(t=>t.id===id)){for(const b of[r.check,r.rename,r.erase,r.handle,r.up,r.down]){b.el.remove();study.buttons.splice(study.buttons.indexOf(b),1);}rows.delete(id);}}
 for(const task of book.tasks){if(rows.has(task.id))continue;const id=task.id,mark=new InkTransition({writeSeconds:.3,eraseSeconds:.22});mark.setVisible(task.done,true);mark.update(1);const ink=new InkTransition({writeSeconds:.55,eraseSeconds:.28});ink.setVisible(true,study.reduced);
 const check=study.button(`check-${id}`,`完成事项：${task.text}`,()=>{if(pendingDelete)return;book.toggle(id);save();mark.setVisible(book.tasks.find(t=>t.id===id).done,study.reduced);study.sound.play(mark.target?'select':'erase');study.residue.emit('dust',left()+46,rows.get(id).y.value,{strength:.5,reduced:study.reduced});sync();study.announce(`${mark.target?'已完成':'重新打开'}${task.text}`);});
 const rename=study.button(`rename-${id}`,`修改事项：${task.text}`,()=>{if(pendingDelete)return;editing=id;editor.value=book.tasks.find(t=>t.id===id).text;editor.hidden=false;placeEditor();editor.focus();editor.select();});
 const erase=study.button(`erase-${id}`,`擦除事项：${task.text}`,()=>{if(pendingDelete||drag)return;pendingDelete=id;ink.setVisible(false,study.reduced);study.sound.play('erase');study.announce(`正在擦去${task.text}，可撤销恢复。`);});
 const handle=study.button(`move-${id}`,`移动事项：${task.text}。上下方向键调整顺序`,()=>{});handle.el.classList.add('drag-handle');
 handle.el.onpointerdown=e=>{if(e.button!==0||pendingDelete)return;e.preventDefault();const p=study.point(e);drag={id,startY:p.y,from:book.tasks.findIndex(t=>t.id===id),offset:p.y-rows.get(id).y.value,target:book.tasks.findIndex(t=>t.id===id)};handle.el.setPointerCapture(e.pointerId);study.sound.play('paper-lift');};
 handle.el.onpointermove=e=>{if(drag?.id!==id)return;const p=study.point(e);rows.get(id).y.target=p.y-drag.offset;drag.target=Math.max(0,Math.min(book.tasks.length-1,Math.round((p.y-drag.offset-rowTop())/61)));};
 const finish=(e,cancel=false)=>{if(drag?.id!==id)return;const to=drag.target;drag=null;if(!cancel&&book.reorder(id,to)){save();study.sound.play('paper-settle');study.announce(`事项移动到了第${to+1}行。`);}if(handle.el.hasPointerCapture(e.pointerId))handle.el.releasePointerCapture(e.pointerId);sync();};handle.el.onpointerup=e=>finish(e);handle.el.onpointercancel=e=>finish(e,true);
 handle.el.onkeydown=e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const index=book.tasks.findIndex(t=>t.id===id),to=index+(e.key==='ArrowUp'?-1:1);if(book.reorder(id,to)){save();sync();study.sound.play('paper-settle');study.announce(`事项移动到了第${to+1}行。`);}}};
 const up=study.button(`up-${id}`,`上移事项：${task.text}`,()=>shift(id,-1));const down=study.button(`down-${id}`,`下移事项：${task.text}`,()=>shift(id,1));
 rows.set(id,{id,check,rename,erase,handle,up,down,mark,ink,y:new Spring(rowTop()+book.tasks.findIndex(t=>t.id===id)*61,{stiffness:180,damping:24})});}
 for(const task of book.tasks){const r=rows.get(task.id);r.check.el.setAttribute('aria-pressed',String(task.done));r.check.el.setAttribute('aria-label',`${task.done?'重新打开':'完成'}事项：${task.text}`);r.rename.el.setAttribute('aria-label',`修改事项：${task.text}`);r.erase.el.setAttribute('aria-label',`擦除事项：${task.text}`);r.up.el.setAttribute('aria-label',`上移事项：${task.text}`);r.down.el.setAttribute('aria-label',`下移事项：${task.text}`);r.handle.el.setAttribute('aria-label',`移动事项：${task.text}。上下方向键调整顺序`);r.up.el.disabled=book.tasks.indexOf(task)===0;r.down.el.disabled=book.tasks.indexOf(task)===book.tasks.length-1;r.mark.setVisible(task.done,study.reduced);}
 undo.el.disabled=book.history.length===0;add.el.disabled=book.tasks.length>=8;
}
function shift(id,n){if(pendingDelete)return;const to=book.tasks.findIndex(t=>t.id===id)+n;if(book.reorder(id,to)){sync();save();study.sound.play('paper-settle');}}
function left(){return study.mobile?25:72;}function rowTop(){return 294;}function pageWidth(){return study.mobile?390:533;}
function placeEditor(){if(!editing)return;const r=rows.get(editing);study.place(editor,left()+pageWidth()/2-5,r.y.value,study.mobile?249:365,39);editor.style.fontSize=`${17*study.scale}px`;}
study.layout=()=>{for(const r of rows.values())r.y.snap(rowTop()+book.tasks.findIndex(t=>t.id===r.id)*61);};sync();
study.update=dt=>{
 if(pendingDelete&&rows.get(pendingDelete).ink.progress===0){const id=pendingDelete;pendingDelete=null;book.remove(id);sync();save();}
 for(const task of book.tasks){const r=rows.get(task.id),i=book.tasks.indexOf(task);if(drag?.id!==task.id)r.y.target=rowTop()+i*61;r.y.update(dt,study.reduced);r.ink.update(dt);r.mark.update(dt);const y=r.y.value,w=pageWidth(),x=left();study.place(r.handle,x+19,y,22,40);study.place(r.check,x+45,y,32,35);study.place(r.rename,x+w/2-6,y,study.mobile?235:370,40);study.place(r.erase,x+w-34,y,28,30);study.place(r.up,x+w-9,y-10,19,19);study.place(r.down,x+w-9,y+10,19,19);r.rename.el.hidden=editing===task.id;}
 const nx=study.mobile?220:812,ny=study.mobile?1080:316;study.place(newInput,nx-15,ny+9,study.mobile?255:244,45);newInput.style.fontSize=`${18*study.scale}px`;study.place(add,nx+140,ny+6,45,45);const memoY=study.mobile?859:560;study.place(note,nx,memoY,study.mobile?280:240,105);note.style.fontSize=`${17*study.scale}px`;study.place(undo,left()+pageWidth()-46,214,67,38);placeEditor();
};
study.isWriting=()=>[...rows.values()].some(r=>r.ink.progress>0&&r.ink.progress<1||r.mark.progress>0&&r.mark.progress<1);
study.isErasing=()=>!!pendingDelete||[...rows.values()].some(r=>!r.mark.target&&r.mark.progress>0&&r.mark.progress<1);
study.draw=c=>{
 study.heading('A page for today.','写下、打勾、划掉。留一点空白。','02 / A LIVING NOTEBOOK');
 const x=left(),w=pageWidth(),pageH=study.mobile?538:534;c.save();c.translate(x+w/2,458);sheet(c,w,pageH,{color:'#faf6e9',seed:39});c.restore();
 stroke(c,[[x+70,209],[x+70,716]],{color:colors.red,width:.55,alpha:.25});for(let i=0;i<8;i++)stroke(c,[[x+29,315+i*61],[x+w-24,317+i*61]],{color:colors.blue,width:.55,alpha:.26,seed:i});tape(c,x+100,192,77,-.12);penText(c,'LITTLE THINGS',x+36,223,{size:16,color:colors.red,progress:study.intro.progress});
 stroke(c,[[x+w-59,214],[x+w-45,205],[x+w-32,214]],{color:colors.red});stroke(c,[[x+w-58,214],[x+w-58,205]],{color:colors.red});penText(c,'UNDO',x+w-42,247,{size:9,color:colors.red,align:'center',progress:undo.ink.progress});
 const order=[...book.tasks].sort((a,b)=>(a.id===drag?.id)-(b.id===drag?.id));
 for(const task of order){const r=rows.get(task.id),y=r.y.value,ink=r.ink.progress;c.save();if(drag?.id===task.id){c.translate(x+w/2,y);sheet(c,w-24,47,{color:'#fff9e9',seed:51,lift:.4});c.translate(-x-w/2,-y);}c.globalAlpha=ink;
  for(let i=0;i<3;i++)oval(c,x+18,y-6+i*6,.7,.7,{color:colors.faint,width:1});stroke(c,[[x+33,y-12],[x+58,y-12],[x+57,y+11],[x+33,y+10],[x+33,y-12]],{color:colors.green,width:1.1,seed:41});
  stroke(c,[[x+36,y],[x+43,y+7],[x+57,y-10]],{color:colors.green,width:2,progress:r.mark.progress,seed:11});
  if(editing!==task.id){const fontSize=study.mobile?15:17,limit=study.mobile?26:36,text=task.text.length>limit?task.text.slice(0,limit-1)+'…':task.text;prose(c,text,x+79,y+5,{size:fontSize,color:task.done?'#aaa18f':colors.ink});stroke(c,[[x+77,y-1],[x+Math.min(w-63,84+text.length*fontSize*.54),y+1]],{color:colors.red,width:1.1,progress:r.mark.progress,alpha:.65});}
  const ex=x+w-36;stroke(c,[[ex-7,y-5],[ex+5,y-11],[ex+13,y+2],[ex+1,y+9],[ex-7,y-5]],{color:colors.red,width:.9});stroke(c,[[ex-3,y+2],[ex+9,y-4]],{color:colors.red,width:.7});stroke(c,[[x+w-13,y-10],[x+w-9,y-14],[x+w-5,y-10]],{color:colors.faint,width:.7});stroke(c,[[x+w-13,y+8],[x+w-9,y+12],[x+w-5,y+8]],{color:colors.faint,width:.7});c.restore();
  if(pendingDelete===task.id)stroke(c,[[x+77,y-8],[x+120+(w-205)*(1-ink),y+3]],{color:'#d0bc91',width:9,alpha:.16,seed:59});
 }
 if(drag){const y=rowTop()+drag.target*61;stroke(c,[[x+26,y+27],[x+w-25,y+27]],{color:colors.red,width:1,alpha:.4});}
 const nx=study.mobile?220:812,ny=study.mobile?1080:316;c.save();c.translate(nx,ny);c.rotate(-.025);sheet(c,study.mobile?363:329,151,{color:'#eee2b9',seed:62});c.restore();tape(c,nx-12,ny-77,66,.08);penText(c,'ONE MORE THING',nx-132,ny-43,{size:14,color:colors.red});stroke(c,[[nx+131,ny+6],[nx+148,ny+6]],{color:colors.red,width:1.6});stroke(c,[[nx+140,ny-2],[nx+140,ny+15]],{color:colors.red,width:1.6});prose(c,'Enter 也能写下 · 最多八件',nx-131,ny+56,{size:13,color:'#988567'});
 const memoY=study.mobile?859:560;c.save();c.translate(nx,memoY);sheet(c,study.mobile?339:295,171,{color:'#f6ebd5',seed:71});c.restore();tape(c,nx-25,memoY-87,65,-.05);penText(c,'A SMALL NOTE',nx-112,memoY-60,{size:13,color:colors.blue});leaf(c,nx+108,memoY+70,27,.8);
 prose(c,'拖动左侧三点换序，或用上下箭头。点文字可以重写。',study.w/2,study.mobile?1264:758,{size:study.mobile?12:14,align:'center',color:'#91866f'});study.residue.draw(c);
};
study.debug=()=>({demo:'notebook',tasks:book.tasks.map(t=>({...t})),note:book.note,history:book.history.length,drag:drag?.id||null,pendingDelete,editing,changes,audio:study.sound.context?.state||'locked',reduced:study.reduced});study.start();

