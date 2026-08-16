# Návod: Rady a poradna → Google Gemini (zdarma)

Tento návod tě provede kompletním zprovozněním nové sekce **„Rady a poradna"**
v appce Uklidni To. Sekce je v `index.html` / `index-en.html` už hotová
(vyhledávací pole, tlačítka s tipy, zobrazení odpovědi) — chybí jen propojit
ji s Gemini přes tvůj existující Firebase projekt. Celé to jde **zdarma**,
bez zadávání platební karty, na plánu **Spark**.

Časová náročnost: cca 15–20 minut.

---

## Jak to funguje (v kostce)

- Používáme **Firebase AI Logic** — oficiální službu Firebase, která ti dá
  přístup ke Gemini modelům přímo z prohlížeče, aniž bys musel/a psát
  vlastní backend nebo řešit Cloud Functions (ty by vyžadovaly placený
  plán Blaze).
- Tvůj API klíč ke Gemini se nikde neobjeví natvrdo v kódu stránky —
  Firebase AI Logic to řeší jinak (přes tzv. service agenta), takže
  nehrozí, že by ho někdo „ukradl" z JavaScriptu.
- Aby appku nemohl zneužívat někdo cizí (a nevyčerpal tvoji zdarma kvótu),
  přidáme **App Check** s reCAPTCHA v3 — taky zdarma.
- Bezpečnostní a tematické mantinely (jen témata klidu/zdraví, žádné
  diagnózy, vždy doporučení konzultovat odborníka) už jsou napsané přímo
  v kódu stránky (tzv. system instruction) — nemusíš nic programovat.

**Co budeš potřebovat:** Google účet, ke kterému je připojený tvůj
stávající Firebase projekt (ten, který už používáš pro počítadlo
návštěvnosti a admin přihlášení).

---

## Krok 1 — Zapni Firebase AI Logic

