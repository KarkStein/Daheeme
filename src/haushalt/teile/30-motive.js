// ---------- Motive und Bildstil (Nachtauftrag 15.11.2026) ----------
// Motiv: "meer" (Haus am Meer, Standard) oder "stadt" (Stadthaus in München, Entwurf).
// Bildstil fürs Haus am Meer: "" (wie bisher), "licht" (Licht und Schatten), "aquarell", "fein" (Texturen und Licht).
// Gilt je Gerät (localStorage hq-motiv, hq-bildstil); Vorschau per ?motiv=… und ?stil=… im Link.
function motivList(){return [["meer","🌊","Haus am Meer"],["stadt","🚋","Haus in der Stadt"]]}
function stilList(){return [["licht","☀️","Licht und Schatten"],["","✏️","Flach (alt)"],["aquarell","🖌️","Aquarell"],["fein","🪨","Fein gezeichnet"]]}
function urlPick(k){try{return new URLSearchParams(location.search).get(k)}catch(_){return null}}
function motiv(){const u=urlPick("motiv");if(u&&motivList().some(m=>m[0]===u))return u;let v="";try{v=localStorage.getItem("hq-motiv")||""}catch(_){}return motivList().some(m=>m[0]===v)?v:"meer"}
// Standard seit 16.11.2026 (Florian): Licht und Schatten; "" = bewusst wie bisher
function bildStil(){const u=urlPick("stil");if(u!=null&&stilList().some(m=>m[0]===u))return u;let v=null;try{v=localStorage.getItem("hq-bildstil")}catch(_){}return v==null?"licht":stilList().some(m=>m[0]===v)?v:"licht"}
function motivPlace(){return motiv()==="stadt"?"in der Stadt":"am Meer"}

