# SafeView — הוראות ל-Claude (קרא אותי קודם!)

> קובץ זה נטען אוטומטית ע"י Claude Code. הוא נועד לאפשר המשך עבודה רציף מכל מחשב.
> **למידע מלא ומפורט קרא גם את `SafeView_CONTEXT.md`** שנמצא לצידו.

---

## מה זה הפרויקט

**SafeView** — חנות אונליין ישראלית למצלמות אבטחה (מותג Jovision ועוד, יבוא מסין).
בעלים: רפאל, ירושלים. שפה: עברית RTL. מטבע: ₪.

יש **שני חלקים נפרדים** לפרויקט — אל תבלבל ביניהם:

### 1. אתר HTML עצמאי (זה ה-repo הזה) 🟢
אתר רב-עמודי מלא בעברית, vanilla HTML/CSS/JS, ללא פלטפורמה. מבנה הקבצים:
- **`index.html`** — דף בית (hero, קטגוריות, 9 מוצרים, חבילות, יתרונות, הבטחות, FAQ)
- **`product.html?id=<id>`** — עמוד מוצר בודד דינמי (מפרט + מוצרים קשורים)
- **`cart.html`** — עגלת קניות (localStorage) עם צ'קאאוט בוואטסאפ
- **`about.html` / `contact.html` / `faq.html`** — עמודי תוכן
- **`shipping/returns/privacy/terms.html`** — 4 דפים משפטיים
- **`blog.html`** — 5 מאמרי מדריך
- **`assets/style.css`** — כל העיצוב (Dark Tech), כולל רספונסיב
- **`assets/app.js`** — מקור האמת: קטלוג `PRODUCTS`, עגלה, וואטסאפ, הזרקת nav/footer, אנימציות, FAQ, אנליטיקס
- **`sitemap.xml` / `robots.txt`** — SEO

