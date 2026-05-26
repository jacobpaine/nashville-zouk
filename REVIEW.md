# Nashville Zouk MVP — Production Readiness Review

Reviewed against commit `0f67463`. No fixes implemented — findings only.

---

## Summary

| Severity | Count |
|---|---|
| Blocker | 2 |
| High | 6 |
| Medium | 10 |
| Low | 8 |

The app is well-structured and functionally complete. Most blockers and high-severity issues are small, targeted fixes rather than architectural rewrites.

---

## 1. App Architecture & Folder Structure

**Medium — `PLACEHOLDER_URL` is a magic string duplicated in 12+ files**
- Files: `lib/queries.ts`, `app/actions/auth.ts`, `app/actions/subscribe.ts`, `app/admin/(app)/layout.tsx`, every API route file
- Problem: The string `'postgresql://user:password@host/dbname?sslmode=require'` and its `isDbConfigured()` check are copied verbatim into every file that touches the database. If the placeholder ever changes (or anyone typos it), all dev-mode guards silently break and the app tries to connect to a non-existent database.
- Fix: Export `isDbConfigured()` and `PLACEHOLDER_URL` from a single shared module (e.g. `lib/config.ts`) and import it everywhere.

**Low — Admin `'use client'` pages have no document title**
- Files: `app/admin/(app)/about/page.tsx`, `app/admin/(app)/subscribers/page.tsx`
- Problem: Both pages are `'use client'` components and cannot export `metadata`. The browser tab shows a generic title inherited from the root layout.
- Fix: Add a `<title>` via a wrapping server component that exports `metadata`, or use `useEffect(() => { document.title = 'Subscribers | Admin' }, [])`.

---

## 2. Public Route Implementation

**Medium — Draft events are publicly accessible by slug**
- File: `lib/queries.ts:57`
- Problem: `getEventBySlug` does not filter by `isPublished: true`. Any user who knows or guesses the slug of a draft event can view its full detail page.
- Fix: Add `.where(and(eq(events.slug, slug), eq(events.isPublished, true)))` in the public query. The admin edit page can continue using a separate admin-only query without this filter.

**Medium — Flyer archive links to `/events` list, not the specific event**
- File: `app/flyers/page.tsx:26`
- Problem: When a flyer has an `eventId`, it renders a `<Link href="/events">` pointing to the generic event list rather than the specific event. The flyer object doesn't carry the event slug, so the link can't be specific without a join.
- Fix: Either join the event slug in `getAllFlyers()` so the URL can be `/events/${event.slug}`, or remove the link entirely if the event association is just metadata.

---

## 3. Admin Route Protection

**High — `proxy.ts` validates cookie presence, not session integrity**
- File: `proxy.ts:9`
- Problem: The middleware checks `request.cookies.get('admin-session')` — i.e., whether the cookie exists — but does not decrypt or validate its contents. Any request with a cookie named `admin-session` set to an arbitrary value will pass the middleware check.
- Context: This is a known limitation of iron-session with Next.js middleware (Edge runtime cannot run the full iron-session decryption). The `AdminAppLayout` server component calls `getSession()` and redirects if `session.adminId` is missing, providing a real second gate. API routes use `requireAdmin()` which also fully validates. So admin pages and API routes are properly protected; the middleware is only the first-pass redirect layer.
- Fix: Document this two-layer pattern explicitly, or add a lightweight HMAC check in the middleware using only Web Crypto APIs (Edge-compatible) to reject obviously forged cookies at the edge without relying solely on the layout fallback.

**Low — Login ignores the `?from` redirect parameter**
- File: `app/actions/auth.ts:59`
- Problem: The proxy sets `?from=/original/path` on the login redirect, but `loginAction` always redirects to `/admin/events` regardless. After logging in, the admin is not returned to where they were going.
- Fix: Read `formData.get('from')` or pass it as a hidden input, validate it starts with `/admin/`, then redirect there after successful login.

---

## 4. API Route Auth Checks

