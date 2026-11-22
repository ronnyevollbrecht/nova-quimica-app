/* ============ DADOS ============ */
let CAT={ts:0,fonte:'',itens:[]};
function setCat(c,src){if(c&&Array.isArray(c.itens)&&c.itens.length&&(c.ts||0)>=CAT.ts){CAT=c;CAT.src=src;return true}return false}
try{setCat(JSON.parse(document.getElementById('seed').textContent),'seed')}catch(e){}
try{setCat(JSON.parse(localStorage.getItem('catalogo')||'null'),'local')}catch(e){}

/* ============ DESENHOS ============ */
const BASE={floor:['#c9b79a','#f1ece2'],tile:['#4f4a44','#f4f4f2'],mold:['#3a3f36','#f5f2ea'],grease:['#9a6b22','#e9edf1'],glass:['#b9c7c9','#dff3fb'],sofa:['#7c6a55','#00AFF0'],rust:['#a5501d','#3a4250'],pool:['#3f8a3a','#25a7e0'],car:['#8a7a62','#EC3237'],lodo:['#3f5f24','#cfd2cc']};
function spots(w,h,col,o){let s='',x=7;for(let i=0;i<14;i++){x=(x*37+11)%97;const y=(x*53+i*17)%97;s+=`<ellipse cx="${x/97*w}" cy="${y/97*h}" rx="${6+(i*7)%18}" ry="${4+(i*5)%12}" fill="${col}" opacity="${o}"/>`}return s}
function bubbles(w,h){let s=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg" cx=".32" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#7fdcff"/><stop offset=".6" stop-color="#00AFF0"/><stop offset="1" stop-color="#0077b8"/></radialGradient></defs><rect width="${w}" height="${h}" fill="#353567"/>`;const b=[[.15,.6,.22],[.42,.3,.14],[.62,.68,.2],[.85,.35,.12],[.3,.85,.08],[.75,.12,.07]];b.forEach(([x,y,r])=>s+=`<circle cx="${x*w}" cy="${y*h}" r="${r*Math.min(w,h)*1.4}" fill="url(#bg)" opacity=".9"/>`);return s+'</svg>'}
function art(kind,clean,w=200,h=200){
 if(!kind)return bubbles(w,h);
 const [dirty,ok]=BASE[kind]||BASE.floor;const c=clean?ok:dirty;let g='';
 if(kind==='floor'||kind==='tile'){const n=kind==='tile'?5:3,s=w/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++)g+=`<rect x="${i*s+2}" y="${j*s*h/w+2}" width="${s-4}" height="${s*h/w-4}" rx="3" fill="${clean?ok:(kind==='tile'?'#e3e0d8':dirty)}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="${kind==='tile'?(clean?'#d8d8d8':dirty):(clean?'#d9d3c6':'#8c7b62')}"/>${g}${clean?`<path d="M0 ${h*.2} L${w*.35} 0 L${w*.55} 0 L0 ${h*.42}Z" fill="#fff" opacity=".45"/>`:spots(w,h,'#5a4a33',.35)}</svg>`}
 return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="${c}"/>${clean?`<path d="M0 ${h*.25} L${w*.4} 0 L${w*.6} 0 L0 ${h*.5}Z" fill="#fff" opacity=".35"/>`:spots(w,h,kind==='pool'?'#1f4d1c':'#2a2016',.4)}</svg>`}

/* ============ BUSCA ============ */
const low=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const PB=Object.fromEntries(PROBLEMS.map(p=>[p.id,p]));
const STOP=new Set(['de','da','do','das','dos','no','na','nos','nas','o','a','os','as','um','uma','meu','minha','meus','minhas','com','em','e','para','pra','que','esta','ta','ficou','muito','muita','tem','tenho','como','tirar','limpar','limpo','limpa','sujo','suja','sujeira','quero','preciso','produto','qual','casa','ja','nao','sai','saindo','todo','toda']);
const LOCAL=new Set(['banheiro','cozinha','quintal','carro','parede','ambiente','casa','area','externa','interior','sala','quarto','garagem','box','moto','caminhao']);
const stem=w=>w.replace(/(oes|aes)$/,'ao').replace(/(is)$/,'l').replace(/s$/,'');
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;const v=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let prev=v[0];v[0]=i;let best=i;for(let j=1;j<=b.length;j++){const t=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=t;if(v[j]<best)best=v[j]}if(best>max)return max+1}return v[b.length]}
function wordHit(tok,kw){const a=stem(tok),b=stem(kw);if(a===b)return 1;if(b.length>=4&&(a.startsWith(b)||b.startsWith(a)&&a.length>=4))return .9;if(b.length>=4&&lev(a,b,b.length>=7?2:1)<=(b.length>=7?2:1))return .8;return 0}
function findProblems(text){const t=low(text).replace(/[^a-z0-9 -]/g,' ');const toks=t.split(/\s+/).filter(w=>(w.length>=3||w==='tv'||w==='pc')&&!STOP.has(w));const r=[];
 PROBLEMS.forEach(p=>{let sc=0;for(const k0 of p.kw){const k=low(k0);if(k.includes(' ')){if(t.includes(k))sc+=k.length*1.2;else{const parts=k.split(' ').filter(w=>w.length>=3&&!STOP.has(w));if(parts.length>=2&&parts.every(w=>toks.some(x=>wordHit(x,w))))sc+=k.length*.6}}else{let best=0;for(const x of toks)best=Math.max(best,wordHit(x,k));sc+=best*k.length*(LOCAL.has(k)?.3:1)}}
 for(const w of low(p.label).split(/[^a-z]+/).filter(w=>w.length>=4&&!STOP.has(w))){if(toks.some(x=>wordHit(x,w)>=.9))sc+=2}
 if(sc)r.push([sc,p])});return r.sort((a,b)=>b[0]-a[0]).map(x=>x[1])}
function findByName(text){const w=low(text).split(/\s+/).filter(x=>x.length>=3);if(!w.length)return [];return CAT.itens.filter(i=>{const n=low(i.n);return w.every(x=>n.includes(x))}).sort(byPref)}
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pretty=n=>esc(n.toLowerCase().replace(/(^|[\s(/-])([a-zà-ú])/g,(m,a,b)=>a+b.toUpperCase()).replace(/\b(\d+)(Ml|Lt|L|G|Kg|Gr|Lts)\b/g,(m,a,b)=>a+b.toLowerCase()));
const app=document.getElementById('app'),q=document.getElementById('q');
const PAGE=6;
let GAL={};fetch('fotos-problemas/lista.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.fotos){GAL=j.fotos;if(!document.querySelector('.res-h'))home()}}).catch(()=>{});
const galOf=id=>(GAL[id]||[]).map(f=>typeof f==='string'?{src:f}:f).filter(f=>f&&f.src);
function gallery(p){const fs=galOf(p.id);if(!fs.length)return '';
 return `<div class="gal" aria-label="Fotos do problema"><div class="gal-track">${fs.map((f,i)=>`<figure class="gal-item"><img src="fotos-problemas/${encodeURI(f.src)}" alt="${esc(f.rotulo||p.label)}" loading="${i<2?'eager':'lazy'}" onerror="this.closest('figure').remove()">${f.rotulo?`<figcaption class="${/depois/i.test(f.rotulo)?'dep':''}">${esc(f.rotulo)}</figcaption>`:''}</figure>`).join('')}</div>${fs.length>1?`<div class="gal-dots">${fs.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`:''}</div>`}
const rank=i=>brandOf(i.n)[0];
/* mais indicado primeiro (p.top, em ordem), depois a ordem das marcas */
const tierOf=(p,x)=>{if(!p.top)return 0;const n=normTxt(x.n);const i=p.top.findIndex(r=>r.test(n));return i<0?p.top.length:i};
const byPref=(a,b)=>rank(a)-rank(b)||b.v-a.v;

const ICON=p=>`<svg viewBox="0 0 120 60"><defs><radialGradient id="g${p.id}" cx=".32" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#7fdcff"/><stop offset="1" stop-color="#0083c4"/></radialGradient></defs><circle cx="38" cy="34" r="20" fill="url(#g${p.id})"/><circle cx="72" cy="22" r="11" fill="url(#g${p.id})"/><circle cx="88" cy="42" r="8" fill="url(#g${p.id})"/></svg>`;
function tilePic(p){const g=galOf(p.id);if(g.length)return 'fotos-problemas/'+encodeURI(g[0].src);const its=CAT.itens.filter(i=>i.k.includes(p.id)).sort(byPref);for(const i of its){const f=fichaOf(i.n);if(f&&f.img)return imgUrl(f.img)}return ''}
function tile(p){const n=CAT.itens.filter(i=>i.k.includes(p.id)).length;const src=tilePic(p);
 return `<button class="prob" data-p="${p.id}"><span class="tp${src?"":" noimg"}${galOf(p.id).length?" gal1":""}">${src?`<img src="${src}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">`:''}<i>${ICON(p)}</i></span><b>${p.label}</b><small>${n} produtos</small></button>`}
function home(){const ps=PROBLEMS.filter(p=>CAT.itens.some(i=>i.k.includes(p.id)));
 app.innerHTML=`<section class="band"><h2>Escolha o seu problema</h2><div class="grid">${ps.map(tile).join('')}</div></section>`;q.value='';scrollTo(0,0)}
function list(items,probId,shown){
 const more=items.length-shown;
 return items.slice(0,shown).map(i=>card(i,probId)).join('')+(more>0?`<button class="more" data-more="${probId||''}" data-shown="${shown}">Ver mais ${Math.min(more,PAGE)} de ${more} produtos</button>`:'')}
let lastItems=[];
function showProblem(p,extra){
 lastItems=CAT.itens.filter(i=>i.k.includes(p.id)).sort((a,b)=>tierOf(p,a)-tierOf(p,b)||byPref(a,b));
 app.innerHTML=`<section class="band"><button class="back" data-home>← Voltar</button>
 <div class="res-h"><h2>${p.label}</h2><span>${lastItems.length} produto(s) em estoque</span></div>
 ${gallery(p)}${p.dica?`<div class="box dica"><b>Dica:</b> ${p.dica}</div>`:''}<div id="list">${list(lastItems,p.id,PAGE)}</div>
 ${extra&&extra.length?`<h2>Talvez você procure</h2><div class="grid">${extra.map(tile).join('')}</div>`:''}</section>`;scrollTo(0,0)}
function showNames(items,text){
 lastItems=items;
 app.innerHTML=`<section class="band"><button class="back" data-home>← Voltar</button>
 <div class="res-h"><h2>Resultados para “${esc(text)}”</h2><span>${items.length} produto(s)</span></div><div id="list">${list(items,'',PAGE)}</div></section>`;scrollTo(0,0)}
function notFound(text){app.innerHTML=`<section class="band"><button class="back" data-home>← Voltar</button><div class="empty"><img src="mascote.png" alt="" onerror="this.remove()"><div><b>Não encontramos “${esc(text)}”.</b><br>Tente outras palavras, escolha um dos problemas na tela inicial ou fale com um de nossos vendedores — vamos te ajudar!</div></div></section>`}
function card(x,probId){
 const p=PB[probId]||PB[x.k[0]];const f=fichaOf(x.n);const u0=usage(x.n);const u={steps:f&&f.u?f.u:u0.steps,cuid:u0.cuid};
 const st=x.e<=3?`<span class="stock low">Últimas unidades</span>`:`<span class="stock ok">Em estoque</span>`;
 const yt='https://www.youtube.com/results?search_query='+encodeURIComponent('como usar '+x.n.replace(/\s-\s.*$/,''));
 const draw=p&&p.art?`<div class="ba"><figure>${art(p.art,false)}<figcaption>Antes</figcaption></figure><figure>${art(p.art,true)}<figcaption>Depois</figcaption></figure></div>`:`<div class="mas">${art(null,false,400,260)}<img src="mascote.png" alt="" onerror="this.remove()"></div>`;
 return `<article class="card"><div class="pic" data-cod="${x.c}"${f&&f.img?` data-img="${imgUrl(f.img)}"`:FOTOSITE[x.c]?` data-img="${SITE_IMG+FOTOSITE[x.c][0]}" data-site="1"`:''}>${draw}</div>
 <div><h3 class="name">${pretty(x.n)}</h3><div class="brand">${(()=>{const b=brandOf(x.n);return b[1]?`<span class="chip">${b[1]}</span>`:''})()}Cód. ${x.c} · ${esc(x.u)}</div>
 <div class="tagrow">${x.p>0?`<span class="price">${brl(x.p)}</span>`:`<span class="price ask">Consulte o preço</span>`}${st}</div>
 ${f?`<p class="serve"><b>Para que serve:</b> ${f.d}</p>`:''}<b>Como usar</b><ol>${u.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
 <div class="box warn"><b>Cuidados:</b> ${u.cuid} Siga sempre as instruções do rótulo.</div>
 <div class="acts"><a class="buy" href="${buyUrl(x)}" target="_blank" rel="noopener">🛒 Comprar no site</a><a class="video" href="${yt}" target="_blank" rel="noopener">▶ Ver vídeos de como usar</a></div></div></article>`}
/* link para a loja online (Tray): busca pelo nome do produto, sem marca/tamanho */
const LOJA='https://novaquimica.commercesuite.com.br';
let WF=null;
function buyUrl(x){if(FOTOSITE[x.c])return SITE_URL+FOTOSITE[x.c][1];
 /* fora do mapa: busca no site pela palavra mais rara do nome (a busca do site junta palavras com OU) */
 if(!WF){WF={};for(const y of CAT.itens)for(const w of new Set(normTxt(y.n).split(/[^A-Z0-9]+/)))WF[w]=(WF[w]||0)+1}
 const ws=normTxt(x.n).replace(/\s-\s.*$/,'').split(/[^A-Z0-9]+/).filter(w=>w.length>3&&!/\d/.test(w));
 const w=ws.sort((a,b)=>(WF[a]||0)-(WF[b]||0))[0]||'';
 return LOJA+'/loja/busca.php?loja=1292209&palavra_busca='+encodeURIComponent(w.toLowerCase())}
/* foto real do produto, se existir em fotos/CODIGO.jpg */
const imgUrl=u=>!u?'':u.replace(/^https?:\/\/spartanbrasil\.com\.br\/uploads\/produto\//,'/img/sp/').replace(/^https?:\/\/www\.startquimica\.com\.br\/storage\//,'/img/st/').replace(/^https?:\/\/audaxco\.com\/wp-content\/uploads\//,'/img/ax/');
function photos(root){root.querySelectorAll('.pic[data-cod]:not([data-done])').forEach(el=>{el.dataset.done=1;
 const show=(src,cap)=>{const img=new Image();img.onload=()=>{el.innerHTML='';img.alt='';img.className='photo';el.appendChild(img);if(cap){const c=document.createElement('small');c.className='cap';c.textContent=cap;el.appendChild(c)}};return img};
 const local=show(null);local.onerror=()=>{if(el.dataset.img){show(el.dataset.img,el.dataset.site?'':'Foto ilustrativa do fabricante').src=el.dataset.img}};local.src='fotos/'+el.dataset.cod+'.jpg'})}
new MutationObserver(()=>photos(app)).observe(app,{childList:true,subtree:true});

app.addEventListener('scroll',e=>{const t=e.target;if(!t.classList||!t.classList.contains('gal-track'))return;const i=Math.round(t.scrollLeft/t.clientWidth);t.parentNode.querySelectorAll('.gal-dots i').forEach((d,j)=>d.classList.toggle('on',j===i))},true);
app.addEventListener('click',e=>{
 const b=e.target.closest('[data-p]');if(b){const p=PB[b.dataset.p];showProblem(p,PROBLEMS.filter(o=>o.id!==p.id&&o.art===p.art).slice(0,3))}
 if(e.target.closest('[data-home]'))home();
 const m=e.target.closest('[data-more]');if(m){const n=+m.dataset.shown+PAGE;document.getElementById('list').innerHTML=list(lastItems,m.dataset.more,n)}
});
function logSearch(termo,resultado){try{if(!/^https:/.test(location.protocol)||/localhost|127\.0\.0\.1|claude/.test(location.hostname))return;fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'buscas',termo:String(termo).slice(0,120),resultado,origem:TV?'tv':'web'}).toString()}).catch(()=>{})}catch(e){}}
function doSearch(){kb.classList.remove('on');const t=q.value.trim();if(!t)return;
 const ps=findProblems(t);if(ps.length){logSearch(t,ps[0].id);showProblem(ps[0],ps.slice(1,4));return}
 const ns=findByName(t);logSearch(t,ns.length?'nome-produto':'NAO_ENCONTRADO');ns.length?showNames(ns,t):notFound(t)}
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();doSearch()});

