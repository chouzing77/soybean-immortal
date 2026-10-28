(function(root){
 'use strict';
 const RANKS=[{n:10,name:'小屁孩',note:'初出茅庐，有点动静。'},{n:30,name:'放气学徒',note:'开始掌握风的方向。'},{n:60,name:'御风高手',note:'藏一声于轰鸣之间。'},{n:80,name:'无声宗师',note:'人未动，江湖已有传闻。'},{n:100,name:'豆气尊者',note:'三碗黄豆，修得百次。'},{n:128,name:'黄豆仙人',note:'一百二十八声，功德圆满。'}];
 const CONFIG={name:'高铁二等座',carriage:'06 车厢',seat:'05F · 二等座',duration:1800};
 const EVENTS={
  tunnel:{label:'进入隧道',caption:'轰隆隆——趁现在',noise:94,duration:[4.5,6.5]},
  broadcast:{label:'车厢广播',caption:'前方到站……',noise:63,duration:[3.1,4.7]},
  sneeze:{label:'大叔打喷嚏',caption:'啊——嚏！',noise:77,duration:[1.1,1.7]},
  train:{label:'列车交会',caption:'另一趟列车呼啸而过',noise:83,duration:[2.8,4.3]},
  cough:{label:'邻座咳嗽',caption:'咳，咳咳。',noise:46,duration:[1.5,2.4]},
  laugh:{label:'同学大笑',caption:'哈哈哈哈哈！',noise:68,duration:[2.8,4.1]},
  snore:{label:'大叔打鼾',caption:'呼噜……呼噜……',noise:58,duration:[3.2,5.2]},
  spray:{label:'清新剂救场',caption:'茉莉花香，有点不对劲',noise:38,duration:[2.7,3.5]}
 };
 function rng(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 const clamp=(n,l=0,h=100)=>Math.max(l,Math.min(h,n));
 function rankFor(n){return RANKS.filter(r=>n>=r.n).at(-1)||{n:0,name:'无名之辈',note:'江湖还没听见你的名字。'};}
 class Game {
  constructor(seed=Date.now()){this.reset(seed);}
  reset(seed=Date.now()){
   this.config=CONFIG;this.random=rng(seed);this.state='ready';this.time=0;this.pressure=32;this.suspicion=0;this.hold=0;this.holding=false;this.volume=0;this.count=0;this.perfect=0;this.cooldown=0;this.vented=0;this.burstExposed=false;this.event=null;this.timeline=[];this.reason='';this.notifications=[];this.eventIndex=0;this.level=0;this.exposureAge=10;this.failureAge=0;this.failurePaused=false;this.coverUntil=0;
   let at=2.5;
   while(at<CONFIG.duration){const hour=(16+at/20)%24;const pool=hour>=20||hour<6?['snore','tunnel','cough','train']:['tunnel','broadcast','sneeze','train','cough','laugh'];const type=this.timeline.length===0?'tunnel':pool[Math.floor(this.random()*pool.length)],ev=EVENTS[type],len=ev.duration[0]+this.random()*(ev.duration[1]-ev.duration[0]);this.timeline.push({type,start:at,end:at+len,...ev});at+=len+2.5+this.random()*3;}
  }
  get hour(){return (16+this.time/20)%24;}
  get theme(){return this.hour>=20||this.hour<5?'night':this.hour>=18||this.hour<7?'sunset':'day';}
  get clock(){const mins=Math.floor(this.hour*60);return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');}
  get target(){return RANKS[this.level];}
  get sensitivity(){return 1+this.level*.18;}
  get fog(){return this.count/128;}
  get noise(){return this.event?Math.max(18,this.event.noise-this.level*4):(this.theme==='night'?4:7);}
  get next(){return this.timeline[this.eventIndex]||null;}
  start(){if(this.state==='ready')this.state='playing';}
  pause(){if(this.state==='playing'){this.release();if(this.state==='playing')this.state='paused';}}
  resume(){if(this.state==='paused')this.state='playing';}
  nextLevel(){if(this.state!=='levelup')return;this.level++;this.suspicion=0;this.exposureAge=10;this.pressure=Math.min(this.pressure,45);this.state='playing';}
  press(){if(this.state!=='playing'||this.holding||this.cooldown>0||this.pressure<6)return false;this.holding=true;this.hold=0;this.vented=0;this.burstExposed=false;return true;}
  release(){
   if(!this.holding||this.state!=='playing')return false;
   this.holding=false;const valid=this.hold>=.159&&this.vented>=3.99;
   if(valid){this.count++;if(!this.burstExposed)this.perfect++;}
   this.hold=0;this.volume=0;this.cooldown=.14;
   if(valid&&this.count>=this.target.n){this.notifications.push({type:'rank',rank:this.target});if(this.level===5)this.finish('immortal');else this.state='levelup';}return valid;
  }
  tick(dt){
   if(this.state==='caught'){if(!this.failurePaused){this.failureAge+=Math.min(dt,.25);if(this.failureAge>=2.5){this.state='ended';this.notifications.push({type:'end',reason:this.reason});}}return;}
   if(this.state!=='playing')return;
   let left=Math.min(dt,.25);while(left>0&&this.state==='playing'){const step=Math.min(left,1/120);this.step(step);left-=step;}
  }
  step(dt){
   this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.exposureAge+=dt;
   while(this.next&&this.time>=this.next.end)this.eventIndex++;
   const previous=this.event;const next=this.next;this.event=next&&this.time>=next.start?next:null;
   if(previous&&!this.event&&this.holding)this.coverUntil=previous.end+.35;
   this.pressure=clamp(this.pressure+(5.3+this.level*.22)*dt);
   if(this.holding){this.hold+=dt;this.volume=clamp(10+54*this.hold+12*this.hold*this.hold);const vent=Math.min(this.pressure,28*dt);this.pressure-=vent;this.vented+=vent;
    const excess=this.volume-this.noise;
    if(excess>0){this.burstExposed=true;this.exposureAge=0;const grace=this.time<this.coverUntil;const rate=(this.event?5+excess*.38:10+excess*.65)*this.sensitivity;this.suspicion=clamp(this.suspicion+rate*dt*(grace?.15:1));}
    if(this.suspicion>=100){this.finish('caught');return;}
    if(this.pressure<=.01)this.release();
   }
   if(this.exposureAge>1.2)this.suspicion=Math.max(0,this.suspicion-dt*9);
   if(this.pressure>=100)this.finish('diarrhea');
  }
  finish(reason){if(this.state==='ended'||this.state==='caught')return;this.holding=false;this.hold=0;this.volume=0;this.reason=reason;
   if(reason==='immortal'){this.state='ended';this.notifications.push({type:'end',reason});}
   else{if(reason==='caught')this.suspicion=100;this.state='caught';this.failureAge=0;this.notifications.push({type:'caught',reason});}
  }
 }
 const api={Game,RANKS,EVENTS,rankFor,clamp};root.SoyEngine=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
