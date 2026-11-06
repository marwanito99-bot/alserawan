/* ═══════════════════════════════════════════════════════════════
   ALSERAWAN — enhance.js  (Nov 2026)
   Additive behaviour only; loads after app.js and never replaces it.
     1. Presence map  → renders into any  <section data-mx-presence>
     2. Services      → category filter + "discuss" actions on every .svc-tabs block
     3. Roots         → live "years since 1999" counter + reveal
   Texts use the site's own .en / .ar-t / .cn-t pattern, so the
   existing setLang() switches them with no extra code.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Contact constants (edit here only) ── */
  var WA_MAIN  = '971509537528';   // UAE · main entity — receives service enquiries
  var WA_SYRIA = '963994483331';   // Syria line
  var EMAIL    = 'info.mwm@alserawan.com';
  var WECHAT   = 'wxid_xbg1ew2vblr812';
  var ANCFZ    = 'https://eportal.ancfz.ae/verification?t=NTAwTk0wMEY3RjNsSzNRfHxUcmFkZUxpY2Vuc2U.KiXHcwYsn7l2uFvFPpv7AS';
  var FOUNDED  = 1999;

  var ROOT = (typeof SITE_ROOT !== 'undefined') ? SITE_ROOT : '';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function T(en, ar, cn){
    return '<span class="en">'+en+'</span><span class="ar-t">'+ar+'</span><span class="cn-t">'+(cn||en)+'</span>';
  }
  function lang(){
    var b = document.body.classList;
    return b.contains('ar') ? 'ar' : (b.contains('cn') ? 'cn' : 'en');
  }
  function visibleText(el){
    if(!el) return '';
    var cls = {en:'.en', ar:'.ar-t', cn:'.cn-t'}[lang()];
    var s = el.querySelector(cls) || el.querySelector('.en');
    return (s ? s.textContent : el.textContent).replace(/\s+/g,' ').trim();
  }
  function wa(num, text){ return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }

  var ICON = {
    arrow:'<svg class="mx-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>',
    mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
    pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/></svg>',
    phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.8 2z"/></svg>',
    shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
  };

  /* ═════════════════ 1. PRESENCE MAP ═════════════════ */
  // Equirectangular projection matching images/world-map.svg (1000 × 500)
  function P(lat, lon){ return [ +((lon+180)/360*1000).toFixed(2), +((90-lat)/180*500).toFixed(2) ]; }

  var OFFICES = [
    { id:'cn', code:'CN', ll:[29.3089,120.0750], tz:'Asia/Shanghai', utc:'UTC+8', lbl:'YIWU', sub:'CHINA · 义乌',
      tab:T('China','الصين','中国'),
      k:'China · Yiwu · 义乌',
      t:T('Yiwu. At the source.','يوو. من قلب السوق.','义乌，市场源头。'),
      d:T('Steps from the factories and the Yiwu International Trade Market — product search, supplier vetting, samples, quality control and export.',
          'على بُعد خطوات من المصانع ومن سوق يوو الدولي للتجارة — البحث عن المنتجات، وتقييم الموردين، والعينات، وفحص الجودة، والتصدير.',
          '毗邻工厂与义乌国际商贸城——产品寻源、供应商评估、样品、质检与出口。'),
      meta2:{ l:T('Coordinates','الإحداثيات','坐标'), v:'<span class="mx-coord">29.31° N · 120.08° E</span>' },
      addr:T('Room 301, No. 5, Building 9, Wuji Village, Futian Street, Yiwu, Zhejiang, China',
             'غرفة 301، رقم 5، مبنى 9، قرية وجي، شارع فوتيان، يوو، تشجيانغ، الصين',
             '浙江省金华市义乌市福田街道屋基村9幢5号301室') + '<small lang="zh">浙江省金华市义乌市福田街道屋基村9幢5号301室</small>',
      actions:[
        { href:'https://www.google.com/maps/search/?api=1&query=29.3089,120.0750', cls:'', icon:ICON.pin, txt:T('Open in Google Maps','افتح في خرائط Google','在谷歌地图中打开'), ext:true },
        { copy:WECHAT, cls:'ghost', icon:ICON.copy, txt:T('Copy WeChat ID','نسخ حساب WeChat','复制微信号') }
      ]},
    { id:'ae', code:'AE', ll:[25.4052,55.4433], tz:'Asia/Dubai', utc:'UTC+4', lbl:'UAE', sub:'MAIN ENTITY',
      tab:T('UAE','الإمارات','阿联酋'),
      k:'United Arab Emirates · Main entity',
      t:T('UAE. Where the group is anchored.','الإمارات. مقرّ الكيان الرئيسي.','阿联酋，集团主体所在。'),
      d:T('ALSERAWAN GROUP FZE LLC — the group’s main entity, licensed by ANCFZ, overseeing trade, sourcing and logistics across China, the Gulf and Syria.',
          'مجموعة السيروان م.م.ح / ذ.م.م — الكيان الرئيسي للمجموعة، مرخّصة من ANCFZ، وتدير التجارة والتوريد والخدمات اللوجستية بين الصين والخليج وسوريا.',
          'ALSERAWAN GROUP FZE LLC——集团主体公司，由 ANCFZ 颁发执照，统筹中国、海湾与叙利亚之间的贸易、采购与物流。'),
      meta2:{ l:T('Coordinates','الإحداثيات','坐标'), v:'<span class="mx-coord">25.41° N · 55.44° E</span>' },
      addr:T('CWS-1V-229745, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates',
             'CWS-1V-229745، الطابق 26، برج أمبر جم، شارع الشيخ خليفة، عجمان، الإمارات العربية المتحدة',
             '阿联酋 阿治曼 谢赫·哈利法街 琥珀宝石大厦 26楼 CWS-1V-229745'),
      actions:[
        { wa:WA_MAIN, msg:{en:'Hello ALSERAWAN GROUP team (UAE), I would like to get in touch.', ar:'مرحباً فريق مجموعة السيروان (الإمارات)، أودّ التواصل معكم.', cn:'您好，阿尔塞拉万集团（阿联酋）团队，我想与您联系。'},
          cls:'', icon:ICON.wa, txt:T('WhatsApp · +971 50 953 7528','واتساب · ‎+971 50 953 7528','WhatsApp · +971 50 953 7528'), ext:true },
        { href:ANCFZ, cls:'ghost', icon:ICON.shield, txt:T('Verify licence','تحقّق من الرخصة','验证执照'), ext:true }
      ]},
    { id:'sy', code:'SY', ll:[36.2021,37.1343], tz:'Asia/Damascus', utc:'UTC+3', lbl:'SYRIA', sub:'SINCE 1999',
      tab:T('Syria','سوريا','叙利亚'),
      k:'Syria · Our roots',
      t:T('Syria. Where it all began.','سوريا. حيث بدأت الحكاية.','叙利亚，一切的起点。'),
      d:T('Trading in Syria since 1999 — industrial equipment first; today sourcing, freight and delivery for Syrian importers, by sea through Latakia or overland from the Gulf.',
          'نتاجر في سوريا منذ 1999 — بدأنا بالمعدات الصناعية، واليوم نخدم المستوردين السوريين بالتوريد والشحن والتسليم، بحراً عبر ميناء اللاذقية أو براً من الخليج.',
          '自1999年起扎根叙利亚——从工业设备起步，如今为叙利亚进口商提供采购、货运与交付，经拉塔基亚港海运或经海湾陆运。'),
      meta2:{ l:T('Gateways','بوابات الدخول','入境通道'), v:'<span class="ci-v">'+T('Latakia · Land corridor','اللاذقية · الممر البري','拉塔基亚 · 陆路通道')+'</span>' },
      addr:null,
      actions:[
        { wa:WA_SYRIA, msg:{en:'Hello ALSERAWAN GROUP team (Syria), I would like to get in touch.', ar:'مرحباً فريق مجموعة السيروان (سوريا)، أودّ التواصل معكم.', cn:'您好，阿尔塞拉万集团（叙利亚）团队，我想与您联系。'},
          cls:'', icon:ICON.wa, txt:T('WhatsApp · +963 994 483 331','واتساب · ‎+963 994 483 331','WhatsApp · +963 994 483 331'), ext:true },
        { href:'tel:+963994483331', cls:'ghost', icon:ICON.phone, txt:T('Call','اتصال','致电') }
      ]},
    { id:'sa', code:'SA', ll:[24.7136,46.6753], tz:'Asia/Riyadh', utc:'UTC+3', lbl:'KSA', sub:'SOON', soon:true,
      tab:T('Saudi Arabia','السعودية','沙特'),
      k:'Kingdom of Saudi Arabia · Soon',
      t:T('Saudi Arabia. Coming soon.','السعودية. قريباً.','沙特阿拉伯，即将启航。'),
      d:T('The next link in our corridor — extending the China–Gulf route into the Kingdom.',
          'الحلقة التالية في ممرّنا التجاري — امتداد طريق الصين والخليج إلى المملكة.',
          '贸易走廊的下一环——将中国—海湾航线延伸至沙特。'),
      meta2:{ l:T('Status','الحالة','状态'), v:'<span class="ci-v">'+T('In preparation','قيد التحضير','筹备中')+'</span>' },
      addr:null,
      actions:[
        { wa:WA_MAIN, msg:{en:'Hello ALSERAWAN GROUP team, I am interested in your services in Saudi Arabia.', ar:'مرحباً فريق مجموعة السيروان، أنا مهتم بخدماتكم في المملكة العربية السعودية.', cn:'您好，阿尔塞拉万集团团队，我对贵司在沙特的服务感兴趣。'},
          cls:'', icon:ICON.wa, txt:T('Register your interest','سجّل اهتمامك','登记意向'), ext:true }
      ]}
  ];

  function buildPresence(host){
    var pts = {}; OFFICES.forEach(function(o){ pts[o.id] = P(o.ll[0], o.ll[1]); });
    var c=pts.cn, a=pts.ae, s=pts.sy, k=pts.sa;
    var rCnAe = 'M'+c[0]+' '+c[1]+' Q 745 126 '+a[0]+' '+a[1];
    var rAeSy = 'M'+a[0]+' '+a[1]+' Q 637 153 '+s[0]+' '+s[1];
    var rAeSa = 'M'+a[0]+' '+a[1]+' Q 642 189 '+k[0]+' '+k[1];
    var corridor = rCnAe + ' Q 637 153 '+s[0]+' '+s[1];

    // graticule every 10°
    var grat = '';
    for(var lon=-10; lon<=170; lon+=10){ var x=P(0,lon)[0]; grat += 'M'+x+' 0V500'; }
    for(var lat=-40; lat<=80; lat+=10){ var y=P(lat,0)[1]; grat += 'M450 '+y+'H1000'; }

    function node(o){
      var p = pts[o.id], anchor = (o.id==='sy'||o.id==='sa') ? 'end' : 'start';
      var dx = anchor==='end' ? -5 : 5;
      var dy = o.id==='sa' ? 8 : (o.id==='ae' ? 7 : -3);
      return '<g class="mx-node'+(o.soon?' soon':'')+'" data-k="'+o.id+'" transform="translate('+p[0]+' '+p[1]+')" tabindex="-1">'+
        '<circle class="mx-pulse" r="3"/><circle class="mx-ring" r="5"/><circle class="mx-dot" r="2.3"/>'+
        '<text class="mx-lbl" x="'+dx+'" y="'+dy+'" text-anchor="'+anchor+'">'+o.lbl+'</text>'+
        '<text class="mx-sub" x="'+dx+'" y="'+(dy+4.6)+'" text-anchor="'+anchor+'">'+o.sub+'</text></g>';
    }

    var ship = REDUCED ? '' :
      '<g><circle class="mx-ship-halo" r="2.6"><animateMotion dur="11s" repeatCount="indefinite" rotate="auto"><mpath href="#mxCorr"/></animateMotion></circle>'+
      '<circle class="mx-ship" r="1.1"><animateMotion dur="11s" repeatCount="indefinite" rotate="auto"><mpath href="#mxCorr"/></animateMotion></circle></g>';

    var tabs = OFFICES.map(function(o,i){
      return '<button class="mx-tab" role="tab" id="mxt-'+o.id+'" aria-controls="mxp-'+o.id+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'" data-k="'+o.id+'">'+
        '<span class="mx-tab-code">'+o.code+'</span>'+o.tab+(o.soon?' <span class="mx-soon">'+T('Soon','قريباً','即将')+'</span>':'')+'</button>';
    }).join('');

    var panels = OFFICES.map(function(o,i){
      var acts = o.actions.map(function(a){
        if(a.copy) return '<button type="button" class="mx-btn '+a.cls+'" data-copy="'+a.copy+'">'+a.icon+'<span class="mx-copy-l">'+a.txt+'</span></button>';
        var href = a.wa ? wa(a.wa, a.msg.en) : a.href;
        return '<a class="mx-btn '+a.cls+'" href="'+href+'"'+(a.wa?' data-wa="'+a.wa+'" data-msg=\''+JSON.stringify(a.msg).replace(/'/g,'&#39;')+'\'':'')+(a.ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+a.icon+a.txt+'</a>';
      }).join('');
      return '<div class="mx-panel'+(i===0?' on':'')+'" role="tabpanel" id="mxp-'+o.id+'" aria-labelledby="mxt-'+o.id+'"'+(i===0?'':' hidden')+'>'+
        '<div class="mx-panel-k">'+o.k+'</div>'+
        '<h3 class="mx-panel-t">'+o.t+'</h3>'+
        '<p class="mx-panel-d">'+o.d+'</p>'+
        '<div class="mx-meta">'+
          '<div><div class="ci-l">'+T('Local time','الوقت المحلي','当地时间')+'</div><div class="mx-clock" data-tz="'+o.tz+'">--:--</div><div class="mx-utc">'+o.utc+'</div></div>'+
          '<div><div class="ci-l">'+o.meta2.l+'</div>'+o.meta2.v+'</div>'+
        '</div>'+
        (o.addr ? '<div class="mx-addr">'+ICON.pin+'<div>'+o.addr+'</div></div>' : '')+
        '<div class="mx-actions">'+acts+'</div>'+
      '</div>';
    }).join('');

    host.innerHTML =
      '<div class="mx-pres-grid">'+
        '<div class="mx-pres-info">'+
          '<p class="sec-tag">'+T('Our Presence','حضورنا','业务布局')+'</p>'+
          '<h2 class="sec-h" id="mxPresH">'+T('Three Markets. <span class="ac">One Corridor.</span>','ثلاثة أسواق. <span class="ac">ممرّ واحد.</span>','三大市场，<span class="ac">一条走廊。</span>')+'</h2>'+
          '<p class="mx-pres-lead">'+T('From the factories of Yiwu to the Gulf and Syria — local presence, one connected route.','من مصانع يوو إلى الخليج وسوريا — حضور محلي، ومسار واحد مترابط.','从义乌工厂到海湾与叙利亚——立足当地，一路相连。')+'</p>'+
          '<div class="mx-tabs" role="tablist" aria-label="Offices">'+tabs+'</div>'+
          '<div class="mx-panels">'+panels+'</div>'+
        '</div>'+
        '<div class="mx-map">'+
          '<svg viewBox="561 93 318 159" preserveAspectRatio="xMidYMid meet" overflow="visible" role="img" aria-label="Map: Yiwu (China) to the UAE and Syria, Saudi Arabia coming soon">'+
            '<image href="'+ROOT+'images/world-map.svg" x="0" y="0" width="1000" height="500"/>'+
            '<path class="mx-grat" d="'+grat+'"/>'+
            '<path id="mxCorr" d="'+corridor+'" fill="none" stroke="none"/>'+
            '<path class="mx-route base" d="'+rCnAe+'"/>'+
            '<path class="mx-route base" d="'+rAeSy+'"/>'+
            '<path class="mx-route soon" d="'+rAeSa+'"/>'+
            '<path class="mx-route flow" data-r="cnae" d="'+rCnAe+'"/>'+
            '<path class="mx-route flow" data-r="aesy" d="'+rAeSy+'"/>'+
            '<path class="mx-route flow" data-r="aesa" d="'+rAeSa+'"/>'+
            ship +
            OFFICES.map(node).join('')+
          '</svg>'+
          '<div class="mx-map-legend" aria-hidden="true"><span><i></i>'+T('Active corridor','الممر الفعّال','运营走廊')+'</span><span><i class="d"></i>'+T('Coming soon','قريباً','即将开通')+'</span></div>'+
          '<div class="mx-map-cap" aria-hidden="true"><span>China → Gulf → Syria</span><span><b class="mx-idx">01</b> / 0'+OFFICES.length+'</span></div>'+
        '</div>'+
      '</div>';

    var ROUTES = { cn:['cnae','aesy'], ae:['cnae'], sy:['cnae','aesy'], sa:['cnae','aesa'] };

    function select(id, focus){
      host.querySelectorAll('.mx-tab').forEach(function(t){
        var on = t.getAttribute('data-k')===id;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        if(on && focus) t.focus();
      });
      host.querySelectorAll('.mx-panel').forEach(function(p){
        var on = p.id==='mxp-'+id; p.classList.toggle('on', on); if(on) p.removeAttribute('hidden'); else p.setAttribute('hidden','');
      });
      host.querySelectorAll('.mx-node').forEach(function(n){ n.classList.toggle('on', n.getAttribute('data-k')===id); });
      host.querySelectorAll('.mx-route.flow').forEach(function(r){ r.classList.toggle('on', ROUTES[id].indexOf(r.getAttribute('data-r'))>-1); });
      var idx = OFFICES.map(function(o){return o.id;}).indexOf(id)+1;
      var b = host.querySelector('.mx-idx'); if(b) b.textContent = '0'+idx;
    }

    host.addEventListener('click', function(e){
      var t = e.target.closest('.mx-tab, .mx-node');
      if(t){ select(t.getAttribute('data-k')); return; }
      var cp = e.target.closest('[data-copy]');
      if(cp){ copyText(cp.getAttribute('data-copy'), cp); return; }
      var w = e.target.closest('a[data-wa]');
      if(w){ try{ var m = JSON.parse(w.getAttribute('data-msg')); w.href = wa(w.getAttribute('data-wa'), m[lang()]||m.en); }catch(_){} }
    });
    host.querySelector('.mx-tabs').addEventListener('keydown', function(e){
      var ids = OFFICES.map(function(o){return o.id;});
      var cur = ids.indexOf(document.activeElement.getAttribute('data-k'));
      if(cur<0) return;
      var rtl = document.documentElement.dir==='rtl';
      var next = null;
      if(e.key==='ArrowRight') next = rtl ? cur-1 : cur+1;
      if(e.key==='ArrowLeft')  next = rtl ? cur+1 : cur-1;
      if(e.key==='Home') next = 0;
      if(e.key==='End') next = ids.length-1;
      if(next===null) return;
      e.preventDefault();
      next = (next+ids.length)%ids.length;
      select(ids[next], true);
    });

    select('cn');
    startClocks(host);
  }

  function startClocks(host){
    var clocks = host.querySelectorAll('.mx-clock');
    var fmts = {};
    function tick(){
      var now = new Date();
      clocks.forEach(function(el){
        var tz = el.getAttribute('data-tz'), hm;
        try{
          fmts[tz] = fmts[tz] || new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false});
          hm = fmts[tz].format(now);
        }catch(_){ hm = null; }
        if(!hm){ el.textContent='--:--'; return; }
        var p = hm.split(':');
        el.innerHTML = p[0]+'<span class="mx-colon">:</span>'+p[1];
      });
    }
    tick();
    setInterval(tick, 15000);
  }

  function copyText(txt, btn){
    function done(){
      var l = btn.querySelector('.mx-copy-l'); if(!l) return;
      var old = l.innerHTML;
      btn.classList.add('ok');
      l.innerHTML = T('Copied ✓','تم النسخ ✓','已复制 ✓');
      setTimeout(function(){ l.innerHTML = old; btn.classList.remove('ok'); }, 2200);
    }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else fallback();
    function fallback(){
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly','');
      ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); done(); }catch(_){ window.prompt('WeChat ID', txt); }
      document.body.removeChild(ta);
    }
  }

  /* ═════════════════ 2. SERVICES — filter + discuss ═════════════════ */
  // service number → category  (order matches the 10 panels on the site)
  var CAT = {1:'trade',2:'ops',3:'ops',4:'ops',5:'trade',6:'growth',7:'growth',8:'ops',9:'trade',10:'growth'};
  var CAT_LBL = {
    all:   T('All services','جميع الخدمات','全部服务'),
    trade: T('Sourcing & Trade','التوريد والتجارة','采购与贸易'),
    ops:   T('Freight & Operations','الشحن والعمليات','货运与运营'),
    growth:T('Business & Growth','الأعمال والنمو','商业与增长')
  };
  var MSG = {
    en:function(s){ return 'Hello ALSERAWAN GROUP team,\nI would like to discuss: “'+s+'”.\n\nRequest details:\n• Product / cargo: \n• Approx. quantity: \n• Destination country: \n\n(Sent from alserawan.com)'; },
    ar:function(s){ return 'مرحباً فريق مجموعة السيروان،\nأودّ مناقشة خدمة: «'+s+'».\n\nتفاصيل الطلب:\n• المنتج / الشحنة: \n• الكمية التقريبية: \n• بلد الوجهة: \n\n(أُرسلت من موقع alserawan.com)'; },
    cn:function(s){ return '您好，阿尔塞拉万集团团队：\n我想咨询服务：「'+s+'」。\n\n需求详情：\n• 产品／货物：\n• 大致数量：\n• 目的国家：\n\n（来自 alserawan.com）'; }
  };
  var SUBJ = {
    en:function(s){ return 'Service enquiry — '+s; },
    ar:function(s){ return 'استفسار عن خدمة — '+s; },
    cn:function(s){ return '服务咨询 — '+s; }
  };

  function enhanceServices(){
    document.querySelectorAll('.svc-tabs').forEach(function(tabsEl, block){
      if(tabsEl.getAttribute('data-mx')) return;
      tabsEl.setAttribute('data-mx','1');
      var container = tabsEl.parentElement;
      var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll('.svc-tab'));
      var panels = Array.prototype.slice.call(container.querySelectorAll('.svc-panel'));
      if(!tabs.length || tabs.length!==panels.length) return;

      tabsEl.setAttribute('role','tablist');
      tabsEl.setAttribute('aria-label','Services');
      tabs.forEach(function(t,i){
        var n=i+1, pid = panels[i].id || ('mx-svcp-'+block+'-'+n);
        panels[i].id = pid;
        t.id = t.id || ('mx-svct-'+block+'-'+n);
        t.setAttribute('role','tab');
        t.setAttribute('aria-controls', pid);
        t.setAttribute('aria-selected', t.classList.contains('active'));
        t.setAttribute('data-cat', CAT[n]);
        var title = panels[i].querySelector('.svc-panel-t');
        if(title){
          t.setAttribute('aria-label', 'Service '+(n<10?'0':'')+n+': '+title.querySelector('.en').textContent);
          // hover / focus tooltip in the active language (icon-only tabs gain a visible name)
          var g = function(c){ var e=title.querySelector(c); return e ? e.textContent : ''; };
          var tip = document.createElement('span');
          tip.className = 'mx-tip'; tip.setAttribute('aria-hidden','true');
          tip.innerHTML = T(g('.en'), g('.ar-t'), g('.cn-t'));
          t.appendChild(tip);
        }
      });

      panels.forEach(function(p,i){
        var n=i+1;
        p.setAttribute('role','tabpanel');
        p.setAttribute('aria-labelledby', tabs[i].id);
        var num = p.querySelector('.svc-panel-n');
        if(num && !num.querySelector('.mx-svc-cat')) num.insertAdjacentHTML('beforeend','<span class="mx-svc-cat">'+CAT_LBL[CAT[n]]+'</span>');
        p.insertAdjacentHTML('beforeend',
          '<div class="mx-svc-cta">'+
            '<a class="mx-btn" data-svc-wa href="https://wa.me/'+WA_MAIN+'" target="_blank" rel="noopener noreferrer">'+ICON.wa+T('Discuss your requirement','ناقش احتياجك معنا','咨询您的需求')+'</a>'+
            '<a class="mx-btn ghost" data-svc-mail href="mailto:'+EMAIL+'">'+ICON.mail+T('Email us','راسلنا بالبريد','发送邮件')+'</a>'+
            '<span class="mx-hint">'+T('Opens a pre-filled message — review it, then send.','تُفتح رسالة جاهزة باسم الخدمة — راجعها ثم أرسلها.','将打开已填写服务名称的消息——核对后发送。')+'</span>'+
          '</div>');
        p.addEventListener('click', function(e){
          var s = visibleText(p.querySelector('.svc-panel-t')), L = lang();
          var w = e.target.closest('[data-svc-wa]');
          if(w){ w.href = wa(WA_MAIN, MSG[L](s)); return; }
          var m = e.target.closest('[data-svc-mail]');
          if(m){ m.href = 'mailto:'+EMAIL+'?subject='+encodeURIComponent(SUBJ[L](s))+'&body='+encodeURIComponent(MSG[L](s)); }
        });
      });

      // filter chips
      var counts = {all:tabs.length, trade:0, ops:0, growth:0};
      tabs.forEach(function(t){ counts[t.getAttribute('data-cat')]++; });
      var bar = document.createElement('div');
      bar.className = 'mx-svc-filter';
      bar.setAttribute('role','group');
      bar.setAttribute('aria-label','Filter services by category');
      bar.innerHTML = ['all','trade','ops','growth'].map(function(c){
        return '<button type="button" class="mx-chip" data-cat="'+c+'" aria-pressed="'+(c==='all')+'">'+CAT_LBL[c]+'<span class="mx-chip-n">'+counts[c]+'</span></button>';
      }).join('');
      tabsEl.parentNode.insertBefore(bar, tabsEl);

      bar.addEventListener('click', function(e){
        var chip = e.target.closest('.mx-chip'); if(!chip) return;
        var cat = chip.getAttribute('data-cat');
        bar.querySelectorAll('.mx-chip').forEach(function(c){ c.setAttribute('aria-pressed', c===chip); });
        var firstVisible = null, activeVisible = false;
        tabs.forEach(function(t,i){
          var show = cat==='all' || t.getAttribute('data-cat')===cat;
          t.classList.toggle('mx-out', !show);
          t.classList.remove('mx-in');
          if(show){
            void t.offsetWidth; t.classList.add('mx-in');
            t.style.animationDelay = (REDUCED?0:(i%10)*35)+'ms';
            if(!firstVisible) firstVisible = {t:t,n:i+1};
            if(t.classList.contains('active')) activeVisible = true;
          }
        });
        if(!activeVisible && firstVisible && typeof window.showSvc==='function') window.showSvc(firstVisible.n, firstVisible.t);
      });
    });

    // keep aria-selected in sync with the site's own showSvc()
    if(typeof window.showSvc==='function' && !window.showSvc.__mx){
      var orig = window.showSvc;
      window.showSvc = function(n, btn){
        orig(n, btn);
        document.querySelectorAll('.svc-tabs[data-mx] .svc-tab').forEach(function(t){ t.setAttribute('aria-selected', t.classList.contains('active')); });
      };
      window.showSvc.__mx = true;
    }
  }

  /* ═════════════════ 3. ROOTS — years counter + reveal ═════════════════ */
  function enhanceRoots(){
    document.querySelectorAll('.mx-roots').forEach(function(sec){
      var years = new Date().getFullYear() - FOUNDED;
      var nEl = sec.querySelector('[data-mx-years]');
      if(nEl) nEl.textContent = years;
      function run(){
        sec.classList.add('mx-in');
        if(!nEl || REDUCED) return;
        var start = null, from = Math.max(0, years-12);
        function step(ts){
          if(!start) start = ts;
          var k = Math.min(1, (ts-start)/1400), e = 1-Math.pow(1-k,3);
          nEl.textContent = Math.round(from + (years-from)*e);
          if(k<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(es){
          es.forEach(function(en){ if(en.isIntersecting){ run(); io.disconnect(); } });
        },{threshold:.3});
        io.observe(sec);
      } else run();
    });
  }

  function init(){
    document.querySelectorAll('[data-mx-presence]').forEach(buildPresence);
    enhanceServices();
    enhanceRoots();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
