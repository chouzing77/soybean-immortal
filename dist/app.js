(function(){
 'use strict';
 const {Game,RANKS,rankFor}=SoyEngine,$=id=>document.getElementById(id),game=new Game(),scene=new SoyScene($('scene')),sound=new SoySound();
 let best=0,saved={},lastCount=-1,last=performance.now(),toastTimer,dialogWasPlaying=false,pointer=null,spaceDown=false;
 try{saved=JSON.parse(localStorage.getItem('soybean-immortal-v2')||'{}');best=Math.max(0,Math.min(128,Number(saved.best)||0));if(saved.muted)sound.setEnabled(false);}catch{}
 const svg=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
 function persist(){try{localStorage.setItem('soybean-immortal-v2',JSON.stringify({...saved,best,muted:!sound.enabled}));}catch{}}
 function toast(s){$('toast').textContent=s;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
 function ranksHTML(n){return RANKS.map(r=>{const unlocked=n>=r.n;return `<div class="milestone ${unlocked?'unlocked':'locked'} ${game.target.n===r.n?'current':''}"><span class="medal">${svg(unlocked?'bean':'lock')}</span><span><strong>${unlocked?r.name:'未解锁'}</strong><small>${String(r.n).padStart(3,'0')} 次</small></span></div>`;}).join('');}
 function updateRanks(){if(game.count>best){best=game.count;persist();}$('best-count').textContent=best;$('milestones').innerHTML=ranksHTML(best);$('rank-name').textContent=rankFor(game.count).name;}
 function setSound(){const b=$('sound');b.innerHTML=svg(sound.enabled?'sound':'mute');b.setAttribute('aria-label',sound.enabled?'关闭声音':'开启声音');b.setAttribute('aria-pressed',String(sound.enabled));}
 function reset(){game.reset();pointer=null;spaceDown=false;lastCount=-1;$('pause-cover').hidden=true;$('failure-banner').hidden=true;document.querySelector('.game').classList.remove('is-running');update();}
 function start(){sound.init();game.start();document.querySelector('.game').classList.add('is-running');$('release-icon').innerHTML='<use href="#i-wind"/>';update();}
 function pause(){if(game.state!=='playing')return;game.pause();spaceDown=false;pointer=null;if(game.state==='paused'){$('pause-cover').hidden=false;$('resume').focus();}update();}
 function resume(){if(game.state!=='paused')return;game.resume();$('pause-cover').hidden=true;sound.init();update();$('release').focus({preventScroll:true});}
 function release(){game.release();update();}
 function openModal(html){if(game.state==='caught')return;dialogWasPlaying=game.state==='playing';if(dialogWasPlaying){game.pause();spaceDown=false;pointer=null;}$('modal-content').innerHTML=html;if(!$('modal').open)$('modal').showModal();update();}
 function closeModal(){if($('modal').open)$('modal').close();}
 $('modal').addEventListener('close',()=>{if(game.state==='levelup'){game.nextLevel();updateRanks();}if(dialogWasPlaying&&game.state==='paused'){game.resume();dialogWasPlaying=false;}update();});
 $('modal-close').onclick=closeModal;
 $('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
 function showRanks(){openModal(`<div class="eyebrow">豆界名人录</div><h2>成仙之路</h2><p class="unlocked-caption">最高单局纪录 ${best} 次 · ${rankFor(best).name}</p><div class="modal-ranks">${ranksHTML(best)}</div>`);}
 $('achievements').onclick=showRanks;$('all-achievements').onclick=showRanks;
 $('help').onclick=()=>openModal(`<div class="eyebrow">G128 · 二等座生存指南</div><h2>有响动，就有机会。</h2><div class="help-row"><span>01</span><div><strong>按住释放，松开憋住</strong><p>空格键或黄色按钮。一次有效释放至少约 0.16 秒，松开后计为一次。</p></div></div><div class="help-row"><span>02</span><div><strong>借一点周围的声音</strong><p>隧道、喷嚏、广播都是掩护。按得越久越响；音量越过绿色刻线就会暴露，越往后乘客越敏感。</p></div></div><div class="help-row"><span>03</span><div><strong>别憋到极限</strong><p>安静时释放很容易被抓包，邻座会当场发作。压力满格会窜稀失败。六关累计 128 次成仙。</p></div></div>`);
 $('sound').onclick=()=>{sound.init();sound.setEnabled(!sound.enabled);setSound();persist();};
 $('start-game').onclick=()=>{if(game.state==='ready'){start();$('release').focus({preventScroll:true});}};$('pause').onclick=pause;$('resume').onclick=resume;$('back-home').onclick=()=>reset();
 const button=$('release');button.addEventListener('contextmenu',e=>e.preventDefault());
 button.addEventListener('pointerdown',e=>{if(e.button!==0||pointer!==null||$('modal').open)return;e.preventDefault();button.focus({preventScroll:true});sound.init();if(game.state==='ready'){start();return;}if(game.state==='ended'){reset();start();return;}if(game.state==='playing'){pointer=e.pointerId;button.setPointerCapture(e.pointerId);if(!game.press()&&game.pressure<6)toast('肚子空空，先缓一缓。');update();}});
 button.addEventListener('pointerup',e=>{if(e.pointerId===pointer){pointer=null;release();}});
 button.addEventListener('pointercancel',()=>{pointer=null;release();});button.addEventListener('lostpointercapture',()=>{if(pointer!==null){pointer=null;release();}});
 // Keyboard-generated clicks are supported without duplicating pointer actions.
 button.addEventListener('click',e=>{if(e.detail!==0)return;if(game.state==='ready')start();else if(game.state==='ended'){reset();start();}});
 document.addEventListener('keydown',e=>{
  if($('modal').open)return;if(e.code==='Escape'||e.code==='KeyP'){if(game.state==='playing'){e.preventDefault();pause();}else if(game.state==='paused'){e.preventDefault();resume();}return;}
  if(e.code!=='Space'||e.repeat)return;const target=e.target;if(target instanceof HTMLButtonElement&&target!==button)return;if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement)return;
  e.preventDefault();if(game.state==='ready'){start();return;}if(game.state!=='playing')return;spaceDown=true;sound.init();game.press();update();
 });
 document.addEventListener('keyup',e=>{if(e.code==='Space'&&spaceDown){e.preventDefault();spaceDown=false;release();}});
 window.addEventListener('blur',()=>{if(game.state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state==='playing')pause();});
 function end(){updateRanks();sound.update(game);const reason=game.reason,rank=rankFor(game.count),success=reason==='immortal';const titles={caught:'这顿揍，没躲过去。',diarrhea:'窜稀了，任务失败。',immortal:'恭迎，黄豆仙人。'};const caption={caught:'下次，借一点别人的声音。',diarrhea:'肚子到了极限。',arrived:'拎上行李，假装什么都没发生。',immortal:'一百二十八声。此行，功德圆满。'};if(success)sound.achievement();else sound.tone(120,.5,.2,'triangle');
  persist();
  openModal(`<div class="result"><div class="eyebrow">${success?'通关':'任务失败'}</div><div class="result-bean">${svg('bean')}</div><h2>${titles[reason]}</h2><p>${caption[reason]}</p><div class="result-score">${game.count}<small>次释放</small></div><div class="result-stats"><span>本次称号<b style="font-family:inherit">${rank.name}</b></span><span>完美掩护<b>${game.perfect} 次</b></span><span>坚持时间<b>${formatTime(game.time)}</b></span></div><button class="primary" id="retry">再坐一趟 ${svg('arrow')}</button><button class="text-btn" id="choose-route">返回候车室</button></div>`);
  $('retry').onclick=()=>{closeModal();reset();start();};$('choose-route').onclick=()=>{closeModal();reset();};
 }
 function formatTime(t){t=Math.max(0,Math.ceil(t));return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;}
 function update(){
  $('time').textContent=game.clock;$('level-label').textContent=`第 ${game.level+1} 关${best>=game.target.n?' · '+game.target.name:''}`;$('level-count').textContent=`${game.count} / ${game.target.n} 次`;$('score').textContent=String(game.count).padStart(3,'0');
  $('pressure-value').textContent=Math.round(game.pressure);$('pressure-bar').style.transform=`scaleX(${game.pressure/100})`;$('pressure-bar').style.background=game.pressure>78?'#d98062':game.pressure>55?'#dfb957':'#abb982';$('pressure-caption').textContent=game.pressure>78?'快到极限了！':game.pressure>55?'肚子开始抗议':'目前还能忍';
  $('volume-bar').style.transform=`scaleX(${game.volume/100})`;$('volume-bar').style.background=game.volume>game.noise?'#d98062':'#e7bf56';$('noise-limit').style.left=game.noise+'%';$('volume-status').textContent=game.holding?(game.volume>game.noise?'太响了！':'藏住了'):game.state==='ready'?'蓄势待发':'憋住，等机会';
  $('suspicion-value').textContent=Math.floor(game.suspicion)+'%';$('suspicion-bar').style.transform=`scaleX(${game.suspicion/100})`;$('suspicion-text').textContent=game.reason==='diarrhea'?'肚子到了极限':game.state==='caught'?'当场抓包，无处可逃':game.suspicion>70?'邻座已经盯上你了！':game.suspicion>35?'有人听到了！快停下':'各忙各的，岁月静好';$('trip-progress').style.transform=`scaleX(${game.count/128})`;
  let ambient='车轮轻响 · 一切如常';if(game.state!=='ready'){if(game.event)ambient=game.event.label+' · '+Math.max(0,game.event.end-game.time).toFixed(1)+'s';else if(game.next&&game.next.start-game.time<2.5)ambient=game.next.label+' · 即将响起';else if(game.theme==='night')ambient='夜深了 · 屏住呼吸';}
  $('ambient-text').textContent=ambient;$('ambient').classList.toggle('cover',!!game.event);$('release').classList.toggle('holding',game.holding);$('release').classList.toggle('danger',game.holding&&game.volume>game.noise);$('start-cover').hidden=game.state!=='ready';$('release').disabled=['ready','paused','caught','levelup'].includes(game.state);$('help').disabled=game.state==='caught';$('achievements').disabled=game.state==='caught';$('all-achievements').disabled=game.state==='caught';$('release-label').textContent=game.state==='ready'?'按住，悄悄放':game.state==='ended'?'再坐一趟':game.state==='caught'?(game.reason==='diarrhea'?'任务失败':'被抓了……'):game.state==='levelup'?'称号已解锁':game.holding?'嘘——释放中':'按住，悄悄放';$('pause').disabled=game.state!=='playing';
  if(lastCount!==game.count){lastCount=game.count;updateRanks();}
  while(game.notifications.length){const n=game.notifications.shift();if(n.type==='rank'){sound.achievement();updateRanks();if(game.state==='levelup'){pointer=null;spaceDown=false;showLevel(n.rank);}else toast('称号解锁 · '+n.rank.name);}else if(n.type==='caught'){pointer=null;spaceDown=false;$('failure-banner').hidden=false;$('failure-banner').querySelector('strong').textContent=game.reason==='diarrhea'?'窜稀了！':'被发现了！';$('failure-banner').querySelector('span').textContent=game.reason==='diarrhea'?'任务失败':'邻座忍无可忍……';if(game.reason==='diarrhea')sound.diarrhea();else sound.caught();}else if(n.type==='end')end();}
 }
 function showLevel(rank){openModal(`<div class="result"><div class="eyebrow">第 ${game.level+1} 关 · 通关</div><div class="result-bean">${svg('award')}</div><h2>${rank.name}</h2><p>${rank.note}</p><div class="level-unlock">${game.count} 次释放 · 称号已解锁</div><p>第 ${game.level+2} 关${best>=RANKS[game.level+1].n?' · '+RANKS[game.level+1].name:''}</p><button class="primary" id="next-level">继续闯关 ${svg('arrow')}</button></div>`);$('next-level').onclick=()=>{game.nextLevel();updateRanks();closeModal();$('release').focus({preventScroll:true});};}

 function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;game.tick(dt);scene.draw(game,dt);sound.update(game);update();requestAnimationFrame(frame);}
 updateRanks();setSound();reset();requestAnimationFrame(frame);
})();
