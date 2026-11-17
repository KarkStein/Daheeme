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
function styDefs(st,C,night,ph,city){if(!st)return "";
  const sx=night?52:56,sy=night?53:(ph==="dusk"||ph==="dawn"?(city?98:LOW_SUN)+13:57),lc=night?"#cfdcff":"#ffd98a",vc=night?"#05101c":"#1c2a3a";
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
  let s=`<rect x="0" y="${SEA_Y-1}" width="360" height="4" fill="#fff" opacity="${night?.08:.28}" filter="url(#sSoft1)"/>`;
  if(st==="fein")s+=`<rect x="0" y="${SEA_Y+2}" width="360" height="${258-SEA_Y}" fill="url(#pWave)"/>`;
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
// Florian 16.11.2026 abends: „Grün in einem Block, die Straße weiter weg“: Straße mit Tram ganz hinten und klein, davor ein großes Stück Garten und Park
function cityCols(night,sea){return night?(sea==="winter"?["#3b3a36","#34332f"]:["#1e3a2a","#24432f"]):sea==="spring"?["#7fbf6a","#6aa95c"]:sea==="autumn"?["#d08a3a","#b8642a","#8aa35a"]:sea==="winter"?["#9a9184","#8a8174"]:["#4f8a55","#5f9a5c"]}
function cityTree(x,y,r,i,T,night,sea){return `<path d="M${x} ${y+r+3} V${y+r*.4}" stroke="${night?"#3a2a1e":"#6b4a2e"}" stroke-width="${Math.max(1.4,r/6)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${T[i%T.length]}"${sea==="winter"?' opacity=".8"':""}/><circle cx="${x-r*.35}" cy="${y-r*.3}" r="${r*.55}" fill="${T[(i+1)%T.length]}" opacity=".7"/>`+(sea==="winter"?`<path d="M${x-r*.7} ${y-r*.55} q${r*.7} -${r*.45} ${r*1.4} 0" stroke="#fff" stroke-width="${r>8?2:1.4}" fill="none" stroke-linecap="round"/>`:"")}
function cityBack(C,night,sea,light){const far=night?"#26374a":"#cdd6dd",asph=night?"#34383e":"#9a9fa5",walk=night?"#57544f":"#d3ccbf",win=night?"#ffd66b":"#f6e7b0",T=cityCols(night,sea);
  // ferne Stadt, ganz blass
  let s=`<path d="M0 101 V92 h12 v-4 h10 v5 h14 v-6 h6 v6 h16 v-3 h10 v3 h22 V101Z M120 101 V93 h12 v-4 h8 v4 h20 v-6 h8 v6 h16 V101Z M206 101 V94 h16 v-5 h10 v5 h40 V101Z" fill="${far}"/>`
    +(night?[[16,95],[46,96],[86,97],[136,96],[176,95],[232,97],[262,96]].map(p=>`<rect x="${p[0]}" y="${p[1]}" width="1.8" height="1.8" fill="#ffd66b" opacity=".55"/>`).join(""):"");
  // zwei Kirchtürme mit runden Hauben (Ideen), leuchten mit dem Wochenstand
  const tx=330,ty=101,k=.72,gl=(0.25+0.75*light)*(night?1:.55);
  if(light>0)s+=`<circle cx="${tx}" cy="${ty-34}" r="${9+18*light}" fill="url(#hglow)" opacity="${gl.toFixed(2)}"/>`;
  s+=`<g transform="translate(${tx} ${ty}) scale(${k})"><path d="M-16 0 V-40 h11 V0Z M5 0 V-40 h11 V0Z" fill="${night?"#4a3f3a":"#9a7f6c"}"/><path d="M-5 0 V-22 h10 V0Z" fill="${night?"#3e3532":"#8a705f"}"/>`
    +`<path d="M-17 -40 q6.5 -14 13 0Z M4 -40 q6.5 -14 13 0Z" fill="${night?"#3c5a50":"#6f9a86"}"/><path d="M-10.5 -53 v-4 M10.5 -53 v-4" stroke="${night?"#c9b26a":"#b08d3a"}" stroke-width="1.4"/>`
    +`<rect x="-12.5" y="-33" width="4" height="6" rx="2" fill="${win}" opacity="${night?.9:.6}"/><rect x="8.5" y="-33" width="4" height="6" rx="2" fill="${win}" opacity="${night?.9:.6}"/></g>`;
  // kleine Bäume hinter der Straße
  [[8,94,6],[30,92,7],[54,95,5],[76,93,6],[104,95,5],[150,94,6],[178,92,7],[202,95,5],[300,94,5],[352,93,6]].forEach(([x,y,r],i)=>{s+=cityTree(x,y,r,i,T,night,sea)});
  // Gehweg, Straße, Schienen, Fahrleitung: schmal und weit hinten
  s+=`<rect x="0" y="100" width="360" height="2.4" fill="${walk}"/><rect x="0" y="102.4" width="360" height="6" fill="${asph}"/><path d="M0 105 H360 M0 107 H360" stroke="${night?"#777b80":"#c3c6ca"}" stroke-width=".6"/><path d="M0 91 H360" stroke="#3a3f45" stroke-width=".4" opacity=".6"/>`
    +[40,160,280].map(x=>`<path d="M${x} 102 V89" stroke="#5b6066" stroke-width=".9"/>`).join("");
  // Tram (Ausflüge): blau-weiß, klein in der Ferne
  s+=`<g class="tram" transform="translate(222 89) scale(.6)"><path d="M52 0 l6 -6 l6 6 M58 -6 V-3" stroke="#3a3f45" stroke-width="1.4" fill="none"/>`
    +`<rect x="0" y="0" width="124" height="26" rx="5" fill="#f4f1ea"/><rect x="0" y="15" width="124" height="11" rx="3" fill="#2f6c97"/><rect x="0" y="12" width="124" height="2.2" fill="#2f6c97"/>`
    +[0,1,2,3,4,5].map(i=>`<rect x="${6+i*19.5}" y="3.5" width="14" height="8" rx="1.5" fill="${night?"#ffd66b":"#9fc3dc"}" opacity="${night?.85:1}"/>`).join("")
    +`<rect x="118" y="4" width="5" height="9" rx="1.5" fill="${night?"#ffd66b":"#9fc3dc"}"/><circle cx="121" cy="21" r="1.8" fill="${night?"#fff3c4":"#ffe9a8"}"/>`
    +`<rect x="40" y="15" width="8" height="11" fill="#255a80"/><rect x="80" y="15" width="8" height="11" fill="#255a80"/></g>`;
  return s}
// Flugzeug am Himmel (Urlaube), mit Kondensstreifen; nachts mit Positionslichtern
function cityPlane(night){const c=night?"#9fb0c2":"#f4f1ea",d=night?"#6c7d90":"#c3ccd4";
  return `<g class="plane"><path d="M206 52 H254" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="${night?.15:.55}"/>`
    +`<path d="M254 52 q2 -3.4 8 -3.4 h18 q5 0 7 3.4 q-2 3.4 -7 3.4 h-18 q-6 0 -8 -3.4Z" fill="${c}"/><path d="M266 52 l-6 -10 h4 l9 10Z M266 52 l-6 10 h4 l9 -10Z" fill="${d}"/><path d="M256 51 l-3 -7 h3 l4 6Z" fill="${d}"/>`
    +(night?`<circle class="twinkle" cx="263" cy="42.5" r="1.3" fill="#f25f5c"/><circle class="twinkle" style="animation-delay:.6s" cx="263" cy="61.5" r="1.3" fill="#5fd08a"/>`:`<path d="M282 51 h3" stroke="#6f8aa0" stroke-width="1.2" stroke-linecap="round"/>`)+`</g>`}
// Bank für zwei unter einem Rosenbogen hinten links im Garten (Partner, statt Klippen; Florian 16.11.2026: nicht an den Gleisen)
function cityBench(night,sea){const wd=night?"#8a8478":"#f4f1ea",wd2=night?"#6d685e":"#d8d2c6",lf=night?["#1f3b29","#2a4d36"]:["#477f4c","#5f9a5c"],bl=sea==="summer"?"#e05a6a":sea==="spring"?"#f7c1d6":sea==="autumn"?"#d9792b":null;
  let s=`<ellipse cx="40" cy="150.5" rx="21" ry="3" fill="#000" opacity=".12"/><path d="M24 150 V127 Q40 109 56 127 V150" fill="none" stroke="${wd}" stroke-width="2.4"/>`;
  const P=[[24,143],[24,136],[24.5,129],[28,122],[33,117],[40,115.5],[47,117],[52,122],[55.5,129],[56,136],[56,143]];
  if(sea!=="winter")P.forEach((p,i)=>{s+=`<circle cx="${p[0]+(i%2?1.3:-1.3)}" cy="${p[1]}" r="3.5" fill="${lf[i%2]}"/>`+(bl&&i%2===0&&!night?`<circle cx="${p[0]}" cy="${p[1]-1.2}" r="1.4" fill="${bl}"/>`:"")});
  else s+=`<path d="M25 126 Q40 108 55 126" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  s+=`<rect x="28.5" y="132.5" width="23" height="2.3" rx="1" fill="${wd2}"/><rect x="28.5" y="136.4" width="23" height="2.3" rx="1" fill="${wd2}"/><path d="M29.5 132.5 V142 M50.5 132.5 V142" stroke="${wd2}" stroke-width="1.4"/>`
    +`<rect x="31.5" y="139" width="7.5" height="2.8" rx="1.3" fill="${night?"#9c8550":"#d9a441"}"/><rect x="41" y="139" width="7.5" height="2.8" rx="1.3" fill="${night?"#5f7d68":"#8fbf9a"}"/>`
    +`<rect x="27" y="141.6" width="26" height="3" rx="1" fill="${wd}"/><path d="M29 144.5 V150 M51 144.5 V150" stroke="${wd2}" stroke-width="1.6"/>`;
  return s}
// Viel Grün ums Haus (Florian 16.11.2026 „Viel mehr grün ums Haus!“, dann „Grün in einem Block“): eine Wiese von der fernen Straße bis vorn,
// Baumgruppen (Park), Tanne rechts, Büsche, Blüten je Jahreszeit, Bank unter dem Rosenbogen; Efeu am Haus über cityIvy
function cityLawn(C,night,st,sea){const L="M0 107 Q120 103 240 106 Q300 108 360 105 V260 H0Z",hd=night?["#1f3b29","#264a33"]:["#477f4c","#56935a"],tr=night?"#4a3524":"#7a5230",win=sea==="winter",T=cityCols(night,sea);
  let s=`<path d="${L}" fill="${C.land}"/>`+(st==="fein"?`<path d="${L}" fill="url(#pGrass)"/><path d="${L}" fill="url(#pGrass2)"/>`:"");
  // Baumgruppen im Park zwischen Straße und Garten (rechts mit Lücke für die Tram)
  [[8,112,10],[72,111,12],[92,117,9],[224,116,8],[246,119,10],[270,116,12],[294,120,10],[316,116,12],[342,118,13],[360,113,9]].forEach(([x,y,r],i)=>{s+=cityTree(x,y,r,i+1,T,night,sea)});
  s+=cityBench(night,sea);
  // Büsche am Haus und rechts im Garten
  const bush=(x,y,r,k)=>`<ellipse cx="${x}" cy="${y+r*.8}" rx="${r*1.4}" ry="${r*.25}" fill="#000" opacity=".1"/><circle cx="${x-r*.6}" cy="${y+r*.15}" r="${r*.75}" fill="${hd[k%2]}"/><circle cx="${x+r*.6}" cy="${y+r*.2}" r="${r*.7}" fill="${hd[(k+1)%2]}"/><circle cx="${x}" cy="${y-r*.15}" r="${r}" fill="${hd[(k+1)%2]}"/>`;
  [[80,150,8,0],[216,150,7,1],[228,172,7,0],[264,148,8,1],[292,186,9,1],[306,244,8,0]].forEach(b=>{s+=bush(...b)});
  const bl=sea==="spring"?["#f7c1d6","#fff"]:sea==="summer"?["#f25f5c","#ffd66b"]:sea==="autumn"?["#d9792b","#e0a030"]:null;
  if(bl)[[78,147],[84,152],[226,169],[231,174],[262,145],[268,150],[288,183],[296,188],[304,241]].forEach((p,i)=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="${bl[i%2]}" opacity="${night?.5:1}"/>`});
  if(win)[[80,142],[216,143],[228,165],[264,140],[292,177]].forEach(p=>{s+=`<path d="M${p[0]-6} ${p[1]} q6 -3 12 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>`});
  // Tanne rechts (Garten), im Winter mit Schnee
  {const fx=334,fb=226,fc=night?"#1d3a2a":"#2f6b4c",fc2=night?"#264a35":"#3d7f58";
   s+=`<ellipse cx="${fx}" cy="${fb}" rx="18" ry="2.8" fill="#000" opacity=".13"/><rect x="${fx-2.2}" y="${fb-12}" width="4.4" height="12" fill="${tr}"/>`
    +`<path d="M${fx} ${fb-78} L${fx+13} ${fb-52} H${fx+7} L${fx+20} ${fb-30} H${fx+12} L${fx+25} ${fb-10} H${fx-25} L${fx-12} ${fb-30} H${fx-20} L${fx-7} ${fb-52} H${fx-13}Z" fill="${fc}"/>`
    +`<path d="M${fx} ${fb-78} L${fx-13} ${fb-52} H${fx-7} L${fx-20} ${fb-30} H${fx-12} L${fx-25} ${fb-10} H${fx}Z" fill="${fc2}"/>`
    +(win?`<path d="M${fx-6} ${fb-62} L${fx} ${fb-72} L${fx+6} ${fb-62} M${fx-13} ${fb-52} h7 M${fx+7} ${fb-52} h6 M${fx-20} ${fb-30} h8 M${fx+12} ${fb-30} h8 M${fx-25} ${fb-10} h10 M${fx+15} ${fb-10} h10" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>`:"")
    +(sea==="winter"||night?"":`<circle cx="${fx-6}" cy="${fb-40}" r="1.5" fill="#8a5a34"/><circle cx="${fx+8}" cy="${fb-22}" r="1.5" fill="#8a5a34"/>`)}
  return s}
// Efeu (im Sommer Kletterrose) an der linken Hausecke
function cityIvy(night,sea){if(sea==="winter")return "";const c=night?["#2a4d36","#355d42"]:["#4f8a55","#6aa95c"];let s=`<path d="M103 214 C99 200 106 188 101 176 C98 168 104 162 110 159" stroke="${night?"#3a2a1e":"#6b4a2e"}" stroke-width="1" fill="none"/>`;
  [[101,211],[104,205],[100,199],[104,193],[100,187],[103,181],[100,175],[103,169],[106,164],[110,160],[98,206],[98,192]].forEach((p,i)=>{s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="3.4" ry="2.3" fill="${sea==="autumn"&&i%3===0?"#b3402a":c[i%2]}" transform="rotate(${i%2?28:-28} ${p[0]} ${p[1]})"/>`});
  if(sea==="summer"&&!night)[[102,196],[101,180],[107,163]].forEach(p=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="1.8" fill="#e05a6a"/>`});
  return s}
const CITY_GUESTS={spring:["🐦","🐝","🦋"],summer:["🦋","🐦","🐝"],autumn:["🐿️","🍄","🦔"],winter:["🐦","🐿️","🦉"]};
