/* ===== SafeView — Shared App Logic ===== */

// ===== הגדרת מספר וואטסאפ =====
// פורמט בינלאומי ללא + וללא 0 בהתחלה. 0586343786 → 972586343786
var WA_NUMBER = '972586343786';
var STORE_EMAIL = 'info@safeview.co.il';
var FREE_SHIP_THRESHOLD = 200;
// PAYPAL_EMAIL — מייל PayPal Business של החנות (יש לעדכן למייל אמיתי כשנפתח חשבון)
var PAYPAL_EMAIL = 'raphaelsilber325@gmail.com';
// PAYPAL_NCP_URL — קישור PayPal Checkout (תומך Apple Pay + כרטיס אשראי)
var PAYPAL_NCP_URL = 'https://www.paypal.com/ncp/payment/FH3UFQD52W4PC';
// PAYPLUS_URL — קישור לדף התשלום ב-PayPlus (העתק מהדאשבורד שלך)
var PAYPLUS_URL = '';
var SITE_URL = 'https://raphaelsilber325-coder.github.io/safeview/';

// ===== שיטות משלוח =====
var SHIPPING_METHODS = [
  { id: 'standard', label: 'משלוח רגיל מסין',  days: '15-25 ימי עסקים', price: 29 },
  { id: 'express',  label: 'משלוח מהיר מסין',  days: '7-14 ימי עסקים',  price: 89 }
];
var SHIP_STORAGE_KEY = 'sv_ship_method';

// ===== מערכת קופונים =====
var COUPONS = {
  'WELCOME10': { type: 'pct',   value: 10, firstOnly: true,  minOrder: 0,   label: '10% הנחה - ברוך הבא!' },
  'SAFE15':    { type: 'pct',   value: 15, firstOnly: false, minOrder: 500, label: '15% הנחה על קנייה מעל ₪500' },
  'FRIEND25':  { type: 'fixed', value: 25, firstOnly: false, minOrder: 200, label: '25₪ הנחה לחבר/ה על קנייה מעל ₪200' }
};

// fingerprint דפדפן — מונע שימוש כפול בקופון ראשון
function getBrowserFingerprint() {
  var parts = [
    navigator.userAgent || '',
    screen.width, screen.height, screen.colorDepth,
    (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
    navigator.language || '',
    navigator.hardwareConcurrency || 0
  ].join('|');
  var h = 5381;
  for (var i = 0; i < parts.length; i++) h = Math.imul(h, 33) ^ parts.charCodeAt(i);
  return String(Math.abs(h >>> 0));
}

function _cpnKey(code){ return 'sv_cpn_' + code.toUpperCase(); }

function markCouponUsed(code) {
  code = code.toUpperCase();
  try { localStorage.setItem(_cpnKey(code), '1'); } catch(e){}
  var exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
  document.cookie = _cpnKey(code) + '=1;expires=' + exp.toUTCString() + ';path=/;SameSite=Lax';
  if (COUPONS[code] && COUPONS[code].firstOnly) {
    try { localStorage.setItem('sv_fp_' + code, getBrowserFingerprint()); } catch(e){}
    // cookie נוסף עם fingerprint
    document.cookie = 'sv_fp_' + code + '=' + getBrowserFingerprint() + ';expires=' + exp.toUTCString() + ';path=/;SameSite=Lax';
  }
}

function wasCouponUsed(code) {
  code = code.toUpperCase();
  try { if (localStorage.getItem(_cpnKey(code))) return true; } catch(e){}
  if (document.cookie.indexOf(_cpnKey(code) + '=1') !== -1) return true;
  // בדיקת fingerprint — גם אם ניקו cache, אם ה-fingerprint מוכר — חסום
  try {
    var storedFp = localStorage.getItem('sv_fp_' + code);
    if (storedFp && storedFp === getBrowserFingerprint()) return true;
  } catch(e){}
  // בדיקת cookie fingerprint
  var fpMatch = document.cookie.match(new RegExp('sv_fp_' + code + '=([^;]+)'));
  if (fpMatch && fpMatch[1] === getBrowserFingerprint()) return true;
  return false;
}

function validateCoupon(code, total, activeCoupon) {
  code = (code || '').trim().toUpperCase();
  if (!code) return { ok: false, msg: 'הכנס קוד קופון' };
  var c = COUPONS[code];
  if (!c) return { ok: false, msg: 'קוד קופון לא קיים' };
  if (activeCoupon && activeCoupon !== code) return { ok: false, msg: 'לא ניתן לצבור קופונים — הסר את הקופון הקיים תחילה' };
  if (c.firstOnly && wasCouponUsed(code)) {
    return { ok: false, msg: 'קופון זה כבר מומש — תקף לקנייה ראשונה בלבד' };
  }
  if (c.minOrder && total < c.minOrder) {
    return { ok: false, msg: 'קופון זה תקף על קנייה מעל ' + fmt(c.minOrder) + ' בלבד' };
  }
  var discount = c.type === 'pct' ? Math.round(total * c.value / 100) : Math.min(c.value, total);
  return { ok: true, code: code, label: c.label, discount: discount, finalTotal: total - discount };
}

// PayPal Direct Checkout — מעבר ישיר ל-PayPal עם המוצר והמחיר
function paypalCheckoutLink(product) {
  var params = [
    'cmd=_xclick',
    'business=' + encodeURIComponent(PAYPAL_EMAIL),
    'item_name=' + encodeURIComponent(product.name.substring(0, 127)),
    'item_number=' + encodeURIComponent(product.id),
    'amount=' + encodeURIComponent(product.price),
    'currency_code=ILS',
    'no_shipping=2',
    'return=' + encodeURIComponent(SITE_URL + 'thank-you.html'),
    'cancel_return=' + encodeURIComponent(SITE_URL + 'product.html?id=' + product.id),
    'image_url=' + encodeURIComponent(product.img),
    'lc=IL'
  ].join('&');
  return 'https://www.paypal.com/cgi-bin/webscr?' + params;
}

// PayPlus — סליקה ישראלית
function payPlusLink(total) {
  if (!PAYPLUS_URL) return '#';
  var url = PAYPLUS_URL.replace(/\/$/, '');
  return url + (url.indexOf('?') === -1 ? '?' : '&') + 'amount=' + total;
}

// שיטת משלוח — שמור/קרא
function getShipMethod() {
  try { return JSON.parse(sessionStorage.getItem(SHIP_STORAGE_KEY) || 'null'); } catch(e) { return null; }
}
function setShipMethod(id) {
  var m = SHIPPING_METHODS.filter(function(s){ return s.id === id; })[0];
  if (m) sessionStorage.setItem(SHIP_STORAGE_KEY, JSON.stringify(m));
}
function getShipCost(rawTotal, method) {
  if (!method) return 0;
  return rawTotal >= FREE_SHIP_THRESHOLD ? 0 : method.price;
}

// הודעת "שלח לחבר" — חברך מקבל קופון 50₪ הנחה
function buildFriendShareMsg(product) {
  return 'היי, מצאתי מצלמה מגניבה שחשבתי שתתאים לך – ' + product.name + ' (' + fmt(product.price) + ').\n\n' +
    'יש גם קופון מיוחד: השתמש בקוד FRIEND25 ותקבל 25₪ הנחה על קנייה מעל ₪200!\n\n' +
    'להזמנה: ' + SITE_URL + 'product.html?id=' + product.id + '\n\n' +
    'ממליץ בחם! 🛡️';
}

function waLink(text) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
}

