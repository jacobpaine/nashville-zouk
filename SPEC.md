# Nashville Zouk — MVP Specification

## 1. Product Overview

Nashville Zouk is a community event website for the Nashville Brazilian Zouk dance scene. It serves a small, mobile-first audience of dancers looking to discover and attend local events.

The site has two distinct concerns:

- **Flyer** — the visual/artistic source of event information. Designed by organizers, shared on social media.
- **Website** — the structured source of event information. Searchable, linkable, machine-readable.

These two concerns complement each other. The site does not attempt to replicate all flyer content in text form; it provides structure (dates, locations, add-to-calendar) alongside the flyer image.

**Audience:** Local dancers, visiting dancers, prospective students. Fewer than 500 email subscribers.

**Admin audience:** 1–3 organizers managing events, communications, and content.

---

## 2. MVP Scope

### Public site
- Homepage with current/latest flyer and upcoming events teaser
- Events page with list view and optional month-style calendar toggle
- Event detail pages
- Flyer archive
- Instructor profiles (grid + individual)
- About page
- Email signup (inline, no account required)
- Add to Calendar links (Google, Apple/ICS)
- Basic analytics (page views, key interactions)

### Admin dashboard
- Admin login (single-user session auth)
- Dashboard overview
- Create / edit / delete events
- Upload flyers, manage flyer library, set current flyer
- Edit About page content
- Manage instructor profiles (add, edit, reorder, deactivate)
- View email subscribers
- Compose email campaign drafts
- Send email announcements to all active subscribers
- Generate social media copy for Instagram, Facebook, Meetup, WhatsApp (manual copy workflow)

---

## 3. Explicit Non-Goals

The following are **out of scope for MVP** and should not be designed in:

- Public user accounts or registration
- SMS / text messaging
- Payment processing or ticketing
- Social media API integrations (posting is manual copy/paste)
- Multi-role admin permissions
- Comments, reviews, or community discussion
- Real-time notifications or live updates
- Multi-language support
- Video hosting or embedding (beyond optional YouTube links on event pages)
- A/B testing infrastructure
- Advanced subscriber segmentation
- Waitlists or RSVPs

---

## 4. Public Routes

| Route | Description |
|---|---|
| `/` | Homepage — current flyer prominent, 3–5 upcoming events, email signup |
| `/events` | Full event list — upcoming first, optional month calendar toggle |
| `/events/[slug]` | Event detail — date, time, location, flyer, add-to-calendar, description |
| `/flyers` | Flyer archive — grid of all flyers, newest first |
| `/instructors` | Instructor grid |
| `/instructors/[slug]` | Instructor profile — bio, photo, links |
| `/about` | About page — markdown-rendered content |
| `/unsubscribe` | Email unsubscribe — `?token=` query param, shows confirmation |

All public routes are accessible without authentication. No login wall on any public content.

---

## 5. Admin Routes

All `/admin/*` routes require an active admin session. Unauthenticated requests redirect to `/admin/login`.

| Route | Description |
|---|---|
| `/admin/login` | Email + password login form |
| `/admin/dashboard` | Summary: upcoming events count, subscriber count, current flyer |
| `/admin/events` | Event list with edit/delete actions |
| `/admin/events/new` | Create event form |
| `/admin/events/[id]/edit` | Edit event form |
| `/admin/flyers` | Flyer library — upload, set as current, delete |
| `/admin/about` | About page markdown editor |
| `/admin/instructors` | Instructor list with drag-reorder, edit, deactivate |
| `/admin/instructors/new` | Add instructor form |
| `/admin/instructors/[id]/edit` | Edit instructor form |
| `/admin/subscribers` | Subscriber list — email, name, subscribed date, status |
| `/admin/campaigns` | Campaign list — drafts and sent |
| `/admin/campaigns/new` | Campaign composer — subject + body |
| `/admin/campaigns/[id]` | View/edit draft; view sent campaign details; social copy panel |

---

## 6. Data Model

### `events`
```
id              uuid          PK, default gen_random_uuid()
title           text          NOT NULL
slug            text          UNIQUE NOT NULL
description     text          nullable
start_datetime  timestamptz   NOT NULL
end_datetime    timestamptz   nullable
location_name   text          NOT NULL
location_address text         nullable
location_url    text          nullable  -- Google Maps link
event_type      text          NOT NULL  -- enum: 'social' | 'workshop' | 'class'
is_published    boolean       NOT NULL  DEFAULT false
flyer_id        uuid          FK → flyers.id, nullable, SET NULL on delete
created_at      timestamptz   NOT NULL  DEFAULT now()
updated_at      timestamptz   NOT NULL  DEFAULT now()
```

