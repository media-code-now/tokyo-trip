# Japan 2026

An offline-friendly trip guide for eleven nights across Japan (23 Sep – 4 Oct 2026):
Tokyo, Kanazawa, Kyoto, Fuji and back to Tokyo.

Single-file web app (`index.html`) with:

- **Today** — trip countdown / current day
- **Days** — day-by-day itinerary
- **Places** — destinations and spots
- **Map** — interactive Leaflet map with pins
- **Prep** — booking tracker, packing, essentials, photography, eating, words, emergency

Installable as a PWA (`manifest.webmanifest` + `sw.js`) so it works offline once loaded.

## Run locally

Service workers require http(s), not `file://`:

```sh
python3 -m http.server
```

Then open http://localhost:8000

## Editing

All content lives in the `TRIP` object inside `index.html`.