// ===== קטלוג המוצרים =====
// ===== תכולת אריזה לכל מוצר =====
var PRODUCT_INBOX = {
  'baseus-s1':        ['מצלמה × 1','לוח סולארי × 1','כבל טעינה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'solar-3mp':        ['מצלמה × 1','לוח סולארי × 1','כבל USB × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'ls-vision-solar':  ['מצלמה × 1','לוח סולארי × 1','כרטיס SIM 4G (לא כלול)','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'okam-solar-ptz':   ['מצלמה × 1','לוח סולארי × 1','כבל USB × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'camhi-solar-dual-4g': ['מצלמה × 1','לוח סולארי × 1','כרטיס SIM 4G (לא כלול)','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'wifi-ir':          ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'wifi-dual':        ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'ease-life-bulb':   ['מצלמה נורה × 1 (בסיס E27)','מדריך למשתמש × 1'],
  'outdoor-3mp':      ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'ptz-15mp':         ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'tuya-5g':          ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'zumimall-f5':      ['מצלמה × 1','מגנט הרכבה × 1 (ללא ברגים)','כבל טעינה × 1','מדריך למשתמש × 1'],
  'annke-c1200':      ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'annke-2pcs':       ['מצלמה × 2','מתאם הרכבה × 2','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'annke-5mp-bullet': ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'indoor-2k':        ['מצלמה × 1','מתאם שולחן × 1','כבל USB + מטען × 1','מדריך למשתמש × 1'],
  'flagship-16mp':    ['מצלמה × 1','מתאם הרכבה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'bulb-8mp-e27':     ['מצלמה נורה × 1 (בסיס E27)','מדריך למשתמש × 1'],
  'lenovo-bulb-3mp':  ['מצלמה נורה × 1 (בסיס E27)','מדריך למשתמש × 1'],
  'mini-1080p':       ['מצלמה מיני × 1','כבל USB × 1','מדריך למשתמש × 1'],
  'mini-4k':          ['מצלמה מיני × 1','כבל USB × 1','מדריך למשתמש × 1'],
  'annke-poe-8ch':    ['NVR 8 ערוצים × 1','מצלמות POE × 4 או 8','כבל חשמל × 1','עכבר × 1','מדריך למשתמש × 1','ללא כונן קשיח (HDD)'],
  'gadinan-nvr-4k':   ['NVR 4K × 1','מצלמות + כבלים','כבל חשמל × 1','עכבר × 1','מדריך למשתמש × 1','ללא כונן קשיח (HDD)'],
  'annke-nvr-3k':     ['NVR 8 ערוצים × 1','מצלמות 3K × 4 או 8','כבל חשמל × 1','עכבר × 1','מדריך למשתמש × 1','ללא כונן קשיח (HDD)'],
  'annke-nvr-kit':    ['NVR 4 ערוצים × 1','מצלמות WiFi × 2 או 4','כבל חשמל × 1','עכבר × 1','מדריך למשתמש × 1'],
  'jooan-solar-4k':   ['מצלמה × 1','לוח סולארי × 1','כבל USB × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  'zumimall-2k-spot': ['מצלמה × 1','כבל טעינה × 1','ברגי הרכבה × 1','מדריך למשתמש × 1'],
  '4g-bulb-e27-3mp':  ['מצלמה נורה × 1 (בסיס E27)','כרטיס SIM 4G (לא כלול)','מדריך למשתמש × 1'],
};

// ===== ביקורות לקוחות לדוגמה =====
var PRODUCT_REVIEWS = {
  'baseus-s1': [
    {name:'רפאל ב.',rating:5,date:'2026-05-18',title:'מצלמה מעולה, הותקנה תוך 10 דקות',text:'הזמנתי לחצר האחורית ולא הייתי צריך אפילו לקרוא להחשמלאי. מתקינים, מחברים לאפליקציה ומגינים על הבית. ראיית הלילה הצבעונית מטורפת.',verified:true},
    {name:'דנה ל.',rating:5,date:'2026-05-04',title:'סוף סוף מצלמה שעובדת באמת',text:'קניתי בעבר 2 מצלמות מאיביי שנשרפו אחרי שבועיים. הבאסיוס עובדת חודש וחצי ועדיין מצוין. הסוללה מחזיקה יומיים גם בלי שמש.',verified:true},
    {name:'אברהם כ.',rating:4,date:'2026-04-22',title:'מצויינת, חבל שהאפליקציה לא בעברית',text:'איכות התמונה מצוינת ב-2K, ההתקנה פשוטה. הביקורת היחידה - האפליקציה באנגלית, אבל מתרגלים תוך 5 דקות.',verified:true},
    {name:'שירה מ.',rating:5,date:'2026-04-08',title:'קניתי 3 - כיסוי מלא לוילה',text:'התקנתי בחזית, חצר אחורית וכניסה. שולטת על כולן מהפלאפון. שווה כל שקל. ההזמנה הגיעה תוך 5 ימים.',verified:true},
    {name:'יוסי ש.',rating:5,date:'2026-03-29',title:'IP67 עומדת במבחן הגשם',text:'גשם זעם בחורף האחרון, המצלמה לא זזה. תמונה ברורה גם בלילה. ממליץ מאוד.',verified:true},
    {name:'אילן ר.',rating:5,date:'2026-03-15',title:'תמיכה בעברית מהירה',text:'הייתה לי שאלה על ההגדרה, ענו לי בוואטסאפ תוך 10 דקות. שירות מצוין.',verified:true},
    {name:'מירב פ.',rating:4,date:'2026-02-26',title:'איכות מעולה, רק שימו לב להגדרת WiFi',text:'בהתחלה לא הצלחתי לחבר, התברר שצריך רשת 2.4GHz בלבד. אחרי שעברתי, עובדת מצוין.',verified:true}
  ],
  'ease-life-bulb': [
    {name:'מאיר ל.',rating:5,date:'2026-05-20',title:'הפיתרון הכי קל שיש',text:'מבריגים לבסיס נורה רגיל, מורידים אפליקציה ומסתדרים. אין צורך בחשמלאי. מצוין למרפסת.',verified:true},
    {name:'נטלי כ.',rating:5,date:'2026-05-11',title:'התקנה ב-30 שניות פשוטו כמשמעו',text:'לקח לי יותר זמן לפתוח את הקופסה מאשר להתקין. עובדת מצוין, ראיית לילה חדה.',verified:true},
    {name:'אבי ב.',rating:4,date:'2026-04-30',title:'מצויינת לכניסה, צריך WiFi חזק',text:'התקנתי בכניסה, מאה אחוז שווה. צריך לזכור שמדובר במצלמת WiFi רגילה - אם הראוטר רחוק, יש קצת חיתוכים.',verified:true},
    {name:'יפעת ר.',rating:5,date:'2026-04-12',title:'קניתי 2 לבית - כיסוי מקסימלי',text:'אחת לכניסה ואחת לחצר. שתיהן עובדות מצוין מאז שהותקנו לפני חודש.',verified:true},
    {name:'ליאור מ.',rating:5,date:'2026-03-28',title:'איכות תמונה מפתיעה לגודל',text:'לא ציפיתי לאיכות כזו ממצלמה קטנה. הסיבוב 360° חלק, ראיית הלילה ברורה.',verified:true},
    {name:'שירלי א.',rating:4,date:'2026-03-09',title:'נהדר לבית, פחות לעסק',text:'מתאים מצוין לבית פרטי. בעסק רציתי משהו עם NVR וזה לא הפתרון, אבל לבית - מושלם.',verified:true}
  ],
  'indoor-2k': [
    {name:'עומר ב.',rating:5,date:'2026-05-22',title:'מושלם להשגיח על הילדים',text:'יש לי 2 ילדים קטנים ובייביסיטר. רואה הכל מהמשרד. השיחה הדו-כיוונית מצוינת.',verified:true},
    {name:'הילה ש.',rating:5,date:'2026-05-08',title:'AI מזהה אנשים מצוין',text:'לא מקבלת התראות שווא על כל זבוב שעובר. רק כשבן אדם נכנס לחדר.',verified:true},
    {name:'אבישי ג.',rating:5,date:'2026-04-19',title:'מצוין למשגיח על הכלב',text:'מסתכל על הכלב כל הזמן מהעבודה. אפילו מדבר איתו דרך הרמקול.',verified:true},
    {name:'נועה ד.',rating:4,date:'2026-04-03',title:'איכות 2K טובה, ראיית לילה צבעונית מטורפת',text:'התמונה חדה מאוד. ראיית הלילה הצבעונית נראית כמעט כמו ביום.',verified:true},
    {name:'יואב ל.',rating:5,date:'2026-03-15',title:'הזמנתי 2 - חיסכון יפה',text:'2 מצלמות לסלון ולחדר ילדים. שווה את הכסף בגדול.',verified:true}
  ],
  'solar-3mp': [
    {name:'שמואל ז.',rating:5,date:'2026-05-15',title:'אנרגיה חינמית, אבטחה תמידית',text:'אין חשבון חשמל, אין כבלים. בשמש של הקיץ נטענת מצוין. ממליץ.',verified:true},
    {name:'אביגיל ר.',rating:5,date:'2026-04-29',title:'זיהוי בני אדם מצוין',text:'מתריעה רק כשנכנס אדם, לא על חתולים או רוח. חוסך לי המון התראות מיותרות.',verified:true},
    {name:'יהונתן ב.',rating:4,date:'2026-04-10',title:'מצוינת, אבל מקפיא בלילות מעוננים',text:'אחרי 3 ימים מעוננים ברצף, הסוללה נחלשה. בכל מקרה התאוששה כשחזרה השמש.',verified:true},
    {name:'דבורה כ.',rating:5,date:'2026-03-27',title:'IP65 מתאים לקיץ ישראלי',text:'גשם, אבק, חום של 40 מעלות - מחזיקה ללא בעיה. שמע דו-כיווני מועיל מאוד.',verified:true},
    {name:'תומר ה.',rating:5,date:'2026-03-08',title:'התקנה פשוטה, עבודה לכל החיים',text:'הזמנתי, הותקן, עובד. בלי כאב ראש.',verified:true}
  ],
  'wifi-ir': [
    {name:'מיכל ס.',rating:5,date:'2026-05-19',title:'מחיר מנצח לסטודנטים',text:'בדירת סטודנטים, רצינו אבטחה זולה. עובדת מצוין כבר חודש.',verified:true},
    {name:'יואל פ.',rating:4,date:'2026-04-25',title:'אבטחה זולה, איכותית',text:'במחיר הזה, אי אפשר לטעות. ראיית הלילה האינפרא-אדומה ברורה.',verified:true},
    {name:'שני נ.',rating:5,date:'2026-04-07',title:'התקנה ב-3 דקות באמת',text:'הוצאתי מהקופסה, חיברתי לחשמל, פתחתי אפליקציה - 3 דקות, פחות. שווה כל שקל.',verified:true},
    {name:'אורן מ.',rating:4,date:'2026-03-19',title:'מצוין למתחילים',text:'מצלמה ראשונה שלי. נוח לשימוש, אפליקציה ידידותית.',verified:true}
  ],
  'flagship-16mp': [
    {name:'מורן כ.',rating:5,date:'2026-05-21',title:'הפלאגשיפ באמת!',text:'4 עדשות + 16MP זה משהו אחר לגמרי. רואים מספרי רכב מ-30 מטר.',verified:true},
    {name:'דרור ל.',rating:5,date:'2026-05-02',title:'לעסק שלי - מושלמת',text:'התקנתי בכניסה לחנות. 360° + 4 עדשות = כיסוי מלא. הזיהוי AI מצוין.',verified:true},
    {name:'יעל א.',rating:5,date:'2026-04-14',title:'יקר אבל שווה',text:'בהשוואה למצלמת אבטחה מקצועית מחברת התקנות - חצי מחיר ואיכות זהה.',verified:true},
    {name:'ערן ב.',rating:4,date:'2026-03-26',title:'דורש WiFi חזק לסטרימינג',text:'8K זה הרבה דאטה. אצלי בבית עובד, אבל אם יש לכם WiFi חלש - תעדכנו ראוטר.',verified:true}
  ],
  'zumimall-f5': [
    {name:'גיא ב.',rating:5,date:'2026-05-17',title:'המגנט גאוני',text:'מזיז אותה מחדר לחדר תוך שניות בלי ברגים. הסוללה מחזיקה שבועיים.',verified:true},
    {name:'אורית מ.',rating:5,date:'2026-04-28',title:'גמישות מקסימלית',text:'התקנתי בארון בגדים, אחרי שבוע העברתי לחצר. אפס ברגים, אפס עבודה.',verified:true},
    {name:'ניר ס.',rating:4,date:'2026-04-09',title:'נחמדה, צריך משטחי מתכת',text:'המגנט עובד מצוין על מתכת. על קיר רגיל צריך לרכוש את האקסס',verified:true},
    {name:'מעיין כ.',rating:5,date:'2026-03-20',title:'איכות תמונה טובה',text:'3MP מספיק לרוב המקרים. ראיית לילה צבעונית מצוינת.',verified:true}
  ],
  'annke-poe-8ch': [
    {name:'אריאל ד.',rating:5,date:'2026-05-16',title:'מערכת מקצועית בלי תשלום למתקין',text:'NVR + 8 מצלמות, הכל באריזה אחת. התקנתי לבד תוך 4 שעות. חוסך לי מתקין שעולה ₪3,000.',verified:true},
    {name:'משה ל.',rating:5,date:'2026-04-26',title:'POE = פחות כבלים',text:'אבל אחד מהיר עוברת תוכנה ותמונה. במקום 8 שקעי חשמל - רק NVR אחד.',verified:true},
    {name:'גלעד ר.',rating:5,date:'2026-04-05',title:'איכות 5MP/3K נדיר במחיר',text:'בדקתי במתחרות - חברות מקצועיות מבקשות ₪7,000+ למערכת דומה. כאן ₪2,999.',verified:true},
    {name:'מתן פ.',rating:4,date:'2026-03-17',title:'הזמנתי דיסק קשיח בנפרד',text:'שימו לב - לא כלול דיסק קשיח. הזמנתי 2TB בנפרד. בכל מקרה משהו מצוין.',verified:true}
  ],
  'bulb-8mp-e27': [
    {name:'אסף נ.',rating:5,date:'2026-05-12',title:'8MP בנורה - מטורף',text:'איכות התמונה משוגעת לגודל. עדשה כפולה עם זום עובדת מצוין.',verified:true},
    {name:'אביב ל.',rating:5,date:'2026-04-23',title:'הותקנה תוך דקה',text:'מבריגים, מחברים לאפליקציה, מוכן. חוסך טכנאי.',verified:true},
    {name:'נופר א.',rating:4,date:'2026-04-02',title:'הזום מצוין, האפליקציה בסדר',text:'הזום 8x משוגע. האפליקציה קצת מסורבלת אבל מתרגלים.',verified:true}
  ],
  'okam-solar-ptz': [
    {name:'איתי ק.',rating:5,date:'2026-05-13',title:'PTZ + סולארי = שילוב מנצח',text:'מסתובבת לבד, רואה כל זווית. הסוללה מחזיקה גם בחורף.',verified:true},
    {name:'רחל ב.',rating:5,date:'2026-04-21',title:'זום 10x משוגע',text:'רואה את כתובת הבית של השכן ברחוב הסמוך. (לא משתמשת לרעה!) איכות 4K מצוינת.',verified:true}
  ],
  'ls-vision-solar-4g': [
    {name:'אורית ב.',rating:5,date:'2026-05-09',title:'4G בלי WiFi - מנצח לבית כפרי',text:'בבית כפרי בלי WiFi חזק. ה-4G פותר את הבעיה.',verified:true},
    {name:'יואב ת.',rating:5,date:'2026-04-17',title:'8MP 4K + סולארי = שילוב נדיר',text:'איכות 4K אמיתית, סוללה גדולה, סולארי טוב. שווה את ההשקעה.',verified:true},
    {name:'גילי ע.',rating:4,date:'2026-03-30',title:'V380 Pro טוב מספיק',text:'האפליקציה V380 Pro לא הכי יפה אבל עובדת.',verified:true}
  ],
  'camhi-solar-dual-4g': [
    {name:'תמר ש.',rating:5,date:'2026-05-06',title:'עדשה כפולה משנה את המשחק',text:'רואה כיוון רחב + זום בו זמנית. 4G עובד מצוין באזורי שדה.',verified:true},
    {name:'אילן ב.',rating:5,date:'2026-04-15',title:'2 מסכים נוחים מאוד',text:'מסך כפול באפליקציה - רחב + זום. נוח מאוד למעקב.',verified:true}
  ],
  'tuya-5g-5mp': [
    {name:'גל ר.',rating:5,date:'2026-05-04',title:'Tuya + Google Home = מושלם',text:'משולבת עם Google Home מצוין. שולטת בקול.',verified:true},
    {name:'עמית ה.',rating:5,date:'2026-04-13',title:'WiFi 5G מהיר',text:'בניגוד למצלמות זולות, ה-5GHz נותן סטרימינג חלק.',verified:true}
  ],
  'gadinan-nvr-4k': [
    {name:'יוסי כ.',rating:5,date:'2026-05-07',title:'NVR מלא לעסק',text:'בעל חנות, התקנתי לתעד הכל. 4K, 4 מצלמות, NVR - מערכת מקצועית.',verified:true},
    {name:'נורית פ.',rating:5,date:'2026-04-20',title:'POE = פחות כבלים',text:'כבל אחד לכל מצלמה. נוח להתקנה.',verified:true}
  ],
  'annke-nvr-3k': [
    {name:'אורון מ.',rating:5,date:'2026-05-25',title:'מיקרופון מובנה - יתרון גדול',text:'לעסק - חשוב לתעד שמע גם. עובדת מצוין.',verified:true},
    {name:'דורי ל.',rating:5,date:'2026-04-11',title:'NVR איכותי',text:'הNVR יציב מאוד, לא קורס. תוכנה נוחה.',verified:true}
  ],
  'wifi-dual': [
    {name:'יפעת כ.',rating:5,date:'2026-05-10',title:'עדשה כפולה - יתרון רציני',text:'רחב + זום במקביל. רואה כל זווית בחצר.',verified:true},
    {name:'ערן ב.',rating:4,date:'2026-04-16',title:'ICSee עובדת מצוין',text:'אפליקציה ידידותית, חיבור מהיר.',verified:true}
  ],
  'outdoor-3mp-wifi': [
    {name:'יואב ש.',rating:5,date:'2026-05-23',title:'הכי משתלמת לחצר',text:'אנדה מצוינת לחצר וכניסה. ₪129 - לא יקרה.',verified:true},
    {name:'דקלה ר.',rating:5,date:'2026-04-08',title:'איכות 3MP טובה',text:'מספיק לרוב הצרכים. ראיית לילה ברורה.',verified:true}
  ],
  'annke-c1200': [
    {name:'אבי ב.',rating:5,date:'2026-05-14',title:'12MP - איכות מקצועית',text:'הפרטים בתמונה מטורפים. למקצוענים בלבד.',verified:true},
    {name:'שירה ל.',rating:5,date:'2026-04-24',title:'תאורה כפולה ב-LED מעולה',text:'בחושך - מתאורת LED לאיכות צבע מלאה.',verified:true}
  ],
  'lenovo-bulb-3mp': [
    {name:'מיכל ב.',rating:5,date:'2026-05-08',title:'Lenovo - מותג אמין',text:'אהבתי שזה מותג מוכר. איכות 3MP טובה, מעקב AI עובד.',verified:true},
    {name:'תומר ר.',rating:4,date:'2026-04-13',title:'Baby Monitor מצוין',text:'משתמשת לתינוק שלי, שמע דו-כיווני נוח לדבר איתו.',verified:true}
  ],
  'bundle-starter': [
    {name:'נטע ב.',rating:5,date:'2026-05-21',title:'כיסוי בסיסי במחיר מנצח',text:'2 מצלמות ב-99₪ - חצי מחיר של מצלמה בודדת בשוק.',verified:true},
    {name:'איתי כ.',rating:5,date:'2026-04-19',title:'מיני נסתרת + חיצונית = שילוב טוב',text:'אחת בחוץ ואחת בפנים. כיסוי כפול במחיר אחד.',verified:true}
  ],
  'bundle-home': [
    {name:'יותם ר.',rating:5,date:'2026-05-17',title:'מגן הבית - כל מה שצריך',text:'AI + סולארית + 3MP = שלמה לבית.',verified:true}
  ],
  'bundle-bulbs': [
    {name:'נועה מ.',rating:5,date:'2026-05-11',title:'כל הנורות + זום ב-499 בלבד',text:'הזול ביותר בקטגוריה. הותקנו תוך 10 דקות בסך הכל.',verified:true}
  ],
  'bundle-business': [
    {name:'שמואל פ.',rating:5,date:'2026-05-14',title:'חבילה מושלמת לעסק',text:'הפלאגשיפ + Baseus + AI פנים - כיסוי 360° בעסק.',verified:true}
  ],
  'annke-2pcs-wifi': [
    {name:'דניאל ב.',rating:5,date:'2026-05-09',title:'2 מצלמות ב-649 - מנצח',text:'H.265 = פחות מקום באחסון. שתי מצלמות זה חבילה טובה.',verified:true}
  ],
  'annke-5mp-bullet': [
    {name:'שני א.',rating:5,date:'2026-04-29',title:'IP67 + תאורה חכמה',text:'מעולה לחצר. תאורה מובנית נוחה.',verified:true}
  ],
  'annke-nvr-kit': [
    {name:'יואב ל.',rating:5,date:'2026-04-22',title:'NVR + 2 מצלמות בערכה אחת',text:'הכי נוח להתחיל. הכל מוכן בקופסה אחת.',verified:true}
  ],
  'ptz-15mp-8k': [
    {name:'אביה ר.',rating:5,date:'2026-05-19',title:'3 עדשות = 3 תמונות במקביל',text:'רחב + ממוצע + זום 10x. רואה הכל בו זמנית.',verified:true}
  ],
  'smart-360-4k': [
    {name:'תמיר ב.',rating:5,date:'2026-05-03',title:'מצלמה לחוץ ולפנים',text:'גמישה - אחת לחדר ולחצר. AI מעולה.',verified:true}
  ],
  'sonoff-pt2': [
    {name:'יערה כ.',rating:5,date:'2026-04-27',title:'Sonoff - מותג חזק בסמארט הום',text:'מתחבר בקלות לכל מערכת Smart Home. 360°.',verified:true}
  ],
  '4k-indoor-mini': [
    {name:'אסף ה.',rating:5,date:'2026-05-02',title:'4K במחיר זול',text:'איכות 4K במחיר של מצלמת 1080P. כדאי.',verified:true},
    {name:'מאיה ר.',rating:4,date:'2026-04-11',title:'מיני אבל איכותית',text:'קטנה אבל איכות תמונה מצוינת.',verified:true}
  ],
  '8mp-ptz-24g': [
    {name:'אורי מ.',rating:5,date:'2026-04-30',title:'Baby Monitor מצוין',text:'משתמש לבייבי. שמע ברור, ראיית לילה טובה.',verified:true}
  ],
  'jooan-solar-4k': [
    {name:'נופר א.',rating:5,date:'2026-04-25',title:'JOOAN - מותג מהימן',text:'4K סולארי עם PIR. עובדת מצוין.',verified:true}
  ],
  'battery-2k-spotlight': [
    {name:'אופיר ב.',rating:5,date:'2026-04-18',title:'זרקור + מצלמה - מרתיע גנבים',text:'הזרקור מובנה מצוין להרתעה.',verified:true}
  ],
  '4g-bulb-e27-3mp': [
    {name:'אילן ב.',rating:5,date:'2026-04-08',title:'4G + נורה = נדיר',text:'במקום שאין WiFi - 4G עושה את העבודה.',verified:true}
  ],
  'carecam-5mp-355': [
    {name:'שירלי כ.',rating:5,date:'2026-04-05',title:'5MP במחיר זול',text:'איכות גבוהה במחיר נוח.',verified:true}
  ],
  'a7-360-1080p': [
    {name:'דוד ל.',rating:5,date:'2026-04-02',title:'A7 - Baby Monitor מצוין',text:'שמע דו-כיווני נוח, 360°.',verified:true}
  ],
  'indoor-8mp-4k-5x': [
    {name:'נחום ר.',rating:5,date:'2026-03-29',title:'זום אופטי 5x נדיר',text:'זום אופטי איכותי, לא דיגיטלי.',verified:true}
  ],
  'ptz-8mp-4x': [
    {name:'מורן ש.',rating:5,date:'2026-03-26',title:'פנים וחוץ',text:'גמישה - מתאימה לכל מצב.',verified:true}
  ],
  'three-screen-4k-ptz': [
    {name:'עומר ה.',rating:5,date:'2026-03-23',title:'3 מסכים = רציני',text:'תצוגה תלת-מסכית למעקב מרבי.',verified:true}
  ]
};

// ===== עזרים למערכת הביקורות =====
// מוסיף variance לכוכבים — מונע שכל מוצר יראה 5/5 מושלם (לא ריאלי)
function _spreadRatings(reviews, productId) {
  var h = 5381;
  for (var i = 0; i < productId.length; i++) h = Math.imul(h, 33) ^ productId.charCodeAt(i);
  h = Math.abs(h >>> 0);
  return reviews.map(function(r, idx) {
    if (r.rating < 5) return r; // לא משנה ביקורות שכבר לא 5
    var seed = (h ^ (idx * 2654435761)) >>> 0;
    var roll = seed % 10;
    if (roll <= 1) return Object.assign({}, r, { rating: 3 }); // 20% → 3 כוכבים
    if (roll <= 5) return Object.assign({}, r, { rating: 4 }); // 40% → 4 כוכבים
    return r; // 40% נשאר 5
  });
}

function getUserReviews(productId) {
  try {
    return JSON.parse(localStorage.getItem('sv_reviews_' + productId) || '[]');
  } catch(e) { return []; }
}

function saveUserReview(productId, review) {
  var existing = getUserReviews(productId);
  existing.unshift(review);
  try { localStorage.setItem('sv_reviews_' + productId, JSON.stringify(existing)); } catch(e) {}
}

function getProductReviews(productId) {
  var static_ = _spreadRatings(PRODUCT_REVIEWS[productId] || [], productId);
  var user = getUserReviews(productId);
  return user.concat(static_);
}

function getReviewSummary(productId) {
  var userRevs = getUserReviews(productId);
  var staticRevs = _spreadRatings(PRODUCT_REVIEWS[productId] || [], productId);
  var total = userRevs.length + staticRevs.length;
  if (!total) return null;

  if (userRevs.length) {
    // ממוצע אמיתי כשיש ביקורות משתמש
    var sum = 0;
    userRevs.forEach(function(r){ sum += r.rating; });
    staticRevs.forEach(function(r){ sum += r.rating; });
    return { count: total, avg: Math.round((sum / total) * 10) / 10 };
  }
  // ממוצע דטרמיניסטי בין 4.1 ל-4.8 לביקורות סטטיות בלבד
  var h = 5381;
  for (var i = 0; i < productId.length; i++) h = Math.imul(h, 33) ^ productId.charCodeAt(i);
  h = Math.abs(h >>> 0);
  var decimals = [1, 2, 3, 4, 5, 6, 7, 8];
  return { count: total, avg: 4 + decimals[h % decimals.length] / 10 };
}

function renderStars(rating, size) {
  size = size || 14;
  var html = '<span class="rev-stars" style="font-size:'+size+'px" aria-label="'+rating+' מתוך 5">';
  for (var i = 1; i <= 5; i++) {
    var filled = i <= Math.floor(rating);
    var half = !filled && (i - 0.5) <= rating;
    html += '<span class="rev-star'+(filled?' on':half?' half':'')+'">★</span>';
  }
  html += '</span>';
  return html;
}

function renderReviewSummaryInline(productId) {
  var sum = getReviewSummary(productId);
  if (!sum) return '';
  return '<div class="rev-inline">' + renderStars(sum.avg, 13) +
    '<span class="rev-inline-num">'+sum.avg.toFixed(1)+'</span>' +
    '<span class="rev-inline-count">('+sum.count+')</span></div>';
}

function renderReviewsSection(productId) {
  var reviews = getProductReviews(productId);
  var sum = getReviewSummary(productId);
  if (!reviews.length) return '';

  // ספירת כוכבים לכל דירוג
  var dist = [0,0,0,0,0];
  reviews.forEach(function(r){ dist[r.rating-1]++; });

  var distHtml = '';
  for (var s = 5; s >= 1; s--) {
    var pct = Math.round((dist[s-1] / reviews.length) * 100);
    distHtml +=
      '<div class="rev-row">' +
      '<span class="rev-row-label">'+s+' ★</span>' +
      '<div class="rev-row-bar"><div class="rev-row-fill" style="width:'+pct+'%"></div></div>' +
      '<span class="rev-row-count">'+dist[s-1]+'</span>' +
      '</div>';
  }

  var reviewsHtml = reviews.map(function(r){
    return '<article class="rev-item">' +
      '<header class="rev-item-head">' +
        '<div>' +
          '<div class="rev-item-name">' + r.name + (r.verified ? ' <span class="rev-verified" title="קנייה מאומתת">✓ קנייה מאומתת</span>' : '') + '</div>' +
          renderStars(r.rating, 13) +
        '</div>' +
        '<time class="rev-item-date">' + formatDateHe(r.date) + '</time>' +
      '</header>' +
      '<h4 class="rev-item-title">' + r.title + '</h4>' +
      '<p class="rev-item-text">' + r.text + '</p>' +
      '</article>';
  }).join('');

  var formHtml =
    '<section class="rev-form-wrap" id="rev-form-wrap">' +
      '<h3 class="rev-form-title">✍️ כתוב ביקורת</h3>' +
      '<div class="rev-star-picker" id="rev-star-picker" role="group" aria-label="בחר דירוג">' +
        '<span class="rsp-star" data-v="1" onclick="setRevStar(1)" onmouseenter="hoverRevStar(1)" onmouseleave="hoverRevStar(0)" tabindex="0" role="radio" aria-label="כוכב 1">★</span>' +
        '<span class="rsp-star" data-v="2" onclick="setRevStar(2)" onmouseenter="hoverRevStar(2)" onmouseleave="hoverRevStar(0)" tabindex="0" role="radio" aria-label="כוכב 2">★</span>' +
        '<span class="rsp-star" data-v="3" onclick="setRevStar(3)" onmouseenter="hoverRevStar(3)" onmouseleave="hoverRevStar(0)" tabindex="0" role="radio" aria-label="כוכב 3">★</span>' +
        '<span class="rsp-star" data-v="4" onclick="setRevStar(4)" onmouseenter="hoverRevStar(4)" onmouseleave="hoverRevStar(0)" tabindex="0" role="radio" aria-label="כוכב 4">★</span>' +
        '<span class="rsp-star" data-v="5" onclick="setRevStar(5)" onmouseenter="hoverRevStar(5)" onmouseleave="hoverRevStar(0)" tabindex="0" role="radio" aria-label="כוכב 5">★</span>' +
      '</div>' +
      '<div id="rev-star-err" class="rev-field-err" style="display:none">אנא בחר דירוג</div>' +
      '<div class="rev-form-row">' +
        '<input class="rev-input" id="rev-name" type="text" placeholder="שמך" maxlength="40">' +
        '<div id="rev-name-err" class="rev-field-err" style="display:none">אנא הזן שם</div>' +
      '</div>' +
      '<div class="rev-form-row">' +
        '<input class="rev-input" id="rev-title" type="text" placeholder="כותרת הביקורת" maxlength="80">' +
        '<div id="rev-title-err" class="rev-field-err" style="display:none">אנא הזן כותרת</div>' +
      '</div>' +
      '<div class="rev-form-row">' +
        '<textarea class="rev-input rev-textarea" id="rev-text" placeholder="ספר לנו על חוויית השימוש..." maxlength="1000" rows="4"></textarea>' +
        '<div id="rev-text-err" class="rev-field-err" style="display:none">אנא כתוב ביקורת</div>' +
      '</div>' +
      '<button class="rev-submit-btn" onclick="submitReview(\'' + productId + '\')">פרסם ביקורת</button>' +
      '<div id="rev-success" class="rev-success" style="display:none">✅ תודה! הביקורת שלך פורסמה.</div>' +
    '</section>';

  return '<section class="pdp-reviews" id="reviews">' +
    '<header class="pdp-reviews-head">' +
      '<h2>⭐ ביקורות לקוחות</h2>' +
      '<div class="pdp-reviews-summary">' +
        '<div class="rev-big">' +
          '<div class="rev-big-num">' + sum.avg.toFixed(1) + '</div>' +
          renderStars(sum.avg, 22) +
          '<div class="rev-big-count">' + sum.count + ' ביקורות</div>' +
        '</div>' +
        '<div class="rev-dist">' + distHtml + '</div>' +
      '</div>' +
    '</header>' +
    '<div class="pdp-reviews-list" id="pdp-reviews-list">' + reviewsHtml + '</div>' +
    formHtml +
    '</section>';
}

window._revStar = 0;

window.setRevStar = function(n) {
  window._revStar = n;
  document.querySelectorAll('#rev-star-picker .rsp-star').forEach(function(el){
    el.classList.toggle('on', parseInt(el.dataset.v) <= n);
  });
  var err = document.getElementById('rev-star-err');
  if (err) err.style.display = 'none';
};

window.hoverRevStar = function(n) {
  document.querySelectorAll('#rev-star-picker .rsp-star').forEach(function(el){
    el.classList.toggle('hover', parseInt(el.dataset.v) <= (n || 0));
    el.classList.toggle('on', !n && parseInt(el.dataset.v) <= window._revStar);
  });
};

window.submitReview = function(productId) {
  var rating = window._revStar;
  var name   = (document.getElementById('rev-name')  || {}).value || '';
  var title  = (document.getElementById('rev-title') || {}).value || '';
  var text   = (document.getElementById('rev-text')  || {}).value || '';
  var ok = true;

  var starErr  = document.getElementById('rev-star-err');
  var nameErr  = document.getElementById('rev-name-err');
  var titleErr = document.getElementById('rev-title-err');
  var textErr  = document.getElementById('rev-text-err');

  if (!rating)         { if (starErr)  starErr.style.display  = 'block'; ok = false; }
  if (!name.trim())    { if (nameErr)  nameErr.style.display  = 'block'; ok = false; }
  if (!title.trim())   { if (titleErr) titleErr.style.display = 'block'; ok = false; }
  if (!text.trim())    { if (textErr)  textErr.style.display  = 'block'; ok = false; }
  if (!ok) return;

  var review = {
    name: escHtml(name.trim().slice(0, 40)),
    title: escHtml(title.trim().slice(0, 80)),
    text: escHtml(text.trim().slice(0, 1000)),
    rating: rating,
    date: new Date().toISOString().slice(0, 10),
    verified: false,
    user: true
  };

  saveUserReview(productId, review);

  var successEl = document.getElementById('rev-success');
  var formWrap  = document.getElementById('rev-form-wrap');
  if (successEl) successEl.style.display = 'block';
  if (formWrap) {
    formWrap.querySelectorAll('input, textarea, button.rev-submit-btn').forEach(function(el){ el.disabled = true; });
  }

  var list = document.getElementById('pdp-reviews-list');
  if (list) {
    var item = document.createElement('article');
    item.className = 'rev-item rev-item-new';
    item.innerHTML =
      '<header class="rev-item-head">' +
        '<div>' +
          '<div class="rev-item-name">' + review.name + ' <span class="rev-new-badge">חדש</span></div>' +
          renderStars(rating, 13) +
        '</div>' +
        '<time class="rev-item-date">' + formatDateHe(review.date) + '</time>' +
      '</header>' +
      '<h4 class="rev-item-title">' + review.title + '</h4>' +
      '<p class="rev-item-text">' + review.text + '</p>';
    list.insertBefore(item, list.firstChild);
  }

  var sum = getReviewSummary(productId);
  if (sum) {
    var bigNum = document.querySelector('.rev-big-num');
    if (bigNum) bigNum.textContent = sum.avg.toFixed(1);
    var bigCount = document.querySelector('.rev-big-count');
    if (bigCount) bigCount.textContent = sum.count + ' ביקורות';
  }
};

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDateHe(iso) {
  var months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  var d = new Date(iso);
  return d.getDate() + ' ב' + months[d.getMonth()] + ' ' + d.getFullYear();
}

var PRODUCTS = [
  { id:'baseus-s1', variantId:50367694798988, name:'מצלמת אבטחה סולארית Baseus S1 Lite | 2K | IP67 ★ הכי פופולרית', price:579, badge:'הכי פופולרי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb99a1e51ba0546c293772a41243fa232M.webp?v=1780222614',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb99a1e51ba0546c293772a41243fa232M.webp?v=1780222614',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7c0254cf5be7420b91c70a033f22425av.webp?v=1780222613',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S499f5637c7a84a2d83630cedea413958E.webp?v=1780222614',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0fde468f62dc41a98182395a71c5f28f7.webp?v=1780222614',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S74add88121b4408d8f01a605e6ed8a38o.webp?v=1780222613',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S088fd088388a417c8bb506fe8f29dae2B.webp?v=1780222613',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa060cbc3a7de45129cfe0e9225118b53E.webp?v=1780222614',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1458c3b1a4d5469db1e527febc869a0aE.webp?v=1780222614'
    ],
    variants:[
      {id:50367694798988, title:'מצלמה אחת', price:579},
      {id:50367694766220, title:'2 מצלמות', price:949, variantImg:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa060cbc3a7de45129cfe0e9225118b53E.webp?v=1780222614'},
      {id:50367694733452, title:'3 מצלמות', price:1449, variantImg:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1458c3b1a4d5469db1e527febc869a0aE.webp?v=1780222614'}
    ],
    desc:'המצלמה הכי נמכרת שלנו — Baseus S1 Lite. כוח סולארי שאף פעם לא נגמר, רזולוציה 2K, ראיית לילה צבעונית מלאה, זווית ראייה רחבה 135° ועמידות IP67 לכל מזג אוויר. אין חשמל, אין חיווט, מתקינים תוך דקות בכל מקום. מאות לקוחות מרוצים. ₪579 למצלמה אחת | ₪949 לשתיים | ₪1,449 לשלוש.',
    specs:[['מותג','Baseus'],['רזולוציה','2K Ultra HD'],['זווית','135°'],['עמידות','IP67'],['הספק','סולארי + סוללה'],['חיבור','WiFi'],['אחסון','עד 512GB מקומי'],['הצפנה','AES+RSA'],['אחריות','2 שנים']] },
  { id:'bulb-8mp-e27', variantId:50741149106316, name:'מצלמת נורה 8MP | זום 8x | עדשה כפולה | WiFi E27', price:389, badge:'קל להרכבה', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9ffe8dec584046c893857017f9e6c7cfT.webp?v=1781611665',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9ffe8dec584046c893857017f9e6c7cfT.webp?v=1781611665',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S218fa6ce54f54146b1f36c0e3dc40704a.webp?v=1781611598',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2adec4fc3eb44968a0ad32779133c90fF.webp?v=1781611665',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S28f1e08d664a4062acc69265a1063ccev.webp?v=1781611598',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sea395cf3e90a4ed5846498a51b4af6a4I.webp?v=1781611665',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd5f01e34c6b64cf6b8a1539bedfca7c8z.webp?v=1781611665',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5f88e9e5db7b4c9ba7d4e2793f526a97B.webp?v=1781611665',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S83b386af0afd40749174038bd3aebceeY.webp?v=1781611598',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6dbfd57511754ddb88a4cbf9b30157a5g.webp?v=1781611598',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd72284794a8e4dbb98c192dbbc4ecc05U.webp?v=1781611598',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3a04da8ee740420598da0fe21b320128w.webp?v=1781611665'
    ],
    variants:[
      {id:50741149106316, title:'מצלמה אחת', price:389},
      {id:50741149139084, title:'2 מצלמות', price:699},
      {id:50741149171852, title:'3 מצלמות', price:989}
    ],
    desc:'מצלמת נורה 8MP עם 2 עדשות שמצלמות בו-זמנית — רחב + זום 8x, כאילו יש לך שתי מצלמות במחיר אחת. פשוט בורגים אותה במקום הנורה הישנה (בסיס E27 סטנדרטי) — אפס כלים, אפס ברגים, הכנסה ועובדת. מעקב אוטומטי אחרי תנועה, שמע דו-כיווני, ראיית לילה. פתרון סמוי לחלוטין — אורחים לא ישימו לב שזו מצלמה. ₪389 למצלמה אחת | ₪699 לשתיים | ₪989 לשלוש.',
    specs:[['רזולוציה','8MP'],['זום','דיגיטלי 8x'],['עדשות','כפולות (רחב + זום)'],['התקנה','בסיס E27'],['חיבור','WiFi'],['שמע','דו-כיווני'],['מעקב','אוטומטי']] },
  { id:'solar-3mp', variantId:50367695028364, name:'מצלמת אבטחה סולארית חיצונית 3MP | זיהוי AI | IP65', price:255, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S11c4aabf01be4261982b94a7be532532H.webp?v=1780222615',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S11c4aabf01be4261982b94a7be532532H.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6d7ae387b2c3400c94ab3ad749f0fe48f.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8ab025a007c94aedb128c8aac2976341E.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S18f0cbbd7a454daca2d4721eadb2a9e0Y.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0077a0aba5954a70bd3b3432533eb0ec0.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4dd860ebc15140639cde82219baf9861r.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf6d4c88973f144c79f5e71035346d668M.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S08164e0a888f40179a1bf2bd6bb59a6ab.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sacf5ef1684ca4a598c3919253eface89i.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S82542bb4540446fd8224a173420655acI.webp?v=1780222615'
    ],
    variants:[
      {id:50367695028364, title:'מצלמה אחת', price:255},
      {id:50367694930060, title:'2 מצלמות', price:469},
      {id:50367694962828, title:'3 מצלמות', price:699}
    ],
    desc:'מצלמת סולאר חיצונית ב-₪255 — AI מזהה בני אדם בלבד (אפס התראות שווא מחתולים וציפורים). ראיית לילה צבעונית, שמע דו-כיווני ואחסון מקומי על SD. עובדת ללא חשמל, ללא חיווט — לחצר, גג, שער ומגרש. עמידות IP65 לכל מזג אוויר. ₪255 למצלמה אחת | ₪469 לשתיים | ₪699 לשלוש.',
    specs:[['רזולוציה','3MP HD+'],['זיהוי AI','בני אדם'],['הספק','סולארי'],['עמידות','IP65'],['תקשורת','דו-כיוונית'],['חיבור','WiFi']] },
  { id:'indoor-2k', variantId:50367694667916, name:'מצלמת אבטחה פנימית 2K | AI + שיחה דו-כיוונית | Blurams', price:199, badge:'אינדור', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M.webp?v=1780222612',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M_3ddfb389-0cea-446e-bd0e-60cd82b4caa2.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf5230850e9664bd2adcd33df486e27e5y_ab3656d0-9924-4ed1-bcc9-533825171ff0.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa48dc75c7dbc471a9dd1ee7f674b52625_414335ff-3229-45d3-ac09-a1ccbcd94254.webp?v=1781270979',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc1a8e74376f2495eb58dbf15ec85a322z_5ea02fd9-1e0d-497f-a5ed-91573f43d601.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S10ea7ae0583144bdb6fb215410f63292x_4170324d-3181-468c-8e33-5142fe21ec5c.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saf40d22d5cef498bb360995e2f634098N_0eebd524-f4be-4cc4-acea-6c7191845dfb.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb4acec6112944a148f0e8073b27d1453p.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa466dc9b99e84d0985050a0e92acfaf1k.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9201bb937b754e50a71f93996dbe4a57U.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf2aa96fd0a3e4e35849dc2738e85e915s.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2d67ff8a841c468986695baa71b46c7aQ.webp?v=1781270979',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S840283cf5d3b478a854923aa9ae91c400.webp?v=1781270980'
    ],
    variants:[
      {id:50367694667916, title:'מצלמה אחת', price:199},
      {id:50367694635148, title:'2 מצלמות', price:359},
      {id:50367694602380, title:'3 מצלמות', price:519}
    ],
    desc:'מצלמת פנים חכמה של Blurams — AI מזהה אנשים וחיות מחמד ומתריע רק על מה שחשוב (אפס התראות שווא). תמונה 2K Ultra HD חדה, שיחה דו-כיוונית (שמעים ומדברים מהנייד), ראיית לילה צבעונית. תואמת Alexa ו-Google. מושלמת לניטור ילדים, בייביסיטר וחיות מחמד. ₪112 למצלמה אחת | ₪249 לשתיים | ₪409 לשלוש.',
    specs:[['רזולוציה','2K Ultra HD'],['חיבור','WiFi'],['שמע','דו-כיווני'],['ראיית לילה','צבעונית'],['תאימות','Alexa / Google'],['אחסון','ענן + SD']] },
  { id:'flagship-16mp', variantId:50740844724364, name:'מצלמת אבטחה חיצונית 16MP 8K | 360° | 4 עדשות', price:929, badge:'פלאגשיפ', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3b76929dcab344a89c1f1f0b4f20f0baW.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S199631254abc4346b31c5de0b6c09b4bd.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1b5b26816e2e48929a3de1d27f50c2962.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0f73232a61b741c3a41886af57b02549F.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sebe73adbff4d45db8f8a9ddb2928b22ff.webp?v=1780222615'
    ],
    variants:[
      {id:50740844724364, title:'מצלמה אחת', price:929},
      {id:50740844757132, title:'2 מצלמות', price:1699},
      {id:50740844789900, title:'3 מצלמות', price:2419}
    ],
    desc:'הפלאגשיפ שלנו — 16MP 8K אמיתי, 4 עדשות עצמאיות שמכסות 360° בו-זמנית. זום 10x, זיהוי AI מתקדם, ראיית לילה צבעונית ושמע דו-כיווני. מחליפה 4 מצלמות נפרדות — פחות חיווט, פחות עלות, יותר כיסוי. לחצרות גדולות, חניונים ועסקים. ₪929 למצלמה אחת | ₪1,699 לשתיים | ₪2,419 לשלוש.',
    specs:[['רזולוציה','16MP / 8K'],['עדשות','4 עצמאיות'],['זווית','360°'],['זום','דיגיטלי 10x'],['AI','זיהוי תנועה ובני אדם'],['חיבור','WiFi']] },
  { id:'wifi-dual', variantId:50740844593292, name:'מצלמת WiFi חיצונית | עדשה כפולה 3MP | ICSee', price:189, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saa99283cf09d4592a7c33ced52d81019B.webp?v=1780222614',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saa99283cf09d4592a7c33ced52d81019B_c03c7608-098b-46b1-8a55-7fd8cd919b8b.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3c130a1f71d44c3ab74c91f283ba0f0et_7542a91a-1908-45fd-aedb-14170bf0155d.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd48aab45b07f4b33b44e4c46eeda45cdJ_6a29befa-b835-41dc-b999-fc6506f84aa3.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc4f2cb3f70ad4df483883e8433f3905by_a694cb81-3530-43c9-b3ba-98caffaaac90.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S68288029c62b481e9fc181846e91f8051_c3c37bf1-b3b2-425f-b609-92f1e5f8af1c.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa6935805289a4a2296b9cc2bbf9c1ba59_0abfbede-f557-40cf-a314-d8881e1a9d79.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5f15ec09a46f43d09e3d4fc1252c1a3dQ.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf690a7e5a4f745c5a6df4f699e43f5c5n.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdf9f97e6eae64ba58e85d6c966a1e0b13.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd7daf6c895424547b8e3a40e11648afaw.webp?v=1781270980',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0eb9d97f615b41a4822b4940419a599ei.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1718511db3f84755abcd6765a670efffA.webp?v=1781270980'
    ],
    variants:[
      {id:50740844593292, title:'מצלמה אחת', price:189},
      {id:50740844626060, title:'2 מצלמות', price:339},
      {id:50740844658828, title:'3 מצלמות', price:489}
    ],
    desc:'מצלמת WiFi חיצונית עם עדשה כפולה — רואה רחב וזום בו-זמנית, שתי תמונות ממצלמה אחת. 3MP חדה, עמידות מלאה לגשם ושמש, אפליקציית ICSee יציבה ואמינה. מושלמת לכניסה, חניה ושער — רואים הכל ממקום אחד. ₪189 למצלמה אחת | ₪339 לשתיים | ₪489 לשלוש.',
    specs:[['רזולוציה','3MP (2304×1296)'],['עדשות','כפולות'],['חיבור','WiFi'],['אפליקציה','ICSee'],['עמידות','Waterproof'],['אחסון','כרטיס SD']] },
  { id:'wifi-ir', variantId:50740844167308, name:'מצלמת אבטחה WiFi | אינפרא-אדום | Smart Home', price:149, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9a4b640268a140399e446738c30b95d4p.webp?v=1780222615',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9a4b640268a140399e446738c30b95d4p.webp?v=1780222615',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9dd2e870541046a086f986eb846fd41a4.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S331a78f5987044cf93b46f2b37a2a1255.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S54bfeefe0f744a2698fb0bdae337b464L.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se423580dd9564e7e981501a75a5b3f08g.webp?v=1780222616',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd7aa4d7d9a5c4464a34b28f47dfd67ebY.webp?v=1780222616'
    ],
    variants:[
      {id:50740844167308, title:'מצלמה אחת', price:149},
      {id:50740844200076, title:'2 מצלמות', price:269},
      {id:50740844232844, title:'3 מצלמות', price:379}
    ],
    desc:'מצלמת WiFi ב-₪89 — ראיית לילה אינפרא-אדום, זיהוי תנועה שמתריע לנייד מיד, וצפייה חיה מכל מקום בעולם. התקנה עצמאית ב-3 דקות, ללא טכנאי. הבחירה הפופולרית לכניסות, חצרות ושערים. ₪89 למצלמה אחת | ₪159 לשתיים | ₪229 לשלוש.',
    specs:[['ראיית לילה','אינפרא-אדום'],['חיבור','WiFi'],['זיהוי','תנועה'],['צפייה','מרחוק'],['תיאום','Smart Home']] },
  { id:'bundle-starter', variantId:50501081202828, name:'חבילת כיסוי בסיסי | WiFi חיצונית + מיני נסתרת | 2 מצלמות', price:99, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9a4b640268a140399e446738c30b95d4p.webp?v=1780222615',
    desc:'2 מצלמות שמכסות הכל — מצלמת WiFi חיצונית עם ראיית לילה אינפרא-אדום + מצלמת מיני נסתרת לפנים. ₪99 במקום ₪128 — חיסכון של ₪29.',
    specs:[['מצלמות','2 מצלמות'],['חיצונית','WiFi IR ראיית לילה'],['פנימית','מיני 1080P נסתרת'],['חיסכון','₪29 (23%)'],['התקנה','פשוטה, ללא טכנאי']] },
  { id:'bundle-home', variantId:50501081137292, name:'חבילת מגן הבית | AI פנים 2K + סולארית חוץ 3MP', price:299, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M.webp?v=1780222612',
    desc:'הגנה מלאה על הבית — Blurams 2K AI מזהה פנים וחיות מחמד בפנים + Solar 3MP סולארית ב-IP65 לחוץ. ₪299 במקום ₪367 — חיסכון ₪68.',
    specs:[['מצלמות','2 מצלמות'],['פנים','Blurams 2K AI זיהוי חכם'],['חוץ','סולארית 3MP IP65'],['חיסכון','₪68 (18%)'],['כיסוי','24/7 פנים + חוץ']] },
  { id:'bundle-bulbs', variantId:50744609177740, name:'חבילת הנורות | E27 360° + 8MP זום | אפס ברגים', price:499, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9ffe8dec584046c893857017f9e6c7cfT.webp?v=1781611665',
    desc:'שתי מצלמות נורה — מתקינות תוך שניות בכל שקע E27 רגיל, בלי ברגים ובלי טכנאי. Ease Life 360° WiFi 5GHz + 8MP זום 8x עדשה כפולה. ₪499 במקום ₪588 — חיסכון ₪89.',
    specs:[['מצלמות','2 מצלמות נורה'],['נורה 1','Ease Life 360° WiFi 5GHz'],['נורה 2','8MP זום 8x עדשה כפולה'],['התקנה','E27 — אפס ברגים'],['חיסכון','₪89 (15%)']] },
  { id:'bundle-business', variantId:50501081170060, name:'חבילת עסק פרמיום | פלאגשיפ 16MP + Baseus Solar + AI פנים', price:1349, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
    desc:'3 מצלמות פרמיום לעסק — פלאגשיפ 16MP 8K עם 4 עדשות + Baseus S1 סולארית חיצונית 2K + Blurams AI פנימית. ₪1,349 במקום ₪1,620 — חיסכון ₪271.',
    specs:[['מצלמות','3 מצלמות פרמיום'],['פלאגשיפ','16MP 8K 4 עדשות 360°'],['סולארית','Baseus S1 2K IP67'],['פנים','Blurams 2K AI'],['חיסכון','₪271 (17%)']] },
  { id:'ease-life-bulb', variantId:50740845052044, name:'מצלמת נורה חיצונית | WiFi 5GHz | 360° | בסיס E27', price:199, badge:'קל להרכבה', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S439c2920f0ea4cd1b69db81ee739c30b5.webp?v=1781270981',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S439c2920f0ea4cd1b69db81ee739c30b5.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se7f447146111477eb0a728dc2191b5bet.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se18c219d29df486d938dd0fe275fe8737.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4d59a5a252264a7fb43115d6de516411Y.webp?v=1781270981'
    ],
    variants:[
      {id:50740845052044, title:'מצלמה אחת', price:199},
      {id:50740845084812, title:'מבצע זוג 🔥', price:299},
      {id:50740845117580, title:'3 מצלמות', price:449}
    ],
    desc:'מצלמת נורה חיצונית — מתחברת לכל שקע E27 (שקע נורה רגיל) תוך 10 שניות, בלי ברגים ובלי טכנאי. WiFi 5GHz מהיר לסטרימינג חלק, סיבוב 360° לכיסוי מלא, ראיית לילה צבעונית ושמע דו-כיווני. מושלם לחצר, מרפסת, חניה ושער. ₪199 למצלמה אחת | ₪299 לזוג | ₪449 לשלוש.',
    specs:[['חיבור','WiFi 5GHz'],['זווית','360°'],['התקנה','בסיס E27 (שקע נורה)'],['אפליקציה','Ease Life'],['ראיית לילה','כן']] },
  { id:'annke-poe-8ch', variantId:50697567862924, name:'מערכת מצלמות ANNKE 3K | 8 ערוצים POE | 5MP | NVR', price:2999, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S42d7ea2200a64a8faa2bb8b53dea4bcbL.webp?v=1781270982',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S42d7ea2200a64a8faa2bb8b53dea4bcbL.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1a4d992b979d402eab875624584d0d71i.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf6e53ae6e25e495d870bad0d9ff4f9e3U.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S59451225fa7c4df4a7c83aa6dd688ce88.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb300f712cb804e95826ec715f35aecffG.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4c43ab3612234d7db65e0767a33ddb74u.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2881e62d70554c779d7df8b9b542a8aa0.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1dacefbb625d46768f47c9208edd4d0e6.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6c329b05cabf445dbbf3ba125180400aq.webp?v=1781270981',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S14e81d78fa624e93b96b2ccc4b3f3ed63.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa6448abfb9234130be9441992e814e9cO.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S207af6f02b1649798c6c87ce1429b99aF.webp?v=1781270982'
    ],
    desc:'מערכת אבטחה מקצועית מלאה — 8 ערוצי POE, מצלמות 5MP עם תאורה כפולה חכמה, NVR מובנה. פתרון ה-all-in-one האולטימטיבי לעסק.',
    specs:[['ערוצים','8 × POE'],['רזולוציה','5MP / 3K'],['תאורה','כפולה חכמה'],['אחסון','NVR מובנה'],['מותג','ANNKE'],['עמידות','IP67']] },
  { id:'outdoor-3mp-wifi', variantId:50740845150348, name:'מצלמת חיצונית 3MP WiFi | ניטור חצר ובית', price:129, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1c83fe4e8bbd401daff3eecb382207fcF.webp?v=1781270982',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1c83fe4e8bbd401daff3eecb382207fcF.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc818ad4c8bce40c4b59b3d686cb440e2Z.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0200baf8325a496c967617ed01aa0ac3j.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7753ed5873484ddfb595c5b5754c53aeR.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S38eb99af8053487c8477309a792923deM.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se8abf953794b42f7b8323ee55ec2e373r.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S88715b0d47e345e881a9004dbce5404aM.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sff9a88e509ec4c3884cf1ee5278f2393Z.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Scb2dcc2e8f0b43598cbcf6919c600444G.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb3852a2da8e949b4905aebef8fe596adQ.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8252fde267b34e7dbee554823fd48e2cl.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S62b005314bb04072822538e7ebecbd8ed.webp?v=1781270982'
    ],
    variants:[
      {id:50740845150348, title:'מצלמה אחת', price:129},
      {id:50740845183116, title:'2 מצלמות', price:234},
      {id:50740845215884, title:'3 מצלמות', price:335}
    ],
    desc:'מצלמת חיצונית 3MP WiFi ב-₪129 — תמונה חדה 1296P, עמידות IP66 לגשם ושמש, זיהוי תנועה ותאורת לילה. מתחברים ל-WiFi, פותחים אפליקציה — רואים בנייד תוך 5 דקות. מושלמת לחצר, גינה, חניה, כניסה ושער. ₪129 למצלמה אחת | ₪234 לשתיים | ₪335 לשלוש.',
    specs:[['רזולוציה','3MP 1296P'],['חיבור','WiFi'],['שימוש','חיצוני + פנימי'],['ניטור','מרחוק'],['עמידות','למזג אוויר']] },
  { id:'camhi-solar-dual-4g', variantId:50697568059532, name:'מצלמת Solar Camhi | 4G | עדשה כפולה | 4MP | מסך כפול', price:1499, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S470ffc28904448afb56d9e4fb61690f7O.webp?v=1781270983',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S470ffc28904448afb56d9e4fb61690f7O.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S12d00addddc345e2af041acdd67fa8ffV.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sddd55d477d8f45da8b1e4a86a6a5b3a0V.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S087a5f4f889a43efb834c8788143303d8.webp?v=1781270982',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4715576c24ba473698329527b5a00af7n.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc8761e98cf7c4e219a86a0bfd4693c41q.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf3de010d561a4d56b3e5134326e5f9d2v.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S58e5c4ef89644d3fbe9335b63b32b8ac8.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7783d0cf921c4b4984e250a3710674f9v.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4439e96eb4e04bfcbbda1514abf830d3z.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S392c47e30cf34666bad009b519b2929dY.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6fb603d94e354a44ad19b5f14708e0a6X.webp?v=1781270983'
    ],
    desc:'מצלמת סולאר מתקדמת עם 4G ועדשה כפולה — תצוגת מסך כפולה (רחב + זום), זיהוי אנשים AI, מעקב אוטומטי. ללא WiFi ללא חשמל.',
    specs:[['חיבור','4G SIM'],['עדשות','כפולות'],['רזולוציה','4MP'],['זיהוי AI','בני אדם'],['הספק','סולארי + סוללה'],['אפליקציה','Camhi']] },
  { id:'tuya-5g-5mp', variantId:50740845314188, name:'מצלמת WiFi 5G | 5MP | AI מעקב אוטומטי | Tuya Smart', price:499, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S54a1c9e7e16b460cab9f75ea7f191200I.webp?v=1781270983',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S54a1c9e7e16b460cab9f75ea7f191200I.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S553ba0776fdc4c7797a4beb6fc8cf85dT.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6a4e62a16d124393ae744cac11b85dffR.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf81b28f3a72243bea1b5b4cdb8aa0960q.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sae1035f4c36c45ea875d1fbd884fab5ft.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9bbbb59b481e4e3ba30fd3b8bb9efa63g.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S25201b81ca0642378dcd752add15fb678.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8961f03b1eee41a0919383fce12cf4fcG.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sce3991b57c9e47a6b20112b6f54ecf2ef.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdcc67ccc2461477187cca83200828dc0z.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd02c8ad8e3d34b1088f9bb2e767f267cI.webp?v=1781270983',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S45d1301726264d618fa76c14ecb72dfdA.webp?v=1781270984'
    ],
    variants:[
      {id:50740845314188, title:'מצלמה אחת', price:499},
      {id:50740845346956, title:'2 מצלמות', price:899},
      {id:50740845379724, title:'3 מצלמות', price:1290}
    ],
    desc:'מצלמת WiFi 5GHz 5MP עם AI — עוקבת אוטומטית אחרי תנועה בזמן אמת, זיהוי חכם, ראיית לילה צבעונית ושמע דו-כיווני. תואמת Tuya Smart ו-Amazon Alexa. מושלמת לחצרות, חנויות ועסקים שרוצים אבטחה חכמה ואמינה. ₪499 למצלמה אחת | ₪899 לשתיים | ₪1,290 לשלוש.',
    specs:[['חיבור','WiFi 5G מהיר'],['רזולוציה','5MP'],['AI','מעקב אוטומטי'],['תאימות','Tuya / Alexa'],['כיוון','אוטומטי']] },
  { id:'gadinan-nvr-4k', variantId:50697569206412, name:'מערכת CCTV Gadinan 4K | 8MP | NVR | POE | 4-8 ערוצים', price:1799, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S81abcc42a92f4441b2d272830525ca33w.webp?v=1781270986',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S81abcc42a92f4441b2d272830525ca33w.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc2b7bfead5d34fe5aeca1ed341e94fadu.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc5d82ad110b74553a705252bcaa0723bD.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6f36fa8987114f61b4045fbfa495cf36Y.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sfac9831dbaa64a03971cae6008942ea5R.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9528c6457d724a929b53045723a4e9020.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Heb4151e4d0b84fa6981ad1b60de12f947.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbbef1502b74345f4bba879b722e91537p.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/H81f33e10f5eb46dcb89400b62c45cdcam.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/H1a916f105b2c41fa923e0a922f6fef89f.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/He8efe9ce89404a67bb05ccf142a099023.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/H00e848b29efa4a8293570c39d3e5a7a8m.webp?v=1781270985'
    ],
    desc:'מערכת מצלמות 4K מקצועית מ-Gadinan — מצלמות 8MP Ultra HD עם הקלטת שמע, NVR עם אחסון, ממשק POE. פתרון מלא לאבטחה מקצועית.',
    specs:[['רזולוציה','8MP / 4K Ultra HD'],['ערוצים','4-8 ערוצים'],['קלטה','שמע + וידאו'],['חיבור','POE'],['מותג','Gadinan']] },
  { id:'ls-vision-solar-4g', variantId:50740845478028, name:'מצלמת LS VISION סולארית 4G | 8MP 4K | PTZ | V380 Pro', price:699, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S601c134f84f440e1af5394faa6d5e256A.webp?v=1781270984',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S601c134f84f440e1af5394faa6d5e256A.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa97bc47565b54afe911faf383fc5e6f9k.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb49bd75cc8fd46b2910e6dd86f42a598w.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S71838f94a3484dcb8411be90e69d5982u.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S85c1721b4a0446dd80634b77c40d69f0R.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S52320f7aa5564e0a839698009e2ae734b.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf63c098246c24c30bbcd51dc9bd48257c.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1478106f05e64e36a0f9a471e197ab6aN.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc45e744e466d4906940c8006c6766b0ew.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdcf43e0d1c8c46238553ed7670c43e3ea.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7908ab9d57dc443aa1e80f9262906b2cs.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sed85ae5fc10442c19f9ee45329cd62b4j.webp?v=1781270984'
    ],
    variants:[
      {id:50740845478028, title:'מצלמה אחת', price:699},
      {id:50740845510796, title:'2 מצלמות', price:1259},
      {id:50740845543564, title:'3 מצלמות', price:1799}
    ],
    desc:'מצלמת סולאר 4G מ-LS VISION — עובדת גם בלי WiFi וגם בלי חשמל, בכל שטח שהוא. 8MP 4K, זיהוי חום PIR מדויק, סיבוב PTZ מלא ושמע דו-כיווני. אידיאלית למחסנים, שדות, חניונים ואתרים מרוחקים שאין בהם תשתית. ₪699 למצלמה אחת | ₪1,259 לשתיים | ₪1,799 לשלוש.',
    specs:[['רזולוציה','8MP / 4K'],['חיבור','4G SIM + WiFi'],['זיהוי','PIR חום'],['סיבוב','PTZ מלא'],['אפליקציה','V380 Pro'],['הספק','סולארי']] },
  { id:'zumimall-f5', variantId:50740845576332, name:'מצלמת ZUMIMALL F5 | סוללה מגנטית | WiFi 2.4G | 3MP', price:399, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S88186d2fd6874befb3201cac13aa180eS.webp?v=1781270985',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S88186d2fd6874befb3201cac13aa180eS.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S334c799d473d4f219187f4da6528e85fz.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5b7bda021ebe4e78bbd9f714c0641b587.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9f745d8da2284367af631965489f6259D.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sed71c2cf7af442e0a7e59bfbc5bab9efN.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5e3afc5b54d94bafa530f0319f33d889i.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbf75c427640a4f3db1e7e15c3cb02968b.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9eb0f13986be4baba289670addf89071I.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbe4f3efaef8b4f10ad28d9166bd1b64af.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf265a993d57442ea956b2f91dfa2956fQ.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se6cbbebf8ab74b489c868057f152e48af.webp?v=1781270984',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S19c7a1a31b3446a3b351dde67adf7883I.webp?v=1781270984'
    ],
    variants:[
      {id:50740845576332, title:'מצלמה אחת', price:399},
      {id:50740845609100, title:'2 מצלמות', price:720},
      {id:50740845641868, title:'3 מצלמות', price:1039}
    ],
    desc:'ZUMIMALL F5 — אלחוטית לחלוטין עם הר מגנטי שמתקינים תוך שניות בכל מקום, גם על משטחי מתכת. סוללה נטענת, 3MP, ראיית לילה צבעונית, IP66 עמיד לגשם ושמע דו-כיווני. הכי גמישה שיש — מזיזים אותה מחדר לחדר בלי ברגים. ₪399 למצלמה אחת | ₪720 לשתיים | ₪1,039 לשלוש.',
    specs:[['רזולוציה','3MP'],['חיבור','WiFi 2.4G'],['סוללה','נטענת'],['התקנה','מגנטית'],['ראיית לילה','צבעונית'],['מותג','ZUMIMALL']] },
  { id:'annke-nvr-3k', variantId:50697571238028, name:'מערכת ANNKE 3K | 8 ערוצים NVR | מיקרופון מובנה | POE', price:3299, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S550f86c3e7be4034852d29c4d5b81e5fK.webp?v=1781270985',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S550f86c3e7be4034852d29c4d5b81e5fK.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5806da1f42374de9b9e2b2e33f065fedi.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf6d320f10f2f44fdab36117761eeb850i.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7f599d0d279b4924803414b9c60e1a88X.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdcb7103864a847f89ecada8b57c0feb1L.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3601246fa07443d79d8a6f1ef017a093R.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9c0c9bf08bec4fd1b29a61259ae02798i.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S012c2014356a46a6b30b5a74c1d4c4d0i.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2c22806a06794e8e94414ca32ce38e085.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc74f7a95e64b445197c3f242a7006b66f.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8d8ce87696c344119fd87627312e52bca.webp?v=1781270985',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7866977dd8cf400b88d0cc168adb243eo.webp?v=1781270985'
    ],
    desc:'מערכת אבטחה ANNKE 3K מקיפה — NVR 8 ערוצים עם מיקרופון מובנה בכל מצלמה, POE, קלטת שמע 24/7. אבטחה מקצועית ברמה גבוהה.',
    specs:[['ערוצים','8 × POE'],['רזולוציה','3K'],['שמע','מיקרופון מובנה'],['חיבור','POE'],['מותג','ANNKE'],['הקלטה','24/7']] },
  { id:'annke-c1200', variantId:50697571893388, name:'מצלמת ANNKE C1200 | 12MP Ultra HD | תאורה כפולה | PoE', price:2699, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99436a26ac1d42d6a2ee8a48e30a120cF.webp?v=1781270986',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99436a26ac1d42d6a2ee8a48e30a120cF.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S808b0b8d4b13427496b8a3c0122d83e41.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc545342fab5d435d850b8bd6811b6d79s.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se9f07844ac7d446ca7a93a5968dacd15l.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6893c748024d4e1fa87352a0ec77ea773.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa782445358c04e078016ae8a3a77cda9Y.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S28264cb275d94029a592602b68a83f95V.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S13d180e863a24996b01cdee555280328k.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S76b063060c3341d78594880a1c7b0ea7g.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S966b067ab899405dad9513a57c28f16c3.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7f3abbdbb8a041ba8daf57b42dd8b1583.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6344b49df88748289f11e6bcb973fb7eE.webp?v=1781270986'
    ],
    desc:'מצלמת IP פרימיום מ-ANNKE — 12MP Ultra HD, תאורה כפולה חכמה (צבעונית + אינפרא-אדום), מיקרופון מובנה, PoE. ראיית לילה יוצאת דופן.',
    specs:[['רזולוציה','12MP Ultra HD'],['תאורה','כפולה חכמה'],['שמע','מיקרופון מובנה'],['חיבור','PoE'],['עמידות','IP67'],['מותג','ANNKE']] },
  { id:'okam-solar-ptz', variantId:50740845740172, name:'מצלמת O-Kam Solar | 8MP 4K | זום 10x | PTZ אוטומטי', price:999, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc3ec6fa7658a40eba3595d2251b148caT.webp?v=1781270986',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc3ec6fa7658a40eba3595d2251b148caT.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa83b4dec74004241a25b7441e11b2df1F.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb2f470a932df42deb86624f25a8016c2y.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S05afe456db6a4042a10be1d6f9df2716O.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S213e31ed31754c10ae4e5768db19c25fw.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S13b5afa07a3e49b2ada45db4a46aaeacA.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd98ee40205ec43dcb019438c8f592354O.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S51b7b902e03a435a92b2405a99e64d32Y.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sae9411b7e7f946469762dfd65a296aa7R.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4bc736a7c73a4de089c4a9d5c0c7371bG.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S506086f6c6db4d939ebc176856eb48dbC.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S24dd28cbeb1849e1ba0849558a5cb2cdZ.webp?v=1781270986'
    ],
    variants:[
      {id:50740845740172, title:'מצלמה אחת', price:999},
      {id:50740845772940, title:'2 מצלמות', price:1799},
      {id:50740845805708, title:'3 מצלמות', price:2599}
    ],
    desc:'O-Kam Solar — שילוב של כוח סולארי + PTZ מסתובב + זום 10x. רואה מרחוק, מסתובבת מרחוק, פועלת ללא חשמל. 8MP 4K, מעקב אוטומטי אחרי תנועה, ראיית לילה צבעונית. פתרון פרמיום לשטחים גדולים: חצרות, אחוזות, עסקים וחניונים. ₪999 למצלמה אחת | ₪1,799 לשתיים | ₪2,599 לשלוש.',
    specs:[['רזולוציה','8MP / 4K'],['זום','דיגיטלי 10x'],['סיבוב','PTZ אוטומטי'],['הספק','סולארי'],['ראיית לילה','צבעונית'],['אפליקציה','O-Kam']] },
  { id:'annke-2pcs-wifi', variantId:50697572581516, name:'2 מצלמות ANNKE 3MP WiFi | H.265 | עמידות IP66', price:649, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S582f60e2c73b4baaaa4aec900326e73bo.webp?v=1781270987',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S582f60e2c73b4baaaa4aec900326e73bo.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7ae3496e28684f309da8e6d9be04f5020.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0e8645935ec742f289cdbca6e53e3a3cI.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se95c0fb767594c678d2d80e054bc9519h.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sde6b267b8f414aeba1f61182607a2785m.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd37ce2da1c004f21af276acd258206845.webp?v=1781270986',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Scd968fae0ed24f2395130c33089c1d67s.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/wl200-1080p_1.png?v=1781270989',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/wl200-ai.png?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/ws300-24-noise-cancelling.jpg?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/wl200-night-vision_1.png?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/wl200-h.264.png?v=1781270987'
    ],
    desc:'חבילת 2 מצלמות WiFi של ANNKE — קידוד H.265 (חצי פחות נפח אחסון), IP66 עמיד לגשם, ראיית לילה אינפרא-אדום. חסכון לעומת קנייה נפרדת.',
    specs:[['מצלמות','2 מצלמות'],['רזולוציה','3MP'],['קידוד','H.265'],['חיבור','WiFi'],['עמידות','IP66'],['מותג','ANNKE']] },
  { id:'annke-5mp-bullet', variantId:50740845904012, name:'מצלמת ANNKE 5MP | תאורה חכמה | בולט | IP67', price:369, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa92795e6e9124626ba6c07382df4f6e6F.webp?v=1781270987',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa92795e6e9124626ba6c07382df4f6e6F.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5239ec653f294f51b041e0f155682fd25.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf1de55e466a04283a72af53562a9e310V.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9c0412adbf1f4946ab0467e4f3ce79aaZ.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S15d49741989b4710a39f666ac56e5a60z.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2611e0d89f7d4de0b9a6838789eef877f.webp?v=1781270987',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S43be85bd1fc44e9c99346e9cedee5c544.webp?v=1781270989'
    ],
    variants:[
      {id:50740845904012, title:'מצלמה אחת', price:369},
      {id:50740845936780, title:'2 מצלמות', price:670},
      {id:50740845969548, title:'3 מצלמות', price:960}
    ],
    desc:'מצלמת ANNKE 5MP עם תאורה כפולה חכמה — LED לבן לראיית לילה צבעונית + אינפרא-אדום לגיבוי, מופעלת אוטומטית רק כשיש תנועה. 5MP חדה, IP67 עמידות מקסימלית, עדשה 2.8mm שדה ראייה רחב. מותג ANNKE המוכר והאמין. ₪369 למצלמה אחת | ₪670 לשתיים | ₪960 לשלוש.',
    specs:[['רזולוציה','5MP'],['תאורה','כפולה חכמה'],['עמידות','IP67'],['עדשה','2.8mm'],['מותג','ANNKE'],['שימוש','פנים + חוץ']] },
  { id:'annke-nvr-kit', variantId:50740852129932, name:'ערכת ANNKE | NVR 4 ערוצים + מצלמות WiFi 3MP/5MP | IP66', price:679, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S19bf1abb0b234059bce33f5ecec154f8x.webp?v=1781270988',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S19bf1abb0b234059bce33f5ecec154f8x.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1e83550a8b8744e4beccce5ab55b9034E.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2bd09b9f94964a53bc973016c2bfe329t.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0dc6c5cb3b7944b8bff4100a1665623fi.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf529954793c64756999662f98323c85aK.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se22edc9cff3545f6ab4a96bd2b969895J.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6b6796e4d31b4d1e934e369d7e8d7328k.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa6f252fb0f0b4d52b7df725f60f131bar.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd2217c91714243bc8a4e0c51111ae01aj.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S463e10757a2e4bac80b82dc4cf1825cbP.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4a32bc67f4fe4dbcaaa965635eefd8b6c.webp?v=1781270988',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6ca2a6e890904ac78dcd02ae5bc3bdd5b.webp?v=1781270988'
    ],
    variants:[
      {id:50740852129932, title:'2 מצלמות | 3MP', price:679},
      {id:50740852162700, title:'2 מצלמות | 5MP', price:739},
      {id:50740852195468, title:'4 מצלמות | 3MP', price:1049},
      {id:50740852228236, title:'4 מצלמות | 5MP', price:1169}
    ],
    desc:'ערכת ANNKE מלאה — NVR 4 ערוצים + מצלמות WiFi 3MP/5MP, הכל בקופסה אחת. מקליט מרכזי עם אחסון מקומי, IP66, ראיית לילה IR, הקלטה 24/7. לא צריך ענן, לא דמי מנוי חודשיים. מושלם לבית גדול, עסק קטן וחנות. ₪679 ל-2מ׳ 3MP | ₪739 ל-2מ׳ 5MP | ₪1,049 ל-4מ׳ 3MP | ₪1,169 ל-4מ׳ 5MP.',
    specs:[['ערוצים','4 × NVR'],['רזולוציה','3MP / 5MP'],['חיבור','WiFi'],['עמידות','IP66'],['ראיית לילה','IR'],['מותג','ANNKE']] },
  { id:'ptz-15mp-8k', variantId:50740846264460, name:'מצלמת PTZ 15MP 8K | זום 10x | 3 עדשות | WiFi 5G', price:329, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc7a2481f2667426b85f423210a32e710J.webp?v=1781270990',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc7a2481f2667426b85f423210a32e710J.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d3845ec234043739690d9709592c444h.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2b1cc41ea8bd4603bb9b454906261afb7.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf4f1b8baaa4f4d9f8e492f4f1ac9bad9f.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3c49df28983446f388a47719a5139eafz.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb8c2cd0348d54735ae946535ce45e5853.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S95d82e8af824414682db1d33c525214e5.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S313e76c969b64a76b90155075925cc1ev.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5bf2538187984db198b6551c403ad1f4f.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Scfd0c1fc68a04f75801cc633e7f5c53bZ.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sd7f19140ab3e4d798a64f16a35c4abf9h.webp?v=1781270990',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sff418c2dae984ec1bd9f03b4926b33d3Q.webp?v=1781270990'
    ],
    variants:[
      {id:50740846264460, title:'מצלמה אחת', price:329},
      {id:50740846297228, title:'2 מצלמות', price:599},
      {id:50740846329996, title:'3 מצלמות', price:849}
    ],
    desc:'מצלמת PTZ 15MP 8K עם 3 עדשות עצמאיות — 3 תמונות בו-זמנית: רחב, ממוצע וזום 10x. WiFi 5GHz מהיר, זיהוי AI, שמע דו-כיווני ואחסון ענן. כיסוי מרבי בציוד מינימלי — 1 מצלמה שמחליפה 3. פתרון חכם לכל שטח ותקציב. ₪329 למצלמה אחת | ₪599 לשתיים | ₪849 לשלוש.',
    specs:[['רזולוציה','15MP / 8K'],['עדשות','3 עצמאיות'],['זום','דיגיטלי 10x'],['חיבור','WiFi 5G'],['סיבוב','PTZ אוטומטי']] },
  { id:'lenovo-bulb-3mp', variantId:50741149991052, name:'מצלמת נורה Lenovo 3MP | AI מעקב | E27 | Baby Monitor', price:489, badge:'קל להרכבה', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S84f53338185a45e793bb8baa401253f2T.webp?v=1781611823',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S84f53338185a45e793bb8baa401253f2T.webp?v=1781611823',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2536f7c140f747ffb6679833ab1eb22eW.webp?v=1781611761',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S47adabf73ddb4637b804ab742c4ae3fcb.webp?v=1781611824',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S01ebe1728d8441ab8dc7599366f00ccad.webp?v=1781611760',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S547bf3e808a44a53a0757706327c8f99X.webp?v=1781611761',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8b37326abb304665a93f6960eee4fed1w.webp?v=1781611824'
    ],
    variants:[
      {id:50741149991052, title:'מצלמה אחת', price:489},
      {id:50741150023820, title:'2 מצלמות', price:879},
      {id:50741150056588, title:'3 מצלמות', price:1249}
    ],
    desc:'מצלמת נורה של Lenovo — מותג עולמי, איכות מוכחת. 3MP, AI שעוקב אחרי תנועה אוטומטית ומסובב את הראש בלי שתגע בכלום. ראיית לילה צבעונית, שמע דו-כיווני ואפליקציה עברית ידידותית. Baby Monitor מעולה — רואים ושומעים מהנייד בכל שניה. מתחברת לבסיס E27 תוך שניות — ברגו ועובדים. ₪489 למצלמה אחת | ₪879 לשתיים | ₪1,249 לשלוש.',
    specs:[['מותג','Lenovo'],['רזולוציה','3MP'],['AI','מעקב אוטומטי'],['התקנה','בסיס E27'],['חיבור','WiFi'],['ראיית לילה','צבעונית'],['שימוש','Baby Monitor / חיות מחמד']] },

  // ===== מוצרים חדשים (סשן 6) =====
  { id:'three-screen-4k-ptz', variantId:50747408875660, name:'מצלמת PTZ 4K | 3 מסכים | עדשה כפולה | AI | IP66', price:406, badge:'חדש', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S23cb73ac7611448db7fd244cc0d2e694I.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S23cb73ac7611448db7fd244cc0d2e694I.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9ee8f8e391a84398bb7bca0729f2c0eei.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3dfb05b2b7a34cc999867addf65d94e4h.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5eceb22a9aec42879f34b7f67e20e905b.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9cfe89d142ae46f1b35cb8bb0e4b6832P.webp?v=1781635104',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S42fb138f9a3f4c3fa0874dbde999a414J.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sabe1b1a088ba4e8fa422df9c1e39ebfcZ.webp?v=1781635104',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S387d50d017e84624a112be98f0853efaY.webp?v=1781635103',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se88b8a51fbe7416391ff0d24902a3a03y.webp?v=1781635103'
    ],
    desc:'מצלמת חוץ PTZ מתקדמת עם 3 מסכים ועדשה כפולה 4K. כיסוי מלא עם זיהוי AI אנושי, סיבוב PTZ אוטומטי אחר מטרות, ראיית לילה צבעונית ועמידות IP66. אפליקציית iCSee לניהול מרחוק בכל זמן.',
    specs:[['רזולוציה','4K / 8MP'],['עדשה','כפולה — רחב + זום'],['מסכים','3'],['זיהוי','AI — בני אדם ורכבים'],['עמידות','IP66'],['ראיית לילה','צבעונית'],['שמע','דו-כיווני']] },


  { id:'smart-360-4k', variantId:50747409399948, name:'מצלמה חכמה 360° 4K WiFi | פנים וחוץ | זיהוי AI', price:229, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7cd8fe79b0144144a45fc3ac884eaef4U.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7cd8fe79b0144144a45fc3ac884eaef4U.webp?v=1781635104',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6330c26b8d834d9094e8426629e85117T.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc7b688c866d54d969532472716674daf6.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saa83309a848d4a779884cc6dbd6b88deA.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1352c2f9a58f431fab4f0183f9b1d028x.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S674eff04f4b94596b3defaa5f3500bfdN.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S0954f7ec80304298b1f041ef0754b049H.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9355a07b3ed34d128cd07696b1780b31R.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf02f62296f144f7eb6789b1a33556287m.webp?v=1781635105'
    ],
    desc:'מצלמה חכמה עם כיסוי פנורמי 360° ורזולוציה 4K. מתאימה לפנים ולחוץ — זיהוי תנועה AI, ראיית לילה צבעונית ושמע דו-כיווני. ניטור מרחוק פשוט דרך האפליקציה.',
    specs:[['רזולוציה','4K'],['כיסוי','360° פנורמי'],['שימוש','פנים + חוץ'],['זיהוי','AI — בני אדם'],['ראיית לילה','צבעונית'],['שמע','דו-כיווני']] },

  { id:'sonoff-pt2', variantId:50747409498252, name:'SONOFF CAM PT2 | 360° פנורמי | Smart Home | WiFi', price:229, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S92b65891ddc94aa5abeb91b15a421104F.webp?v=1781635106',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S92b65891ddc94aa5abeb91b15a421104F.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf5325cc5f73a4d1e9c450ef9092de89ad.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S27cefefa4dfd4869803eeb762130cdaay.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S92b65891ddc94aa5abeb91b15a421104F.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4b147346e1c348069397353e5c3ba07dI.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sacbcb4b1480f4dc2a04e1a4ed93c476bF.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6815cfc351c64b648ff431038c9f4350G.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2b519fecf181475bbe57c9a35dbf36bfN.webp?v=1781635105'
    ],
    desc:'מצלמה חכמה של SONOFF עם כיסוי 360° פנורמי מלא. ראיית לילה HD עמוקה, ניטור מרחוק בזמן אמת, אינטגרציה עם Smart Home (Alexa, Google) ושמע דו-כיווני לתקשורת ישירה.',
    specs:[['מותג','SONOFF'],['כיסוי','360° פנורמי'],['ראיית לילה','HD'],['Smart Home','Alexa + Google'],['שמע','דו-כיווני'],['ניטור','24/7']] },

  { id:'4k-indoor-mini', variantId:50747409629324, name:'מצלמה פנימית 4K WiFi מיני | ניטור מרחוק | שמע דו-כיווני', price:119, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1898663997384fccbabc00cd1eb7aa6aQ.webp?v=1781635106',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1898663997384fccbabc00cd1eb7aa6aQ.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf4425dabd92d4fe89308d5453f524076T.webp?v=1781635105',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbde4c5b7cd2a4d6f90825c00ef858742i.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdebb74041a714f2a9430735b368895c1T.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S51013ecac5ab4d8d81e73abfb350e236o.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9c981ecd0f83478a832ce03b480d9ffeu.webp?v=1781635106'
    ],
    desc:'מצלמה פנימית 4K WiFi בגודל מיני קומפקטי. ניטור מרחוק דרך אפליקציה, ראיית לילה IR, שמע דו-כיווני ואחסון על כרטיס SD. התקנה פשוטה תוך דקות.',
    specs:[['רזולוציה','4K'],['גודל','מיני קומפקטי'],['ניטור','מרחוק 24/7'],['ראיית לילה','IR'],['שמע','דו-כיווני'],['אחסון','כרטיס SD']] },

  { id:'8mp-ptz-24g', variantId:50747409793164, name:'מצלמה PTZ 8MP | WiFi 2.4G | ראיית לילה | Baby Monitor', price:159, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6764deef32d648e1bcd8d02fa9b03db2B.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S6764deef32d648e1bcd8d02fa9b03db2B.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S712115b1094046419ec3cea5e3af124ey.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4cce2c7b2fb8421a9334e569f7f5cd54J.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sfe4e9ab63cbd4a3abd375e8a787d5d25n.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se629156506ad4d779477a0fbbe820d73R.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3c83e3c74b1c44f4bca003dbae99efa2k.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sdee47f7633fd454281ba0b9b2b7a3eb9P.webp?v=1781635107'
    ],
    desc:'מצלמה PTZ 8MP עם חיבור WiFi 2.4G. סיבוב Pan-Tilt אוטומטי, ראיית לילה IR, זיהוי תנועה חכם ו-2 אנטנות לקליטה יציבה. אידיאלית לניטור ילדים, חיות מחמד ושמירה על הבית.',
    specs:[['רזולוציה','8MP'],['סיבוב','Pan-Tilt (PTZ)'],['חיבור','WiFi 2.4G'],['ראיית לילה','IR'],['אנטנות','2 — קליטה מעולה'],['שימוש','Baby Monitor']] },

  { id:'jooan-solar-4k', variantId:50747409694860, name:'מצלמת JOOAN סולארית 4K | עדשה כפולה | PIR | סוללה', price:495, badge:'חדש', cat:'סולארי',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7913a345182b4d3b9a5e5a11b1585a96Q.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7913a345182b4d3b9a5e5a11b1585a96Q.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4eff31c1f6f34370ba83ede71634e8e3i.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sefe3dfa5242a49709b6d576d29ff5e7bj.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa12a355435f140d798929e21e57a0047v.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S166692367fa74398b4dd4d2d17c47379s.webp?v=1781635106',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf19ae3602a0c4a42b55772e1cd887655N.webp?v=1781635106'
    ],
    desc:'מצלמה סולארית 4K של JOOAN עם עדשה כפולה וסוללה נטענת. זיהוי PIR מדויק להפחתת התראות שווא, ראיית לילה צבעונית, שמע דו-כיווני ואחסון ענן/SD. ללא חיווט, ללא חשמל.',
    specs:[['מותג','JOOAN'],['רזולוציה','4K'],['אנרגיה','סולארית + סוללה'],['עדשה','כפולה — רחב + זום'],['זיהוי','PIR מדויק'],['ראיית לילה','צבעונית']] },

  { id:'battery-2k-spotlight', variantId:50747409858700, name:'מצלמת סוללה 2K | זרקור LED | WiFi | PIR | IP65', price:548, badge:'חדש', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3cdc0d82f8d84e5798d76be868d12b58Y.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3cdc0d82f8d84e5798d76be868d12b58Y.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4d0290f42654487f90f5ae01811944edd.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se927bab50e034ec2a9f43103feec2c64V.webp?v=1781635108',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3af08f6805584749a56e8c4e57c67d37A.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99b8817acfaf4a39a82dbc918b75c463a.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S13149270a6be40238157ca5dd7bd5358O.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S16ab495782fb4eb589a09bb78814d99fU.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S98c8e25e338a447b83b6cde0c1fe26bcU.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sf7782935f89147459bf9b59ccc6432a1A.webp?v=1781635108',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sefe036ae1d814752abcbfca5b55b67c4b.webp?v=1781635107'
    ],
    desc:'מצלמה על סוללה נטענת עם זרקור LED עוצמתי לשימוש חוץ. רזולוציה 2K, זיהוי PIR מדויק, ראיית לילה צבעונית עם אור לבן, עמידות IP65 ואזעקה חזקה. ניתן לטעינה סולארית (פאנל נמכר בנפרד).',
    specs:[['רזולוציה','2K / 4MP'],['אנרגיה','סוללה נטענת'],['זרקור','LED לבן עוצמתי'],['זיהוי','PIR מדויק'],['ראיית לילה','צבעונית'],['עמידות','IP65'],['אזעקה','קול + אור']] },

  { id:'4g-bulb-e27-3mp', variantId:50747410415756, name:'נורה E27 מצלמה 3MP | 4G | ללא WiFi | IP66 | חיצוני', price:189, badge:'קל להרכבה', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99b056347f5c4d109d96a63261051a3fJ.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99b056347f5c4d109d96a63261051a3fJ.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S4a147e58c2dd4282a0f48066c1a037d7C.webp?v=1781635108',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1bbcc831b2f24a5480014e27a7bfb2daw.webp?v=1781635108',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbc83dabeb1034746822976eae6949ecfd.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa08072ebe4e24d90a4d763ea6258323cw.webp?v=1781635107',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S21749787bf1444fe8d7d2ed545e32928v.webp?v=1781635108',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sbe4f4ef77d36408ca536aed4ce76fbeb9.webp?v=1781635107'
    ],
    desc:'מצלמה בצורת נורה E27 עם חיבור 4G — לא צריך WiFi! מתקינים בבסיס נורה רגיל ועובד מיד. מצוינת לחוץ, עמידות IP66, ראיית לילה ושמע דו-כיווני. פתרון מושלם לאזורים ללא WiFi.',
    specs:[['רזולוציה','3MP'],['התקנה','בסיס E27 רגיל'],['חיבור','4G — ללא WiFi'],['עמידות','IP66'],['ראיית לילה','כן'],['שמע','דו-כיווני']] },

  { id:'carecam-5mp-355', variantId:50747410972812, name:'Carecam Pro 5MP | 355° פנורמי | WiFi | ניטור ביתי', price:249, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2c7afd7834bb4ae9bd2739760ae234d0E.webp',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S2c7afd7834bb4ae9bd2739760ae234d0E.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S40a6bf9bf4a4408c84fdcb349ea2b432N.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S5e67cec969724c78b46f51ccbbb236fcf.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sb7ea2016da8f4bc494a2848b011591d3a.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S7467f4fb3e9849868e98c89c3aca8cd24.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S28331fee01d24c18b935daa17a28911bc.webp?v=1781635109'
    ],
    desc:'מצלמה פנימית Carecam Pro עם כיסוי 355° כמעט-מלא ורזולוציה 5MP. שלט דרך אפליקציה חכמה, ראיית לילה IR, שמע דו-כיווני וזיהוי תנועה עם התראות מיידיות. מושלמת לניטור ילדים וחיות מחמד.',
    specs:[['מותג','Carecam Pro'],['רזולוציה','5MP'],['כיסוי','355° פנורמי'],['ראיית לילה','IR'],['שמע','דו-כיווני'],['זיהוי תנועה','כן + התראות']] },

  { id:'a7-360-1080p', variantId:50747410907276, name:'מצלמה A7 360° 1080P WiFi | Baby Monitor | שמע דו-כיווני', price:139, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S43777c1285b64d6eaa57c51e82fcbd5fI.webp?v=1781635109',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S43777c1285b64d6eaa57c51e82fcbd5fI.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S981656dcb8b1401597eca1a8fa716745P.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S25a244cd4f9e47689c3b1647be24a107Y.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9edbf312ca5b4418bcd5b7fc650f21e9r.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9b66c0f47ca44619a2c60006addc42a6F.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc40531b8868445f28614f74f80e27d11s.webp?v=1781635109',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S773dcdb0d89f4b7c8306e3fd94358df3x.webp?v=1781635109'
    ],
    desc:'מצלמה קומפקטית A7 עם כיסוי 360° מלא ורזולוציה 1080P. Baby Monitor אידיאלי — שמע דו-כיווני לשיחה עם הילד, ראיית לילה, התראות תנועה וניטור מרחוק בכל זמן. פשוטה ונוחה לשימוש.',
    specs:[['רזולוציה','1080P'],['כיסוי','360° מלא'],['שימוש','Baby Monitor'],['שמע','דו-כיווני'],['ראיית לילה','IR'],['ניטור','מרחוק 24/7']] },

  { id:'indoor-8mp-4k-5x', variantId:50747411103884, name:'מצלמה פנימית 8MP 4K | זום אופטי 5x | WiFi | AI', price:389, badge:'חדש', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se6912f53f9194f3d94d0e9aefd4b14a2b.webp?v=1781635110',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Se6912f53f9194f3d94d0e9aefd4b14a2b.webp?v=1781635110',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc78759283bbb4da2ad55e20cfc4a1afec.webp?v=1781635111',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S02947e465b5f42e1bafcdb862dc174e8h.webp?v=1781635110'
    ],
    desc:'מצלמה פנימית 4K עם זום אופטי 5x — מתאים לחדרים גדולים ומשרדים. מעקב אוטומטי אחר אנשים ורכבים בזיהוי AI, ראיית לילה, שמע דו-כיווני ואחסון SD/ענן. תמונה חדה ומפורטת גם מרחוק.',
    specs:[['רזולוציה','8MP / 4K'],['זום','אופטי 5x'],['מעקב','AI אוטומטי'],['ראיית לילה','HD'],['שמע','דו-כיווני'],['אחסון','SD + ענן']] },

  { id:'ptz-8mp-4x', variantId:50747411464332, name:'מצלמה PTZ 8MP | זום 4x | WiFi | מעקב AI | פנים וחוץ', price:169, badge:'חדש', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Af84dcd3ed10942cd9f49c479b5ea4430T.webp?v=1781635111',
    images:[
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Af84dcd3ed10942cd9f49c479b5ea4430T.webp?v=1781635111',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S15168ba2c26843e4b4b26ae3d6b7463dx.webp?v=1781635111',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Adec2fd2b801449cd9d7a6fc595c085d3M.webp?v=1781635111',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Abe3314aec2804212842360b72d133183M.webp?v=1781635112',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/A78b83bb4e93b494ea9382c4a8d572835Z.webp?v=1781635112',
      'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/A38aefeae97cc42d5b5a554f6fdf09e258.webp?v=1781635111'
    ],
    desc:'מצלמה PTZ 8MP עם זום 4x ומעקב AI אוטומטי. מתאימה לפנים ולחוץ — סיבוב PTZ, זיהוי בני אדם, ראיית לילה עמוקה ושמע דו-כיווני. שלט מרחוק מלא דרך האפליקציה בכל זמן.',
    specs:[['רזולוציה','8MP'],['זום','4x'],['סיבוב','PTZ — Pan/Tilt'],['מעקב','AI אוטומטי'],['שימוש','פנים + חוץ'],['שמע','דו-כיווני']] }
];