### `flyers`
```
id              uuid          PK, default gen_random_uuid()
title           text          NOT NULL
image_url       text          NOT NULL  -- S3 public URL
image_key       text          NOT NULL  -- S3 object key for deletion
event_id        uuid          FK → events.id, nullable, SET NULL on delete
is_current      boolean       NOT NULL  DEFAULT false
created_at      timestamptz   NOT NULL  DEFAULT now()
updated_at      timestamptz   NOT NULL  DEFAULT now()
```

Only one flyer may have `is_current = true` at a time. Enforced at the application layer (set others to false on update).

### `instructors`
```
id              uuid          PK, default gen_random_uuid()
name            text          NOT NULL
slug            text          UNIQUE NOT NULL
bio             text          nullable
photo_url       text          nullable  -- S3 public URL
photo_key       text          nullable  -- S3 object key
instagram_handle text         nullable  -- without @
display_order   integer       NOT NULL  DEFAULT 0
is_active       boolean       NOT NULL  DEFAULT true
created_at      timestamptz   NOT NULL  DEFAULT now()
updated_at      timestamptz   NOT NULL  DEFAULT now()
```

### `subscribers`
```
id                  uuid          PK, default gen_random_uuid()
email               text          UNIQUE NOT NULL
first_name          text          nullable
subscribed_at       timestamptz   NOT NULL  DEFAULT now()
unsubscribed_at     timestamptz   nullable
unsubscribe_token   text          UNIQUE NOT NULL
is_active           boolean       NOT NULL  DEFAULT true
```

`unsubscribe_token` is a random UUID generated at insert time, never changes.

### `about_content`
```
id          uuid          PK, default gen_random_uuid()
content     text          NOT NULL  -- markdown
updated_at  timestamptz   NOT NULL  DEFAULT now()
```

Singleton table. Always has exactly one row. Upserted on save.

### `admin_users`
```
id              uuid          PK, default gen_random_uuid()
email           text          UNIQUE NOT NULL
password_hash   text          NOT NULL  -- bcrypt
created_at      timestamptz   NOT NULL  DEFAULT now()
last_login_at   timestamptz   nullable
```

### `campaigns`
```
id              uuid          PK, default gen_random_uuid()
subject         text          NOT NULL
body_html       text          NOT NULL
body_text       text          NOT NULL
status          text          NOT NULL  DEFAULT 'draft'  -- 'draft' | 'sent'
sent_at         timestamptz   nullable
recipient_count integer       nullable
created_at      timestamptz   NOT NULL  DEFAULT now()
updated_at      timestamptz   NOT NULL  DEFAULT now()
```

---

## 7. Component Plan

### Public components

| Component | Description |
|---|---|
| `Header` | Site nav — logo, Events, Instructors, About links; hamburger on mobile |
| `Footer` | Social links, email signup teaser, copyright |
| `FlyerCard` | Flyer image (next/image) with optional event link overlay |
| `EventCard` | Event list item — date chip, title, location, event type badge |
| `EventCalendar` | Month grid calendar view, toggleable on `/events` |
| `InstructorCard` | Photo, name, Instagram handle |
| `EmailSignupForm` | Email + optional first name, server action submit |
| `AddToCalendarButton` | Dropdown: Google Calendar, Apple Calendar (ICS download) |

### Admin components

| Component | Description |
|---|---|
| `AdminNav` | Sidebar navigation with links to all admin sections |
| `EventForm` | Create/edit form — all event fields, flyer picker |
| `FlyerUploader` | Drag-and-drop or file picker, preview, uploads to S3 |
| `InstructorForm` | Create/edit form — all instructor fields, photo upload |
| `MarkdownEditor` | Textarea with live preview — used for About and campaign body |
| `SubscriberTable` | Paginated table — email, name, date, status, export button |
| `CampaignForm` | Subject + body composer with preview pane |
| `SocialCopyPanel` | Tabbed panel: Instagram / Facebook / Meetup / WhatsApp copy |

