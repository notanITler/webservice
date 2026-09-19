# Gehrke Webservice

Eine schnelle, responsive Unternehmenswebsite für einen persönlichen Webservice-Anbieter. Die Seite ist bewusst schlank aufgebaut und lässt sich ohne Datenbank, CMS oder Server-Anwendung statisch hosten.

## Tech-Stack

- **Astro** erzeugt vollständig statische HTML-Seiten.
- **TypeScript** prüft die kleinen interaktiven Bestandteile (mobile Navigation).
- **CSS** enthält alle Design-Tokens und Layouts – ohne UI-Framework.
- Keine Datenbank, kein Tracking, kein Cookie-Banner und keine clientseitige JavaScript-Bibliothek.

Astro wurde gewählt, weil Komponenten Inhalte übersichtlich halten, während im Browser fast nur HTML und CSS ausgeliefert werden. Es gibt bewusst nur die für Build und Typprüfung benötigten Dependencies.

## Projektstruktur

```text
src/
├── components/       Wiederverwendbare Header-, FAQ-, Icon- und Preis-Komponenten
├── layouts/          HTML-Grundgerüst und Meta-Tags
├── pages/            Startseite sowie Rechtstexte
└── styles/           Zentrale Gestaltung und responsive Regeln
public/                Favicon, robots.txt und sitemap.xml
```

## Lokal starten

Voraussetzung ist eine aktuelle Node.js-LTS-Version (20 oder neuer).

```bash
npm install
npm run dev
```

Astro zeigt anschließend die lokale URL an (normalerweise `http://localhost:4321`).

## Prüfen und bauen

```bash
npm run lint
npm run verify
npm run build
```

Der fertige statische Build liegt danach im Ordner `dist/`.

## Inhalte ändern

- Die Inhalte der Startseite stehen in `src/pages/index.astro`.
- FAQ-Fragen stehen gebündelt in `src/components/Faq.astro`.
- Paketinhalte werden am Anfang von `src/pages/index.astro` gepflegt.
- Impressum und Datenschutz stehen in `src/pages/impressum.astro` bzw. `src/pages/datenschutz.astro`.
- Wiederkehrende Seitendaten (Titel, Beschreibung, Open Graph) stehen in `src/layouts/BaseLayout.astro`.

## Farben und Design ändern

Alle zentralen Farben, die Inhaltsbreite und weitere Design-Tokens stehen ganz oben in `src/styles/global.css` im `:root`-Block. Responsive Regeln befinden sich am Ende derselben Datei.

## Bilder ersetzen

Aktuell werden bewusst keine Stockfotos verwendet. Portrait und Website-Vorschau sind CSS-Platzhalter. So werden sie später ersetzt:

1. Optimierte Dateien (bevorzugt `.webp` oder `.avif`) in `public/images/` ablegen.
2. Den Portrait-Platzhalter in `src/pages/index.astro` durch ein Astro-`<Image>` oder ein normales `<img>` mit aussagekräftigem `alt`-Text ersetzen.
3. Das Mockup analog ersetzen. Bildbreite und -höhe immer angeben, um Layout-Sprünge zu vermeiden.

## Deployment mit Cloudflare Workers Static Assets

Die Website wird als reines Static-Assets-Projekt über Cloudflare Workers ausgeliefert. `wrangler.jsonc` verweist dafür auf Astros Ausgabeordner `./dist`. Da keine serverseitige Logik benötigt wird, enthält die Konfiguration bewusst keinen Worker-`main`-Entry und das Projekt benötigt keinen Astro-Cloudflare-Adapter.

### Befehle und Verzeichnisse

- Build Command: **`npm run build`**
- Deploy Command: **`npm run deploy`** (führt `npm run build && wrangler deploy` aus)
- Lokale Workers-Vorschau: **`npm run preview`**
- Output Directory / Static Assets Directory: **`dist`** beziehungsweise `./dist` in Wrangler

### Deployment über die GitHub-Verknüpfung

Im Cloudflare-Dashboard für das bereits verbundene Workers-Projekt folgende Build-Einstellungen verwenden:

1. Root directory: `/` (Repository-Root; leer lassen, falls das Dashboard dies so darstellt)
2. Build command: `npm run build`
3. Deploy command: `npx wrangler deploy`
4. Node.js-Version: `20`

Der Dashboard-Build erzeugt zuerst `dist/`; anschließend liest `wrangler deploy` dieses Verzeichnis anhand von `wrangler.jsonc` ein. Alternativ erledigt `npm run deploy` beide Schritte in einem Befehl, etwa bei einem manuellen Deployment. Es sind weder Datenbank noch Worker-Logik, Cloudflare-Adapter oder Umgebungsvariablen erforderlich.

### Security-Header

`public/_headers` ist mit Workers Static Assets kompatibel. Astro kopiert die Datei beim Build nach `dist/_headers`, und Cloudflare wendet die darin definierten Header auf statisch ausgelieferte Dateien an. Da dieses Projekt keinen Worker-`main`-Entry besitzt und alle Antworten direkt aus Static Assets stammen, ist keine zusätzliche Header-Logik erforderlich.

### Custom Domain

