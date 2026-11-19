// Leuchtturm-Wacht: Spielkern ohne Bild (läuft im Browser und in Node für Probeläufe).
// Eigenes Spiel der Haushalts-App Daheeme, nur für die beiden Erwachsenen. Keine Punkte, keine Rangliste.
(function(root){
"use strict";
const W=360,H=540,RINNE=22,WELLEN=8,RINGE=10;

// ---------- Türme: je 3 Stufen ----------
// kosten[0] = bauen, kosten[1..2] = Stufe 2 und 3
const TOWERS={
  leucht:{name:"Leuchtfeuer",kurz:"Trifft den vordersten Gegner. Stark gegen Nebel.",kosten:[80,70,130],reich:[80,90,100],dmg:[8,13,20],takt:[.8,.75,.7],ziele:[1,1,2],
    stufe:["","Stärker, weiter","Strahl trifft zwei"]},
  horn:{name:"Nebelhorn",kurz:"Bremst alles im Kreis. Wenig Schaden.",kosten:[100,80,140],reich:[70,80,92],dmg:[2,3,5],takt:[1.2,1.1,1],brems:[.65,.55,.42],dauer:[1.6,1.8,2.2],
    stufe:["","Bremst stärker","Bremst sehr stark, großer Kreis"]},
  kanone:{name:"Wasserkanone",kurz:"Langsam, trifft mehrere auf einmal. Schwach gegen Nebel, stark gegen Eis.",kosten:[130,110,180],reich:[95,105,116],dmg:[24,38,60],takt:[1.9,1.8,1.6],radius:[26,30,38],
    stufe:["","Stärker, weiter","Große Fontäne"]},
  bojen:{name:"Bojen-Kette",kurz:"Reibt alles auf, was durch den kleinen Kreis fährt. Stark gegen Flöße.",kosten:[110,90,150],reich:[48,54,60],dps:[9,15,23],halt:[0,0,1.1],
    stufe:["","Stärker","Hält den Vordersten kurz fest"]}
};
const TOWER_ORDER=["leucht","horn","kanone","bojen"];
// Ab welchem Level (0 = erstes) ein Turm zu haben ist
const TOWER_AB={leucht:0,horn:0,kanone:1,bojen:2};

// ---------- Gegner ----------
const ENEMIES={
  holz:{name:"Treibholz",hp:34,tempo:25,taler:4},
  nebel:{name:"Nebel",hp:20,tempo:42,taler:3},
  eis:{name:"Treibeis",hp:120,tempo:16,taler:10},
  floss:{name:"Floß",hp:78,tempo:22,taler:7},
  splitter:{name:"Treibholz",hp:20,tempo:28,taler:1}
};
const ENEMY_AB={holz:0,nebel:0,eis:1,floss:2};
// Schaden je Turm und Gegner (fehlt = 1)
const MULT={leucht:{nebel:2,eis:.6},kanone:{nebel:.5,eis:1.5},bojen:{floss:1.6,splitter:1.3},horn:{}};

// ---------- Karten: Wegpunkte der Fahrrinne, von oben zum Hafen unten ----------
const KARTEN=[
  {name:"Stille Bucht",start:200,plaetze:6,p:[[60,-20],[60,40],[250,70],[290,150],[120,200],[70,290],[230,340],[290,420],[190,470],[180,545]]},
  {name:"Sandbank",start:210,plaetze:7,p:[[300,-20],[290,60],[120,60],[60,140],[110,220],[280,230],[300,320],[180,360],[80,420],[170,480],[180,545]]},
  {name:"Zickzack-Riff",start:220,plaetze:7,p:[[180,-20],[180,50],[60,90],[60,170],[300,190],[300,270],[60,300],[60,390],[250,410],[180,545]]},
  {name:"Möwenfelsen",start:230,plaetze:8,p:[[40,-20],[40,120],[140,60],[300,80],[310,220],[180,180],[90,260],[120,380],[280,330],[300,440],[180,545]]},
  {name:"Doppelschleife",start:240,plaetze:8,p:[[320,-20],[310,100],[200,40],[70,60],[50,180],[170,150],[250,230],[120,290],[50,380],[170,440],[290,410],[270,490],[180,545]]},
  {name:"Kurze Passage",start:320,plaetze:8,p:[[180,-20],[170,70],[280,120],[250,220],[100,200],[70,300],[200,330],[290,400],[180,440],[180,545]]},
  {name:"Lange Mole",start:250,plaetze:8,p:[[20,-20],[60,60],[310,50],[320,130],[70,140],[40,220],[300,240],[320,330],[80,330],[50,420],[180,440],[180,545]]},
  {name:"Seehundbank",start:320,plaetze:9,p:[[340,-20],[300,90],[180,30],[60,100],[130,190],[280,170],[310,280],[190,300],[60,260],[40,380],[180,400],[300,450],[180,545]]},
  {name:"Sturmkap",start:400,hp:.9,plaetze:9,p:[[60,-20],[70,110],[260,90],[300,200],[150,230],[60,310],[120,410],[280,380],[180,545]]},
  {name:"Großes Leuchtfeuer",start:280,plaetze:9,p:[[180,-20],[100,40],[40,120],[120,190],[260,110],[320,200],[240,290],[100,270],[50,360],[140,440],[270,400],[300,480],[180,545]]}
];

// Weg glätten (Catmull-Rom) und in kurze Stücke mit Länge zerlegen
function wegAus(P){const pts=[];const g=i=>P[Math.max(0,Math.min(P.length-1,i))];
  for(let i=0;i<P.length-1;i++){const a=g(i-1),b=g(i),c=g(i+1),d=g(i+2);
    for(let s=0;s<24;s++){const t=s/24,t2=t*t,t3=t2*t;
      pts.push([.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)])}}
  pts.push(P[P.length-1].slice());const len=[0];for(let i=1;i<pts.length;i++)len.push(len[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {pts,len,total:len[len.length-1]}}
function posAt(weg,d){const L=weg.len;if(d<=0)return weg.pts[0];if(d>=weg.total)return weg.pts[weg.pts.length-1];let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=d)lo=m;else hi=m}
  const f=(d-L[lo])/((L[hi]-L[lo])||1),a=weg.pts[lo],b=weg.pts[hi];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}
function abstand(weg,x,y){let m=1e9;for(let i=0;i<weg.pts.length;i+=2){const p=weg.pts[i],d=Math.hypot(p[0]-x,p[1]-y);if(d<m)m=d}return m}
// Wie viel Weg liegt im Kreis r um (x,y)? Kurven liefern viel.
function deckung(weg,x,y,r){let n=0;for(let i=1;i<weg.pts.length;i++){const p=weg.pts[i];if(p[1]>0&&p[1]<H&&Math.hypot(p[0]-x,p[1]-y)<=r)n+=weg.len[i]-weg.len[i-1]}return n}
// Uferplätze: frei neben der Rinne, weit genug auseinander, verteilt über die Karte (gute Kurvenplätze zuerst)
function plaetzeAus(weg,n){const C=[];for(let y=36;y<H-70;y+=12)for(let x=30;x<=W-30;x+=12){const a=abstand(weg,x,y);if(a>=RINNE+16&&a<=RINNE+34)C.push({x,y,d:deckung(weg,x,y,80)})}
  C.sort((a,b)=>b.d-a.d);const S=[];
  // erst je Kartendrittel den besten, dann auffüllen
  for(let z=0;z<3;z++){const c=C.find(c=>c.y>=z*H/3&&c.y<(z+1)*H/3&&S.every(s=>Math.hypot(s.x-c.x,s.y-c.y)>=62));if(c)S.push(c)}
  for(const c of C){if(S.length>=n)break;if(S.every(s=>Math.hypot(s.x-c.x,s.y-c.y)>=62))S.push(c)}
  return S.sort((a,b)=>a.y-b.y).map((s,i)=>({id:i,x:s.x,y:s.y,d:Math.round(s.d)}))}
const LEVELS=KARTEN.map((k,i)=>{const weg=wegAus(k.p);return {i,name:k.name,start:k.start,weg,plaetze:plaetzeAus(weg,k.plaetze)}});

// ---------- Wellen ----------
// Muster je Welle: [Art, Anzahl, Abstand in Sekunden, Start in Sekunden]
const MUSTER=[
  [["holz",9,2.6,0]],
  [["holz",13,2.1,0]],
  [["nebel",11,1.5,0],["holz",7,2.6,7]],
  [["holz",12,2,0],["eis",3,7,6]],
  [["floss",5,4,0],["nebel",11,1.4,9]],
  [["eis",6,5,0],["holz",16,1.7,3]],
  [["nebel",20,1.05,0],["floss",8,3.3,5]],
  [["eis",8,4.2,0],["floss",9,3.4,4],["holz",18,1.6,8],["nebel",15,1,30]]
];
const ERSATZ={eis:["holz",2.4],floss:["holz",1.8]};
function hpMal(level,welle){return (1+welle*(.2+.03*level))*(1+.05*level)*(KARTEN[level].hp||1)}
function welleAus(level,welle){const Q=[];MUSTER[welle].forEach(g=>{let [art,n,gap,t0]=g;if(ENEMY_AB[art]>level){const e=ERSATZ[art];n=Math.round(n*e[1]);gap=gap/e[1];art=e[0]}
    n=Math.round(n*1.3*(1+.06*level));for(let i=0;i<n;i++)Q.push({t:t0+i*gap,art})});
  return Q.sort((a,b)=>a.t-b.t)}

// ---------- Spiel ----------
function neu(level,stand){const L=LEVELS[level],G={level,weg:L.weg,plaetze:L.plaetze,taler:L.start,ringe:RINGE,welle:0,phase:"pause",tuerme:[],gegner:[],schuesse:[],effekte:[],queue:[],t:0,ereignis:[]};
  if(stand&&stand.level===level){G.taler=stand.taler;G.ringe=stand.ringe;G.welle=stand.welle;(stand.tuerme||[]).forEach(t=>{const p=G.plaetze[t.platz];if(p&&TOWERS[t.art])G.tuerme.push(turm(p,t.art,t.stufe,t.bezahlt))})}
  return G}
function turm(p,art,stufe,bezahlt){return {platz:p.id,x:p.x,y:p.y,art,stufe:stufe||0,cd:.3,tick:0,halt:2,winkel:0,bezahlt:bezahlt||TOWERS[art].kosten[0]}}
function stand(G){return {level:G.level,taler:G.taler,ringe:G.ringe,welle:G.welle,tuerme:G.tuerme.map(t=>({platz:t.platz,art:t.art,stufe:t.stufe,bezahlt:t.bezahlt}))}}
const turmAuf=(G,platz)=>G.tuerme.find(t=>t.platz===platz)||null;
const verfuegbar=level=>TOWER_ORDER.filter(a=>TOWER_AB[a]<=level);
function bauen(G,platz,art){const T=TOWERS[art],p=G.plaetze[platz];if(!T||!p||turmAuf(G,platz)||TOWER_AB[art]>G.level||G.taler<T.kosten[0])return false;G.taler-=T.kosten[0];G.tuerme.push(turm(p,art,0));return true}
function ausbauen(G,platz){const t=turmAuf(G,platz);if(!t||t.stufe>=2)return false;const k=TOWERS[t.art].kosten[t.stufe+1];if(G.taler<k)return false;G.taler-=k;t.stufe++;t.bezahlt+=k;return true}
function abbauen(G,platz){const t=turmAuf(G,platz);if(!t)return 0;const z=Math.round(t.bezahlt*.6);G.taler+=z;G.tuerme=G.tuerme.filter(x=>x!==t);return z}
function los(G){if(G.phase!=="pause"||G.welle>=WELLEN)return false;G.queue=welleAus(G.level,G.welle);G.tw=0;G.phase="lauf";return true}
function gegnerNeu(G,art,d,hpF){const E=ENEMIES[art],hp=E.hp*hpMal(G.level,G.welle)*(hpF||1),p=posAt(G.weg,d);return {art,d,hp,max:hp,slowBis:0,slowF:1,haltBis:0,x:p[0],y:p[1],id:(G.nr=(G.nr||0)+1)}}
function treffen(G,e,dmg,von){if(e.hp<=0)return;e.hp-=dmg*((MULT[von]||{})[e.art]||1);if(e.hp<=0){G.taler+=ENEMIES[e.art].taler;G.ereignis.push({k:"weg",x:e.x,y:e.y,art:e.art});
    if(e.art==="floss")[-7,7].forEach(o=>G.gegner.push(gegnerNeu(G,"splitter",Math.max(0,e.d+o))))}}
const imKreis=(t,e,r)=>Math.hypot(e.x-t.x,e.y-t.y)<=r;
function schritt(G,dt){if(G.phase!=="lauf")return;G.t+=dt;G.tw+=dt;
  while(G.queue.length&&G.queue[0].t<=G.tw){const q=G.queue.shift();G.gegner.push(gegnerNeu(G,q.art,0))}
  // Gegner fahren
  for(const e of G.gegner){if(e.hp<=0)continue;let v=ENEMIES[e.art].tempo;if(G.t<e.haltBis)v=0;else if(G.t<e.slowBis)v*=e.slowF;e.d+=v*dt;const p=posAt(G.weg,e.d);e.x=p[0];e.y=p[1];
    if(e.d>=G.weg.total){e.hp=0;e.durch=true;G.ringe--;G.ereignis.push({k:"hafen",art:e.art})}}
  // Türme
  for(const t of G.tuerme){const T=TOWERS[t.art],r=T.reich[t.stufe],Z=G.gegner.filter(e=>e.hp>0&&e.y>-6&&imKreis(t,e,r)).sort((a,b)=>b.d-a.d);
    if(t.art==="bojen"){t.tick+=dt;t.halt-=dt;if(t.tick>=.25){t.tick-=.25;Z.forEach(e=>treffen(G,e,T.dps[t.stufe]*.25,"bojen"))}
      if(T.halt[t.stufe]&&t.halt<=0&&Z.length){Z[0].haltBis=G.t+T.halt[t.stufe];t.halt=4.5;G.effekte.push({k:"halt",x:Z[0].x,y:Z[0].y,t:.5})}continue}
    t.cd-=dt;if(Z.length)t.winkel=Math.atan2(Z[0].y-t.y,Z[0].x-t.x);if(t.cd>0||!Z.length)continue;t.cd=T.takt[t.stufe];
    if(t.art==="leucht"){Z.slice(0,T.ziele[t.stufe]).forEach(e=>{treffen(G,e,T.dmg[t.stufe],"leucht");G.effekte.push({k:"strahl",x1:t.x,y1:t.y-14,x2:e.x,y2:e.y,t:.16})})}
    else if(t.art==="horn"){Z.forEach(e=>{const f=T.brems[t.stufe],ff=e.art==="eis"?1-(1-f)*.5:f;e.slowF=ff;e.slowBis=G.t+T.dauer[t.stufe];treffen(G,e,T.dmg[t.stufe],"horn")});G.effekte.push({k:"ring",x:t.x,y:t.y,r,t:.5})}
    else if(t.art==="kanone"){const e=Z[0],vor=posAt(G.weg,e.d+ENEMIES[e.art].tempo*(G.t<e.slowBis?e.slowF:1)*.45);G.schuesse.push({x:t.x,y:t.y-8,zx:vor[0],zy:vor[1],dmg:T.dmg[t.stufe],rad:T.radius[t.stufe]})}}
  // Wasser-Schüsse fliegen
  for(const s of G.schuesse){const dx=s.zx-s.x,dy=s.zy-s.y,l=Math.hypot(dx,dy),w=210*dt;if(l<=w){s.da=true;G.gegner.forEach(e=>{if(e.hp>0&&Math.hypot(e.x-s.zx,e.y-s.zy)<=s.rad)treffen(G,e,s.dmg,"kanone")});G.effekte.push({k:"platsch",x:s.zx,y:s.zy,r:s.rad,t:.35})}else{s.x+=dx/l*w;s.y+=dy/l*w}}
  G.schuesse=G.schuesse.filter(s=>!s.da);G.gegner=G.gegner.filter(e=>e.hp>0);
  for(const f of G.effekte)f.t-=dt;G.effekte=G.effekte.filter(f=>f.t>0);
  if(G.ringe<=0){G.ringe=0;G.phase="verloren";G.gegner=[];G.schuesse=[];return}
  if(!G.queue.length&&!G.gegner.length){G.taler+=20+4*G.welle;G.welle++;G.schuesse=[];G.phase=G.welle>=WELLEN?"gewonnen":"pause"}}

const LW={W,H,RINNE,WELLEN,RINGE,TOWERS,TOWER_ORDER,TOWER_AB,ENEMIES,ENEMY_AB,LEVELS,MUSTER,posAt,welleAus,hpMal,neu,stand,bauen,ausbauen,abbauen,los,schritt,turmAuf,verfuegbar};
root.LW=LW;if(typeof module!=="undefined"&&module.exports)module.exports=LW;
})(typeof window!=="undefined"?window:globalThis);