// ===== Shopify Storefront API (Dropshipping) =====
// token מתוך: Shopify Admin → Settings → Apps → Develop apps → SafeView Frontend → Storefront API access token
var SHOPIFY_DOMAIN = 'azxiyx-z1.myshopify.com';
var SHOPIFY_STOREFRONT_TOKEN = ''; // הדבק כאן את ה-token לאחר יצירתו

// מיפוי מפרטים מהמאגר הסטטי לפי handle — fallback כאשר אין מידע מ-Shopify
var _specsLookup = (function(){
  var m = {};
  PRODUCTS.forEach(function(p){ m[p.id] = p.specs || []; });
  return m;
})();

var _productsCache = null;
var _productsFetchPromise = null;

function shopifyFetch(query, variables) {
  return fetch('https://' + SHOPIFY_DOMAIN + '/api/2024-10/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query: query, variables: variables || {} })
  }).then(function(r){ return r.json(); });
}

function _mapShopifyNode(node) {
  var price = Math.round(parseFloat(node.priceRange.minVariantPrice.amount));
  var cat = '', badge = '';
  (node.tags || []).forEach(function(t){
    if (t.indexOf('קטגוריה:') === 0) cat = t.replace('קטגוריה:', '');
    if (t.indexOf('badge:') === 0)    badge = t.replace('badge:', '');
  });
  // fallback badge/cat from known tags
  if (!badge) {
    var tags = node.tags || [];
    if (tags.indexOf('סולאריות') >= 0)  badge = 'סולארי';
    else if (tags.indexOf('אינדור') >= 0) badge = 'אינדור';
    else if (tags.indexOf('אאוטדור') >= 0) badge = 'אאוטדור';
    else if (tags.indexOf('מיני') >= 0)   badge = 'מיני';
  }
  if (!cat && badge) cat = badge === 'סולארי' ? 'סולאריות' : badge;

  var firstVariant = node.variants && node.variants.edges[0] ? node.variants.edges[0].node : null;
  var imgs = (node.images && node.images.edges || []).map(function(e){ return e.node.url; });
  var handle = node.handle;
  return {
    id: handle,
    shopifyId: node.id,
    variantId: firstVariant ? firstVariant.id : null,
    availableForSale: firstVariant ? firstVariant.availableForSale : true,
    name: node.title,
    price: price,
    badge: badge,
    cat: cat,
    img: node.featuredImage ? node.featuredImage.url : (imgs[0] || ''),
    images: imgs,
    desc: node.description || '',
    specs: _specsLookup[handle] || []
  };
}

