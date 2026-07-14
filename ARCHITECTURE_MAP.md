# Project Architecture Map (Plain-English Edition)

This document explains how the "Printing & Packing" website is built, in plain language. It's meant to be read by anyone joining the project — you don't need to already know this codebase to follow along. Technical terms are explained the first time they show up.

---

## 1. The Big Picture

This is a website with two halves that talk to each other over the internet:

- **The backend** (in the `backend/` folder): a Node.js server that stores data in a MySQL database and hands out information as JSON (a simple data format) whenever the website asks for it. Think of it as the kitchen — it does the real work and keeps the ingredients (data) organized.
- **The frontend** (in the `frontend/` folder): a React website that people actually see and click around in. Think of it as the dining room — it's what customers and admins interact with, and it asks the kitchen for whatever it needs.

They talk to each other using regular web requests (the same kind your browser makes when it loads a page), all going to addresses that start with `/api/...`.

**What the site does:**
- A public storefront where visitors can browse packaging/printing products, read the blog, learn "About" the company, submit a quote request, sign up/log in, and try an interactive tool that lets them preview their own artwork on a product mockup (like a box or bag).
- An admin panel (`/admin/...`) where staff log in and manage everything — products, categories, homepage banners, blog posts, FAQs, quote requests, users, and the mockup templates.

**How a typical click works, step by step:**
1. You open a page in your browser. React (the frontend) draws the page and, if it needs data (like a list of products), asks the backend for it.
2. The backend looks the information up in the database and sends it back as JSON.
3. React updates the page with that data — no full page reload needed.
4. If you're doing something that changes data (like an admin adding a product, or a visitor submitting a quote form), the same kind of request happens, but the backend checks whether you're allowed to do that first (see the "Logging In" section below), then saves the change to the database.

**A few technology names you'll see repeated**, explained once so the rest of this doc reads smoothly:
- **Express** — the toolkit the backend uses to listen for web requests and decide what to do with each one.
- **Sequelize** — a tool that lets the backend talk to the MySQL database using JavaScript instead of writing raw SQL by hand. Each "model" file (e.g. `product.model.js`) describes one database table.
- **React** — the frontend toolkit for building the website's pages out of reusable pieces called "components."
- **Zustand** — a small, simple way for the frontend to remember information (like "who is logged in") in a spot that any page can read from, without passing it around manually.
- **JWT (JSON Web Token)** — a signed, tamper-proof piece of text the backend gives you when you log in, proving who you are on future requests. Here it's stored in a browser cookie automatically, so you don't have to think about it.
- **Axios** — the tool the frontend uses to send those "please give me data" or "please save this" requests to the backend.

---

## 2. How the Project Is Organized on Disk

```
Printing & Packing - Copy/
├── backend/
│   ├── src/
│   │   ├── app.js, server.js       ← Where the server starts up
│   │   ├── config/db.js            ← How it connects to the database
│   │   ├── middleware/             ← Checks that run on every request (login checks, error handling, etc.)
│   │   ├── modules/<topic>/        ← One folder per subject: products, categories, blog, users, etc.
│   │   ├── scripts/                ← One-off scripts you run by hand (e.g. "create the admin account")
│   │   └── utils/                  ← Small reusable helpers (e.g. sending emails)
│   ├── uploads/                    ← Where uploaded images/files actually get saved on the server's disk
│   └── (several stray test_*.js and one-off migration scripts sitting loose in backend/ and backend/src/)
├── frontend/
│   ├── src/
│   │   ├── App.jsx, main.jsx       ← Where the website starts up and defines its pages
│   │   ├── features/<topic>/       ← One folder per subject, mirroring the backend's topics
│   │   ├── shared/                 ← Reusable pieces used across many pages (header/footer, login state, etc.)
│   │   └── index.css               ← The visual "theme" — colors, fonts, rounded corners
│   └── dist/                       ← The pre-built, ready-to-serve version of the website
└── seed-blogs.js                   ← A duplicate copy of a script that adds sample blog posts
```

Each "module" or "feature" folder in both `backend/` and `frontend/` is organized around one subject — for example, everything about **Products** lives together, everything about **Blog Posts** lives together, and so on. This makes it easier to find things: if you're fixing something about categories, you'll find all the relevant backend and frontend files inside their respective `categories` folders.

