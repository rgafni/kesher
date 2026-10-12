/* core.js: shared helpers. All data stays in this device's localStorage. No network calls. */
(function(){
var C=window.C={};
C.$=function(s,r){return (r||document).querySelector(s)};
C.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
C.id=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)};
C.store=function(key,def){
  var s;try{s=JSON.parse(localStorage.getItem(key))}catch(e){}
  s=s||JSON.parse(JSON.stringify(def));
  for(var k in def) if(!(k in s)) s[k]=JSON.parse(JSON.stringify(def[k]));
  s.save=function(){var o={};for(var k in s) if(k!=='save') o[k]=s[k];localStorage.setItem(key,JSON.stringify(o))};
  return s};
C.toast=function(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)};
C.sheet=function(html,onmount){C.close();var b=document.createElement('div');b.className='sheet-bg';b.id='sheet';
  b.innerHTML='<div class="sheet" role="dialog" aria-modal="true"><div class="hd"></div>'+html+'</div>';
  b.addEventListener('click',function(e){if(e.target===b)C.close()});document.body.appendChild(b);onmount&&onmount(b);return b};
C.close=function(){var s=document.getElementById('sheet');s&&s.remove()};
C.fmtTime=function(d){return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
C.fmtDay=function(d){return d.toLocaleDateString([], {weekday:'short',month:'short',day:'numeric'})};
C.dayKey=function(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
C.daysBetween=function(a,b){return Math.round((new Date(b).setHours(0,0,0,0)-new Date(a).setHours(0,0,0,0))/864e5)};
/* NOAA sunrise/sunset. Returns Date objects (local) for the given day. Default: West Hempstead area. */
C.sun=function(date,lat,lon){
  lat=lat==null?40.70:lat;lon=lon==null?-73.65:lon;
  var rad=Math.PI/180,d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
  var start=new Date(d.getFullYear(),0,0),N=Math.floor((d-start)/864e5);
  function calc(rise){
    var lngHour=lon/15,t=N+((rise?6:18)-lngHour)/24,M=0.9856*t-3.289;
    var L=M+1.916*Math.sin(M*rad)+0.020*Math.sin(2*M*rad)+282.634;L=(L+360)%360;
    var RA=Math.atan(0.91764*Math.tan(L*rad))/rad;RA=(RA+360)%360;
    RA=RA+(Math.floor(L/90)*90-Math.floor(RA/90)*90);RA/=15;
    var sinDec=0.39782*Math.sin(L*rad),cosDec=Math.cos(Math.asin(sinDec));
    var cosH=(Math.cos(90.833*rad)-sinDec*Math.sin(lat*rad))/(cosDec*Math.cos(lat*rad));
    var H=rise?360-Math.acos(cosH)/rad:Math.acos(cosH)/rad;H/=15;
    var T=H+RA-0.06571*t-6.622,UT=((T-lngHour)%24+24)%24;
    var r=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0));r.setTime(r.getTime()+UT*36e5);
    if(r.getDate()!==d.getDate()&&Math.abs(r-d)>18*36e5) r.setTime(r.getTime()+(r<d?864e5:-864e5));
    return r}
  var sr=calc(true),ss=calc(false);
  return {rise:sr,set:ss,chatzot:new Date((sr.getTime()+ss.getTime())/2)}};
/* Shabbat window: Fri candle lighting (sunset-18) .. Sat sunset+50 */
C.shabbat=function(now,lat,lon){now=now||new Date();var dow=now.getDay();
  var fri=new Date(now);fri.setDate(now.getDate()+((5-dow+7)%7)-(dow===6?7:0));
  var fs=C.sun(fri,lat,lon),candles=new Date(fs.set-18*6e4);
  var sat=new Date(fri);sat.setDate(fri.getDate()+1);var havdala=new Date(C.sun(sat,lat,lon).set.getTime()+50*6e4);
  return {fri:fri,candles:candles,chatzot:fs.chatzot,havdala:havdala,isNow:now>=candles&&now<havdala}};
C.sw=function(){if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(function(){})};
C.installBar=function(el){if(!window.AppInstall||!el)return;function u(){el.classList.toggle('show',AppInstall.visible()&&AppInstall.mode()!=='standalone')}
  el.innerHTML='<button class="btn ghost sm" type="button">📲 Put it on my home screen</button>';el.firstChild.onclick=function(){AppInstall.install()};u();AppInstall.onChange&&AppInstall.onChange(u)};
C.download=function(name,obj){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)};
C.pickFile=function(cb){var i=document.createElement('input');i.type='file';i.accept='application/json,.json';i.onchange=function(){var r=new FileReader();r.onload=function(){try{cb(JSON.parse(r.result))}catch(e){C.toast('That file didn\u2019t look right')}};r.readAsText(i.files[0])};i.click()};
})();