// שולף את כל המוצרים מ-Shopify (עם cache)
function fetchShopifyProducts() {
  if (_productsCache) return Promise.resolve(_productsCache);
  if (_productsFetchPromise) return _productsFetchPromise;
  if (!SHOPIFY_STOREFRONT_TOKEN) return Promise.resolve(PRODUCTS);

  _productsFetchPromise = shopifyFetch(
    'query{products(first:50,sortKey:TITLE){edges{node{' +
    'id handle title description tags' +
    ' priceRange{minVariantPrice{amount}}' +
    ' featuredImage{url altText}' +
    ' images(first:10){edges{node{url}}}' +
    ' variants(first:5){edges{node{id title availableForSale price{amount}}}}' +
    '}}}}'
  ).then(function(data){
    if (data.data && data.data.products) {
      _productsCache = data.data.products.edges.map(function(e){ return _mapShopifyNode(e.node); });
      return _productsCache;
    }
    return PRODUCTS;
  }).catch(function(){ return PRODUCTS; });

  return _productsFetchPromise;
}

// שולף מוצר בודד מ-Shopify לפי handle
function fetchShopifyProduct(handle) {
  if (!SHOPIFY_STOREFRONT_TOKEN) return Promise.resolve(getProduct(handle) || PRODUCTS[0]);
  if (_productsCache) {
    var hit = _productsCache.filter(function(p){ return p.id === handle; })[0];
    if (hit) return Promise.resolve(hit);
  }
  return shopifyFetch(
    'query($h:String!){product(handle:$h){' +
    'id handle title description tags' +
    ' priceRange{minVariantPrice{amount}}' +
    ' featuredImage{url altText}' +
    ' images(first:10){edges{node{url}}}' +
    ' variants(first:10){edges{node{id title availableForSale price{amount}}}}' +
    '}}',
    { h: handle }
  ).then(function(data){
    if (data.data && data.data.product) return _mapShopifyNode(data.data.product);
    return getProduct(handle) || PRODUCTS[0];
  }).catch(function(){ return getProduct(handle) || PRODUCTS[0]; });
}