---

## 3. Logging In and Permissions, in Plain Terms

- When someone logs in successfully, the backend hands the browser a secure cookie called `token`. The browser then automatically includes that cookie on every future request — nobody has to manually attach it.
- The backend checks that cookie on any request that needs someone to be logged in. Two checks exist:
  - **"Are you logged in at all?"** — used for things like viewing your own account.
  - **"Are you an admin?"** — used for anything that changes site content (adding a product, editing a banner, etc.).
- Admin accounts have an extra step: after entering their email/password, they get a 6-digit code emailed to them and must enter that too before they're let in. Regular customers don't need this extra step.
- On the frontend, there's really only **one gatekeeper** for the entire admin section: the wrapper around all `/admin/...` pages checks "is this person a logged-in admin?" and bounces them to the login page if not. Individual admin pages don't re-check this themselves — they trust the wrapper already did.

---

## 4. Backend — File by File

### Startup & Configuration

**`backend/src/app.js`** — This file assembles the whole backend server: it turns on security protections, allows the frontend to talk to it (this is called CORS), reads incoming request data, and — most importantly — connects each subject's routes (like `/api/products`, `/api/categories`, `/api/blog-posts`, etc.) to the code that handles them.
*Why it matters:* Every new feature needs a line added here to be reachable at all. If a feature isn't working and you can't figure out why, check whether it's actually wired up in this file.

**`backend/src/server.js`** — This is the actual "start the server" script. Before starting, it loads every database table definition (so the database knows about all the tables), connects to the database, makes sure the tables exist, and then starts listening for requests.
*Watch out:* If you create a brand-new database table (a new "model" file) but forget to list it here, the table will never actually get created, and your feature will fail in a confusing way. This is the single most common way to "forget a step" in this codebase.

**`backend/src/config/db.js`** — This is the one place that knows how to connect to the MySQL database (server address, username, password, database name). Every single database table definition in the project depends on this file.
*Watch out:* Nearly everything in the backend flows through this file — treat it carefully.

### Requests That Run on Every Page (Middleware)

**`backend/src/middleware/authMiddleware.js`** — Contains the two login checks described above ("are you logged in," "are you an admin"). Almost every feature that lets admins add/edit/delete something uses this file to protect itself.
*Watch out:* If the login-secret environment variable isn't set, the code quietly falls back to a default, publicly-known secret phrase. That's fine for local testing but would be a real security problem if it ever happened in a live, public version of the site — always make sure a real secret is configured before going live.

**`backend/src/middleware/errorHandler.js`** — If anything goes wrong anywhere in the backend, this is the file that catches the error and turns it into a clean error message sent back to the browser, instead of crashing the whole server.

**`backend/src/middleware/seoInjector.js`** — Search engines like Google don't "run" the website like a browser does — they mostly just read the raw HTML. This file quietly rewrites the page title and description in that raw HTML (for example, using a specific product's name) before sending it out, so that search engines see something meaningful instead of a generic placeholder.
*Watch out:* This only works once the frontend has been "built" into static files. While developing locally without a build, this file just does nothing and steps out of the way.

**`backend/src/middleware/upload.js`** and **`uploadDoc.js`** — Both handle file uploads, but slightly differently. `upload.js` is for image uploads that get processed (resized/compressed) before saving. `uploadDoc.js` is for quote-request attachments (images, PDFs, Word docs) that get saved to disk exactly as they were uploaded, with a max size of 10MB.

### Users & Login

**`backend/src/modules/users/user.model.js`** — Describes the "Users" database table: name, email, password (automatically scrambled/encrypted before saving — never stored as plain text), account role (customer or admin), and the fields used for the 6-digit email verification code.

**`backend/src/modules/users/user.controller.js`** — Contains the actual logic for: signing up, verifying your email with the code, logging in (including the extra admin code step), logging out, and fetching your own account info. Also has the admin-only "list every registered user" feature.

**`backend/src/modules/users/user.routes.js`** — The address book for this feature: which web addresses map to which piece of logic above.

### Categories (the product groupings, like "Boxes" or "Mailers")

