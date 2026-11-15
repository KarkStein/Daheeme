const HOUSE=[["haus","Haus",0],["leucht","Leuchtturm",0],["hortensia","Hortensien",15],["bench","Gartenbank",25],["boat","Fischerboot",40],["wall","Steinmauer",60],["strandkorb","Strandkorb",80],["flags","Wimpelkette",105],["isles","Inseln",135],["sail","Segelboot",210],["kite","Drachen",260],["seal","Robbe",320]];
const HOUSE_GUESTS={spring:["🦋","🐌","🐚"],summer:["🦀","🐚","🦋"],autumn:["🦀","🍄","🦔"],winter:["🦭","🐚","🦉"]};
// ---------- Himmel: echte Sonnenzeiten, Mondphase, Wetter ----------
function sunTimes(d,lat,lon){const r=Math.PI/180,start=new Date(d.getFullYear(),0,0),n=Math.floor((d-start)/864e5),dec=23.44*Math.sin(2*Math.PI*(284+n)/365)*r,B=2*Math.PI*(n-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  const cosH=(Math.sin(-0.833*r)-Math.sin(lat*r)*Math.sin(dec))/(Math.cos(lat*r)*Math.cos(dec));const H=Math.acos(Math.max(-1,Math.min(1,cosH)))/r;
  const noon=720-4*lon-eot-d.getTimezoneOffset();return {rise:noon-4*H,set:noon+4*H}}
function skyPhase(now){now=now||new Date();const pl=(S.food&&S.food.wxplace)||{};const lat=pl.lat!=null?+pl.lat:51.0,lon=pl.lon!=null?+pl.lon:10.4;const t=sunTimes(now,lat,lon),m=now.getHours()*60+now.getMinutes();
  if(m<t.rise-40||m>t.set+40)return "night";if(m<=t.rise+40)return "dawn";if(m>=t.set-50)return "dusk";return "day"}
// Mondphase 0..1 (0 Neumond, 0.5 Vollmond), Bezug Neumond 6.1.2000 18:14 UTC
function moonPhase(d){const p=((d.getTime()-Date.UTC(2000,0,6,18,14))/864e5)/29.530588853;return p-Math.floor(p)}
function moonSvg(cx,cy,r,p,col,dark){const lit=(1-Math.cos(2*Math.PI*p))/2;let g=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark}" opacity=".55"/>`;if(lit<0.03)return g+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-opacity=".35" stroke-width=".8"/>`;
  if(lit>0.97)return g+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`;const wax=p<0.5,rx=(r*Math.abs(Math.cos(2*Math.PI*p))).toFixed(2),gib=lit>0.5;
  const s1=wax?1:0,s2=wax?(gib?1:0):(gib?0:1);return g+`<path d="M${cx} ${cy-r} A${r} ${r} 0 0 ${s1} ${cx} ${cy+r} A${rx} ${r} 0 0 ${s2} ${cx} ${cy-r}Z" fill="${col}"/>`}
// Open-Meteo Wettercode zu Bild-Wetter
function wxKind(code){if(code==null||code==="")return "";code=+code;if(isNaN(code))return "";if(code>=95)return "gewitter";if(code>=71&&code<=77||code===85||code===86)return "schnee";if(code>=51&&code<=67||code>=80&&code<=82)return "regen";if(code===45||code===48)return "nebel";if(code===3)return "bedeckt";if(code===2)return "wolkig";return ""}
// Ausschnitt des Hausbilds (Florian 15.11.2026: weniger Himmel, Haus und Wiese größer). Spots rechnen damit.
const HVB=[4,32,352,228];
function spotPos(x,y,w,h){const V=HVB;return `left:${((x-V[0])/V[2]*100).toFixed(1)}%;top:${((y-V[1])/V[3]*100).toFixed(1)}%;width:${(w/V[2]*100).toFixed(1)}%;height:${(h/V[3]*100).toFixed(1)}%`}
function houseScene(has,light,night,extras,sea,guests,dots,amb){dots=dots||{};amb=amb||{};const ph=amb.ph||(night?"night":"day"),wk=amb.wx||"";const grey=/regen|gewitter|schnee|bedeckt|nebel/.test(wk);
  const C=night?{sky1:"#0e1d30",sky2:"#2a4560",sea1:"#1d3d5c",sea2:"#16314b",land:"#2d5040",land2:"#254436",sand:"#6f6a55",wall:"#7d7d7c",stone:"#666868",roof:"#283340",head:"#3a4a4a"}
               :{sky1:"#b8dcec",sky2:"#f3efe0",sea1:"#4f8fb8",sea2:"#2f6c97",land:"#8fbf7f",land2:"#7aae6c",sand:"#e8d8ac",wall:"#bdb8ad",stone:"#a39e93",roof:"#4b5866",head:"#8aa38b"};
  Object.assign(C,(night?{winter:{land:"#55675f",land2:"#4a5b53"},autumn:{land:"#4a4f33",land2:"#3d422a"}}
    :{spring:{land:"#9ccf8a",land2:"#86c07a"},autumn:{sky2:"#f6e3c4",land:"#b9b06a",land2:"#a39a57",head:"#9c9a78"},winter:{sky1:"#cbd9e3",sky2:"#eef1f2",land:"#b7c8b5",land2:"#a5b8a3",sea1:"#5d8aa6",sea2:"#406f8e",head:"#9fb0a6"}})[sea]||{});
  if(ph==="dusk"||ph==="dawn")Object.assign(C,ph==="dusk"?{sky1:"#7d8fb8",sky2:"#f2b48a",sea1:"#6f86a8",sea2:"#4b6688"}:{sky1:"#a9c4e0",sky2:"#f6d2b0",sea1:"#6c97b8",sea2:"#4a7898"});
  if(grey&&!night)Object.assign(C,{sky1:wk==="schnee"?"#d5dde3":"#a9b6bf",sky2:wk==="schnee"?"#eef1f3":"#d9dcd8",sea1:"#5f8197",sea2:"#45677d"});
  if(grey&&night)Object.assign(C,{sky1:"#1b2633",sky2:"#334253"});
  const lit=night||ph==="dusk"?"#ffd66b":"#f6e7b0",dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="5.5" fill="#f25f5c" stroke="#fff" stroke-width="2"/>`;
  let g=`<defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient><linearGradient id="hsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea1}"/><stop offset="1" stop-color="${C.sea2}"/></linearGradient><radialGradient id="hglow"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient><linearGradient id="hbeam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff3b0" stop-opacity=".85"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></linearGradient></defs>
  <rect width="360" height="260" fill="url(#hsky)"/><g transform="translate(0 13)">`;
  if(night){if(!grey)g+=moonSvg(52,40,13,amb.moon!=null?amb.moon:moonPhase(new Date()),"#f3ecd2",C.sky1);
    [[110,24],[150,52],[196,18],[236,44],[22,78],[88,70],[180,84],[268,22]].forEach((p,i)=>{g+=`<circle class="twinkle" style="animation-delay:${i*0.3}s" cx="${p[0]}" cy="${p[1]}" r="1.5" fill="#fff"/>`})}
  else{const low=ph==="dusk"||ph==="dawn";if(!grey||wk==="nebel")g+=low?`<circle cx="56" cy="98" r="24" fill="#ffb27a" opacity=".35"/><circle cx="56" cy="98" r="15" fill="#f4895a"/>`:`<circle cx="56" cy="44" r="17" fill="#ffd66b"${wk==="nebel"?' opacity=".45"':""}/>`;
    g+=`<path d="M120 46h44a12 12 0 0 0-22-8 10 10 0 0 0-22 8z M214 30h36a10 10 0 0 0-18-6 8 8 0 0 0-18 6z" fill="${grey&&wk!=="nebel"?"#c9cfd4":low?"#ffe1cc":"#fff"}" opacity=".85"/>`}
  if(wk==="wolkig"||grey&&wk!=="nebel"){const cc=grey?(night?"#3d4957":"#c9cfd4"):"#fff";g+=`<path d="M30 40h60a16 16 0 0 0-30-10 13 13 0 0 0-30 10z M160 26h70a18 18 0 0 0-34-12 14 14 0 0 0-36 12z" fill="${cc}" opacity="${grey?.95:.9}"/>`;
    if(grey)g+=`<path d="M0 22h90a20 20 0 0 0-40-14 16 16 0 0 0-50 14z M250 18h110v-18h-60a20 20 0 0 0-50 18z M90 58h60a14 14 0 0 0-28-9 11 11 0 0 0-32 9z" fill="${night?"#2f3a46":"#b9c0c6"}"/>`}
  if(!night)g+=`<path d="M176 70 q5 -5 10 0 q5 -5 10 0 M222 86 q4 -4 8 0 q4 -4 8 0" fill="none" stroke="#4b5866" stroke-width="1.6" stroke-linecap="round"/>`;
  if(has.kite)g+=`<path d="M246 52 L256 40 L266 52 L256 70Z" fill="#f25f5c"/><path d="M256 40 V70 M246 52 H266" stroke="#fff" stroke-width="1"/><path d="M256 70 Q262 120 248 176" fill="none" stroke="#5b4a3a" stroke-width=".8"/><path d="M256 70 q-4 6 2 10 q-6 4 0 10" fill="none" stroke="#ffd66b" stroke-width="2"/>`;
  g+=`</g><rect x="0" y="118" width="360" height="142" fill="url(#hsea)"/><path d="M180 132h22M262 150h26M206 170h18" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`;
  // Segelboot rechts im Meer: führt zu Urlauben (Florian 15.11.2026, ersetzt die Welle)
  g+=`<g class="hwave"><path d="M300 230 q8 -3 16 0 t16 0 t16 0 t12 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/><path d="M296 219 H350 L342 229 H303Z" fill="${night?"#5a3b25":"#8a5a34"}"/><path d="M296 219 H350" stroke="#f4f1ea" stroke-width="1.6"/><path d="M322 219 V166" stroke="#5b4a3a" stroke-width="1.8" stroke-linecap="round"/><path d="M324.5 169 Q342 190 346 216 H324.5Z" fill="#f4f1ea"/><path d="M319.5 174 Q307 196 301 216 H319.5Z" fill="${night?"#c9c2b3":"#e8dcc4"}"/><path d="M322 166 l9 3 l-9 3z" fill="#d6453d"/><path d="M332 196 q4 2 8 0" stroke="#3f6fa8" stroke-width="1.4" fill="none" opacity=".6"/></g>`;
  // Klippen links hinten: klein, kantig, zur Sonne hin ansteigend (Privat)
  {const rk=night?"#55524c":"#b3a796",rk2=night?"#403d38":"#8f8476",tp=C.head,ink=night?"#2a2a2a":"#5b4a3a";
   g+=`<path d="M4 144 L5 112 L10 106 L16 108 L21 102 L27 105 L33 110 L38 109 L44 116 L50 119 L55 125 L61 128 L66 134 L72 144Z" fill="${rk}"/>`
     +`<path d="M21 102 L25 118 L19 144 L10 144 L14 122Z M38 109 L41 124 L36 144 L30 144 L34 126Z M55 125 L57 134 L54 144 L48 144 L51 133Z" fill="${rk2}" opacity=".7"/>`
     +`<path d="M5 112 L10 106 L16 108 L21 102 L27 105 L33 110 L38 109 L44 116 L50 119 L55 125 L61 128 L61 129.5 L54 126.5 L49 121 L43 118 L37 111 L33 112 L27 107 L21 104.5 L16 110 L10 108 L5 114Z" fill="${tp}"/>`
     +`<path d="M12 104.5 h5 M12.6 104.5 v1.6 M16.4 104.5 v1.6" stroke="${ink}" stroke-width=".9" stroke-linecap="round"/><circle cx="13.6" cy="102.6" r="1" fill="${ink}"/><circle cx="15.6" cy="102.6" r="1" fill="${ink}"/>`}
  g+=`<path d="M262 124 Q292 98 360 102 V126 H262Z" fill="${C.head}"/><path d="M262 124 l10 -6 l8 7 l10 -4 l12 6Z" fill="#7d7f7a"/>`;
  const bx=318,by=106,a=(0.25+0.75*light)*(night?1:.7);
  if(light>0){g+=`<circle cx="${bx}" cy="${by-44}" r="${10+26*light}" fill="url(#hglow)" opacity="${night?1:.7}"/><path class="beam" d="M${bx-4} ${by-46} L${bx-150} ${by-74} L${bx-150} ${by-24}Z" fill="url(#hbeam)" opacity="${a.toFixed(2)}"/>`}
  g+=`<path d="M${bx-8} ${by} L${bx-5.5} ${by-38} H${bx+5.5} L${bx+8} ${by}Z" fill="#f4f1ea"/><path d="M${bx-7.4} ${by-10} H${bx+7.4} L${bx+7} ${by-17} H${bx-7}Z M${bx-6.3} ${by-25} H${bx+6.3} L${bx+6} ${by-31} H${bx-6}Z" fill="#d6453d"/><rect x="${bx-6}" y="${by-41}" width="12" height="3" fill="#2b2b2b"/><rect x="${bx-4}" y="${by-48}" width="8" height="7" fill="${light>0?"#ffe08a":"#cfd8dc"}" stroke="#2b2b2b" stroke-width="1"/><path d="M${bx-5} ${by-48} L${bx} ${by-54} L${bx+5} ${by-48}Z" fill="#d6453d"/>`;
  if(has.isles)g+=`<path d="M206 136 q10 -14 24 -4 q8 -6 14 4Z" fill="#7d7f7a"/><path d="M232 142 q6 -8 14 0Z" fill="#8c8f89"/>`;
  if(has.boat)g+=`<g class="bob"><path d="M268 150 h34 l-6 9 h-24z" fill="#2f5d8a"/><rect x="276" y="140" width="12" height="10" fill="#f4f1ea"/><path d="M294 150 V130" stroke="#5b4a3a" stroke-width="1.6"/><path d="M294 132 l8 4 l-8 3" fill="#f25f5c"/></g>`;
  if(has.sail)g+=`<g class="bob" style="animation-delay:1.2s"><path d="M300 198 h36 l-5 7 h-26z" fill="#f4f1ea"/><path d="M318 198 V164 L336 196Z" fill="#c7442f"/><path d="M316 198 V170 L302 196Z" fill="#f4f1ea"/></g>`;
  g+=`<path d="M0 146 Q60 134 132 140 Q206 146 244 172 Q286 202 296 260 H0Z" fill="${C.land}"/>`;
  g+=`<path d="M244 172 Q286 202 296 260 H276 Q270 212 232 184Z" fill="${C.sand}"/>`;
  g+=`<path d="M0 222 Q120 206 262 230 L270 260 H0Z" fill="${C.land2}"/>`;
  if(sea==="spring")[[20,246,"#f7a8c4"],[86,252,"#fff"],[238,250,"#f7a8c4"],[70,236,"#ffd66b"],[18,206,"#fff"],[60,176,"#ffd66b"],[226,214,"#f7a8c4"]].forEach(p=>{g+=`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${p[2]}"/><circle cx="${p[0]}" cy="${p[1]}" r="1.1" fill="#e0a030"/>`});
  if(sea==="autumn")[[20,246,"#d9792b",20],[86,252,"#b3402a",-30],[238,250,"#e0a030",40],[70,236,"#e0a030",10],[18,204,"#b3402a",-15],[226,214,"#d9792b",60]].forEach(p=>{g+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="4.5" ry="2.2" fill="${p[2]}" transform="rotate(${p[3]} ${p[0]} ${p[1]})"/>`});
  // Baum links neben dem Haus (Garten), zeigt die Jahreszeit
  let treeSvg="";{const st0=g.length,tx=62,tb=238,tr=night?"#4a3524":"#7a5230",dk=night?0.55:1,col=(c)=>c;
   g+=`<ellipse cx="${tx}" cy="${tb}" rx="14" ry="2.4" fill="#000" opacity=".12"/><path d="M${tx-2.5} ${tb} L${tx-1.6} ${tb-24} L${tx-9} ${tb-36} M${tx-1.6} ${tb-24} L${tx+1} ${tb-40} M${tx+1.6} ${tb-20} L${tx+10} ${tb-33} M${tx+2.5} ${tb} L${tx+1.6} ${tb-20}" stroke="${tr}" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M${tx-2.6} ${tb} L${tx-1.6} ${tb-22} H${tx+1.6} L${tx+2.6} ${tb}Z" fill="${tr}"/>`;
   const crown=(c1,c2)=>`<g opacity="${dk}"><circle cx="${tx-9}" cy="${tb-36}" r="10" fill="${c2}"/><circle cx="${tx+9}" cy="${tb-35}" r="10" fill="${c2}"/><circle cx="${tx}" cy="${tb-44}" r="12" fill="${c1}"/><circle cx="${tx-6}" cy="${tb-30}" r="8" fill="${c1}"/><circle cx="${tx+7}" cy="${tb-29}" r="7.5" fill="${c1}"/></g>`;
   if(sea==="spring"){g+=crown("#8fcf7a","#79b866");[[-12,-40],[-4,-50],[6,-46],[12,-36],[-8,-30],[3,-34],[9,-28],[-14,-33],[0,-40]].forEach(p=>{g+=`<circle cx="${tx+p[0]}" cy="${tb+p[1]}" r="2" fill="#f7c1d6"/><circle cx="${tx+p[0]}" cy="${tb+p[1]}" r=".7" fill="#e0a030"/>`})}
   else if(sea==="summer"){g+=crown("#4f9a5a","#3f8550");[[-7,-38],[8,-33],[-1,-46]].forEach(p=>{g+=`<circle cx="${tx+p[0]}" cy="${tb+p[1]}" r="1.8" fill="#d6453d"/>`})}
   else if(sea==="autumn"){g+=crown("#e0a030","#c96a2a");[[-6,-44,"#b3402a"],[9,-38,"#b3402a"],[-11,-32,"#e0a030"]].forEach(p=>{g+=`<circle cx="${tx+p[0]}" cy="${tb+p[1]}" r="3" fill="${p[2]}" opacity="${dk}"/>`});[[-16,-6,"#d9792b",30],[14,-2,"#b3402a",-20],[20,-14,"#e0a030",60]].forEach(p=>{g+=`<ellipse cx="${tx+p[0]}" cy="${tb+p[1]}" rx="2.6" ry="1.3" fill="${p[2]}" transform="rotate(${p[3]} ${tx+p[0]} ${tb+p[1]})"/>`})}
   else g+=`<path d="M${tx-9} ${tb-36} l-5 -6 M${tx-9} ${tb-36} l-1 -8 M${tx+1} ${tb-40} l-4 -8 M${tx+1} ${tb-40} l5 -7 M${tx+10} ${tb-33} l5 -5 M${tx+10} ${tb-33} l0 -7" stroke="${tr}" stroke-width="1.4" stroke-linecap="round"/><path d="M${tx-12} ${tb-37.5} l4 -.8 M${tx-2} ${tb-42} l5 -.6 M${tx+8} ${tb-34.6} l4 -.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;treeSvg=`<g transform="translate(${tx} ${tb}) scale(1.5) translate(${-tx} ${-tb})">`+g.slice(st0)+`</g>`;g=g.slice(0,st0)}
  // Haus
  const H=`<path d="M112 104h12v20h-12z M186 104h12v20h-12z" fill="${C.wall}"/><path d="M110 102h16v4h-16z M184 102h16v4h-16z" fill="${C.stone}"/>`
   +`<path d="M94 160 L114 118 H196 L216 160Z" fill="${C.roof}"/><path d="M114 118 H196" stroke="#2c3540" stroke-width="2"/><path d="M104 140 H206 M99 150 H211 M109 129 H201" stroke="#3a4552" stroke-width=".8" opacity=".7"/>`
   +`<rect x="100" y="158" width="110" height="56" fill="${C.wall}"/>`
   +[[106,166,9,5],[124,163,11,5],[140,167,8,4],[168,164,10,5],[196,166,9,5],[108,196,10,5],[128,204,9,5],[186,200,11,5],[200,190,7,4],[118,180,6,3],[192,176,7,4]].map(s=>`<rect x="${s[0]}" y="${s[1]}" width="${s[2]}" height="${s[3]}" rx="1.5" fill="${C.stone}"/>`).join("")
   +`<path d="M146 214 V188 a9 9 0 0 1 18 0 V214Z" fill="#3f6fa8"/><circle cx="160" cy="202" r="1.4" fill="#ffd66b"/><path d="M147 214 h16" stroke="#7d7f7a" stroke-width="3"/>`
   +[[116,170],[178,170]].map(w=>`<rect x="${w[0]}" y="${w[1]}" width="16" height="18" fill="${night||w[0]===116?lit:"#cfe3ee"}" stroke="#f4f1ea" stroke-width="1.6"/><path d="M${w[0]+8} ${w[1]} v18 M${w[0]} ${w[1]+9} h16" stroke="#f4f1ea" stroke-width="1"/><rect x="${w[0]-8}" y="${w[1]-1}" width="7" height="20" fill="#3f6fa8"/><rect x="${w[0]+17}" y="${w[1]-1}" width="7" height="20" fill="#3f6fa8"/>`).join("")
   +`<g class="smoke" opacity=".75"><circle cx="118" cy="94" r="5" fill="#e9ecef"/><circle cx="112" cy="82" r="6.5" fill="#e9ecef" opacity=".8"/><circle cx="118" cy="68" r="7.5" fill="#e9ecef" opacity=".6"/></g>`;
  g+=H;
  if(sea==="winter")g+=`<path d="M114 118 H196 L200 126 H110Z" fill="#fff" opacity=".7"/>`;
  if(night)g+=`<circle cx="124" cy="179" r="22" fill="url(#hglow)" opacity=".35"/>`;
  if(has.flags){g+=`<path d="M198 112 Q224 156 238 186" fill="none" stroke="#3a2a1a" stroke-width="1.2"/><rect x="236.5" y="184" width="3" height="20" fill="#7a5230"/>`;
    [[206,128,"#f25f5c"],[215,144,"#ffd66b"],[224,158,"#3f6fa8"],[231,172,"#f4f1ea"]].forEach(p=>{g+=`<path d="M${p[0]-5} ${p[1]} h10 l-5 10z" fill="${p[2]}"/>`})}
  if(has.hortensia)[[84,222],[186,219],[226,214]].forEach((p,i)=>{g+=`<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#2f6b4c"/><circle cx="${p[0]-3}" cy="${p[1]-3}" r="5" fill="${i%2?"#8fa8e8":"#6d8fd8"}"/><circle cx="${p[0]+4}" cy="${p[1]-1}" r="4.5" fill="${i%2?"#c9a3e0":"#8fa8e8"}"/>`});
  if(has.bench)g+=`<path d="M58 222 h34 M60 222 v10 M90 222 v10 M58 216 h34" stroke="#7a5230" stroke-width="3.2" stroke-linecap="round"/>`;
  if(has.strandkorb)g+=`<path d="M262 212 h20 v20 h-20z" fill="#f4f1ea"/><path d="M262 212 q10 -14 20 0" fill="#3f6fa8"/><path d="M266 212 v20 M272 212 v20 M278 212 v20" stroke="#3f6fa8" stroke-width="2"/><rect x="264" y="220" width="16" height="9" fill="#d6c7a0"/>`;
  if(has.seal)g+=`<path d="M318 252 q14 -16 30 -6 q4 4 -2 6Z" fill="#7d7f7a"/><ellipse cx="332" cy="242" rx="11" ry="5" fill="#5d5f62"/><circle cx="342" cy="237" r="4" fill="#5d5f62"/><circle cx="344" cy="236" r=".9" fill="#111"/>`;
  if(has.wall){g+=`<path d="M0 244 Q120 236 250 248 V260 H0Z" fill="${C.stone}"/>`;for(let x=6;x<246;x+=16)g+=`<rect x="${x}" y="${246-Math.sin(x/40)*2}" width="12" height="6" rx="2" fill="${C.wall}"/>`}
  // Rucksack (Kita), rechts an die Hauswand gelehnt
  g+=`<g transform="rotate(-8 208 214)"><path d="M199 214 v-14 q0 -9 9 -9 q9 0 9 9 v14z" fill="#c7442f"/><path d="M199 202 q9 6 18 0 v-3 q-9 -6 -18 0z" fill="#9c3324"/><rect x="203" y="205" width="10" height="7" rx="2" fill="#9c3324"/><path d="M205 191 q3 -5 6 0" fill="none" stroke="#5b4a3a" stroke-width="1.6"/><circle cx="208" cy="203" r="1.2" fill="#ffd66b"/></g>`;
  // Besen an der Tür (Woche)
  g+=`<path d="M185 172 L177 208" stroke="#7a5230" stroke-width="2.6" stroke-linecap="round"/><path d="M174.5 207 L180.5 208.3 L186 229 L166 229Z" fill="#d9a441"/><path d="M175 208 l-6 20 M176.5 208.4 l-3 20.4 M178 208.7 l0 20.3 M179.5 209 l3 20 M181 209 l5 19.5" stroke="#a8742a" stroke-width=".8"/><path d="M174.2 210.5 L181.3 212" stroke="#7a3f1c" stroke-width="2.2" stroke-linecap="round"/>`;
  // Lampe über der Tür (Am Haus)
  g+=`${night?'<circle cx="155" cy="172" r="16" fill="url(#hglow)" opacity=".8"/>':""}<path d="M155 162 v3" stroke="#2b2b2b" stroke-width="1.4"/><path d="M150.5 165 h9 l-1.5 9 h-6z" fill="${night?"#ffd66b":"#f6e7b0"}" stroke="#2b2b2b" stroke-width="1.2"/><path d="M149 165 h12 l-2 -2.5 h-8z" fill="#2b2b2b"/>`;
  // Ball (Sport und Spiel), rechts oben am Steinweg beim Strand
  g+=`<g transform="translate(100,2)"><circle cx="140" cy="236" r="8.5" fill="#f4f1ea"/><path d="M140 227.5 a8.5 8.5 0 0 1 8.5 8.5 h-8.5z" fill="#f25f5c"/><path d="M131.5 236 a8.5 8.5 0 0 0 8.5 8.5 v-8.5z" fill="#f25f5c"/><path d="M140 227.5 a8.5 8.5 0 0 0 -8.5 8.5 h8.5z" fill="#3f6fa8"/><path d="M148.5 236 a8.5 8.5 0 0 1 -8.5 8.5 v-8.5z" fill="#ffd66b"/><circle cx="140" cy="236" r="2" fill="#f4f1ea"/><ellipse cx="141" cy="245.5" rx="7" ry="1.6" fill="#000" opacity=".12"/></g>`;
  // Fahrrad (Ausflüge) an den Baum gelehnt, vorn am Lenker der Korb mit Baguette (Einkauf); Baum steht weiter vorn und größer
  // Aushang am Baumstamm (Kalender, Florian 15.11.2026)
  // Schaukel am linken Ast (Wir › Kind, Florian 15.11.2026)
  {const rp=night?"#8a7a62":"#b9a78a",sw=night?"#5a3b25":"#8a5a34";g+=treeSvg+`<g class="swing"><path d="M35 190 L33 213 M46 190 L46 213" stroke="${rp}" stroke-width="1.3" stroke-linecap="round"/><path d="M30 189 Q40 185 52 188" stroke="${night?"#4a3524":"#7a5230"}" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="30" y="212" width="19" height="3.2" rx="1.4" fill="${sw}"/></g>`}
  const cd=new Date();g+=`<g transform="rotate(-4 62 214)"><rect x="54" y="205" width="17" height="19" rx="1" fill="#f4f1ea" stroke="#c9c2b3" stroke-width=".6"/><rect x="54" y="205" width="17" height="5" rx="1" fill="#c7442f"/><circle cx="62.5" cy="205.5" r="1.2" fill="#2b2b2b"/><text x="62.5" y="220.5" font-size="8.5" font-weight="700" text-anchor="middle" fill="#2b2b2b" font-family="system-ui,sans-serif">${cd.getDate()}</text></g>`;
  g+=`<g transform="translate(-9 0) rotate(-7 66 240)"><g fill="none" stroke="#2f4f6f" stroke-width="2.2"><circle cx="78" cy="240" r="10"/><circle cx="110" cy="240" r="10"/><path d="M78 240 L90 226 H104 L110 240 M90 226 L96 240 L104 226 M88 222 h6 M104 226 l2 -6 h5"/></g><g transform="translate(16 2)"><path d="M88 212 h18 l-3 11 h-12z" fill="#b5854a"/><path d="M90 216 h14 M91 220 h12" stroke="#8a6334" stroke-width="1"/><path d="M90 213 L104 203" stroke="#d9a05a" stroke-width="4.2" stroke-linecap="round"/><path d="M93 211 l1.5 -2 M97 208 l1.5 -2 M101 205.5 l1.5 -2" stroke="#a8702f" stroke-width=".9"/></g></g>`;
  [[84,240],[48,250],[112,250]].slice(0,guests|0).forEach((p,i)=>{g+=`<text x="${p[0]}" y="${p[1]}" font-size="20" text-anchor="middle">${HOUSE_GUESTS[sea][i]}</text>`});
  const SPOTS=[[14,252],[110,242],[200,252],[60,226],[40,176],[170,238],[78,180],[226,252]];
  (extras||[]).forEach((e,i)=>{const sp=SPOTS[i%SPOTS.length];g+=`<text x="${sp[0]}" y="${sp[1]}" font-size="20" text-anchor="middle">${esc(e.emoji)}</text>`});
  // Briefkasten ganz vorne am linken Rand, dünner Pfosten; Fähnchen oben, wenn Briefe offen sind
  g+=`<path d="M22.5 257 V243" stroke="#5b4a3a" stroke-width="1.4" stroke-linecap="round"/><path d="M16 243 V236.5 a6.5 4.5 0 0 1 13 0 V243Z" fill="#3f6fa8" stroke="#2c4f7a" stroke-width=".7"/><path d="M18 241 h9" stroke="#f4f1ea" stroke-width=".8" opacity=".8"/>`
    +(dots.post?`<path d="M29 240 V229" stroke="#5b4a3a" stroke-width=".9"/><path d="M29 229 h5 v3.5 h-5z" fill="#f25f5c"/>`:`<path d="M29 240.5 h6" stroke="#f25f5c" stroke-width="1.6" stroke-linecap="round"/>`);
  // Ghettoblaster hinten am Strand (Florian 15.11.2026): führt zu Musik
  {const on=!!(S.food&&S.food.music&&Object.keys(S.food.music).length);g+=`<g class="blaster"><g transform="translate(254 192) scale(.62) translate(-178.5 -238)"><ellipse cx="178.5" cy="245" rx="15" ry="2.4" fill="#000" opacity=".12"/>
    <path d="M171 233 v-4 q0 -2 2 -2 h12 q2 0 2 2 v4" fill="none" stroke="#2c3138" stroke-width="1.8"/><rect x="166" y="232" width="25" height="12" rx="2" fill="${night?"#4a5058":"#3a3f47"}"/><circle cx="172" cy="238.5" r="3.6" fill="#1e2228" stroke="#9aa3ad" stroke-width=".8"/><circle cx="185" cy="238.5" r="3.6" fill="#1e2228" stroke="#9aa3ad" stroke-width=".8"/><rect x="176.5" y="234" width="4" height="2.4" rx=".5" fill="${on?"#ffd66b":"#6b737c"}"/><circle cx="178.5" cy="240.5" r=".9" fill="#c7442f"/>
    ${on?`<g class="notes" fill="${night?"#f3ecd2":"#2c3138"}"><path class="n1" d="M193 226 v-6 l4 -1 v6" stroke="${night?"#f3ecd2":"#2c3138"}" stroke-width=".9"/><circle class="n1" cx="192" cy="226.5" r="1.6"/><circle class="n2" cx="163" cy="224" r="1.5"/><path class="n2" d="M164.4 224 v-6" stroke="${night?"#f3ecd2":"#2c3138"}" stroke-width=".9"/></g>`:""}</g></g>`}
  if(wk==="nebel")g+=`<rect x="0" y="96" width="360" height="70" fill="#eef1f2" opacity=".55"/><rect x="0" y="0" width="360" height="260" fill="#eef1f2" opacity=".18"/>`;
  if(wk==="regen"||wk==="gewitter"){let r="";for(let i=0;i<46;i++){const x=(i*97+i*i*13+5)%360,y=(i*61+i*i*29+3)%240;r+=`M${x} ${y}l-3 9`}g+=`<path class="rain" d="${r}" stroke="${night?"#9fb3c6":"#6f8aa0"}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>`}
  if(wk==="gewitter")g+=`<path class="bolt" d="M232 30 l-10 22 h8 l-8 20 l18 -26 h-8 l8 -16z" fill="#ffe27a"/>`;
  if(wk==="schnee"){let r="";for(let i=0;i<40;i++){const x=(i*97+i*i*13+11)%360,y=(i*61+i*i*29+7)%250;r+=`<circle cx="${x}" cy="${y}" r="${1.2+(i%3)*.5}"/>`}g+=`<g class="snow" fill="#fff" opacity=".9">${r}</g>`}
  return `<svg viewBox="${HVB.join(" ")}" role="img" aria-label="Euer Haus am Meer">${g}</svg>`}
function campTotal(){let n=0;for(const wk in S.weeks){const tk=ticksOf(wk);for(const k in tk)if(tk[k])n++}return n}
const SEASON_NAME={spring:"Frühling",summer:"Sommer",autumn:"Herbst",winter:"Winter"};
function season(){const q=/[?&]saison=(spring|summer|autumn|winter)/.exec(location.search);if(q)return q[1];const m=new Date().getMonth();return m<2||m===11?"winter":m<5?"spring":m<8?"summer":"autumn"}
function campCfg(){const c=(S.config&&S.config.camp)||{};const ex=c.extras?(Array.isArray(c.extras)?c.extras:Object.values(c.extras)):[];return {costs:c.costs||{},extras:ex.filter(Boolean)}}
function campItems(cc){cc=cc||campCfg();return HOUSE.map(c=>({id:c[0],name:c[1],cost:c[2]===0||c[0]==="tent"||c[0]==="pit"?0:cc.costs[c[0]]!=null?(cc.costs[c[0]]|0):c[2]})).concat(cc.extras.map(e=>({id:e.id,name:e.name||e.emoji,cost:e.cost|0,emoji:e.emoji}))).sort((a,b)=>a.cost-b.cost)}
// Start hat drei Seiten (Florian 15.11.2026): Haus, Tag und Woche, Wichtig
function startPager(p){return `<div class="pager" role="group" aria-label="Seiten von Start"><div class="pdots">${[["camp","Haus"],["tag","Tag und Woche"],["wichtig","Wichtig"]].map((x,i)=>`<button class="pdot" data-go="${x[0]}" aria-pressed="${i===p}"><b>${x[1]}</b></button>`).join("")}</div></div>`}
function renderTag(){loadWx();const now=new Date(),today=ymd(now),tmw=ymd(addDays(startOfDay(now),1)),D=backDay(now),mon=mondayOf(now),sun=ymd(addDays(mon,6));
  const DN=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],O=S.tagOpen||(S.tagOpen={}),night=skyPhase()==="night";
  const row=(ic,txt,sub,attr,chk)=>`<div class="trow">${chk?`<button class="tchk" ${chk}><span class="box"></span></button>`:`<span class="tic">${ic}</span>`}<button class="ttx" ${attr||""}><span>${chk?ic+" ":""}${txt}${sub?`<i>${sub}</i>`:""}</span><em>›</em></button></div>`;
  // Dashboard oben (Florian 15.11.2026: wieder da): Wetter, Zeitstrahl, Zähler, Blick auf 3 Tage
  let h=`<h1 class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Tag und Woche</h1>`+renderBack(night,true);
  // Heute zu tun: nur Dinge zum Erledigen; Termine, Kita-Mittag und Abendessen stehen im Zeitstrahl, Monatsaufgaben bei der Woche
  const pr=prios().filter(x=>x.from!=="mittag"),pt=pr.filter(x=>x.due&&x.due<=tmw).sort((a,b)=>(a.due+(a.time||""))<(b.due+(b.time||""))?-1:1);
  const bsplit=rotSplit(),kb=kitaBring();let L="";
  if(now.getMonth()===11&&now.getDate()<=24)advCals().filter(c=>c.year===now.getFullYear()).forEach(c=>{const x=advDoors(c.id)[now.getDate()];L+=row("🎄",advHidden(c,now.getDate())?"Türchen "+now.getDate()+" wartet":x?"Türchen "+now.getDate()+": "+esc(x.name):"Türchen "+now.getDate()+" ist noch leer","",`data-advgo="${esc(c.id)}"`)});
  pt.forEach(x=>{L+=row("🔔",esc(x.name),(x.due<today?"seit "+dLabel(x.due):x.due===today?"heute":"morgen")+(x.time?" "+x.time:""),prioTarget(x).trim(),`data-priodone="${esc(x.id)}" aria-label="${esc(x.name)} erledigt"`)});
  if(kb.length&&D.di<5&&!inUrlaub(now))L+=row("📦","Kita: "+esc(kb.slice(0,3).map(x=>x.name).join(", "))+(kb.length>3?" …":""),"mitbringen",'data-nav="kita|ks:tasche"');
  if(!D.meal&&now.getHours()<20)L+=row("🍲","Noch kein Abendessen","Rezept aussuchen",'data-nav="essen|ft:rezepte" data-mealfor="1"');
  h+=`<section class="card tagcard"><div class="section-head"><h2>Heute zu tun</h2></div>${L||`<div class="freq" style="padding:8px 0">Nichts Dringendes. Neue Erinnerungen über die Glocke.</div>`}</section>`;
  // Diese Woche: nur Zusammenfassungen, aufklappbar
  const fold=(id,ic,t,info,body,attr)=>body?`<section class="card setcard tagfold"><button class="setsum" data-tagsum="${id}" aria-expanded="${!!O[id]}"><h2>${ic} ${t}</h2><span class="freq num" style="margin-left:auto;margin-right:8px">${info}</span><i>${O[id]?"▾":"›"}</i></button>${O[id]?`<div class="setbody">${body}</div>`:""}</section>`:`<section class="card setcard tagfold"><button class="setsum" ${attr}><h2>${ic} ${t}</h2><span class="freq num" style="margin-left:auto;margin-right:8px">${info}</span><i>›</i></button></section>`;
  h+=`<div class="section-head" style="margin-top:6px"><h2>Diese Woche</h2><span class="freq">KW ${isoWeek(mon).w}</span></div>`;
  // Aufgaben
  const tk=ticksOf(wkKey(mon)),per={p0:[0,0],p1:[0,0]};tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner==="ho"||t.owner==="both")return;const o=ownerFor(t,mon,bsplit);if(!per[o])return;const n=slotsOf(t);per[o][1]+=n;for(let i=0;i<n;i++)if(tk[t.id+"__"+i])per[o][0]++});
  const ord=S.me==="p1"?["p1","p0"]:["p0","p1"],btk=tasks().filter(t=>{if(group(t.freq)==="week"||periodTick(t,mon)||!periodDue(t,mon,startOfDay(now)))return false;const o=ownerFor(t,mon,bsplit);return !S.me||o===S.me||o==="both"});
  const btkHtml=btk.length?`<div class="tagcard" style="margin-top:6px"><div class="freq">Fällig in diesem Zeitraum</div>${btk.map(t=>{const o=ownerFor(t,mon,bsplit);return row("🧹",esc(t.name),FREQ_LABEL[t.freq],'data-nav="woche|wp:1"',`data-wtick="${esc(t.id)}" data-who="${o==="both"?S.me||"p0":o}" aria-label="${esc(t.name)} erledigt"`)}).join("")}</div>`:"";
  h+=fold("auf","🧹","Aufgaben",ord.map(o=>esc(pname(o))+" "+per[o][0]+"/"+per[o][1]).join(" · ")+(btk.length?" · "+btk.length+" fällig":""),btkHtml+ord.map(o=>`<div class="freq" style="padding:4px 0">${esc(pname(o))}: ${per[o][0]} von ${per[o][1]} erledigt, ${per[o][1]-per[o][0]} offen</div><div class="bar"><span style="width:${per[o][1]?Math.round(per[o][0]/per[o][1]*100):0}%"></span></div>`).join("")+`<div class="btnrow"><button class="ghost" data-nav="woche|wp:0">Diese Woche ›</button><button class="ghost" data-nav="woche|wp:1">Wer macht was ›</button></div>`);
  // Termine
  const WE=calEvents(today,sun).filter(e=>e.src!=="food"&&e.src!=="prio"&&e.d>tmw);
  h+=fold("ter","📅","Termine",WE.length?WE.length+" weitere":"keine weiteren",WE.length?`<ul class="evlist">${WE.slice(0,12).map(e=>`<li><button class="ev" data-nav="${esc(e.nav||"woche|wp:3")}"><span>${e.icon||"📅"} <b>${esc(e.name)}</b><br><span class="freq">${esc(dLabel(e.d))}${e.t?" "+esc(e.t):""}</span></span></button></li>`).join("")}</ul>`:`<div class="freq">Nach morgen steht diese Woche nichts mehr im Kalender.</div>`);
  // Wochenplan
  const pd=planDays(mon),di=D.di,days=[0,1,2,3,4,5,6].map(i=>({i,m:mealInfo(pd["d"+i])})),pl=days.filter(x=>x.m).length;
  h+=fold("ess","🍲","Wochenplan",pl+" von 7 Abenden",`<ul class="evlist">${days.filter(x=>x.i>=di).map(x=>`<li><button class="ev" data-nav="essen|ft:plan"><span><b>${DAYN[x.i].slice(0,2)}</b> ${x.m?esc(x.m.name):`<span class="freq">noch offen</span>`}</span></button></li>`).join("")}</ul>`);
  // Erinnerungen später
  const PL=pr.filter(x=>x.due&&x.due>tmw&&x.due<=sun);
  h+=fold("eri","🔔","Erinnerungen",PL.length?PL.length+" bis Sonntag":"keine weiteren",PL.length?`<ul class="evlist">${PL.map(x=>`<li><button class="ev"${prioTarget(x)}><span><b>${esc(x.name)}</b><br><span class="freq">${esc(dLabel(x.due))}${x.time?" "+esc(x.time):""}</span></span></button></li>`).join("")}</ul>`:`<div class="freq">Alles Weitere steht unter Wichtig.</div><div class="btnrow"><button class="ghost" data-go="wichtig">Wichtig ›</button></div>`);
  // Einkauf und Wetter
  const sh=shopItems().filter(x=>!x.done).length;
  h+=fold("ein","🧺","Einkaufsliste",sh?sh+" offen":"leer","",'data-go="einkauf"');
  const WD=S.wx&&S.wx.days||{},wl=[];for(let i=0;i<7;i++){const d=addDays(startOfDay(now),i),x=WD[ymd(d)];if(x)wl.push([d,x])}
  if(wl.length)h+=fold("wx","⛅","Wetter",esc(WX_FMT(wl[0][1])),`<ul class="wxdays">${wl.map(([d,x],i)=>`<li><b>${i===0?"Heute":i===1?"Morgen":DN[d.getDay()].slice(0,2)}</b><span>${esc(WX_FMT(x))}</span></li>`).join("")}</ul>`);
  return h}