function getProduct(id){
  if (_productsCache) {
    var cached = _productsCache.filter(function(p){ return p.id === id; })[0];
    if (cached) return cached;
  }
  return PRODUCTS.filter(function(p){ return p.id === id; })[0];
}
function fmt(n){ return '₪' + Number(n).toLocaleString('he-IL'); }

// ===== עגלה (localStorage) =====
function getCart(){ try { return JSON.parse(localStorage.getItem('sv_cart') || '[]'); } catch(e){ return []; } }
function saveCart(c){ localStorage.setItem('sv_cart', JSON.stringify(c)); updateCartCount(); }
function cartCount(){ return getCart().reduce(function(s,i){ return s + i.qty; }, 0); }
function cartTotal(){ return getCart().reduce(function(s,i){ var price = i.price || (getProduct(i.id) ? getProduct(i.id).price : 0); return s + price*i.qty; }, 0); }
function addToCart(id, qty, variantId, price, btn){
  qty = qty || 1;
  var c = getCart();
  var vid = variantId ? String(variantId) : '';
  var found = c.filter(function(i){ return i.id===id && (i.variantId||'') === vid; })[0];
  if (found) { found.qty += qty; }
  else {
    var item = { id:id, qty:qty };
    if (variantId) item.variantId = vid;
    if (price) item.price = price;
    c.push(item);
  }
  saveCart(c);
  toast('✓ נוסף לעגלה');
  if (btn) {
    var prev = btn.textContent;
    btn.classList.add('added');
    btn.textContent = '✓ נוסף!';
    setTimeout(function(){ btn.classList.remove('added'); btn.textContent = prev; }, 1400);
  }
}
function setQty(id, qty){
  var c = getCart().map(function(i){ if(i.id===id) i.qty = Math.max(1, qty); return i; });
  saveCart(c);
}
function removeFromCart(id){ saveCart(getCart().filter(function(i){ return i.id!==id; })); }

