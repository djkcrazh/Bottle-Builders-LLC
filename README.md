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
| `css/components.css` | Page pieces: hero, lifecycle drag panel, team roster, contact form, GREENCO card |
| `js/site.js` | Loading sheet, navigation, scroll reveal, count-up, the lifecycle drag panel |
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

**The lifecycle panel.** On desktop it is a drag divider. On phones the drag is
removed entirely and the two sides stack, because at 390px each half would be
about 190px wide. The panel also sets `touch-action: pan-y` and captures pointer
events on the handle only, so a vertical swipe always scrolls the page.

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

## Hosting

Supabase does not host static sites, so the pages need a separate host. Any of
these serve this folder as is:

- **Firebase Hosting**, which already serves GREENCO at `greenco1.web.app`
- Netlify, Vercel, Cloudflare Pages, GitHub Pages

Point the host at this directory. There is no build command and no output
directory.

## Editing content

Copy lives directly in the HTML. The things most likely to change:

- **Traction figures**: `index.html`, the `.stats` block. The count-up reads
  `data-count`, so update both that attribute and the visible text.
- **The 25,000 kg figure** is credited to partner EZOV Environmental Services in
  three places: the home stat, the team page partner block, and Phase 02 of the
  lifecycle. Keep the credit if you change the number.
- **Team**: `team.html`. Core team and advisors are separate sections.
- **Lifecycle copy**: `about.html`, inside each `[data-phase-panel]`.
