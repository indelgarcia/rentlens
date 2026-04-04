# Product Requirements - RentLens

## Features (MVP)

### 1. Listing Input Form
- Address with autocomplete (Google Places)
- Monthly rent (required)
- Bedrooms / Bathrooms (required)
- Square footage (optional)
- Lease length (optional, default 12)
- Amenities: laundry in-unit, laundry in-building, dishwasher, doorman, elevator, gym, rooftop, parking, pet-friendly, outdoor space, central AC, utilities included
- Custom POIs: label + address, up to 5
- Form completable in under 60 seconds

### 2. Market Value Rating
- Percentage above/below market value
- Color coded: green (below), yellow (at), red (above)
- Shows comparison basis (e.g., "vs 1BR in ZIP 11102")
- Data: HUD Fair Market Rents stored in Supabase

### 3. Area Safety Rating
- Score 0-100 (100 = safest)
- Color coded by severity
- Based on NYPD crime data (felonies, misdemeanors, violations)
- Shows data period and methodology
- Data: NYC Open Data SODA API

### 4. POI Commute Calculator
- Transit time, walking time, distance for each POI
- Sorted by transit time
- Supports up to 5 custom POIs
- Data: Google Maps Distance Matrix API

### 5. Results Dashboard
- Three core scores displayed prominently at top (expanded)
- Additional details in collapsible sections
- "Evaluate Another Listing" button
- All scores load within 5 seconds
- Mobile responsive

## V2 Features (NOT in MVP)
- Things to do / lifestyle score
- Save & compare multiple listings
- Lookup history
- User accounts
- Neighborhood deep-dive pages
- AI-generated summaries

## Success Criteria
- Short term: bug-free, all scores work correctly
- Medium term: friends/portfolio reviewers are impressed