// Zusätzliche Definitionen je Stil
function styDefs(st,C,night,ph){if(!st)return "";
  const sx=night?52:56,sy=night?53:(ph==="dusk"||ph==="dawn"?111:57),lc=night?"#cfdcff":"#ffd98a",vc=night?"#05101c":"#1c2a3a";
  let d=`<radialGradient id="sLite" gradientUnits="userSpaceOnUse" cx="${sx}" cy="${sy}" r="${night?200:120}"><stop offset="0" stop-color="${lc}" stop-opacity="${night?.1:.85}"/><stop offset=".5" stop-color="${lc}" stop-opacity="${night?.08:.3}"/><stop offset="1" stop-color="${lc}" stop-opacity="0"/></radialGradient>`
   +`<radialGradient id="sVig" gradientUnits="userSpaceOnUse" cx="180" cy="160" r="240"><stop offset=".55" stop-color="${vc}" stop-opacity="0"/><stop offset="1" stop-color="${vc}" stop-opacity="${night?.45:.2}"/></radialGradient>`
   +`<linearGradient id="sWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="${night?.05:.2}"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`
   +`<linearGradient id="sRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${night?.04:.16}"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>`
   +`<linearGradient id="sHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night?"#9fb3c6":"#fff"}" stop-opacity="0"/><stop offset=".7" stop-color="${night?"#9fb3c6":"#fff"}" stop-opacity="${night?.1:.18}"/><stop offset="1" stop-color="${night?"#9fb3c6":"#fff"}" stop-opacity="0"/></linearGradient>`
   +`<linearGradient id="sGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${night?0:.1}"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`
   +`<filter id="sSoft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="sSoft1" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation=".8"/></filter>`;
  d+=`<radialGradient id="sBall" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity="${night?.06:.3}"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></radialGradient>`
   +`<linearGradient id="sCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fbf7ef"/><stop offset="1" stop-color="#c9d3dc"/></linearGradient>`;
  if(st==="aquarell")d+=`<filter id="sAq" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">`
   +`<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" result="n"/>`
   +`<feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>`
   +`<feColorMatrix in="d" type="saturate" values=".9" result="s"/>`
   +`<feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="11" result="b"/>`
   +`<feColorMatrix in="b" type="matrix" values="0 0 0 .3 .84  0 0 0 .3 .84  0 0 0 .3 .84  0 0 0 0 1" result="bl"/>`
   +`<feBlend in="s" in2="bl" mode="multiply" result="m"/>`
   +`<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="p"/>`
   +`<feColorMatrix in="p" type="matrix" values="0 0 0 .12 .93  0 0 0 .12 .92  0 0 0 .12 .89  0 0 0 0 1" result="pp"/>`
   +`<feBlend in="m" in2="pp" mode="multiply" result="mm"/>`
   +`<feComponentTransfer in="mm"><feFuncR type="linear" slope="1.12" intercept=".02"/><feFuncG type="linear" slope="1.12" intercept=".02"/><feFuncB type="linear" slope="1.1" intercept=".02"/></feComponentTransfer></filter>`
   +`<radialGradient id="sPaper" gradientUnits="userSpaceOnUse" cx="180" cy="148" r="225"><stop offset=".72" stop-color="${night?"#1b2430":"#f6f0e2"}" stop-opacity="0"/><stop offset="1" stop-color="${night?"#1b2430":"#f6f0e2"}" stop-opacity=".85"/></radialGradient>`;
  if(st==="fein"){const dk=night?"#000":"#3b3a36",gr=night?"#16261c":"#3f6b3a";
   d+=`<pattern id="pGran" patternUnits="userSpaceOnUse" width="24" height="12"><rect width="24" height="12" fill="${C.wall}"/>`
    +[[.6,.6,10,5,0],[11.4,.4,7,5.2,1],[19,.8,4.6,4.8,2],[.4,6.6,5,5,1],[6.2,6.4,9,5.2,2],[16,6.6,7.6,5,0]].map(s=>`<rect x="${s[0]}" y="${s[1]}" width="${s[2]}" height="${s[3]}" rx="1.8" fill="${[C.wall,C.stone,"#fff"][s[4]]}" fill-opacity="${s[4]===2?(night?.05:.18):s[4]===1?.55:1}" stroke="${dk}" stroke-opacity=".28" stroke-width=".45"/>`).join("")+`</pattern>`
    +`<pattern id="pSlate" patternUnits="userSpaceOnUse" width="7" height="4.2"><path d="M0 4.2 q3.5 -2.6 7 0 M-3.5 2.1 q3.5 -2.6 7 0 M3.5 2.1 q3.5 -2.6 7 0" fill="none" stroke="#1d242c" stroke-opacity=".55" stroke-width=".5"/></pattern>`
    +`<pattern id="pGrass" patternUnits="userSpaceOnUse" width="11" height="7"><path d="M1 7 l.8 -3 M3.5 6 l-.6 -2.6 M6.5 7 l1.1 -2.6 M9 5.5 l-.4 -2.4" stroke="${gr}" stroke-opacity=".38" stroke-width=".6" stroke-linecap="round"/></pattern>`
    +`<pattern id="pGrass2" patternUnits="userSpaceOnUse" width="17" height="13"><path d="M2 12 l1 -4 M9 8 l-.8 -3.4 M14 12 l1.3 -3.6" stroke="${gr}" stroke-opacity=".3" stroke-width=".7" stroke-linecap="round"/><circle cx="12" cy="4" r=".6" fill="#fff" fill-opacity="${night?0:.35}"/></pattern>`
    +`<pattern id="pSand" patternUnits="userSpaceOnUse" width="6" height="5"><circle cx="1" cy="1" r=".35" fill="#8a7650" fill-opacity=".5"/><circle cx="4" cy="3.4" r=".3" fill="#8a7650" fill-opacity=".45"/><circle cx="2.4" cy="4.2" r=".25" fill="#fff" fill-opacity=".5"/></pattern>`
    +`<pattern id="pWave" patternUnits="userSpaceOnUse" width="26" height="7"><path d="M0 3.5 q3.25 -1.6 6.5 0 t6.5 0" fill="none" stroke="#fff" stroke-opacity="${night?.1:.22}" stroke-width=".6"/><path d="M13 6.5 q2.5 -1 5 0" fill="none" stroke="#fff" stroke-opacity="${night?.08:.18}" stroke-width=".5"/></pattern>`}
  return d}
// Ferne: Dunst über Horizont, Klippen und Landzunge; Glitzern im Meer
function styFar(st,C,night){if(!st||st==="aquarell")return "";
  let s=`<rect x="72" y="117" width="190" height="4" fill="#fff" opacity="${night?.08:.28}" filter="url(#sSoft1)"/>`;
  if(st==="fein")s+=`<rect x="0" y="120" width="360" height="140" fill="url(#pWave)"/>`;
  if(!night)s+=`<path d="M86 124h7M98 127h4M108 123h6M120 129h5M92 132h3M132 125h4" stroke="#fff" stroke-opacity=".75" stroke-width="1.1" stroke-linecap="round"/>`;
  return s}
