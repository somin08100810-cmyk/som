(function(){
'use strict';
const E=window.EVY,X=window.EVY_X,R=window.EVY_REL||{};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const byId={};E.characters.forEach(c=>byId[c.id]=c);
const facById={};E.factions.forEach(f=>facById[f.id]=f);
const short=f=>f.id==='sixth'?'여섯째 손':f.name.split(' ')[0];
const card=id=>'images/characters/cards/'+id+'.webp',full=id=>'images/characters/full/'+id+'.webp';
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),1800)}

/* theme */
const tb=$('#theme-btn');
function setTheme(t){document.documentElement.dataset.theme=t;tb.setAttribute('aria-pressed',String(t==='day'));tb.setAttribute('aria-label',t==='day'?'어두운 화면으로 바꾸기':'밝은 화면으로 바꾸기');try{localStorage.setItem('evyTheme',t)}catch(e){}}
setTheme((()=>{try{return localStorage.getItem('evyTheme')}catch(e){}})()||'night');
tb.onclick=()=>setTheme(document.documentElement.dataset.theme==='day'?'night':'day');

/* nav */
const nt=$('#nav-toggle'),nl=$('#nav-links');
nt.onclick=()=>{const o=nl.classList.toggle('open');nt.setAttribute('aria-expanded',o);nt.setAttribute('aria-label',o?'메뉴 닫기':'메뉴 열기')};
$$('a',nl).forEach(a=>a.addEventListener('click',()=>{nl.classList.remove('open');nt.setAttribute('aria-expanded','false')}));
const secs=$$('main section[id]'),links=$$('a',nl),bars=$$('.progress i');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(s=>io.observe(s));
/* D-day (KST) */
(function(){const now=new Date(),kst=new Date(now.getTime()+(now.getTimezoneOffset()+540)*60000);
  const t=Date.UTC(2026,11,31),d=Math.ceil((t-Date.UTC(kst.getFullYear(),kst.getMonth(),kst.getDate()))/864e5);
  $('#dday').textContent=d>0?'D-'+d:d===0?'D-DAY':'열림';})();

/* map */
const map=$('#map'),mc=$('#map-card');
X.spots.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='spot';b.style.left=s.x+'%';b.style.top=s.y+'%';
  b.innerHTML='<i></i>';b.setAttribute('aria-label',s.name);b.onclick=()=>showSpot(i);map.appendChild(b)});
function showSpot(i){const s=X.spots[i],f=facById[s.fac];$$('.spot',map).forEach((b,j)=>b.classList.toggle('on',i===j));
  mc.innerHTML='<h3>'+esc(s.name)+'</h3><p>'+esc(s.line)+'</p><p class="owner">'+(s.fac==='caligo'?'문 너머: ':'세력: ')+esc(f.name)+(f.rank?' · '+esc(f.rank):'')+'</p><button type="button" class="btn gold">'+esc(f.name)+' 보기</button>';
  $('.btn',mc).onclick=()=>{selectFac(s.fac);$('#factions').scrollIntoView({behavior:reduce?'auto':'smooth'})}}
showSpot(0);

/* wish simulator */
let shards='5',wish='close';
const ws=$('#wish-seg');
ws.innerHTML=X.wishes.map(w=>'<button type="button" role="radio" data-v="'+w.id+'" aria-checked="'+(w.id===wish)+'">'+esc(w.label)+'</button>').join('');
function radio(group,cb){group.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;$$('button',group).forEach(x=>x.setAttribute('aria-checked',x===b));cb(b.dataset.v)})}
radio($('#shard-seg'),v=>{shards=v;sim()});radio(ws,v=>{wish=v;sim()});
$('#nope').textContent=X.nope;
function sim(){const w=X.wishes.find(x=>x.id===wish),days=$('#days');
  $$('button',ws).forEach(b=>b.disabled=shards!=='5');
  let cells,res,cost,ex,wick;
  if(shards==='5'){cells=w.cells;res=w.result;cost=w.id==='close'?'대가 없음':'대가: 빈 사람이 가장 아끼는 것 하나를 잃어요';ex='예: '+w.ex;wick=w.wick}
  else if(shards==='4'){cells=['x','x','x','x','x','x','x'];res=X.shards['4'];cost='소원은 빌 수 없어요';ex='불씨만 튀어요';wick=0}
  else{cells=['f','f','f','f','f','f','f'];res=X.shards['3'];cost='소원은 빌 수 없어요';ex='등잔에 불이 붙지 않아요';wick=0}
  const name={c:'닫힘',s:'봉인',h:'버팀',f:'싸움',x:'지연'};
  days.innerHTML=cells.map((c,i)=>'<div class="day '+c+'"><b>'+(i+1)+'일</b>'+name[c]+'</div>').join('');
  $('#wick').style.width=(wick*100)+'%';$('#wick-t').textContent=wick===1?'전부':wick>0.6?'2/3':wick>0?'1/3':'불 없음';
  $('#sim-ex').textContent=ex;$('#sim-res').textContent=res;$('#sim-cost').textContent=cost}