**High — `PUT /api/events/[id]` and `PUT /api/flyers/[id]` have no input validation**
- Files: `app/api/events/[id]/route.ts:27`, `app/api/flyers/[id]/route.ts:17`
- Problem: The events PUT unpacks all body fields and sends them directly to Drizzle with no required-field checks. The flyers PUT does `{ ...body, updatedAt: new Date() }` — passing the entire body directly, allowing any DB column to be overwritten. An admin could set `imageUrl` to an arbitrary URL or `imageKey` to a key they don't own.
- Fix: Explicitly allowlist the fields accepted by each PUT handler. For the flyer PUT, only accept `{ isCurrent, eventId, title }` rather than the entire body.

**Low — `DELETE /api/events/[id]` returns 200 instead of 204**
- File: `app/api/events/[id]/route.ts:67`
- Problem: Returns `NextResponse.json({ success: true })` with HTTP 200. REST convention for a successful delete with no response body is 204 No Content.
- Fix: `return new NextResponse(null, { status: 204 })`.

---

## 5. Database Access Patterns

**Low — `getEventBySlug` and admin page functions duplicate `isDbConfigured()` logic**
- Files: `app/admin/(app)/events/page.tsx:9`, `app/admin/(app)/instructors/page.tsx`, `app/admin/(app)/campaigns/page.tsx`, `app/admin/(app)/instructors/[id]/edit/page.tsx`
- Problem: Each admin page defines its own inline `getAdminXxx()` function with its own copy of the `isDbConfigured()` check instead of calling the shared functions in `lib/queries.ts`. The admin versions add "show all including unpublished" logic, but the isDbConfigured pattern is duplicated unnecessarily.
- Fix: Add admin-specific query functions to `lib/queries.ts` (e.g. `getAllEventsAdmin()`) and call those from the pages.

**Low — `about_content` upsert uses two round-trips**
- File: `app/api/about/route.ts:37`
- Problem: The PUT handler selects first, then inserts or updates. A concurrent write between the select and insert could cause a duplicate key error.
- Fix: Use `db.insert(aboutContent).values({ content }).onConflictDoUpdate({ target: aboutContent.id, set: { content, updatedAt: new Date() } })`.

---

## 6. Demo/Mock Data Separation

**High — `isStorageConfigured()` only checks `AWS_ACCESS_KEY_ID`**
- Files: `app/api/flyers/route.ts:10`, `app/api/instructors/[id]/photo/route.ts:9`
- Problem: The check only verifies `AWS_ACCESS_KEY_ID !== 'your-access-key-id'`. If someone sets the key ID but forgets `AWS_S3_BUCKET` or `AWS_REGION`, `isStorageConfigured()` returns `true` and the upload proceeds, then crashes inside `lib/storage.ts` with an unhelpful error about undefined values.
- Fix: Check all four required S3 vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`.

**Low — Mock IDs are human-readable strings, not UUIDs**
- File: `lib/mock.ts`
- Problem: Mock IDs (`'evt-001'`, `'flyer-001'`, `'inst-001'`) are not valid UUIDs. Any code path that passes a mock ID to a real DB call (possible if demo mode detection fails) will get a Postgres `invalid input syntax for type uuid` error rather than a clean "not found."
- Fix: Either use UUID-shaped mock IDs (e.g. `'00000000-0000-0000-0000-000000000001'`) or add explicit UUID validation before any DB query.

---

## 7. S3 Upload Safety

**Blocker — No server-side file size limit on upload routes**
- Files: `app/api/flyers/route.ts:36`, `app/api/instructors/[id]/photo/route.ts:29`
- Problem: `await file.arrayBuffer()` loads the entire upload into memory with no size cap. On Vercel's serverless runtime, a 40MB upload would consume the full function memory allocation and likely cause an OOM crash. Vercel's Pro plan allows up to 50MB request bodies.
- Fix: Check `file.size` before calling `arrayBuffer()` and reject with 413 if it exceeds a limit (e.g. 10MB for flyers, 5MB for photos).

**High — File MIME type is client-supplied and not verified**
- Files: `app/api/flyers/route.ts:44`, `app/api/instructors/[id]/photo/route.ts:34`
- Problem: `file.type.startsWith('image/')` uses the MIME type declared by the client, which can be spoofed. A renamed `.html` or `.svg` file could be uploaded and served from S3.
- Fix: Add a server-side allowlist of permitted extensions: `const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']` and validate `ext` against it after splitting from the filename.

