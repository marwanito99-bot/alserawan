/* ALSERAWAN network — sends website forms and tracking lookups straight to the
   management system (Supabase). Replaces the old Google Sheets / Apps Script flow.
   The key below is the public "publishable" key: it can only call the two
   public functions (submit_inquiry, track_shipment) and drop files into the
   private "inbound" folder. It cannot read any data. */
(function () {
  var API = 'https://unmrulhkxbosihzrqbhe.supabase.co';
  var KEY = 'sb_publishable_M2he5C7kBtgBslGrcV61lQ_Xir7lKcF';

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function safeName(n) { return (String(n || 'file').replace(/[^\w.\-]+/g, '_').slice(-120)) || 'file'; }
  function lang() { var b = document.body.classList; return b.contains('ar') ? 'ar' : b.contains('cn') ? 'cn' : 'en'; }

  /* Collect every named field; repeated names (country[]) are joined with ", " */
  function collect(form) {
    var out = {};
    new FormData(form).forEach(function (v, k) {
      if (typeof v !== 'string') return;           // files are sent separately
      k = k.replace(/\[\]$/, '');
      v = v.trim();
      if (!v) return;
      out[k] = out[k] ? out[k] + ', ' + v : v;
    });
    out.lang = lang();
    return out;
  }

  function rpc(fn, body) {
    return fetch(API + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) {
        if (!r.ok) { var e = new Error((j && j.message) || ('HTTP ' + r.status)); e.code = j && j.message; throw e; }
        return j;
      });
    });
  }

  function upload(file) {
    if (!file) return Promise.resolve(null);
    var path = 'web/' + uuid() + '/' + safeName(file.name);
    return fetch(API + '/storage/v1/object/inbound/' + path.split('/').map(encodeURIComponent).join('/'), {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' },
      body: file
    }).then(function (r) { return r.ok ? path : null; }).catch(function () { return null; });
  }

  /* files: [{ input: 'file-cr', label: 'Commercial registration', kind: 'cr' }, …] */
  function submit(kind, form, files) {
    var data = collect(form);
    var list = (files || []).map(function (f) {
      var el = typeof f.input === 'string' ? document.getElementById(f.input) : f.input;
      var file = el && el.files && el.files[0];
      return file ? { file: file, label: f.label, kind: f.kind } : null;
    }).filter(Boolean);
    return Promise.all(list.map(function (f) { return upload(f.file); })).then(function (paths) {
      var meta = [];
      paths.forEach(function (p, i) { if (p) meta.push({ path: p, name: list[i].file.name, label: list[i].label, kind: list[i].kind }); });
      return rpc('submit_inquiry', { p_kind: kind, p_data: data, p_files: meta }).then(function (res) {
        res = res || {};
        res.failedFiles = list.length - meta.length;
        return res;
      });
    });
  }

  var MSG = {
    rate_limited: { en: 'Too many submissions in a short time. Please try again in an hour, or message us on WhatsApp.', ar: 'تم إرسال طلبات كثيرة خلال وقت قصير. حاول بعد ساعة أو راسلنا على واتساب.', cn: '提交过于频繁，请一小时后再试，或通过WhatsApp联系我们。' },
    busy: { en: 'Our system is busy right now. Please try again in a few minutes.', ar: 'النظام مشغول حالياً. حاول بعد دقائق.', cn: '系统繁忙，请几分钟后再试。' },
    contact_required: { en: 'Please enter a valid WhatsApp number or email.', ar: 'يرجى إدخال رقم واتساب أو بريد إلكتروني صحيح.', cn: '请填写有效的WhatsApp号码或邮箱。' },
    name_required: { en: 'Please enter your name or company name.', ar: 'يرجى إدخال اسمك أو اسم الشركة.', cn: '请填写您的姓名或公司名称。' },
    other: { en: 'We could not send your form. Please check your connection and try again, or message us on WhatsApp +963 994 483 331.', ar: 'تعذر إرسال النموذج. تأكد من الاتصال وحاول مجدداً، أو راسلنا على واتساب ‎+963 994 483 331.', cn: '表单发送失败，请检查网络后重试，或通过WhatsApp +963 994 483 331联系我们。' }
  };
  function errorText(e) { var m = MSG[(e && e.code) || ''] || MSG.other; return m[lang()] || m.en; }

  /* Small banner showing the reference code on the success screen */
  function refHtml(code) {
    if (!code) return '';
    return '<div class="alsr-ref" style="margin:0 auto 1.6rem;max-width:420px;padding:1rem 1.2rem;border:1px solid var(--lime,#ccfd1b);background:rgba(204,253,27,.06)">' +
      '<div style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#9a9ab0);margin-bottom:.35rem">' +
      '<span class="en">Your reference number</span><span class="ar-t">رقمك المرجعي</span><span class="cn-t">您的参考编号</span></div>' +
      '<div style="font-family:Space Grotesk,monospace;font-size:1.5rem;font-weight:700;color:var(--lime,#ccfd1b);letter-spacing:.06em" dir="ltr">' + code + '</div>' +
      '<div style="font-size:.78rem;color:var(--muted,#9a9ab0);margin-top:.35rem"><span class="en">Keep it — mention it when you contact us.</span><span class="ar-t">احتفظ به واذكره عند تواصلك معنا.</span><span class="cn-t">请保存此编号，联系我们时请提供。</span></div></div>';
  }

  /* Hidden field that only bots fill in */
  function addHoneypot(form) {
    if (!form || form.querySelector('[name="hp"]')) return;
    var i = document.createElement('input');
    i.type = 'text'; i.name = 'hp'; i.tabIndex = -1; i.autocomplete = 'off';
    i.setAttribute('aria-hidden', 'true');
    i.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;opacity:0';
    form.appendChild(i);
  }
  document.addEventListener('DOMContentLoaded', function () { addHoneypot(document.getElementById('fw-form')); });

  function track(code, phone4) { return rpc('track_shipment', { p_code: code, p_phone4: phone4 || null }); }

  window.ALSR_NET = { submit: submit, track: track, errorText: errorText, refHtml: refHtml, lang: lang };
})();
