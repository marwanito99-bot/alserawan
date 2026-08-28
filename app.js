/* ===== SECURITY HELPERS =====
   All remote data (RSS feeds, Google-Sheets CSV) is untrusted and must be
   escaped before it touches innerHTML. esc() for text/attribute content,
   safeUrl() to block javascript:/data: URI injection in href/src. */
function esc(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
/* Allow http(s), protocol-relative, mailto/tel, anchors and ordinary relative
   paths. Block every other scheme (javascript:, data:, vbscript:, file: …).
   Bare relative paths such as "images/x.jpg" must pass: SITE_ROOT is "" on
   root-level pages, so a stricter prefix test would silently drop them. */
function safeUrl(u){
  u=String(u==null?'':u).trim();
  if(!u) return '#';
  if(/^(?:https?:\/\/|mailto:|tel:|#)/i.test(u)||u.slice(0,2)==='//') return esc(u);
  if(/^[a-z][a-z0-9+.-]*:/i.test(u)) return '#';
  return esc(u);
}

/* ===== MWM IMAGE LOADER ===== */
var MWM_IMG={'img-hero':'transport.jpg','img-crane':'crane.jpg','img-plane':'plane.jpg','img-airsea':'airsea.jpg','img-ship-aerial':'ship_aerial.jpg','img-jamil':'jamil.jpg','img-marwan':'marwan.jpg','img-mwm-hero':'untitled.jpg','img-motors-hero':'airsea2.jpg','img-equip-hero':'crane2.jpg','img-src-hero':'transport.jpg','img-wechat-qr':'qr.jpg','__IMG_LOGO':'logo-full.png','__IMG_LOGO_ICON':'logo-icon.png','__IMG_TRANSPORT':'transport.jpg','__IMG_CRANE':'crane.jpg','__IMG_PLANE':'plane.jpg','__IMG_AIRSEA':'airsea.jpg','__IMG_AIRSEA2':'airsea2.jpg','__IMG_CRANE2':'crane2.jpg','__IMG_SHIP_AERIAL':'ship_aerial.jpg','__IMG_JAMIL':'jamil.jpg','__IMG_MARWAN':'marwan.jpg','__IMG_UNTITLED':'untitled.jpg','__IMG_QR':'qr.jpg','__IMG_LICENSE':'license.jpg','__IMG_INLINE':'inline.jpg','__IMG_WAQR':'waqr.jpg'};
function mwmImgPath(f){var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';return root+'images/'+f;}
function mwmLoadImages(){
  var list=document.querySelectorAll('img[data-imgvar]');
  for(var i=0;i<list.length;i++){var v=list[i].getAttribute('data-imgvar');if(MWM_IMG[v])list[i].src=mwmImgPath(MWM_IMG[v]);}
  for(var key in MWM_IMG){
    if(key.indexOf('__IMG_')===0) continue;
    var pfxs=['','dup-','au-'];
    for(var j=0;j<pfxs.length;j++){
      var el=document.getElementById(pfxs[j]+key);
      if(el && !el.getAttribute('src')) el.src=mwmImgPath(MWM_IMG[key]);
    }
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mwmLoadImages);
else mwmLoadImages();

/* ===== SCROLL REVEAL ===== */
(function(){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'0px 0px -30px 0px'});

  function initReveal(){
    // Swap class name so CSS activates (prevents flash of invisible content)
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.add('reveal-ready'); io.observe(el);
    });
    document.querySelectorAll('.reveal-left').forEach(function(el){
      el.classList.add('reveal-left-ready'); io.observe(el);
    });
    document.querySelectorAll('.reveal-right').forEach(function(el){
      el.classList.add('reveal-right-ready'); io.observe(el);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initReveal);
  else initReveal();
  // Re-run when SPA page changes
  document.addEventListener('pagechange',function(){setTimeout(initReveal,50);});
})();

/* ===== STATS COUNTER ===== */
(function(){
  function countUp(el){
    var txt=el.textContent.trim();
    var suffix=txt.replace(/[\d.]/g,'');
    var num=parseFloat(txt);
    if(isNaN(num)) return;
    var duration=1400,steps=60,step=0;
    var timer=setInterval(function(){
      step++;
      var val=Math.round(num*(step/steps)*10)/10;
      el.textContent=(Number.isInteger(num)?Math.round(val):val)+suffix;
      if(step>=steps){el.textContent=txt;clearInterval(timer);}
    },duration/steps);
  }
  function initCounters(){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){countUp(e.target);io.unobserve(e.target);}
      });
    },{threshold:0.5});
    document.querySelectorAll('.stat-n').forEach(function(el){io.observe(el);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initCounters);
  else initCounters();
  document.addEventListener('pagechange',initCounters);
})();


