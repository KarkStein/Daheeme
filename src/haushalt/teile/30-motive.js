// ---------- Motive und Bildstil (Nachtauftrag 15.11.2026) ----------
// Motiv: "meer" (Haus am Meer, Standard) oder "stadt" (Stadthaus in München, Entwurf).
// Bildstil fürs Haus am Meer: "" (wie bisher), "licht" (Licht und Schatten), "aquarell", "fein" (Texturen und Licht).
// Gilt je Gerät (localStorage hq-motiv, hq-bildstil); Vorschau per ?motiv=… und ?stil=… im Link.
function motivList(){return [["meer","🌊","Haus am Meer"],["stadt","🚋","Stadthaus in München (Entwurf)"]]}
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
// ---------- Motiv Stadt: Münchner Altbau mit Balkon an einer Straße mit Tram (Entwurf) ----------
// Gleiche Bedeutungen wie am Meer, neue Orte: Besen an der Tür (Woche), Schornstein (Essen), Korb mit Baguette am Fahrrad (Einkauf),
// Rucksack an der Hauswand (Kita), Tram (Ausflüge), Litfaßsäule mit Datum (Kalender), Kirchtürme (Ideen, leuchten mit dem Wochenstand),
// Balkon mit zwei Stühlen (Partner), Briefkasten an der Tür, Lampe an der Tür (Am Haus), Straßenbaum (Garten) mit Schaukel (Kind),
// Ball am Gehweg (Spiel), Ghettoblaster auf dem Fensterbrett (Musik), Flugzeug (Urlaube).
function cityScene(light,night,sea,dots,amb){dots=dots||{};amb=amb||{};const ph=amb.ph||(night?"night":"day"),wk=amb.wx||"",st=amb.st!=null?amb.st:bildStil();const grey=/regen|gewitter|schnee|bedeckt|nebel/.test(wk),low=ph==="dusk"||ph==="dawn";
  const C=night?{sky1:"#0e1d30",sky2:"#2a4560",far:"#24384d",fac:"#8a7a5c",fac2:"#7d6460",fac3:"#5f6f6a",trim:"#a9a294",roof:"#5a3328",walk:"#55565a",street:"#2f3236",tow:"#5a463c",dome:"#3c5a50",glass:"#2d3f52"}
    :{sky1:"#b8dcec",sky2:"#f3efe0",far:"#a9bccb",fac:"#ecc987",fac2:"#e6b4a2",fac3:"#b9cfc0",trim:"#f6f1e6",roof:"#a9543c",walk:"#cfc9bd",street:"#686c71",tow:"#a0705a",dome:"#5f9483",glass:"#cfe3ee"};
  if(!night&&sea==="autumn")C.sky2="#f6e3c4";if(!night&&sea==="winter")Object.assign(C,{sky1:"#cbd9e3",sky2:"#eef1f2"});
  if(low&&!night)Object.assign(C,ph==="dusk"?{sky1:"#7d8fb8",sky2:"#f2b48a"}:{sky1:"#a9c4e0",sky2:"#f6d2b0"});
  if(grey&&!night)Object.assign(C,{sky1:wk==="schnee"?"#d5dde3":"#a9b6bf",sky2:wk==="schnee"?"#eef1f3":"#d9dcd8"});if(grey&&night)Object.assign(C,{sky1:"#1b2633",sky2:"#334253"});
  const lit=night||ph==="dusk"?"#ffd66b":C.glass,lw=(i)=>night?(i%3!==1?"#ffd66b":"#3a4a5c"):C.glass;
  let g=`<defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient><radialGradient id="hglow"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>${styDefs(st,C,night,ph)}</defs><rect width="360" height="260" fill="url(#csky)"/>`;
  // Himmel
  if(night){if(!grey)g+=moonSvg(52,53,13,amb.moon!=null?amb.moon:moonPhase(new Date()),"#f3ecd2",C.sky1);[[110,40],[150,62],[196,36],[236,52],[22,90],[88,82],[180,94],[268,40]].forEach((p,i)=>{g+=`<circle class="twinkle" style="animation-delay:${i*0.3}s" cx="${p[0]}" cy="${p[1]}" r="1.5" fill="#fff"/>`})}
  else{if(!grey||wk==="nebel")g+=low?`<circle cx="56" cy="111" r="24" fill="#ffb27a" opacity=".35"/><circle cx="56" cy="111" r="15" fill="#f4895a"/>`:`<circle cx="56" cy="57" r="17" fill="#ffd66b"${wk==="nebel"?' opacity=".45"':""}/>`;
    g+=`<path d="M120 59h44a12 12 0 0 0-22-8 10 10 0 0 0-22 8z" fill="${grey&&wk!=="nebel"?"#c9cfd4":low?"#ffe1cc":"#fff"}" opacity=".85"/>`}
  if(wk==="wolkig"||grey&&wk!=="nebel")g+=`<path d="M30 53h60a16 16 0 0 0-30-10 13 13 0 0 0-30 10z M160 39h70a18 18 0 0 0-34-12 14 14 0 0 0-36 12z" fill="${grey?(night?"#3d4957":"#c9cfd4"):"#fff"}" opacity=".9"/>`;
  // Flugzeug mit Kondensstreifen (Urlaube)
  g+=`<g class="plane"><path d="M178 80 L232 66" stroke="#fff" stroke-opacity="${night?.25:.7}" stroke-width="2.2" stroke-linecap="round"/><g transform="translate(240 64) rotate(-15)"><path d="M-9 0 h17 q3 0 3 1.2 q0 1.2 -3 1.2 h-17z" fill="${night?"#c9d2dc":"#f4f1ea"}"/><path d="M0 0.4 l-5 -6 h2.4 l6 6z M0 2 l-5 6 h2.4 l6 -6z M-8 0.4 l-2.5 -3.5 h1.8 l3 3.5z" fill="${night?"#9aa6b2":"#c7442f"}"/>${night?'<circle cx="-9" cy="1" r="1" fill="#f25f5c"/><circle cx="2" cy="-5.6" r=".9" fill="#7dd87d"/>':""}</g></g>`;
  // Stadt in der Ferne und Kirchtürme (Ideen), leuchten mit dem Wochenstand
  g+=`<path d="M0 150 V124 h18 v-8 h14 v12 h20 v-18 h12 v18 h30 V150Z M236 150 V118 h16 v-10 h14 v14 h18 V150Z" fill="${C.far}"/>`;
  {const tw=(x)=>`<rect x="${x-7}" y="70" width="14" height="80" fill="${C.tow}"/><path d="M${x-7} 70 h14 v-4 h-14z" fill="${C.trim}" opacity=".6"/><rect x="${x-2.2}" y="78" width="4.4" height="8" rx="2.2" fill="${light>0.3||night?"#ffd66b":"#3a2a22"}" opacity="${night?.5+.5*light:.9}"/><path d="M${x-7.5} 66 q-1 -9 7.5 -15 q8.5 6 7.5 15z" fill="${C.dome}"/><path d="M${x} 51 v-7" stroke="${C.dome}" stroke-width="1.4"/><circle cx="${x}" cy="44" r="1.3" fill="#d9b44a"/>`;
   if(light>0)g+=`<circle cx="321" cy="80" r="${12+22*light}" fill="url(#hglow)" opacity="${night?.9:.5}"/>`;g+=tw(310)+tw(332)}
  // Nachbarhäuser
  const win=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" stroke="${C.trim}" stroke-width="1.6"/><path d="M${x+w/2} ${y} v${h} M${x} ${y+h*.42} h${w}" stroke="${C.trim}" stroke-width=".9"/><path d="M${x-2} ${y-3} h${w+4}" stroke="${C.trim}" stroke-width="2"/>`;
  g+=`<path d="M232 92 L240 80 H352 L360 92Z" fill="${C.roof}"/><rect x="230" y="92" width="130" height="122" fill="${C.fac3}"/><path d="M230 96 h130" stroke="${C.trim}" stroke-width="2.4"/>`;
  [[246,104],[278,104],[310,104],[342,104],[246,140],[278,140],[310,140],[342,140]].forEach((p,i)=>{g+=win(p[0],p[1],14,20,lw(i+1))});
  g+=`<path d="M4 96 L10 84 H106 L112 96Z" fill="${C.roof}"/><rect x="0" y="96" width="112" height="118" fill="${C.fac2}"/><path d="M0 100 h112" stroke="${C.trim}" stroke-width="2.4"/>`;
  [[18,108],[50,108],[82,108],[82,142],[82,176]].forEach((p,i)=>{g+=win(p[0],p[1],14,20,lw(i))});
  // Haupthaus: Schornstein (Essen), Mansarddach mit Gauben
  g+=`<rect x="198" y="46" width="12" height="18" fill="${C.trim}"/><rect x="196" y="44" width="16" height="4" fill="${C.tow}"/>`
   +`<g class="smoke" opacity=".75"><circle cx="206" cy="40" r="3.5" fill="#e9ecef"/><circle cx="214" cy="38" r="4.5" fill="#e9ecef" opacity=".8"/><circle cx="224" cy="37" r="5.5" fill="#e9ecef" opacity=".6"/></g>`
   +`<path d="M106 80 L120 56 H220 L234 80Z" fill="${C.roof}"/><path d="M110 74 H230 M114 67 H226 M117 61 H223" stroke="#000" stroke-opacity=".15" stroke-width=".8"/>`
   +[140,184].map((x,i)=>`<path d="M${x-2} 76 V64 l12 -7 l12 7 V76Z" fill="${C.trim}"/><rect x="${x+3}" y="64" width="14" height="12" fill="${night&&i===0?"#ffd66b":C.glass}" stroke="${C.trim}" stroke-width="1"/>`).join("")
   +`<rect x="112" y="80" width="116" height="134" fill="${C.fac}"/><path d="M110 80 h120" stroke="${C.trim}" stroke-width="4"/><path d="M112 113 h116 M112 147 h116" stroke="${C.trim}" stroke-width="1.6"/><rect x="112" y="196" width="116" height="18" fill="#000" opacity=".08"/>`;
  [[124,88],[162,88],[200,88],[124,120],[200,120],[124,154],[162,154],[200,154]].forEach((p,i)=>{g+=win(p[0],p[1],16,20,i===6?lit:lw(i))});
  g+=win(124,180,16,16,lw(2))+win(200,180,16,16,lw(4));
  // Balkon (Partner): Tür, zwei Stühle, Geländer, Blumenkasten
  g+=`<rect x="160" y="116" width="20" height="28" fill="${night?"#ffd66b":C.glass}" stroke="${C.trim}" stroke-width="1.6"/><path d="M170 116 v28" stroke="${C.trim}" stroke-width="1"/>`
   +`<path d="M152 144 v-12 h7 v12 M152 138 h7 M181 144 v-12 h7 v12 M181 138 h7" fill="none" stroke="${night?"#c9b28a":"#7a5230"}" stroke-width="1.6"/>`
   +`<rect x="144" y="143" width="52" height="4" fill="${C.trim}"/><path d="M146 143 V129 H194 V143 ${Array.from({length:11},(_,i)=>`M${150+i*4} 143 V129`).join(" ")}" fill="none" stroke="#2b2b2b" stroke-width=".9"/>`
   +`<rect x="146" y="125" width="48" height="5" rx="1" fill="#8a5a34"/>`+[150,156,162,168,174,180,186,190].map((x,i)=>`<circle cx="${x}" cy="${124-(i%2)}" r="2.6" fill="${night?"#7a6a4a":["#d6453d","#f7a8c4","#ffd66b"][i%3]}"/>`).join("")
   +`<path d="M148 126 q3 -4 6 0 M164 126 q3 -4 6 0 M180 126 q3 -4 6 0" stroke="#3f8550" stroke-width="1.2" fill="none"/>`;
  // Ghettoblaster auf dem Fensterbrett (Musik)
  {const on=!!(S.food&&S.food.music&&Object.keys(S.food.music).length);g+=`<g class="blaster"><g transform="translate(208 170) scale(.5) translate(-178.5 -244)"><path d="M171 233 v-4 q0 -2 2 -2 h12 q2 0 2 2 v4" fill="none" stroke="#2c3138" stroke-width="1.8"/><rect x="166" y="232" width="25" height="12" rx="2" fill="#3a3f47"/><circle cx="172" cy="238.5" r="3.6" fill="#1e2228" stroke="#9aa3ad" stroke-width=".8"/><circle cx="185" cy="238.5" r="3.6" fill="#1e2228" stroke="#9aa3ad" stroke-width=".8"/><rect x="176.5" y="234" width="4" height="2.4" rx=".5" fill="${on?"#ffd66b":"#6b737c"}"/>${on?`<g class="notes" fill="#2c3138"><circle class="n1" cx="194" cy="226" r="1.6"/><circle class="n2" cx="163" cy="224" r="1.5"/></g>`:""}</g></g>`}
  // Tür, Lampe (Am Haus), Briefkasten
  g+=`<path d="M160 214 V188 a10 10 0 0 1 20 0 V214Z" fill="#5a3b25"/><path d="M170 180 V214" stroke="#3f2a1a" stroke-width="1"/><circle cx="174" cy="200" r="1.2" fill="#d9b44a"/><path d="M157 178 a13 13 0 0 1 26 0" fill="none" stroke="${C.trim}" stroke-width="2.4"/>`
   +`${night?'<circle cx="152" cy="180" r="16" fill="url(#hglow)" opacity=".85"/>':""}<path d="M146 176 h6 v3" stroke="#2b2b2b" stroke-width="1.2" fill="none"/><path d="M148.5 179 h7 l-1.2 7 h-4.6z" fill="${night?"#ffd66b":"#f6e7b0"}" stroke="#2b2b2b" stroke-width="1"/><path d="M147.5 179 h9 l-1.5 -2 h-6z" fill="#2b2b2b"/>`
   +`<rect x="186" y="190" width="10" height="9" rx="1.2" fill="#3f6fa8" stroke="#2c4f7a" stroke-width=".6"/><path d="M188 193 h6" stroke="#f4f1ea" stroke-width=".8"/>${dots.post?`<path d="M196 192 h4 v3 h-4z" fill="#f25f5c"/>`:""}`;
  // Gehweg, Bordstein, Straße mit Schienen
  g+=`<rect x="0" y="212" width="360" height="18" fill="${C.walk}"/><path d="${Array.from({length:12},(_,i)=>`M${i*32+8} 212 l-4 18`).join(" ")} M0 221 H360" stroke="#000" stroke-opacity=".08" stroke-width=".8"/><rect x="0" y="230" width="360" height="3" fill="#000" opacity=".2"/><rect x="0" y="233" width="360" height="27" fill="${C.street}"/><path d="M0 243 H360 M0 246 H360 M0 254 H360 M0 257 H360" stroke="${night?"#7d838a":"#a7acb1"}" stroke-width="1"/>`;
  if(sea==="winter")g+=`<path d="M106 80 L110 74 H230 L234 80Z M4 96 L7 90 H109 L112 96Z M232 92 L236 86 H356 L360 92Z" fill="#fff" opacity=".8"/><rect x="0" y="210" width="360" height="3" fill="#fff" opacity=".7"/>`;
  // Straßenbaum (Garten) mit Schaukel (Kind)
  {const tx=64,tb=226,tr=night?"#4a3524":"#7a5230",dk=night?.6:1;let t=`<ellipse cx="${tx}" cy="${tb}" rx="12" ry="2.4" fill="#000" opacity=".15"/><path d="M${tx-3} ${tb} L${tx-2} ${tb-50} H${tx+2} L${tx+3} ${tb}Z" fill="${tr}"/><path d="M${tx-2} ${tb-46} L${tx-26} ${tb-60} M${tx+2} ${tb-48} L${tx+18} ${tb-66} M${tx} ${tb-50} V${tb-74}" stroke="${tr}" stroke-width="3" stroke-linecap="round"/>`;
   const cr=(a,b)=>`<g opacity="${dk}"><circle cx="${tx-20}" cy="${tb-70}" r="15" fill="${b}"/><circle cx="${tx+18}" cy="${tb-72}" r="15" fill="${b}"/><circle cx="${tx}" cy="${tb-84}" r="18" fill="${a}"/><circle cx="${tx-10}" cy="${tb-64}" r="12" fill="${a}"/><circle cx="${tx+10}" cy="${tb-62}" r="11" fill="${a}"/></g>`;
   if(sea==="spring")t+=cr("#8fcf7a","#79b866")+[[-18,-74],[-4,-90],[10,-80],[18,-66],[-10,-62]].map(p=>`<circle cx="${tx+p[0]}" cy="${tb+p[1]}" r="2.4" fill="#f7c1d6"/>`).join("");
   else if(sea==="summer")t+=cr("#4f9a5a","#3f8550");
   else if(sea==="autumn")t+=cr("#e0a030","#c96a2a")+[[-24,4,"#d9792b"],[22,2,"#b3402a"],[34,-2,"#e0a030"]].map(p=>`<ellipse cx="${tx+p[0]}" cy="${tb+p[1]}" rx="3" ry="1.4" fill="${p[2]}"/>`).join("");
   else t+=`<path d="M${tx-26} ${tb-60} l-6 -8 M${tx-14} ${tb-53} l-2 -10 M${tx+18} ${tb-66} l6 -6 M${tx+10} ${tb-57} l2 -9 M${tx} ${tb-74} l-5 -8 M${tx} ${tb-74} l5 -8" stroke="${tr}" stroke-width="1.6" stroke-linecap="round"/><path d="M${tx-30} ${tb-62} l6 -1 M${tx+16} ${tb-68} l6 -1" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
   g+=styRound(st,t)+`<g class="swing"><path d="M40 168 L39 204 M52 167 L52 204" stroke="${night?"#8a7a62":"#b9a78a"}" stroke-width="1.3"/><rect x="36" y="203" width="20" height="3.2" rx="1.4" fill="${night?"#5a3b25":"#8a5a34"}"/></g>`}
  // Litfaßsäule mit heutigem Datum (Kalender)
  {const cd=new Date();g+=`<rect x="236" y="182" width="20" height="44" fill="${night?"#4b5a52":"#6f8f7f"}"/><path d="M234 182 h24 l-2 -4 h-20z M236 178 q10 -9 20 0z" fill="${night?"#3a4741":"#56756a"}"/><rect x="234" y="224" width="24" height="4" fill="${night?"#3a4741":"#56756a"}"/><rect x="238.5" y="190" width="15" height="20" fill="#f4f1ea"/><rect x="238.5" y="190" width="15" height="5" fill="#c7442f"/><text x="246" y="206" font-size="8.5" font-weight="700" text-anchor="middle" fill="#2b2b2b" font-family="system-ui,sans-serif">${cd.getDate()}</text><rect x="237" y="212" width="18" height="10" fill="${night?"#8a7a5c":"#e0a030"}" opacity=".7"/>`}
  // Fahrrad an der Hauswand mit Korb und Baguette (Einkauf), Besen an der Tür (Woche), Rucksack (Kita), Ball (Spiel)
  g+=`<g fill="none" stroke="#2f4f6f" stroke-width="2"><circle cx="118" cy="216" r="9"/><circle cx="146" cy="216" r="9"/><path d="M118 216 L128 203 H141 L146 216 M128 203 L133 216 L141 203 M126 199 h6 M141 203 l2 -5 h5"/></g>`
   +`<path d="M138 192 h15 l-2.6 9 h-10z" fill="#b5854a"/><path d="M140 195.5 h11 M141 198.5 h9" stroke="#8a6334" stroke-width=".9"/><path d="M140 193 L152 184" stroke="#d9a05a" stroke-width="3.8" stroke-linecap="round"/><path d="M143 191 l1.3 -1.7 M146.5 188.6 l1.3 -1.7 M150 186.2 l1.3 -1.7" stroke="#a8702f" stroke-width=".8"/>`
   +`<path d="M188 186 L182 214" stroke="#7a5230" stroke-width="2.4" stroke-linecap="round"/><path d="M179.5 213 L185 214.2 L189 230 L172 230Z" fill="#d9a441"/><path d="M180 214 l-5 15 M182 214.3 l-1.5 15.5 M184 214.6 l2 15" stroke="#a8742a" stroke-width=".7"/>`
   +`<g transform="rotate(-6 214 214)"><path d="M206 216 v-12 q0 -8 8 -8 q8 0 8 8 v12z" fill="#c7442f"/><path d="M206 206 q8 5 16 0 v-3 q-8 -5 -16 0z" fill="#9c3324"/><rect x="209.5" y="208.5" width="9" height="6" rx="2" fill="#9c3324"/><circle cx="214" cy="206.5" r="1.1" fill="#ffd66b"/></g>`
   +`<g transform="translate(96 220)"><circle r="6.5" fill="#f4f1ea"/><path d="M0 -6.5 a6.5 6.5 0 0 1 6.5 6.5 h-6.5z M-6.5 0 a6.5 6.5 0 0 0 6.5 6.5 v-6.5z" fill="#f25f5c"/><path d="M0 -6.5 a6.5 6.5 0 0 0 -6.5 6.5 h6.5z" fill="#3f6fa8"/><path d="M6.5 0 a6.5 6.5 0 0 1 -6.5 6.5 v-6.5z" fill="#ffd66b"/><ellipse cy="7" rx="5.5" ry="1.3" fill="#000" opacity=".12"/></g>`;
  // Tram (Ausflüge)
  g+=`<g class="tram"><path d="M250 190 H360 M268 190 l10 8 l10 -8" stroke="#2b2b2b" stroke-width=".9" fill="none"/><path d="M264 246 V214 q0 -14 14 -16 H362 V246Z" fill="${night?"#2b4f7a":"#2f6db0"}"/><rect x="264" y="230" width="98" height="5" fill="#f4f1ea"/><path d="M266 246 h96" stroke="#1d2a38" stroke-width="3"/>`
   +[272,296,318,340].map((x,i)=>`<rect x="${x}" y="206" width="${i?18:14}" height="16" rx="2" fill="${night?"#ffe7a8":"#dcecf5"}" stroke="#1d3c5f" stroke-width="1"/>`).join("")
   +`<rect x="276" y="200" width="20" height="4" rx="1" fill="#1d2a38"/><path d="M279 202 h14" stroke="#ffb547" stroke-width="1.6"/><circle cx="268" cy="238" r="2" fill="${night?"#fff6c9":"#f4f1ea"}"/>${night?'<circle cx="268" cy="238" r="7" fill="url(#hglow)" opacity=".7"/>':""}</g>`;
  // Wetter
  if(wk==="nebel")g+=`<rect x="0" y="0" width="360" height="260" fill="#eef1f2" opacity=".3"/>`;
  if(wk==="regen"||wk==="gewitter"){let r="";for(let i=0;i<46;i++){const x=(i*97+i*i*13+5)%360,y=(i*61+i*i*29+3)%240+20;r+=`M${x} ${y}l-3 9`}g+=`<path class="rain" d="${r}" stroke="${night?"#9fb3c6":"#6f8aa0"}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>`}
  if(wk==="schnee"){let r="";for(let i=0;i<40;i++){const x=(i*97+i*i*13+11)%360,y=(i*61+i*i*29+7)%230+30;r+=`<circle cx="${x}" cy="${y}" r="${1.2+(i%3)*.5}"/>`}g+=`<g class="snow" fill="#fff" opacity=".9">${r}</g>`}
  g+=styTop(st==="aquarell"?st:st?"licht":"",night);
  if(st==="aquarell"){const k=g.indexOf("</defs>")+7;g=g.slice(0,k)+`<g filter="url(#sAq)">`+g.slice(k)+"</g>"}
  return `<svg viewBox="${HVB.join(" ")}" role="img" aria-label="Euer Haus in der Stadt"${styCss(st)}>${g}</svg>`}
// Antippbare Stellen im Stadtbild (Mitte x, y, Breite, Höhe wie spotPos)
function citySpots(spot){return spot(184,210,22,40,"woche","Woche: Besen an der Tür")+spot(204,42,26,44,"essen","Essen: Schornstein")+spot(146,194,22,22,"einkauf","Einkauf: Korb mit Baguette")+spot(214,208,20,24,"kita","Kita: Rucksack")
  +spot(312,222,96,52,"ausflug","Ausflüge: Tram")+spot(246,204,26,48,"woche","Kalender: Litfaßsäule").replace('data-go="woche"','data-nav="woche|wp:3"')+spot(321,70,40,60,"projekte","Ideen: Kirchtürme")+spot(170,134,56,30,"privat","Partner: Balkon")
  +spot(191,194,14,14,"post","Briefkasten")+spot(152,182,14,16,"amhaus","Am Haus: Lampe")+spot(64,150,64,60,"amhaus","Garten: Baum").replace('data-go="amhaus"','data-go="amhaus" data-pf="garten"')+spot(46,198,22,26,"kind","Kind: Schaukel")
  +spot(96,220,16,16,"spiel","Sport und Spiel")+spot(240,66,34,22,"reisen","Urlaube: Flugzeug")+spot(208,168,20,14,"musik","Musik: Ghettoblaster")}
