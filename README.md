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
| `js/site.js` | Loading sheet, navigation, scroll reveal, count-up, journey staging |
| `js/enquiry.js` | Contact form submit, backed by Supabase |
| `js/supabase-config.js` | Your Supabase URL and anon key |
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

**No em dashes anywhere.** Deliberate. Keep it that way when editing copy.

## Supabase

The contact form on Sheet A-04 writes to a `public.enquiries` table.

### Set it up

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema:
   ```bash
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push
   ```
   Or paste `supabase/migrations/0001_enquiries.sql` into the SQL editor.
3. Copy your project URL and anon key from **Project Settings > API** into
   `js/supabase-config.js`.

Until step 3 is done the form falls back to opening the visitor's email app, and
says so in the interface. Nothing breaks.

### Security

Row level security is on. The anon key can insert an enquiry and cannot read one
back, so shipping it in the browser is fine. Read submissions in the Supabase
dashboard, or from a server holding the service role key. Never put the service
role key in this repo.

### Reading submissions

Table editor, `enquiries`, sorted by `created_at`.

## Hosting: Vercel

Supabase does not host static sites, so the pages are served separately. The
front end is hosted on Vercel, configured by `vercel.json`.

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

Project Settings > Domains, add `bottlebuilders.com`, then point the registrar
at the records Vercel shows.

**After the domain is live, update the absolute URLs.** These are hardcoded to
`https://bottlebuilders.com` and will break link previews if the real domain
differs:

- `og:url`, `og:image` and `twitter:image` in all five HTML files
- `<link rel="canonical">` in all five HTML files
- `robots.txt` and `sitemap.xml`

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