// Boden: Schatten von Haus und Baum, Rasen- und Sandtextur
function styLand(st,C,night){if(!st||st==="aquarell")return "";
  let s="";
  if(st==="fein")s+=`<path d="M0 146 Q60 134 132 140 Q206 146 244 172 Q286 202 296 260 H0Z" fill="url(#pGrass)"/><path d="M0 146 Q60 134 132 140 Q206 146 244 172 Q286 202 296 260 H0Z" fill="url(#pGrass2)"/><path d="M244 172 Q286 202 296 260 H276 Q270 212 232 184Z" fill="url(#pSand)"/>`;
  s+=`<path d="M0 146 Q60 134 132 140 Q206 146 244 172 Q286 202 296 260 H0Z" fill="url(#sGround)"/>`
   +`<path d="M212 212 L252 226 L246 233 L206 219Z" fill="#14201a" opacity="${night?.18:.24}" filter="url(#sSoft)"/>`
   +`<ellipse cx="156" cy="215" rx="64" ry="4.5" fill="#14201a" opacity=".28" filter="url(#sSoft1)"/>`
   +(night?`<ellipse cx="150" cy="226" rx="70" ry="14" fill="url(#hglow)" opacity=".28"/>`:"")
   +`<ellipse cx="86" cy="240" rx="34" ry="5" fill="#14201a" opacity="${night?.14:.2}" filter="url(#sSoft)"/>`;
  return s}
