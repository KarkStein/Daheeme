// Kita-Briefe teilen (Florian 19.11.2026): Teilen › Daheeme › „🎒 Kita-Termine“ öffnet die Vorschau mit Haken; Text, .ics, PDF; Fotos über Prompt; Einfügen per Hand bleibt.
// pdf.js kommt im Test aus PDFJS_DIR (Vorgabe /tmp/pdfjs/package/build, z. B. aus „npm pack pdfjs-dist@3.11.174“); fehlt es, wird der PDF-Teil übersprungen.
{const orig=srv.listeners('request')[0];srv.removeAllListeners('request');srv.on('request',(req,res)=>{if(req.url.startsWith('/sw.js')){res.writeHead(200,{'content-type':'text/javascript'});return res.end(fs.readFileSync(path.join(__dirname,'..','sw.js')))}orig(req,res)})}
function miniPdf(lines){const ops=lines.map((l,i)=>`BT /F1 12 Tf 60 ${780-i*20} Td (${l.replace(/([()\\])/g,'\\$1')}) Tj ET`).join('\n');
  const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',`<< /Length ${ops.length} >>\nstream\n${ops}\nendstream`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let s='%PDF-1.4\n';const off=[];objs.forEach((o,i)=>{off.push(s.length);s+=`${i+1} 0 obj\n${o}\nendobj\n`});const x=s.length;
  s+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;return Buffer.from(s,'latin1')}
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];const PJ=process.env.PDFJS_DIR||'/tmp/pdfjs/package/build',hasPj=fs.existsSync(PJ+'/pdf.min.js');
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  if(hasPj)await c.route('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/**',rt=>{const f=rt.request().url().split('/').pop();rt.fulfill({contentType:'text/javascript',body:fs.readFileSync(PJ+'/'+f)})});
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const base=A.url().split('#')[0],D=n=>{const d=new Date(Date.now()+n*864e5);return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()};
  // Hintergrund-Teil läuft und nimmt geteilte Dateien an
  await A.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller||navigator.serviceWorker.ready.then(()=>0),null,{timeout:8000}).catch(()=>{});
  await A.reload();await A.waitForTimeout(800);r.sw=await A.evaluate(()=>!!navigator.serviceWorker.controller);
  // 1) Text aus einer Nachricht (POST wie beim Teilen, ohne Datei)
  const share=async(fields,files)=>{await A.evaluate(async([fields,files])=>{const fd=new FormData();Object.entries(fields).forEach(([k,v])=>fd.append(k,v));(files||[]).forEach(f=>fd.append('f',new File([Uint8Array.from(atob(f.b64),c=>c.charCodeAt(0))],f.name,{type:f.type})));
      await fetch('./?share=1',{method:'POST',body:fd})},[fields,files]);await A.goto(base+'?shared=1');await A.waitForSelector('#mbox [data-shto]',{timeout:8000})};
  await share({st:'Elternbrief',sx:`Liebe Eltern,\n${D(20)} Nikolausfeier, 9:30 Uhr\n${D(26)} Kita geschlossen`});
  r.pre=await A.$eval('#mbox [data-shto=kita]',e=>e.getAttribute('aria-pressed'));
  if(out)await A.screenshot({path:out+'/kita-teilen-wohin.png'});
  await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);r.tab=await A.evaluate(()=>document.querySelector('#tabs [aria-current="page"]')?.textContent||'');
  r.l1=await A.$$eval('[data-kimptog]',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));
  if(out)await A.screenshot({path:out+'/kita-teilen-vorschau.png'});
  await A.click('[data-act=kimpsave]');await A.waitForTimeout(800);r.saved=await A.$$eval('#app .evlist .ev',l=>l.length);
  // 2) PDF
  if(hasPj){const pdf=miniPdf(['Liebe Eltern,',`${D(30)}   Weihnachtsfeier, 15:00 Uhr`,`${D(40)} - ${D(44)}   Kita geschlossen`]).toString('base64');
    await share({st:'',sx:''},[{name:'Elternbrief.pdf',type:'application/pdf',b64:pdf}]);r.pdfchip=await A.$eval('#mbox',e=>/Elternbrief\.pdf/.test(e.innerText));
    await A.click('#mbox button[type=submit]');await A.waitForSelector('[data-kimptog]',{timeout:15000}).catch(()=>{});r.l2=await A.$$eval('[data-kimptog]',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));await A.click('[data-act=kimpcancel]').catch(()=>{})}
  // 3) Foto: Prompt-Hilfe
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  await share({st:'',sx:''},[{name:'brief.jpg',type:'image/png',b64:png}]);await A.click('#mbox button[type=submit]');await A.waitForTimeout(800);
  r.ext=await A.$eval('.kimpext',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');r.manual=await A.$('#kimp-text')!==null;
  if(out)await A.screenshot({path:out+'/kita-teilen-foto.png'});
  // 4) Alter Weg (GET) geht weiter
  await A.goto(base+'?st=Rezept&su='+encodeURIComponent('https://www.chefkoch.de/rezepte/1/x.html'));await A.waitForSelector('#mbox [data-shto]');r.get=await A.$eval('#mbox [data-shto=rezept]',e=>e.getAttribute('aria-pressed'));
  console.error(JSON.stringify(r),errs,hasPj?'':'(PDF übersprungen, kein pdf.js)');
  const ok=!errs.length&&r.sw&&r.pre==='true'&&r.l1.length===2&&/Nikolausfeier/.test(r.l1[0])&&r.saved>=2&&(!hasPj||(r.pdfchip&&r.l2.some(x=>/Weihnachtsfeier/.test(x))&&r.l2.some(x=>/geschlossen/.test(x))))
    &&/Prompt kopieren/.test(r.ext)&&/Gemini/.test(r.ext)&&r.manual&&r.get==='true';
  console.error(ok?'KITATEILEN OK':'KITATEILEN FAIL');await b.close();srv.close();process.exit(0)});