/* ============ TECLADO NA TELA ============ */
const kb=document.getElementById('kb');
kb.innerHTML=['QWERTYUIOP','ASDFGHJKLÇ','ZXCVBNM'].map(r=>`<div>${[...r].map(k=>`<button type="button" data-k="${k}">${k}</button>`).join('')}</div>`).join('')+`<div><button type="button" class="w" data-k=" ">Espaço</button><button type="button" data-k="⌫">⌫</button><button type="button" class="w" data-k="OK" style="background:var(--red);color:#fff">Buscar</button></div>`;
kb.addEventListener('click',e=>{const k=e.target.dataset.k;if(!k)return;if(k==='⌫')q.value=q.value.slice(0,-1);else if(k==='OK')doSearch();else q.value+=k.toLowerCase()});
document.getElementById('kbt').addEventListener('click',()=>kb.classList.toggle('on'));
const TV=location.hash==='#tv';
q.addEventListener('focus',()=>{if(TV)kb.classList.add('on')});

/* ============ MODO TV: volta ao início após 60 s sem uso ============ */
if(TV){document.documentElement.classList.add('tv');let idle;const reset=()=>{clearTimeout(idle);idle=setTimeout(()=>{kb.classList.remove('on');home()},60000)};['click','touchstart','keydown','wheel'].forEach(ev=>addEventListener(ev,reset,{passive:true}));reset()}

