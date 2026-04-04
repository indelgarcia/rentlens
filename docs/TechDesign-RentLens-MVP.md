# RentLens - Technical Design Document (MVP)

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   USER BROWSER                   │
│              (Next.js + Tailwind CSS)            │
│                                                  │
│  Landing Page → Input Form → Results Dashboard   │
└──────────────────────┬──────────────────────────┘
                       │ API calls (REST)
                       ▼
┌─────────────────────────────────────────────────┐
│               PYTHON BACKEND (FastAPI)           │
│                  Hosted on Railway               │
│                                                  │
│  /api/evaluate  ──→  Orchestrates all scoring    │
│                      ├─ Market Value Calculator  │
│                      ├─ Safety Score Calculator  │
│                      └─ Commute Calculator       │
└──────┬──────────┬──────────────┬────────────────┘
       │          │              │
       ▼          ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Supabase │ │ NYC Open │ │ Google Maps  │
│ (HUD FMR │ │ Data API │ │ Routes API   │
│  + cache) │ │ (Crime)  │ │ (Commute)    │
└──────────┘ └──────────┘ └──────────────┘
```

**Pattern:** Client → API → External Services. The frontend sends listing details to a single backend endpoint, which fans out to multiple data sources, computes scores, and returns a unified response.

## 2. Tech Stack

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Frontend** | Next.js 14 (App Router) | React-based, file-based routing, easy Vercel deploy, huge ecosystem |
| **Styling** | Tailwind CSS | Utility-first, fast to build, responsive out of the box |
| **Backend** | Python + FastAPI | You know Python, FastAPI is modern/fast, great for learning APIs |
| **Database** | Supabase (Postgres) | Free tier (500MB), real SQL, you'll learn DB concepts hands-on |
| **Hosting (FE)** | Vercel | Free tier, auto-deploys from GitHub, built for Next.js |
| **Hosting (BE)** | Railway | Free tier ($5/mo credit), simple FastAPI deployment |
| **Maps** | Google Maps Routes API | $200/mo free credit (legacy Distance Matrix), reliable transit data |
| **Crime Data** | NYC Open Data (SODA API) | Free, official NYPD data, no auth required for basic queries |
| **Rent Data** | HUD Fair Market Rents | Free, official, downloadable CSV → stored in Supabase |

## 3. Project Structure

```
rentlens/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── page.tsx          # Landing page + input form
│   │   ├── results/
│   │   │   └── page.tsx      # Results dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Tailwind imports
│   ├── components/
│   │   ├── ListingForm.tsx    # Input form component
│   │   ├── ScoreCard.tsx      # Reusable score display
│   │   ├── CommuteCard.tsx    # POI commute results
│   │   └── CollapsibleSection.tsx
│   ├── lib/
│   │   └── api.ts            # Backend API calls
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/                  # FastAPI app
│   ├── app/
│   │   ├── main.py           # FastAPI app + routes
│   │   ├── routers/
│   │   │   └── evaluate.py   # /api/evaluate endpoint
│   │   ├── services/
│   │   │   ├── market_value.py   # HUD FMR lookup + comparison
│   │   │   ├── safety.py         # NYC Open Data crime scoring
│   │   │   └── commute.py        # Google Maps distance/time
│   │   ├── models/
│   │   │   ├── request.py    # Pydantic input models
│   │   │   └── response.py   # Pydantic response models
│   │   └── config.py         # Environment variables
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.json
│
├── docs/                     # Project documentation
│   ├── research-apartment-hunt.txt
│   ├── PRD-RentLens-MVP.md
│   └── TechDesign-RentLens-MVP.md
│
├── .gitignore
└── README.md
```

## 4. Feature Implementation

### 4.1 Listing Input Form

**What you'll learn:** Frontend forms, form validation, API integration

**How it works:**
1. User fills out a form on the landing page
2. Fields: address (with Google Places Autocomplete), rent, beds, baths, sq ft, lease length, amenities (checkboxes)
3. Separate section for POIs: label + address, up to 5
4. On submit, frontend sends a POST request to `/api/evaluate`
5. Loading state shown while backend processes

**Key tech:**
- Next.js form handling (React state or form library)
- Google Places Autocomplete for address fields (free within Maps credit)
- Client-side validation before sending to backend

### 4.2 Market Value Rating

**What you'll learn:** Database queries, data comparison logic

**How it works:**
1. HUD publishes Fair Market Rents by ZIP code and bedroom count (annually)
2. We download this data and store it in Supabase as a lookup table
3. When user submits: look up FMR for their ZIP + bedroom count
4. Calculate: `((user_rent - fmr) / fmr) * 100` = percentage above/below
5. Return: percentage, color code, comparison context

**Data flow:**
```
User inputs: $2,500/mo, 1BR, ZIP 11101 (Astoria)
→ Supabase lookup: FMR for 1BR in ZIP 11101 = $2,200
→ Calculation: (2500 - 2200) / 2200 = 13.6% above market
→ Display: "13.6% above market value" (red)
```

**Supabase table: `fair_market_rents`**
```sql
CREATE TABLE fair_market_rents (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(5) NOT NULL,
  borough VARCHAR(20),
  neighborhood VARCHAR(100),
  efficiency INT,     -- Studio FMR
  one_br INT,         -- 1BR FMR
  two_br INT,         -- 2BR FMR
  three_br INT,       -- 3BR FMR
  four_br INT,        -- 4BR FMR
  fiscal_year INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Area Safety Rating

**What you'll learn:** External APIs, data aggregation, scoring algorithms

**How it works:**
1. NYC Open Data has crime complaint data with coordinates and precinct
2. When user submits an address, geocode it (Google Maps) to get lat/lng
3. Query NYC Open Data SODA API for crime incidents within a radius of that location
4. Count incidents by severity, calculate a weighted score (0-100)
5. Higher score = safer

**SODA API query example:**
```
https://data.cityofnewyork.us/resource/qb7u-rbmr.json?
  $where=within_circle(location, {lat}, {lng}, 1000)
  &$select=count(*) as total, law_cat_cd
  &$group=law_cat_cd
```

**Scoring logic:**
```python
# Weight crimes by severity
weights = {
    "FELONY": 3,
    "MISDEMEANOR": 2,
    "VIOLATION": 1
}
# Calculate weighted crime count per capita/area
# Normalize to 0-100 scale (100 = safest)
# Compare against city-wide average
```

**Supabase table: `crime_cache`** (optional, to reduce API calls)
```sql
CREATE TABLE crime_cache (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(5) NOT NULL,
  precinct VARCHAR(10),
  felonies INT,
  misdemeanors INT,
  violations INT,
  safety_score INT,
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 POI Commute Calculator

**What you'll learn:** Google Maps API, async API calls, data formatting

**How it works:**
1. User provides listing address + up to 5 POI addresses
2. Backend sends listing address as origin, all POIs as destinations
3. Google Maps Routes API returns transit time, walking time, distance
4. Format and return results sorted by transit time

**API call:**
```python
import googlemaps

gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

# For each POI, get transit and walking times
result = gmaps.distance_matrix(
    origins=[listing_address],
    destinations=[poi_address],
    mode="transit",
    region="us"
)
```

**Response shape:**
```json
{
  "commutes": [
    {
      "label": "Work - 350 5th Ave",
      "transit_time": "23 min",
      "walking_time": "48 min",
      "distance": "3.2 mi"
    }
  ]
}
```

### 4.5 Results Dashboard

**What you'll learn:** Component composition, responsive design, state management

**Layout:**
```
┌─────────────────────────────────────────┐
│  RentLens Results: 123 Main St, Astoria │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐ ┌──────────┐ ┌────────┐ │
│  │ MARKET    │ │ SAFETY   │ │ COMMUTE│ │
│  │ +13.6%    │ │ 72/100   │ │ 23 min │ │
│  │ above mkt │ │ Moderate │ │ to work│ │
│  └───────────┘ └──────────┘ └────────┘ │
│                                         │
│  ▼ Market Value Details (collapsible)   │
│  ▼ Safety Breakdown (collapsible)       │
│  ▼ All Commute Times (collapsible)      │
│  ▼ Methodology (collapsible)            │
│                                         │
│  [ Evaluate Another Listing ]           │
└─────────────────────────────────────────┘
```

## 5. API Design

### Single Endpoint: `POST /api/evaluate`

**Request:**
```json
{
  "address": "30-15 Hobart St, Astoria, NY 11102",
  "rent": 2500,
  "bedrooms": 1,
  "bathrooms": 1,
  "sqft": 650,
  "lease_length": 12,
  "amenities": ["elevator", "laundry_in_building", "dishwasher"],
  "pois": [
    { "label": "Work", "address": "350 5th Ave, New York, NY 10118" },
    { "label": "Gym", "address": "21-09 Broadway, Astoria, NY 11106" }
  ]
}
```

**Response:**
```json
{
  "address": "30-15 Hobart St, Astoria, NY 11102",
  "market_value": {
    "score_pct": 13.6,
    "label": "above market value",
    "color": "red",
    "fmr": 2200,
    "user_rent": 2500,
    "comparison_basis": "1BR in ZIP 11102 (FY2026 HUD FMR)"
  },
  "safety": {
    "score": 72,
    "label": "Moderate",
    "color": "yellow",
    "details": {
      "felonies": 45,
      "misdemeanors": 120,
      "violations": 200,
      "radius_meters": 1000,
      "data_period": "Last 12 months"
    }
  },
  "commutes": [
    {
      "label": "Work",
      "address": "350 5th Ave, New York, NY 10118",
      "transit_time": "23 min",
      "walking_time": "48 min",
      "distance_miles": 3.2
    },
    {
      "label": "Gym",
      "address": "21-09 Broadway, Astoria, NY 11106",
      "transit_time": "8 min",
      "walking_time": "15 min",
      "distance_miles": 0.6
    }
  ]
}
```

## 6. Database Schema (Supabase)

```sql
-- Fair Market Rents (pre-loaded from HUD data)
CREATE TABLE fair_market_rents (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(5) NOT NULL,
  borough VARCHAR(20),
  efficiency INT,
  one_br INT,
  two_br INT,
  three_br INT,
  four_br INT,
  fiscal_year INT DEFAULT 2026,
  UNIQUE(zip_code, fiscal_year)
);

-- Crime data cache (populated on first query, refreshed periodically)
CREATE TABLE crime_cache (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(5) NOT NULL,
  felonies INT DEFAULT 0,
  misdemeanors INT DEFAULT 0,
  violations INT DEFAULT 0,
  safety_score INT,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(zip_code)
);

-- Indexes for fast lookups
CREATE INDEX idx_fmr_zip ON fair_market_rents(zip_code);
CREATE INDEX idx_crime_zip ON crime_cache(zip_code);
```

## 7. External API Details

### NYC Open Data (SODA API)
- **Endpoint:** `https://data.cityofnewyork.us/resource/qb7u-rbmr.json`
- **Auth:** None required for basic queries (throttled to 1000 req/hr)
- **App token:** Optional, increases rate limit. Free to register.
- **Data:** NYPD crime complaint data with lat/lng, severity, date

### Google Maps Platform
- **APIs needed:** Distance Matrix (or Routes), Places Autocomplete, Geocoding
- **Auth:** API key (restricted to your domains)
- **Free credit:** $200/month (more than enough for portfolio traffic)
- **Note:** Distance Matrix is now Legacy; Routes API is the successor. Either works for this project.

### HUD Fair Market Rents
- **Source:** https://www.huduser.gov/portal/datasets/fmr.html
- **Format:** Downloadable CSV/Excel
- **Update frequency:** Annually (FY2026 effective Oct 2025)
- **Approach:** Download once, load into Supabase, update yearly

## 8. Development Plan (Build Order)

### Phase 1: Foundation
1. Set up Next.js project with Tailwind
2. Set up FastAPI project
3. Set up Supabase project and create tables
4. Load HUD FMR data into Supabase
5. Basic landing page with form UI

### Phase 2: Core Features (one at a time)
6. Market Value Rating (Supabase query + calculation)
7. Safety Score (NYC Open Data API + scoring logic)
8. POI Commute Calculator (Google Maps API)
9. Results Dashboard (display all scores)

### Phase 3: Polish
10. Mobile responsive styling
11. Error handling and loading states
12. Form validation
13. Collapsible sections on results page

### Phase 4: Deploy
14. Deploy backend to Railway
15. Deploy frontend to Vercel
16. Connect to production Supabase
17. Test end-to-end on deployed app

## 9. Environment Variables

### Backend (.env)
```
GOOGLE_MAPS_API_KEY=your_key_here
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
NYC_OPEN_DATA_APP_TOKEN=optional_token
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000  (dev)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here  (for Places Autocomplete)
```

## 10. Cost Breakdown

| Service | Free Tier | When You'd Pay |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth, unlimited deploys | >100GB bandwidth/mo |
| Railway | $5/mo credit (covers small FastAPI) | If credit exhausted |
| Supabase | 500MB DB, 50K auth users | >500MB database |
| Google Maps | $200/mo free credit | >$200/mo in API calls |
| NYC Open Data | Unlimited (with app token) | Never |
| HUD FMR | Free download | Never |

**Estimated monthly cost for portfolio project: $0**

## 11. Scaling Path (Future)

| Users | What Changes |
|-------|-------------|
| 1-100 | Nothing. Free tiers handle this easily. |
| 100-1K | Add crime_cache table to reduce NYC Open Data calls |
| 1K-10K | Railway Pro plan ($20/mo), Supabase Pro ($25/mo) |
| 10K+ | Add Redis caching, consider dedicated DB, rate limiting |

## 12. Limitations & Tradeoffs

| Limitation | Why It's OK for MVP |
|------------|-------------------|
| HUD FMR is annual, not real-time | Directional accuracy is sufficient; most renters just need ballpark |
| Crime data may lag by weeks | Still better than no safety info; cache reduces API load |
| Google Maps API has usage caps | Portfolio project traffic is minimal |
| No user accounts | Keeps it simple; save/compare is v2 |
| NYC only | Focused scope = better execution |
| Supabase free tier pauses after 1 week inactivity | Can ping periodically or upgrade if needed |
