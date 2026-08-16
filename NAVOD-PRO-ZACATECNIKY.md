# Návod pro začátečníky: Rady a poradna (Gemini) + je to bezpečné na GitHubu?

Tenhle návod je psaný tak, jako bys s Firebase a GitHubem pracoval/a
poprvé. Jde krok za krokem, nic nepředpokládá a u každého kroku
vysvětluje *proč* ho děláš, ne jen *co* kliknout.

Nejdřív ale to nejdůležitější, protože to bylo tvoje hlavní obava:

---

## 🔒 Nejdůležitější otázka: „Nebude můj klíč veřejně vidět na GitHubu?"

**Krátká odpověď: Ne, nic tajného na GitHubu nebude — a to schválně,
je to tak navržené.**

Tohle je úplně nejčastější obava začátečníků a je naprosto na místě si
ji ověřit. Pojďme si to rozebrat, protože v tomhle projektu se objevují
**tři různé „klíče"** a každý se chová jinak:

### 1. Firebase `apiKey` (ten, co už máš v `index.html`)
Tohle **není tajný klíč** v tom smyslu, jak si lidi obvykle představují
„heslo" nebo „API klíč". Je to spíš **veřejná adresa/jmenovka** tvého
Firebase projektu — říká prohlížeči „mluv s projektem uklidnito-d580e",
nic víc. Google to takhle navrhl schválně a i ve své vlastní
dokumentaci píše, že tenhle klíč **má být** veřejně viditelný v kódu
webu (najdeš ho běžně na tisících veřejných webů — stačí si v
prohlížeči dát „zobrazit zdrojový kód" na libovolném webu s Firebase).

Skutečná ochrana tvých dat nestojí na skrývání tohoto klíče, ale na:
- **Pravidlech Realtime Database** (nastavuješ ve Firebase konzoli —
  určují, kdo smí co číst/zapisovat),
- **App Check** (viz bod 3 — ověřuje, že požadavek jde opravdu z tvého
  webu, ne odjinud).

➡️ Tenhle klíč tedy klidně nech v `index.html` tak, jak je. Nic se
neděje.

### 2. reCAPTCHA Enterprise „Site key" (ten, co vkládáš do kódu podle návodu)
Stejná situace — **site key je taky určený k tomu, aby byl veřejný**.
Google reCAPTCHA doslova funguje tak, že tenhle klíč musí být na
stránce vidět, aby ho mohl načíst prohlížeč každého návštěvníka. (Aktuální
verze Google reCAPTCHA se jmenuje „Enterprise" — nenech se tím slovem
vylekat, jde jen o název, ne o to, že bys musel/a platit nebo mít
firmu; free kvóta je pořád štědrá.)

➡️ I ten klidně vlož přímo do `index.html`, jak návod říká.

### 3. Kde je „Secret key"?
U starší reCAPTCHA v3 jsi dostal/a dva klíče — Site key (veřejný) a
Secret key (tajný). U novější reCAPTCHA Enterprise, kterou teď návod
používá, žádný samostatný Secret key neřešíš vůbec — ověřování mezi
sebou domlouvají přímo Google Cloud a Firebase na pozadí, bez toho, aby
sis ty musel/a jakýkoliv tajný klíč opisovat. O nic tím nepřicházíš na
bezpečnosti — je to jen jinak (a jednodušeji) zapojené.

➡️ Pokud podle návodu vkládáš do `index.html` jen jeden klíč (Site key
z reCAPTCHA Enterprise) a nic jiného, je vše v pořádku.

### A co samotný přístup ke Gemini (AI)?
Tady je nejlepší zpráva: v tomhle nastavení (Firebase AI Logic)
**neexistuje žádný samostatný „Gemini API klíč"**, který by bylo
potřeba kamkoliv vkládat nebo skrývat. Přístup ke Gemini řeší Firebase
interně přes tzv. service účet, ke kterému se web nikdy napřímo
nedostane. Kdyby sis místo Firebase AI Logic zvolil/a jinou cestu
(přímé volání Google AI Studio s klasickým API klíčem), *tam* by šlo
o opravdu citlivý klíč, který by na GitHubu být neměl — proto jsme
zvolili právě tenhle bezpečnější postup.

**Shrnutí:** Vše, co ti návod říká vložit do `index.html`, je navržené
tak, aby veřejně viditelné být mohlo.

---

## Co budeš potřebovat, než začneš

- Přístup ke svému **Google účtu**, pod kterým je vytvořený tvůj
  Firebase projekt (ten s `projectId: "uklidnito-d580e"`).
- Přístup ke svému **GitHub repozitáři**, kam nahráváš soubory webu.
- Asi 15–20 minut času.

Nic z toho nestojí peníze a nikde tě nepožádá o platební kartu, pokud
budeš postupovat přesně podle kroků níže.

---

## Krok 1 — Otevři Firebase konzoli

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com/)
   a přihlas se stejným Google účtem, pod kterým máš projekt.