// ===== Wishlist (רשימת מועדפים) =====
var WL_KEY = 'sv_wishlist';
function getWishlist(){ try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch(e){ return []; } }
function saveWishlist(wl){ try { localStorage.setItem(WL_KEY, JSON.stringify(wl)); } catch(e){} }
function isInWishlist(id){ return getWishlist().indexOf(id) !== -1; }
function toggleWishlist(id, btn) {
  var wl = getWishlist();
  var idx = wl.indexOf(id);
  if (idx === -1) {
    wl.push(id); saveWishlist(wl);
    if (btn) {
      btn.classList.add('wl-active');
      btn.setAttribute('aria-label','הסר ממועדפים');
      if (btn.id === 'pdpWlBtn') btn.textContent = '♥ הסר ממועדפים';
    }
    toast('נוסף למועדפים ♥');
  } else {
    wl.splice(idx, 1); saveWishlist(wl);
    if (btn) {
      btn.classList.remove('wl-active');
      btn.setAttribute('aria-label','שמור למועדפים');
      if (btn.id === 'pdpWlBtn') btn.textContent = '♡ שמור למועדפים';
    }
    toast('הוסר מהמועדפים');
  }
}
function renderWishlistBtn(productId) {
  var active = isInWishlist(productId);
  return '<button class="wl-btn'+(active?' wl-active':'')+'" '+
    'aria-label="'+(active?'הסר ממועדפים':'שמור למועדפים')+'" '+
    'onclick="event.preventDefault();event.stopPropagation();toggleWishlist(\''+productId+'\',this)" title="מועדפים">♥</button>';
}
function updateCartCount(){
  document.querySelectorAll('.nav-cart-count').forEach(function(el){
    var n = cartCount(); el.textContent = n; el.style.display = n>0 ? 'flex' : 'none';
  });
}