sim();

/* timeline */
const ev=X.events,rg=$('#tl-range'),seasons=[...new Set(ev.map(e=>e.season))];
rg.max=ev.length-1;
$('#tl-seasons').innerHTML=seasons.map(s=>'<button type="button" data-s="'+esc(s)+'">'+esc(s)+'</button>').join('');
function tl(i){i=Math.max(0,Math.min(ev.length-1,i));rg.value=i;const e=ev[i];
  const p=$('#tl-season');p.textContent=e.season;p.classList.toggle('end',e.season==='봉인전');
  $('#tl-month').textContent=e.m;$('#tl-text').textContent=e.t;
  $$('#tl-seasons button').forEach(b=>b.classList.toggle('on',b.dataset.s===e.season));
  rg.setAttribute('aria-valuetext',e.m+' '+e.t)}
rg.oninput=()=>tl(+rg.value);$('#tl-prev').onclick=()=>tl(+rg.value-1);$('#tl-next').onclick=()=>tl(+rg.value+1);
$('#tl-seasons').onclick=e=>{const b=e.target.closest('button');if(b)tl(ev.findIndex(x=>x.season===b.dataset.s))};
tl(0);

/* factions */
const ft=$('#fac-tabs'),fp=$('#fac-panel');
ft.innerHTML=E.factions.map(f=>'<button type="button" role="tab" data-f="'+f.id+'" aria-selected="false"><img alt="" src="images/deco/emblem-'+f.id+'.webp"><span>'+esc(f.name)+'</span><small>'+esc(f.rank||'')+'</small></button>').join('');
ft.onclick=e=>{const b=e.target.closest('button');if(b)selectFac(b.dataset.f)};
function selectFac(id){const f=facById[id];$$('button',ft).forEach(b=>b.setAttribute('aria-selected',b.dataset.f===id));
  const mem=E.characters.filter(c=>c.faction===id),canStart=!!X.scenes[id];
  fp.innerHTML='<div class="fac-img"><img src="'+esc(f.img)+'" alt="'+esc(f.name)+' 배경" loading="lazy">'+'</div>'+
  '<div><h3>'+esc(f.name)+'</h3><p class="home">'+esc(f.home||'')+'</p><p>'+esc(f.blurb||'')+'</p><dl>'+
  (f.plus?'<dt>좋은 점</dt><dd>'+esc(f.plus)+'</dd>':'')+(f.minus?'<dt>조심할 점</dt><dd>'+esc(f.minus)+'</dd>':'')+(f.shard?'<dt>조각</dt><dd>'+esc(f.shard)+' 조각</dd>':'')+'<dt>인물</dt><dd>'+mem.length+'명</dd></dl>'+
  '<div class="faces">'+mem.map(c=>'<button type="button" data-c="'+c.id+'" title="'+esc(c.name)+'" aria-label="'+esc(c.name)+' 보기"><img src="'+card(c.id)+'" alt="" loading="lazy"></button>').join('')+'</div>'+
  '<div class="btns">'+(canStart?'<button type="button" class="btn gold" data-start="'+id+'">여기서 시작</button>':'')+'<button type="button" class="btn ghost-l" data-list="'+id+'">인물 목록</button></div></div>';
  $$('.faces button',fp).forEach(b=>b.onclick=()=>{pick(b.dataset.c);goChars()});
  const sb=$('[data-start]',fp);if(sb)sb.onclick=()=>{const r=$('input[name=sf][value='+id+']');if(r){r.checked=true;build()}$('#start').scrollIntoView({behavior:reduce?'auto':'smooth'})};
  $('[data-list]',fp).onclick=()=>{$('#fac-filter').value=id;$('#q').value='';renderGrid();goChars()}}
selectFac('solein');
function goChars(){$('#characters').scrollIntoView({behavior:reduce?'auto':'smooth'})}

/* characters */
const sel=$('#fac-filter'),q=$('#q'),grid=$('#grid'),show=$('#show');
sel.innerHTML='<option value="">전체 세력</option>'+E.factions.map(f=>'<option value="'+f.id+'">'+esc(f.name)+'</option>').join('');
let cur='c01';
function match(c,t){if(!t)return true;return [c.name,c.role,c.tagline,c.personality,c.factionName].join(' ').toLowerCase().includes(t)}
function renderGrid(){const t=q.value.trim().toLowerCase(),f=sel.value;
  const list=E.characters.filter(c=>(!f||c.faction===f)&&match(c,t));
  $('#count').textContent=list.length+'명';
  grid.innerHTML=list.length?list.map(c=>'<button type="button" class="card'+(c.id===cur?' on':'')+'" data-c="'+c.id+'"><img src="'+card(c.id)+'" alt="" loading="lazy" width="144" height="192"><span>'+esc(c.name)+'<small>'+esc(c.role)+'</small></span></button>').join(''):'<p class="empty">맞는 인물이 없어요. 다른 말로 찾아보세요.</p>';
  if(list.length&&!list.some(c=>c.id===cur))pick(list[0].id,true)}
