const defaults=[{id:'t1',text:'Save a small idea',done:false},{id:'t2',text:'Make room for a walk',done:true},{id:'t3',text:'Draw something slowly',done:false}];
/** Demo domain state. Kept local instead of pretending all UI is a notebook. */
export class Notebook {
 constructor(data={}){this.tasks=(Array.isArray(data.tasks)?data.tasks:defaults).filter(t=>t&&typeof t.id==='string'&&typeof t.text==='string').slice(0,8).map(t=>({id:t.id,text:t.text.slice(0,38),done:!!t.done}));if(new Set(this.tasks.map(t=>t.id)).size!==this.tasks.length)this.tasks=structuredClone(defaults);this.note=typeof data.note==='string'?data.note.slice(0,320):'留一小块空白，\n给明天的自己。';this.history=[];this.serial=Date.now();}
 snapshot(){return{tasks:this.tasks.map(t=>({...t})),note:this.note};}
 remember(){this.history.push(this.snapshot());if(this.history.length>30)this.history.shift();}
 add(text){text=text.trim().slice(0,38);if(!text||this.tasks.length>=8)return null;this.remember();const task={id:`t${++this.serial}`,text,done:false};this.tasks.push(task);return task;}
 toggle(id){const task=this.tasks.find(t=>t.id===id);if(!task)return false;this.remember();task.done=!task.done;return true;}
 rename(id,text){text=text.trim().slice(0,38);const task=this.tasks.find(t=>t.id===id);if(!task||!text||task.text===text)return false;this.remember();task.text=text;return true;}
 remove(id){const index=this.tasks.findIndex(t=>t.id===id);if(index<0)return false;this.remember();this.tasks.splice(index,1);return true;}
 reorder(id,to){const from=this.tasks.findIndex(t=>t.id===id);if(from<0||!Number.isInteger(to)||to<0||to>=this.tasks.length||from===to)return false;this.remember();const [task]=this.tasks.splice(from,1);this.tasks.splice(to,0,task);return true;}
 undo(){const state=this.history.pop();if(!state)return false;this.tasks=state.tasks;return true;}
}

