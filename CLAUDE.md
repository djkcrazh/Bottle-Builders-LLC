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

**Nothing fixed-size around text.** A browser's minimum font size setting
clamps computed type without changing the viewport, so `clamp()` cannot hold
the line and anything that will not shrink walks off the sheet. Everything that
used to do this has been fixed: see "Type that grows" below. New components
must not reintroduce it.

---

## The Atelier theme

The site used to print as a cyanotype: navy ink on blue paper, a drawn sheet
border, hard offset shadows. It now prints on **white paper over a live
canvas grid**, with floating glass panels and one soft radius. The drafting
language survives as annotation, dimension line, title block and sheet number.

It is an **override layer, not a fork**. Three files carry the whole theme:

| File | Holds |
| --- | --- |
| `css/atelier.css` | The override layer. Loaded last on all six pages, after `motion.css` |
| `js/kinetic-grid.js` | The canvas grid. One preset, no dependencies, no build step |
| `js/atelier.js` | Mounts the grid, tilts the glass cards, idles the mascot |

`blueprint.css` and `components.css` still hold the system. To revert, delete
those three files and the three lines each page adds: the `atelier.css` link,
the `<canvas id="grid">`, and the two script tags. The site returns to the
blue sheet exactly as it was.

**The single largest lever is the reproduction line.** It was white on blue
paper (`--chalk-soft`, `--chalk-faint`). On white paper it has to become ink,
or every border, fold line and card division on the site disappears at once.
`css/atelier.css` redefines those two tokens to navy alphas. `--chalk` itself
stays white: it is the text colour inside the navy blocks (the GREENCO card,
band captions) and flipping it would make those unreadable.

### The grid

Ported from a React component to vanilla JS and recoloured. It does two
things: an ambient **lean** away from the pointer, and a **ripple** on click.

The lean is deliberately tiny. The source shipped `maxWarp: 30`, which dragged
the webbing behind the cursor and competed with the copy. It went to 9, then
to **4**, which is about as far as it can go and still answer the pointer. The
ripple is the reaction; the lean is only the ambient motion underneath it. If
the background ever feels dead, raise `influence` before raising `maxWarp`.

Every number lives in the `PRESETS.atelier` table at the top of the file, not
scattered through the draw loop. The grid draws one static frame and stops
under `prefers-reduced-motion`.

### What came off

- **The sheet frame and the registration marks.** On blue paper they framed
  the drawing. On white they fence in panels that are already floating.
- **Hard offset shadows** on buttons, the contact card and the scroll scale.
  Everything floats on a soft shadow now. The journey still carries the old
  stamped-ink shadows, because the journey was left alone on purpose.
- **The two column hero.** Sheets A-01 to A-04 centre their copy and drop the
  photograph below it as a wide 16:9 plate. A-05 keeps its two columns,
  because the GREENCO card *is* the second column.

### What the journey kept

`/about` Detail 01 got **chrome only**: radius on the cards and plates, and
the glass treatment on the surrounding page. The spine, the rider, the forks,
the stamps and the rust linework are untouched. Restyling the drawing itself
is a separate decision and has not been made.

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

**Every absolute URL says `https://www.bottlebuilders.com`**, not the apex. The
apex 301s to `www`, so naming the apex would make the site declare a canonical
that redirects and send link previews through an extra hop. If the site ever
moves to the apex for real, 28 strings across the six pages, `sitemap.xml` and
`robots.txt` have to move with it.

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
| `--sheet` | `#ffffff` | The paper. Was `#b9d4ea` before Atelier |
| `--sheet-deep` | `#e7f0f8` | Inset panels, unbuilt ground |
| `--sheet-pale` | `#f6fafd` | Built panels |
| `--ink` | `#0d2e4c` | Navy drafting ink, all body text |
| `--ink-soft` | `#21456c` | Secondary copy |
| `--ink-faint` | `rgba(13,46,76,.58)` | Annotations and labels |
| `--chalk` | `#ffffff` | Text inside the navy blocks. **Stays white** |
| `--chalk-soft` | `rgba(13,46,76,.20)` | The reproduction line, re-inked |
| `--chalk-faint` | `rgba(13,46,76,.09)` | The fainter reproduction line |
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
| `--r` / `--r-sm` | `18px` / `10px`. The one radius, used everywhere or nowhere |
| `--glass` | `rgba(255,255,255,.66)`, every floating panel |
| `--lift` / `--lift-high` | The soft shadow at rest and on hover |

