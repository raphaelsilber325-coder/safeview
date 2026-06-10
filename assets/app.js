/* ===== SafeView — Shared App Logic ===== */

// ===== הגדרת מספר וואטסאפ =====
// פורמט בינלאומי ללא + וללא 0 בהתחלה. 0586343786 → 972586343786
var WA_NUMBER = '972586343786';
var STORE_EMAIL = 'info@safeview.co.il';
var FREE_SHIP_THRESHOLD = 200;

function waLink(text) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
}

// ===== קטלוג המוצרים =====
var PRODUCTS = [
  { id:'solar-20mp', name:'מצלמת אבטחה סולארית 20MP | 360° | 4G | IP66', price:399, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8924d13a697e4df5908c2861b8f886b9p.webp?v=1780222611',
    desc:'מצלמת אבטחה סולארית מתקדמת עם חיבור 4G ישיר — ללא חשמל, ללא WiFi, ללא חיווט. מתקינים בכל מקום ומגינים על הבית או העסק 24/7.',
    specs:[['רזולוציה','20MP'],['חיבור','4G + SIM'],['סוללה','12000mAh'],['זווית','360° סיבוב אוטומטי'],['ראיית לילה','צבעונית מלאה'],['עמידות','IP66']] },
  { id:'baseus-s1', name:'מצלמת אבטחה סולארית Baseus S1 Lite | 2K | IP67', price:229, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb99a1e51ba0546c293772a41243fa232M.webp?v=1780222614',
    desc:'מצלמת אבטחה סולארית מהמותג המוערך Baseus. רזולוציית 2K, זווית רחבה 135°, ועמידות IP67 — העמידות הגבוהה בקטגוריה.',
    specs:[['מותג','Baseus'],['רזולוציה','2K Ultra HD'],['זווית','135°'],['עמידות','IP67'],['הספק','סולארי + סוללה'],['חיבור','WiFi']] },
  { id:'solar-3mp', name:'מצלמת אבטחה סולארית חיצונית 3MP | זיהוי AI | IP65', price:99, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S11c4aabf01be4261982b94a7be532532H.webp?v=1780222615',
    desc:'מצלמה סולארית עם זיהוי בני אדם חכם (לא התראות שווא מחתולים), ראיית לילה צבעונית ושמע דו-כיווני. חיסכון מלא בחשמל.',
    specs:[['רזולוציה','3MP HD+'],['זיהוי AI','בני אדם'],['הספק','סולארי'],['עמידות','IP65'],['תקשורת','דו-כיוונית'],['חיבור','WiFi']] },
  { id:'indoor-2k', name:'מצלמת אבטחה פנימית 2K | AI + שיחה דו-כיוונית | Blurams', price:45, badge:'אינדור', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M.webp?v=1780222612',
    desc:'מצלמת אבטחה פנימית עם בינה מלאכותית — מזהה אנשים וחיות מחמד. שיחה דו-כיוונית בלחיצה אחת. מושלם למשפחות ולחיות מחמד.',
    specs:[['רזולוציה','2K Ultra HD'],['חיבור','WiFi'],['שמע','דו-כיווני'],['ראיית לילה','צבעונית'],['תאימות','Alexa / Google'],['אחסון','ענן + SD']] },
  { id:'flagship-16mp', name:'מצלמת אבטחה חיצונית 16MP 8K | 360° | 4 עדשות', price:359, badge:'פלאגשיפ', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
    desc:'המצלמה המתקדמת ביותר שלנו — 16MP, 8K אמיתי, 4 עדשות שמסתובבות 360°, זום 10x וזיהוי AI. מערכת אבטחה מקצועית בקופסה אחת.',
    specs:[['רזולוציה','16MP / 8K'],['עדשות','4 עצמאיות'],['זווית','360°'],['זום','דיגיטלי 10x'],['AI','זיהוי תנועה ובני אדם'],['חיבור','WiFi']] },
  { id:'wifi-dual', name:'מצלמת WiFi חיצונית | עדשה כפולה 3MP | ICSee', price:69, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saa99283cf09d4592a7c33ced52d81019B.webp?v=1780222614',
    desc:'מצלמה חיצונית עם עדשה כפולה — תצוגה רחבה וזום במקביל. תמונה חדה של 3MP, עמידות מלאה למזג אוויר, אפליקציית ICSee היציבה.',
    specs:[['רזולוציה','3MP (2304×1296)'],['עדשות','כפולות'],['חיבור','WiFi'],['אפליקציה','ICSee'],['עמידות','Waterproof'],['אחסון','כרטיס SD']] },
  { id:'wifi-ir', name:'מצלמת אבטחה WiFi | אינפרא-אדום | Smart Home', price:35, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9a4b640268a140399e446738c30b95d4p.webp?v=1780222615',
    desc:'מצלמת WiFi קומפקטית עם ראיית לילה אינפרא-אדומה — הדרך הזולה להתחיל לאבטח. התקנה ב-3 דקות וצפייה מרחוק מכל מקום.',
    specs:[['ראיית לילה','אינפרא-אדום'],['חיבור','WiFi'],['זיהוי','תנועה'],['צפייה','מרחוק'],['תיאום','Smart Home']] },
  { id:'mini-1080', name:'מצלמת מיני אלחוטית 1080P | ראיית לילה', price:39, badge:'מיני', cat:'מיני',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S68e20b3917ca422eb8255d53f414f757F.webp?v=1780222612',
    desc:'מצלמת מיני קטנה ודיסקרטית באיכות Full HD 1080P. ראיית לילה, זיהוי תנועה, מתחבאת בקלות. מושלם לבייביסיטר ולחיות מחמד.',
    specs:[['רזולוציה','1080P Full HD'],['חיבור','WiFi'],['ראיית לילה','אינפרא-אדום'],['זיהוי','תנועה אוטומטי'],['חיבור חשמל','USB']] },
  { id:'mini-4k', name:'מצלמת מיני 4K WiFi | ניטור פנימי חכם', price:29, badge:'מיני', cat:'מיני',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S92a865b3286d42b8b447e7f041978ca6b.webp?v=1780222616',
    desc:'מצלמת המיני הקטנה והזולה ביותר — איכות 4K, ניידת לחלוטין, גישה מרחוק מהפלאפון. אבטחה דיסקרטית במחיר מנצח.',
    specs:[['רזולוציה','4K HD'],['חיבור','WiFi'],['גודל','מיני'],['צפייה','מרחוק'],['תיאום','Smart Home']] }
];

