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

## מה נשאר לעשות באתר ה-HTML

- [ ] **תמונות קנבה** — צריך לייצר מחדש: סולארית 20MP #1, פלאגשיפ 16MP (דומה למוצר האמיתי), באנר בעיה+פתרון, פוסטים #1 ו-#4. מכסת קנבה היומית נגמרה — נמשיך כשתתחדש.
- [ ] **GitHub Pages** — להפעיל ידנית ב-Settings → Pages → Branch: main → Save (אני לא יכול לעשות זאת מבחוץ).
- [ ] **לוגו** — להעלות את הלוגו #3 שבחר רפאל ולהחליף את אייקון `ICON.cam` בנאב (כרגע אייקון SVG גנרי).
- [ ] **Analytics** — כשיש GA4 / Pixel, להוסיף את ה-IDs ל-`assets/app.js`.

---

## היסטוריית סשנים

**8 ביוני 2026 — סשן 1:** העלאת הפרויקט ל-GitHub. חולצו `safeview_darktech.html` ו-`SafeView_CONTEXT.md` מתוך `files.zip`.

**8 ביוני 2026 — סשן 2 (זה):** בנייה מלאה של אתר רב-עמודי:
- שובר את `safeview_darktech.html` ל-`assets/style.css` + `assets/app.js` משותפים
- `index.html` משודרג: hero, קטגוריות, **כל 9 המוצרים**, **3 חבילות**, יתרונות, הבטחות, FAQ, אנימציות גלילה
- `product.html?id=<id>` — עמוד מוצר דינמי מלא: גלריה, מפרט, מוצרים קשורים
- `cart.html` — עגלת קניות עם localStorage + צ'קאאוט בוואטסאפ + בר משלוח חינם
- `about.html` / `contact.html` / `faq.html` — עמודי תוכן
- `privacy.html` / `terms.html` / `returns.html` / `shipping.html` — 4 דפים משפטיים
- `blog.html` — מאמרי מדריך
- `sitemap.xml` + `robots.txt` ל-SEO + JSON-LD Schema בדף הבית
- וואטסאפ צף, אייקוני SVG, רספונסיב מלא למובייל, תפריט המבורגר
- מספר וואטסאפ הוגדר: `972586343786`

הפרויקט מוכן לפרסום ב-GitHub Pages. המשך טבעי: לייצר תמונות חדשות בקנבה כשהמכסה מתחדשת.

---

*עדכן את הקובץ הזה בסוף כל סשן משמעותי כדי שהמחשב הבא יידע מה קרה.*