function renderCamp(){S.flip=false;loadWx();
  const total=campTotal(),mon=mondayOf(new Date()),tk=ticksOf(wkKey(mon));
  let d=0,n=0;tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner!=="rot")return;const m=slotsOf(t);for(let i=0;i<m;i++){n++;if(tk[t.id+"__"+i])d++}});
  const fire=n?d/n:0,skyPh=skyPhase(),night=skyPh==="night";
  const items=campItems(),has={};items.forEach(c=>{has[c.id]=total>=c.cost});has.haus=has.leucht=true;
  const sea=season(),guests=fire>=1?3:fire>=2/3?2:fire>=1/3?1:0,di=(new Date().getDay()+6)%7,split=rotSplit();
  let openW=0;tasks().forEach(t=>{if(group(t.freq)!=="week")return;const o=t.owner==="rot"?ownerFor(t,mon,split):t.owner;if(S.me&&o!==S.me&&o!=="both")return;if(o==="ho")return;
    const chk=i=>{if(o==="both"){const leg=tk[t.id+"__"+i];if(S.me?!(tk[t.id+"__"+i+"_"+S.me]||(leg&&leg.by===S.me)):!leg)openW++}else if(!tk[t.id+"__"+i])openW++};
    if(t.freq==="day")chk(di);else for(let i=0;i<slotsOf(t);i++)chk(i)});
  const openS=shopItems().filter(i=>!i.done).length,meal=planDays(mon)["d"+di],mealTxt=meal?(meal.text||""):"";
  const spot=(x,y,w,hh,go,label,ft)=>`<button class="spot" style="${spotPos(x,y,w,hh)}" data-go="${go}"${ft?` data-ft="${ft}"`:""} aria-label="${label}">${S.labels?`<span class="lab">${label.split(":")[0].replace(" mit dem Bus","").replace("Einkaufsliste","Einkauf")}</span>`:""}</button>`;
  let h=`${startPager(0)}<div><div class="eyebrow">${SEASON_NAME[sea]} am Meer</div><h1>Hallo${S.me?" "+esc(pname(S.me)):""}</h1></div>${S.me?"":meChooser()}
   <div class="flipbox"><div class="flipin${S.flip?" flipped":""}"><div class="camp">${houseScene(has,Math.max(fire,0.12),night,items.filter(c=>c.emoji&&has[c.id]),sea,guests,{woche:false,shop:openS>0,post:briefe().length>0},{ph:skyPh,wx:S.wx&&S.wx.cur!=null&&Date.now()-S.wx.at<3*3600e3?wxKind(S.wx.cur):""})+spot(166,196,50,48,"woche","Woche: offene Aufträge")+spot(119,148,42,96,"essen","Essen",mealTxt?"plan":"")+spot(112,212,26,22,"einkauf","Einkauf: Korb mit Baguette")+spot(208,203,24,30,"kita","Kita")+spot(80,243,40,24,"ausflug","Ausflüge: Fahrrad")+spot(62,214,20,22,"woche","Kalender: Aushang am Baum").replace('data-go="woche"','data-nav="woche|wp:3"')+spot(318,80,34,64,"projekte","Ideen")+spot(38,122,70,42,"privat","Partner: Klippen")+spot(24,244,18,26,"post","Briefkasten")+spot(155,168,22,20,"amhaus","Am Haus: Lampe")+spot(58,176,60,52,"amhaus","Garten: Baum").replace('data-go="amhaus"','data-go="amhaus" data-pf="garten"')+spot(40,203,22,28,"kind","Kind: Schaukel")+spot(240,238,26,26,"spiel","Sport und Spiel")+spot(322,196,56,66,"reisen","Urlaube: Segelboot")+spot(254,189,22,22,"musik","Musik: Ghettoblaster")+(()=>{const y=(night?40:(skyPh==="dusk"||skyPh==="dawn")?98:44)+13,x=night?52:56;return `<button class="spot" style="${spotPos(x,y,46,46)}" data-act="wxpop" aria-expanded="${!!S.wxPop}" aria-label="${night?"Mond":"Sonne"}: Wetter">${S.labels?`<span class="lab">Wetter</span>`:""}</button>`})()+"</div>"+renderBack(night)+"</div>"}</div>
   <div class="freq" style="text-align:center;margin-top:-6px">Tippt ins Bild, auf Sonne oder Mond fürs Wetter. Ein Tipp auf eine freie Stelle zeigt Tag und Woche, lange auf ein Ding drücken zeigt Abkürzungen.</div>
   ${S.wxPop?wxPanel(night):""}
   <section class="card today"><h2>Heute<span class="freq" style="font-weight:400;margin-left:8px">Tipp auf die Karte zeigt den Tag</span></h2>
     <button class="todayrow" data-go="woche"><span>🧹</span><span>${openW?"Offene Aufträge":"Alles erledigt, was gerade ansteht"}</span><i>›</i></button>
     <button class="todayrow" data-go="essen" data-ft="${mealTxt?"heute":"rezepte"}"${!mealTxt?' data-mealfor="1"':""}><span>🍲</span><span>${mealTxt?"Es gibt "+esc(mealTxt):"Für heute ist noch kein Essen geplant"}</span><i>›</i></button>${(m=>m.length?`<button class="todayrow minialarm" data-go="einkauf"><span>🔔</span><span>Für heute noch einkaufen: ${esc(m.slice(0,3).join(", "))}${m.length>3?" und "+(m.length-3)+" mehr":""}</span><i>›</i></button>`:"")(todayMissing(meal))}
     ${prioLinkRow()}</section>`;
  // "Als Nächstes" und "Ausstattung" sind gestrichen (Florian 15.11.2026); Leuchtturm und Gäste im Bild bleiben, weil sie den Wochenstand zeigen
  return h}
