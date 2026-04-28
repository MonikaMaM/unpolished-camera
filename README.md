# UNPOLISHED PRESENCE — CAMERA

Analog camera. Digital body. PWA för iPhone.

## Filmer

- **Portra 400** — varma hudtoner, mjuk kontrast
- **Kodachrome 64** — mättat, hård kontrast, magenta/cyan-skift
- **CineStill 800T** — tungsten-blå med röd halation runt highlights
- **Tri-X 400** — svartvitt, push-kontrast, korn
- **FP-3000B** — svartvitt instant, mjuk
- **Ektar 100** — högmättat, finkornigt, blågrönt landskap

## Filer

```
unpolished-camera/
├── index.html       # UI + styling
├── app.js           # Kamera, filter pipeline, capture, save
├── films.js         # Film-presets (kurvor, korn, halation, vinjett)
├── manifest.json    # PWA-manifest
├── sw.js            # Service worker (offline)
├── icon-192.png
└── icon-512.png
```

## Hur du installerar på iPhone

1. Öppna URL:en i Safari (inte Chrome — Chrome-iOS stöder inte "Lägg till på hemskärm" som riktig PWA)
2. Tryck dela-ikonen längst ner
3. Scrolla ner → "Lägg till på hemskärmen"
4. Bekräfta
5. Öppna ikonen från hemskärmen — appen körs nu fullskärm utan webbläsarrad

## Spara bilder

När du tar ett foto och trycker SPARA öppnas iPhone share sheet automatiskt.
Tryck **"Spara på bilder"** så hamnar fotot i Foton-appen.

## Gester

- **Slutarknapp** — ta foto
- **Swipe vänster/höger på sökaren** — byt film
- **Eller tryck filmnamn** i film-stripen längst ned
- **⇄-knapp** — växla mellan främre och bakre kamera

## Kräver

- HTTPS (annars startar inte kameran)
- iOS 14+ Safari rekommenderas för bästa stöd
- Tillåt kameraåtkomst första gången

## Tekniska detaljer

- Live-filter via Canvas 2D (~30fps på iPhone 12+)
- Halation byggs via highlight-mask + nedskalad blur + screen blend
- Korn appliceras som per-pixel slumpmässig brusvärde
- Vinjett via radial gradient
- Capture sker i full videoupplösning (1920×1080 eller högre om kameran stöder)
- Bilder JPEG kvalitet 92%
- Frame counter sparas i localStorage mellan sessioner