/* ============ ÁREA DO GERENTE: toque 5x no logo ============ */
let taps=0,tt;const admin=document.getElementById('admin'),msg=document.getElementById('msg'),dl=document.getElementById('dl');
document.getElementById('logo').addEventListener('click',()=>{taps++;clearTimeout(tt);tt=setTimeout(()=>{if(taps<5)home();taps=0},600);if(taps>=5){admin.classList.add('on');taps=0;info()}});
document.getElementById('close').addEventListener('click',()=>admin.classList.remove('on'));
function info(){document.getElementById('cur').textContent=`Catálogo atual: ${CAT.itens.length} produtos${CAT.fonte?' — '+CAT.fonte:''}.`}
function loadXLSX(){return window.XLSX?Promise.resolve():new Promise((ok,err)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=ok;s.onerror=()=>err(new Error('Sem internet para ler a planilha.'));document.head.appendChild(s)})}
const col=(h,...names)=>h.findIndex(x=>names.some(n=>low(x).startsWith(low(n))));
document.getElementById('csv').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;msg.textContent='Lendo arquivo…';dl.hidden=true;
 try{
  let table;
  if(/\.xlsx?$/i.test(f.name)){await loadXLSX();const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
   for(const n of wb.SheetNames){const t=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true});const hi=t.findIndex(r=>r&&r.some(c=>low(c)==='produto'));if(hi>=0){table=t.slice(hi);break}}}
  else{const txt=await f.text();const sep=txt.split('\n')[0].includes(';')?';':',';table=txt.split(/\r?\n/).filter(Boolean).map(l=>l.split(sep).map(s=>s.replace(/"/g,'').trim()))}
  if(!table)throw new Error('Não achei a coluna "Produto" na planilha.');
  const h=table[0].map(String),num=v=>typeof v==='number'?v:parseFloat(String(v||'').replace(/\./g,'').replace(',','.'))||0;
  const iN=col(h,'Produto'),iC=col(h,'ID','Codigo','Código'),iS=col(h,'Saldo','Estoque'),iP=col(h,'Preço varejo','Preco varejo','Preço','Preco'),iU=col(h,'Un'),iV=col(h,'Vendido');
  if(iN<0){ // CSV simples codigo;preco;estoque
   let n=0;table.slice(1).forEach(r=>{const it=CAT.itens.find(i=>i.c===r[0]);if(it){it.p=num(r[1]);it.e=num(r[2]);n++}});CAT.itens=CAT.itens.filter(i=>i.e>0);CAT.ts=Date.now();
   msg.textContent=`${n} preço(s)/estoque(s) atualizado(s).`}
  else{
   const rows=table.slice(1).map(r=>({cod:r[iC],nome:r[iN],un:iU>=0?r[iU]:'UN',est:num(r[iS]),vend:iV>=0?num(r[iV]):0,preco:iP>=0?num(r[iP]):0}));
   const itens=buildCatalog(rows);if(!itens.length)throw new Error('Nenhum produto de limpeza com estoque encontrado.');
   CAT={ts:Date.now(),fonte:'Importado em '+new Date().toLocaleDateString('pt-BR'),itens};
   msg.textContent=`Pronto! ${itens.length} produtos com estoque carregados.`}
  try{localStorage.setItem('catalogo',JSON.stringify(CAT))}catch(e){}
  const blob=new Blob([JSON.stringify(CAT)],{type:'application/json'});dl.href=URL.createObjectURL(blob);dl.hidden=false;info();home();
 }catch(err){msg.textContent='Erro: '+err.message}
});

/* catálogo publicado no site (produtos.json) — usa se for mais novo */
fetch('produtos.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(c=>{if(c&&setCat(c,'site'))home()}).catch(()=>{});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
home();
