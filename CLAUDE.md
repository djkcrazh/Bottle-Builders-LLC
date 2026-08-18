# Bottle Builders website: working notes

Handoff document. Read this before changing anything, then read `README.md` for
setup and deploy steps.

The site is a static blueprint-styled marketing site for Bottle Builders, a
plastic-to-construction circular economy company. Five pages, no build step, no
dependencies, no framework.

---

## Hard rules

**No em dashes or en dashes. Anywhere.** Not in copy, not in comments, not in
commit messages. This is a stated requirement, not a preference: em dashes read
as AI-written and undercut work meant to sound like the company's own voice. Use
hyphens, commas, colons, or split the sentence. Sweep before every delivery:

```bash
grep -rn $'\u2014\|\u2013' *.html css/*.css js/*.js
```

That pattern is written with escapes so this file does not trip its own sweep.

**Never touch the git repo at `/Users/andrewaddo`.** The user's entire home
directory is a git repo containing `.ssh/`, shell history, `.claude.json`, and
BBG financial and incorporation documents. Running `git` from inside this folder
used to resolve to that repo. This folder now has its own `.git`, so verify with
`git rev-parse --show-toplevel` before any git operation and confirm it returns
the site folder.

**Verify visually, do not assume.** Every change gets checked in a browser at
1440x900 and 390x844 before being called done. See "Verification" below.

---

## Where everything lives

| | |
| --- | --- |
| Main site, local | `~/Documents/Bottle Builders/BB Site v2` |
| Main site, repo | `github.com/djkcrazh/Bottle-Builders-LLC` |
| Holding page, local | `~/Documents/Bottle Builders/BB Placeholder Site` |
| Holding page, repo | `github.com/djkcrazh/bottle-builders-temporary` |
| Source material | `~/Documents/BottleBuilders_VC_Pitch_Deck.pptx`, `~/Documents/Bottle Builders/` |
| Photo library | `~/Documents/Bottle Builders/Bottle Builders LLC Website/Site Images/` |
| Old Wix-era copy | `~/Documents/Bottle Builders/BBG Website/` (reference only, do not edit) |

### Current live state

**`www.bottlebuilders.com` currently serves the holding page**, not this site.

- Domain DNS is run by **Wix** (`ns12.wixdns.net`, `ns13.wixdns.net`)
- `www` CNAMEs to Vercel, apex 301s to `www`
- The old Wix site is disconnected. Its URLs now 404
- Hosting is **Vercel** for both projects

To go live with the real site: remove the domain from the holding page's Vercel
project, add it to the `Bottle-Builders-LLC` project. No DNS change needed.

Note: Vercel's Hobby plan is licensed for personal, non-commercial use. This is
a company site. The user was told and chose Vercel anyway. Do not re-litigate.

---

## The five sheets

Every page is a drafting sheet with a numbered title block. URLs are
extensionless because the old Wix site ranked on extensionless URLs and
`cleanUrls` lets those keep working with no redirect.

```
/          index.html     Sheet A-01   Home
/about     about.html     Sheet A-02   Lifecycle
/team      team.html      Sheet A-03   Team
/contact   contact.html   Sheet A-04   Contact
/recycle   recycle.html   Sheet A-05   Recycle, hands off to GREENCO
           404.html       Sheet A-00   Not found, served with a real 404
```

**Link internally without the extension** (`href="/about"`). Canonical tags,
`og:url` and `sitemap.xml` are all extensionless and must stay consistent.

`vercel.json` also 301s legacy Wix slugs that do not map by name:
`/join` to `/contact`, `/gallery` to `/`, plus `/our-team`, `/about-us`,
`/lets-recycle`.

---

## Run it locally

```bash
./serve.sh          # http://localhost:8080
```

`serve.sh` runs `serve.py`, not `python3 -m http.server`. The built-in server
cannot resolve extensionless URLs, so `serve.py` mirrors Vercel: a path with no
extension resolves to the matching `.html`, and anything unmatched gets
`404.html` with a real 404 status.

**Browsers cache these stylesheets hard.** `serve.py` sends no cache headers.
If a change does not appear, hard reload with Cmd+Shift+R. When testing through
the headless browser, run `browse restart` after editing CSS, otherwise you will
debug a stale stylesheet. This wasted real time more than once.

---

## Design system

### Colour

Defined in `css/blueprint.css` `:root`.

| Token | Value | Use |
| --- | --- | --- |
| `--sheet` | `#b9d4ea` | The cyanotype paper |
| `--sheet-deep` | `#9cc0de` | Inset panels, unbuilt ground |
| `--sheet-pale` | `#d3e5f4` | Built panels |
| `--ink` | `#0d2e4c` | Navy drafting ink, all body text |
| `--ink-soft` | `#21456c` | Secondary copy |
| `--ink-faint` | `rgba(13,46,76,.58)` | Annotations and labels |
| `--chalk` | `#ffffff` | White reproduction lines |
| `--hardhat` | `#f5b417` | The only action colour. Buttons, focus, accents |
| `--rust` | `#a63d23` | **Semantic only.** "Without Bottle Builders" |
| `--growth` | `#1f7a4c` | **Semantic only.** "With Bottle Builders" |

