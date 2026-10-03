import { clamp,smooth,mix } from '../primitives/motion.js';
const bump=(t,a,b)=>t<a||t>b?0:Math.sin((t-a)/(b-a)*Math.PI);
const decay=(t,rate)=>Math.exp(-Math.max(0,t)*rate);
export const materials={
 paper:{duration:1.05,events:[{at:.1,name:'paper-lift'},{at:.68,name:'paper-settle'}]},
 leaf:{duration:1.6,events:[{at:.12,name:'leaf-wind'},{at:1.18,name:'leaf-settle'}]},
 bell:{duration:2.5,events:[{at:.12,name:'bell'},{at:.49,name:'bell-echo'}]},
 stone:{duration:.65,events:[{at:.095,name:'stone-impact'}]},
 lamp:{duration:1.25,events:[{at:.14,name:'lamp-switch'},{at:.5,name:'lamp-settle'}]},
 creature:{duration:.94,events:[{at:.16,name:'takeoff'},{at:.55,name:'landing'}]},
};
export function materialPose(kind,t){
 const pose={x:0,y:0,angle:0,squash:0,fold:0};
 if(kind==='paper'){pose.y=-20*bump(t,.08,.75);pose.angle=.085*Math.sin((t-.1)*11)*decay(t-.1,3.6)*smooth((t-.05)/.1);pose.fold=.9*bump(t,0,.22);}
 if(kind==='leaf'){const p=clamp((t-.1)/1.35);pose.x=Math.sin(p*Math.PI*2)*19;pose.y=-28*Math.sin(p*Math.PI);pose.angle=Math.sin(p*Math.PI*3)*.32*(1-p);}
 if(kind==='bell'){pose.angle=.3*Math.sin(Math.max(0,t-.075)*14)*decay(t-.075,2.3)*smooth((t-.04)/.07);}
 if(kind==='stone'){pose.x=3*Math.sin(t*20)*decay(t,8);pose.y=-2*bump(t,.04,.12)+1.8*bump(t,.12,.23);pose.angle=.025*bump(t,0,.22);}
 if(kind==='lamp'){pose.angle=.12*Math.sin(Math.max(0,t-.12)*17)*decay(t-.12,4.5)*smooth(t/.12);}
 if(kind==='creature'){pose.squash=.18*bump(t,0,.16)-.06*bump(t,.16,.51)+.2*bump(t,.55,.73);pose.y=-45*bump(t,.16,.55);pose.x=12*bump(t,.16,.55);pose.angle=.035*bump(t,.16,.55);}
 return pose;
}
export function blendPose(from,to,t){return Object.fromEntries(Object.keys(to).map(k=>[k,mix(from[k]||0,to[k],smooth(t))]));}

