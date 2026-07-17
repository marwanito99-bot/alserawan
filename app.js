/* ===== MWM IMAGE LOADER ===== */
var MWM_IMG={'img-hero':'transport.jpg','img-crane':'crane.jpg','img-plane':'plane.jpg','img-airsea':'airsea.jpg','img-ship-aerial':'ship_aerial.jpg','img-jamil':'jamil.jpg','img-marwan':'marwan.jpg','img-mwm-hero':'untitled.jpg','img-motors-hero':'airsea2.jpg','img-equip-hero':'crane2.jpg','img-src-hero':'transport.jpg','img-wechat-qr':'qr.jpg','__IMG_LOGO':'logo.jpg','__IMG_TRANSPORT':'transport.jpg','__IMG_CRANE':'crane.jpg','__IMG_PLANE':'plane.jpg','__IMG_AIRSEA':'airsea.jpg','__IMG_AIRSEA2':'airsea2.jpg','__IMG_CRANE2':'crane2.jpg','__IMG_SHIP_AERIAL':'ship_aerial.jpg','__IMG_JAMIL':'jamil.jpg','__IMG_MARWAN':'marwan.jpg','__IMG_UNTITLED':'untitled.jpg','__IMG_QR':'qr.jpg','__IMG_LICENSE':'license.jpg','__IMG_INLINE':'inline.jpg','__IMG_WAQR':'waqr.jpg'};
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
var MWM_ROUTES={home:'',companies:'companies',aboutus:'about',services:'services',monitor:'tracking',feedback:'feedback',news:'news',careers:'careers',contact:'contact',mwm:'mwm-logistics',motors:'mwm-motors',equip:'mwm-equipments',sourcing:'sourcing'};
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
    var t=(it.title||'').replace(/<[^>]*>/g,'').trim();
    var src=it.source||'';var ago=it.pubDate?timeAgo(it.pubDate):'';
    h+='<a class="news-item" href="'+(it.link||'#')+'" target="_blank" rel="noopener">'
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
    {title:'Major ports report rising throughput on China–Gulf logistics corridor',source:'Trade Daily'},
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
function pcImgHTML(p){
  var src=pcImgSrc(p.img);
  if(src) return '<img src="'+src+'" alt="'+p.en+'" loading="lazy" onerror="this.parentNode.innerHTML=pcPhHTML()"/>';
  return pcPhHTML();
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
    h+='<div class="pc-card" onclick="pcOpen('+idx+')">'
      +'<div class="pc-img">'+(p.badge?'<div class="pc-badge">'+p.badge+'</div>':'')+pcImgHTML(p)+'</div>'
      +'<div class="pc-info"><div class="pc-model">'+p.model+'</div>'
      +'<div class="pc-name"><div class="pc-name-en">'+p.en+'</div><div class="pc-name-loc">'+(p.ar||'')+'</div></div></div></div>';
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
  alert('Company Profile PDF\n\nTo receive the full company profile, please contact us:\n\n📧 info.mwm@alserawan.com\n📱 +963 994 483 331 (UAE)\n💬 WeChat: wxid_xbg1ew2vblr812');
}





function toggleFaq(el){
  var item=el.parentElement;
  var allItems=document.querySelectorAll('.faq-item');
  allItems.forEach(function(i){if(i!==item)i.classList.remove('open')});
  item.classList.toggle('open');
}






// ═══ CONFIG ═══
var SHEET_CSV_URL='https://docs.google.com/spreadsheets/d/e/2PACX-1vSnWUeztrgT8MTiVVFZhVe0dVpcsyQXzHfS7H-DyN5GYSZ3GnCFJZCkJEflbLOyHA/pub?gid=1234438729&single=true&output=csv';
var PRODUCTS_CSV_URL='https://docs.google.com/spreadsheets/d/e/2PACX-1vSnWUeztrgT8MTiVVFZhVe0dVpcsyQXzHfS7H-DyN5GYSZ3GnCFJZCkJEflbLOyHA/pub?gid=1643766526&single=true&output=csv';

