(function(){
 'use strict';
 class Sound{
  constructor(){this.enabled=true;this.ctx=null;this.lastBeat=-1;this.lastEvent=null;}
  init(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.42:0;this.master.connect(this.ctx.destination);const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);let data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;
   this.rumble=this.ctx.createBufferSource();this.rumble.buffer=buffer;this.rumble.loop=true;this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=120;this.rumbleGain=this.ctx.createGain();this.rumbleGain.gain.value=0;this.rumble.connect(this.filter).connect(this.rumbleGain).connect(this.master);this.rumble.start();
   this.fart=this.ctx.createOscillator();this.fart.type='sawtooth';this.fart.frequency.value=49;this.fartFilter=this.ctx.createBiquadFilter();this.fartFilter.type='lowpass';this.fartFilter.frequency.value=170;this.fartGain=this.ctx.createGain();this.fartGain.gain.value=0;this.fart.connect(this.fartFilter).connect(this.fartGain).connect(this.master);this.fart.start();
  }catch(e){this.ctx=null;return;}}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}
  setEnabled(on){this.enabled=on;if(this.ctx)this.master.gain.setTargetAtTime(on?.42:0,this.ctx.currentTime,.04);}
  tone(freq=440,duration=.1,volume=.12,type='sine',offset=0){if(!this.ctx||!this.enabled)return;let t=this.ctx.currentTime+offset,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.master);o.start(t);o.stop(t+duration+.03);}
  puff(duration=.08,frequency=500,volume=.1){if(!this.ctx)return;const t=this.ctx.currentTime,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.value=frequency;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);s.connect(f).connect(g).connect(this.master);s.start();s.stop(t+duration);}
  diarrhea(){this.puff(.75,130,.3);[95,66,43].forEach((n,i)=>this.tone(n,.3,.2,'sawtooth',i*.23));}
  caught(){[0,.35,.7,1.05].forEach((offset)=>this.tone(85,.13,.28,'triangle',offset));this.tone(230,.17,.2,'sawtooth');}
  achievement(){[392,494,587,784].forEach((n,i)=>this.tone(n,.25,.18,'sine',i*.1));}
  update(g){if(!this.ctx)return;let t=this.ctx.currentTime,playing=g.state==='playing';const tunnel=playing&&g.event?.type==='tunnel';this.rumbleGain.gain.setTargetAtTime(playing?(tunnel?.22:.035):0,t,.15);this.filter.frequency.setTargetAtTime(tunnel?550:120,t,.12);
   const active=playing&&g.holding;this.fartGain.gain.setTargetAtTime(active?.035+g.volume/260:0,t,.025);this.fart.frequency.setTargetAtTime(47+Math.sin(g.time*39)*9+g.volume*.5,t,.012);this.fartFilter.frequency.setTargetAtTime(100+g.volume*6,t,.02);
   if(!playing)return;const beat=Math.floor(g.time*2.7);if(beat!==this.lastBeat){this.lastBeat=beat;this.puff(.055,beat%2?180:260,tunnel?.13:.055);if(g.event?.type==='snore'&&beat%5===0)this.puff(.25,130,.22);}
   const event=g.event?.start;if(event&&event!==this.lastEvent){this.lastEvent=event;const type=g.event.type;if(type==='broadcast'){[523,659,784].forEach((n,i)=>this.tone(n,.4,.12,'sine',i*.2));}else if(type==='sneeze')this.puff(.5,1600,.6);else if(type==='cough'){this.puff(.2,450,.35);this.tone(110,.22,.15,'triangle',.22);}else if(type==='train')this.tone(164,1.5,.2,'triangle');else if(type==='spray')this.puff(2,2800,.22);else if(type==='laugh'){[240,290,240,260].forEach((n,i)=>this.tone(n,.15,.17,'triangle',i*.22));}}
  }
 }
 window.SoySound=Sound;
})();
