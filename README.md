# Bottle Builders website

Static site, no build step. Five sheets, drawn as a blueprint.

```
index.html     Sheet A-01   Home
about.html     Sheet A-02   Lifecycle
team.html      Sheet A-03   Team
contact.html   Sheet A-04   Contact
recycle.html   Sheet A-05   Recycle, hands off to GREENCO
```

## Run it locally

```bash
./serve.sh          # http://localhost:8080
```

Any static server works. There is nothing to compile.

## How it is put together

| File | What it holds |
| --- | --- |
| `css/blueprint.css` | The design system: colour, type, sheet frame, title block, dimension lines, cyanotype plates, buttons |
| `css/components.css` | Page pieces: hero, team roster, contact form, GREENCO card |
| `css/journey.css` | The journey on Sheet A-02, loaded only by that page |
| `css/notfound.css` | The not-found sheet, loaded only by `404.html` |
| `css/motion.css` | Polish layer: staggered reveals and hover states. Purely additive |
| `js/site.js` | Loading sheet, navigation, scroll reveal, count-up, journey staging |
| `js/enquiry.js` | Contact form submit, posted to Formspree |
| `js/form-config.js` | The Formspree endpoint the contact form posts to |
| `assets/` | Logos, photography, team headshots, block forming video |

### Design decisions worth knowing

**Colour.** A light blue cyanotype sheet (`--sheet`) with navy drafting ink
(`--ink`) and white reproduction lines. Hard hat yellow (`--hardhat`) is the only
action colour. Rust and green appear nowhere except inside the lifecycle panel,
where they mean "without us" and "with us".

**Type.** Big Shoulders Display for headings, Archivo for body, IBM Plex Mono for
every drafting annotation, dimension label and sheet number.

**Photography.** Photos print as cyanotype plates and return to full colour when
you hover, or shortly after they scroll into view. That is the drawn to built
idea, and it is why `.plate` uses blend modes rather than a filter alone.

**The scroll scale.** A drafting rule stood on its end in the left gutter:
white body, inked outline, graduations up the face, and a bead riding the
boundary between read and unread. White still means read. It carries the same
hard offset shadow as the buttons, and it is hidden below 901px where there is
no gutter to hold it. Clearance to the sheet frame is 16px and holds at every
desktop width.

**The journey (Sheet A-02).** One bottle travels down a drawn spine. At each of
three phases the path forks: the left branch dead-ends and gets stamped, the
right branch keeps building. Phases stage in as you reach them, and a prompt at
the foot of each one leads to the next. On phones the spine moves to the left
margin and the two branches stack, so there is never a horizontal gesture.

Two things in there will bite you if you change them:

- **Do not animate `opacity` or `transform` on `.bcard`.** It promotes the card
  to its own compositing layer and the photograph inside then never paints. The
  drawn axis carries the motion instead.
- **Plate images use `decoding="sync"`, not `loading="lazy"`.** Lazily decoded
  images finish after the filtered layer has rasterised, and nothing invalidates
  it, so the photo stays blank until you scroll.

**The dead branch is drawn, never photographed.** There is no honest photo of
open burning or a rejected bale, and using a picture of our own crew collecting
would caption good work as failure. The outcome we prevent exists only as
linework.

**Hover states split in two.** Panels with no photograph inside lift on a
transform. Panels holding a photographic plate lift with shadow and border
only, because transforming them promotes the panel to its own compositing
layer and the filtered image inside stops painting. `css/motion.css` says which
is which; keep new components on the right side of that line.

**No em dashes anywhere.** Deliberate. Keep it that way when editing copy.

## The contact form

Sheet A-04 posts to [Formspree](https://formspree.io), which emails each
submission to the address on the Formspree account. There is no database and no
server.

### Set it up

1. Create a form at formspree.io and confirm the email it should deliver to.
2. Copy the endpoint. It looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `js/form-config.js`.

Until step 3 is done the form falls back to opening the visitor's email app.
Nothing breaks and nothing is said about it in the interface.

### Why the endpoint is not a secret

A Formspree form ID is a public endpoint by design, the same way the mailto
address in the footer is public. It is safe in the repo and safe in the browser.

### Spam

The form carries a hidden `_gotcha` field. People never see it, so anything in
it came from a bot: the submit is dropped, the visitor is shown the ordinary
success message, and nothing is sent. Formspree runs its own filtering on top.

### Reading submissions

They arrive as email. The subject line carries what the sender picked in the
"what do you want to do" menu, so they sort in an inbox without being opened.

## Hosting: Vercel

These are static files with nothing to run, so they are served straight from
Vercel, configured by `vercel.json`. The contact form is the only thing that
talks to anywhere else, and it talks to Formspree from the browser.

There is **no build step**. Vercel serves this directory as static files.

### First deploy

1. [vercel.com/new](https://vercel.com/new), then import
   `djkcrazh/Bottle-Builders-LLC` from GitHub.
2. Framework Preset: **Other**. Leave Build Command empty and set Output
   Directory to `.` (`vercel.json` already declares both, so the defaults
   should already be correct).
3. Deploy. Every push to `main` redeploys, and pull requests get their own
   preview URL.

### Custom domain

The site answers on `www.bottlebuilders.com`. The apex 301s to it.

Every absolute URL in the repo names `https://www.bottlebuilders.com`:
`og:url`, `og:image` and `twitter:image` in all six pages, every
`<link rel="canonical">`, `sitemap.xml` and `robots.txt`. They point at the
address the site actually answers on, so a canonical never resolves through a
redirect. Moving the site to a different host means moving all of them.

Going live is a domain move between two Vercel projects, not a DNS change:
remove `www.bottlebuilders.com` from the holding page project, add it to this
one. The CNAME already points at Vercel.

### Clean URLs

`cleanUrls` is on, so `/about` serves `about.html` and Vercel redirects
`/about.html` to `/about`. This matches the URL structure of the old Wix site,
so links already ranking in Google keep working with no redirect hop.

Internal links, canonical tags and the sitemap are all extensionless to match.
If you add a page, link to it without the extension.

`vercel.json` also redirects the legacy Wix paths that do not map by name:

| Old | New |
| --- | --- |
| `/join` | `/contact` |
| `/gallery` | `/` |
| `/our-team` | `/team` |
| `/about-us` | `/about` |
| `/lets-recycle` | `/recycle` |

## Local preview

`python3 -m http.server` cannot serve extensionless URLs, so `serve.sh` runs
`serve.py` instead. It mirrors Vercel: a path with no extension resolves to the
matching `.html`, and anything unmatched gets `404.html` with a real 404 status.