var STAGES=[
  {n:1,en:'Order Confirmed',ar:'تأكيد الطلب'},
  {n:2,en:'Supplier Assigned',ar:'تعيين المورد'},
  {n:3,en:'Manufacturing',ar:'قيد التصنيع'},
  {n:4,en:'Production Complete',ar:'انتهاء التصنيع'},
  {n:5,en:'Quality Inspection',ar:'فحص الجودة'},
  {n:6,en:'Warehouse Received',ar:'استلام المستودع'},
  {n:7,en:'Shipped',ar:'تم الشحن'},
  {n:8,en:'In Transit',ar:'في الطريق'},
  {n:9,en:'Customs Clearance',ar:'التخليص الجمركي'},
  {n:10,en:'Delivered',ar:'تم التسليم'}
];

function switchMon(p,btn){
  document.querySelectorAll('.mon-tab-btn').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('.mon-panel-box').forEach(function(x){x.classList.remove('active')});
  btn.classList.add('active');
  document.getElementById('mon-'+p).classList.add('active');
  if(p==='vessel'){ loadVesselMap(); }
}
function loadVesselMap(){
  if(window.__vfLoaded) return;
  window.__vfLoaded=true;
  var f=document.getElementById('vesselMapIframe');
  if(!f) return;
  // Primary: MarineTraffic live AIS embed (Gulf / UAE focus) - renders in-page, no redirect
  var MT='https://www.marinetraffic.com/en/ais/embed/zoom:7/centery:25.3/centerx:55.2/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false';
  f.src=MT;
  // Fallback chain: if MarineTraffic is blocked, try VesselFinder embed; if that fails too, show a tappable link
  var tries=0;
  function fallback(){
    tries++;
    if(tries===1){
      f.src='https://www.vesselfinder.com/aismap?zoom=7&lat=25.5&lon=55.3&names=true';
    } else {
      var box=document.getElementById('vesselMapFallback');
      f.style.display='none';
      box.style.display='flex';
      box.style.alignItems='center';
      box.style.justifyContent='center';
      box.style.width='100%';
      box.style.height='100%';
      box.innerHTML='<a href="https://www.vesselfinder.com/?lat=25.5&lon=55.3&zoom=7" target="_blank" rel="noopener" style="color:var(--lime,#ccfd1b);background:var(--dark2,#0a0f0f);text-decoration:none;font-weight:600;text-align:center;padding:1rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%">\uD83D\uDEA2 Open Live Vessel Map (AIS) &rarr;</a>';
    }
  }
  f.addEventListener('error',fallback);
  // Some embeds fail silently (no error event). Detect a blank iframe after 8s.
  setTimeout(function(){
    try{
      var doc=f.contentDocument||f.contentWindow.document;
      if(doc && doc.body && doc.body.innerHTML.trim()==='') fallback();
    }catch(e){ /* cross-origin = it loaded fine, do nothing */ }
  },8000);
}

document.addEventListener('DOMContentLoaded',function(){
  var inp=document.getElementById('trackInput');
  if(inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter')trackShipment()});
});

function fetchCSV(url){
  return fetch(url).then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.text();
  }).catch(function(){
    return fetch('https://corsproxy.io/?url='+encodeURIComponent(url)).then(function(r){return r.text()});
  });
}