---

## 8. Service / Module Plan

### `lib/db.ts`
Drizzle ORM client connected to Neon via `@neondatabase/serverless`. Exports the `db` instance and all table schema objects.

### `lib/schema.ts`
Drizzle table definitions for all tables. Single source of truth for types.

### `lib/storage.ts`
AWS S3 helpers using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`:
- `uploadFile(key, buffer, contentType)` → public URL
- `deleteFile(key)`
- `getPresignedUploadUrl(key, contentType)` — for client-side direct upload if needed

### `lib/email.ts`
Resend helpers:
- `sendEmail({ to, subject, html, text })` — single email
- `sendBatch(recipients, { subject, html, text })` — batch send with per-recipient unsubscribe links

### `lib/auth.ts`
iron-session helpers:
- Session type: `{ adminId: string, email: string }`
- `getSession(req)` — returns session or null
- `requireAdmin(req)` — throws 401 if no valid session
- Cookie config: httpOnly, secure in production, 24h max age

### `lib/analytics.ts`
Umami tracking:
- `trackEvent(name, data?)` — calls Umami's `/api/send` endpoint
- Used server-side for form submissions; client-side via Umami script tag for page views

### `lib/social-copy.ts`
Pure functions that take an event object and return formatted strings:
- `instagramCopy(event)` → caption + hashtags
- `facebookCopy(event)` → event post text
- `meetupCopy(event)` → event description
- `whatsappCopy(event)` → brief announcement

### `lib/calendar.ts`
- `googleCalendarUrl(event)` → Google Calendar add URL
- `generateICS(event)` → ICS file string for Apple Calendar download

### `lib/slugify.ts`
- `slugify(text)` → URL-safe slug

### API Routes (`app/api/`)

```
app/api/
  events/
    route.ts          GET (list), POST (create)
    [id]/route.ts     GET, PUT, DELETE
  flyers/
    route.ts          GET (list), POST (upload)
    [id]/route.ts     PUT (update/set-current), DELETE
  instructors/
    route.ts          GET, POST
    [id]/route.ts     GET, PUT, DELETE
  subscribers/
    route.ts          POST (subscribe)
    unsubscribe/
      route.ts        POST (unsubscribe by token)
  campaigns/
    route.ts          GET, POST
    [id]/route.ts     GET, PUT, DELETE
    [id]/send/
      route.ts        POST (send campaign)
  about/
    route.ts          GET, PUT
  admin/
    login/route.ts    POST
    logout/route.ts   POST
    me/route.ts       GET