function getProduct(id){ return PRODUCTS.filter(function(p){ return p.id === id; })[0]; }
function fmt(n){ return '₪' + Number(n).toLocaleString('he-IL'); }

// ===== עגלה (localStorage) =====
function getCart(){ try { return JSON.parse(localStorage.getItem('sv_cart') || '[]'); } catch(e){ return []; } }
function saveCart(c){ localStorage.setItem('sv_cart', JSON.stringify(c)); updateCartCount(); }
function cartCount(){ return getCart().reduce(function(s,i){ return s + i.qty; }, 0); }
function cartTotal(){ return getCart().reduce(function(s,i){ var p=getProduct(i.id); return s + (p ? p.price*i.qty : 0); }, 0); }
function addToCart(id, qty){
  qty = qty || 1;
  var c = getCart();
  var found = c.filter(function(i){ return i.id===id; })[0];
  if (found) found.qty += qty; else c.push({ id:id, qty:qty });
  saveCart(c);
  toast('✓ נוסף לעגלה');
}
function setQty(id, qty){
  var c = getCart().map(function(i){ if(i.id===id) i.qty = Math.max(1, qty); return i; });
  saveCart(c);
}
function removeFromCart(id){ saveCart(getCart().filter(function(i){ return i.id!==id; })); }
function updateCartCount(){
  document.querySelectorAll('.nav-cart-count').forEach(function(el){
    var n = cartCount(); el.textContent = n; el.style.display = n>0 ? 'flex' : 'none';
  });
}

// צ'קאאוט דרך וואטסאפ — שולח את כל ההזמנה
function checkoutWhatsApp(){
  var c = getCart();
  if (!c.length){ alert('העגלה ריקה'); return; }
  var lines = ['שלום SafeView!אני רוצה להזמין:', ''];
  c.forEach(function(i){ var p=getProduct(i.id); if(p) lines.push('• ' + p.name + ' × ' + i.qty + ' = ' + fmt(p.price*i.qty)); });
  lines.push(''); lines.push('סה"כ: ' + fmt(cartTotal()));
  var ship = cartTotal() >= FREE_SHIP_THRESHOLD ? 'משלוח חינם 🎉' : 'בתוספת משלוח';
  lines.push('(' + ship + ')');
  window.open(waLink(lines.join('\n')), '_blank');
}