**`category.model.js`** — Describes the Categories table: name, URL-friendly slug, image, sort order, and whether it should appear in the homepage's featured category section.
*Watch out:* Deleting a category doesn't just hide it — it also permanently deletes every product inside that category. This is a stronger action than it might look like from the admin screen, so double-check before deleting a category with real products in it.

**`category.controller.js`** — The logic for listing, creating, editing, and deleting categories.

**`category.routes.js`** — The address book for this feature.

### Products (the actual items for sale)

**`product.model.js`** — Describes the Products table: which category it belongs to, name, URL slug, description, price, minimum order quantity, SEO fields, and several homepage-placement flags (like "should this show up in the homepage scrolling row"). It also automatically creates a clean, unique web address (slug) from the product's name if you don't provide one yourself.
*Watch out:* This is one of the most-used files in the whole backend — lots of other features (homepage, search, sitemap, quote requests) all read from Products. Be extra careful making changes here.

**`productVariant.model.js`**, **`productImage.model.js`**, **`productFaq.model.js`** — Three smaller tables attached to each product: its variants (like different sizes with a price adjustment), its photos, and its frequently-asked-questions. These are all simple, standard "this belongs to a product" tables.

**`product.controller.js`** — Handles listing products (with optional filtering by category or search text), fetching one product's full details, creating/editing/deleting products, and managing a product's photos (including marking one photo as the "main" photo).

**`product.routes.js`** — The address book for this feature.

### Content (Blog, flexible page text, and site-wide FAQs)

**`pageContent.model.js`, `.controller.js`, `.routes.js`** — This is a clever, flexible system: instead of a rigid database table for every editable bit of text on the site, there's one generic table that stores "a labeled chunk of content" (like `about_hero` or `contact_settings`), where the actual content can be any shape of data. Nearly every "editable text section" on the site (About page hero text, homepage value props, contact page info, etc.) is powered by this one system.
*Watch out:* Because the shape of the content isn't fixed in the database, the frontend and backend have to *agree by convention* on what each labeled chunk should contain. If someone renames a label or restructures its content on one side without updating the other, that section of the site will quietly show nothing or fall back to a default, with no error message telling you why.

**`blogPost.model.js`, `.controller.js`, `.routes.js`** — Standard blog post management: title, slug, content, cover photo, publish status.
*Watch out:* The public "list blog posts" endpoint currently returns *all* posts, including unpublished drafts — the "only show published posts" filtering happens on the frontend, not the backend. If anyone calls this backend address directly (skipping the website), they'd see draft posts that aren't meant to be public yet.

**`siteFaq.model.js`, `.controller.js`, `.routes.js`** — A simple site-wide FAQ list, shown on the Contact page. Separate from the per-product FAQs mentioned above.

**`testimonial.model.js`** — A database table for customer testimonials exists, but nothing actually reads or writes to it yet — there's no matching feature to add/edit/display testimonials anywhere in the app. It's essentially unfinished, half-built functionality.

### Homepage & Hero Banners

**`heroBanner.model.js`, `.controller.js`, `.routes.js`** — Manages the big rotating banner images at the top of the homepage, which are shown in two side-by-side panels (left and right) that both auto-advance together every 5 seconds.
*Watch out:* If an admin adds a different number of "left" banners than "right" banners, the two panels won't advance in sync — one side will visibly repeat its last image while the other keeps changing. Worth keeping left/right counts equal.

**`homepage.controller.js`, `.routes.js`** — One single endpoint that gathers *everything* the homepage needs in one go: banners, featured categories, a scrolling row of products, another scrolling row of "trusted by" products, recent blog posts, and the "why choose us" text. This keeps the homepage fast (one request instead of six), but means this file is a good first stop whenever something on the homepage looks wrong.

### About Page

Five small, similar database tables power different sections of the About page: **team members**, **stat counters** (the animated "500+ happy clients" numbers), **value props**, **process pillars** (the "how we work" section), and **partner brand logos**. They're all managed through one shared, reusable pattern (`about.controller.js`) that avoids repeating the same create/edit/delete code five times.
*If you're adding a brand-new About-page section*, you'll need to touch several files in a chain: the new database table, the line that registers it at startup, the shared controller, the routes file, and the admin page's tab configuration. Missing any one of these steps means the new section exists in the database but is invisible and un-editable — a classic "forgot a step" trap in this codebase.