```

---

## 9. User Flows

### Discover upcoming events
1. User opens `/` on mobile
2. Sees current flyer image prominently at top
3. Scrolls to see upcoming events teaser (next 3–5 events)
4. Taps "See all events" → `/events`
5. Browses list; optionally toggles to calendar view
6. Taps an event → `/events/[slug]`

### View event detail
1. User is on event detail page
2. Sees: event title, date/time, location with map link, event type
3. Sees associated flyer image (if set)
4. Taps "Add to Google Calendar" or "Download .ics"
5. Event added to their calendar

### Sign up for email
1. User sees email signup form (homepage or footer)
2. Enters email (and optionally first name)
3. Submits — server action fires
4. Subscriber row inserted with unique unsubscribe token
5. Confirmation email sent via Resend
6. UI shows success message

### Unsubscribe
1. User clicks unsubscribe link in email
2. Opens `/unsubscribe?token=abc123`
3. Page shows "You've been unsubscribed" confirmation
4. `unsubscribed_at` set, `is_active` set to false

---

## 10. Admin Flows

### Login
1. Admin navigates to `/admin/login`
2. Enters email + password
3. Server validates against `admin_users.password_hash` (bcrypt)
4. On success: iron-session cookie set, redirect to `/admin/dashboard`
5. On failure: error message, no redirect

### Create event with flyer
1. Admin navigates to `/admin/events/new`
2. Fills in title, date/time, location, event type, description
3. Either picks existing flyer from library or uploads new one via FlyerUploader
4. Flyer uploads directly to S3; URL stored
5. Admin sets `is_published: true` when ready
6. Saves → POST `/api/events` → redirect to event list

### Upload and set current flyer
1. Admin navigates to `/admin/flyers`
2. Drags image file onto FlyerUploader
3. File uploads to S3 → `flyers` row inserted
4. Admin clicks "Set as current" on any flyer
5. PUT `/api/flyers/[id]` with `is_current: true` → all others set to false

### Send email campaign
1. Admin navigates to `/admin/campaigns/new`
2. Enters subject and body (markdown editor with preview)
3. Saves as draft
4. Reviews rendered preview
5. Clicks "Send to all subscribers"
6. Confirmation dialog: "Send to N subscribers?"
7. On confirm: POST `/api/campaigns/[id]/send`
8. Resend batch send fires to all `is_active` subscribers
9. `status` set to `sent`, `sent_at` and `recipient_count` recorded
10. Campaign becomes read-only

### Generate social copy
1. Admin opens a campaign or event
2. Navigates to "Social Copy" tab
3. Sees tabbed panel: Instagram | Facebook | Meetup | WhatsApp
4. Each tab shows pre-formatted text
5. Admin clicks "Copy" button → clipboard
6. Pastes into the respective platform manually

---

## 11. Accessibility Requirements

- Target: **WCAG 2.1 AA**
- All images must have descriptive `alt` text (flyers: event title; instructor photos: instructor name)
- All form inputs must have associated `<label>` elements
- Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components
- Interactive elements must be keyboard-navigable (Tab, Enter, Space, Escape)
- Focus must be managed when modals or drawers open/close (trap focus in modal, return to trigger on close)
- No information conveyed by color alone
- Skip-to-content link at top of every page
- Admin forms must have visible focus indicators

---

## 12. Mobile-First Design Requirements

- Base styles written for **375px viewport** (iPhone SE); scale up with responsive breakpoints
- All touch targets ≥ **44×44px**
- No interactions that depend on hover state (hover enhancements allowed, but not required)
- Navigation: hamburger menu on mobile (< 768px); horizontal nav on desktop
- Event list: full-width cards on mobile; optional 2-col grid on desktop
- Flyer image: full viewport width on mobile, max-width constrained on desktop
- Admin forms: single-column on mobile; 2-col on desktop where it helps
- All images use `next/image` with responsive `sizes` prop
- Font size minimum 16px for body text to prevent iOS auto-zoom on inputs
- Avoid fixed-position elements that overlap scrollable content on iOS

---

## 13. Analytics Events

Tracked via Umami. Page views are automatic via the Umami script.

| Event Name | Properties | Trigger |
|---|---|---|
| `event_detail_view` | `slug`, `title` | Event detail page load |
| `add_to_calendar_click` | `provider` (google/apple), `event_slug` | Add to Calendar button click |
| `email_signup_submit` | — | Successful email signup |
| `flyer_archive_view` | — | `/flyers` page load |
| `unsubscribe_complete` | — | Successful unsubscribe |
| `instructor_profile_view` | `slug` | Instructor detail page load |

---

## 14. Email Signup and Unsubscribe

### Signup
- Form fields: `email` (required), `first_name` (optional)
- Submit via Next.js Server Action
- On submit:
  1. Validate email format
  2. Check for existing subscriber — if already active, show "already subscribed" message
  3. Generate `unsubscribe_token` (crypto.randomUUID())
  4. Insert row into `subscribers`
  5. Send confirmation email via Resend (simple "You're subscribed" message with unsubscribe link)
  6. Show success state in UI

### Unsubscribe
- Every campaign email includes a footer link: `https://nashvillezouk.com/unsubscribe?token={token}`
- GET `/unsubscribe?token=` — Next.js page looks up token, renders confirmation UI
- On page load:
  1. Look up subscriber by token
  2. If found and active: set `unsubscribed_at = now()`, `is_active = false`
  3. Show "You've been unsubscribed" message
  4. If token invalid or already unsubscribed: show appropriate message

### Campaign sends
- Only send to `WHERE is_active = true`
- Resend batch API: send in groups of 100 if needed (Resend free tier: 100 emails/day; production: upgrade to paid)
- Each email is personalized with `first_name` if available

---

## 15. Comms Campaign Workflow