function toggleNav(){
  var ham=document.getElementById('navHam');
  var links=document.getElementById('navLinks');
  if(!ham||!links) return;
  var open=ham.classList.toggle('open');
  links.classList.toggle('open',open);
  document.body.style.overflow=open?'hidden':'';
}
// Close nav on link click (mobile)
document.addEventListener('click',function(e){
  var links=document.getElementById('navLinks');
  var ham=document.getElementById('navHam');
  if(!links||!ham) return;
  if(links.classList.contains('open')&&e.target.closest('a')&&e.target.closest('#navLinks')){
    ham.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow='';
  }
});
function setLang(l){
  document.body.classList.remove('ar','cn');
  if(l==='ar') document.body.classList.add('ar');
  if(l==='cn') document.body.classList.add('cn');
  var btns=document.querySelectorAll('.lb');
  for(var i=0;i<btns.length;i++) btns[i].classList.remove('on');
  var idx={en:0,ar:1,cn:2}[l];
  if(btns[idx]) btns[idx].classList.add('on');
  document.documentElement.lang = l==='ar'?'ar':(l==='cn'?'zh':'en');
  document.documentElement.dir = l==='ar'?'rtl':'ltr';
  // نحفظ الاختيار ليبقى عبر الصفحات
  try{ localStorage.setItem('mwm_lang', l) }catch(e){}
}
/* استعادة اللغة المحفوظة عند تحميل أي صفحة */
(function(){
  function restore(){
    var l='en';
    try{ l=localStorage.getItem('mwm_lang')||'en' }catch(e){}
    if(l!=='en') setLang(l);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',restore);
  else restore();
})();
var MWM_ROUTES={home:'',companies:'companies',aboutus:'about',services:'services',monitor:'tracking',feedback:'feedback',news:'news',careers:'careers',contact:'contact',mwm:'mwm-logistics',motors:'mwm-motors',equip:'mwm-equipments',sourcing:'sourcing',logistics:'logistics'};
function show(id){
  var r=MWM_ROUTES[id];
  if(r===undefined) return;
  var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';
  window.location.href = root + (r?r+'/':'');
}
function goto(id){
  var el=document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth'}); return; }
  var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';
  window.location.href = root + '#' + id;
}
/* === AUTO SHIPPING NEWS (multi-source, 48h refresh) === */
var NEWS_SOURCES=[
  'https://splash247.com/feed/',
  'https://theloadstar.com/feed/',
  'https://gcaptain.com/feed/',
  'https://www.maritime-executive.com/articles.rss',
  'https://www.joc.com/rss.xml'
];
var NEWS_CACHE_KEY='mwm_news_v1';
var NEWS_TTL=48*60*60*1000; // 48 ساعة

function timeAgo(ds){
  try{var d=new Date(ds),s=Math.floor((Date.now()-d)/1000);
    if(s<3600)return Math.max(1,Math.floor(s/60))+'m ago';
    if(s<86400)return Math.floor(s/3600)+'h ago';
    return Math.floor(s/86400)+'d ago';}catch(e){return''}
}
function renderNews(items){
  var boxes=[document.getElementById('newsFeed'),document.getElementById('newsFeedPage')].filter(Boolean);
  if(!boxes.length)return;
  var box=boxes[0];
  if(!items||!items.length){return renderNewsFallback()}
  var h='';
  items.slice(0,5).forEach(function(it,i){
    var t=esc((it.title||'').replace(/<[^>]*>/g,'').trim());
    var src=esc(it.source||'');var ago=esc(it.pubDate?timeAgo(it.pubDate):'');
    h+='<a class="news-item" href="'+safeUrl(it.link)+'" target="_blank" rel="noopener noreferrer">'
      +'<div class="news-num">0'+(i+1)+'</div>'
      +'<div class="news-body"><div class="news-title">'+t+'</div>'
      +'<div class="news-meta">'+src+(ago?'  •  '+ago:'')+'</div></div>'
      +'<svg class="news-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>';
  });
  boxes.forEach(function(bx){bx.innerHTML=h});
}
function renderNewsFallback(){
  // محتوى احتياطي ثابت كي لا يظهر القسم فارغاً أبداً إن فشلت كل المصادر
  var fb=[
    {title:'Global container freight rates shift as carriers adjust capacity on key trade lanes',source:'Industry Wire'},
    {title:'Red Sea diversions continue to reshape Asia–Europe shipping schedules',source:'Maritime Brief'},
    {title:'Major ports report rising throughput on China–MENA logistics corridor',source:'Trade Daily'},
    {title:'Air cargo demand strengthens ahead of peak shipping season',source:'Cargo Watch'},
    {title:'Digitalization and live tracking become standard in modern freight forwarding',source:'Logistics Today'}
  ];
  var boxes=[document.getElementById('newsFeed'),document.getElementById('newsFeedPage')].filter(Boolean);
  if(!boxes.length)return;
  var h='';
  fb.forEach(function(it,i){
    h+='<a class="news-item" href="#" onclick="return false"><div class="news-num">0'+(i+1)+'</div>'
      +'<div class="news-body"><div class="news-title">'+it.title+'</div>'
      +'<div class="news-meta">'+it.source+'</div></div>'
      +'<svg class="news-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></a>';
  });
  boxes.forEach(function(bx){bx.innerHTML=h});
}
function loadNews(){
  // تحقّق من الكاش (48 ساعة)
  try{
    var c=JSON.parse(localStorage.getItem(NEWS_CACHE_KEY)||'null');
    if(c&&c.t&&(Date.now()-c.t)<NEWS_TTL&&c.items&&c.items.length){return renderNews(c.items)}
  }catch(e){}
  // جلب من عدة مصادر عبر وسيط RSS->JSON
  var collected=[],done=0,total=NEWS_SOURCES.length;
  NEWS_SOURCES.forEach(function(feed){
    var api='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(feed)+'&count=3';
    fetch(api).then(function(r){return r.json()}).then(function(j){
      if(j&&j.status==='ok'&&j.items){
        var sname=(j.feed&&j.feed.title)?j.feed.title:'';
        j.items.forEach(function(it){collected.push({title:it.title,link:it.link,pubDate:it.pubDate,source:sname})});
      }
    }).catch(function(){}).finally(function(){
      done++;
      if(done===total){
        // ترتيب حسب التاريخ تنازلياً، أحدث 5
        collected.sort(function(a,b){return new Date(b.pubDate||0)-new Date(a.pubDate||0)});
        var top=collected.slice(0,5);
        if(top.length){
          try{localStorage.setItem(NEWS_CACHE_KEY,JSON.stringify({t:Date.now(),items:top}))}catch(e){}
          renderNews(top);
        }else{renderNewsFallback()}
      }
    });
  });
  // أمان: إن لم يكتمل خلال 8 ثوانٍ، أظهر الاحتياطي
  setTimeout(function(){var b=document.getElementById('newsFeed')||document.getElementById('newsFeedPage');if(b&&b.querySelector('.news-loading'))renderNewsFallback()},8000);
}

function switchNews(p,btn){
  document.querySelectorAll('.news-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.news-panel').forEach(x=>x.classList.remove('active'));
  if(btn)btn.classList.add('active');
  var el=document.getElementById('news-'+p);
  if(el)el.classList.add('active');
  if(p==='global'&&typeof loadNews==='function')loadNews();
}
/* ============ MWM PRODUCTS CATALOGUE ENGINE ============ */
/* غيّر هذا الرابط برابط CSV المنشور من Google Sheet الخاص بك */
var PC_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTEYaED31Eun6Tnq8K9xoipYJO5oB_yF3NavzevBRfsFnXs7Y75xqVHP3JH0VbYw/pub?gid=572362026&single=true&output=csv';
var PC_PER_PAGE = 10;
var pcAll=[], pcView=[], pcCat='ALL', pcPage=1, pcLoaded=false;

function pcParseLine(line){
  var r=[],cur='',q=false;
  for(var i=0;i<line.length;i++){
    var c=line[i];
    if(c==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++} else q=!q }
    else if(c===','&&!q){ r.push(cur); cur='' }
    else cur+=c;
  }
  r.push(cur); return r;
}
function pcParseCSV(text){
  text=text.replace(/\r/g,'');
  var rows=[],cur='',q=false,line=[];
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(c==='"'){ if(q&&text[i+1]==='"'){cur+='"';i++} else q=!q; }
    else if(c===','&&!q){ line.push(cur); cur=''; }
    else if(c==='\n'&&!q){ line.push(cur); rows.push(line); line=[]; cur=''; }
    else cur+=c;
  }
  if(cur||line.length){ line.push(cur); rows.push(line); }
  return rows;
}
function pcFetch(url){
  return fetch(url).then(function(r){ if(!r.ok)throw 0; return r.text(); })
    .catch(function(){ return fetch('https://corsproxy.io/?'+encodeURIComponent(url)).then(function(r){return r.text()}) });
}
function pcNorm(s){ return (s||'').trim() }