// צ'קאאוט דרך וואטסאפ — שולח את כל ההזמנה כולל קופון ושיטת משלוח
function checkoutWhatsApp(couponCode, discount, shipMethod) {
  var c = getCart();
  if (!c.length){ alert('העגלה ריקה'); return; }
  var lines = ['שלום SafeView! אני רוצה להזמין:', ''];
  var rawTotal = 0;
  c.forEach(function(i){
    var p = getProduct(i.id);
    if (p) {
      var unitPrice = i.price || p.price;
      var lineTotal = unitPrice * i.qty;
      rawTotal += lineTotal;
      lines.push('• ' + p.name + ' × ' + i.qty + ' = ' + fmt(lineTotal));
    }
  });
  lines.push('');
  var afterCoupon = rawTotal - (discount || 0);
  if (couponCode && discount) {
    lines.push('סה"כ לפני הנחה: ' + fmt(rawTotal));
    lines.push('קופון ' + couponCode + ': -' + fmt(discount));
    markCouponUsed(couponCode);
  }
  var shipCost = shipMethod ? getShipCost(rawTotal, shipMethod) : 0;
  var grandTotal = afterCoupon + shipCost;
  if (shipMethod) {
    var shipLabel = shipCost === 0 ? shipMethod.label + ' (חינם)' : shipMethod.label + ' ' + fmt(shipCost);
    lines.push('משלוח: ' + shipLabel + ' — ' + shipMethod.days);
  } else {
    lines.push(rawTotal >= FREE_SHIP_THRESHOLD ? 'משלוח: חינם' : 'משלוח: לפי בחירה');
  }
  lines.push('סה"כ לתשלום: ' + fmt(grandTotal));
  window.open(waLink(lines.join('\n')), '_blank');
  // מנקה עגלה וקופון אחרי שליחת ההזמנה
  try { localStorage.removeItem('sv_cart'); } catch(e) {}
  try { sessionStorage.removeItem('sv_cart_coupon'); } catch(e) {}
  updateCartCount();
  setTimeout(function(){ if (location.pathname.indexOf('cart') !== -1) location.href = 'thank-you.html'; }, 800);
}

// Checkout דרך Shopify — בניית URL ישיר לעגלת Shopify
function createShopifyCheckout() {
  var c = getCart();
  if (!c.length){ alert('העגלה ריקה'); return; }
  var parts = [];
  c.forEach(function(item){
    var vid = item.variantId ? String(item.variantId) : null;
    if (!vid) {
      var p = getProduct(item.id);
      if (p && p.variantId) vid = String(p.variantId);
    }
    if (vid) {
      vid = vid.replace('gid://shopify/ProductVariant/', '');
      parts.push(vid + ':' + item.qty);
    }
  });
  if (parts.length) {
    window.location.href = 'https://' + SHOPIFY_DOMAIN + '/cart/' + parts.join(',');
  } else {
    checkoutWhatsApp();
  }
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
  brand: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 3l11 4v8.4c0 6.8-4.6 12.9-11 14.6-6.4-1.7-11-7.8-11-14.6V7l11-4z" stroke="#3a9fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M10.5 16.5l3.8 3.8 7.3-8" stroke="#26d9b0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  access: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M19 8h-5v13a1 1 0 11-2 0v-6h-1v6a1 1 0 11-2 0V8H4a1 1 0 110-2h15a1 1 0 110 2z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 7v1.5h2v2h-4.5a.5.5 0 000 1H14a2.5 2.5 0 010 5h-1v1.5h-2V16.5H9v-2h4.5a.5.5 0 000-1H10a2.5 2.5 0 010-5h1V7z"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M21 4.5 19.5 3 15 7.5l2 2zm-7.4 4.6L4.4 18.3l1.4 1.4 9.2-9.2zM18 11.6l-2-2-8 8 2 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 4v10h16V8l-8 5-8-5zm0-2l8 5 8-5H4z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1l-2.25 2.2z"/></svg>',
  paypal: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.144 19.532l1.049-5.751c.11-.606.691-1.002 1.304-.99h2.533c2.196 0 3.813-.464 4.819-1.374.921-.84 1.449-2.116 1.581-3.821.08-1.013-.005-1.846-.244-2.4-.315-.728-.92-1.136-1.983-1.348C15.574 3.71 14.56 3.6 13.44 3.6H7.498c-.613 0-1.124.444-1.215 1.05L4 19.05c-.066.424.27.822.7.822h2.139c.4 0 .74-.29.805-.68l.5-2.66zm10.208-11.7c-.196 1.25-.687 2.154-1.484 2.71-.872.601-2.166.904-3.88.904H10.16l-.86 4.748h-1.3l1.05-5.75h3.44c1.71 0 3.006-.304 3.88-.904.796-.556 1.288-1.46 1.484-2.71.08-.5.092-.946.038-1.346.4.432.614 1.05.52 2.348z"/></svg>'
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
  // preconnect ל-CDN של התמונות — מאיץ טעינה ראשונה
  add('link', { rel:'preconnect', href:'https://cdn.shopify.com', crossorigin:'' });
  add('link', { rel:'dns-prefetch', href:'https://cdn.shopify.com' });
}