1. Otevři [Firebase konzoli](https://console.firebase.google.com/) a
   vyber svůj projekt (ten se `projectId: "uklidnito-d580e"`, jak ho máš
   už nastavený v `index.html`).
2. V levém menu klikni na **Build → AI Logic** (může se jmenovat i
   „Generative AI" nebo podobně, Google rozhraní se občas přejmenovává).
3. Klikni na **Get started / Začít**.
4. Firebase se zeptá, kterého poskytovatele Gemini API chceš použít:
   - Vyber **Gemini Developer API** (ne Vertex AI) — to je varianta, která
     jde použít **zdarma na Spark plánu**, bez propojení platební karty.
5. Nech Firebase automaticky povolit potřebná API a vytvořit interní
   přístupové údaje. Nikam nic ručně kopírovat nemusíš — SDK v kódu
   stránky (viz Krok 4) si poradí samo, jakmile je AI Logic zapnuté
   pro tento projekt.
6. Až bude hotovo, uvidíš přehled dostupných modelů („Model Garden").
   Kód appky si teď **sám umí poradit s tím, že Google modely mění** —
   viz sekce „Co se stane, když Google model zruší" níže. Většinou tedy
   nemusíš nic ručně sledovat ani upravovat.

### Co se stane, když Google model zruší

Appka nezkouší jen jeden pevně daný model, ale má v kódu (proměnná
`MODEL_CANDIDATES`) seznam několika modelů seřazených od nejnovějšího.
Když první selže s chybou typu „model už není dostupný", appka
automaticky zkusí další v pořadí — a jakmile jeden zafunguje, zapamatuje
si ho v prohlížeči (localStorage), aby příště zkusila rovnou jeho.

Ty tak většinou nemusíš nic dělat, ani hlídat. Jedinou situací, kdy
bude potřeba zasáhnout, je, když Google zruší **úplně všechny** modely
ze seznamu najednou (to se stává jen zřídka a s dostatečným předstihem) —
pak appka zobrazí obvyklou chybovou hlášku a stačí do pole
`MODEL_CANDIDATES` v kódu (`index.html` i `index-en.html`) připsat
aktuální název modelu z Firebase konzole (AI Logic → Model Garden).

> 💡 Zdarma dostupné modely mají obvykle omezení typu „X požadavků za
> minutu" a „Y požadavků za den" (řádově nízké desítky až stovky denně).
> Pro osobní web s rozumnou návštěvností to běžně stačí. Pokud by ti to
> jednou nestačilo, jediné, co uděláš, je propojit projekt s platební
> kartou (přechod na Blaze) — do vyčerpání zdarma kvóty se ale nic
> neplatí, je to jen pojistka pro případ nárazového zájmu.

---

## Krok 2 — Nastav App Check (ochrana proti zneužití)

Bez App Check ti od 2. 11. 2026 Firebase AI Logic přestane fungovat úplně
(Google to bude vyžadovat povinně) — a i předtím je to dobrý nápad, protože
to zabrání robotům/skriptům volat tvého Gemini bota načerno a vyčerpat
kvótu za tebe.

1. Ve Firebase konzoli jdi na **Build → App Check**.
2. Klikni na **Get started**, vyber svou webovou aplikaci (tu, kterou už
   máš registrovanou pro `uklidnito-d580e`).
3. Jako poskytovatele zvol **reCAPTCHA v3**.
4. Firebase tě buď propojí přímo s Google reCAPTCHA, nebo tě odkáže na
   [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) —
   tam:
   - Zaregistruj novou stránku, typ **reCAPTCHA v3**.
   - Jako doménu zadej `uklidnito.github.io` (a případně i `uklidnito.eu`,
     pokud web běží i na vlastní doméně).
   - Po vytvoření dostaneš **Site key** (veřejný, jde do kódu stránky) a
     **Secret key** (ten zadáváš jen do Firebase konzole, nikam do webu).
5. Site key zkopíruj — budeš ho potřebovat v Kroku 4.
6. Ve Firebase App Check nastavení povol **enforcement** (vynucování) pro
   AI Logic / Gemini API, až budeš mít vše otestované (viz Krok 6) — než
   to otestuješ, nech to spíš v režimu „monitorování", ať se sám sobě
   omylem nezablokuješ.

---

## Krok 3 — Zkontroluj Firebase konfiguraci ve webu

V `index.html` (i `index-en.html`) už máš na dvou místech stejný blok
`firebaseConfig` — jednou u počítadla návštěvnosti, podruhé v novém bloku
pro Rady a poradnu. Obě místa používají tentýž `projectId`, takže pokud je
první blok už vyplněný tvými reálnými údaji (což podle nahraného souboru
je), **v druhém bloku nemusíš nic měnit** — je to schválně napsané stejně,
aby to fungovalo automaticky.

Pokud bys v budoucnu měnil/a Firebase projekt, over si, že jsou
**oba** bloky `firebaseConfig` ve shodě (najdeš je přes hledání textu
`firebaseConfig` v souboru).

---

## Krok 4 — Vlož reCAPTCHA klíč do kódu

1. Otevři `index.html`.
2. Najdi (Ctrl+F) text `SEM_VLOŽ_RECAPTCHA_V3_SITE_KEY`.
3. Nahraď ho svým Site key z Kroku 2, například:

   ```js
   const RECAPTCHA_V3_SITE_KEY = '6Lc1234567890abcdefgHIJKLMNOP';
   ```

4. Stejnou úpravu udělej i v `index-en.html` (tam hledej
   `PUT_YOUR_RECAPTCHA_V3_SITE_KEY_HERE`).
5. Pokud jsi v Kroku 1 zjistil/a, že chceš jiný model než
   `gemini-3.5-flash`, uprav na stejném místě i řádek:

   ```js
   const GEMINI_MODEL_NAME = 'gemini-3.5-flash';
   ```

6. Ulož a nahraj oba soubory zpět do repozitáře (přepiš stávající).

---

## Krok 5 — Zkontroluj pravidla, aby AI Logic mohlo číst tvůj projekt

Na rozdíl od Realtime Database tady žádná ruční pravidla nastavovat
nemusíš — Firebase AI Logic si přístup řeší sám přes interní service
účet, jakmile je zapnuté (Krok 1). Stačí, aby byl **App Check** správně
napojený na stejnou webovou appku, kterou máš registrovanou v projektu
(to už zajišťuje Krok 2).

---

## Krok 6 — Vyzkoušej to

1. Otevři web (lokálně stačí otevřít `index.html` v prohlížeči, nebo
   rovnou nahraj na GitHub Pages).
2. V levém menu klikni úplně dole na **💬 Rady a poradna**.
3. Zkus třeba tlačítko „Jak snížit stres" nebo napiš vlastní dotaz a
   klikni na **Zeptat se**.
4. Co může (ne)fungovat:
   - **Objeví se odpověď od AI** → hotovo, funguje to! 🎉
   - **„Vyhledávání zatím není nastavené…"** → zkontroluj, že jsi opravdu
     nahradil/a placeholder textu `SEM_VLOŽ_RECAPTCHA_V3_SITE_KEY` reálným
     klíčem a že je AI Logic zapnuté (Krok 1).
   - **„Odpověď se teď nepodařilo získat…"** → otevři si v prohlížeči
     konzoli (F12 → Console) a podívej se na chybovou hlášku:
     - Zmiňuje-li se „App Check" → zkontroluj Site key a doménu
       v reCAPTCHA administraci (Krok 2).
     - Zmiňuje-li se „quota" nebo „429" → vyčerpal/a jsi denní/minutový
       limit zdarma — počkej, nebo zkus jiný model s vyšší kvótou.
     - Zmiňuje-li se „permission" nebo „billing" → AI Logic asi není
       pro tento projekt správně zapnuté (vrať se ke Kroku 1) nebo je
       vybraný model dostupný jen na placeném Blaze plánu.

Až vše funguje, můžeš se ve Firebase App Check (Krok 2, poslední bod)
přepnout z „monitorování" do ostrého vynucování — appka pak přestane
odpovídat komukoliv, kdo nejde přes tvou skutečnou webovou stránku.

---

## Co dělat, když se to nechce chytit

- **Zkontroluj konzoli v prohlížeči (F12).** Naprostá většina chyb
  Firebase AI Logic tam napíše srozumitelný důvod.
- **Ověř přesný název modelu.** Google modely dost často mění dostupnost
  a názvy (`gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-flash-latest`
  apod.) — nejaktuálnější seznam najdeš přímo ve Firebase konzoli pod
  AI Logic → Model Garden, nebo na
  [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models).
- **Zkus to bez App Check nejdřív.** Pokud chceš rychle otestovat, jestli
  vůbec funguje samotné volání Gemini, můžeš dočasně nechat
  `RECAPTCHA_V3_SITE_KEY` prázdný (placeholder) — appka pak App Check
  vynechá. Nezapomeň to ale před ostrým nasazením doplnit, jinak (hlavně
  po listopadu 2026) přestane fungovat úplně a navíc bude kvóta
  nechráněná.
- **Připomeň si, že jde o dva firebaseConfig bloky.** Jsou schválně
  duplicitní (jeden pro klasický Firebase SDK, jeden pro modulární AI
  Logic SDK) — nezapomeň, že když měníš projekt, měníš oba.

---

## Bezpečnostní a obsahové mantinely (už hotovo, jen pro info)

V kódu je nastavená tzv. *system instruction* — instrukce, kterou Gemini
dostane před každým dotazem uživatele a která mu říká:

- Odpovídat **jen** na témata klidu, zvládání stresu, zdravého životního
  stylu, spánku, doplňků stravy, kondice a duševní pohody.
- Na dotazy mimo tato témata (programování, politika, domácí úkoly...)
  zdvořile odmítnout a nasměrovat zpět k tématu webu.
- **Nikdy nestanovovat diagnózu** ani nepředepisovat konkrétní dávkování.
- Na konec **každé** odpovědi připojit doporučení konzultovat odborníka.

Tohle je slušná první bariéra, ale žádná AI instrukce není neprůstřelná
na 100 %. Doporučuju:
- Nechat App Check zapnuté napořád (Krok 2) — omezí to zneužití appky
  jako obecného „volného" chatbota mimo tvou stránku.
- Občas si sám/sama pár dotazů vyzkoušet a zkontrolovat, že odpovědi
  sedí se zaměřením webu.
- Nezapomenout, že i tak jde o AI-generovaný obsah — na stránce je proto
  napevno viditelné upozornění nad vyhledáváním i pod každou odpovědí,
  že jde o obecnou informaci, ne o lékařskou radu.

---

## Shrnutí co je kde v kódu

| Co | Kde v `index.html` / `index-en.html` |
|---|---|
| Odkaz v levém menu | `💬 Rady a poradna` / `💬 Advice & Guidance`, úplně poslední položka menu |
| HTML sekce s vyhledáváním | `<section class="content" id="poradna" ...>` |
| CSS styly | blok začínající komentářem `/* ---------- Rady a poradna (AI search, Gemini) ---------- */` |
| JS modul s Firebase AI Logic | `<script type="module">` blok s komentářem `RADY A PORADNA` / `ADVICE & GUIDANCE`, těsně před registrací Service Workera |
| Místo pro reCAPTCHA klíč | proměnná `RECAPTCHA_V3_SITE_KEY` |
| Místo pro název modelu | proměnná `GEMINI_MODEL_NAME` |
| Tematické/bezpečnostní mantinely | proměnná `SYSTEM_INSTRUCTION` |
