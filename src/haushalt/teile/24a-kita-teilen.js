// ---------- Kita-Briefe teilen (Florian 19.11.2026: „ja, machen. aber falls das nicht immer geht, das manuelle einsetzen grundsätzlich weiter ermöglichen“) ----------
// Aus Kigaroo, Mail oder WhatsApp: Teilen › Daheeme › „Wohin damit?“ › 🎒 Kita-Termine. Text und .ics erkennt die App direkt, PDFs liest sie selbst (pdf.js, erst bei Bedarf geladen),
// Fotos und eingescannte PDFs gehen über „Als Prompt kopieren“ an Gemini oder ChatGPT; die Antwort kommt ins Feld von „📋 Termine einfügen“. Das Einfügen per Hand bleibt immer.
const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const KITA_SHARE_RX=/\b(kita|kinderkrippe|krippe|kindergarten|elternbrief|elternabend|kigaroo|schließtag|laternen|sommerfest)/i;
function pdfLib(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return new Promise((ok,no)=>{const s=document.createElement("script");s.src=PDFJS+"pdf.min.js";s.onload=()=>{const L=window.pdfjsLib;if(!L)return no(new Error("pdf"));L.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js";ok(L)};s.onerror=()=>no(new Error("pdf"));document.head.appendChild(s)})}
// Text einer PDF, Zeile für Zeile (Wörter auf gleicher Höhe ergeben eine Zeile)
async function pdfText(blob){const L=await pdfLib(),doc=await L.getDocument({data:new Uint8Array(await blob.arrayBuffer())}).promise,out=[];
  for(let p=1;p<=Math.min(doc.numPages,20);p++){const tc=await (await doc.getPage(p)).getTextContent(),rows=[];
    tc.items.forEach(it=>{if(!it.str||!it.str.trim())return;const y=it.transform[5],x=it.transform[4];let r=rows.find(r=>Math.abs(r.y-y)<3);if(!r){r={y,w:[]};rows.push(r)}r.w.push([x,it.str])});
    rows.sort((a,b)=>b.y-a.y).forEach(r=>out.push(r.w.sort((a,b)=>a[0]-b[0]).map(w=>w[1]).join(" ").replace(/\s+/g," ").trim()))}
  return out.join("\n")}
const kimpIsImg=f=>/^image\//.test(f.type||"")||/\.(jpe?g|png|heic|webp)$/i.test(f.name||"");
const kimpIsPdf=f=>/pdf/.test(f.type||"")||/\.pdf$/i.test(f.name||"");
// Dateien lesen: Text und .ics direkt, PDF über pdf.js; was sich nicht lesen lässt (Fotos, Scans), kommt in ext
async function kimpRead(files){let text="";const ext=[];
  for(const f of files||[]){try{
    if(kimpIsImg(f)){ext.push(f);continue}
    if(kimpIsPdf(f)){toast("📄 Lese die PDF …");const t=await pdfText(f);if(t.replace(/\s/g,"").length>20)text+="\n"+t;else ext.push(f);continue}
    text+="\n"+await f.text()}catch(_){ext.push(f)}}
  return {text,ext}}
function kimpMark(L){const have=new Set(kitas().concat(kitaTer()).map(x=>(x.name||"").trim().toLowerCase()+"|"+x.date));return L.map(x=>{const dup=have.has(x.name.trim().toLowerCase()+"|"+x.date);return Object.assign(x,{dup,on:!dup})})}
// Geteiltes (Text und Dateien) auf der Seite Kita als Vorschau mit Haken öffnen
async function kitaShareIn(text,files){goNav("kita|");const R=await kimpRead(files),all=[String(text||"").trim(),R.text.trim()].filter(Boolean).join("\n"),L=parseKitaTermine(all);
  S.kitaImp={text:all,list:L.length?kimpMark(L):null,ext:R.ext.length?R.ext:null};render();window.scrollTo(0,0);
  if(!L.length)toast(R.ext.length?"Das ist ein Foto oder Scan: Prompt kopieren und an Gemini geben.":"Keine Termine mit Datum erkannt. Der Text steht im Feld.")}
const KIMP_PROMPT=()=>["Lies bitte alle Termine aus diesem Kita-Brief (Bild oder PDF).","Gib nur eine Liste zurück, je Zeile genau ein Termin in der Form:","TT.MM.JJJJ Titel, HH:MM Uhr","Bei mehreren Tagen: TT.MM.–TT.MM.JJJJ Titel.","Lass die Uhrzeit weg, wenn keine angegeben ist. Keine weiteren Sätze, keine Aufzählungszeichen."].join("\n");
// Hilfe für Fotos und Scans im Fenster „Termine einfügen“
function kimpExtHtml(I){if(!I.ext||!I.ext.length)return "";
  return `<div class="kimpext"><b>📷 ${I.ext.length===1?esc(I.ext[0].name||"Foto"):I.ext.length+" Dateien"}: Text bitte über Gemini holen</b>
    <ol><li><button class="ghost small" data-act="kimpprompt">📋 Prompt kopieren</button></li><li><button class="ghost small" data-act="kimpshare">📤 ${I.ext.length===1?"Datei":"Dateien"} an Gemini geben</button> und dort den Prompt einfügen</li><li>Antwort kopieren, hier <button class="ghost small" data-act="kimpclip">📋 Einfügen</button>, dann „Erkennen“</li></ol>${S.kimpCopy?`<textarea rows="4" readonly>${esc(S.kimpCopy)}</textarea>`:""}</div>`}
async function kimpClick(b){const d=b.dataset;
  if(d.act==="kimpprompt"){const t=KIMP_PROMPT();try{await navigator.clipboard.writeText(t);S.kimpCopy="";toast("Prompt kopiert")}catch(_){S.kimpCopy=t;render();toast("Bitte den Text im Feld kopieren")}return true}
  if(d.act==="kimpshare"&&S.kitaImp&&S.kitaImp.ext){const F=S.kitaImp.ext;try{if(navigator.canShare&&navigator.canShare({files:F})){await navigator.share({files:F,text:KIMP_PROMPT()});return true}}catch(e){if(e&&e.name==="AbortError")return true}toast("Teilen geht hier nicht. Öffne die Datei direkt in Gemini.");return true}
  if(d.act==="kimpclip"){let t="";try{t=await navigator.clipboard.readText()}catch(_){}const el=document.getElementById("kimp-text");if(!t){toast("Zwischenablage ist leer oder gesperrt. Bitte lange ins Feld tippen und Einfügen.");if(el)el.focus();return true}
    if(el){el.value=t;S.kitaImp.text=t}return true}
  return false}