// Haus: Stein und Schiefer, Licht von links, Schatten unter der Traufe
function styHouse(st,H,C,night){if(!st||st==="aquarell")return H;
  const wallR=`<rect x="100" y="158" width="110" height="56" fill="${C.wall}"/>`,roofP=`<path d="M94 160 L114 118 H196 L216 160Z" fill="${C.roof}"/>`;
  let roofAdd=`<path d="M94 160 L114 118 H196 L216 160Z" fill="url(#sRoof)"/>`,wallAdd="";
  if(st==="fein"){roofAdd=`<path d="M94 160 L114 118 H196 L216 160Z" fill="url(#pSlate)"/>`+roofAdd;wallAdd=`<rect x="100" y="158" width="110" height="56" fill="url(#pGran)" opacity=".92"/>`;
    H=H.replace(/<rect x="\d+" y="\d+" width="\d+" height="\d+" rx="1.5" fill="[^"]+"\/>/g,"")}
  H=H.replace(roofP,roofP+roofAdd).replace(wallR,wallR+wallAdd)
   .replace('<path d="M146 214 V188',`<rect x="100" y="158" width="110" height="56" fill="url(#sWall)"/><rect x="100" y="158" width="110" height="7" fill="#000" opacity=".26" filter="url(#sSoft1)"/><path d="M146 214 V188`);
  return H+`<path d="M120 104h4v20h-4z M194 104h4v20h-4z" fill="#000" opacity=".16"/><path d="M146 214 V188 a9 9 0 0 1 18 0" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.6"/>`
   +[[116,170],[178,170]].map(w=>`<path d="M${w[0]} ${w[1]+18} V${w[1]} H${w[0]+16}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.4"/>`).join("")}
// Ganz oben: Licht der Sonne (oder des Monds) und dunkle Ränder
function styTop(st,night){if(!st)return "";
  if(st==="aquarell")return `<rect x="0" y="0" width="360" height="260" fill="url(#sPaper)"/>`;
  return `<rect x="0" y="0" width="360" height="260" fill="url(#sLite)" style="mix-blend-mode:screen" opacity="${night?1:.55}"/><rect x="0" y="0" width="360" height="260" fill="url(#sVig)"/>`}
// Rundungen: Baumkrone, Sonne, Ball bekommen Licht oben links und Schatten unten rechts
function styRound(st,svg){if(!st)return svg;return svg.replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="(#[0-9a-fA-F]{3,6})"( opacity="[^"]*")?\/>/g,(m,x,y,r,f,o)=>+r>=6.5?m+`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sBall)"${o||""}/>`:m)}
function styCloud(st,g){if(!st)return g;return g.replace(/(<path d="M(?:120 46|30 40)h[^"]*") fill="#fff"/g,'$1 fill="url(#sCloud)"')}
function styCss(st){return st==="licht"||st==="fein"?' style="filter:saturate(1.12) contrast(1.06)"':st==="aquarell"?' style="filter:saturate(1.05)"':""}
// ---------- Motiv „Haus in der Stadt“ (Florian 16.11.2026) ----------
// Dasselbe alleinstehende Haus mit Baum, Garten, Fahrrad, Schaukel, Briefkasten wie am Meer (houseScene mit amb.city).
// Statt Meer: Straße mit Tram (Ausflüge), Flugzeug am Himmel (Urlaube), in der Ferne zwei Kirchtürme (Ideen, leuchten mit dem Wochenstand),
// Café-Tischchen am Gehweg hinten links (Partner, statt Klippen), Gehweg statt Strand. Keine anderen Häuser im Vordergrund.
function cityBack(C,night,sea,light){const far=night?"#26374a":"#cdd6dd",far2=night?"#1f2e3e":"#bcc8d1",asph=night?"#34383e":"#8e9399",walk=night?"#57544f":"#d3ccbf",curb=night?"#6e6a63":"#ece6da",win=night?"#ffd66b":"#f6e7b0";
  let s=`<rect x="0" y="122" width="360" height="138" fill="${asph}"/>`;
  // ferne Stadt, ganz blass, darin zwei Kirchtürme mit runden Hauben (Ideen)
  s+=`<path d="M0 118 V106 h16 v-5 h12 v7 h18 v-9 h8 v9 h22 v-4 h14 v4 h40 V118Z M216 118 V104 h14 v-6 h10 v6 h24 v-8 h12 v8 h18 V118Z" fill="${far}"/>`+(night?[[20,108],[58,110],[92,112],[150,109],[232,108],[270,106],[296,110]].map(p=>`<rect x="${p[0]}" y="${p[1]}" width="2.4" height="2.4" fill="#ffd66b" opacity=".55"/>`).join(""):"");
  const tx=318,ty=116,gl=(0.25+0.75*light)*(night?1:.55);
  if(light>0)s+=`<circle cx="${tx}" cy="${ty-46}" r="${12+24*light}" fill="url(#hglow)" opacity="${gl.toFixed(2)}"/>`;
  s+=`<path d="M${tx-16} ${ty} V${ty-40} h11 V${ty}Z M${tx+5} ${ty} V${ty-40} h11 V${ty}Z" fill="${night?"#4a3f3a":"#9a7f6c"}"/><path d="M${tx-5} ${ty} V${ty-22} h10 V${ty}Z" fill="${night?"#3e3532":"#8a705f"}"/>`
    +`<path d="M${tx-17} ${ty-40} q6.5 -14 13 0Z M${tx+4} ${ty-40} q6.5 -14 13 0Z" fill="${night?"#3c5a50":"#6f9a86"}"/><path d="M${tx-10.5} ${ty-53} v-4 M${tx+10.5} ${ty-53} v-4" stroke="${night?"#c9b26a":"#b08d3a"}" stroke-width="1.2"/>`
    +`<rect x="${tx-12.5}" y="${ty-33}" width="4" height="6" rx="2" fill="${win}" opacity="${night?.9:.6}"/><rect x="${tx+8.5}" y="${ty-33}" width="4" height="6" rx="2" fill="${win}" opacity="${night?.9:.6}"/>`;
  // Gehweg hinten, Bordstein, Schienen, Fahrleitung
  s+=`<rect x="0" y="116" width="360" height="7" fill="${walk}"/><rect x="0" y="122.5" width="360" height="1.6" fill="${curb}"/>`
    +`<path d="M0 135 H360 M0 140 H360" stroke="${night?"#777b80":"#b9bcc0"}" stroke-width="1"/><path d="M0 104 H360" stroke="#3a3f45" stroke-width=".6" opacity=".7"/>`
    +[24,140,256].map(x=>`<path d="M${x} 123 V100" stroke="#5b6066" stroke-width="1.4"/>`).join("");
  // Tram (Ausflüge): blau-weiß, rechts hinter dem Garten
  {const x0=226,y0=112;s+=`<g class="tram"><path d="M${x0+52} ${y0} l6 -6 l6 6 M${x0+58} ${y0-6} V104" stroke="#3a3f45" stroke-width="1" fill="none"/>`
    +`<rect x="${x0}" y="${y0}" width="124" height="26" rx="5" fill="#f4f1ea"/><rect x="${x0}" y="${y0+15}" width="124" height="11" rx="3" fill="#2f6c97"/><rect x="${x0}" y="${y0+12}" width="124" height="2.2" fill="#2f6c97"/>`
    +[0,1,2,3,4,5].map(i=>`<rect x="${x0+6+i*19.5}" y="${y0+3.5}" width="14" height="8" rx="1.5" fill="${night?"#ffd66b":"#9fc3dc"}" opacity="${night?.85:1}"/>`).join("")
    +`<rect x="${x0+118}" y="${y0+4}" width="5" height="9" rx="1.5" fill="${night?"#ffd66b":"#9fc3dc"}"/><circle cx="${x0+121}" cy="${y0+21}" r="1.6" fill="${night?"#fff3c4":"#ffe9a8"}"/>`
    +`<rect x="${x0+40}" y="${y0+15}" width="8" height="11" fill="#255a80"/><rect x="${x0+80}" y="${y0+15}" width="8" height="11" fill="#255a80"/></g>`}
  return s}
// Flugzeug am Himmel (Urlaube), mit Kondensstreifen; nachts mit Positionslichtern
function cityPlane(night){const c=night?"#9fb0c2":"#f4f1ea",d=night?"#6c7d90":"#c3ccd4";
  return `<g class="plane"><path d="M206 52 H254" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="${night?.15:.55}"/>`
    +`<path d="M254 52 q2 -3.4 8 -3.4 h18 q5 0 7 3.4 q-2 3.4 -7 3.4 h-18 q-6 0 -8 -3.4Z" fill="${c}"/><path d="M266 52 l-6 -10 h4 l9 10Z M266 52 l-6 10 h4 l9 -10Z" fill="${d}"/><path d="M256 51 l-3 -7 h3 l4 6Z" fill="${d}"/>`
    +(night?`<circle class="twinkle" cx="263" cy="42.5" r="1.3" fill="#f25f5c"/><circle class="twinkle" style="animation-delay:.6s" cx="263" cy="61.5" r="1.3" fill="#5fd08a"/>`:`<path d="M282 51 h3" stroke="#6f8aa0" stroke-width="1.2" stroke-linecap="round"/>`)+`</g>`}
// Café-Tischchen hinten links am Gehweg (Partner): Sonnenschirm, Tisch, zwei Stühle, zwei Tassen
function cityCafe(night){const w=night?"#2c3138":"#3a3f47",u1=night?"#9c3c34":"#c7442f",u2=night?"#d8d2c6":"#f4f1ea";
  return `<path d="M38 121 V99" stroke="${w}" stroke-width="1.2"/><path d="M22 101 Q38 88 54 101Z" fill="${u1}"/><path d="M30 101 Q38 89 38 89 Q38 89 46 101Z" fill="${u2}"/>`
    +`<path d="M31 112 h14 M38 112 v9 M34 121 h8" stroke="${w}" stroke-width="1.3" stroke-linecap="round"/><path d="M33 110.4 h3 v1.6 h-3z M40 110.4 h3 v1.6 h-3z" fill="${u2}"/>`
    +`<path d="M24 107 v14 M24 113 h5 v8 M52 107 v14 M52 113 h-5 v8" stroke="${w}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`}
// Rasen rechts statt Strand, Hecke zur Straße hin
function cityLawn(C,night,st){const hd=night?"#24432f":"#4f8a55",L="M200 146 Q280 151 360 145 V260 H200Z";
  return `<path d="${L}" fill="${C.land}"/>`+(st==="fein"?`<path d="${L}" fill="url(#pGrass)"/><path d="${L}" fill="url(#pGrass2)"/>`:"")+[244,256,268,280,292,304,316,328,340,352].map((x,i)=>`<circle cx="${x}" cy="${148.5-(i%2)*.8}" r="${6.4+(i%3)*.6}" fill="${hd}"/>`).join("")}
const CITY_GUESTS={spring:["🐦","🐝","🦋"],summer:["🦋","🐦","🐝"],autumn:["🐿️","🍄","🦔"],winter:["🐦","🐿️","🦉"]};
