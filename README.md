# FLCut - Finite Loop Club Link Shortener

Reference build id: FLC-FLCut-2627-Trace-visible

Hey there! This is my submission for the Round 1 Build Challenge. Here's a breakdown of how I approached building this and the reasoning behind my decisions.

## What's my data model, and why did I design it that way?

I decided to split the database into two main tables: `Link` and `Click`.

- **`Link` table**: This handles the core configuration. It stores the `slug`, `originalUrl`, scheduling stuff (`startsAt`, `expiresAt`), and a `clicks` counter. 
- **`Click` table**: This logs the actual analytics events. Every time a valid user hits a link, I create a record here with their `ip`, `device`, and `referrer`.

**Why?** I wanted to keep the reads fast for the main dashboard. By keeping a simple integer `clicks` counter on the `Link` table, I don't have to run an expensive `COUNT()` query on the `Click` table every time the dashboard loads. The `Click` table acts as an append-only log that we can query heavily later when we actually want to draw time-series charts or figure out if a spike came from Instagram or WhatsApp.

## If I only had 4 hours, what would I have built first, and what would I cut?

**What I'd build first:**
The absolute core loop: paste a long URL -> generate a random 6-character nanoid slug -> save to DB -> redirect when visited. That's the bare minimum for it to be a link shortener.

**What I'd cut:**
I would immediately cut the custom aliases and the scheduling features (`startsAt`/`expiresAt`). Handling custom alias collisions and ensuring reserved words aren't taken takes time to get right. Scheduling requires extra logic in the middleware/routing layer. I'd also cut the detailed analytics (the `Click` table) and just stick to a dumb `+1` counter on the main link table.

## Name one tradeoff you made and what you gave up.

**The tradeoff:** I prioritized a rock-solid, functional backend (catching reserved words, handling async Prisma 7 quirks, basic bot exclusion) over building a flashy, detailed analytics dashboard on the frontend.

**What I gave up:** The dashboard right now only shows the total click count. Even though the database is actively capturing rich data (device types, referrers, IPs), the user interface to visualize that time-series data isn't there yet. I figured it was better to reliably *collect* the data first rather than build a pretty chart with broken or missing underlying data.

## What did I assume because this PRD didn't tell me?

The PRD left a few things intentionally blank, so here's how I filled the gaps:

1. **Authentication**: The PRD didn't mention logins. I assumed that since FLC is a tight-knit club running fast-paced events, speed is key. Having to log in to create a link is friction. So, I left it open for the MVP. If people start abusing it, we can easily slap a simple password or NextAuth on top later.
2. **"Unique" Clicks**: There is no universal definition of a unique click. I decided to define it as a unique IP address per link. I know college Wi-Fi can share IPs (NAT), so it's not 100% perfect, but it's a "good enough" proxy to stop one guy mashing refresh from ruining the stats.
3. **Expired Link Analytics**: What happens if someone clicks an expired link? I assumed that we shouldn't count that as a valid analytic event. If a hackathon registration is closed, and someone clicks the link on an old WhatsApp forward, logging that click just pollutes our data on what channels successfully drove *active* event traffic. We just show them the expired message and move on.

---

### Tech Stack Used
- Next.js 16 (App Router)
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM 7 (with `@prisma/adapter-pg`)
- Tailwind CSS v4