The sheet frame, registration marks and nav all start after `--gutter`, so the
strip down the left holds the scroll scale and nothing else.

### Breakpoints

- **901px** gutter and scroll scale appear
- **900px** nav collapses to a hamburger and the floating pill becomes a full
  width bar, title block goes into page flow
- **860px** journey drops to one column, spine moves to the left margin
- **760px** comparison cards stack
- **580px height** holding page compresses for landscape phones

### Signature devices

- **The kinetic grid.** A fixed canvas behind everything, leaning away from
  the pointer and rippling on click. It replaced the printed grid lines, the
  crumpled paper filter and the paper tooth gradient, all of which existed to
  stop flat blue reading as a CSS fill
- **Dimension lines** that measure quantities, not lengths. Under the home
  headline where a drawing would annotate a span, the label reads "Tackling the
  global waste crisis"
- **Title block** docked bottom right with SHEET / TITLE / SCALE / REV. It steps
  aside while scrolling so nothing reads underneath it. Frosted glass now
- **The hardhat rule.** Every sheet's opening heading drafts in line by line,
  and a yellow rule draws under the last line. The rule is `width: fit-content`
  so it hugs the words: `.ln > i` is a block and would otherwise run the rule
  the full width of the column on the left aligned sheets
- **Cyanotype plates.** Photos print blue and return to full colour on hover or
  shortly after scrolling into view. Drawn becoming built
- **Crumpled paper**, generated from an SVG turbulence filter as a data URI.
  Still defined in `blueprint.css` but **not drawn under Atelier**: the canvas
  is the paper now. It returns the moment `atelier.css` is removed
- **Scroll scale** down the left gutter: a drafting rule stood on its end, with
  an inked outline, graduations up the face and a bead riding the boundary
  between read and unread. White still means read. Same hard offset shadow as
  the buttons. Its clearance to the sheet frame is 16px, so widening it again
  means rechecking `left` at 901px, the tightest gutter

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
  `.jrn-product`, `.cta-band`, `.partner`): lift on a `transform`. These are
  also the only elements `js/atelier.js` tilts toward the pointer
- **Holds a photographic plate** (`.member`, `.bcard`, `.elevation-frame`,
  `.band`): lift with shadow and border only, never a transform

`.elevation-frame` briefly carried a scroll driven `scale()` during the
Atelier build. It looked fine in Chromium, which is exactly why the rule is
worth restating: it is on the never-transform list, and the photograph inside
it is the one that would fail. It was removed, and `js/atelier.js` carries a
comment saying so. Do not add one back.

Keep new components on the right side of that line.

`css/motion.css` and `js/atelier.js` are both purely additive. Delete either
and the site still works, just flatter or stiller. It holds staggered reveals, heading assembly, hover lifts, underline
sweeps, arrow slides and the focus ring.

---

## File map

| File | Holds |
| --- | --- |
| `css/blueprint.css` | The system: tokens, type, sheet frame, nav, title block, dimension lines, plates, buttons, scroll scale |
| `css/components.css` | Page pieces: hero, team roster, contact form, GREENCO card, process strip |
| `css/journey.css` | The journey. Loaded only by `about.html` |
| `css/notfound.css` | The not-found sheet. Loaded only by `404.html` |
| `css/motion.css` | Polish layer, loaded everywhere |
| `css/atelier.css` | The Atelier override layer. Loaded everywhere, loaded **last** |
| `js/site.js` | Loading sheet, nav, scroll reveal, plate build, count-up, journey staging and ride, scroll scale, title block |
| `js/kinetic-grid.js` | The canvas grid. All tuning lives in its `PRESETS` table |
| `js/atelier.js` | Mounts the grid, tilts the glass cards, idles the mascot |
| `js/enquiry.js` | Contact form submit, ES module, posts to Formspree |
| `js/form-config.js` | The Formspree endpoint |
| `serve.py` / `serve.sh` | Local server with Vercel-style clean URLs |
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

**The GREENCO card carries no "Opens greenco1.web.app" line.** It was removed
on request. The card is still an external link and still says "Open the app",
so do not reinstate the annotation as an accessibility fix.

