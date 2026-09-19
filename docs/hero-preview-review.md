# Hero-Vorschauen nach PR #14

Basis: `main` bei `f5cdb6315e81046ff8f21ca9d141187e65fa66c1` (Merge von PR #14).

## Festgestellte Ursache

Die Diagnose basiert auf Markup, CSS und berechneten Chrome-Styles. Das alte Smartphone war absolut positioniert und hatte eine feste Außenbreite von 135 px, bei 801–1100 px sogar nur 118 px. Der 6-px-Rahmen und zweimal 12 px Innenabstand ließen dem Inhalt lediglich 99 bzw. 82 px Breite. Die Überschrift blieb bei 17,28 px; der Inhalt ließ das Gerät über seine Mindesthöhe von 276 px hinaus wachsen.

| Viewport | Vorher: Außenmaß | Vorher: Breite : Höhe | Nachher: Außenmaß | Nachher: Breite : Höhe |
| --- | --- | --- | --- | --- |
| 900 px | 118 × 325,97 px | 1 : 2,76 | 176 × 369,59 px | 1 : 2,10 |
| 1440 px | 135 × 325,97 px | 1 : 2,41 | 196 × 411,59 px | 1 : 2,10 |
| 390 px, mobile Browseransicht | 329,36 × 344,91 px | 1 : 1,05 | 329,36 × 395,22 px | 1 : 1,20 |

`flex-shrink:1` war zwar berechnet, hatte hier aber keine Wirkung: Das absolut positionierte Element war kein Flex-Item. Sein direkter Elternknoten war ein Block. Es gab keine Transformation (`transform:none`). Die Hero-Grid-Spalten bestimmen den verfügbaren Kompositionsraum, nicht die feste Breite dieses Geräts. Die bisherigen 116 % Showcase-Breite und negativen Offsets begünstigten zusätzlich das Herausragen der Vorschauen.

## Änderung

- Neue, ausschließlich für den Hero verwendete Komponente mit lokalem CSS; alte Vorschau-Regeln aus dem globalen Stylesheet entfernt. Beide Geräte verwenden dasselbe Demo-Markup und dasselbe lokale Foto.
- Smartphone mindestens 176 px, maximal 196 px breit, mit `aspect-ratio:10 / 21`. Die Höhe steigt zusammen mit der Breite. Schrift und Abstände orientieren sich an der Breite des jeweiligen Rahmens, ohne Skalierungstransformationen.
- Desktop: Überlagerung im Bildbereich; alle Demotexte bleiben sichtbar. Die Anfragekarte steht unterhalb des großen Browserrahmens. Zwischen 900 und 1100 px erhält die Komposition zusätzlichen Platz nach unten, statt das Telefon zu verschmälern. Kein negativer rechter Offset und keine überbreite Showcase-Fläche.
- Mobil unter 900 px: genau ein zentrierter Browserrahmen mit `hansen-haustechnik.example`, DEMO-Kennzeichnung, eigener Navigation, bewusst aufgeteilter Text-/Fotofläche und kompaktem Leistungsbereich. Rahmenverhältnis 1 : 1,2; kein Smartphone-Rand.
- Foto: lokales WebP (135 kB), mit `object-fit:cover` statt Verzerrung. [Quelle und Lizenz](hero-preview-assets.md) sind dokumentiert.
- Zugänglichkeit: Die Komposition hat `role="img"` und einen Namen, der sie als fiktive Beispielwebsite beschreibt. Die dekorativen Inhalte erzeugen keine Links, Buttons oder Tastaturstopps. Echte Hero-CTAs bleiben außerhalb der Demo.
- Verkaufstexte, Preise, echte CTAs, Accordion und Timeline sind unverändert. Keine neue Laufzeitabhängigkeit oder Animation.

## Tatsächlich ausgeführte Prüfungen

- **25/25 Playwright-Tests in Chrome auf Windows bestanden**: zehn neue Vorschautests plus alle 15 unveränderten Tests aus PR #14. Anschließend die zehn Vorschautests mit strengerer Prüfung auf überdeckte Textfragmente erneut erfolgreich ausgeführt.
- Neue Breitenmatrix: **320, 360, 390, 440, 640, 899, 900, 1024, 1280 und 1440 px**.
- Gemessen: kein horizontaler Seitenüberlauf, Außenmaße/Proportionen, Begrenzung innerhalb des Viewports, Smartphone-Überschrift mit höchstens drei Zeilen, Bildladung und `object-fit`, genau eine mobile Vorschau, Zentrierung, zugänglicher Name, keine fokussierbaren Demo-Elemente.
- Textfragmente gegen Rahmengrenzen und per Hit-Test auf Überdeckung durch andere Elemente geprüft. Echte CTAs auf Sichtbarkeit, Fokus und Klickbarkeit geprüft; ihre Linkziele werden außerdem von `verify` kontrolliert.
- Vorher-/Nachher-Screenshots bei 390 und 1440 px sowie Kontrolle bei 900 px erstellt und visuell gesichtet. Zusätzlich 320 px gesichtet; weitere Breiten werden bei jedem Testlauf unter `test-results/` aufgenommen.
- `npm run verify`: bestanden (neun Quellen, einschließlich neuer Komponente).
- `npm run build`: bestanden; Astro meldet **0 Fehler, 0 Warnungen, 0 Hinweise** und baut drei statische Seiten.
- `git diff --check`: bestanden.

Die vorübergehende Blockade durch das Nutzungslimit der automatischen Freigabeprüfung wurde beim Fortsetzen aufgehoben; die Browserabnahme ist abgeschlossen. Nicht geprüft: Firefox, Safari und echte Mobilgeräte.

## Screenshot-Vergleich

| Breite | Vorher | Nachher |
| --- | --- | --- |
| 390 px | [Vorher](hero-preview-evidence/before-390.png) | [Nachher](hero-preview-evidence/after-390.png) |
| 1440 px | [Vorher](hero-preview-evidence/before-1440.png) | [Nachher](hero-preview-evidence/after-1440.png) |
| 900 px | [Vorher](hero-preview-evidence/before-900.png) | [Kontrolle](hero-preview-evidence/after-900.png) |

Die Screenshots zeigen jeweils den gesamten Hero. Die Vorschaukomposition bestimmt dessen Höhe; die Verkaufstexte und ihre CSS-Regeln bleiben unverändert. Vorher-Messwerte liegen zusätzlich in [before-metrics.json](hero-preview-evidence/before-metrics.json).

## Reproduzieren

```powershell
npm install
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:mobile
npm run verify
npm run build
```

Ohne lokal installiertes Chrome: `npx playwright install chromium` ausführen und `PLAYWRIGHT_CHANNEL` nicht setzen. Nur die neuen Vorschautests: `npm run test:mobile -- tests/hero-preview.spec.mjs`.