grid.onclick=e=>{const b=e.target.closest('.card');if(!b)return;pick(b.dataset.c);if(innerWidth<900)show.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})};
q.oninput=renderGrid;sel.onchange=renderGrid;
function rels(id){return (R[id]||[]).filter(r=>byId[r.id])}
function pick(id,silent){cur=id;const c=byId[id];$$('.card',grid).forEach(b=>b.classList.toggle('on',b.dataset.c===id));
  const rl=rels(id);
  show.innerHTML='<div class="show-img"><img src="'+full(id)+'" alt="'+esc(c.name)+' 전신 그림"></div><div class="show-body"><h3>'+esc(c.name)+'</h3><p class="meta">'+esc(c.age)+'세 · '+esc(c.factionName)+' · '+esc(c.role)+'</p><p class="tag">'+esc(c.tagline)+'</p>'+
  (c.routes&&c.routes.length?'<p>'+c.routes.map(r=>'<span class="badge">'+esc(r)+'</span>').join('')+'<span class="badge">난이도 '+esc(c.difficulty)+'</span></p>':'')+
  (rl.length?'<p class="label">관계 · 눌러서 이동</p><div class="rels">'+rl.slice(0,6).map(r=>'<button type="button" class="rel" data-c="'+r.id+'"><img src="'+card(r.id)+'" alt=""><span>'+esc(r.name)+' <em>'+esc(r.note)+'</em></span></button>').join('')+'</div>':'')+
  '<button type="button" class="btn gold full" id="more">자세히 보기</button></div>';
  $$('.rel',show).forEach(b=>b.onclick=()=>{const t=b.dataset.c;if(sel.value&&byId[t].faction!==sel.value)sel.value='';if(q.value&&!match(byId[t],q.value.trim().toLowerCase()))q.value='';renderGrid();pick(t)});
  $('#more').onclick=()=>openModal(id)}
renderGrid();pick('c01');

/* modal */
const md=$('#modal');
function openModal(id){const c=byId[id];const rows=[['성격',c.personality],['목표',c.goal],['소원',c.wish],['외모',c.look],['차림',c.outfit],['상징',c.signature]].filter(r=>r[1]);
  $('#m-body').innerHTML='<div class="m-grid"><img src="'+full(id)+'" alt="'+esc(c.name)+' 전신 그림"><div class="m-txt"><h3 id="m-name">'+esc(c.name)+'</h3><p class="meta">'+esc(c.age)+'세 · '+esc(c.factionName)+' · '+esc(c.role)+'</p><p class="tag">'+esc(c.tagline)+'</p><dl>'+rows.map(r=>'<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>').join('')+'</dl></div></div>';
  md.showModal();md.querySelector('.m-inner').scrollTop=0;document.body.style.overflow='hidden'}
function closeModal(){md.close()}
md.addEventListener('close',()=>document.body.style.overflow='');
$('#m-close').onclick=closeModal;md.onclick=e=>{if(e.target===md)closeModal()};

/* builder */
const sf=$('#start-facs'),form=$('#form');
sf.innerHTML=Object.keys(X.scenes).map((id,i)=>'<label class="chip"><input type="radio" name="sf" value="'+id+'"'+(i===0?' checked':'')+'><span>'+esc(facById[id].name.split(' ')[0])+'</span></label>').join('');
function build(){const d=new FormData(form),g=k=>(d.get(k)||'').toString().trim();const fid=g('sf')||'solein';
  let age=g('age');const ageOk=!age||(+age>=20);if(!ageOk)age='20';
  $('#scene').textContent=X.scenes[fid];
  $('#out').textContent=['이름 : '+(g('name')||'(이름)'),'나이 : '+(age||'(20 이상)'),'능력 : '+(g('skill')||'(능력)'),'출신 : '+g('origin'),'시작 : '+facById[fid].name,'한마디 : '+(g('line')||'(한마디)')].join('\n');
  form.age.setCustomValidity(ageOk?'':'20세 이상만 가능해요')}
form.addEventListener('input',build);form.addEventListener('change',build);form.onsubmit=e=>e.preventDefault();build();
$('#copy').onclick=async()=>{const t=$('#out').textContent;try{await navigator.clipboard.writeText(t);toast('복사했어요')}catch(e){const r=document.createRange();r.selectNodeContents($('#out'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('선택했어요. 길게 눌러 복사하세요')}};

/* faq */
$('#faq-list').innerHTML=X.faq.map(f=>'<details><summary>'+esc(f[0])+'</summary><p>'+esc(f[1])+'</p></details>').join('');
})();