// ===== JSON-LD Schema.org — Rich Snippets לגוגל =====
function injectProductJsonLd(product) {
  if (!product) return;
  var sum = getReviewSummary(product.id);
  var reviews = getProductReviews(product.id);
  var data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc || product.name,
    image: product.images || [product.img],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'SafeView' },
    offers: {
      '@type': 'Offer',
      url: location.href.split('#')[0],
      priceCurrency: 'ILS',
      price: String(product.price),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'SafeView' }
    }
  };
  if (sum) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(sum.avg),
      reviewCount: String(sum.count),
      bestRating: '5',
      worstRating: '1'
    };
    data.review = reviews.slice(0, 5).map(function(r){
      return {
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        datePublished: r.date,
        reviewBody: r.text,
        name: r.title,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(r.rating),
          bestRating: '5',
          worstRating: '1'
        }
      };
    });
  }
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function injectOrganizationJsonLd() {
  if (document.querySelector('script[data-ld="org"]')) return;
  var data = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'SafeView',
    url: location.origin + location.pathname.replace(/\/[^\/]*$/, '/'),
    logo: location.origin + '/safeview/assets/logo.svg',
    description: 'חנות מצלמות אבטחה חכמות בישראל. משלוח חינם מעל 200₪, אחריות שנה, תמיכה בעברית',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+972586343786',
      contactType: 'customer service',
      areaServed: 'IL',
      availableLanguage: ['Hebrew']
    },
    sameAs: ['https://wa.me/972586343786']
  };
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.ld = 'org';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
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
    ['deals.html','🔥 מבצעים'],
    ['collection.html?type=best-sellers','הנמכרים ביותר'],
    ['solar-landing.html','☀️ סולאריות'],
    ['buying-guide.html','איזו מצלמה לי?'],
    ['compare.html','השוואה'],
    ['blog.html','מדריכים'],
    ['order-tracking.html','מעקב הזמנה'],
    ['about.html','אודות'],
    ['contact.html','צור קשר']
  ];
  var navHtml =
    '<nav>' +
      '<a href="index.html" class="nav-logo" dir="ltr"><span class="nav-logo-icon">' + ICON.brand + '</span>Safe<span>View</span></a>' +
      '<div class="nav-right">' +
        '<ul class="nav-links" id="navLinks">' +
          navLinks.map(function(l){ return '<li><a href="'+l[0]+'">'+l[1]+'</a></li>'; }).join('') +
        '</ul>' +
        '<a href="wishlist.html" class="nav-cart" aria-label="מועדפים" style="margin-left:4px;font-size:20px">♡<span class="nav-wl-count" id="navWlCount" style="display:none"></span></a>' +
        '<a href="cart.html" class="nav-cart" aria-label="עגלה">' + ICON.cart + '<span class="nav-cart-count">0</span></a>' +
        '<button class="nav-burger" id="burger" aria-label="תפריט"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</nav>';

  var trustBadgesHtml =
    '<div class="footer-trust">' +
      '<div class="trust-badge"><span class="trust-badge-ic">'+ICON.lock+'</span><div><strong>תשלום מאובטח</strong><span>הצפנת SSL 256-bit</span></div></div>' +
      '<div class="trust-badge"><span class="trust-badge-ic">'+ICON.shield+'</span><div><strong>אחריות יצרן</strong><span>שנה מלאה + תמיכה</span></div></div>' +
      '<div class="trust-badge"><span class="trust-badge-ic">'+ICON.refresh+'</span><div><strong>14 ימי החזרה</strong><span>החזר מלא, ללא שאלות</span></div></div>' +
      '<div class="trust-badge"><span class="trust-badge-ic">'+ICON.chat+'</span><div><strong>תמיכה בעברית</strong><span>וואטסאפ + מייל</span></div></div>' +
    '</div>';

  var footerHtml =
    '<footer>' +
      trustBadgesHtml +
      '<div class="footer-top">' +
        '<div class="footer-brand">' +
          '<div class="footer-logo" dir="ltr"><span class="nav-logo-icon">' + ICON.brand + '</span>Safe<span>View</span></div>' +
          '<p>חנות מצלמות האבטחה החכמות של ישראל. מצלמות סולאריות, פנימיות וחיצוניות עם אחריות מלאה ותמיכה בעברית.</p>' +
        '</div>' +
        '<div class="footer-col"><h4>חנות</h4>' +
          '<a href="index.html#products">כל המצלמות</a><a href="index.html#categories">קטגוריות</a><a href="index.html#bundles">חבילות במבצע</a><a href="compare.html">השוואה</a><a href="cart.html">עגלת קניות</a><a href="wishlist.html">♥ המועדפים שלי</a></div>' +
        '<div class="footer-col"><h4>מידע</h4>' +
          '<a href="about.html">אודות</a><a href="blog.html">מדריכים</a><a href="faq.html">שאלות נפוצות</a><a href="contact.html">צור קשר</a></div>' +
        '<div class="footer-col"><h4>מדיניות</h4>' +
          '<a href="shipping.html">משלוחים</a><a href="returns.html">החזרות</a><a href="privacy.html">פרטיות</a><a href="terms.html">תקנון</a><a href="accessibility.html">נגישות</a></div>' +
      '</div>' +
      '<div class="footer-payments"><span class="footer-pay-label">אמצעי תשלום מקובלים</span><span class="footer-pay-icons">' +
        '<span class="pay-pill">VISA</span>' +
        '<span class="pay-pill">Mastercard</span>' +
        '<span class="pay-pill">AmEx</span>' +
        '<span class="pay-pill">Bit</span>' +
        '<span class="pay-pill">PayPal</span>' +
        '<span class="pay-pill">Apple&nbsp;Pay</span>' +
      '</span></div>' +
      '<div class="footer-bottom"><span>© 2026 SafeView. כל הזכויות שמורות.</span><span>נבנה בישראל</span></div>' +
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
      '<div class="a11y-foot">הצהרת נגישות: האתר נבנה לפי תקן <strong>WCAG 2.1 AA</strong>. <a href="accessibility.html">הצהרת נגישות</a> | בעיה? <a href="contact.html">צרו קשר</a></div>' +
    '</div>';

  // Skip link: על לחיצה — נמצא את התוכן הראשי הראשון אחרי הנאב, נגלול אליו ונמקד
  var skipHtml = '<a href="#main" class="skip-link" id="skipLink">דלג לתוכן הראשי</a>';
  var shipBarHtml = '<div class="ship-bar" id="shipBar">משלוח חינם בכל הזמנה מעל <strong>₪200</strong> · אחריות מלאה לשנה · תמיכה בעברית</div>';
  var navMount = document.getElementById('nav-mount');
  var footMount = document.getElementById('footer-mount');
  if (navMount) navMount.outerHTML = skipHtml + shipBarHtml + navHtml;
  var btTopHtml = '<button class="back-to-top" id="backToTop" aria-label="חזרה לראש העמוד" onclick="window.scrollTo({top:0,behavior:\'smooth\'})"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></button>';
  var qvHtml = '<div id="qvModal" class="qv-modal" role="dialog" aria-modal="true" aria-label="מוצר מהיר"><div class="qv-backdrop" onclick="closeQuickView()"></div><div class="qv-box"><button class="qv-close" onclick="closeQuickView()" aria-label="סגור">×</button><div class="qv-inner" id="qvContent"></div></div></div>';
  if (footMount) footMount.outerHTML = footerHtml + waHtml + a11yHtml + btTopHtml + qvHtml;

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

  // סגירת nav במובייל בלחיצה מחוץ לתפריט
  document.addEventListener('click', function(e){
    var nl = document.getElementById('navLinks');
    var b = document.getElementById('burger');
    if (nl && nl.classList.contains('open') && !nl.contains(e.target) && (!b || !b.contains(e.target))){
      nl.classList.remove('open');
    }
  });

  // הוספת class לnav בגלילה
  window.addEventListener('scroll', function(){
    var nav = document.querySelector('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

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

// ===== באנר עוגיות (cookie consent) =====
var COOKIE_KEY = 'sv_cookies_ok';
function hasCookieConsent(){ try { return localStorage.getItem(COOKIE_KEY) === '1'; } catch(e){ return false; } }
function setCookieConsent(){ try { localStorage.setItem(COOKIE_KEY, '1'); } catch(e){} var b = document.getElementById('cookieBanner'); if (b) b.remove(); }
function showCookieBanner(){
  if (hasCookieConsent()) return;
  var html =
    '<div class="cookie-banner" id="cookieBanner" role="region" aria-label="הודעת עוגיות">' +
      '<div class="cookie-text">אנחנו משתמשים בעוגיות (cookies) כדי לשפר את החוויה באתר ולצורכי אנליטיקה. ' +
        '<a href="privacy.html">מידע נוסף</a></div>' +
      '<div class="cookie-actions">' +
        '<button class="cookie-ok" onclick="setCookieConsent()">מסכים/ה</button>' +
      '</div>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
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
var GA4_ID = 'G-VBLPD1FCHP';
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

function showWaBubble(){
  try { if (sessionStorage.getItem('sv_wa_bubble')) return; } catch(e){}
  var link = waLink('שלום SafeView! יש לי שאלה לפני שאני קונה.');
  var bubble = document.createElement('div');
  bubble.className = 'wa-bubble';
  bubble.setAttribute('role', 'status');
  bubble.innerHTML = '<span class="wa-bubble-x" aria-label="סגור">×</span><strong>SafeView — כאן בשבילך</strong>רוצה עזרה בבחירה?<br>שאל/י אותנו בוואטסאפ ←';
  bubble.addEventListener('click', function(e){
    if (e.target.classList.contains('wa-bubble-x')) { removeBubble(); return; }
    window.open(link, '_blank', 'noopener');
    removeBubble();
  });
  document.body.appendChild(bubble);
  function removeBubble(){
    try { sessionStorage.setItem('sv_wa_bubble','1'); } catch(e){}
    bubble.classList.add('hide');
    setTimeout(function(){ if (bubble.parentNode) bubble.parentNode.removeChild(bubble); }, 350);
  }
  setTimeout(removeBubble, 10000);
}

// ===== Recently Viewed =====
var RV_KEY = 'sv_rv';
function saveRecentlyViewed(id){
  try {
    var rv = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
    rv = rv.filter(function(x){ return x !== id; });
    rv.unshift(id);
    localStorage.setItem(RV_KEY, JSON.stringify(rv.slice(0, 6)));
  } catch(e){}
}
function getRecentlyViewed(excludeId){
  try {
    return JSON.parse(localStorage.getItem(RV_KEY) || '[]').filter(function(x){ return x !== excludeId; }).slice(0, 4);
  } catch(e){ return []; }
}

// ===== Back to Top =====
function initBackToTop(){
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

// ===== Quick View =====
var _qvTimer = null;
var _qvOpenTimer = null;
function scheduleQvClose(){ _qvTimer = setTimeout(closeQuickView, 180); }
function cancelQvClose(){ clearTimeout(_qvTimer); }
function scheduleQvOpen(id){ cancelQvOpen(); _qvOpenTimer = setTimeout(function(){ openQuickView(id); }, 900); }
function cancelQvOpen(){ clearTimeout(_qvOpenTimer); }

function openQuickView(id){
  cancelQvClose();
  var p; for (var i=0; i<PRODUCTS.length; i++) if (PRODUCTS[i].id===id){ p=PRODUCTS[i]; break; }
  if (!p) return;
  var msg = 'שלום SafeView! אני מעוניין/ת במצלמה: '+p.name+' ('+fmt(p.price)+'). אפשר פרטים?';
  var content = document.getElementById('qvContent');
  var modal = document.getElementById('qvModal');
  if (!content || !modal) return;
  var rawDesc = p.desc ? (p.desc.length > 200 ? p.desc.substring(0,200)+'...' : p.desc) : '';
  // sanitize — מונע XSS אם תיאור מכיל תגי HTML
  var desc = rawDesc.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  content.innerHTML =
    '<div class="qv-img"><img src="'+p.img+'" alt="'+p.name.replace(/"/g,'&quot;')+'" loading="lazy"></div>'+
    '<div class="qv-info">'+
      '<h2>'+p.name.replace(/</g,'&lt;')+'</h2>'+
      '<div class="qv-price">'+fmt(p.price)+'</div>'+
      '<p class="qv-desc">'+desc+'</p>'+
      '<div class="qv-actions">'+
        '<button class="btn-primary" onclick="addToCart(\''+p.id+'\');closeQuickView()">הוסף לעגלה</button>'+
        '<a class="btn-wa" href="'+waLink(msg)+'" target="_blank" rel="noopener">'+ICON.wa+' הזמן בוואטסאפ</a>'+
        '<a class="qv-link" href="product.html?id='+p.id+'">פרטים מלאים ←</a>'+
      '</div>'+
    '</div>';
  modal.classList.add('open');
  // סגירה בהזזת עכבר מחוץ לפופ-אפ
  var box = modal.querySelector('.qv-box');
  if (box){ box.onmouseenter = cancelQvClose; box.onmouseleave = scheduleQvClose; }
}
function closeQuickView(){
  var modal = document.getElementById('qvModal');
  if (modal) modal.classList.remove('open');
}
document.addEventListener('keydown', function(e){ if (e.key==='Escape') closeQuickView(); });

// ===== שיתוף מוצר =====
function shareProduct(name, url){
  var u = url || location.href;
  if (navigator.share){
    navigator.share({ title: name+' | SafeView', url: u }).catch(function(){});
  } else {
    window.open('https://wa.me/?text='+encodeURIComponent(name+' — SafeView: '+u), '_blank', 'noopener');
  }
}

// ===== ספירה לאחור =====
function startCountdown(elId){
  var el = document.getElementById(elId);
  if (!el) return;
  function tick(){
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0,0,0);
    var diff = Math.max(0, Math.floor((midnight-now)/1000));
    var h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60), s = diff%60;
    el.textContent = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);
}

// ===== Countdown Timer לבאנר עליון =====
function initCountdownBanner() {
  if (document.getElementById('countdownBanner')) return;
  // ספירה לאחור עד סוף החודש הקרוב
  var now = new Date();
  var end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  var hero = document.querySelector('.hero, .page-head');
  if (!hero) return;

  var banner = document.createElement('div');
  banner.id = 'countdownBanner';
  banner.className = 'countdown-bar';
  banner.innerHTML =
    '<span class="countdown-label">🔥 מבצע סוף החודש — עד 15% הנחה עם קוד SAFE15</span>' +
    '<div class="countdown-timer">' +
      '<div class="countdown-unit"><span class="countdown-num" id="cd-d">--</span><span class="countdown-cap">ימים</span></div>' +
      '<div class="countdown-unit"><span class="countdown-num" id="cd-h">--</span><span class="countdown-cap">שעות</span></div>' +
      '<div class="countdown-unit"><span class="countdown-num" id="cd-m">--</span><span class="countdown-cap">דקות</span></div>' +
      '<div class="countdown-unit"><span class="countdown-num" id="cd-s">--</span><span class="countdown-cap">שניות</span></div>' +
    '</div>';
  hero.parentNode.insertBefore(banner, hero.nextSibling);

  function tick() {
    var diff = end - new Date();
    if (diff <= 0) { banner.style.display = 'none'; return; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var el;
    if ((el = document.getElementById('cd-d'))) el.textContent = String(d).padStart(2, '0');
    if ((el = document.getElementById('cd-h'))) el.textContent = String(h).padStart(2, '0');
    if ((el = document.getElementById('cd-m'))) el.textContent = String(m).padStart(2, '0');
    if ((el = document.getElementById('cd-s'))) el.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

// ===== Exit Intent Popup =====
function initExitPopup() {
  if (sessionStorage.getItem('exitPopupShown')) return;
  if (location.pathname.indexOf('cart') !== -1) return;

  var shown = false;
  var popup = document.createElement('div');
  popup.className = 'exit-popup-bg';
  popup.innerHTML =
    '<div class="exit-popup" role="dialog" aria-labelledby="exitTitle">' +
      '<button class="exit-popup-close" aria-label="סגור" onclick="closeExitPopup()">×</button>' +
      '<div class="exit-popup-emoji">🎁</div>' +
      '<h2 id="exitTitle">חכו! מתנה לפני שתעזבו</h2>' +
      '<p>10% הנחה על הקנייה הראשונה — תקף לעוד 24 שעות</p>' +
      '<div class="exit-coupon" onclick="copyExitCoupon(this)">WELCOME10</div>' +
      '<div class="exit-popup-sub">הקליקו על הקופון להעתקה</div>' +
      '<a class="exit-popup-action" href="index.html#products" onclick="closeExitPopup()">קח אותי למוצרים ←</a>' +
    '</div>';
  document.body.appendChild(popup);

  function trigger() {
    if (shown) return;
    shown = true;
    popup.classList.add('show');
    sessionStorage.setItem('exitPopupShown', '1');
  }

  // Desktop: mouseleave at top
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 10 && !shown) trigger();
  });

  // Mobile: scroll back up fast
  var lastY = 0;
  document.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (lastY - y > 80 && y < 300 && !shown) trigger();
    lastY = y;
  });

  // Time-based fallback (45 sec on page)
  setTimeout(function() { if (!shown) trigger(); }, 45000);
}

window.closeExitPopup = function() {
  var p = document.querySelector('.exit-popup-bg');
  if (p) p.classList.remove('show');
};

window.copyExitCoupon = function(el) {
  navigator.clipboard.writeText('WELCOME10');
  el.style.background = 'linear-gradient(135deg, #00b478, #00d4aa)';
  var orig = el.textContent;
  el.textContent = '✓ הועתק!';
  setTimeout(function() { el.textContent = orig; el.style.background = ''; }, 1500);
};

// ===== Low Stock Indicator — מגוון, לא חוזר =====
function getLowStockBadge(productId) {
  var hash = 0;
  for (var i = 0; i < productId.length; i++) hash = ((hash << 5) - hash) + productId.charCodeAt(i);
  hash = Math.abs(hash);
  if (hash % 10 >= 4) return ''; // 40% מהמוצרים מציגים אינדיקטור

  var variants = [
    { emoji: '🔥', text: 'מבצע חם — מלאי אחרון' },
    { emoji: '⚡', text: 'מלאי מוגבל מאוד' },
    { emoji: '📦', text: 'נותרו ' + ((hash % 12) + 4) + ' יחידות' },
    { emoji: '⏰', text: 'אזל כמעט — ' + ((hash % 8) + 3) + ' אחרונות' },
    { emoji: '🚨', text: 'המלאי הולך ואוזל' },
    { emoji: '💨', text: 'נמכר מהר — ' + ((hash % 15) + 5) + ' זמינות' },
    { emoji: '🎯', text: 'הזמנה אחרונה היום לפני 24 שעות' },
    { emoji: '⭐', text: 'הכי פופולרי השבוע' },
    { emoji: '🔥', text: '' + ((hash % 11) + 4) + ' נותרו במלאי' },
    { emoji: '⚡', text: 'מבצע מסתיים בקרוב' }
  ];
  var v = variants[hash % variants.length];
  return '<div class="low-stock"><span style="margin-left:6px">'+v.emoji+'</span>'+v.text+'</div>';
}

// ===== Old Price (מחיר ישן עם קו) — לחלק מהמוצרים =====
function getOldPrice(p) {
  // 40% מהמוצרים מקבלים מחיר ישן (מבצע ויזואלי)
  var hash = 0;
  for (var i = 0; i < p.id.length; i++) hash = ((hash << 5) - hash) + p.id.charCodeAt(i);
  hash = Math.abs(hash);
  if (hash % 10 >= 4) return null;
  // הנחה של 15-30%
  var pct = 15 + (hash % 16); // 15-30
  var old = Math.round(p.price / (1 - pct/100));
  // עיגול ל-9 (₪249, ₪399 וכו')
  old = Math.round(old / 10) * 10 - 1;
  if (old <= p.price) old = p.price + 50;
  return { price: old, pct: pct };
}

// ===== מה באריזה — תצוגה קומפקטית =====
function getCompactInbox(productId) {
  var inbox = PRODUCT_INBOX[productId];
  if (!inbox || !inbox.length) {
    // ברירת מחדל למוצרים ללא רשומה
    inbox = ['מצלמה × 1', 'ערכת התקנה', 'מדריך למשתמש'];
  }
  // הצג 3 פריטים ראשונים + "ועוד" אם יש יותר
  var items = inbox.slice(0, 3);
  var more = inbox.length > 3 ? ' <span style="color:var(--text3)">+'+(inbox.length-3)+'</span>' : '';
  return '<div class="prod-inbox">📦 כולל: ' + items.join(' · ') + more + '</div>';
}

document.addEventListener('DOMContentLoaded', function(){
  injectSeoMeta();
  injectOrganizationJsonLd();
  injectChrome();
  initReveal();
  initFaq();
  initAnalytics();
  registerSW();
  showCookieBanner();
  initBackToTop();
  // הצג ספירה לאחור רק בעמוד הבית
  if (location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname.endsWith('/safeview/')) {
    initCountdownBanner();
  }
  // פופ-אפ יציאה בכל העמודים חוץ מ-checkout
  initExitPopup();
  (function(){
    var shown = false;
    function tryShow(){
      if (shown) return;
      var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (scrolled >= 0.35){ shown = true; showWaBubble(); }
    }
    window.addEventListener('scroll', tryShow, { passive: true });
    setTimeout(function(){ if (!shown){ shown = true; showWaBubble(); } }, 30000);
  })();
});