**Every red box states "Without Bottle Builders"** as its primary tag, mirroring
the green "With Bottle Builders", with the specific condition on a line beneath.

**Site description**, used in `meta description` and all `og:description`:

> Improving the entire lifecycle of post-consumer waste from collection to valorization

---

## The contact form

Formspree, not a database. The form posts to the endpoint in
`js/form-config.js` and Formspree emails the submission on. There is no backend
to this site and nothing to run.

The endpoint is public by design, like the mailto address in the footer. It is
not a secret and belongs in the repo.

Until the endpoint is filled in, the form falls back to its `mailto` action.
That fallback is silent: it used to print a note beside the Send button telling
whoever was building the site to add keys, which is not a sentence a visitor
should ever read.

A hidden `_gotcha` field traps bots. Anything in it means the submit is dropped
and the visitor still sees the ordinary success message.

Supabase was scaffolded for this and then dropped in favour of Formspree,
because the submissions want to arrive as email rather than sit in a table
somebody has to remember to check. The table, its row level security and the
migration are in git history if that decision is ever reversed.

## Type that grows

A visitor can raise the browser's minimum font size, which clamps computed type
without touching the viewport. `clamp()` gives no protection. Four things broke
under it and are now guarded, so do not undo them:

- `.dim-label` shrinks and wraps. It was `flex: none`, which sent the home page
  1.3 times past the viewport at a 20px floor. `min-width: 0` is the load
  bearing part: a flex item defaults to `min-width: auto` and will not shrink
  below its content whatever `flex-shrink` says.
- `overflow-wrap: anywhere`, not `break-word`, on the dimension label, footer
  links and the title block. Only `anywhere` reduces an element's min content
  width, which is what actually stops the overflow. `break-word` looks like it
  works and does not.
- `.titleblock` uses `minmax(0, 1fr)` on phones. Plain `1fr` refuses to shrink
  below its content and walked the block off screen.
- `.bcard-stamp` scales from `100% 0`. It starts at `scale(1.4)` while still at
  `opacity: 0`, and scaling from the centre pushed an invisible box past the
  sheet edge, widening the document for no visible reason.

To test, raise the floor from the page rather than hunting for a browser
setting: walk the DOM, and where computed `font-size` is below the floor, set
it to the floor. That mutates the live page and nothing on disk, and a reload
undoes it. CDP cannot emulate this setting, which is not a reason to skip it.

**Clean at 16px, 20px and 24px** on every sheet at 1440x900 and 390x844. The
24px column used to run 9px past on home and 1px on team. Atelier first made
that worse, because centring the hero and boxing the stat rack took away the
slack those labels used to spread into, and then fixed it outright:

```css
.anno { overflow-wrap: anywhere; }
.tier-head .anno, .stat-tag { min-width: 0; }
```

The two offenders were the `.stat-tag` credit line on home ("In tandem with
partner EZOV Environmental Services") and the `.tier-head` eyebrow on team.
Both are mono, widely letter spaced, and full of tokens with no natural break
point. Letter spacing was never touched, which was the change the old note
said would be needed.

One known overlap: with the floor raised, the docked title block covers rows of
the 404 sheet index at rest. The page becomes scrollable at that point and the
block steps aside on scroll, so every link stays reachable. This is how the
block behaves on every other sheet and is accepted.

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
5. Photographs actually paint, especially inside the journey and in the hero
   plate. If one renders blank, it is one of the two compositing traps above,
   not your CSS
6. Type growth clean at 16px, 20px and 24px floors, both widths

---

## Open items for launch

1. **Per-page meta descriptions.** All five pages currently share one
   description. Right for link previews, not ideal for search. The plan is to
   keep the shared string in `og:description` and vary only
   `meta name="description"`. The user asked to be reminded at ship time.
2. **Formspree endpoint** into `js/form-config.js`.
3. **Swap the domain** from the holding page project to this one on Vercel.

Closed, and not to be reopened: the Team headline photo stays as it is, the
"Nearly 70%" figure stands as written, and the sheet frame and registration
marks stay removed under Atelier.

---

## Conventions

- Commit messages: plain sentences explaining the why, not just the what. No em
  dashes. Do not include AI attribution unless asked
- Comments in code explain **why**, especially around the two compositing traps
- CSS is grouped and commented by section, one concern per file
- No dependencies. If something needs a package, reconsider it