// ===== Toast =====
function toast(msg){
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:90px;left:24px;background:#25D366;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.3);animation:fadeUp .3s ease;';
  document.body.appendChild(t);
  setTimeout(function(){ t.style.transition='opacity .3s'; t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 300); }, 1800);
}

// ===== SVG icons =====
var ICON = {
  wa: '<svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-1.8c1.9 1 4 1.6 6 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3z"/></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM6.2 4l.9 2H21l-3 7H8.5l-.6 1.3c-.1.3 0 .7.4.7H19v2H8.3c-1.5 0-2.5-1.6-1.8-3l1-2L4.3 4H2V2h3.6l.6 2z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm-1 13l5-5-1.4-1.4L11 12.2 9.4 10.6 8 12l3 3z"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M3 4h12v9H3zM15 7h4l3 4v4h-2a2 2 0 11-4 0H9a2 2 0 11-4 0H3v-2h12V7zm2 2v2h3.2L18.8 9H17z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 011 1v12a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><path d="M12 1a5 5 0 00-5 5v3H5v13h14V9h-2V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z"/></svg>',
  building: '<svg viewBox="0 0 24 24"><path d="M5 3h9v18H5zM16 8h3v13h-3zM7 6h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm4-8h1v2h-1zm0 4h1v2h-1z"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM20 5h-3l-2-2H9L7 5H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z"/></svg>',
  brand: '<svg viewBox="0 0 32 32"><path d="M16 3l11 4v8.4c0 6.8-4.6 12.9-11 14.6-6.4-1.7-11-7.8-11-14.6V7l11-4z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10.5 16.5l3.8 3.8 7.3-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>',
  access: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M19 8h-5v13a1 1 0 11-2 0v-6h-1v6a1 1 0 11-2 0V8H4a1 1 0 110-2h15a1 1 0 110 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 4v10h16V8l-8 5-8-5zm0-2l8 5 8-5H4z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1l-2.25 2.2z"/></svg>'
};

// ===== SEO meta הזרקה אוטומטית (canonical, og:url, og:image, twitter card) =====
var OG_IMAGE_DEFAULT = 'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615';
function injectSeoMeta(){
  var head = document.head;
  function add(tag, attrs){
    // אם תג עם המאפיין הזה כבר קיים — דלג
    var sel = tag + Object.keys(attrs).filter(function(k){return k!=='content';}).map(function(k){return '['+k+'="'+attrs[k]+'"]';}).join('');
    if (document.querySelector(sel)) return;
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function(k){ el.setAttribute(k, attrs[k]); });
    head.appendChild(el);
  }
  var url = location.href.split('#')[0];
  add('link', { rel:'canonical', href: url });
  add('meta', { property:'og:url', content: url });
  add('meta', { property:'og:site_name', content: 'SafeView' });
  add('meta', { property:'og:locale', content: 'he_IL' });
  if (!document.querySelector('meta[property="og:image"]')) {
    add('meta', { property:'og:image', content: OG_IMAGE_DEFAULT });
  }
  add('meta', { name:'twitter:card', content: 'summary_large_image' });
  add('meta', { name:'twitter:title', content: document.title });
  var desc = document.querySelector('meta[name="description"]');
  if (desc) add('meta', { name:'twitter:description', content: desc.getAttribute('content') });
  add('meta', { name:'twitter:image', content: OG_IMAGE_DEFAULT });
  add('meta', { name:'theme-color', content: '#080a0f' });
  add('link', { rel:'manifest', href:'manifest.json' });
}

// ===== Service Worker (PWA) =====
function registerSW(){
  if (!('serviceWorker' in navigator)) return;
  // הימנע מ-SW בפיתוח מקומי (file://)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){ /* בשקט */ });
  });
}

