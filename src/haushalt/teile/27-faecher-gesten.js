// ---------- Fächer-Menü (Florian 15.11.2026): lange auf den Reiter Start drücken. Stufe 1 Gruppen, Stufe 2 Bereiche der Gruppe ----------
function fanGroups(){return AREA_GROUPS.map(g=>{const L=[];AREAS.filter(a=>a[6]===g[0]).forEach(a=>{L.push([a[0],a[3]||a[1],a[4]||a[2]+"|"]);if(a[2]==="woche")L.push(["📅","Kalender","woche|wp:3"])});
  if(g[0]==="quer")L.push(["🔍","Suche","suche|"],["🗂️","Bereiche","bereiche|"]);return {id:g[0],ic:g[1],name:g[2]==="Quer durch alles"?"Quer":g[2],items:L}})}
// Aufbau: Gruppen als Säule über dem Start-Reiter (Essen unten, nah am Daumen), Bereiche der gewählten Gruppe als Reihe nach rechts
function fanPos(f){const W=innerWidth,gx=f.ox,top=f.oy-74;const G=f.G.map((g,i)=>[gx,top-i*66]);let I=[];
  if(f.g>=0){const n=f.G[f.g].items.length,x0=gx+78,sp=n>1?Math.min(70,(W-34-x0)/(n-1)):0,y=G[f.g][1];I=f.G[f.g].items.map((_,j)=>[x0+j*sp,y])}return {G,I}}
function fanOpen(ox,oy){if(S.fan)return;const G=fanGroups();S.fan={ox:Math.max(40,ox),oy,G,g:-1,sel:-1,moved:false};
  const el=document.createElement("div");el.id="fan";document.body.appendChild(el);fanDraw();
  el.addEventListener("click",e=>{const f=S.fan;if(!f)return;S.fanEat=0;const gb=e.target.closest("[data-fg]"),ib=e.target.closest("[data-fi]");
    if(ib){const v=f.G[f.g].items[+ib.dataset.fi][2];fanClose();goNav(v);return}
    if(gb){f.g=+gb.dataset.fg;f.sel=-1;fanDraw();return}
    if(f.endAt&&Date.now()-f.endAt<350)return;fanClose()});
  try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}}
function fanDraw(){const f=S.fan,el=document.getElementById("fan");if(!f||!el)return;const P=fanPos(f);
  let h=`<div class="fanbg"></div><div class="fanarc" style="left:${f.ox}px;top:${f.oy}px"></div><i class="fanstem" style="left:${f.ox}px;top:${P.G[P.G.length-1][1]}px;height:${f.oy-P.G[P.G.length-1][1]}px"></i>`;
  if(f.g>=0&&P.I.length){const y=P.G[f.g][1];h+=`<i class="fanline" style="left:${f.ox}px;top:${y}px;width:${(P.I[P.I.length-1][0]-f.ox).toFixed(0)}px"></i>`}
  f.G.forEach((g,i)=>{h+=`<button class="fani fang${f.g===i?" on":""}" data-fg="${i}" style="left:${P.G[i][0]}px;top:${P.G[i][1]}px" aria-label="${esc(g.name)}"><span>${g.ic}</span><b>${esc(g.name)}</b></button>`});
  P.I.forEach((p,i)=>{const it=f.G[f.g].items[i];h+=`<button class="fani fanit${f.sel===i?" on":""}" data-fi="${i}" style="left:${p[0].toFixed(0)}px;top:${p[1]}px" aria-label="${esc(it[1])}"><span>${it[0]}</span><b>${esc(it[1])}</b></button>`});
  el.innerHTML=h}
function fanMove(x,y){const f=S.fan;if(!f)return;const dx=x-f.ox,dy=y-f.oy;if(Math.hypot(dx,dy)<36)return;f.moved=true;const P=fanPos(f);
  if(dx<44){let best=-1,bd=1e9;P.G.forEach((p,i)=>{const t=Math.abs(p[1]-y);if(t<bd){bd=t;best=i}});if(best!==f.g||f.sel!==-1){f.g=best;f.sel=-1;fanDraw()}}
  else if(f.g>=0&&P.I.length){let best=-1,bd=1e9;P.I.forEach((p,i)=>{const t=Math.abs(p[0]-x);if(t<bd){bd=t;best=i}});if(best!==f.sel){f.sel=best;fanDraw()}}}
function fanEnd(){const f=S.fan;if(!f)return;S.fanEat=Date.now();if(f.g>=0&&f.sel>=0){const v=f.G[f.g].items[f.sel][2];fanClose();goNav(v);return}f.endAt=Date.now()}
function fanClose(){S.fan=null;S.fanAt=Date.now();const el=document.getElementById("fan");if(el)el.remove()}
{let lp=null;const tabs=document.getElementById("tabs");
 const startBtn=t=>t&&t.closest&&t.closest('#tabs [data-tab="camp"]');
 tabs.addEventListener("touchstart",e=>{const b=startBtn(e.target);if(!b||!S.gest.ring||e.touches.length!==1)return;const r=b.getBoundingClientRect(),p=e.touches[0];lp={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{lp=null;fanOpen(r.left+r.width/2,r.top+r.height/2)},450)}},{passive:true});
 document.addEventListener("touchmove",e=>{if(S.fan){e.preventDefault();const p=e.touches[0];fanMove(p.clientX,p.clientY);return}if(lp){const p=e.touches[0];if(Math.hypot(p.clientX-lp.x,p.clientY-lp.y)>12){clearTimeout(lp.timer);lp=null}}},{passive:false});
 const end=()=>{if(lp){clearTimeout(lp.timer);lp=null}if(S.fan)fanEnd()};document.addEventListener("touchend",end,{passive:true});document.addEventListener("touchcancel",end,{passive:true});
 tabs.addEventListener("contextmenu",e=>{const b=startBtn(e.target);if(!b)return;e.preventDefault();if(S.gest.ring&&!S.fan){const r=b.getBoundingClientRect();fanOpen(r.left+r.width/2,r.top+r.height/2)}});
 tabs.addEventListener("click",e=>{if(S.fanEat&&Date.now()-S.fanEat<600&&startBtn(e.target)){S.fanEat=0;e.stopImmediatePropagation();e.preventDefault()}},true)}
document.getElementById("tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;const t=b.dataset.tab,now=Date.now();
  if(TAP_SEQ[t]){const lt=S.lastTap,n=S.gest.tap&&lt&&lt.t===t&&lt.on===S.tab&&now-lt.at<450?lt.n+1:0;const q=TAP_SEQ[t];if(S.tab!==t||n)S.prev=S.tab;q[n%q.length]();S.lastTap={t,at:now,n,on:S.tab};S.draft=null;render();window.scrollTo(0,0);return}
  if(t==="essen"&&S.tab!=="essen")S.foodTab="heute";S.tab=t;S.draft=null;render();window.scrollTo(0,0)});
