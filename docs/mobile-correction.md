# Mobile-Korrektur nach PR #13

Basis: `main` / `f2f6fdcc9f306005ff831121d016f57c1df1f798`.

## Befunde und Änderungen

| Bereich | Ursache | Gezielte Korrektur | Browserprüfung |
| --- | --- | --- | --- |
| Vorteile | Globale `summary span`-Regeln vergrößerten alle verschachtelten Spans auf 1.5rem und drehten sie beim Öffnen jeweils um 45°. | Schriftgröße und Rotation auf `.faq-list summary > span` eingrenzen. Vorteilstitel erben wieder 0.95rem bis 440 px bzw. 1rem darüber. Lange Wörter können umbrechen. Clipping am Details-Rahmen entfernen, damit der Fokus sichtbar bleibt. | Alle sechs Einträge öffnen/schließen, alle gleichzeitig öffnen, Titel-/Wrapper-/Icon-Transformation `none`, Plus/Minus-Pseudoelement, mindestens 44 px Touchhöhe, Space/Enter und 3 px Fokusrahmen. FAQ öffnen/schließen und unveränderte 45°-Symbolrotation prüfen. |
| Ablauf | Tablet-Regel setzte die Achse auf `display:none`; Grid-Stretch zog den deckenden Nummernhintergrund über die Texthöhe. Die Achse endete unter der letzten Beschreibung. | Mobile Achse ausdrücklich anzeigen, Nummern mit `align-self:start` ausrichten. Die vier vorhandenen Schritte erhalten vier Grid-Zeilen; die Achse endet am Anfang der vierten Zeile innerhalb der Nummer 04. | Sichtbarkeit und 1 px Achse, Nummernhöhen, identische X-Positionen aller Nummern/Titel und Achsenende innerhalb von 04 anhand berechneter Styles und Elementgrenzen. Auch mit 150 % Schriftgröße. |
| Hero | `.hero-copy h1` überstimmte das mobile `h1` mit mindestens 3rem. Der vorhandene Hero-Overflow konnte Überbreite verdecken. | Spezifische mobile Größe `clamp(2.25rem,5.7vw,3.2rem)`, Notumbruch bei vergrößerter Schrift und sichtbarer Overflow. Die einzelne mobile Vorschau bleibt unverändert. | Text-Range-Grenzen, Seitenbreite, genau eine sichtbare mobile Vorschau, Zentrierung und nur 10 px Showcase-Padding ohne Desktop-Leerraum. Zusätzlich 150 % Schriftgröße. |

## Ausgeführte Prüfungen

- Windows / lokales Google Chrome über Playwright: abschließend **15/15 Tests bestanden** (1,3 Minuten).
- 320, 360, 390, 440, 640, 641, 800, 801, 899, 900 und 1280 CSS-Pixel, jeweils 900 px Viewport-Höhe.
- Kein horizontaler Seitenüberlauf in dieser Matrix; Text-Range-Prüfungen für Hero, Accordion-Titel und Timeline. Einzelne und gleichzeitig geöffnete Vorteile wurden bis 899 px geprüft; ab 900 px bleibt das Desktop-Raster bestehen.
- Zusätzliche Hero-/Timeline-Prüfungen bei 320, 360, 641 und 899 px mit `html { font-size:150% }`. Das ist Textvergrößerung, kein Browserzoom; keine Vollseiten-Abnahme mit vergrößerter Schrift für die anderen Abschnitte.
- `npm run verify`: bestanden.
- `npm run build`: bestanden, Astro meldet 0 Fehler, 0 Warnungen, 0 Hinweise; drei statische Seiten gebaut.
- Die Sandbox blockierte anfangs esbuild mit `Cannot read directory "../../../../..": Access is denied`. Build und Browserprüfungen wurden anschließend erfolgreich außerhalb der Sandbox ausgeführt.
- Screenshots werden für jede Breite unter `test-results/` erzeugt. Ausgewählte visuell gesichtete Belege liegen in [mobile-evidence](mobile-evidence/). Der Astro-Entwicklungs-Toolbar wird ausschließlich in der Testseite ausgeblendet.

## Reproduzieren

```sh
npm install
npx playwright install chromium
npm run verify
npm run build
npm run test:mobile
```

Alternativ vorhandenes Chrome unter PowerShell verwenden:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:mobile
```

Die Browsertests starten einen eigenen Astro-Server auf Port 4322. Firefox, Safari und echte Mobilgeräte wurden nicht geprüft. Bei einer späteren Änderung der Anzahl der Prozessschritte muss auch die mobile Grid-Zeilenanzahl angepasst werden; die Achsenprüfung deckt den aktuellen Aufbau mit vier Schritten ab.