function pcLoad(){
  if(pcLoaded) return;
  if(PC_CSV_URL.indexOf('PASTE_YOUR')===0){ pcRenderDemo(); return; }
  pcLoaded=true;
  pcFetch(PC_CSV_URL).then(function(txt){
    var rows=pcParseCSV(txt);
    // نبحث عن صف العناوين (فيه Model)
    var hi=-1;
    for(var i=0;i<Math.min(5,rows.length);i++){
      if(rows[i].some(function(c){return pcNorm(c).toLowerCase()==='model'})){ hi=i; break }
    }
    if(hi<0){ pcRenderDemo(); return; }
    var H=rows[hi].map(function(c){return pcNorm(c).toLowerCase()});
    function col(name){ return H.indexOf(name.toLowerCase()) }
    var iM=col('Model'), iC=col('Category'), iS=col('Status'), iO=col('Order'),
        iEN=col('Name EN'), iAR=col('Name AR'), iCN=col('Name CN'), iB=col('Badge'),
        iD=col('Short Desc EN'), iImg=col('Image URL'), iI2=col('Image 2'), iI3=col('Image 3'),
        iW=col('Warranty'), iP=col('Price');
    var feats=[col('Feature 1'),col('Feature 2'),col('Feature 3'),col('Feature 4')];
    var specs=[];
    for(var k=1;k<=6;k++) specs.push([col('Spec '+k+' Name'), col('Spec '+k+' Value')]);
    pcAll=[];
    for(var r=hi+1;r<rows.length;r++){
      var v=rows[r];
      if(!v||!pcNorm(v[iM])) continue;
      var st=pcNorm(v[iS]).toLowerCase();
      if(st==='hidden') continue;
      // تجاهل صف الأسماء العربية المساعدة
      if(pcNorm(v[iM])==='الموديل'||st==='الحالة') continue;
      // تجاهل أي صف بلا اسم إنجليزي (صف مساعد أو فارغ)
      if(!pcNorm(v[iEN])||pcNorm(v[iEN])==='الاسم إنجليزي') continue;
      var o={ model:pcNorm(v[iM]), cat:pcNorm(v[iC]), order:parseInt(pcNorm(v[iO]))||999,
        en:pcNorm(v[iEN]), ar:pcNorm(v[iAR]), cn:pcNorm(v[iCN]), badge:pcNorm(v[iB]),
        desc:iD>=0?pcNorm(v[iD]):'', img:iImg>=0?pcNorm(v[iImg]):'',
        img2:iI2>=0?pcNorm(v[iI2]):'', img3:iI3>=0?pcNorm(v[iI3]):'',
        warr:iW>=0?pcNorm(v[iW]):'', price:iP>=0?pcNorm(v[iP]):'',
        feats:[], specs:[] };
      feats.forEach(function(fi){ if(fi>=0&&pcNorm(v[fi])) o.feats.push(pcNorm(v[fi])) });
      specs.forEach(function(sp){ if(sp[0]>=0&&pcNorm(v[sp[0]])) o.specs.push([pcNorm(v[sp[0]]), pcNorm(v[sp[1]])]) });
      pcAll.push(o);
    }
    pcAll.sort(function(a,b){return a.order-b.order});
    pcBuildCats(); pcFilter();
  }).catch(function(){ pcLoaded=false; pcRenderDemo(); });
}

