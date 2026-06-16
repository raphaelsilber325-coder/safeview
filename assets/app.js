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
    desc:'מצלמת אבטחה סולארית מהמותג המוערך Baseus — המצלמה הכי נמכרת שלנו! רזולוציית 2K, ראיית לילה צבעונית מלאה, זווית 135° רחבה ועמידות IP67. עובדת ללא חשמל וללא חיווט. ₪579 למצלמה אחת | ₪949 לשתיים | ₪1,449 לשלוש.',
    specs:[['מותג','Baseus'],['רזולוציה','2K Ultra HD'],['זווית','135°'],['עמידות','IP67'],['הספק','סולארי + סוללה'],['חיבור','WiFi'],['אחסון','עד 512GB מקומי'],['הצפנה','AES+RSA'],['אחריות','2 שנים']] },
  { id:'solar-3mp', variantId:50367695028364, name:'מצלמת אבטחה סולארית חיצונית 3MP | זיהוי AI | IP65', price:255, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S11c4aabf01be4261982b94a7be532532H.webp?v=1780222615',
    variants:[
      {id:50367695028364, title:'מצלמה אחת', price:255},
      {id:50367694930060, title:'2 מצלמות', price:469},
      {id:50367694962828, title:'3 מצלמות', price:699}
    ],
    desc:'מצלמת אבטחה סולארית חיצונית — זיהוי AI חכם של בני אדם (לא התראות שווא מחתולים), ראיית לילה צבעונית ושמע דו-כיווני. ללא חיווט, ללא חשמל, חיסכון מלא. מתאים לחצר, גג ושער. ₪255 למצלמה אחת | ₪469 לשתיים | ₪699 לשלוש.',
    specs:[['רזולוציה','3MP HD+'],['זיהוי AI','בני אדם'],['הספק','סולארי'],['עמידות','IP65'],['תקשורת','דו-כיוונית'],['חיבור','WiFi']] },
  { id:'indoor-2k', variantId:50367694667916, name:'מצלמת אבטחה פנימית 2K | AI + שיחה דו-כיוונית | Blurams', price:112, badge:'אינדור', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M.webp?v=1780222612',
    variants:[
      {id:50367694667916, title:'מצלמה אחת', price:112},
      {id:50367694635148, title:'2 מצלמות', price:249},
      {id:50367694602380, title:'3 מצלמות', price:409}
    ],
    desc:'מצלמת אבטחה פנימית עם בינה מלאכותית — מזהה אנשים וחיות מחמד. שיחה דו-כיוונית בלחיצה אחת. מושלם למשפחות ולחיות מחמד. ₪112 למצלמה אחת | ₪249 לשתיים | ₪409 לשלוש.',
    specs:[['רזולוציה','2K Ultra HD'],['חיבור','WiFi'],['שמע','דו-כיווני'],['ראיית לילה','צבעונית'],['תאימות','Alexa / Google'],['אחסון','ענן + SD']] },
  { id:'flagship-16mp', variantId:50740844724364, name:'מצלמת אבטחה חיצונית 16MP 8K | 360° | 4 עדשות', price:929, badge:'פלאגשיפ', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
    variants:[
      {id:50740844724364, title:'מצלמה אחת', price:929},
      {id:50740844757132, title:'2 מצלמות', price:1699},
      {id:50740844789900, title:'3 מצלמות', price:2419}
    ],
    desc:'המצלמה המתקדמת ביותר שלנו — 16MP, 8K אמיתי, 4 עדשות שמסתובבות 360°, זום 10x וזיהוי AI. מערכת אבטחה מקצועית בקופסה אחת. ₪929 למצלמה אחת | ₪1,699 לשתיים | ₪2,419 לשלוש.',
    specs:[['רזולוציה','16MP / 8K'],['עדשות','4 עצמאיות'],['זווית','360°'],['זום','דיגיטלי 10x'],['AI','זיהוי תנועה ובני אדם'],['חיבור','WiFi']] },
  { id:'wifi-dual', variantId:50740844593292, name:'מצלמת WiFi חיצונית | עדשה כפולה 3MP | ICSee', price:189, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Saa99283cf09d4592a7c33ced52d81019B.webp?v=1780222614',
    variants:[
      {id:50740844593292, title:'מצלמה אחת', price:189},
      {id:50740844626060, title:'2 מצלמות', price:339},
      {id:50740844658828, title:'3 מצלמות', price:489}
    ],
    desc:'מצלמה חיצונית עם עדשה כפולה — תצוגה רחבה וזום במקביל. תמונה חדה של 3MP, עמידות מלאה למזג אוויר, אפליקציית ICSee היציבה. ₪189 למצלמה אחת | ₪339 לשתיים | ₪489 לשלוש.',
    specs:[['רזולוציה','3MP (2304×1296)'],['עדשות','כפולות'],['חיבור','WiFi'],['אפליקציה','ICSee'],['עמידות','Waterproof'],['אחסון','כרטיס SD']] },
  { id:'wifi-ir', variantId:50740844167308, name:'מצלמת אבטחה WiFi | אינפרא-אדום | Smart Home', price:89, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9a4b640268a140399e446738c30b95d4p.webp?v=1780222615',
    variants:[
      {id:50740844167308, title:'מצלמה אחת', price:89},
      {id:50740844200076, title:'2 מצלמות', price:159},
      {id:50740844232844, title:'3 מצלמות', price:229}
    ],
    desc:'מצלמת אבטחה WiFi חיצונית — ראיית לילה אינפרא-אדום, זיהוי תנועה, צפייה מרחוק מהנייד. התקנה פשוטה ב-3 דקות, ללא צורך בטכנאי. ₪89 למצלמה אחת | ₪159 לשתיים | ₪229 לשלוש.',
    specs:[['ראיית לילה','אינפרא-אדום'],['חיבור','WiFi'],['זיהוי','תנועה'],['צפייה','מרחוק'],['תיאום','Smart Home']] },
  { id:'mini-1080', variantId:50740844331148, name:'מצלמת מיני אלחוטית 1080P | ראיית לילה', price:39, badge:'מיני', cat:'מיני',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S68e20b3917ca422eb8255d53f414f757F.webp?v=1780222612',
    variants:[
      {id:50740844331148, title:'מצלמה אחת', price:39},
      {id:50740844363916, title:'2 מצלמות', price:70},
      {id:50740844396684, title:'3 מצלמות', price:99}
    ],
    desc:'מצלמת מיני נסתרת Full HD 1080P ב-₪39 — ראיית לילה, זיהוי תנועה, גוף קטן במיוחד שמתחבא בכל מקום. מושלם למעקב אחרי בייביסיטר, עובדים, חיות מחמד ורכוש. חיבור USB פשוט, אין צורך בטכנאי. ₪39 למצלמה אחת | ₪70 לשתיים | ₪99 לשלוש.',
    specs:[['רזולוציה','1080P Full HD'],['חיבור','WiFi'],['ראיית לילה','אינפרא-אדום'],['זיהוי','תנועה אוטומטי'],['חיבור חשמל','USB']] },
  { id:'mini-4k', variantId:50740844462220, name:'מצלמת מיני 4K WiFi | ניטור פנימי חכם', price:29, badge:'מיני', cat:'מיני',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S92a865b3286d42b8b447e7f041978ca6b.webp?v=1780222616',
    variants:[
      {id:50740844462220, title:'מצלמה אחת', price:29},
      {id:50740844494988, title:'2 מצלמות', price:52},
      {id:50740844527756, title:'3 מצלמות', price:74}
    ],
    desc:'מצלמת מיני נסתרת ב-₪29 — איכות 4K, גוף קטן במיוחד, ניידת לחלוטין. גישה מרחוק מהסמארטפון בכל מקום. אבטחה דיסקרטית לבית, משרד, חנות ורכב. המצלמה הזולה ביותר שלנו. ₪29 למצלמה אחת | ₪52 לשתיים | ₪74 לשלוש.',
    specs:[['רזולוציה','4K HD'],['חיבור','WiFi'],['גודל','מיני'],['צפייה','מרחוק'],['תיאום','Smart Home']] },
  { id:'bundle-home', variantId:50501081137292, name:'חבילת אבטחה לבית | פנימית + סולארית חיצונית', price:179, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa514dbb7266a4564936a4b980a3f13f5M.webp?v=1780222612',
    desc:'חבילה מושלמת לבית — מצלמת Blurams 2K לפנים עם AI + מצלמת solar חיצונית 3MP. כיסוי מלא 24/7 בחיסכון של 30% לעומת קנייה נפרדת.',
    specs:[['מצלמות','2 מצלמות'],['פנים','Blurams 2K AI'],['חוץ','סולארית 3MP IP65'],['חיסכון','30% לעומת נפרד']] },
  { id:'bundle-business', variantId:50501081170060, name:'חבילת אבטחה לעסק | 3 סולאריות + פלאגשיפ 16MP', price:899, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S3d0de0a565ab48b993427b57182989a0e.webp?v=1780222615',
    desc:'פתרון אבטחה מקיף לעסקים — 3 מצלמות סולאריות לחוץ + מצלמת הפלאגשיפ 16MP 8K. מערכת מקצועית ב-4 מצלמות במחיר חבילה.',
    specs:[['מצלמות','4 מצלמות'],['סולאריות','3 × IP65 חיצוניות'],['פלאגשיפ','16MP 8K 360°'],['חיסכון','35% לעומת נפרד']] },
  { id:'bundle-starter', variantId:50501081202828, name:'חבילת מתחילים | 2 מצלמות מיני דיסקרטיות', price:89, badge:'חבילה', cat:'חבילות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S68e20b3917ca422eb8255d53f414f757F.webp?v=1780222612',
    desc:'הדרך הכי חכמה להתחיל לאבטח — 2 מצלמות מיני 1080P דיסקרטיות לכל מקום בבית. חסכון של ₪29 לעומת קנייה נפרדת.',
    specs:[['מצלמות','2 מצלמות מיני'],['רזולוציה','1080P Full HD'],['חיבור','WiFi'],['חיסכון','₪29 לעומת נפרד']] },
  { id:'ease-life-bulb', variantId:50740845052044, name:'מצלמת נורה חיצונית | WiFi 5GHz | 360° | בסיס E27', price:199, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S8e30f3e63d994ab484f8c1276cd402c4W.webp?v=1781270981',
    variants:[
      {id:50740845052044, title:'מצלמה אחת', price:199},
      {id:50740845084812, title:'מבצע זוג 🔥', price:299},
      {id:50740845117580, title:'3 מצלמות', price:449}
    ],
    desc:'מצלמת אבטחה בצורת נורה — מתחברת לכל בסיס E27 (שקע נורה רגיל). WiFi מהיר 5GHz, סיבוב 360° וראיית לילה צבעונית. ₪199 למצלמה אחת | ₪299 לזוג (חסכון ₪99!) | ₪449 לשלוש.',
    specs:[['חיבור','WiFi 5GHz'],['זווית','360°'],['התקנה','בסיס E27 (שקע נורה)'],['אפליקציה','Ease Life'],['ראיית לילה','כן']] },
  { id:'annke-poe-8ch', variantId:50697567862924, name:'מערכת מצלמות ANNKE 3K | 8 ערוצים POE | 5MP | NVR', price:2999, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1a4d992b979d402eab875624584d0d71i.webp?v=1781270981',
    desc:'מערכת אבטחה מקצועית מלאה — 8 ערוצי POE, מצלמות 5MP עם תאורה כפולה חכמה, NVR מובנה. פתרון ה-all-in-one האולטימטיבי לעסק.',
    specs:[['ערוצים','8 × POE'],['רזולוציה','5MP / 3K'],['תאורה','כפולה חכמה'],['אחסון','NVR מובנה'],['מותג','ANNKE'],['עמידות','IP67']] },
  { id:'outdoor-3mp-wifi', variantId:50740845150348, name:'מצלמת חיצונית 3MP WiFi | ניטור חצר ובית', price:129, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1c83fe4e8bbd401daff3eecb382207fcF.webp?v=1781270982',
    variants:[
      {id:50740845150348, title:'מצלמה אחת', price:129},
      {id:50740845183116, title:'2 מצלמות', price:234},
      {id:50740845215884, title:'3 מצלמות', price:335}
    ],
    desc:'מצלמת אבטחה WiFi חיצונית 3MP — תמונה חדה 1296P, עמידה לגשם ושמש, מושלמת לניטור חצר, גינה, חניה ושער. התקנה פשוטה וצפייה מרחוק מהנייד. פתרון חיצוני אמין ומשתלם לכל בית. ₪129 למצלמה אחת | ₪234 לשתיים | ₪335 לשלוש.',
    specs:[['רזולוציה','3MP 1296P'],['חיבור','WiFi'],['שימוש','חיצוני + פנימי'],['ניטור','מרחוק'],['עמידות','למזג אוויר']] },
  { id:'camhi-solar-dual-4g', variantId:50697568059532, name:'מצלמת Solar Camhi | 4G | עדשה כפולה | 4MP | מסך כפול', price:1499, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S470ffc28904448afb56d9e4fb61690f7O.webp?v=1781270983',
    desc:'מצלמת סולאר מתקדמת עם 4G ועדשה כפולה — תצוגת מסך כפולה (רחב + זום), זיהוי אנשים AI, מעקב אוטומטי. ללא WiFi ללא חשמל.',
    specs:[['חיבור','4G SIM'],['עדשות','כפולות'],['רזולוציה','4MP'],['זיהוי AI','בני אדם'],['הספק','סולארי + סוללה'],['אפליקציה','Camhi']] },
  { id:'tuya-5g-5mp', variantId:50740845314188, name:'מצלמת WiFi 5G | 5MP | AI מעקב אוטומטי | Tuya Smart', price:499, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S54a1c9e7e16b460cab9f75ea7f191200I.webp?v=1781270983',
    variants:[
      {id:50740845314188, title:'מצלמה אחת', price:499},
      {id:50740845346956, title:'2 מצלמות', price:899},
      {id:50740845379724, title:'3 מצלמות', price:1290}
    ],
    desc:'מצלמת WiFi 5GHz מהירה עם בינה מלאכותית — מעקב אוטומטי אחרי תנועה, זיהוי חכם, אינטגרציה עם Tuya Smart ו-Amazon Alexa. ₪499 למצלמה אחת | ₪899 לשתיים | ₪1,290 לשלוש.',
    specs:[['חיבור','WiFi 5G מהיר'],['רזולוציה','5MP'],['AI','מעקב אוטומטי'],['תאימות','Tuya / Alexa'],['כיוון','אוטומטי']] },
  { id:'gadinan-nvr-4k', variantId:50697569206412, name:'מערכת CCTV Gadinan 4K | 8MP | NVR | POE | 4-8 ערוצים', price:1799, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S81abcc42a92f4441b2d272830525ca33w.webp?v=1781270986',
    desc:'מערכת מצלמות 4K מקצועית מ-Gadinan — מצלמות 8MP Ultra HD עם הקלטת שמע, NVR עם אחסון, ממשק POE. פתרון מלא לאבטחה מקצועית.',
    specs:[['רזולוציה','8MP / 4K Ultra HD'],['ערוצים','4-8 ערוצים'],['קלטה','שמע + וידאו'],['חיבור','POE'],['מותג','Gadinan']] },
  { id:'ls-vision-solar-4g', variantId:50740845478028, name:'מצלמת LS VISION סולארית 4G | 8MP 4K | PTZ | V380 Pro', price:699, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S601c134f84f440e1af5394faa6d5e256A.webp?v=1781270984',
    variants:[
      {id:50740845478028, title:'מצלמה אחת', price:699},
      {id:50740845510796, title:'2 מצלמות', price:1259},
      {id:50740845543564, title:'3 מצלמות', price:1799}
    ],
    desc:'מצלמת סולאר-4G פרימיום מ-LS VISION — 8MP באיכות 4K, זיהוי חום PIR, סיבוב PTZ מלא. עובדת ללא WiFi וללא חשמל בכל שטח. ₪699 למצלמה אחת | ₪1,259 לשתיים | ₪1,799 לשלוש.',
    specs:[['רזולוציה','8MP / 4K'],['חיבור','4G SIM + WiFi'],['זיהוי','PIR חום'],['סיבוב','PTZ מלא'],['אפליקציה','V380 Pro'],['הספק','סולארי']] },
  { id:'zumimall-f5', variantId:50740845576332, name:'מצלמת ZUMIMALL F5 | סוללה מגנטית | WiFi 2.4G | 3MP', price:399, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S334c799d473d4f219187f4da6528e85fz.webp?v=1781270984',
    variants:[
      {id:50740845576332, title:'מצלמה אחת', price:399},
      {id:50740845609100, title:'2 מצלמות', price:720},
      {id:50740845641868, title:'3 מצלמות', price:1039}
    ],
    desc:'מצלמת חיצונית אלחוטית עם הר מגנטי — מתקינים תוך שניות בכל מקום, סוללה נטענת, ראיית לילה צבעונית 3MP. ניידות מלאה. ₪399 למצלמה אחת | ₪720 לשתיים | ₪1,039 לשלוש.',
    specs:[['רזולוציה','3MP'],['חיבור','WiFi 2.4G'],['סוללה','נטענת'],['התקנה','מגנטית'],['ראיית לילה','צבעונית'],['מותג','ZUMIMALL']] },
  { id:'annke-nvr-3k', variantId:50697571238028, name:'מערכת ANNKE 3K | 8 ערוצים NVR | מיקרופון מובנה | POE', price:3299, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S550f86c3e7be4034852d29c4d5b81e5fK.webp?v=1781270985',
    desc:'מערכת אבטחה ANNKE 3K מקיפה — NVR 8 ערוצים עם מיקרופון מובנה בכל מצלמה, POE, קלטת שמע 24/7. אבטחה מקצועית ברמה גבוהה.',
    specs:[['ערוצים','8 × POE'],['רזולוציה','3K'],['שמע','מיקרופון מובנה'],['חיבור','POE'],['מותג','ANNKE'],['הקלטה','24/7']] },
  { id:'annke-c1200', variantId:50697571893388, name:'מצלמת ANNKE C1200 | 12MP Ultra HD | תאורה כפולה | PoE', price:2699, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S99436a26ac1d42d6a2ee8a48e30a120cF.webp?v=1781270986',
    desc:'מצלמת IP פרימיום מ-ANNKE — 12MP Ultra HD, תאורה כפולה חכמה (צבעונית + אינפרא-אדום), מיקרופון מובנה, PoE. ראיית לילה יוצאת דופן.',
    specs:[['רזולוציה','12MP Ultra HD'],['תאורה','כפולה חכמה'],['שמע','מיקרופון מובנה'],['חיבור','PoE'],['עמידות','IP67'],['מותג','ANNKE']] },
  { id:'okam-solar-ptz', variantId:50740845740172, name:'מצלמת O-Kam Solar | 8MP 4K | זום 10x | PTZ אוטומטי', price:999, badge:'סולארי', cat:'סולאריות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc3ec6fa7658a40eba3595d2251b148caT.webp?v=1781270986',
    variants:[
      {id:50740845740172, title:'מצלמה אחת', price:999},
      {id:50740845772940, title:'2 מצלמות', price:1799},
      {id:50740845805708, title:'3 מצלמות', price:2599}
    ],
    desc:'מצלמת PTZ סולארית חכמה — 8MP 4K עם זום דיגיטלי 10x, מעקב אוטומטי, ראיית לילה צבעונית. כוח סולארי ומצלמת PTZ ביחד. ₪999 למצלמה אחת | ₪1,799 לשתיים | ₪2,599 לשלוש.',
    specs:[['רזולוציה','8MP / 4K'],['זום','דיגיטלי 10x'],['סיבוב','PTZ אוטומטי'],['הספק','סולארי'],['ראיית לילה','צבעונית'],['אפליקציה','O-Kam']] },
  { id:'annke-2pcs-wifi', variantId:50697572581516, name:'2 מצלמות ANNKE 3MP WiFi | H.265 | עמידות IP66', price:649, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S582f60e2c73b4baaaa4aec900326e73bo.webp?v=1781270987',
    desc:'חבילת 2 מצלמות WiFi של ANNKE — קידוד H.265 (חצי פחות נפח אחסון), IP66 עמיד לגשם, ראיית לילה אינפרא-אדום. חסכון לעומת קנייה נפרדת.',
    specs:[['מצלמות','2 מצלמות'],['רזולוציה','3MP'],['קידוד','H.265'],['חיבור','WiFi'],['עמידות','IP66'],['מותג','ANNKE']] },
  { id:'annke-5mp-bullet', variantId:50740845904012, name:'מצלמת ANNKE 5MP | תאורה חכמה | בולט | IP67', price:369, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sa92795e6e9124626ba6c07382df4f6e6F.webp?v=1781270987',
    variants:[
      {id:50740845904012, title:'מצלמה אחת', price:369},
      {id:50740845936780, title:'2 מצלמות', price:670},
      {id:50740845969548, title:'3 מצלמות', price:960}
    ],
    desc:'מצלמת אנלוגית/IP של ANNKE — 5MP עם תאורה כפולה חכמה (מופעלת רק כשיש תנועה), IP67, עדשה 2.8mm רחבה. אבטחה חכמה וחסכונית. ₪369 למצלמה אחת | ₪670 לשתיים | ₪960 לשלוש.',
    specs:[['רזולוציה','5MP'],['תאורה','כפולה חכמה'],['עמידות','IP67'],['עדשה','2.8mm'],['מותג','ANNKE'],['שימוש','פנים + חוץ']] },
  { id:'annke-nvr-kit', variantId:50740852129932, name:'ערכת ANNKE | NVR 4 ערוצים + מצלמות WiFi 3MP/5MP | IP66', price:679, badge:'מערכת', cat:'מערכות',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S1e83550a8b8744e4beccce5ab55b9034E.webp?v=1781270988',
    variants:[
      {id:50740852129932, title:'2 מצלמות | 3MP', price:679},
      {id:50740852162700, title:'2 מצלמות | 5MP', price:739},
      {id:50740852195468, title:'4 מצלמות | 3MP', price:1049},
      {id:50740852228236, title:'4 מצלמות | 5MP', price:1169}
    ],
    desc:'ערכת אבטחה מלאה עם NVR + מצלמות — 4 ערוצים, מצלמות WiFi ב-3MP או 5MP לבחירה, IP66 עמידות לגשם, ראיית לילה IR. ₪679 ל-2 מצלמות 3MP | ₪739 ל-2 מצלמות 5MP | ₪1,049 ל-4 מצלמות 3MP | ₪1,169 ל-4 מצלמות 5MP.',
    specs:[['ערוצים','4 × NVR'],['רזולוציה','3MP / 5MP'],['חיבור','WiFi'],['עמידות','IP66'],['ראיית לילה','IR'],['מותג','ANNKE']] },
  { id:'ptz-15mp-8k', variantId:50740846264460, name:'מצלמת PTZ 15MP 8K | זום 10x | 3 עדשות | WiFi 5G', price:329, badge:'אאוטדור', cat:'אאוטדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/Sc7a2481f2667426b85f423210a32e710J.webp?v=1781270990',
    variants:[
      {id:50740846264460, title:'מצלמה אחת', price:329},
      {id:50740846297228, title:'2 מצלמות', price:599},
      {id:50740846329996, title:'3 מצלמות', price:849}
    ],
    desc:'מצלמת PTZ עם 3 עדשות עצמאיות ו-15MP 8K — זום דיגיטלי 10x, WiFi 5G מהיר, זיהוי אוטומטי. 3 תצוגות בו-זמנית ממצלמה אחת. ₪329 למצלמה אחת | ₪599 לשתיים | ₪849 לשלוש.',
    specs:[['רזולוציה','15MP / 8K'],['עדשות','3 עצמאיות'],['זום','דיגיטלי 10x'],['חיבור','WiFi 5G'],['סיבוב','PTZ אוטומטי']] },
  { id:'bulb-8mp-e27', variantId:50741149106316, name:'מצלמת נורה 8MP | זום 8x | עדשה כפולה | WiFi E27', price:389, badge:'אינדור', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S9ffe8dec584046c893857017f9e6c7cfT.webp?v=1781611665',
    variants:[
      {id:50741149106316, title:'מצלמה אחת', price:389},
      {id:50741149139084, title:'2 מצלמות', price:699},
      {id:50741149171852, title:'3 מצלמות', price:989}
    ],
    desc:'מצלמת אבטחה בצורת נורה — 8MP עם זום 8x ועדשה כפולה (רחב + זום במקביל). מתחברת לכל בסיס E27 תוך שניות, מעקב אוטומטי אחרי תנועה, שמע דו-כיווני. ₪389 למצלמה אחת | ₪699 לשתיים | ₪989 לשלוש.',
    specs:[['רזולוציה','8MP'],['זום','דיגיטלי 8x'],['עדשות','כפולות (רחב + זום)'],['התקנה','בסיס E27'],['חיבור','WiFi'],['שמע','דו-כיווני'],['מעקב','אוטומטי']] },
  { id:'lenovo-bulb-3mp', variantId:50741149991052, name:'מצלמת נורה Lenovo 3MP | AI מעקב | E27 | Baby Monitor', price:489, badge:'אינדור', cat:'אינדור',
    img:'https://cdn.shopify.com/s/files/1/0774/8098/4716/files/S84f53338185a45e793bb8baa401253f2T.webp?v=1781611823',
    variants:[
      {id:50741149991052, title:'מצלמה אחת', price:489},
      {id:50741150023820, title:'2 מצלמות', price:879},
      {id:50741150056588, title:'3 מצלמות', price:1249}
    ],
    desc:'מצלמת נורה חכמה מ-Lenovo — 3MP, AI מעקב אוטומטי, ראיית לילה צבעונית. מושלמת לניטור תינוק, חיות מחמד וחדרים. מתחברת לכל בסיס E27 ברגע. ₪489 למצלמה אחת | ₪879 לשתיים | ₪1,249 לשלוש.',
    specs:[['מותג','Lenovo'],['רזולוציה','3MP'],['AI','מעקב אוטומטי'],['התקנה','בסיס E27'],['חיבור','WiFi'],['ראיית לילה','צבעונית'],['שימוש','Baby Monitor / חיות מחמד']] }
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
function addToCart(id, qty, variantId, price){
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
  c.forEach(function(i){ var p=getProduct(i.id); if(p){ var unitPrice = i.price || p.price; lines.push('• ' + p.name + ' × ' + i.qty + ' = ' + fmt(unitPrice*i.qty)); } });
  lines.push(''); lines.push('סה"כ: ' + fmt(cartTotal()));
  var ship = cartTotal() >= FREE_SHIP_THRESHOLD ? 'משלוח חינם 🎉' : 'בתוספת משלוח';
  lines.push('(' + ship + ')');
  window.open(waLink(lines.join('\n')), '_blank');
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
  brand: '<svg viewBox="0 0 32 32"><path d="M16 3l11 4v8.4c0 6.8-4.6 12.9-11 14.6-6.4-1.7-11-7.8-11-14.6V7l11-4z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10.5 16.5l3.8 3.8 7.3-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>',
  access: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M19 8h-5v13a1 1 0 11-2 0v-6h-1v6a1 1 0 11-2 0V8H4a1 1 0 110-2h15a1 1 0 110 2z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 7v1.5h2v2h-4.5a.5.5 0 000 1H14a2.5 2.5 0 010 5h-1v1.5h-2V16.5H9v-2h4.5a.5.5 0 000-1H10a2.5 2.5 0 010-5h1V7z"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M21 4.5 19.5 3 15 7.5l2 2zm-7.4 4.6L4.4 18.3l1.4 1.4 9.2-9.2zM18 11.6l-2-2-8 8 2 2z"/></svg>',
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
  // preconnect ל-CDN של התמונות — מאיץ טעינה ראשונה
  add('link', { rel:'preconnect', href:'https://cdn.shopify.com', crossorigin:'' });
  add('link', { rel:'dns-prefetch', href:'https://cdn.shopify.com' });
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
          '<div class="footer-logo" dir="ltr">Safe<span>View</span></div>' +
          '<p>חנות מצלמות האבטחה החכמות של ישראל. מצלמות סולאריות, פנימיות וחיצוניות עם אחריות מלאה ותמיכה בעברית.</p>' +
        '</div>' +
        '<div class="footer-col"><h4>חנות</h4>' +
          '<a href="index.html#products">כל המצלמות</a><a href="index.html#categories">קטגוריות</a><a href="index.html#bundles">חבילות במבצע</a><a href="compare.html">השוואה</a><a href="cart.html">עגלת קניות</a></div>' +
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

document.addEventListener('DOMContentLoaded', function(){
  injectSeoMeta();
  injectChrome();
  initReveal();
  initFaq();
  initAnalytics();
  registerSW();
  showCookieBanner();
});