Rust and green appear nowhere except the journey comparison. Do not spend them
as decoration.

### Type

Three families, each with one job.

- **Big Shoulders Display** 700 to 900: headings only. Condensed signage face,
  reads as drafted titling. All headings are uppercase via CSS.
- **Archivo** 400 to 700: body copy.
- **IBM Plex Mono** 400 to 700: every annotation, dimension label, sheet number,
  tag and stamp. The `.anno` class.

### Layout tokens

| Token | Value |
| --- | --- |
| `--nav-h` | `62px`, fixed header height |
| `--margin` | `clamp(14px, 2.2vw, 34px)`, paper edge |
| `--gutter` | `52px` above 901px, `0` below. Binding edge holding the scroll scale |
| `--unit` / `--major` | `24px` / `120px` grid |

The sheet frame, registration marks and nav all start after `--gutter`, so the
strip down the left holds the scroll scale and nothing else.

### Breakpoints

- **901px** gutter and scroll scale appear
- **900px** nav collapses to a hamburger, title block goes into page flow
- **860px** journey drops to one column, spine moves to the left margin
- **760px** comparison cards stack
- **580px height** holding page compresses for landscape phones

### Signature devices

- **Dimension lines** that measure quantities, not lengths. Under the home
  headline where a drawing would annotate a span, the label reads "Tackling the
  global waste crisis"
- **Title block** docked bottom right with SHEET / TITLE / SCALE / REV. It steps
  aside while scrolling so nothing reads underneath it
- **Cyanotype plates.** Photos print blue and return to full colour on hover or
  shortly after scrolling into view. Drawn becoming built
- **Crumpled paper**, generated from an SVG turbulence filter as a data URI. No
  image download. Blended with `multiply` so creases darken without bleaching
  the blue. `soft-light` was invisible and `overlay` washed it out
- **Scroll scale** down the left gutter, filling white as you read

---

## The journey (Sheet A-02, Detail 01)

The centrepiece. `css/journey.css` plus the `[data-phase]` block in `site.js`.

One bottle travels down a drawn spine. At each of three phases the path forks:
the left branch dead-ends and gets stamped, the right branch keeps building.

- **Click "See the comparison"** and a mascot arcs out of the button down to the
  head of the spine while the page travels, lands with a yellow ring off the
  point of impact, and hands over to a rider pinned to the line
- **The rider descends with your scroll**, hopping as it passes each fork
- **The line draws itself behind it.** Ahead of the bottle the spine is dashed,
  the route as planned. Behind it, solid ink, the route as built
- **The rider passes behind notes**, above the line it draws. `z-index`: track 1,
  fork node 2, rider 4, prompt 6
- **Phases stage in** on `IntersectionObserver`, adding `.is-live`
- **Prompts between phases** tease the next stage and are the whole interaction
  on touch

### The dead branch is drawn, never photographed

There is no honest photo of open burning or a rejected bale, and the available
site photos all show the crew actually collecting, which would caption good work
as failure. So each dead end carries hand-drawn rust linework that animates in
with `stroke-dashoffset`. The live branch keeps the photographs. Keep it that
way unless genuinely apt photography turns up.

### Two traps that will cost you an hour each

**Do not animate `opacity` or `transform` on `.bcard`.** It promotes the card to
its own compositing layer and the filtered image inside never paints. The card
renders as a flat colour block. The drawn axis carries the motion instead. This
is why hover states split in two, below.

**Plate images use `decoding="sync"`, not `loading="lazy"`.** A lazily decoded
image finishes after the filtered layer has rasterised and nothing invalidates
it, so the photo stays blank until you scroll. Symptom is identical to the
bug above, which makes it confusing.

If a photo renders blank, scroll away and back. If it appears, it is one of
these two, not your CSS.

---

## Hover states split in two

In `css/motion.css`, and this rule matters:

- **No photograph inside** (`.card`, `.process-step`, `.pillar`, `.stat`,
  `.jrn-product`, `.cta-band`, `.partner`): lift on a `transform`
- **Holds a photographic plate** (`.member`, `.bcard`, `.elevation-frame`,
  `.band`): lift with shadow and border only, never a transform

Keep new components on the right side of that line.

`css/motion.css` is purely additive. Delete it and the site still works, just
flatter. It holds staggered reveals, heading assembly, hover lifts, underline
sweeps, arrow slides and the focus ring.

---

## File map