2. Klikni na dlaždici svého projektu (podle jména by to mělo být
   „uklidnito" nebo podobně).

Pokud vidíš přehledovou stránku projektu s ikonkami různých služeb
(Realtime Database, Authentication apod.), jsi na správném místě.

---

## Krok 2 — Zapni „AI Logic"

1. V levém postranním menu najdi sekci **Build** (Sestavit) a v ní
   položku **AI Logic**. (Pokud tam tuhle položku nevidíš hned, zkus se
   podívat i pod „Všechny produkty" — Google rozhraní se občas mírně
   liší podle verze.)
2. Klikni na modré tlačítko **Get started** / **Začít**.
3. Objeví se otázka, kterého poskytovatele chceš použít. Zvol
   **Gemini Developer API**. (Druhá možnost, Vertex AI, vyžaduje
   propojení platební karty — tu my nechceme.)
4. Klikni přes průvodce dál — Firebase si sám povolí, co potřebuje.
   Nikam nic ručně nekopíruješ, jen klikáš „Next" / „Pokračovat".
5. Na konci uvidíš přehled dostupných modelů. Není potřeba nic měnit —
   kód webu má přednastavený model, který na začátku roku 2026 fungoval
   zdarma. (Pokud bys chtěl/a mít jistotu, že model pořád „zdarma" je,
   najdeš u každého modelu v tomhle přehledu štítek s cenou.)

**Jak poznáš, že se to povedlo:** V menu AI Logic už neuvidíš tlačítko
„Get started", ale rovnou přehled modelů / nastavení.

---

## Krok 3 — Vytvoř klíč v reCAPTCHA Enterprise a zapni App Check

Tohle je bezpečnostní pojistka — bez ní by mohl někdo cizí (třeba
automatický robot) tvůj Gemini bot volat pořád dokola a vyčerpat ti
zdarma limit.

> ⚠️ Google mezitím přejmenoval a přesunul reCAPTCHA pod Google Cloud
> jako „reCAPTCHA Enterprise" — starší samostatná stránka
> google.com/recaptcha/admin lidi teď na migraci sama upozorňuje. Slovo
> „Enterprise" nezvaň — neznamená to, že bys musel/a platit nebo mít
> firmu, jde jen o nový název téhož nástroje. Postupuj takhle:

1. Otevři [Google Cloud konzoli](https://console.cloud.google.com/) a
   nahoře v přepínači projektů vyber ten samý projekt, co máš ve
   Firebase (měl by se jmenovat podle „uklidnito").
2. Do vyhledávacího pole nahoře napiš **reCAPTCHA Enterprise** a klikni
   na výsledek.
3. Pokud tě Google vyzve, aby ses povolil/a „reCAPTCHA Enterprise API",
   klikni na **Povolit / Enable**.
4. Klikni na **Vytvořit klíč / Create key**.
5. Vyplň:
   - Název: cokoliv, třeba „Uklidni To"
   - Typ platformy: **Webová stránka / Website**
   - Domény: napiš `uklidnito.github.io` (a pokud web běží i na vlastní
     doméně typu `uklidnito.eu`, přidej i tu, každou na nový řádek)
   - Volbu „Use checkbox challenge" / „Použít zaškrtávací test"
     **nezaškrtávej** — chceme neviditelnou verzi
6. Klikni na **Vytvořit / Create**.
7. Zobrazí se ti **Site key** (dlouhý řetězec písmen a čísel) —
   zkopíruj si ho, budeš ho potřebovat v Kroku 4. (Na rozdíl od starší
   verze tu žádný druhý „Secret key" neřešíš, jak je vysvětlené výše.)
8. Teď se přepni zpátky do [Firebase konzole](https://console.firebase.google.com/)
   a jdi na **Build → App Check**.
9. Klikni **Get started**.
10. Najdi svou webovou aplikaci v seznamu (měla by se jmenovat podle
    webu) a klikni na **Register** / **Registrovat** u ní.
11. Jako typ ochrany zvol **reCAPTCHA Enterprise**.
12. Vlož Site key z kroku 7 a registraci dokonči.

---

## Krok 4 — Vlož Site key do webu

1. Otevři soubor `index.html` (třeba v jakémkoliv textovém editoru,
   nebo přímo na GitHubu přes tužtičku „Edit").
2. Použij hledání (Ctrl+F nebo Cmd+F) a najdi text:
   ```
   SEM_VLOŽ_RECAPTCHA_SITE_KEY
   ```
3. Nahraď ho svým Site key ze Kroku 3. Bude to vypadat nějak takhle
   (tvůj klíč bude jiný řetězec písmen a čísel):
   ```js
   const RECAPTCHA_SITE_KEY = '6Lc1234567890abcdefgHIJKLMNOP';
   ```
4. Ulož soubor.
5. Otevři i `index-en.html` a udělej to samé, tam hledej:
   ```
   PUT_YOUR_RECAPTCHA_SITE_KEY_HERE
   ```
6. Nahraj obě upravené verze zpátky do svého GitHub repozitáře
   (přepiš jimi stávající soubory).

**Je to bezpečné takhle nahrát na veřejný GitHub?** Ano — jak je
vysvětlené na začátku návodu, Site key je určený k tomu být veřejný.

---

## Krok 5 — Vyzkoušej, že to funguje

1. Otevři svůj web (buď přes GitHub Pages adresu, nebo si `index.html`
   otevři lokálně v prohlížeči).
2. Klikni na ikonku menu vlevo nahoře a úplně dole klikni na
   **💬 Rady a poradna**.
3. Zkus kliknout na jedno z předpřipravených tlačítek (např. „Jak
   snížit stres") nebo napiš vlastní krátký dotaz a klikni na
   **Zeptat se**.
4. Během pár vteřin by se měla objevit odpověď.

### Co dělat, když se nic nestane / vidíš chybu

| Co vidíš | Co to znamená | Co udělat |
|---|---|---|
| „Vyhledávání zatím není nastavené…" | Site key ještě není vložený nebo je pořád jen placeholder | Vrať se ke Kroku 4 |
| „Odpověď se teď nepodařilo získat…" | Něco selhalo při volání Gemini | Otevři v prohlížeči nástroje pro vývojáře (klávesa F12), záložku **Console**, a podívej se na chybovou hlášku (viz níže) |
| V konzoli vidíš „App Check token is invalid" | Site key v kódu nesedí s tím, co má zaregistrované App Check, nebo je pořád nastavená stará reCAPTCHA v3 místo Enterprise | Zkontroluj, že jsi ve Firebase App Check (Krok 3) zvolil/a poskytovatele **reCAPTCHA Enterprise** (ne v3) a že Site key v kódu je z reCAPTCHA Enterprise, ne ze staré v3 administrace |
| V konzoli vidíš zmínku o „App Check" jinak | Doména v reCAPTCHA Enterprise nesedí nebo klíč je špatně zkopírovaný | V Google Cloud konzoli → reCAPTCHA Enterprise zkontroluj, že doména `uklidnito.github.io` (případně tvoje vlastní doména) je u klíče opravdu zapsaná přesně |
| V konzoli vidíš „quota" nebo číslo „429" | Vyčerpal/a jsi denní/minutový zdarma limit | Počkej pár minut/hodin, limit se časem obnoví |
| V konzoli vidíš „permission" nebo „billing" | AI Logic není pro projekt správně zapnuté | Vrať se ke Kroku 2 a zkontroluj, že jsi zvolil/a „Gemini Developer API" |
| V konzoli vidíš „no longer available" u konkrétního modelu | Google mezitím ten model zrušil | Appka si teď umí sama zkusit náhradní modely — pokud to nepomůže samo, viz sekci „Co se stane, když Google model zruší" v `NAVOD-RADY-A-PORADNA.md` |

Otevřít nástroje pro vývojáře (F12) a podívat se do záložky Console je
úplně běžný a bezpečný krok — nic tam neuvidíš, co by ohrozilo tebe
nebo návštěvníky, jen technické hlášky pro ladění.

---

## Časté otázky

**Můžu tenhle návod udělat později a mezitím nechat web nahraný, jak
je?**
Ano, klidně. Dokud nevložíš Site key (Krok 4), sekce „Rady a poradna"
jen zobrazí zprávu, že ještě není nastavená. Zbytek webu (dechové
cvičení, kalendář pokroku...) funguje úplně normálně bez omezení.

**Co když omylem nahraju na GitHub nesprávný klíč nebo si nejsem jistý/á, co jsem zkopíroval/a?**
U reCAPTCHA Enterprise (kterou tento návod používá) vkládáš do kódu jen
jeden veřejný Site key, takže riziko vyzrazení citlivého údaje je tu
malé. Kdyby ses přesto chtěl/a pojistit, klidně si v Google Cloud
konzoli → reCAPTCHA Enterprise starý klíč smaž a vytvoř nový (a stejně
ho pak zaregistruj ve Firebase App Check a vlož do kódu).

**Stojí mě to něco?**
Pokud budeš postupovat přesně podle kroků (Gemini Developer API, ne
Vertex AI; žádné propojení platební karty), zůstáváš na zdarma plánu
Spark. Firebase tě sám upozorní, pokud by ses měl/a dostat k placené
variantě — nikdy tě do placení „nenastrčí" bez tvého vědomého kliknutí
na propojení platební metody.

**Musím tohle dělat, aby zbytek webu fungoval?**
Ne. Celý zbytek appky (dechová cvičení, kalendář, počítadlo
návštěvnosti, admin režim) funguje nezávisle na téhle sekci. Klidně
web nahraj bez dokončeného Kroku 2–4 a AI poradnu dodělej později, až
budeš mít čas.

---

## Pro hlubší technický pohled

Tenhle návod se soustředí na to, ať to bezpečně a bez obav rozchodíš.
Podrobnější technický popis (např. přesně které proměnné v kódu co
dělají, jak přepnout model, jak funguje formátování odpovědi) najdeš
v souboru `NAVOD-RADY-A-PORADNA.md`, který jsi dostal/a spolu s tímto
webem.
