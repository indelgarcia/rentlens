# RentLens — Backlog & Deferred Work

Items deferred from active development. Review before starting Phase 3.

---

## High Impact

### Replace HUD FMR with Actual Market Average Rent
**Why deferred:** No free API for NYC market-average rent exists today. Current implementation uses HUD FMR (40th percentile affordability benchmark), which is lower than Zillow/StreetEasy median prices by design.

**Goal:** Show comparison against true market average (median asking rent for same bedrooms + ZIP), not a federal housing voucher floor.

**Candidate data sources to evaluate:**
- **RentCast API** — has a free tier (100 req/mo), provides median rent by ZIP + bedroom count for NYC. Most promising option.
- **Zillow Research data** — publishes historical CSV datasets (free, updated monthly). Could seed a new `market_rents` table similar to how HUD FMR was seeded. No real-time API needed.
- **StreetEasy** — NYC-specific, most accurate for NYC market, but no public API.

**What needs to change:**
- New Supabase table or data source for market-average rents by ZIP + bedroom
- Update `backend/app/services/market_value.py` to query new source
- Update labels (currently "above/below HUD benchmark" → "above/below market average")
- Remove the 40th-percentile disclaimer from `ResultsPanel.tsx`

---

### Commute Map Visualization
**Why deferred:** Requires Google Maps JavaScript API (browser-side) or Static Maps API. Need to evaluate API cost before implementing.

**Goal:** Show a small map thumbnail per commute card with the transit route (train/bus) highlighted.

**Cost analysis needed:**
- Static Maps API: ~$2 per 1,000 requests. At 3 POIs per evaluation, adds $0.006/evaluation.
- Maps JavaScript API: free for embedded maps (pay-per-use only for certain features like directions rendering).
- Dynamic Maps embed (iframe): free, no API key required, but limited styling control.

**Simplest approach:** Use Google Maps Static API to render a route image for each commute card. One additional API call per POI per evaluation (not batched).

**Also consider:** Showing the subway line (e.g. "N/Q/R train") as a text hint. The Distance Matrix API does not return this, but the Directions API does — would require an additional call per POI.

---

## Medium Impact

### Phase 3 Polish (from AGENTS.md)
- Form validation improvements (e.g. warn if ZIP not in NYC before submitting)
- Better loading states — skeleton UI on results cards while evaluating
- Mobile responsive styling audit
- Collapsible sections on results panel (e.g. hide crime breakdown by default)
- Methodology footnotes (expandable "How is this calculated?" per card)

### NYC Open Data App Token
- `NYC_OPEN_DATA_APP_TOKEN` in `.env` is currently empty
- Adding a free token increases SODA API rate limit from 1,000 to 1,000,000 req/day
- Register at: https://data.cityofnewyork.us/profile/app_tokens

---

## Low Impact / Phase v2

### Saved Searches & History
- Out of scope for MVP. Would require user accounts (auth).
- Deferred to v2.

### Share a Result (URL-based)
- Currently results live in sessionStorage — no shareable link
- Option: encode result as base64 URL param, or persist to Supabase with a short ID
- Deferred to v2.

### Listing Search Integration
- Auto-populate form from a StreetEasy/Zillow URL
- Requires web scraping or paid API access
- Deferred to v2.

---

## Technical Debt

### Remove `/results` Route
- The `/results/page.tsx` route was the original separate-page flow. Now that results display inline on the home page, `/results` is only used as a fallback for direct URL access via sessionStorage.
- Can be removed when the inline flow is confirmed stable, or kept as a "share this result" feature.

### Upgrade `results/page.tsx` sessionStorage Flow
- If `/results` is kept, it should write to sessionStorage only as a fallback. Currently `EvaluateForm.tsx` still writes to sessionStorage on every submission as a side effect.

### Add NYC ZIP validation on frontend
- The backend returns 404 for non-NYC ZIPs, but showing a client-side warning before making the API call would be a better UX.
