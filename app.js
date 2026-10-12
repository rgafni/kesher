/* Kesher: the people you love, kept close. Everything lives on this phone only (localStorage). */
(function(){
var $=C.$,esc=C.esc;
var S=C.store('kesher.v1',{people:[],moments:[],log:[],me:{onboarded:false,name:''},tab:'today',skip:{}});
var CIRCLES=[['home','🏠','Home'],['kids','🧒','My kids'],['family','👪','Family'],['friends','🤝','Friends'],['learning','📖','Chavrusas'],['work','💼','Work']];
var CAD=[[3,'Every few days'],[7,'Weekly'],[14,'Every 2 weeks'],[30,'Monthly'],[60,'Every couple months']];
var EMO={home:'💛',kids:'🧒',family:'👪',friends:'🤝',learning:'📖',work:'💼'};
function circ(k){for(var i=0;i<CIRCLES.length;i++)if(CIRCLES[i][0]===k)return CIRCLES[i];return CIRCLES[3]}
function P(id){return S.people.find(function(p){return p.id===id})}
function first(n){return String(n||'').split(' ')[0]}
function since(p){return p.last?C.daysBetween(p.last,Date.now()):999}
function due(p){return since(p)-p.cad}
function nextDate(p){var best=null;(p.dates||[]).forEach(function(d){var m=+d.md.slice(0,2)-1,dd=+d.md.slice(3),t=new Date(),x=new Date(t.getFullYear(),m,dd);if(C.daysBetween(t,x)<0)x.setFullYear(x.getFullYear()+1);var n=C.daysBetween(t,x);if(!best||n<best.n)best={n:n,label:d.label,date:x}});return best}
function latest(p){return (p.notes||[]).slice(-1)[0]}
function shab(){return C.shabbat(new Date())}

/* ---------- picking who today ---------- */
function todays(){var k=C.dayKey(),list=S.people.filter(function(p){return S.skip[p.id]!==k});
  list.sort(function(a,b){var na=nextDate(a),nb=nextDate(b);var sa=due(a)+(na&&na.n<=3?50:0)+(latest(a)&&!a.followed?5:0),sb=due(b)+(nb&&nb.n<=3?50:0)+(latest(b)&&!b.followed?5:0);return sb-sa});
  return list[0]}
function msgs(p){var f=first(p.name),n=latest(p),d=nextDate(p),out=[];
  if(d&&d.n<=3)out.push(d.n===0?'Happy '+d.label.toLowerCase()+', '+f+'! I hope you know how much you mean to me. ❤️':'Thinking of you before your '+d.label.toLowerCase()+', '+f+'. Want to grab a coffee this week?');
  if(n)out.push('Hey '+f+', been thinking about '+n.text.replace(/[.!]+$/,'').toLowerCase()+'. How\u2019s it going? I\u2019m in your corner.');
  var base={home:['Just stopping in the middle of my day to say I love you. That\u2019s it. That\u2019s the text. ❤️','I noticed everything you carried this week. Thank you. You\u2019re incredible.'],
    kids:['Hey buddy, Abba was just thinking about you and smiling. Love you!','Random fact: you\u2019re one of my favorite people on earth. Tonight, you pick the game. ❤️'],
    family:['Hey '+f+', no agenda, just wanted to say I love you and I\u2019m grateful you\u2019re my family.','Was just telling a story about you and realized I never say it enough: love you, '+f+'.'],
    friends:['Hey '+f+', you crossed my mind today and I smiled. Love you, brother. How are you really doing?','I was just thinking how lucky I am to have you as a friend. Let\u2019s catch up this week? ❤️'],
    learning:['Still thinking about what we learned last time. Thank you for being my chavrusa, it means more than you know.','Hey '+f+', I love learning with you. You make me a better Jew and a better person.'],
    work:['Hey '+f+', I see how much you give. Wanted you to hear it from me: thank you, really.','You made a real difference this week, '+f+'. I noticed. Thank you.']}[p.circle]||[];
  return out.concat(base).slice(0,3)}

/* ---------- views ---------- */
var V={};
V.today=function(){var now=new Date(),h=now.getHours(),sh=shab(),p=todays(),told=S.log.filter(function(l){return C.daysBetween(l.t,now)<7}).length;
  var hi=h<12?'Boker tov':h<17?'Good afternoon':'Good evening';
  var o='<div class="top"><div><div class="eyebrow">'+C.fmtDay(now)+'</div><h1>'+hi+(S.me.name?', '+esc(S.me.name):'')+'</h1></div><div class="av" style="background:var(--pink)">❤️</div></div>';
  o+='<div class="installbar" id="ib"></div>';
  if(sh.isNow) o+='<div class="card rose"><b>🕯️ Shabbat Shalom.</b><p>Phone down. Tell them in person. The best “I love you” this week happens at the table.</p><p class="sm mut">Back after Havdalah, about '+C.fmtTime(sh.havdala)+'.</p></div>';
  if(!S.people.length) return o+'<div class="card hero"><div class="big">Who do you love?</div><p class="mut">You think it all day. Kesher makes sure they actually hear it.</p><button class="btn white" data-a="onboard">Add my people</button></div>'+storyNudge();
  if(p){var n=latest(p),d=nextDate(p),s=since(p);
    o+='<div class="card hero"><div class="eyebrow" style="color:#FFD3DE">Today, tell</div><div class="top" style="margin:4px 0 6px"><div class="big">'+esc(p.name)+'</div><div class="av" style="background:rgba(255,255,255,.18);width:54px;height:54px;font-size:1.6rem">'+(p.emoji||EMO[p.circle])+'</div></div>';
    o+='<p class="mut">'+(p.last?(s===0?'You connected today.':'Last “I love you”: '+s+' day'+(s===1?'':'s')+' ago.'):'You haven\u2019t logged a single one yet. Today\u2019s the day.')+'</p>';
    if(n)o+='<p><b>What\u2019s going on:</b> '+esc(n.text)+'</p>';
    if(d&&d.n<=14)o+='<p>🎉 '+esc(d.label)+(d.n===0?' is <b>today</b>!':' in '+d.n+' day'+(d.n===1?'':'s'))+'</p>';
    o+=sh.isNow?'<button class="btn white" data-a="told" data-id="'+p.id+'">Told them in person ❤️</button>':'<div class="stack" style="margin-top:12px"><button class="btn white" data-a="compose" data-id="'+p.id+'">💌 Say it now</button><div class="row"><button class="btn ghost sm" style="background:rgba(255,255,255,.15);color:#fff" data-a="told" data-id="'+p.id+'">Already did</button><button class="btn ghost sm" style="background:rgba(255,255,255,.15);color:#fff" data-a="skip" data-id="'+p.id+'">Someone else</button></div></div>';
    o+='</div>'}
  o+='<div class="grid2"><div class="stat"><b>'+told+'</b><span class="sm mut">people heard it this week</span></div><div class="stat"><b>'+streak()+'</b><span class="sm mut">day streak</span></div></div>';
  var up=S.people.map(function(p){return {p:p,d:nextDate(p)}}).filter(function(x){return x.d&&x.d.n<=21}).sort(function(a,b){return a.d.n-b.d.n});
  if(up.length){o+='<h2>Coming up</h2>';up.slice(0,4).forEach(function(x){o+=row(x.p,'🎉 '+x.d.label+' · '+(x.d.n===0?'today':x.d.n===1?'tomorrow':'in '+x.d.n+' days'),x.d.n<=3?'red':'')})}
  var fol=S.people.filter(function(p){var n=latest(p);return n&&!p.followed&&C.daysBetween(n.t,now)>=2});
  if(fol.length){o+='<h2>Circle back on</h2><p class="sm mut">You knew about these. Asking “how did it go?” is the most underrated move in friendship.</p>';fol.slice(0,3).forEach(function(p){o+=row(p,'↩︎ '+latest(p).text,'')})}
  var dinner=h>=15&&h<20;
  o+='<h2>'+(dinner?'Tonight at the table':'For family time tonight')+'</h2><div class="card soft"><div class="eyebrow">5:30–8 is sacred</div><p style="font-size:1.12rem;font-weight:750;margin:8px 0">“'+esc(Q[(Math.floor(Date.now()/864e5))%Q.length])+'”</p><button class="btn ghost sm" data-a="q">Another question</button></div>';
  return o+storyNudge()};
function storyNudge(){return '<div class="card rose"><b>📜 One story for the kids</b><p class="sm">You\u2019re the family storyteller. Bank one before it fades — 60 seconds, typed or dictated.</p><button class="btn red sm" data-a="newstory">Save a story</button></div>'}
var Q=['What was the funniest thing that happened today?','If you could have one superpower just for tomorrow, what would it be?','Who did something kind today, and what was it?','What\u2019s something you\u2019re worried about that we could figure out together?','If our family had a theme song, what would it be?','What\u2019s a question you\u2019ve always wanted to ask me?','What\u2019s one thing you\u2019re proud of this week?','Which person from the parasha would you want to have dinner with?','What\u2019s the best chess move you could make in real life right now?','Rose, thorn, and bud: go.','If you ran the house for a day, what\u2019s rule number one?','What\u2019s something I do that makes you feel loved?'];
function streak(){var days={};S.log.forEach(function(l){days[C.dayKey(new Date(l.t))]=1});var n=0,d=new Date();if(!days[C.dayKey(d)])d.setDate(d.getDate()-1);while(days[C.dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function row(p,sub,b){var dd=due(p);return '<button class="item" data-a="person" data-id="'+p.id+'"><div class="av">'+(p.emoji||EMO[p.circle])+'</div><div class="grow"><b>'+esc(p.name)+'</b><div class="sub">'+esc(sub)+'</div></div>'+(b==='red'?'<span class="badge red">Soon</span>':dd>=0?'<span class="badge red">Due</span>':'')+'</button>'}
V.people=function(){var f=S.filter||'all';var o='<div class="top"><h1>My people</h1><button class="btn sm" style="width:auto" data-a="add">＋ Add</button></div><div class="chips" style="margin:12px 0"><button class="chip '+(f==='all'?'on':'')+'" data-a="filter" data-f="all">Everyone</button>';
  CIRCLES.forEach(function(c){if(S.people.some(function(p){return p.circle===c[0]}))o+='<button class="chip '+(f===c[0]?'on':'')+'" data-a="filter" data-f="'+c[0]+'">'+c[1]+' '+c[2]+'</button>'});o+='</div>';
  var list=S.people.filter(function(p){return f==='all'||p.circle===f}).sort(function(a,b){return due(b)-due(a)});
  if(!list.length)return o+'<div class="empty"><div class="e">🫶</div><p>No one here yet.</p><button class="btn" data-a="add">Add someone you love</button></div>';
  list.forEach(function(p){var n=latest(p),s=since(p);o+=row(p,n?n.text:(p.last?s+'d since you said it':'Not told yet'),'')});return o};
V.stories=function(){var o='<div class="top"><h1>Story Bank</h1><button class="btn red sm" style="width:auto" data-a="newstory">＋ Story</button></div><p class="mut">For the kids, someday. The funny ones, the hard ones, the ones only you remember.</p>';
  if(!S.moments.length)return o+'<div class="card soft"><b>Not sure where to start? Try one:</b>'+PROMPTS.slice(0,4).map(function(t){return '<button class="item" data-a="newstory" data-p="'+esc(t)+'"><div class="av">✍️</div><div class="grow">'+esc(t)+'</div></button>'}).join('')+'</div>';
  o+='<button class="btn ghost sm" data-a="prompt">🎲 Give me a prompt</button>';
  S.moments.slice().reverse().forEach(function(m){o+='<button class="item" data-a="story" data-id="'+m.id+'"><div class="av">'+(m.for==='all'?'📜':'🎁')+'</div><div class="grow"><b>'+esc(m.title)+'</b><div class="sub">'+esc(new Date(m.t).toLocaleDateString())+(m.for&&m.for!=='all'?' · for '+esc(m.for):'')+'</div></div></button>'});return o};
var PROMPTS=['The day I met Ima','The funniest thing that happened at my bar mitzvah','A rebbe who changed my life','The first time I held each of you','My most embarrassing moment (that I can laugh at now)','A Shabbos table I\u2019ll never forget','What I was like at 13','A time I failed and what it taught me','The best chess game I ever played','A friend who showed up when I needed it','A niggun that always brings me back','What I hope you know about how much I love you'];
V.me=function(){var o='<h1>You</h1><p class="mut">Everything stays on this phone. No accounts, no servers, no trackers.</p>';
  o+='<div class="grid2"><div class="stat"><b>'+S.log.length+'</b><span class="sm mut">“I love you”s logged</span></div><div class="stat"><b>'+S.moments.length+'</b><span class="sm mut">stories banked</span></div></div>';
  var recent=S.log.slice(-6).reverse();if(recent.length){o+='<h2>Recently</h2>';recent.forEach(function(l){var p=P(l.id);if(p)o+='<div class="item" style="cursor:default"><div class="av">'+(p.emoji||EMO[p.circle])+'</div><div class="grow"><b>'+esc(p.name)+'</b><div class="sub">'+new Date(l.t).toLocaleDateString([], {weekday:'long'})+'</div></div><span>❤️</span></div>'})}
  o+='<h2>Settings</h2><label class="f" for="nm">What should I call you?</label><input class="t" id="nm" value="'+esc(S.me.name)+'" placeholder="Your first name" autocomplete="off"><div style="height:10px"></div><button class="btn ghost" data-a="savename">Save</button>';
  o+='<h2>Backup</h2><div class="row"><button class="btn line sm" data-a="export">⬇️ Save backup</button><button class="btn line sm" data-a="import">⬆️ Restore</button></div>';
  o+='<h2>Try it out</h2><button class="btn line sm" data-a="examples">Load example people</button><div style="height:10px"></div><button class="btn line sm" style="color:var(--red)" data-a="wipe">Erase everything on this phone</button><div class="installbar" id="ib"></div>';
  return o};

/* ---------- sheets ---------- */
function personSheet(id){var p=P(id);if(!p)return;var d=nextDate(p);
  var h='<div class="top"><h2>'+(p.emoji||EMO[p.circle])+' '+esc(p.name)+'</h2><button class="btn line sm" style="width:auto" data-a="edit" data-id="'+id+'">Edit</button></div><p class="mut sm">'+circ(p.circle)[1]+' '+circ(p.circle)[2]+' · '+(CAD.find(function(c){return c[0]===p.cad})||[0,'Custom'])[1]+(d?' · '+esc(d.label)+' '+C.fmtDay(d.date):'')+'</p>';
  h+='<div class="row" style="margin:12px 0"><button class="btn" data-a="compose" data-id="'+id+'">💌 Say it</button><button class="btn red" data-a="told" data-id="'+id+'">Told them ❤️</button></div>';
  h+='<label class="f" for="nt">What\u2019s going on in their life?</label><textarea class="t" id="nt" placeholder="New job, kid\u2019s surgery, big game Sunday…"></textarea><div style="height:10px"></div><button class="btn ghost" data-a="addnote" data-id="'+id+'">Remember this</button>';
  var notes=(p.notes||[]).slice().reverse();if(notes.length){h+='<h2>Their life, lately</h2>';notes.forEach(function(n,i){h+='<div class="item" style="cursor:default;min-height:54px"><div class="grow">'+esc(n.text)+'<div class="sub">'+new Date(n.t).toLocaleDateString()+'</div></div>'+(i===0&&!p.followed?'<button class="chip" data-a="followed" data-id="'+id+'">Asked ✓</button>':'')+'</div>'})}
  C.sheet(h)}
function compose(id){var p=P(id),m=msgs(p),h='<h2>Say it to '+esc(first(p.name))+'</h2><p class="mut sm">Tap one to make it yours, then send it from your own Messages or WhatsApp.</p>';
  m.forEach(function(t,i){h+='<button class="item" data-a="pick" data-i="'+i+'"><div class="grow">'+esc(t)+'</div></button>'});
  h+='<textarea class="t" id="msg" placeholder="Or write it your way…">'+esc(m[0]||'')+'</textarea><div class="stack" style="margin-top:10px">';
  if(p.phone)h+='<div class="row"><a class="btn" id="sms" href="#">💬 Messages</a><a class="btn" id="wa" href="#" style="background:#1F8F5F">WhatsApp</a></div><a class="btn ghost" href="tel:'+esc(p.phone.replace(/[^\d+]/g,''))+'">📞 Just call them</a>';
  h+='<button class="btn line" data-a="copy">Copy text</button><button class="btn red" data-a="told" data-id="'+id+'">I said it ❤️</button></div>';
  C.sheet(h,function(b){function upd(){var t=encodeURIComponent($('#msg',b).value),ph=(p.phone||'').replace(/[^\d+]/g,'');if($('#sms',b)){$('#sms',b).href='sms:'+ph+(/iPhone|iPad/.test(navigator.userAgent)?'&':'?')+'body='+t;$('#wa',b).href='https://wa.me/'+ph.replace(/^\+?/,'').replace(/^(\d{10})$/,'1$1')+'?text='+t}}
    $('#msg',b).oninput=upd;upd();b.addEventListener('click',function(e){var x=e.target.closest('[data-a="pick"]');if(x){$('#msg',b).value=m[+x.dataset.i];upd()}})})}
function editSheet(id){var p=id?P(id):{name:'',circle:'friends',cad:14,phone:'',dates:[],emoji:''};var circle=p.circle,cad=p.cad;
  var h='<h2>'+(id?'Edit':'Add someone')+'</h2><label class="f" for="en">Name</label><input class="t" id="en" value="'+esc(p.name)+'" placeholder="First name or nickname" autocomplete="off">';
  h+='<label class="f">Who are they to you?</label><div class="chips" id="ec">'+CIRCLES.map(function(c){return '<button class="chip '+(c[0]===circle?'on':'')+'" data-c="'+c[0]+'">'+c[1]+' '+c[2]+'</button>'}).join('')+'</div>';
  h+='<label class="f">How often should they hear it?</label><div class="chips" id="eq">'+CAD.map(function(c){return '<button class="chip '+(c[0]===cad?'on':'')+'" data-q="'+c[0]+'">'+c[1]+'</button>'}).join('')+'</div>';
  h+='<label class="f" for="ep">Phone (optional, stays on this phone)</label><input class="t" id="ep" type="tel" value="'+esc(p.phone||'')+'" placeholder="For one-tap texting" autocomplete="off">';
  h+='<label class="f" for="ed">A date to remember (optional)</label><div class="row"><input class="t" id="edl" placeholder="Birthday, yahrzeit…" value="'+esc((p.dates[0]||{}).label||'')+'"><input class="t" id="ed" type="date" value="'+((p.dates[0]||{}).md?'2026-'+p.dates[0].md:'')+'"></div>';
  h+='<div class="stack" style="margin-top:18px"><button class="btn" id="esave">Save</button>'+(id?'<button class="btn line" style="color:var(--red)" id="edel">Remove from my circle</button>':'')+'</div>';
  C.sheet(h,function(b){$('#ec',b).onclick=function(e){var x=e.target.closest('[data-c]');if(!x)return;circle=x.dataset.c;b.querySelectorAll('#ec .chip').forEach(function(c){c.classList.toggle('on',c===x)})};
    $('#eq',b).onclick=function(e){var x=e.target.closest('[data-q]');if(!x)return;cad=+x.dataset.q;b.querySelectorAll('#eq .chip').forEach(function(c){c.classList.toggle('on',c===x)})};
    $('#esave',b).onclick=function(){var n=$('#en',b).value.trim();if(!n){C.toast('Who is it? Add a name.');return}
      var dv=$('#ed',b).value,dl=$('#edl',b).value.trim()||'Birthday';var q={name:n,circle:circle,cad:cad,phone:$('#ep',b).value.trim(),dates:dv?[{label:dl,md:dv.slice(5)}]:[]};
      if(id)Object.assign(p,q);else{q.id=C.id();q.notes=[];q.last=0;S.people.push(q)}S.save();C.close();render();C.toast(id?'Saved':'Added '+first(n)+' 💛')};
    if($('#edel',b))$('#edel',b).onclick=function(){if(confirm('Remove '+p.name+'?')){S.people=S.people.filter(function(x){return x.id!==id});S.save();C.close();render()}}})}
function storySheet(id,prompt){var m=id?S.moments.find(function(x){return x.id===id}):{title:prompt||'',text:'',for:'all'};var who=m.for;
  var kids=S.people.filter(function(p){return p.circle==='kids'});
  var h='<h2>'+(id?'Your story':'Bank a story')+'</h2><label class="f" for="st">Title</label><input class="t" id="st" value="'+esc(m.title)+'" placeholder="The time the car broke down on Erev Pesach">';
  h+='<label class="f" for="sx">Tell it like you\u2019d tell it at the table</label><textarea class="t" id="sx" style="min-height:200px" placeholder="Tip: tap the 🎤 on your keyboard and just talk.">'+esc(m.text)+'</textarea>';
  h+='<label class="f">Who is it for?</label><div class="chips" id="sf"><button class="chip '+(who==='all'?'on':'')+'" data-f="all">Everyone</button>'+kids.map(function(k){return '<button class="chip '+(who===k.name?'on':'')+'" data-f="'+esc(k.name)+'">'+esc(k.name)+'</button>'}).join('')+'</div>';
  h+='<div class="stack" style="margin-top:18px"><button class="btn red" id="ss">Save to the Story Bank</button>'+(id?'<button class="btn line" id="sd">Delete</button>':'')+'</div>';
  C.sheet(h,function(b){$('#sf',b).onclick=function(e){var x=e.target.closest('[data-f]');if(!x)return;who=x.dataset.f;b.querySelectorAll('#sf .chip').forEach(function(c){c.classList.toggle('on',c===x)})};
    $('#ss',b).onclick=function(){var t=$('#st',b).value.trim(),x=$('#sx',b).value.trim();if(!t&&!x){C.toast('Give it a title or a line');return}
      if(id)Object.assign(m,{title:t||'Untitled',text:x,for:who});else S.moments.push({id:C.id(),t:Date.now(),title:t||'Untitled',text:x,for:who});S.save();C.close();render();C.toast('Banked. Future you says thanks 📜')};
    if($('#sd',b))$('#sd',b).onclick=function(){if(confirm('Delete this story?')){S.moments=S.moments.filter(function(x){return x.id!==id});S.save();C.close();render()}}})}
function onboard(){var h='<h2>Let\u2019s start with three people</h2><p class="mut">Who would you be sad to realize hasn\u2019t heard “I love you” from you in a month?</p><div id="ob"></div><button class="btn" data-a="add">＋ Add a person</button><div style="height:10px"></div><button class="btn line" data-a="examples">Just show me with example people</button>';C.sheet(h)}
function examples(){var d=864e5,n=Date.now();function md(k){var x=new Date(n+k*d);return String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}
  S.people=[{id:'e1',name:'My wife',circle:'home',emoji:'💛',cad:3,last:n-4*d,notes:[{t:n-3*d,text:'Big quarter-end deadline at work'}],dates:[{label:'Anniversary',md:md(40)}]},
    {id:'e2',name:'Oldest',circle:'kids',emoji:'🎓',cad:3,last:n-2*d,notes:[{t:n-5*d,text:'Nervous about the high school interview'}],dates:[]},
    {id:'e3',name:'Middle',circle:'kids',emoji:'🎨',cad:3,last:n-1*d,notes:[],dates:[{label:'Birthday',md:md(12)}]},
    {id:'e4',name:'Best friend',circle:'friends',emoji:'♟️',cad:7,last:n-19*d,notes:[{t:n-6*d,text:'Dad in the hospital'}],dates:[]},
    {id:'e5',name:'Chavrusa',circle:'learning',cad:14,last:n-9*d,notes:[],dates:[{label:'Birthday',md:md(2)}]},
    {id:'e6',name:'Camp friend',circle:'friends',cad:30,last:n-45*d,notes:[{t:n-20*d,text:'Just moved to a new city'}],dates:[]},
    {id:'e7',name:'My sister',circle:'family',cad:7,last:n-8*d,notes:[],dates:[]}];
  S.moments=[{id:'m1',t:n-3*d,title:'The chess game I lost to a 9-year-old',text:'It was the summer of...',for:'all'}];
  S.log=[{id:'e3',t:n-d},{id:'e2',t:n-2*d}];S.save();C.close();go('today');C.toast('Example people loaded. Swap in your real ones anytime.')}

/* ---------- actions ---------- */
function told(id){S.log.push({id:id,t:Date.now()});var p=P(id);p.last=Date.now();S.save();C.close();render();C.toast(['That\u2019s the stuff. ❤️','Kesher made. 🔗','They\u2019ll carry that all day.','Ahavas Yisrael, one text at a time.'][S.log.length%4])}
document.addEventListener('click',function(e){var x=e.target.closest('[data-a]');if(!x)return;var a=x.dataset.a,id=x.dataset.id;
  if(a==='tab')go(x.dataset.t);else if(a==='person')personSheet(id);else if(a==='compose')compose(id);else if(a==='told')told(id);
  else if(a==='skip'){S.skip[id]=C.dayKey();S.save();render()}else if(a==='add')editSheet();else if(a==='edit')editSheet(id);
  else if(a==='addnote'){var t=$('#nt').value.trim();if(!t)return;var p=P(id);p.notes.push({t:Date.now(),text:t});p.followed=false;S.save();personSheet(id);render();C.toast('Got it. I\u2019ll remind you to ask.')}
  else if(a==='followed'){P(id).followed=true;S.save();personSheet(id);render()}
  else if(a==='filter'){S.filter=x.dataset.f;render()}else if(a==='newstory')storySheet(null,x.dataset.p);else if(a==='story')storySheet(id);
  else if(a==='prompt')storySheet(null,PROMPTS[Math.floor(Math.random()*PROMPTS.length)]);
  else if(a==='q'){Q.push(Q.shift());render()}else if(a==='onboard')onboard();else if(a==='examples')examples();
  else if(a==='copy'){var v=$('#msg').value;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){C.toast('Copied')},function(){C.toast('Long-press the text to copy')})}
  else if(a==='savename'){S.me.name=$('#nm').value.trim();S.save();C.toast('Nice to meet you'+(S.me.name?', '+S.me.name:'')+' 👋');render()}
  else if(a==='export')C.download('kesher-backup-'+C.dayKey()+'.json',{people:S.people,moments:S.moments,log:S.log,me:S.me});
  else if(a==='import')C.pickFile(function(o){if(!o.people)return C.toast('Not a Kesher backup');S.people=o.people;S.moments=o.moments||[];S.log=o.log||[];S.me=o.me||S.me;S.save();render();C.toast('Restored 💛')});
  else if(a==='wipe'){if(confirm('Erase all people, notes and stories from this phone?')){S.people=[];S.moments=[];S.log=[];S.skip={};S.save();go('today')}}});
function go(t){S.tab=t;S.save();render();window.scrollTo(0,0)}
function render(){var t=V[S.tab]?S.tab:'today';$('main').innerHTML=V[t]();document.querySelectorAll('nav.tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.t===t)});C.installBar($('#ib'))}
var tabs=[['today','❤️','Today'],['people','🫶','People'],['stories','📜','Stories'],['me','⚙️','You']];
$('nav.tabs').innerHTML=tabs.map(function(t){return '<button data-a="tab" data-t="'+t[0]+'"><span class="i">'+t[1]+'</span>'+t[2]+'</button>'}).join('');
render();C.sw();
})();