Eine eigene Domain wird später im Cloudflare-Dashboard unter **Workers & Pages → gehrke-webservice → Settings → Domains & Routes** hinzugefügt. Canonical URL, Open-Graph-URL, `robots.txt` und `sitemap.xml` müssen dieselbe Domain verwenden.

### Preview-Checkliste

Vor dem ersten Preview-Deployment sollten `npm install`, `npm run lint`, `npm run verify` und `npm run build` erfolgreich durchlaufen. Danach kann `npm run preview` die gebauten Dateien lokal über Wrangler bereitstellen. Die in der folgenden Liste genannten Platzhalter dürfen in einer internen Preview sichtbar bleiben, müssen aber vor Veröffentlichung ersetzt werden.

## Vor Veröffentlichung ersetzen

- Portrait-Platzhalter durch ein freigegebenes Portraitfoto
- Website-Mockup durch echte Arbeitsbeispiele, sobald vorhanden
- Impressumsangaben inklusive Name, Anschrift, Telefon und Verantwortlichkeit
- Datenschutz-Platzhalter passend zu Hosting und Kontaktweg; rechtlich prüfen lassen

## Bekannte Einschränkungen

- Der Anfrage-Button öffnet derzeit das lokale E-Mail-Programm; es gibt bewusst noch kein Formular-Backend.
- Die Website nutzt einen hochwertigen System-Font-Stack und lädt dadurch keine externen Schriftdateien. Das Schriftbild kann sich je nach Betriebssystem geringfügig unterscheiden.
- Rechtstexte sind nur klar gekennzeichnete Platzhalter und keine Rechtsberatung.
- Open Graph enthält noch kein Vorschaubild, da noch kein finales Markenmotiv vorliegt.

## Referenzen und Beispielprojekte

Cases werden zentral in `src/data/cases.ts` gepflegt. Ein weiterer Eintrag in `entries` erzeugt beim Build automatisch eine Karte auf der Startseite, die Detailseite `/beispiele/<slug>` und den Sitemap-Eintrag. Komponenten oder Layouts müssen dafür nicht geändert werden. Slugs müssen eindeutig sein und aus Kleinbuchstaben, Ziffern und Bindestrichen bestehen. `order` sortiert aufsteigend; Einträge ohne Reihenfolge folgen alphabetisch.

Pflichtfelder: `name`, `slug`, `industry`, `summary` (auch Meta Description), `description`, `situation`, `goal`, `features`, `preview`, `screenshots` und `isDemo`. Bilder enthalten `src`, `alt`, `width`, `height` und optional `caption`. Die Screenshot-Liste darf leer sein; dann entfällt die Galerie.

Optionale Felder: `websiteUrl` (HTTPS), `logo` (Bildobjekt), `testimonial` mit `quote` und optional `name`/`role`, sowie `order`. Bei `isDemo: true` erscheinen Demo-Kennzeichnungen und der ausdrückliche Hinweis. Für einen echten Kunden `isDemo: false` setzen und ausschließlich freigegebene Inhalte verwenden; ohne Logo oder Zitat entstehen keine leeren Bereiche. Externe Links werden nur bei vorhandener URL angezeigt und passend als Live-Demo oder Website bezeichnet.

Optimierte Bilder/Screenshots unter `public/images/cases/<slug>/` ablegen und als `/images/cases/<slug>/datei.webp` referenzieren. Tatsächliche Pixelmaße und beschreibende Alt-Texte angeben. Die Darstellung zeigt Bilder vollständig; Galerieansichten lassen sich in Originalgröße öffnen. Bilder unterhalb des Einstiegs werden verzögert geladen. Es werden keine neuen Dependencies oder Case-spezifischen Browser-Skripte benötigt.

Hansen Haustechnik ist ein fiktiver Entwurf, kein Kundenauftrag und keine vollständige Live-Website. Die drei WebP-Ansichten wurden aus der bereits vorhandenen `HeroShowcase.astro`-Vorschau im Arbeitsstand `hero-desktop-composition` gerendert. Die fiktive Jahresangabe wurde für die Screenshots durch eine neutrale regionale Einordnung ersetzt. Der Referenzbereich ist als Teil der Seitenstruktur vorgesehen; es werden keine abgeschlossenen Kundenprojekte behauptet. Eine Live-URL ist bewusst nicht hinterlegt.

Bildquelle des im Entwurf enthaltenen Badmotivs: Franco Debartolo, [Original auf Unsplash](https://unsplash.com/photos/modern-bathroom-with-a-white-freestanding-bathtub-and-large-window-Ns3T2jCfQFk), [Unsplash-Lizenz](https://unsplash.com/license). Grundlage ist das bereits lokal vorhandene `hansen-bathroom.webp`; es erfolgen keine externen Bildanfragen.

Die Sitemap liegt jetzt als statischer Astro-Endpunkt in `src/pages/sitemap.xml.ts` vor und ersetzt die bisherige manuell gepflegte `public/sitemap.xml`.
`featureImage` ist ein optionales Bildobjekt für die Darstellung neben den Schwerpunkten. Die übrigen `screenshots` erscheinen danach als Galerie. Ohne `featureImage` wird die Liste ohne leere Bildspalte dargestellt. Ein vorhandener `websiteUrl`-Link steht direkt unter dem Hero-Bild und öffnet einen neuen Tab.
