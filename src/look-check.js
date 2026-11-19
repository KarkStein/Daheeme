// Look „Bretagne“, feste Regeln (Florian 19.11.2026): meldet Abweichungen in src/haushalt/teile.
// Aufruf: node src/look-check.js  (Ende mit „LOOK-REGELN OK“ oder Liste der Stellen und Fehlercode 1)
// Ausnahmen: die Tokens in :root, die gezeichneten Bilder (12-startbild.js, 30-motive.js, Zeilen mit „/*bild“), Ringe (Schatten ohne Unschärfe).
const fs=require('fs'),path=require('path');
function check(dir){dir=dir||path.join(__dirname,'haushalt','teile');const out=[];
  const css=fs.readFileSync(path.join(dir,'01-stil.css'),'utf8');
  const cut=css.indexOf('*{box-sizing');const lines=css.slice(cut).split('\n'),off=css.slice(0,cut).split('\n').length;
  const RAD=/^(999px|var\(--r\)|var\(--r-s\)|0|inherit|var\(--r\) var\(--r\) 0 0)(!important)?$/;
  const FS=/^(var\(--fs-(xs|s|m|l|xl)\)|var\(--emo(-l)?\)|inherit)(!important)?$/;
  const RING=/^(inset )?0 0 0 [\d.]+px .+$/;
  lines.forEach((ln,i)=>{const at='01-stil.css:'+(off+i)+' ';const t=ln.replace(/\/\*.*?\*\//g,'');
    (t.match(/#[0-9a-fA-F]{3,8}\b(?![^{}]*\{)/g)||[]).forEach(m=>out.push(at+'feste Farbe '+m));
    (t.match(/rgba?\([^)]*\)/g)||[]).forEach(m=>out.push(at+'feste Farbe '+m));
    (t.match(/border(-[a-z]+-[a-z]+)?-radius:[^;}]+/g)||[]).forEach(m=>{const v=m.split(':')[1].trim();if(!RAD.test(v))out.push(at+'Rundung '+v)});
    (t.match(/box-shadow:[^;}]+/g)||[]).forEach(m=>{const v=m.slice(11).trim();if(!/^(none|var\(--shadow\))$/.test(v)&&!RING.test(v)&&v!=='0 0 0 0 transparent')out.push(at+'Schatten '+v)});
    (t.match(/font-size:[^;}]+/g)||[]).forEach(m=>{const v=m.slice(10).trim();if(!FS.test(v))out.push(at+'Schriftgröße '+v)});
    (t.match(/font:[^;}]*\d(px|rem|em)[^;}]*/g)||[]).forEach(m=>out.push(at+'Schriftgröße in '+m))});
  const DYN=/^(width|height|left|top|bottom|animation-delay|--[a-z]+)$/;
  fs.readdirSync(dir).filter(f=>/\.(js|html)$/.test(f)&&!/^(12-startbild|30-motive)\.js$/.test(f)).forEach(f=>{
    fs.readFileSync(path.join(dir,f),'utf8').split('\n').forEach((ln,i)=>{if(ln.indexOf('/*bild')>=0)return;const at=f+':'+(i+1)+' ';
      (ln.match(/["'=:(, ]#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?=["';, )])/g)||[]).forEach(m=>out.push(at+'feste Farbe '+m.slice(1)));
      (ln.match(/rgba?\(\d[^)]*\)/g)||[]).forEach(m=>out.push(at+'feste Farbe '+m));
      (ln.match(/ style="[^"]*"/g)||[]).forEach(m=>{const v=m.slice(8,-1);if(/^\$\{[^}]*\}$/.test(v))return;
        const bad=v.replace(/\$\{[^}]*\}/g,'X').split(';').filter(Boolean).filter(d=>!DYN.test(d.split(':')[0].trim())&&d.indexOf(':')>0);
        if(bad.length||v.indexOf('${')<0)out.push(at+'fester Stil im Code: '+v.slice(0,60))})})});
  return out}
module.exports=check;
if(require.main===module){const o=check();if(o.length){console.log(o.join('\n'));console.log(o.length+' Abweichungen von den Look-Regeln (siehe CLAUDE.md, Look „Bretagne“)');process.exit(1)}console.log('LOOK-REGELN OK')}