**לעריכה:**
- מוצרים, מחירים, מפרט → מערך `PRODUCTS` ב-`assets/app.js`
- מספר וואטסאפ → `WA_NUMBER` ב-`assets/app.js` (כרגע `972586343786`)
- Google Analytics / Facebook Pixel → `GA4_ID` / `FB_PIXEL_ID` ב-`assets/app.js` (ריקים, ממתינים למזהים)
- nav ו-footer מוזרקים אוטומטית דרך `injectChrome()` ב-app.js — לעדכון תפריט עורכים שם פעם אחת.
- סגנון עיצוב: **"Dark Tech"** (רקע כהה #080a0f, כחול זוהר #3a9fff, פונטים Rajdhani + Noto Sans Hebrew). הפלטה המלאה ב-`SafeView_CONTEXT.md` סעיף 3.
- פותחים אותו בלחיצה כפולה בדפדפן — לא צריך שרת.

### 2. חנות Shopify (חיה בענן, *לא* ב-repo הזה) ☁️
- דומיין: `azxiyx-z1.myshopify.com`
- כל העבודה עליה נשמרת בצד של Shopify, נגישה מכל מחשב דרך התחברות לאדמין.
- **אינה קשורה ל-GitHub** — אל תנסה לדחוף אותה לכאן.

---

## כללי עבודה על האתר (חשוב!)

1. **שמור על סגנון Dark Tech** — אותה פלטה, אותם פונטים, אותם עקרונות (ראה CONTEXT סעיף 3).
2. **תמיד עברית + RTL**, אנגלית טכנית מינימלית (LIVE, 2K, IP67).
3. **Vanilla בלבד** — בלי ספריות כבדות. Performance first.
4. **Mobile-first** — רוב הגולשים מהטלפון.
5. תמונות מוצרים: יש קישורי CDN ב-`SafeView_CONTEXT.md` סעיף 2.

---

## תהליך Git (לעבודה מכל מחשב)

**במחשב חדש (פעם אחת):**
```bash
git clone https://github.com/raphaelsilber325-coder/-.git safeview
cd safeview
```

**בתחילת כל עבודה:** `git pull`
**בסוף כל עבודה:**
```bash
git add -A
git commit -m "תיאור השינוי"
git push
```

> ⚠️ הצ'אט עם Claude **לא** נשמר ב-GitHub — רק הקבצים. הקובץ הזה (CLAUDE.md) הוא ה"זיכרון" שמאפשר ל-Claude במחשב אחר להמשיך עם ההקשר.

---

## מה נשאר לעשות

### אתר HTML
- [ ] **תמונות קנבה** — צריך לייצר מחדש: סולארית 20MP #1, פלאגשיפ 16MP, באנר בעיה+פתרון, פוסטים #1 ו-#4. מכסת קנבה היומית נגמרה — נמשיך כשתתחדש.
- [ ] **לוגו #3** — להעלות את הלוגו האמיתי שבחר רפאל ולהחליף את `ICON.brand` (כרגע מגן SVG ב-app.js — מגן עם ✓ זוהר בכחול).
- [ ] **Analytics** — להוסיף `GA4_ID` ו-`FB_PIXEL_ID` ל-`assets/app.js` (כרגע ריקים בשורות 226-227).
- [ ] **דומיין** — `safeview.co.il` במקום הכתובת של github.io.

### חנות Shopify
- [ ] **לפרסם תמת "Copy of Horizon"** ולבטל Password Protection — כל השינויים שעשינו לא חיים ללקוחות עד שזה ייעשה.
- [ ] **עיגול מחירים** (₪405.18 → ₪399 וכו') — אופציונלי, דורש החלטה.
- [ ] **ניקוי SKUs** מנוסח AliExpress — אופציונלי.

---

## היסטוריית סשנים

**8 ביוני 2026 — סשן 1:** העלאת הפרויקט ל-GitHub. חולצו `safeview_darktech.html` ו-`SafeView_CONTEXT.md` מתוך `files.zip`.

**8 ביוני 2026 — סשן 2:** בנייה מלאה של אתר רב-עמודי (פיצול CSS/JS, 11 דפים, עגלה, חבילות, FAQ, sitemap).

**10 ביוני 2026 — סשן 3:** ליטוש מקיף + עבודה בחנות Shopify דרך MCP.

באתר ה-HTML:
- `ICON.brand` חדש (מגן SafeView זוהר) + תיקון כיוון הלוגו ל-`dir="ltr"`
- הסרת ה-cam-card מהירו לטובת פריסה ממורכזת
- `ICON.mail` + `ICON.phone` חדשים, תיקון `contact.html`
- `favicon.svg` + קישור ב-11 דפי HTML
- SEO דינמי לכל מוצר: og tags + JSON-LD Product Schema ב-`product.html`
- JSON-LD Organization + Store בדף הבית
- canonical/og:url/og:image/twitter auto-inject בכל הדפים (דרך `injectSeoMeta()`)
- דף `404.html` מותאם
- skip-to-content link, focus states, `aria-expanded` ב-FAQ
- בר משלוח חינם תמיד גלוי מתחת ל-nav
- sticky add-to-cart במובייל בעמוד מוצר
- ניקוי קוד מת (cam-*, hero-visual, keyframes scan)
- `sitemap.xml` ו-`robots.txt` עודכנו מ-`/-/` ל-`/safeview/`
- תיקון באג FAQ accordion (האזנה כפולה גרמה לפתיחה+סגירה מיידית)
- FAQ הורחב מ-5 ל-8 שאלות בדף הבית, ומ-10 ל-12 בדף ה-FAQ
- הסרת ה-👋 מכל הודעות הוואטסאפ (היה תו שבור)
- הסרת כל ההתחייבויות "3-7 ימי עסקים"

בחנות Shopify:
- 12 מוצרים: `productType` הוגדר ("מצלמת אבטחה" / "חבילת אבטחה")
- תגיות עבריות לכל מוצר (סולארי, פנימי, חיצוני, AI, IP66/67 וכו')
- 3 תיאורי החבילות הורחבו משמעותית (value props + מה כלול + מתאים עבור)
- דפי `shipping-policy` ו-`faq` בחנות עודכנו (הסרת "3-7 ימי עסקים" + תיקון שגיאות הקלדה)
- SEO meta לקולקציית "חבילות במבצע"
- קולקציית "Home page" הורחבה מ-1 ל-7 מוצרים בולטים
- 3 החבילות הוגדרו `inventoryPolicy=CONTINUE` (הזמנה אפשרית גם כש-totalInventory=0)

---

*עדכן את הקובץ הזה בסוף כל סשן משמעותי כדי שהמחשב הבא יידע מה קרה.*
