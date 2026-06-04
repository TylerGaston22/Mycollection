# Service config reference (Vercel + Supabase)

Plain-English notes on each Vercel and Supabase setting we've touched (or might touch), what it does, and when you'd actually change it. Reference, not a procedure — see [todo.md](./todo.md) for the actual launch checklist.

Newest sections at the top. Update as we adopt new services.

---

## Vercel

### Account
- **Plan** — Hobby is free, fine for solo / small projects. Pro tier unlocks higher build minutes, longer function timeouts, password-protected previews, and team seats. You don't need it until you hit a Hobby cap.
- **Sign-in method** — you signed in with email + password, not GitHub. Either works; the GitHub flow is convenient because it auto-links your repos for one-click import. You can still connect GitHub later from **Settings → Integrations**.

### Project → General
- **Production Branch** — the git branch that auto-deploys to your live URL when you push. Default `main`. Don't change unless you start using a `production` branch convention.
- **Build Command** — auto-detected from the framework preset. For Vite this is `npm run build`. Override only if you have a custom build step.
- **Output Directory** — where Vercel grabs static files from after the build. Vite defaults to `dist/`. Project was set to `build/` and caused a deploy failure — see [errors.md](./errors.md).
- **Install Command** — defaults to `npm install`. Change to `pnpm install` / `yarn install` if you switch package managers.
- **Node.js Version** — currently 24.x (latest LTS). Bump only when you need a new Node feature; older LTS (20.x) is also stable.

### Project → Domains
- **Default domain** — Vercel gives you a free `*.vercel.app` subdomain (you have `mycollection-nine.vercel.app`). Always available, ugly URL.
- **Custom domain** — buy one (via Vercel or any registrar like Namecheap / Cloudflare) and point it here. Requires DNS records that Vercel walks you through. Free SSL via Let's Encrypt is automatic.
- **Preview deployments** — every PR / non-main branch push gets its own unique `*.vercel.app` URL automatically. Useful for review without touching production.

### Project → Environment Variables
- One row per env var, scoped to Production / Preview / Development environments independently.
- **Production** — used by the live build.
- **Preview** — used by every preview deployment. Usually same values as Production, but you might use a separate "staging" Supabase project here.
- **Development** — only used by `vercel dev` locally. If you run `npm run dev` against a local `.env`, you don't need this.
- **Sensitive vs Plaintext** — toggle the lock icon. Sensitive values are encrypted at rest and not shown in the UI again after save. Plaintext (default) is fine for `VITE_*` vars since they end up in the client bundle anyway.

### Project → Deployments
- Every build (success or fail) lists here with its commit hash, branch, build duration, and logs.
- **Promote to Production** — manually mark any deployment as live. Useful for rollback: click an older successful deployment → Promote → live URL points back to it.