function pcRenderDemo(){
  var g=document.getElementById('pcGrid');
  if(g) g.innerHTML='<div class="pc-empty"><span class="en">Product catalogue is being updated. Please contact us for the latest range.</span><span class="ar-t">يجري تحديث كتالوج المنتجات. تواصل معنا لأحدث التشكيلة.</span><span class="cn-t">产品目录正在更新中，请联系我们获取最新系列。</span><br><br><a class="pc-ask" href="mailto:info.mwm@alserawan.com?subject=Product%20Enquiry">Contact Us →</a></div>';
  var c=document.getElementById('pcCount'); if(c) c.textContent='';
  var p=document.getElementById('pcPager'); if(p) p.innerHTML='';
}
function pcBuildCats(){
  var box=document.getElementById('pcCats'); if(!box) return;
  var cats={}; pcAll.forEach(function(p){ if(p.cat) cats[p.cat]=(cats[p.cat]||0)+1 });
  var h='<button class="pc-cat active" onclick="pcSetCat(\'ALL\',this)"><span class="en">All Products</span><span class="ar-t">كل المنتجات</span><span class="cn-t">全部产品</span><span class="pc-cat-n">'+pcAll.length+'</span></button>';
  Object.keys(cats).forEach(function(c){
    h+='<button class="pc-cat" onclick="pcSetCat('+JSON.stringify(c).replace(/"/g,'&quot;')+',this)">'+c+'<span class="pc-cat-n">'+cats[c]+'</span></button>';
  });
  box.innerHTML=h;
}
function pcSetCat(c,btn){
  pcCat=c; pcPage=1;
  document.querySelectorAll('.pc-cat').forEach(function(b){b.classList.remove('active')});
  if(btn) btn.classList.add('active');
  pcFilter();
}
function pcFilter(){
  var q=(document.getElementById('pcSearch')||{}).value||'';
  q=q.toLowerCase().trim();
  pcView=pcAll.filter(function(p){
    if(pcCat!=='ALL'&&p.cat!==pcCat) return false;
    if(!q) return true;
    return (p.model+' '+p.en+' '+p.ar+' '+p.cn).toLowerCase().indexOf(q)>=0;
  });
  pcPage=1; pcRender();
}
function pcImgSrc(p){
  var u=(p||'').trim();
  if(!u) return '';
  // رابط خارجي كامل — نتركه كما هو
  if(/^(https?:)?\/\//i.test(u)||u.indexOf('data:')===0) return u;
  // مسار مطلق من جذر الموقع
  if(u.charAt(0)==='/') return u;
  // مسار نسبي (images/x.jpg) — نضيف جذر الموقع ليعمل من أي صفحة
  var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';
  return root+u;
}
/* Local convention: model "MWM-CI20" is stored as images/ci20.jpg .
   Used as a fallback when the sheet's Image URL is empty or fails to load
   (external shops such as supplyvan.com block hotlinking, and Google Drive
   share links never render inside <img>). */
/* GitHub Pages serves from Linux, so image paths are case-SENSITIVE:
   images/CD20.jpg and images/cd20.jpg are different files. This repo contains
   both conventions (rh2600.jpg lowercase, CD20.jpg uppercase), so every
   candidate is tried in both cases rather than assuming one. */
function pcLocalImg(model){
  var m=(model||'').trim().replace(/^mwm[-_\s]*/i,'').replace(/[^A-Za-z0-9._-]/g,'');
  if(!m) return [];
  var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';
  var out=[], seen={};
  [m.toLowerCase(), m.toUpperCase(), m].forEach(function(v){
    var u=root+'images/'+v+'.jpg';
    if(!seen[u]){ seen[u]=1; out.push(u) }
  });
  return out;
}

/* Ordered candidate list -> first one that loads wins, else placeholder. */
function pcImgCandidates(p){
  var out=[], seen={};
  function add(u){ if(u&&!seen[u]){seen[u]=1;out.push(u)} }
  add(pcImgSrc(p.img));
  pcLocalImg(p.model).forEach(add);
  add(pcImgSrc(p.img2));
  add(pcImgSrc(p.img3));
  return out;
}

/* Called from the inline onerror; walks to the next candidate. */
function pcImgFallback(el){
  var list;
  try{ list=JSON.parse(el.getAttribute('data-alt')||'[]') }catch(e){ list=[] }
  if(list.length){
    var next=list.shift();
    el.setAttribute('data-alt',JSON.stringify(list));
    el.src=next;
    return;
  }
  el.onerror=null;
  if(el.parentNode) el.parentNode.innerHTML=pcPhHTML();
}

function pcImgHTML(p){
  var c=pcImgCandidates(p);
  if(!c.length) return pcPhHTML();
  var first=c[0], rest=c.slice(1);
  return '<img src="'+safeUrl(first)+'" alt="'+esc(p.en)+'" loading="lazy" decoding="async"'
       + ' data-alt="'+esc(JSON.stringify(rest))+'"'
       + ' onerror="pcImgFallback(this)"/>';
}
function pcPhHTML(){
  return '<div class="pc-img-ph"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>MWM</div>';
}
function pcRender(){
  var g=document.getElementById('pcGrid'); if(!g) return;
  var total=pcView.length, pages=Math.max(1,Math.ceil(total/PC_PER_PAGE));
  if(pcPage>pages) pcPage=pages;
  var s=(pcPage-1)*PC_PER_PAGE, items=pcView.slice(s,s+PC_PER_PAGE);
  if(!total){ g.innerHTML='<div class="pc-empty"><span class="en">No products found.</span><span class="ar-t">لا توجد منتجات.</span><span class="cn-t">未找到产品。</span></div>';
    document.getElementById('pcPager').innerHTML=''; document.getElementById('pcCount').textContent=''; return; }
  var h='';
  items.forEach(function(p,i){
    var idx=pcAll.indexOf(p);
    h+='<div class="pc-card" role="button" tabindex="0" onclick="pcOpen('+idx+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();pcOpen('+idx+')}">'
      +'<div class="pc-img">'+(p.badge?'<div class="pc-badge">'+esc(p.badge)+'</div>':'')+pcImgHTML(p)+'</div>'
      +'<div class="pc-info"><div class="pc-model">'+esc(p.model)+'</div>'
      +'<div class="pc-name"><div class="pc-name-en">'+esc(p.en)+'</div><div class="pc-name-loc">'+esc(p.ar||'')+'</div></div></div></div>';
  });
  g.innerHTML=h;
  var c=document.getElementById('pcCount');
  if(c) c.innerHTML='<b>'+total+'</b> products · page '+pcPage+'/'+pages;
  pcPager(pages);
}
function pcPager(pages){
  var box=document.getElementById('pcPager'); if(!box) return;
  if(pages<=1){ box.innerHTML=''; return }
  var h='<button class="pc-pg" onclick="pcGo('+(pcPage-1)+')" '+(pcPage===1?'disabled':'')+'>‹</button>';
  var st=Math.max(1,pcPage-2), en=Math.min(pages,st+4);
  if(en-st<4) st=Math.max(1,en-4);
  if(st>1) h+='<button class="pc-pg" onclick="pcGo(1)">1</button>'+(st>2?'<span style="color:var(--muted)">…</span>':'');
  for(var i=st;i<=en;i++) h+='<button class="pc-pg'+(i===pcPage?' active':'')+'" onclick="pcGo('+i+')">'+i+'</button>';
  if(en<pages) h+=(en<pages-1?'<span style="color:var(--muted)">…</span>':'')+'<button class="pc-pg" onclick="pcGo('+pages+')">'+pages+'</button>';
  h+='<button class="pc-pg" onclick="pcGo('+(pcPage+1)+')" '+(pcPage===pages?'disabled':'')+'>›</button>';
  box.innerHTML=h;
}
function pcGo(n){
  pcPage=n; pcRender();
  var s=document.getElementById('pc-section');
  if(s && s.scrollIntoView) try{ s.scrollIntoView({behavior:'smooth',block:'start'}) }catch(e){}
}
function pcOpen(i){
  var p=pcAll[i]; if(!p) return;
  var feats=p.feats.map(function(f){return '<li>'+f+'</li>'}).join('');
  var specs=p.specs.map(function(s){return '<tr><td>'+s[0]+'</td><td>'+s[1]+'</td></tr>'}).join('');
  var subj=encodeURIComponent('Product Enquiry - '+p.model+' ('+p.en+')');
  var h='<button class="pc-close" onclick="pcCloseModal()">×</button>'
    +'<div class="pc-box-top"><div class="pc-box-img">'+(pcImgSrc(p.img)?'<img src="'+pcImgSrc(p.img)+'" alt="'+p.en+'"/>':pcPhHTML())+'</div>'
    +'<div class="pc-box-info"><div class="pc-box-model">'+p.model+'</div>'
    +'<div class="pc-box-name">'+p.en+'</div>'
    +'<div class="pc-box-loc">'+(p.ar||'')+(p.cn?' · '+p.cn:'')+'</div>'
    +(p.desc?'<div style="font-size:.78rem;color:var(--muted);line-height:1.7">'+p.desc+'</div>':'')
    +(feats?'<div class="pc-box-lbl"><span class="en">Key Features</span><span class="ar-t">المميزات</span><span class="cn-t">主要特点</span></div><ul class="pc-feat">'+feats+'</ul>':'')
    +'</div></div>'
    +(specs?'<div style="padding:0 1.8rem 1.5rem"><div class="pc-box-lbl"><span class="en">Specifications</span><span class="ar-t">المواصفات</span><span class="cn-t">技术参数</span></div><table class="pc-spec">'+specs+'</table></div>':'')
    +'<div class="pc-box-bot"><a class="pc-ask" href="mailto:info.mwm@alserawan.com?subject='+subj+'"><span class="en">Enquire About This Product →</span><span class="ar-t">استفسر عن هذا المنتج ←</span><span class="cn-t">咨询此产品 →</span></a>'
    +(p.warr?'<span class="pc-warr">✓ '+p.warr+' warranty</span>':'')+'</div>';
  document.getElementById('pcBox').innerHTML=h;
  document.getElementById('pcModal').classList.add('on');
  document.body.style.overflow='hidden';
}
function pcCloseModal(){
  document.getElementById('pcModal').classList.remove('on');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') pcCloseModal() });

function showSvc(n,btn){
  // نطاق العمل: الصفحة الحالية فقط (home أو صفحة services المستقلة)
  var scope=btn?btn.closest('.pg')||document:document;
  scope.querySelectorAll('.svc-tab').forEach(function(t){t.classList.remove('active')});
  scope.querySelectorAll('.svc-panel').forEach(function(p){p.classList.remove('active')});
  if(btn)btn.classList.add('active');
  var tabs=Array.prototype.slice.call(scope.querySelectorAll('.svc-tab'));
  var panels=Array.prototype.slice.call(scope.querySelectorAll('.svc-panel'));
  if(panels[n-1])panels[n-1].classList.add('active');
}
function jumpSvc(n){
  document.querySelectorAll('.svc-num-btn').forEach((b,i)=>b.classList.toggle('active',i===n-1));
  var tabs=document.querySelectorAll('.svc-tab');
  if(tabs[n-1]) showSvc(n,tabs[n-1]);
  var tw=document.getElementById('services');
  if(tw) tw.scrollIntoView({behavior:'smooth',block:'start'});
}
function dlProfile(e){
  e.preventDefault();
  alert('Company Profile PDF\n\nTo receive the full company profile, please contact us:\n\n📧 info.mwm@alserawan.com\n📱 +963 994 483 331\n💬 WeChat: wxid_xbg1ew2vblr812');
}





function toggleFaq(el){
  var item=el.parentElement;
  var allItems=document.querySelectorAll('.faq-item');
  allItems.forEach(function(i){if(i!==item)i.classList.remove('open')});
  item.classList.toggle('open');
}







/* ===== Inline image hardening: load large base64 via JS window vars ===== */



/* ===== MWM PAGE AUTO-INIT ===== */
(function(){
  function init(){
    var p=(typeof CURRENT_PAGE!=='undefined')?CURRENT_PAGE:'';
    // الأخبار: صفحة news و sourcing
    if((p==='news'||p==='sourcing') && typeof loadNews==='function') loadNews();
    // المنتجات: صفحة equip
    if(p==='equip' && typeof pcLoad==='function') pcLoad();
    // خريطة السفن: تُحمّل عند فتح تبويبها فقط (switchMon)
    // التمرير للقسم من الهاش (#services من صفحة أخرى)
    if(window.location.hash){
      var el=document.getElementById(window.location.hash.slice(1));
      if(el) setTimeout(function(){el.scrollIntoView({behavior:'smooth'})},300);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

/* ── Page exit fade ── */
(function(){
  function isInternal(a){
    if(!a||!a.href) return false;
    var attr=a.getAttribute('href')||'';
    if(!attr||attr.startsWith('#')||attr.startsWith('javascript')||attr.startsWith('mailto')||attr.startsWith('tel')) return false;
    if(a.target==='_blank') return false;
    try{ if(new URL(a.href).hostname!==location.hostname) return false; }catch(e){ return false; }
    return true;
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');
    if(!isInternal(a)) return;
    e.preventDefault();
    var dest=a.href;
    document.body.classList.add('page-leaving');
    setTimeout(function(){window.location.href=dest;},130);
  },true);

  var _show=window.show;
  window.show=function(id){
    document.body.classList.add('page-leaving');
    setTimeout(function(){_show&&_show(id);},130);
  };

  /* Fix bfcache black screen: when browser restores page from cache, clear leaving state */
  window.addEventListener('pageshow',function(e){
    document.body.classList.remove('page-leaving');
    document.body.style.opacity='1';
  });
}());

/* ── Global back button (all sub-pages) ── */
(function(){
  function injectBackBtn(){
    var path=location.pathname.replace(/\/$/,'');
    if(path===''||path==='/index.html') return; // homepage — no button

    var root=(typeof SITE_ROOT!=='undefined')?SITE_ROOT:'';

    var btn=document.createElement('button');
    btn.id='globalBack';
    btn.setAttribute('aria-label','Go back');
    btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg><span class="en">Back</span><span class="ar-t">رجوع</span>';
    btn.onclick=function(){
      if(history.length>1){ document.body.classList.add('page-leaving'); setTimeout(function(){history.back();},130); }
      else{ document.body.classList.add('page-leaving'); setTimeout(function(){window.location.href=root||'/';},130); }
    };
    document.body.appendChild(btn);
  }

  var style=document.createElement('style');
  style.textContent='#globalBack{position:fixed;left:1.2rem;top:82px;z-index:199;display:flex;align-items:center;gap:7px;padding:0 14px 0 10px;height:38px;border-radius:50px;background:rgba(13,13,24,.9);border:1px solid rgba(29,0,244,.35);color:rgba(240,237,230,.75);cursor:pointer;font-family:"Space Grotesk","IBM Plex Sans Arabic",sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:all .25s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 18px rgba(0,0,0,.5);white-space:nowrap}#globalBack svg{flex-shrink:0;transition:transform .25s cubic-bezier(.22,1,.36,1)}#globalBack:hover{background:rgba(29,0,244,.2);border-color:rgba(204,253,27,.5);color:#ccfd1b;box-shadow:0 6px 28px rgba(29,0,244,.25)}#globalBack:hover svg{transform:translateX(-3px)}body.ar #globalBack{left:auto;right:1.2rem;flex-direction:row-reverse}body.ar #globalBack:hover svg{transform:translateX(3px)}@media(max-width:768px){#globalBack{top:76px;left:.8rem;height:34px;padding:0 10px 0 8px;font-size:.6rem}body.ar #globalBack{left:auto;right:.8rem}}';
  document.head.appendChild(style);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectBackBtn);
  else injectBackBtn();
}());

/* Certificate / license image lightbox — lets visitors view the full-size,
   full-resolution document (mobile shows it too small to read otherwise). */
(function(){
  function init(){
    var imgs=document.querySelectorAll('.cert-img');
    if(!imgs.length) return;

    /* Mobile only: wrap each inline cert image in a fixed-box container
       and rotate the image 90° inside it by default (no tap needed).
       The wrapper reserves the POST-rotation footprint (tall box); the
       img keeps its natural landscape box and is absolutely centred +
       rotated inside it, so the page layout never overlaps. Desktop DOM
       and styling are untouched. */
    if(window.matchMedia('(max-width:600px)').matches){
      imgs.forEach(function(img){
        if(img.closest('.cert-img-wrap')) return;
        var wrap=document.createElement('div');
        wrap.className='cert-img-wrap';
        img.parentNode.insertBefore(wrap,img);
        wrap.appendChild(img);
      });
    }

    var style=document.createElement('style');
    style.textContent='.cert-img{cursor:zoom-in}'
      +'.cert-lb{position:fixed;inset:0;z-index:999;display:none;align-items:center;justify-content:center;background:rgba(6,6,10,.94);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:2.5rem 1.2rem;box-sizing:border-box}'
      +'.cert-lb.open{display:flex}'
      +'.cert-lb img{max-width:min(94vw,900px);max-height:86vh;width:auto;height:auto;object-fit:contain;border:1px solid rgba(255,255,255,.15);background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.6)}'
      +'.cert-lb-close{position:absolute;top:1.1rem;right:1.2rem;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}'
      +'.cert-lb-close svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.3}'
      +'.cert-lb-hint{position:absolute;bottom:1.4rem;left:0;right:0;text-align:center;color:rgba(240,237,230,.6);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-family:"Space Grotesk","IBM Plex Sans Arabic",sans-serif}'
      /* Mobile only: certificate is landscape, so it's rotated 90° both
         inline (default, no tap) and in the lightbox (on tap) — this lets
         it use the phone's full screen height instead of a narrow strip.
         Desktop keeps the original non-rotated rules above. */
      +'@media(max-width:600px){'
      +'.cert-img-wrap{position:relative;width:min(80vw,300px);aspect-ratio:565/800;margin:0 auto 1.5rem}'
      +'.cert-img-wrap .cert-img{position:absolute;top:50%;left:50%;width:calc(min(80vw,300px) * 800 / 565);max-width:none;height:auto;transform:translate(-50%,-50%) rotate(90deg);margin:0}'
      +'.cert-lb{padding:0}'
      +'.cert-lb img{transform:rotate(90deg);max-height:90vw;max-width:88vh;border-width:1px}'
      +'}';
    document.head.appendChild(style);

    var lb=document.createElement('div');
    lb.className='cert-lb';
    lb.innerHTML='<button class="cert-lb-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button><img alt=""><div class="cert-lb-hint">Tap anywhere to close</div>';
    document.body.appendChild(lb);
    var lbImg=lb.querySelector('img');

    function open(src,alt){
      lbImg.src=src;
      lbImg.alt=alt||'';
      lb.classList.add('open');
      document.body.style.overflow='hidden';
    }
    function close(){
      lb.classList.remove('open');
      document.body.style.overflow='';
    }
    lb.addEventListener('click',close);
    lb.querySelector('img').addEventListener('click',function(e){e.stopPropagation();});
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });

    imgs.forEach(function(img){
      img.addEventListener('click',function(){ open(img.currentSrc||img.src, img.alt); });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}());
