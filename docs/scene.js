(function(){
 'use strict';
 const ink='#465047';
 class Scene{
  constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.particles=[];this.lastCount=0;this.lastTime=0;this.decorTime=0;}
  rect(x,y,w,h,r,fill,stroke=ink,lw=2){const c=this.c;c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  ellipse(x,y,rx,ry,fill,stroke=ink,lw=2){const c=this.c;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  path(d,fill=null,stroke=ink,lw=2){const c=this.c,p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke(p);}}
  line(x,y,x2,y2,color=ink,w=2){const c=this.c;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
  text(s,x,y,size=13,color=ink,align='center'){const c=this.c;c.font=`${size}px "Microsoft YaHei", sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y);}
  draw(g,dt){
   const c=this.c;if(g.state==='playing'||g.state==='ready')this.decorTime+=this.reduced?0:dt;
   const t=this.decorTime,night=g.theme==='night',tunnel=g.event?.type==='tunnel';
   c.clearRect(0,0,1200,500);c.lineCap='round';c.lineJoin='round';
   c.fillStyle=night?'#cbd2cd':'#e9e9df';c.fillRect(0,0,1200,500);
   this.rect(-10,-15,1220,80,0,night?'#bbc5bf':'#dce3dc',null);
   this.rect(-5,59,1210,10,3,'#b9c5bd','#87998c',1.5);
   // Continuous overhead luggage rack and the warm cabin light.
   for(let x=15;x<1200;x+=160){this.line(x,58,x+17,18,'#9ca99c',2);this.line(x+17,18,x+120,18,'#9ca99c',2);}
   this.rect(443,6,310,9,4,'#faf5d5',null);
   this.rect(84,21,99,32,7,'#8a9e99');this.rect(111,15,30,8,3,null,ink,1.5);[103,159].forEach(x=>this.line(x,23,x,50,'#5b7169',1.5));
   this.rect(850,17,89,36,6,'#b6a384');this.line(864,19,864,51,'#786d56',2);this.line(926,19,926,51,'#786d56',2);this.rect(877,10,32,9,3,null,ink,1.5);
   // Scenery is clipped independently to each rounded high-speed train window.
   [54,340,626,912].forEach((x,i)=>{
    this.rect(x-5,84,252,165,22,'#bac7bd','#83948a',2);
    c.save();c.beginPath();c.roundRect(x,89,242,155,18);c.clip();this.landscape(x,i,t,g,tunnel);c.restore();
    this.rect(x,89,242,155,18,null,'#6f8278',2);this.path(`M ${x+17} 104 L ${x+50} 104 M ${x+13} 112 L ${x+33} 112`,null,'#ffffff80',3);
    this.rect(x-6,250,254,7,3,'#bac5b8','#8c9d8e',1);
   });
   this.line(0,273,1200,273,'#bec8b8',2);this.line(0,284,1200,284,'#f6f5e9',2);
   // Two seats, aisle, three seats — all face in the same direction.
   c.fillStyle='#b7bbae';c.fillRect(0,414,1200,86);this.path('M 458 412 L 516 412 L 570 500 L 407 500 Z','#c6c9bd',null);
   for(let x=0;x<1200;x+=180)this.line(x,500,x+42,414,'#a7b09f',1);
   this.line(0,457,1200,457,'#abb4a4',1);
   const seatColor='#6e959c';
   [198,360,620,782,944].forEach((x,i)=>this.seat(x,seatColor,['A','C','D','F','A'][i],t));
   // A quiet passenger on the other side of the aisle.
   this.person(198,256,'student',g,t+.6,.89);
   this.person(360+(g.reason==='caught'?Math.min(g.failureAge/.4,1)*145:0),249,'uncle',g,t+.9,.98);
   this.person(782-(g.reason==='caught'?Math.min(g.failureAge/.4,1)*60:0),254,'aunt',g,t+.3,.96);
   this.person(944,280,'child',g,t+.1,.75);
   this.person(620,247,'player',g,t,1.06);
   // Bag, thermos, and the incriminating snack packet.
   this.rect(492,373,56,72,11,'#b4a476');this.rect(507,361,25,15,6,null,ink,2.5);this.rect(500,403,40,27,5,'#cabc8d');this.line(502,382,538,382,'#8d835e',1);
   this.rect(1045,373,68,78,8,'#7f948c');this.rect(1066,346,26,27,4,null,ink,3);[1060,1099].forEach(x=>this.ellipse(x,454,5,5,'#4a5d51',null));[1062,1080,1098].forEach(x=>this.line(x,386,x,439,'#627a6e',2));
   this.rect(701,330,23,51,5,'#dad5ba');this.rect(701,325,23,9,3,'#81918a');this.line(705,338,705,371,'#f3efdf',2);
   c.save();c.translate(551,362);c.rotate(-.14);this.path('M -17 -12 L 16 -12 L 20 20 L -19 20 Z','#e7c967');this.text('黄豆',0,8,10,'#6a643d');this.line(-15,-7,15,-7,'#aa9850',1);c.restore();
   // Direction and seat labels are part of the carriage, not a tutorial.
   this.text('二 等 座',1146,295,13,'#7e8e7a');this.text('SECOND CLASS',1146,312,7,'#8b9685');
   if(g.state==='ready'){this.bubble('年轻，消化好。',622,195,124);}
   if(g.state==='playing'){
    if(g.event?.type==='sneeze')this.bubble('啊——嚏！',357,189,110);
    else if(g.event?.type==='snore')this.text('Z z z',389,198,23,'#6a7d68');
    else if(g.event?.type==='laugh')this.bubble('哈哈哈哈！',941,231,112);
    else if(g.event?.type==='cough')this.bubble('咳，咳咳。',354,190,112);
    else if(g.suspicion>65)this.bubble('是你吧？',782,193,102);
    else if(g.suspicion>30)this.bubble('谁带的臭豆腐？',359,186,142);
    if(g.pressure>75)this.bubble('不行了……',620,187,114);
   }
   if(g.count>this.lastCount){this.particles.push({x:653,y:365,age:0});this.lastCount=g.count;}if(g.count<this.lastCount){this.lastCount=g.count;this.particles=[];}
   if(g.holding&&!this.reduced&&Math.random()<dt*8)this.particles.push({x:657,y:363,age:0});
   this.particles=this.particles.filter(p=>p.age<1.9);for(const p of this.particles){if(g.state==='playing')p.age+=dt;c.save();c.globalAlpha=(1-p.age/1.9)*.32;let x=p.x+p.age*37,y=p.y-p.age*23;this.ellipse(x,y,10+p.age*13,7+p.age*7,'#adbc77',null);this.ellipse(x+13,y-9,8+p.age*9,8+p.age*7,'#bdc98b',null);c.restore();}
   if(g.fog>0){c.save();const haze=c.createLinearGradient(0,100,0,500);haze.addColorStop(0,`rgba(225,191,38,${g.fog*.16})`);haze.addColorStop(.6,`rgba(220,179,24,${g.fog*.43})`);haze.addColorStop(1,`rgba(200,162,18,${g.fog*.52})`);c.fillStyle=haze;c.fillRect(0,0,1200,500);c.globalAlpha=g.fog*.14;for(let i=0;i<7;i++){const drift=this.reduced?0:Math.sin(t*.35+i)*50;this.ellipse(i*210+drift,345+Math.sin(i*2)*55,180,66,'#d6b531',null);}c.restore();}
   if(tunnel||night){c.fillStyle=tunnel?'#163b4930':'#142d4926';c.fillRect(0,0,1200,500);c.fillStyle='#fff0b61a';c.fillRect(440,0,320,500);}
   if(g.reason==='caught')this.fight(g);
   if(g.reason==='diarrhea')this.accident(g);
   // Fine paper-like flecks, fixed positions so they never shimmer.
   c.fillStyle='#30452d09';for(let i=0;i<125;i++){let x=(i*173.3)%1200,y=(i*79.7)%500;c.fillRect(x,y,1,1);}
  }
  landscape(x,index,t,g,tunnel){
   const c=this.c,night=g.theme==='night',sunset=g.theme==='sunset',city=false,phase=Math.floor(g.time/27)%3;
   if(tunnel){c.fillStyle='#30454c';c.fillRect(x,89,242,155);for(let i=0;i<4;i++){let xx=x+((i*100-t*480)%400+400)%400-80;this.rect(xx,120,27,4,1,'#e2c177',null);this.line(xx,198,xx+45,198,'#547078',2);}return;}
   c.fillStyle=night?'#4b6378':sunset?'#e6c9a3':'#c3dedb';c.fillRect(x,89,242,155);
   if(index===3)this.ellipse(x+180,121,17,17,night?'#e9e4c5':sunset?'#eebc75':'#f8edbc',null);
   if(night){for(let i=0;i<12;i++){let xx=x+(i*41+index*13)%240,yy=96+(i*17)%50;this.ellipse(xx,yy,1,1,'#e2e4ce',null);}}
   else{for(let i=0;i<3;i++){let xx=x+((i*130-t*7+index*25)%360+360)%360-70;this.ellipse(xx,126+i*9,30,8,'#f5f3df',null);this.ellipse(xx+8,120+i*9,13,11,'#f5f3df',null);}}
   let offset=(t*15+index*47)%300;
   this.path(`M ${x-300-offset} 236 Q ${x-200-offset} 105 ${x-90-offset} 183 Q ${x+5-offset} 113 ${x+150-offset} 195 Q ${x+280-offset} 105 ${x+420-offset} 199 Q ${x+560-offset} 119 ${x+690-offset} 225 L ${x+700} 270 L ${x-400} 270 Z`,night?'#71847e':'#a4bba0',null);
   if(city||phase===2){for(let i=0;i<8;i++){let xx=x+((i*68-t*31+index*23)%550+550)%550-70;let h=30+(i%3)*15;this.rect(xx,223-h,44,h,1,night?'#667d79':'#bac4af',null);for(let row=0;row<3;row++)for(let col=0;col<3;col++)this.rect(xx+7+col*11,228-h+row*12,5,5,0,night?'#e3ca84':'#8da79d',null);}}
   else{offset=(t*24+index*50)%270;this.path(`M ${x-270-offset} 246 Q ${x-150-offset} 159 ${x-offset} 223 Q ${x+125-offset} 159 ${x+270-offset} 222 Q ${x+400-offset} 160 ${x+540-offset} 235 L ${x+600} 280 L ${x-500} 280 Z`,night?'#566e65':'#859f7f',null);}
   c.fillStyle=night?'#687d67':phase===1?'#9fbab0':'#bcc395';c.fillRect(x,225,242,30);
   for(let i=0;i<5;i++){let xx=x+((i*91-t*65+index*22)%460+460)%460-40;if(phase!==1){this.line(xx,236,xx,214,'#63846d',2);this.path(`M ${xx-10} 224 L ${xx} 204 L ${xx+10} 224 Z`,night?'#4e6e5c':'#75916c',null);}else this.line(xx,232,xx+30,232,'#d0dcca',2);}
   if(g.event?.type==='train'){let speed=t*650;for(let i=0;i<5;i++){let xx=x+((i*100-speed)%500+500)%500-100;this.rect(xx,160,100,88,0,'#dedfd4',null);this.rect(xx+12,177,61,29,7,'#567987',null);this.rect(xx,220,100,5,0,'#4e8393',null);}}
  }
  seat(x,color,label,t){
   this.ellipse(x,446,66,9,'#66736130',null);this.rect(x-13,380,26,56,4,'#8c9c96');
   this.rect(x-68,184,136,204,22,color,ink,2.4);this.rect(x-56,195,112,74,18,color,'#93b1b0',1.4);
   this.rect(x-39,191,78,45,9,'#f0efe2','#b4c4b9',1);this.text('和 谐 号',x,212,9,'#7e938a');this.text('CRH',x,225,8,'#8ca196');
   this.path(`M ${x-56} 281 Q ${x} 294 ${x+56} 281`,null,'#557d86',1.5);
   this.rect(x-66,363,132,29,11,'#547c86',ink,2);
   [-1,1].forEach(s=>{this.rect(x+s*65-6,327,13,59,5,'#bac5bc');this.rect(x+s*65-15,321,30,12,5,'#d2d8cd');});
  }
  person(x,y,type,g,t,scale=1){
   const c=this.c;c.save();const player=type==='player',uncle=type==='uncle',aunt=type==='aunt',child=type==='child',student=type==='student';
   const bounce=this.reduced?0:Math.sin(t*3+x)*1.3,holding=player&&g.holding,stress=player&&g.pressure>75,sus=g.suspicion>35||g.level>=3;
   c.translate(x+(stress&&!this.reduced?Math.sin(t*35)*1:0),y+bounce);c.scale(scale,scale);if(holding)c.rotate(-.025);
   const shirt=player?'#e6bf57':uncle?'#a7b3a0':aunt?'#b89b93':child?'#c98d6a':'#869ca1',skin=player?'#f0d7ad':'#e8caaa';
   // Legs and sneakers.
   this.path('M -37 122 L -38 174 Q -28 184 -12 174 L -7 127 M 7 127 L 13 176 Q 26 182 38 174 L 34 121 Z',player?'#75817c':uncle?'#6a776a':'#7f8474');
   this.path('M -39 168 L -12 168 L -10 180 Q -28 187 -48 181 L -48 175 Z',player?'#eeeedd':'#53635b');
   this.path('M 13 168 L 37 168 L 48 176 L 48 182 Q 28 188 12 180 Z',player?'#eeeedd':'#53635b');
   this.line(-45,180,-14,180,'#8b9484',1);this.line(16,181,44,181,'#8b9484',1);
   // Soft, plump torsos.
   this.path('M -27 48 Q -54 52 -53 94 L -47 128 Q -3 141 45 128 L 51 91 Q 49 54 27 49 Z',shirt);
   if(player){this.path('M -24 49 Q 0 77 25 48 L 14 43 L -13 43 Z','#f3d47b');this.line(-14,59,-16,87,'#76693f',1.5);this.line(15,59,17,88,'#76693f',1.5);this.path('M -23 102 Q 0 110 23 101 L 20 120 L -20 121 Z',null,'#b2944f',1.5);this.ellipse(0,99,23+(g.pressure/100)*8,24+(g.pressure/100)*6,'#ecc766',null);}
   if(uncle){this.path('M -16 50 L 0 69 L 17 50',null,'#768776',1.5);this.line(0,70,0,126,'#819381',1);this.rect(15,72,20,22,2,null,'#758875',1);}
   if(aunt){for(let i=0;i<11;i++){let xx=-32+(i*23)%65,yy=67+(i*17)%56;this.ellipse(xx,yy,3,4,'#e8c5b2',null);this.ellipse(xx+3,yy+2,3,3,'#e8c5b2',null);}}
   // Neck and ears.
   this.rect(-13,32,26,23,8,skin);this.ellipse(-37,12,8,11,skin);this.ellipse(37,12,8,11,skin);
   if(aunt)this.ellipse(0,-2,45,45,'#606658');
   this.path('M -37 -10 Q -38 -42 0 -43 Q 39 -42 38 -7 L 36 22 Q 33 46 0 47 Q -33 46 -37 22 Z',skin,ink,2.3);
   if(player||student||child){this.path('M -37 2 Q -48 -30 -21 -41 Q 5 -57 31 -37 Q 45 -30 39 4 L 28 -10 L 23 -23 L 15 -14 L 6 -23 L -6 -13 L -17 -23 L -25 -9 Z','#414d43');}
   if(uncle){this.path('M -36 -13 Q -35 -42 -17 -39 M 17 -39 Q 37 -41 38 -13',null,'#6e7163',5);this.path('M -12 27 Q -5 18 0 25 Q 8 18 14 27','#626856',null);}
   if(aunt){this.path('M -38 -10 Q -22 -5 -14 -25 Q 12 -1 38 -9 L 35 -28 Q 1 -52 -29 -30 Z','#606658');this.ellipse(31,-35,16,13,'#606658');}
   const blink=!this.reduced&&Math.sin(t*.8+x)>.995,look=player?(sus?5:Math.sin(t*.4)*2):sus?(x<600?5:-5):0;
   if(holding||blink||(g.theme==='night'&&!sus&&!player)){this.path('M -22 4 L -12 7 L -22 10 M 22 4 L 12 7 L 22 10',null,ink,2);}
   else{this.ellipse(-17,8,3,4.6,ink,null);this.ellipse(17,8,3,4.6,ink,null);if(player){this.line(-24,-4,-12,-7,ink,2);this.line(12,-7,24,-4,ink,2);}}
   if(student){this.rect(-29,-1,25,19,6,null,ink,1.5);this.rect(4,-1,25,19,6,null,ink,1.5);this.line(-4,5,4,5,ink,1.5);}
   this.path('M 0 12 L -3 22 L 3 23',null,'#b39b7b',1.4);
   this.ellipse(-26,23,8,4,player&&(holding||stress)?'#d69779':'#d8ad8f',null);this.ellipse(26,23,8,4,player&&(holding||stress)?'#d69779':'#d8ad8f',null);
   if(holding)this.ellipse(0,33,4,3,ink,null);else this.path(sus&&!player?'M -8 34 Q 0 29 8 34':'M -7 32 Q 0 36 7 32',null,ink,1.5);
   if(stress){this.path('M 44 -14 Q 32 3 44 7 Q 55 3 44 -14 Z','#a3c6cb','#6d989c',1);}
   // Hands are visible against the belly, phone, newspaper, or mask.
   if(player){this.path('M -41 73 Q -49 107 -14 108',null,shirt,15);this.path('M 40 73 Q 47 105 13 110',null,shirt,15);this.ellipse(-11,108,14,8,skin);this.ellipse(11,109,14,8,skin);this.line(-4,104,-2,111,'#bba281',1);}
   else if(uncle&&sus){this.path('M 35 85 Q 50 35 13 22',null,shirt,15);this.ellipse(11,23,14,9,skin);}
   else if(aunt&&g.suspicion>45){this.path('M -29 19 Q 0 10 29 19 L 25 39 Q 0 49 -25 39 Z','#d8e3da','#899f96',1.5);this.line(-20,27,20,27,'#a7b9ac',1);this.line(-20,33,20,33,'#a7b9ac',1);this.ellipse(-27,102,10,8,skin);this.ellipse(27,102,10,8,skin);}
   else if(uncle){c.save();c.translate(0,96);c.rotate(.08);this.path('M -43 -20 L -1 -15 L 43 -21 L 39 35 L -1 39 L -40 33 Z','#e6e5d3');this.line(-1,-15,-1,38,'#b1b9a3',1);this.text('今日高铁',-18,-4,8,'#6d7b63');for(let i=0;i<4;i++){this.line(-33,5+i*6,-8,5+i*6,'#9ca68e',1);this.line(7,-8+i*7,32,-8+i*7,'#9ca68e',1);}c.restore();this.ellipse(-40,103,7,11,skin);this.ellipse(41,101,7,11,skin);}
   else{this.rect(-13,86,27,39,4,'#536c67');this.rect(-9,91,19,24,2,'#bdd0ba',null);this.ellipse(-17,108,10,7,skin);this.ellipse(17,108,10,7,skin);}
   if(child&&g.suspicion>70){this.path('M -19 13 L -21 33 M 19 13 L 22 32',null,'#8db7c3',4);this.ellipse(0,33,8,7,'#826254');}
   c.restore();
  }
  accident(g){
   const c=this.c,a=g.failureAge,spread=Math.min(1,a/.8);
   c.save();c.globalAlpha=.75*spread;this.ellipse(620,448,36+spread*25,8+spread*4,'#9a8151','#776c4b',1.5);c.restore();
   this.bubble('完了……',620,184,112);
   // Embarrassed face and stomach cramps distinguish this loss from the scuffle.
   this.line(596,250,607,259,ink,2.5);this.line(607,250,596,259,ink,2.5);this.line(631,250,642,259,ink,2.5);this.line(642,250,631,259,ink,2.5);
   this.path('M 653 247 Q 642 263 653 268 Q 665 263 653 247 Z','#9cbdc7','#6f96a2',1.5);
   for(let i=0;i<3;i++){let x=595+i*24,dy=this.reduced?0:Math.sin(a*3+i)*5;this.path(`M ${x} ${429+dy} Q ${x-9} ${418+dy} ${x} ${407+dy} Q ${x+9} ${397+dy} ${x} ${385+dy}`,null,'#a38d58',2);}
  }
  fight(g){
   const c=this.c,a=g.failureAge;
   if(a<.4){this.bubble('原来是你！',720,187,128);return;}
   const wobble=this.reduced?0:Math.sin(a*15)*6;
   c.save();c.translate(620+wobble,322);
   // Cartoon scuffle: a dust cloud, flailing fists and stars; no gore.
   [[-66,3,57,45],[-27,-36,52,48],[24,-38,57,44],[69,-1,51,43],[27,36,58,41],[-25,39,51,39]].forEach(([x,y,rx,ry])=>this.ellipse(x,y,rx,ry,'#f9efd3','#756e52',2.5));
   this.ellipse(0,0,71,51,'#f9efd3',null);
   const punch=this.reduced?10:Math.max(0,Math.sin(a*12))*22;
   this.rect(-113+punch,-24,50,27,10,'#e9c59f',ink,2.5);this.rect(66-punch,9,49,27,10,'#e9c59f',ink,2.5);
   [-1,1].forEach(side=>{let xx=side*(95-punch);for(let i=0;i<3;i++)this.line(xx+i*5,side<0?-21:12,xx+i*5,side<0?-12:21,'#9d8464',1);});
   for(let i=0;i<4;i++){let ang=i*Math.PI/2+a*.65,xx=Math.cos(ang)*118,yy=Math.sin(ang)*72;c.save();c.translate(xx,yy);c.rotate(ang);this.path('M 0 -14 L 4 -4 L 15 -4 L 6 3 L 10 14 L 0 7 L -10 14 L -6 3 L -15 -4 L -4 -4 Z','#edbf45','#876b3e',1.5);c.restore();}
   c.font='bold 37px "Microsoft YaHei",sans-serif';c.fillStyle='#a35c37';c.textAlign='center';c.fillText(a>1.5?'饶命！':'砰！',0,10);c.restore();
  }
  bubble(s,x,y,w){this.rect(x-w/2,y-24,w,32,9,'#fff9e8','#7c876e',1.4);this.path(`M ${x-5} ${y+8} L ${x} ${y+15} L ${x+6} ${y+8}`,'#fff9e8','#7c876e',1.4);this.line(x-4,y+8,x+5,y+8,'#fff9e8',2);this.text(s,x,y-3,12,'#52614b');}
 }
 window.SoyScene=Scene;
})();