**Low — File extension is taken from the original filename without sanitization**
- Files: `app/api/flyers/route.ts:55`, `app/api/instructors/[id]/photo/route.ts:40`
- Problem: `file.name.split('.').pop()` could produce a multi-segment extension from a filename like `image.php.jpg` (gets `jpg` — harmless), or no extension from `imagefile` (gets `imagefile` as the "extension"). The resulting S3 key would have no recognizable extension, breaking browser content-type detection.
- Fix: Validate the extracted extension against the allowlist and default to a safe value if unrecognized.

**Low — `getPresignedUploadUrl` in `lib/storage.ts` is dead code**
- File: `lib/storage.ts:35`
- Problem: The function is exported but never imported or called anywhere. Its presence suggests an alternative upload flow that was not implemented.
- Fix: Remove it, or implement it as the upload mechanism.

---

## 8. Email Campaign Safety

**Blocker — Campaign send has a TOCTOU race condition**
- File: `app/api/campaigns/[id]/send/route.ts:38`
- Problem: The route reads the campaign status, sends the batch, then updates status to `'sent'`. On Vercel, two near-simultaneous POST requests (e.g. from a double-click or a retry) would both pass the `status === 'sent'` check before either has written the update. All active subscribers would receive the campaign twice.
- Fix: Replace the two-step read-then-update with an atomic conditional update: `UPDATE campaigns SET status = 'sent' WHERE id = $1 AND status = 'draft' RETURNING *`. If zero rows are returned, another request already sent it — return 409 immediately without calling `sendBatch`.

**Medium — Batch send does not handle partial chunk failures**
- File: `lib/email.ts:47`
- Problem: `sendBatch` loops through 100-recipient chunks with `await`. If one chunk throws (e.g. Resend rate limit or network timeout), the subsequent chunks never execute, but `recipientCount` in the campaign is still set to the total subscriber count, masking how many actually received the email.
- Fix: Wrap each chunk in a try/catch, accumulate a `sentCount`, and update `recipientCount` with the actual sent total. Log or surface chunk errors.

**Medium — No test-send or preview before full send**
- File: `app/admin/(app)/campaigns/[id]/page.tsx`
- Problem: The only way to see the final rendered email is to send to all subscribers. There is no "send to myself" or preview-in-browser option.
- Fix: Add a "Send test email" button that accepts a single target email address and sends one copy via `sendEmail`, bypassing the batch and without updating campaign status.

---

## 9. Unsubscribe Flow

**Medium — "Invalid token" message says "has already been used"**
- File: `app/unsubscribe/page.tsx:79`
- Problem: The `invalid` result (no subscriber found with that token) displays: "This unsubscribe link is invalid or has already been used." Unsubscribe tokens are single-use-ish by design (they remain in DB but the subscriber is deactivated), so the "already been used" framing misleads legitimate users following a stale link.
- Fix: Change the `invalid` copy to "This unsubscribe link was not found. You may have already unsubscribed, or the link may have expired."

---

## 10. Form Validation

**High — `eventType` is not validated server-side against the enum**
- File: `app/api/events/route.ts:43`
- Problem: The POST handler checks `!eventType` but does not verify the value is one of `['social', 'workshop', 'class']`. An invalid value triggers a raw Postgres enum error rather than a clean 400 with a useful message.
- Fix: `if (!['social', 'workshop', 'class'].includes(eventType)) return NextResponse.json({ error: 'Invalid event type.' }, { status: 400 })`.

**Medium — `new Date(startDatetime)` is not validated before DB insert**
- File: `app/api/events/route.ts:59`
- Problem: If `startDatetime` is a string that doesn't parse as a valid date, `new Date(startDatetime)` returns `Invalid Date`. Drizzle will pass this to Postgres, which rejects it with a `invalid input syntax for type timestamp` error — a 500 rather than a 400.
- Fix: Validate `!isNaN(new Date(startDatetime).getTime())` before inserting and return 400 if invalid.

---

## 11. Error Handling

**High — Unhandled DB errors in API routes expose stack traces in development**
- Files: `app/api/events/route.ts`, `app/api/campaigns/route.ts`, `app/api/instructors/route.ts` (and others)
- Problem: Database calls outside of `POST` (which has specific conflict handling) have no `try/catch`. In development, Next.js will surface the full error to the client. In production, Next.js returns a generic 500, but the error is unlogged. For operational visibility and clean error responses, DB calls should be caught.
- Fix: Wrap the DB operation in each handler with `try/catch`, log with `console.error`, and return a clean `{ error: 'Database error.' }` with 500.