### Quote Requests (Inquiries)

**`inquiry.model.js`, `inquiryItem.model.js`** — Every quote/contact-form submission is saved as an "Inquiry" (name, email, message, which department it's for, status). If someone requested specific products, those are saved as separate "Inquiry Items" attached to it.

**`inquiry.controller.js`** — The most detail-heavy controller in the backend. It validates the submitted form, saves the inquiry (and any requested items) as one all-or-nothing database operation, optionally saves an uploaded attachment, and sends two emails: one internal notification to the site's admin address, and one confirmation email back to the customer.
*Watch out:* If sending the emails fails for some reason, the inquiry itself has *already* been safely saved to the database by that point — so a customer might see an error message even though their request actually went through. Also, one part of this file accidentally reads a *frontend* configuration value instead of a proper backend one when building a link to an attachment — worth cleaning up if you're in this area.

**`inquiry.routes.js`** — The address book for this feature. The public submission address is rate-limited (max 5 submissions per 15 minutes from the same visitor) to prevent spam/abuse.

### Mockup Generator & Templates

This is the most technically unusual part of the whole project, so it's worth understanding well.

**What it does for visitors:** lets someone upload their own artwork/logo, place it onto a photo of a real product (like a mylar bag or a box), adjust its size/rotation/position, and download a realistic-looking preview — like trying on a t-shirt design before buying it.

**`template.model.js`, `.controller.js`, `.routes.js`** — A "template" is one product photo plus a defined rectangle (the "print area") describing exactly where on that photo a design should be placed, plus some limits on how much a user is allowed to resize/rotate their design. Templates can be draft, published, or archived — only published templates are shown to regular visitors; admins can see all of them.

**The shared "compositing" logic** (`frontend/src/shared/utils/renderMockup.js`) — This single file contains the actual "paste the design onto the photo, correctly rotated and scaled, with realistic shading" logic. It's written once and reused in two very different places:
1. **In the browser**, for instant live previews while someone is adjusting sliders.
2. **On the backend**, to produce the final, high-quality downloadable image.

*This is the trickiest, most fragile part of the codebase, and worth flagging clearly:* the backend doesn't have its own separate copy of this logic. Instead, at the moment someone requests a final high-quality export, the backend server literally **opens the frontend's file off disk, does a find-and-replace on a couple of lines of text to make it compatible with the server environment, and then runs it as freshly-generated code.** This works today, but it means:
- Any future change to that shared file — even something that looks harmless, like adding a new import at the top — could silently break the *server-side* export feature without breaking the *browser* preview feature (or vice versa), because the two run in genuinely different ways.
- There's no warning or test that catches this — you'd only find out the next time someone tries to export a final mockup and it fails.
- **Rule of thumb:** if you ever touch `renderMockup.js`, manually test *both* the live browser preview *and* the "Export Mockup" button afterward, not just one of them.

### SEO & Admin Stats

**`sitemap.controller.js`, `.routes.js`** — Automatically generates the `sitemap.xml` file (a list of every page on the site) that search engines use to discover all your pages. Built by hand-assembling text rather than using a proper XML-building tool, so a product or category name containing special characters like `&` or `<` could technically produce an invalid sitemap — unlikely in practice, but worth knowing.

**`stats.controller.js`, `.routes.js`** — Powers the small "at a glance" numbers on the admin dashboard (pending quote requests, active products, total categories).

**`upload.controller.js`, `.routes.js`** — The single shared "upload an image" endpoint used by almost every admin screen that needs to upload a photo (categories, products, homepage banners, blog covers, About page sections, mockup templates). Every image uploaded here gets automatically resized (max width 1200px) and converted to the efficient WebP format before saving, to keep the site fast.

### Small Helpers & One-Off Scripts

**`emailService.js`** — The one place that knows how to send emails. Handy detail: if email server settings aren't configured (which is the default when running the project locally), it doesn't fail — it just prints the email's contents to the console instead of actually sending it. Useful for local testing, but if a real OTP code or notification "isn't arriving" in a test environment, check here first — it's probably just being logged, not emailed.

**Various one-off scripts** (`seedAdmin.js`, `sync-db.js`, `addNameColumn.js`, `createSiteFaqs.js`, `migrateInquiries.js`, several `test_*.js` files) — These are small scripts meant to be run by hand, one time, for specific setup or fix-up tasks (like "create the first admin account" or "add a missing database column"). They are **not** automatically run and are **not** part of any testing setup — a few of them are actually outdated and would fail if run today (one references a database table that doesn't exist anymore; one calls a login web address that was later renamed). Treat anything in this category as historical/manual tooling, not living code.

---

## 5. Frontend — File by File

### App Startup

**`main.jsx`** — The very first file that runs. One important, easy-to-miss detail lives here: it turns on "always send my login cookie" for every single request the website ever makes, for the entire time the app is open. This one setting is *why* logging in "just works" everywhere else in the app without every single page having to think about it.

**`App.jsx`** — The full map of every page in the website and which web address shows it. If you're wondering "where does this page come from," this file is where to look first. Adding a brand-new page always means adding a line here.

**`index.css`** — The website's visual rulebook: the exact shade of pink used for buttons and links, the fonts, how rounded the corners are, and so on. Every single page and component pulls its colors and fonts from the definitions in this one file — think of it as the site's paint palette and font book, kept in one drawer that everything else reaches into.

### Shared Building Blocks (used across many pages)

**`shared/store/useAuth.js`** — Keeps track of "who's currently logged in" so any page can check it. Handles logging in (including the admin's extra code step), loading your account info on page load, and logging out.
*A quirk worth knowing:* this doesn't actually store your login code/token anywhere the website's JavaScript can read — that's intentional, since it's kept safely in the browser cookie instead (more secure that way). However, a number of admin pages *try* to read a "token" value from here anyway, expecting to attach it manually to their requests. That value is always empty/missing, so those manual attempts do nothing — but the requests still succeed anyway, because the browser cookie is already doing the real work automatically in the background. It's leftover, non-functional code rather than an actual bug affecting anyone using the site — but it could confuse a future developer into thinking login is broken when it isn't.

**`shared/store/useToast.js`** — A simple pop-up notification system (the little "Saved successfully!" or "Something went wrong" messages that appear and disappear on their own).
*A real, working bug worth fixing:* three specific screens — the Mockup Templates admin list, the Mockup Template editor, and the public Mockup Generator page — try to show these notifications using a method name that doesn't actually exist in this file. On those three screens specifically, success/error pop-ups silently fail to appear (and in some cases may cause a small crash in the background) instead of showing the message. If you're working on any of those three screens, this is worth fixing at the same time — the messages should use this file's real method (`showToast`) instead.

**`shared/components/SEO.jsx`** — A reusable helper that sets the page title and description you'd see in a browser tab or a Google search result. Used on nearly every public page.
*Worth knowing:* this only affects what's shown *after* the page has already loaded in a browser. There's a separate, independent piece on the backend (`seoInjector.js`, described above) that does a similar job specifically for search engines, before the page even loads. The two aren't connected to each other, so it's possible (though not currently a known problem) for them to disagree slightly on wording.

**`shared/layouts/PublicLayout.jsx`** — The header, live search box, and footer that wrap around every public-facing page. Includes a "type to search products" dropdown that shows results as you type.

**`shared/layouts/AdminLayout.jsx`** — The sidebar navigation and page frame that wraps around every admin page. This file is also the **only place** that checks "is this actually an admin who's allowed to be here" for the entire admin section — every admin page trusts that this check has already happened.
*Worth knowing:* adding a new admin page to the website (in `App.jsx`) doesn't automatically make it show up in the sidebar menu — you also have to add it to this file's navigation list separately.

**`shared/utils/renderMockup.js`** — Covered in detail in the "Mockup Generator" section above — this is the shared artwork-placement logic used by both the live preview and (indirectly, via a special server-side trick) the final downloadable export.

### Public Pages

**Home page** — Fetches everything for the homepage in one request and displays it in order: a rotating hero banner, a scrolling row of low-minimum products, a row of featured categories, a "trusted by growing brands" row, recent blog posts, and an accordion-style "why choose us" section.
*Worth knowing:* the two horizontally-scrolling product/category rows use fairly complex code to support smooth click-and-drag scrolling, gentle auto-scrolling, and looping seamlessly — this is genuinely one of the more intricate pieces of frontend code in the project, so changes here deserve careful, hands-on testing (try dragging, hovering to pause auto-scroll, and letting it loop around) rather than just a glance at the code.

**Products pages** — A filterable product listing (with a category sidebar) and an individual product detail page with a photo gallery, size/variant picker, description, FAQs, and a "Request a Quote" button that jumps you to the Contact page with your interest pre-filled in.
*Worth knowing:* the storefront's search box (in the header) links to a "search results" web address, but the actual product listing page doesn't currently read that search term from the address to filter its results — worth double-checking that search results are actually showing what someone typed, rather than just the full unfiltered product list.

**About page** — Tells the company's story: an animated hero, "our numbers" counters that count up from zero as you scroll to them, value props, "how we work," partner logos, and the team. All of this content comes from the About-page backend endpoint described above, and the fun scroll-triggered animations (count-up numbers, fade-ins) are built specifically for this page rather than shared/reused elsewhere.

**Blog pages** — A blog listing page and an individual post page. Blog post content is currently shown as plain text with line breaks preserved, not as fully-formatted rich text/HTML — worth knowing if the plan is ever to let admins format blog posts with bold text, links, images inline, etc., since that would need a different way of displaying the content than what's here today.

**Contact page** — The main quote-request form: choose a department (general, bulk orders, support, partnership, careers), fill in your details with a nice floating-label design, optionally attach a file, and submit. Also shows the site's FAQs and contact info (address, hours, WhatsApp number), pulled from the flexible content system described earlier.

**Sign up / Log in page (customer-facing)** — Handles both customers and admins arriving at the same simple login form, with a matching sign-up-and-email-verification flow for new customers.
*Worth knowing:* this page has its own separate copy of the "log in, and handle the admin's extra code step" logic, instead of reusing the shared version that already exists in `useAuth.js`. They do the same thing today, but since they're two separate pieces of code, a future fix to one won't automatically apply to the other — worth keeping in mind if login behavior ever needs to change.

**Mockup Generator page (public)** — The interactive tool described in the Mockup Generator section above: pick a template, upload your design, adjust it with sliders, preview it live, and export. If you're not logged in, you can preview but you'll be asked to sign in before downloading a final export. If the high-quality server export fails for any reason, it quietly falls back to a slightly-lower-quality version made right in your browser instead of showing an error — helpful for reliability, but it means a broken backend export could go unnoticed for a while since visitors still get *something* that looks like it worked.

### Admin Pages

Nearly every admin screen (Categories, Products, Blog, Homepage Banners, Site FAQs, Contact Page Settings, About Page editor, Users, Quote Requests, Mockup Templates) follows the same recognizable pattern: a list of existing items, an "Add/Edit" form that appears above the list, and Save/Delete buttons that talk directly to the backend. None of these screens keep a smart cache of their data — navigating away and back always re-fetches everything fresh from the server.

**Admin Dashboard** — Meant to show three quick stats (pending quote requests, active products, total categories) when an admin first logs in.
*A real, working bug worth fixing:* due to a small mismatch with how login info is stored (see the `useAuth.js` note above), this page never actually successfully requests those numbers from the backend — the three stat cards will always show 0, regardless of the real numbers. This is a visible, easy-to-notice bug on the very first screen an admin sees after logging in, and should be an easy fix once you know where to look.

**About Page admin editor** — The most complex single admin screen: one tabbed interface managing all five About-page sections (team, stats, value props, process, partner brands) plus the hero/mission/call-to-action text, using one reusable, config-driven building block instead of five separate hand-written forms. A good example to look at if you want to see the "smart reusable form" pattern used well in this codebase.

**Mockup Templates admin (list + editor)** — Where staff create and manage the product templates used by the public Mockup Generator. The editor includes a drag-to-resize-and-rotate visual box for marking exactly where on the product photo artwork should be placed, plus a "Generate Preview" button to sanity-check the placement with a placeholder design before publishing a template for real.
*Worth knowing:* (1) as mentioned above, the pop-up notification system doesn't currently work on these screens due to a naming mismatch — worth fixing alongside any other change here. (2) When you rotate the print-area box and then try to resize it by dragging a corner, the resize doesn't perfectly account for the rotation — it can feel slightly "off" for rotated boxes. Not a crash, just a rough edge in the interactive editor.

---

## 6. Things That Touch the Whole App

### Login & Permissions
Covered in Section 3 above — one shared cookie-based session, checked per-request on the backend and gated once at the top level on the frontend (`AdminLayout.jsx`).

### Shared "Remembered" Data (State Management)
- **`useAuth`** — who's logged in. Used everywhere.
- **`useToast`** — pop-up notifications. Used by most admin screens (broken on three specific ones — see above).
- **`useCategories`**, **`useProducts`** — small caches of category/product lists, shared between a couple of related pages.
- Everything else (homepage data, blog posts, quote requests, users, templates, About page content, contact settings) is fetched fresh by each individual page as it loads, with no shared memory between pages. This is simple and predictable, but means every page visit re-downloads data that was just downloaded a moment ago on a different page.

### Visual Design
All colors, fonts, and rounded-corner sizes come from one file (`frontend/src/index.css`). One thing worth knowing: the Mockup Templates section of the admin panel (list, editor, and the public Mockup Generator page) was built using plain default grays and blues instead of the site's actual color palette — so it looks visually different from the rest of the site. Not broken, just inconsistent, and worth a design pass if visual consistency matters for that area.

### Error & Success Messages
Handled inconsistently across the app by design intention, not by accident of a shared system: some public pages (like the Contact form and the sign-up flow) show their own custom success/error messages right there on the page; most admin screens use the shared pop-up notification system; and three specific screens (mentioned above) have that pop-up system silently failing due to a naming mismatch.

### Places Where Code Is Duplicated
A few things exist as two (or more) separate, similar-but-not-identical copies rather than one shared, reusable piece:
- Product and category "cards" (the little preview boxes used in grids) exist in slightly different versions depending on which part of the site they appear in.
- The smooth drag-and-auto-scroll behavior used for the homepage's product and category rows is written out twice, once for each row type, instead of being shared.
- The "log in, including the admin's extra code step" logic exists both in the shared login state file and, separately, inside the customer sign-up/login page.
- The "optionally check who's logged in, without requiring it" logic exists both in the main permissions file and, separately, inside the Mockup Templates routing file.

None of this duplication is currently causing visible problems, but it does mean a fix or improvement made in one copy won't automatically apply to its twin — worth searching for "does this exist elsewhere too?" before assuming a fix is complete.

### The One Fragile Spot to Be Extra Careful With
As covered in detail above: the backend's high-quality mockup export feature works by reading the frontend's artwork-placement code directly off disk and running it as freshly-generated code on the server, rather than having its own independent copy. **If you're changing `frontend/src/shared/utils/renderMockup.js` for any reason, always manually re-test the "Export Mockup" button afterward** — a change that looks perfectly safe in the browser could quietly break the server-side export without any warning.

### Files That Many Other Files Depend On (change these carefully)
If you're about to make a change and want to know "how many other things could this affect," these are the files with the widest reach in the project:

**Backend:**
- `config/db.js` — the database connection every single table relies on.
- `middleware/authMiddleware.js` — the login/permission checks used by almost every protected feature.
- `product.model.js` — read by products, the homepage, search, the sitemap, and quote requests.
- `upload.controller.js` — the shared image-upload logic used by nearly every admin screen that has photos.

**Frontend:**
- `shared/store/useAuth.js` — login state, read by roughly a dozen-plus pages.
- `shared/index.css` — the whole site's colors and fonts.
- `shared/utils/renderMockup.js` — used by two frontend pages and, indirectly, by the backend's export feature.
- `App.jsx` — the master list of every page in the site.

---

*This document was written to be readable without prior knowledge of the codebase. For exact function names, database field names, and line-level detail, refer to the source files directly — the paths above are exact and can be opened straight from this document.*