// ===== Header / Footer הזרקה =====
function injectChrome(active){
  var navLinks = [
    ['index.html#products','מוצרים'],
    ['index.html#categories','קטגוריות'],
    ['compare.html','השוואה'],
    ['blog.html','מדריכים'],
    ['about.html','אודות'],
    ['faq.html','שאלות נפוצות'],
    ['contact.html','צור קשר']
  ];
  var navHtml =
    '<nav>' +
      '<a href="index.html" class="nav-logo" dir="ltr"><span class="nav-logo-icon">' + ICON.brand + '</span>Safe<span>View</span></a>' +
      '<div class="nav-right">' +
        '<ul class="nav-links" id="navLinks">' +
          navLinks.map(function(l){ return '<li><a href="'+l[0]+'">'+l[1]+'</a></li>'; }).join('') +
        '</ul>' +
        '<a href="cart.html" class="nav-cart" aria-label="עגלה">' + ICON.cart + '<span class="nav-cart-count">0</span></a>' +
        '<button class="nav-burger" id="burger" aria-label="תפריט"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</nav>';

  var footerHtml =
    '<footer>' +
      '<div class="footer-top">' +
        '<div class="footer-brand">' +
          '<div class="footer-logo" dir="ltr">Safe<span>View</span></div>' +
          '<p>חנות מצלמות האבטחה החכמות של ישראל. מצלמות סולאריות, פנימיות וחיצוניות עם אחריות מלאה ותמיכה בעברית.</p>' +
        '</div>' +
        '<div class="footer-col"><h4>חנות</h4>' +
          '<a href="index.html#products">כל המצלמות</a><a href="index.html#categories">קטגוריות</a><a href="index.html#bundles">חבילות במבצע</a><a href="cart.html">עגלת קניות</a></div>' +
        '<div class="footer-col"><h4>מידע</h4>' +
          '<a href="about.html">אודות</a><a href="blog.html">מדריכים</a><a href="faq.html">שאלות נפוצות</a><a href="contact.html">צור קשר</a></div>' +
        '<div class="footer-col"><h4>מדיניות</h4>' +
          '<a href="shipping.html">משלוחים</a><a href="returns.html">החזרות</a><a href="privacy.html">פרטיות</a><a href="terms.html">תקנון</a></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>© 2026 SafeView. כל הזכויות שמורות.</span><span>נבנה באהבה בישראל 🇮🇱</span></div>' +
    '</footer>';

  var waHtml = '<a class="wa-float" id="waFloat" href="'+waLink('שלום SafeView! אני מעוניין/ת בייעוץ לבחירת מצלמת אבטחה.')+'" target="_blank" rel="noopener" aria-label="וואטסאפ">'+ICON.wa+'</a>';

  var a11yHtml =
    '<button class="a11y-float" id="a11yFloat" aria-label="תפריט נגישות" aria-haspopup="dialog" aria-expanded="false">'+ICON.access+'</button>' +
    '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-labelledby="a11yPanelTitle" aria-hidden="true">' +
      '<div class="a11y-head"><span id="a11yPanelTitle">תפריט נגישות</span><button class="a11y-close" id="a11yClose" aria-label="סגור">×</button></div>' +
      '<button class="a11y-opt" data-act="font-up"><span>הגדל גודל טקסט</span><strong>+A</strong></button>' +
      '<button class="a11y-opt" data-act="font-down"><span>הקטן גודל טקסט</span><strong>−A</strong></button>' +
      '<button class="a11y-opt" data-act="contrast"><span>ניגודיות גבוהה</span><strong>◐</strong></button>' +
      '<button class="a11y-opt" data-act="links"><span>הדגשת קישורים</span><strong>U</strong></button>' +
      '<button class="a11y-opt" data-act="motion"><span>צמצום אנימציות</span><strong>⏸</strong></button>' +
      '<button class="a11y-opt a11y-reset" data-act="reset"><span>איפוס</span><strong>↺</strong></button>' +
      '<div class="a11y-foot">הצהרת נגישות: האתר נבנה לפי תקן <strong>WCAG 2.1 AA</strong>. בעיה? <a href="contact.html">צרו קשר</a></div>' +
    '</div>';

  // Skip link: על לחיצה — נמצא את התוכן הראשי הראשון אחרי הנאב, נגלול אליו ונמקד
  var skipHtml = '<a href="#main" class="skip-link" id="skipLink">דלג לתוכן הראשי</a>';
  var shipBarHtml = '<div class="ship-bar" id="shipBar">משלוח חינם בכל הזמנה מעל <strong>₪200</strong> · אחריות מלאה לשנה · תמיכה בעברית</div>';
  var navMount = document.getElementById('nav-mount');
  var footMount = document.getElementById('footer-mount');
  if (navMount) navMount.outerHTML = skipHtml + shipBarHtml + navHtml;
  if (footMount) footMount.outerHTML = footerHtml + waHtml + a11yHtml;

  // skip link — מוצא את התוכן הראשי ומסמן אותו
  var skip = document.getElementById('skipLink');
  if (skip){
    skip.addEventListener('click', function(e){
      e.preventDefault();
      var target = document.querySelector('section, .page-head, .pdp, .cart-wrap, .content');
      if (target){
        if (!target.id) target.id = 'main';
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  }

  // נגישות — טעינה + handlers
  initA11y();

  // burger
  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function(){ document.getElementById('navLinks').classList.toggle('open'); });
  document.querySelectorAll('#navLinks a').forEach(function(a){ a.addEventListener('click', function(){ document.getElementById('navLinks').classList.remove('open'); }); });
  updateCartCount();
}

// ===== Scroll reveal =====
function initReveal(){
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function(e){ io.observe(e); });
}

// ===== FAQ accordion =====
function initFaq(){
  document.querySelectorAll('.faq-q').forEach(function(q){
    if (q.dataset.bound === '1') return; // מונע האזנה כפולה
    q.dataset.bound = '1';
    q.setAttribute('aria-expanded', 'false');
    q.setAttribute('type', 'button');
    q.addEventListener('click', function(){
      var item = q.parentElement;
      var a = item.querySelector('.faq-a');
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });
}

// ===== נגישות (a11y) =====
// העדפות נשמרות ב-localStorage ומוחלות גם בטעינה מחודשת.
var A11Y_KEY = 'sv_a11y';
function getA11y(){ try { return JSON.parse(localStorage.getItem(A11Y_KEY) || '{}'); } catch(e){ return {}; } }
function saveA11y(s){ localStorage.setItem(A11Y_KEY, JSON.stringify(s)); applyA11y(s); }
function applyA11y(s){
  var html = document.documentElement;
  // גודל טקסט: מיושם דרך data-font + CSS zoom (פועל גם על px)
  var step = Math.max(-2, Math.min(4, s.font || 0));
  if (step === 0) html.removeAttribute('data-font');
  else html.setAttribute('data-font', String(step));
  html.classList.toggle('a11y-contrast', !!s.contrast);
  html.classList.toggle('a11y-links', !!s.links);
  html.classList.toggle('a11y-motion', !!s.motion);
}
function initA11y(){
  applyA11y(getA11y());
  var btn = document.getElementById('a11yFloat');
  var panel = document.getElementById('a11yPanel');
  var closeBtn = document.getElementById('a11yClose');
  if (!btn || !panel) return;
  function open(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); }
  function close(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); }
  btn.addEventListener('click', function(){ panel.classList.contains('open') ? close() : open(); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if (e.key==='Escape' && panel.classList.contains('open')) close(); });
  panel.querySelectorAll('.a11y-opt').forEach(function(opt){
    opt.addEventListener('click', function(){
      var s = getA11y();
      var act = opt.dataset.act;
      if (act==='font-up') s.font = Math.min(4, (s.font||0)+1);
      else if (act==='font-down') s.font = Math.max(-2, (s.font||0)-1);
      else if (act==='contrast') s.contrast = !s.contrast;
      else if (act==='links') s.links = !s.links;
      else if (act==='motion') s.motion = !s.motion;
      else if (act==='reset') s = {};
      saveA11y(s);
    });
  });
}

// ===== Analytics / Pixel (אופציונלי) =====
// כדי להפעיל מעקב: החליפו את המזהים למטה והסירו את ה-// בתחילת השורות הרלוונטיות.
var GA4_ID = '';   // לדוגמה: 'G-XXXXXXXXXX'
var FB_PIXEL_ID = ''; // לדוגמה: '123456789012345'
function initAnalytics(){
  if (GA4_ID) {
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', GA4_ID);
  }
  if (FB_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_PIXEL_ID); fbq('track', 'PageView');
  }
}

document.addEventListener('DOMContentLoaded', function(){
  injectSeoMeta();
  injectChrome();
  initReveal();
  initFaq();
  initAnalytics();
  registerSW();
});