**Medium — `lib/storage.ts` initializes S3 client at module scope with `!` assertions**
- File: `lib/storage.ts:4`
- Problem: `new S3Client({ region: process.env.AWS_REGION! })` runs at import time. If `AWS_REGION` is undefined (but `isStorageConfigured()` somehow passes), the S3Client is constructed with `undefined` for region and will produce confusing runtime errors on first use.
- Fix: Add a guard function `getS3Client()` that creates the client lazily and validates all required vars, or move the client initialization inside each exported function.

---

## 12. Accessibility

**Medium — Pink-600 on white fails WCAG AA contrast ratio**
- Files: Button styles throughout (`bg-pink-600 text-white` on white backgrounds in forms and cards)
- Problem: `#db2777` (pink-600) on white (`#ffffff`) has a contrast ratio of approximately 3.1:1, below the WCAG 2.1 AA minimum of 4.5:1 for normal text. This affects the pink pill badges (event type labels, status badges) that use `text-pink-700` on `bg-pink-50`.
- Fix: For small text in badges, use `text-pink-800` (`#9d174d`) on `bg-pink-50`, which achieves 4.9:1. White text on `bg-pink-600` for buttons is close to compliant for large/bold text (3:1 required) but should move to `bg-pink-700` for full compliance.

**Low — Admin data tables lack `scope` on `<th>` and have no `<caption>`**
- Files: Admin events, instructors, subscribers, campaigns pages
- Problem: `<th>` elements have no `scope="col"` attribute, and tables have no `<caption>` or `aria-labelledby`. Screen readers may have difficulty associating headers with data cells.
- Fix: Add `scope="col"` to all `<th>` elements. Optionally add a visually hidden `<caption>` describing the table.

**Low — `window.confirm()` in delete/send actions is inaccessible on some platforms**
- Files: `components/admin/DeleteButton.tsx:23`, `components/admin/CampaignSendButton.tsx:9`
- Problem: `window.confirm()` is blocked in some embedded browsers and mobile WebViews. It also has no styling and breaks keyboard flow on some screen readers.
- Fix: Replace with an inline confirmation state (show "Are you sure? Yes / Cancel" inline) or a small modal.

---

## 13. Mobile Responsiveness

**High — Admin data tables are not horizontally scrollable**
- Files: `app/admin/(app)/events/page.tsx:47`, `app/admin/(app)/instructors/page.tsx`, `app/admin/(app)/subscribers/page.tsx`, `app/admin/(app)/campaigns/page.tsx`
- Problem: Tables are wrapped in a `div` with `overflow-hidden`. On narrow screens, the action column (Edit/Delete buttons) can be pushed off-screen or clipped, making it impossible to edit or delete records without a wider viewport.
- Fix: Change the wrapping `div` to `overflow-x-auto` instead of `overflow-hidden`.

**Medium — Admin mobile nav (7 tabs) overflows with no scroll affordance**
- File: `components/admin/AdminNav.tsx:96`
- Problem: The mobile top bar uses `overflow-x-auto` which allows scrolling, but there is no visual indicator (fade, shadow, or chevron) that more tabs exist beyond the viewport. On a 375px screen, 7 nav tabs are unlikely to all be visible, and users may not know to scroll.
- Fix: Add a right-edge fade gradient (CSS `mask-image` linear-gradient) to hint at horizontal overflow.

---

## 14. Environment Variable Handling

**Medium — `SESSION_SECRET` placeholder in `.env.example` is not clearly dangerous**
- File: `.env.example:18`
- Problem: The placeholder `change-me-to-a-random-32-char-string` is a valid 36-character string that iron-session will accept without error. A developer who forgets to replace it will have a working but insecure session secret that is identical across all instances using this default.
- Fix: Change the placeholder to something that would cause an obvious failure if used as-is (e.g. a comment or an empty value) and add a note that the value must be generated fresh (e.g. `openssl rand -hex 32`).

