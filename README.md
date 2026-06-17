# FLCut - Finite Loop Club Link Shortener


## What's my data model, and why did I design it that way?

I have decided to split the database into two main parts: `Link` and `Click`.

- **`Link` part**: This handles the core logic. It stores the `slug`, `originalUrl`, scheduling stuff (`startsAt`, `expiresAt`), and a `clicks` counter. 
- **`Click` table**: This logs the actual analytics events. Every time a valid user hits a link, it creates a record here with their `ip`, `device`, and `referrer`.

=> I wanted to keep the reads fast for the main dashboard. By keeping a simple integer `clicks` counter on the `Link` table, I don't have to run an expensive `COUNT()` query on the `Click` table every time the dashboard loads. 

## If I only had 4 hours, what would I have built first, and what would I cut?

**What I'd build first:**
i would build the absolute core logic i.e when you paste a long url it generates a the link with the slug that is provided and the using that link it redirects to to page we want to visit and then store the url inn the database where i used postgresql(NEON).

**What I'd cut:**
I would cut the features like the expiring of the link and the count of the number of clicks on the link.

## Name one tradeoff you made and what you gave up.

**The tradeoff:** I prioritized the working of the core logic than the frontend design

**What I gave up:** I gave the dashboard feature cause i think it was necessary at this point and i only focused on the logic and simple frontend design.

## What did I assume because this PRD didn't tell me?

The PRD left a few things intentionally blank, so here's how I filled the gaps:

1. **Authentication**: The PRD didn't mention login and logout. I assumed speed is what we require at this scenario. Having to log in to create a link takes a lot of time.
2. **Expired Link Analytics**: What happens if someone clicks an expired link?the link will be disabled that is the page says we cannot reach the page 
3. **What is unique click**: It is the number of clicks the users have clicked on the link.

---

### Tech Stack Used
- Next.js 16 (App Router)
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM 7 (with `@prisma/adapter-pg`)
- Tailwind CSS v4