| File | Holds |
| --- | --- |
| `css/blueprint.css` | The system: tokens, type, sheet frame, nav, title block, dimension lines, plates, buttons, scroll scale |
| `css/components.css` | Page pieces: hero, team roster, contact form, GREENCO card, process strip |
| `css/journey.css` | The journey. Loaded only by `about.html` |
| `css/notfound.css` | The not-found sheet. Loaded only by `404.html` |
| `css/motion.css` | Polish layer, loaded everywhere, loaded last |
| `js/site.js` | Loading sheet, nav, scroll reveal, plate build, count-up, journey staging and ride, scroll scale, title block |
| `js/enquiry.js` | Contact form submit, ES module |
| `js/supabase-config.js` | Supabase URL and anon key |
| `serve.py` / `serve.sh` | Local server with Vercel-style clean URLs |
| `supabase/` | `config.toml` and the `enquiries` migration |
| `vercel.json` | Clean URLs, legacy redirects, cache and security headers |

The loading sheet only exists on `index.html` and plays once per session, gated
on `sessionStorage`.

---

## Content rules

These are decisions the user made. Do not quietly revert them.

**The block formulation is not public.** Rice husk and sugarcane bagasse were
named on the About and Recycle sheets and have been removed, along with the
Schedule of materials section and the Downstream section that carried them.
Their photographs were deleted from `assets/photos/` as well, since Vercel
serves that directory publicly. Say what goes in only as far as recycled
plastic flakes. Do not reintroduce the inputs from the deck.

**Metrics.** Only two traction figures may appear: **25,000+ kg per month** and
**founded 2025**. Everything else was deliberately removed: the 15 GREENCO
entities, Class B and Class C GSA strength, the MPa figures, the 1.5% aggregate
replacement. Do not reintroduce them from the deck.

**The 25,000 kg figure must always be credited to partner EZOV Environmental
Services.** It appears in the home stat (as `data-count="25000"`, so grepping
for "25,000" will not find it) and in the team partner block.

**Framing is global, not Ghanaian.** The mission is the worldwide waste crisis.
Operational claims stay accurate but "Accra, Ghana" was removed from every
header and footer, and captions avoid pinning everything to one location.
Ningo-Prampram survives only where it is factually the location.

**Team titles follow the VC deck, not the old live site.** Andrew Addo is
Co-Founder and CEO. Gilbert C. Addo sits in the advisor tier and is CEO of
Bottle Builders Ghana LTD.

**Team cards link to LinkedIn twice**, from the portrait and from the name. The
portrait link carries `aria-hidden="true"` and `tabindex="-1"` so screen readers
and keyboard users get one link per card, not two. The visible "LinkedIn" text
row was removed on request.

**Every red box states "Without Bottle Builders"** as its primary tag, mirroring
the green "With Bottle Builders", with the specific condition on a line beneath.

**Site description**, used in `meta description` and all `og:description`:

> Improving the entire lifecycle of post-consumer waste from collection to valorization

---

## Supabase

The contact form writes to `public.enquiries`. Row level security is on: the
anon key can insert and cannot read back, so shipping it in the browser is fine.

Until keys are filled into `js/supabase-config.js`, the form falls back to
opening the visitor's email app and says so in the interface. Nothing breaks.

Never put the service role key in this repo.

---

## Verification

Before calling anything done:

```bash
# every page, both widths: no overflow, no console errors
# use the browse skill, and restart it after CSS edits
```

Check on each of `/`, `/about`, `/team`, `/contact`, `/recycle`:

1. `document.documentElement.scrollWidth > window.innerWidth` is false at
   1440x900 and 390x844
2. Console has no errors
3. Every `assets/` reference resolves
4. Em dash sweep is clean
5. Photographs actually paint, especially inside the journey

---

## Open items for launch

1. **Per-page meta descriptions.** All five pages currently share one
   description. Right for link previews, not ideal for search. The plan is to
   keep the shared string in `og:description` and vary only
   `meta name="description"`. The user asked to be reminded at ship time.
2. **Supabase keys** into `js/supabase-config.js`.
3. **Swap the domain** from the holding page project to this one on Vercel.
4. **The crew photo is available and not yet placed.** `IMG_2701.JPG` in the
   photo library is the peace-sign crew shot wanted beside the Team headline.
   `crew.jpg` is still standing in. The baled-plastic photo for the About
   headline never arrived; `pet-bottles.jpg` stands in there.
5. **Check the informal waste picker figure.** The card reads "Nearly 70%". It
   previously read 64%, which looked sourced. Confirm where the number comes
   from before launch.

---

## Conventions

- Commit messages: plain sentences explaining the why, not just the what. No em
  dashes. Do not include AI attribution unless asked
- Comments in code explain **why**, especially around the two compositing traps
- CSS is grouped and commented by section, one concern per file
- No dependencies. If something needs a package, reconsider it
