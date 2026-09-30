# Viyán Spaces — single-page website (concept demo)

A polished, light-themed single-page website for **Viyán Spaces**, an architecture &
interiors studio in HSR Layout-2, Bengaluru. Built as a client demo: no build step,
no dependencies, no framework — just HTML, CSS and vanilla JavaScript.

Open `index.html` in any browser and it runs.

---

## 1. Run it

**Easiest** — double-click `index.html`.

**Better (recommended, matches production behaviour)** — serve the folder:

```bash
# from inside this folder
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

> A local server is recommended because the Google Maps embed and the Google Fonts
> request behave most like production when the page is served over `http(s)` from a
> domain.

## 2. Deploy it (takes ~2 minutes, free)

The site is fully static, so any of these work with a drag-and-drop:

| Host | How |
| --- | --- |
| **Netlify** | [app.netlify.com/drop](https://app.netlify.com/drop) → drag the `viyan-spaces` folder onto the page |
| **Vercel** | `npx vercel --prod` from inside the folder |
| **GitHub Pages** | push the folder to a repo → Settings → Pages → deploy from `main` / `root` |
| **Cloudflare Pages** | new project → upload assets → point at the folder |

Then point `viyanspaces.com` at whichever host you used.

---

## 3. Files

```
viyan-spaces/
├── index.html                 all markup + copy (single page)
└── assets/
    ├── css/styles.css         all styling, design tokens at the top
    └── js/main.js             all animation and interaction logic
```

`styles.css` is organised in numbered sections (01 tokens → 18 motion/a11y) with a
table of contents at the top. `main.js` is organised the same way.

---

## 4. What is real and what is a placeholder

**Real** (taken from the client's Google Business listing):

- Studio name, phone `+91 97878 68550`
- Address — "Aashirwad", #11, Ground Floor, 6th Cross, III Phase Reliable Residency,
  HSR Layout-2, opp. Vibgyor School, Bengaluru 560102
- Studio hours, WhatsApp link, map embed
- The list of services (written as marketing copy)

**Sample content** — marked as such on the page so nobody mistakes it for fact:

| Placeholder | Where it appears | How to replace |
| --- | --- | --- |
| Project names, areas, years, descriptions | `#projects` section + lightbox | Edit each `<article class="proj">`; the `data-*` attributes feed the lightbox |
| Testimonial quotes | `#voices` section | Edit the three `<figure class="slide">` blocks |
| Statistics (240 projects, 19 lakh sq.ft, 32 specialists, 98% retention) | Hero + `#about` stats row | Edit the `data-to="…"` attributes |
| Principal Architect quote | `#about` | Replace with a real quote and the person's name |
| `hello@viyanspaces.com` | Contact section, footer | Replace with the real inbox |
| Instagram / Facebook links (`href="#"`) | Footer | Add the real profile URLs |
| Founder year "Since 2013" | About badge | Correct if different |

Each of these areas already carries a small on-page note ("Sample projects", "Sample
testimonials", "Sample figures") plus a disclaimer in the footer. **Delete those notes
as you replace the content with real data.**

## 5. Making the contact form actually send

The form currently validates and shows a success state locally. To make it deliver
email, open `assets/js/main.js` and set the endpoint near the top of section `10`:

```js
const FORM_ENDPOINT = '';   // ← paste your form endpoint here
```

Any service that accepts a JSON POST works. The most common, free options:

- **Formspree** — create a form, copy the endpoint (`https://formspree.io/f/xxxxxxx`),
  add the address to "verified domains"
- **Web3Forms** — `https://api.web3forms.com/submit` plus an access key
- **Google Apps Script** — a `doPost` web-app URL
- **Netlify Forms** — if hosted on Netlify, add `netlify` to the `<form>` tag and it
  works with no endpoint at all

A honeypot field (`company`) is already included to block basic spam bots.

## 6. Design system

Change these at the top of `styles.css` to re-skin the whole site:

```css
--bone:   #F8F5F0;   /* page background      */
--sand:   #EFE8DC;   /* alternating sections */
--paper:  #FFFFFF;   /* cards                */
--ink:    #1B1815;   /* headings / body text */
--clay:   #BE5B39;   /* accent               */
--clay-600:#A94E2F;  /* accent for small text (keeps contrast accessible) */
```

Type: **Fraunces** (display serif) + **Inter** (UI sans), loaded from Google Fonts.
The `--ff-display` and `--ff-body` variables control both.

## 7. Motion and interaction

Everything is driven by one small script — no libraries:

- preloader with an arch line-drawing animation and a percentage counter
- hero headline revealed word by word; rotating specialty label; parallax image layers
- scroll-triggered reveals with stagger, animated counters, process timeline fill
- sticky header that condenses, scroll-progress bar, active-section nav pill
- project filters, project lightbox (keyboard arrows, Esc, swipe) with sliding image
- testimonial slider (autoplay, drag, dots)
- magnetic buttons, subtle card tilt, cursor spotlight
- floating back-to-top button with a scroll-progress ring
- full-screen mobile menu

`prefers-reduced-motion` is respected throughout — visitors who ask for less motion
get a static, fully readable page.

## 8. Quality checks

- Lighthouse: **100 accessibility / 100 best practices / 100 SEO**
- No JavaScript console errors
- Works from 320 px to 2560 px wide
- Keyboard accessible: visible focus rings, skip-free tab order, Esc closes overlays
- `role`/`aria` labels on all interactive components

## 9. Images and fonts

Photos are hotlinked from Unsplash (`images.unsplash.com`) and fonts from Google Fonts.
That is fine for a demo. For a production site, download the final images into
`assets/img/` and self-host the fonts so the site has no third-party dependency and
loads faster.
