# Tech Stack - RentLens

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 (App Router) | React framework, file-based routing |
| Tailwind CSS | 3.x | Utility-first CSS |
| TypeScript | 5.x | Type safety |

### Setup
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false
```

### Key Libraries
```bash
npm install @googlemaps/js-api-loader  # Google Places Autocomplete
```

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Backend language |
| FastAPI | 0.100+ | API framework |
| Uvicorn | 0.23+ | ASGI server |
| Pydantic | 2.x | Request/response validation |
| httpx | 0.25+ | Async HTTP client for external APIs |
| supabase-py | 2.x | Supabase Python client |
| googlemaps | 4.x | Google Maps API client |

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn pydantic httpx supabase googlemaps python-dotenv
pip freeze > requirements.txt
```

### Running
```bash
uvicorn app.main:app --reload --port 8000
```

## Database (Supabase)

| Detail | Value |
|--------|-------|
| Provider | Supabase (free tier) |
| Engine | PostgreSQL |
| Storage | 500MB (free) |
| Tables | fair_market_rents, crime_cache |

### Tables

```sql
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

CREATE INDEX idx_fmr_zip ON fair_market_rents(zip_code);
CREATE INDEX idx_crime_zip ON crime_cache(zip_code);
```

## External APIs

### Google Maps Platform
- **APIs:** Distance Matrix, Places Autocomplete, Geocoding
- **Auth:** API key (env var: GOOGLE_MAPS_API_KEY)
- **Free credit:** $200/month
- **Docs:** https://developers.google.com/maps

### NYC Open Data (SODA API)
- **Endpoint:** `https://data.cityofnewyork.us/resource/qb7u-rbmr.json`
- **Auth:** Optional app token (increases rate limit)
- **Free:** Unlimited with token
- **Docs:** https://dev.socrata.com/

### HUD Fair Market Rents
- **Source:** https://www.huduser.gov/portal/datasets/fmr.html
- **Format:** CSV download → load into Supabase
- **Update:** Annually (FY2026 effective Oct 2025)

## Hosting

| Service | What | Free Tier |
|---------|------|-----------|
| Vercel | Frontend hosting | 100GB bandwidth |
| Railway | Backend hosting | $5/mo credit |
| Supabase | Database | 500MB storage |

## Environment Variables

### Backend (.env)
```
GOOGLE_MAPS_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
NYC_OPEN_DATA_APP_TOKEN=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```