1. **Create draft** — Admin navigates to `/admin/campaigns/new`
2. **Compose** — Subject line + markdown body (with live HTML preview)
3. **Save draft** — POST `/api/campaigns` with `status: 'draft'`
4. **Review** — Admin can return to edit draft at any time
5. **Preview** — Rendered email preview shown alongside editor
6. **Send** — Admin clicks "Send to all subscribers"; confirmation dialog shows recipient count
7. **Confirm** — POST `/api/campaigns/[id]/send`
   - Fetches all `is_active` subscribers
   - Renders email HTML with unsubscribe link per subscriber
   - Sends via Resend
   - Updates campaign: `status = 'sent'`, `sent_at = now()`, `recipient_count = N`
8. **Read-only** — Sent campaigns cannot be edited; shown in campaign history

---

## 16. Social Copy Generator

The social copy panel is available on the campaign detail page and on any event detail page in the admin.

For each platform, a template function takes an event object and returns pre-formatted text:

**Instagram**
```
{title}
📅 {formatted date and time}
📍 {location_name}

{short description or "Come dance with us!"}

#NashvilleZouk #BrazilianZouk #Nashville #Zouk #SocialDance
```

**Facebook**
```
{title}

Join us for {event_type} on {date} at {location_name}!

{description}

Details + add to calendar: {event_url}
```

**Meetup**
```
{title}

{description}

📅 {date and time}
📍 {location_name}
{location_address}
```

**WhatsApp**
```
🎶 {title}
{date} · {time}
{location_name}

{short description}

Details: {event_url}
```

Admin clicks a "Copy" button per platform. No API integration — purely clipboard-based.

---

## 17. Testing Plan

### Unit tests (Vitest)
- `lib/slugify.ts` — slugify edge cases
- `lib/calendar.ts` — googleCalendarUrl output, ICS format validity
- `lib/social-copy.ts` — all four platform formatters with fixture event data
- `lib/email.ts` — template rendering (mock Resend client)

### Integration tests (Vitest + test database)
- API route handlers for events CRUD
- Subscriber signup + duplicate handling
- Unsubscribe by token
- Campaign create + send (mock Resend)
- Admin login + session validation

### E2E tests (Playwright)
- Homepage loads with current flyer displayed
- Events list shows upcoming events
- Event detail page — full content visible, add-to-calendar button present
- Email signup form — submits and shows success
- Admin login flow — invalid password shows error, valid login redirects
- Admin creates event — appears in public events list
- Admin uploads flyer — appears in flyer archive

### Manual QA checklist
- Mobile responsiveness on iOS Safari (375px, 390px)
- Mobile responsiveness on Android Chrome
- Keyboard navigation through public site
- Admin forms on mobile

---

## 18. Implementation Phases

### Phase 1 — Foundation
- Initialize Next.js 15 project with TypeScript and Tailwind v4
- Configure ESLint, Prettier
- Set up Drizzle ORM with Neon connection
- Write all table schemas in `lib/schema.ts`
- Run initial migration
- Configure environment variables (`.env.local`, `.env.example`)
- Deploy skeleton to Vercel

### Phase 2 — Core Public Site
- Homepage: current flyer + upcoming events teaser + email signup placeholder
- Events list page with EventCard component
- Event detail page with all structured fields
- Add to Calendar (Google URL + ICS download)
- Header + Footer with mobile nav
- `lib/calendar.ts` utility

### Phase 3 — Admin Foundation
- Admin login page + iron-session auth
- Middleware to protect `/admin/*` routes
- Admin layout + AdminNav sidebar
- Event CRUD (list, create, edit, delete)
- FlyerUploader component + AWS S3 integration (`lib/storage.ts`)
- Flyer management page (upload, set current, delete)

### Phase 4 — Extended Public Site
- Flyer archive page
- Instructor grid + profile pages
- About page (markdown rendered with `react-markdown`)
- Email signup form with Server Action (`lib/email.ts` confirmation email)
- Unsubscribe page

### Phase 5 — Admin Extensions
- About page markdown editor
- Instructor management (add, edit, photo upload, reorder, deactivate)
- Subscriber list view (table, export CSV)
- Campaign composer + draft save
- Campaign send flow (Resend batch)
- Social copy panel (`lib/social-copy.ts`)

### Phase 6 — Analytics + Polish
- Umami analytics setup (self-hosted or cloud)
- Client-side event tracking (`lib/analytics.ts`)
- Error pages (404, 500)
- SEO meta tags on all public pages (title, description, og:image)
- Accessibility audit + fixes
- Mobile polish pass
- Performance pass (image optimization, static generation where appropriate)
