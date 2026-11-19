// Probeläufe ohne Bild: ein einfacher Bot spielt jedes Level. Aufruf: node spiel/pruefen/probelauf.js
const LW=require('../kern.js');
// Bot: baut auf den Platz mit der meisten Deckung, wechselt die Türme ab, baut aus, wenn kein Platz mehr frei ist. stil "klug" mischt sinnvoll, "naiv" nur Leuchtfeuer.
function bot(G,stil){const frei=()=>G.plaetze.filter(p=>!LW.turmAuf(G,p.id)).sort((a,b)=>b.d-a.d),arten=LW.verfuegbar(G.level);
  const plan=stil==="naiv"?["leucht"]:["leucht","kanone","leucht","horn","bojen","kanone","leucht","kanone","horn"].filter(a=>arten.includes(a));
  for(let n=0;n<30;n++){const F=frei(),art=plan[G.tuerme.length%plan.length];
    if(F.length&&G.taler>=LW.TOWERS[art].kosten[0]){LW.bauen(G,F[0].id,art);continue}
    // sonst ausbauen, wenn es deutlich billiger ist als zu sparen (oder kein Platz mehr frei)
    const U=G.tuerme.filter(t=>t.stufe<2&&t.art!=="horn"&&G.taler>=LW.TOWERS[t.art].kosten[t.stufe+1]).sort((a,b)=>G.plaetze[b.platz].d-G.plaetze[a.platz].d);
    if(U.length&&(!F.length||stil==="naiv"||G.tuerme.length>=4)){LW.ausbauen(G,U[0].platz);continue}
    if(!F.length){const H=G.tuerme.filter(t=>t.stufe<2&&G.taler>=LW.TOWERS[t.art].kosten[t.stufe+1]);if(H.length){LW.ausbauen(G,H[0].platz);continue}}break}}
// Vorausschauender Bot: probiert jede bezahlbare Aktion, spielt die nächste Welle im Kopf durch und nimmt die beste. Steht für jemanden, der überlegt spielt.
function probe(G){const K=LW.neu(G.level,LW.stand(G));LW.los(K);let weit=0,n=0;while(K.phase==="lauf"&&n++<40000){LW.schritt(K,.1);for(const e of K.gegner)if(e.d>weit)weit=e.d}return (K.phase==="verloren"?-1:K.ringe)*1e6-weit}
function vorausBot(G){for(let n=0;n<12;n++){const A=[];const frei=G.plaetze.filter(p=>!LW.turmAuf(G,p.id)).sort((a,b)=>b.d-a.d).slice(0,4);
    for(const art of LW.verfuegbar(G.level))if(G.taler>=LW.TOWERS[art].kosten[0])for(const p of frei)A.push(["b",p.id,art]);
    for(const t of G.tuerme)if(t.stufe<2&&G.taler>=LW.TOWERS[t.art].kosten[t.stufe+1])A.push(["u",t.platz]);
    if(!A.length)return;let best=null,bs=-Infinity;const st=LW.stand(G);
    for(const a of A){const K=LW.neu(G.level,st);if(a[0]==="b")LW.bauen(K,a[1],a[2]);else LW.ausbauen(K,a[1]);const sc=probe(K);if(sc>bs){bs=sc;best=a}}
    if(best[0]==="b")LW.bauen(G,best[1],best[2]);else LW.ausbauen(G,best[1])}}
function spiel(level,stil){const G=LW.neu(level);let sek=0;const arten={};
  while(G.phase!=="gewonnen"&&G.phase!=="verloren"){if(G.phase==="pause"){stil==="voraus"?vorausBot(G):bot(G,stil);LW.los(G)}LW.schritt(G,.05);sek+=.05;if(sek>3600)break}
  G.tuerme.forEach(t=>arten[t.art]=(arten[t.art]||0)+1);
  return {level:level+1,stil,phase:G.phase,ringe:G.ringe,welle:G.welle,min:+(sek/60).toFixed(1),taler:G.taler,tuerme:G.tuerme.length,arten,weg:Math.round(G.weg.total),plaetze:G.plaetze.length}}
if(require.main===module){for(let l=0;l<LW.LEVELS.length;l++){const a=spiel(l,"voraus"),k=spiel(l,"klug"),b=spiel(l,"naiv");
  console.log(`L${a.level} ${LW.LEVELS[l].name.padEnd(18)} Weg ${a.weg} | voraus: ${a.phase} Ringe ${a.ringe} W${a.welle} ${a.min} min ${JSON.stringify(a.arten)} Rest ${a.taler} | klug: ${k.phase} R${k.ringe} W${k.welle} | naiv: ${b.phase} R${b.ringe} W${b.welle}`)}}
module.exports={spiel};