function parseCSV(text){
  var lines=text.split('\n');
  if(lines.length<2) return[];
  var headers=parseCSVLine(lines[0]);
  var rows=[];
  for(var i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    var vals=parseCSVLine(lines[i]);
    var obj={};
    for(var j=0;j<headers.length;j++) obj[headers[j].trim()]=vals[j]?vals[j].trim():'';
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line){
  var result=[],current='',inQ=false;
  for(var i=0;i<line.length;i++){
    var c=line[i];
    if(c==='"'){if(inQ&&line[i+1]==='"'){current+='"';i++}else inQ=!inQ}
    else if(c===','&&!inQ){result.push(current);current=''}
    else current+=c;
  }
  result.push(current);
  return result;
}

function trackShipment(){
  var num=document.getElementById('trackInput').value.trim().toUpperCase();
  if(!num){alert('Please enter a tracking number');return}
  if(!num.startsWith('MWM-')) num='MWM-'+num;

  document.getElementById('result').classList.remove('show');
  document.getElementById('errorMsg').classList.remove('show');
  document.getElementById('loading').classList.add('show');

  fetchCSV(SHEET_CSV_URL).then(function(csv){
    var rows=parseCSV(csv);
    var shipment=null;
    for(var i=0;i<rows.length;i++){
      var row=rows[i];
      var trackVal='';
      var keys=Object.keys(row);
      for(var k=0;k<keys.length;k++){
        var key=keys[k].toLowerCase().trim();
        if(key.indexOf('tracking')>-1||key.indexOf('track')>-1){trackVal=row[keys[k]].trim().toUpperCase();break}
      }
      if(!trackVal&&keys.length>0) trackVal=row[keys[0]].trim().toUpperCase();
      if(trackVal===num){
        var v=Object.values(row);
        shipment={'Tracking #':v[0]||'','Client Name':v[1]||'','Company':v[2]||'','Email':v[3]||'','WhatsApp':v[4]||'','Order Description':v[5]||'','Container #':v[6]||'','Vessel Name':v[7]||'','Port From':v[8]||'','Port To':v[9]||'','Stage (1-10)':v[10]||'1','Last Update':v[11]||'','Notes':v[12]||'','Docs Link':v[13]||'','Total Amount':v[14]||'0','Currency':v[15]||'USD','Payment 1':v[16]||'','Payment 1 Date':v[17]||'','Payment 1 Status':v[18]||'','Payment 2':v[19]||'','Payment 2 Date':v[20]||'','Payment 2 Status':v[21]||'','Payment 3':v[22]||'','Payment 3 Date':v[23]||'','Payment 3 Status':v[24]||''};
        break;
      }
    }
    if(!shipment){
      document.getElementById('loading').classList.remove('show');
      var dbg='';
      if(rows.length>0){dbg='<br><br><small style="color:var(--muted)">Columns: '+Object.keys(rows[0]).join(', ')+'<br>First value: '+Object.values(rows[0])[0]+'<br>Rows: '+rows.length+'</small>'}
      document.getElementById('errorMsg').innerHTML='❌ Tracking number "<strong>'+num+'</strong>" not found.'+dbg;
      document.getElementById('errorMsg').classList.add('show');
      return;
    }
    fetchCSV(PRODUCTS_CSV_URL).then(function(pcsv){
      var allProds=parseCSV(pcsv);
      var prods=allProds.filter(function(p){
        var pTrack='';
        var pk=Object.keys(p);
        for(var k=0;k<pk.length;k++){if(pk[k].toLowerCase().indexOf('tracking')>-1){pTrack=p[pk[k]].trim().toUpperCase();break}}
        if(!pTrack&&pk.length>0) pTrack=p[pk[0]].trim().toUpperCase();
        return pTrack===num;
      });
      displayResult(shipment,prods);
    }).catch(function(){displayResult(shipment,[])});
  }).catch(function(err){
    document.getElementById('loading').classList.remove('show');
    document.getElementById('errorMsg').innerHTML='⚠️ Connection error: '+err.message+'<br><small>Try refreshing the page.</small>';
    document.getElementById('errorMsg').classList.add('show');
  });
}

function displayResult(s,products){
  document.getElementById('loading').classList.remove('show');
  var stage=parseInt(s['Stage (1-10)'])||1;
  var stN=STAGES[stage-1]?STAGES[stage-1].en:'Unknown';
  var stA=STAGES[stage-1]?STAGES[stage-1].ar:'';

  document.getElementById('resNum').textContent=s['Tracking #'];
  document.getElementById('resClient').textContent=s['Client Name'];
  document.getElementById('resCompany').textContent=s['Company'];
  document.getElementById('resStage').textContent=stN+' ('+stage+'/10)';
  document.getElementById('resUpdate').textContent='Last update: '+(s['Last Update']||'—');

  var tl=document.getElementById('timeline');tl.innerHTML='';
  for(var i=0;i<STAGES.length;i++){
    var st=STAGES[i];
    var cls=st.n<stage?'done':st.n===stage?'current':'pending';
    tl.innerHTML+='<div class="tl-step '+cls+'"><div class="tl-line"></div><div class="tl-dot">'+(st.n<=stage?'✓':st.n)+'</div><div class="tl-content"><div class="tl-name">'+st.en+'</div><div class="tl-name-ar">'+st.ar+'</div>'+(cls==='current'?'<div class="tl-badge">CURRENT STATUS</div>':'')+'</div></div>';
  }

  if(s['Order Description']){
    document.getElementById('orderDesc').textContent=s['Order Description'];
    document.getElementById('productsSection').style.display='block';
  }

  var tbody=document.getElementById('productsBody');tbody.innerHTML='';
  products.forEach(function(p){
    var v=Object.values(p);
    tbody.innerHTML+='<tr><td>'+(v[1]||'')+'</td><td class="qty">'+(v[2]||'')+'</td><td>'+(v[3]||'')+'</td><td>'+(v[4]||'')+'</td></tr>';
  });

  var total=parseFloat(s['Total Amount'])||0;
  if(total>0){
    var cur=s['Currency']||'USD';
    var pays=[];
    if(s['Payment 1'])pays.push({a:parseFloat(s['Payment 1']),d:s['Payment 1 Date'],s:s['Payment 1 Status']});
    if(s['Payment 2'])pays.push({a:parseFloat(s['Payment 2']),d:s['Payment 2 Date'],s:s['Payment 2 Status']});
    if(s['Payment 3'])pays.push({a:parseFloat(s['Payment 3']),d:s['Payment 3 Date'],s:s['Payment 3 Status']});
    var paid=pays.reduce(function(sum,p){return sum+(p.s==='PAID'?p.a:0)},0);
    var pct=Math.round(paid/total*100);
    var ph='<div class="payment-grid">';
    pays.forEach(function(p,i){
      var ip=p.s==='PAID';
      ph+='<div class="pay-row"><div class="pay-status '+(ip?'paid':'pending')+'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><path d="'+(ip?'M20 6L9 17l-5-5':'M12 8v4M12 16h.01')+'"/></svg></div><div class="pay-info"><div class="pay-label">Payment '+(i+1)+(ip?' — Paid':' — Pending')+'</div>'+(p.d?'<div class="pay-date">'+p.d+'</div>':'')+'</div><div class="pay-amount '+(ip?'paid':'pending')+'">'+cur+' '+p.a.toLocaleString()+'</div></div>';
    });
    ph+='</div><div class="pay-total"><div><div class="pay-total-label">Total</div></div><div class="pay-total-val">'+cur+' '+total.toLocaleString()+'</div></div>';
    ph+='<div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted);margin-top:.6rem"><span>Paid: '+cur+' '+paid.toLocaleString()+' ('+pct+'%)</span><span>Remaining: '+cur+' '+(total-paid).toLocaleString()+'</span></div>';
    ph+='<div class="pay-bar"><div class="pay-bar-fill" style="width:'+pct+'%"></div></div>';
    document.getElementById('paymentContent').innerHTML=ph;
    document.getElementById('paymentSection').style.display='block';
  }

  var cn=s['Container #'],vs=s['Vessel Name'],pf=s['Port From'],pt=s['Port To'];
  if(cn||vs||pf){
    var sh='';
    if(pf)sh+='<div class="si-item"><div class="si-label">Origin</div><div class="si-value">'+pf+'</div></div>';
    if(pt)sh+='<div class="si-item"><div class="si-label">Destination</div><div class="si-value">'+pt+'</div></div>';
    if(cn)sh+='<div class="si-item"><div class="si-label">Container</div><div class="si-value" style="font-weight:700;letter-spacing:.05em">'+cn+'</div></div>';
    if(vs)sh+='<div class="si-item"><div class="si-label">Vessel</div><div class="si-value">'+vs+'</div></div>';
    if(cn)sh+='<div class="si-map-btn"><a href="https://www.vesselfinder.com/?imo=0&name='+encodeURIComponent(vs||cn)+'" target="_blank">🗺️ VIEW ON LIVE MAP →</a></div>';
    document.getElementById('shippingInfo').innerHTML=sh;
    document.getElementById('shippingSection').style.display='block';
  }

  if(s['Notes']){document.getElementById('notesContent').textContent=s['Notes'];document.getElementById('notesSection').style.display='block'}

  document.getElementById('waLink').href='https://wa.me/963994483331?text=Hi MWM, help with '+s['Tracking #'];
  document.getElementById('emailLink').href='mailto:info.mwm@alserawan.com?subject=Shipment '+s['Tracking #'];
  document.getElementById('result').classList.add('show');
  document.getElementById('result').scrollIntoView({behavior:'smooth'});
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