### Project → Settings → Build & Deployment
Most of what's on this page only applies to **serverless functions** (Vercel's backend lambdas). Pure static SPAs like this one don't use them, so:
- **Fluid Compute** — irrelevant for static sites. Ignore.
- **Function CPU / Memory** — irrelevant. Ignore.
- **Cold Start Prevention** — irrelevant. Ignore.
- **Function Region** — irrelevant (static content is served from Vercel's edge globally regardless).
- **Skew Protection** — when ON, in-flight client requests are pinned to the version of the app they originally loaded against. Mostly matters when you have a serverless backend whose API contract changes between deploys. Off is fine for a static SPA + external Supabase API.
- **Deployment Protection** — gates who can view preview URLs. "Standard" requires a Vercel login. Disable if you want previews publicly shareable.
- **On-Demand Concurrent Builds** — Pro feature; parallelize multiple builds at once. Hobby plan defaults this off.

### Project → Settings → Analytics / Speed Insights
- **Web Analytics** — free privacy-first page-view tracking. No cookies. Turn on if you want to see basic visitor counts without integrating a third party (Plausible / Fathom / GA).
- **Speed Insights** — free real-user performance metrics (LCP, CLS, etc.). Useful if you care about Core Web Vitals.

### Pricing reminders
- Hobby plan: 100 GB bandwidth/month, 6,000 build minutes/month, 1 concurrent build. Hard to hit for personal use.
- Bandwidth overages on Hobby = your site is throttled, not billed.

---

## Supabase

### Project → General
- **Pause inactivity** — free-tier projects pause after 7 days with no activity. You'll get an email; restart from the dashboard. Doesn't affect data.
- **Region** — set at project creation, can't be changed without a project migration. Pick one close to your users.

### Authentication → Sign In / Providers → Email
- **Confirm email** — when ON, new signups get an email with a confirm link they have to click before they can log in. Turn ON for production / public signups (blocks fake-email signups). Turn OFF during development for faster iteration. Currently OFF for our soft launch.
- **Secure email change** — when ON (default), email-change requests send confirmation to BOTH the old and new addresses. Anti-takeover measure. Leave ON in production.
- **Password requirements** — minimum length + character classes. Defaults are fine; tighten only if your threat model demands it.

### Authentication → URL Configuration
- **Site URL** — the base URL Supabase uses when building auth callback links (password reset, email confirm, magic links). Must be your live production URL or those links break. Was `localhost:5173` during dev; now `https://mycollection-nine.vercel.app`. NO wildcards allowed.
- **Redirect URLs** — allowlist of URLs Supabase is allowed to redirect to after auth. Supports wildcards (`https://yourdomain.com/**`). Add your production URL with `/**` so any path post-auth works. Add preview URLs (`https://*.vercel.app`) if you want previews to be testable. Without a matching entry, Supabase silently falls back to Site URL.

### Authentication → Rate Limits
- Per-IP defaults are generous (hundreds of requests/hour). Tighten only if you're seeing signup spam or want to be paranoid. Loosen only if you have legitimate burst traffic.

### Authentication → Email Templates
- Customize the HTML of the signup-confirm, password-reset, email-change, and magic-link emails. Templates support variables like `{{ .ConfirmationURL }}` and `{{ .SiteURL }}`. Default templates are functional but plain — customize for branded look-and-feel.

### Authentication → SMTP Settings
- **Built-in SMTP** — Supabase sends emails for you, capped at ~30 emails/hour on the free tier. Fine for solo / small projects.
- **Custom SMTP** — plug in SendGrid / Postmark / Resend / your own SMTP. Required if you exceed the built-in cap. Costs scale with email volume.

### Authentication → Hooks (deferred topic)
- Custom Postgres functions that fire on auth events (signup, login, password change). Useful for syncing user data to other systems or enforcing extra rules. Not needed for our app yet.

### Database → Tables
- Where you see / edit table data via the GUI. Honors RLS — if a query in the GUI returns nothing, you might be hitting RLS too. Use the SQL Editor as the `postgres` superuser (bypasses RLS) to debug.

### Database → Policies (RLS)
- Per-table list of row-level-security policies. Each policy specifies which operation (SELECT / INSERT / UPDATE / DELETE) it covers and a SQL expression that must be true for the row to be accessible to the current user. **Without RLS policies, every authenticated user can read everything in the table.** Always enable RLS on user-data tables.
- A common gotcha: a SELECT policy on a table that requires a JOIN to a second table where the user has no read permission causes the join to return zero rows. Add a permissive policy to the joined table too. See [errors.md](./errors.md) for our "Friend invite invisible to the recipient" case.

### Database → Backups
- **Free tier** — daily backups retained for 7 days. Auto-restored if you ask support.
- **Pro tier** — point-in-time recovery (recover to any second). Worth upgrading once your data is irreplaceable.
- **Manual backup** — `pg_dump` against the connection string. Cheap insurance for solo projects on the free tier.

### Database → SQL Editor
- Run arbitrary SQL as the `postgres` role (bypasses RLS). This is how we ship schema migrations (`supabase/*.sql` files).
- **Saved queries** — name and save common queries for reuse.

### Storage
- File buckets with their own RLS-like policies. We don't use this yet but will when implementing profile-picture upload (todo E).
- **Public buckets** — files served via a public URL, no auth required to read. Good for avatars, logos.
- **Private buckets** — files require a signed URL or an authenticated request. Good for user-private files.

### Logs / API logs
- Real-time log of every query against your project, with status code and duration. First place to look when "the app says it failed silently" — usually shows a 403/406 you can trace back to an RLS policy.

---

## Both — general principles
- **Anything client-facing is public.** `VITE_*` env vars end up in the browser bundle. The Supabase `anon` / `publishable_*` key is meant for the client and is safe to expose; the `service_role` key is NEVER safe in client code (full DB access, bypasses RLS).
- **Always test auth changes on the deployed URL, not localhost.** Email-link callbacks redirect to the Site URL — if that's localhost, the production user gets a broken link.
- **When something "silently doesn't work,"** check three layers in order: (1) browser console for errors, (2) Supabase logs for blocked queries, (3) Vercel build/runtime logs for deploy issues.