**Medium — `NEXT_PUBLIC_APP_URL` defaults to `localhost` in production code paths**
- Files: `lib/social-copy.ts:25`, `app/api/campaigns/[id]/send/route.ts:51`
- Problem: Both files fall back to `'https://nashvillezouk.com'` when `NEXT_PUBLIC_APP_URL` is not set, while `lib/email.ts` uses `process.env.NEXT_PUBLIC_APP_URL!` without a fallback. If the var is missing in production, email unsubscribe links will contain the literal `undefined` string.
- Fix: Ensure `NEXT_PUBLIC_APP_URL` is set in the Vercel environment and add a startup assertion or a consistent fallback to `'https://nashvillezouk.com'` everywhere it is used.

**Low — No startup validation of required environment variables**
- Problem: The app silently degrades (mock mode) for missing DB config, but crashes with unhelpful `TypeError: Cannot read properties of undefined` for missing AWS or session vars. There is no single place that validates all required vars at startup.
- Fix: Add a `lib/config.ts` that asserts all required vars on first import in production (`process.env.NODE_ENV === 'production'`), with clear error messages per missing var.

---

## 15. Deployment Readiness for Vercel

**Medium — No database migration runbook**
- Problem: The `drizzle.config.ts` is configured for `drizzle-kit push` or `drizzle-kit migrate`, but there is no `README` section, `Makefile` target, or documented process for running migrations against the Neon production database before deploying a new version. A deploy without running migrations will result in runtime DB errors.
- Fix: Add a `## Deployment` section to `README.md` with the exact commands for first-time setup (`npx drizzle-kit push`) and future migrations, plus a note about running them before promoting a build.

**Medium — No rate limiting on the public subscribe endpoint**
- File: `app/actions/subscribe.ts`
- Problem: The public email signup form has no rate limiting. An automated script could add thousands of fake email addresses. The DB `UNIQUE` constraint prevents exact duplicates, but unique-per-variant addresses (e.g. `attacker+1@example.com`) would all insert.
- Fix: Add IP-based rate limiting via Vercel's Edge middleware or a lightweight in-memory counter in the server action. For a small site, returning a generic success on the 5th+ submission from the same IP within a time window is sufficient.

**Low — `next.config.ts` does not disable the `X-Powered-By` header**
- File: `next.config.ts`
- Problem: Next.js sends `X-Powered-By: Next.js` by default, advertising the framework version to potential attackers.
- Fix: Add `poweredByHeader: false` to the `nextConfig` object.

**Low — No Content Security Policy**
- Problem: There are no CSP headers set via `next.config.ts` headers or middleware. While there is no user-generated HTML rendered directly, adding a basic CSP (restricting scripts to `'self'` and the Umami domain) is a low-effort hardening step.
- Fix: Add a `headers()` function in `next.config.ts` with a `Content-Security-Policy` header for production.

---

## Prioritized Fix Order

### Fix before first public use
1. **[Blocker]** Add server-side file size limit to upload routes
2. **[Blocker]** Fix campaign send race condition with atomic DB update
3. **[High]** Make admin tables `overflow-x-auto`
4. **[High]** Add `eventType` enum validation to events POST
5. **[High]** Add try/catch to all DB calls in API routes

### Fix before significant traffic
6. **[High]** Extract `isDbConfigured()` to shared module
7. **[High]** Restrict `PUT /api/flyers/[id]` to an explicit field allowlist
8. **[Medium]** Filter `getEventBySlug` by `isPublished: true`
9. **[Medium]** Add server-side file size check in `isStorageConfigured()`
10. **[Medium]** Add rate limiting to the subscribe server action
11. **[Medium]** Fix campaign send for partial batch failures
12. **[Medium]** Add deployment/migration runbook to README

### Polish before wider launch
13. **[Medium]** Add test-send to campaigns
14. **[Medium]** Fix `SESSION_SECRET` placeholder in `.env.example`
15. **[Medium]** Fix flyer archive link to use event slug
16. **[Low]** Add `scope="col"` to table headers
17. **[Low]** Fix pink contrast ratios in badges
18. **[Low]** Replace `window.confirm()` with inline confirmation
19. **[Low]** Add `poweredByHeader: false` to `next.config.ts`
20. **[Low]** Delete unused `getPresignedUploadUrl` function
