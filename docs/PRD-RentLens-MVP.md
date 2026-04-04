# RentLens - Product Requirements Document (MVP)

## 1. Product Overview

| Field | Detail |
|-------|--------|
| **Product Name** | RentLens |
| **Tagline** | Know more about where your next chapter takes you. |
| **Goal** | Build a polished portfolio project that gives NYC renters instant insights on any listing they're evaluating |
| **Platform** | Web app (mobile responsive) |
| **Tech Stack** | Python backend, Supabase, modern frontend (TBD in Tech Design) |
| **Budget** | Free tier preferred, minimal spend if needed |
| **Timeline** | Portfolio project, no hard deadline |

## 2. Target Users

### Primary Persona: The NYC Apartment Hunter

- **Who:** Anyone actively looking at apartment listings in New York City
- **Frustration:** They find a listing on StreetEasy/Zillow/Craigslist but can't evaluate it without opening 5+ tabs (Google Maps for commute, crime maps for safety, Rentometer for pricing)
- **Tech-savviness:** Comfortable using web apps, accustomed to rental search sites
- **Need:** A single place to input a listing and get all the context that matters

### Secondary Personas
- Friends/family helping someone apartment hunt
- Portfolio reviewers / hiring managers evaluating the project

## 3. Problem Statement

Rental listing sites show you WHAT is available but not WHETHER it's a good deal, WHETHER the neighborhood is safe, or HOW FAR it is from the places you care about.

When lifestyle and money are on the line, renters deserve the privilege of knowing where their next chapter will take them. RentLens closes the information gap by turning any listing into a scored, contextualized evaluation.

## 4. User Journey

```
1. DISCOVER
   User is apartment hunting, finds a listing on StreetEasy/Zillow/etc.
   Wants to know: Is this rent fair? Is it safe? How far is my commute?
   Searches "fair rent NYC" or "apartment evaluation tool" → finds RentLens

2. LAND
   Sees clean landing page with:
   - App name and tagline
   - Brief explanation of what RentLens does
   - Prominent input form to get started
   No account required.

3. INPUT
   Enters listing details:
   - Address (autocomplete)
   - Monthly rent
   - Bedrooms / Bathrooms
   - Amenities (checkboxes)
   - Custom POIs (work address, friend's place, etc.)

4. EVALUATE
   Sees a results dashboard with:
   - Market Value Rating (prominent) — "8% above market value"
   - Safety Score (prominent) — "Safety: 72/100"
   - POI Commute Times (prominent) — "23 min transit to work"
   - Additional details in collapsible sections

5. DECIDE
   User now has the context to make an informed decision about this listing.
   Can go back and evaluate another listing.
```

## 5. MVP Features

### Feature 1: Listing Input Form

| Field | Detail |
|-------|--------|
| **What** | A form where users enter the details of a listing they found elsewhere |
| **User Story** | As a renter, I want to input a listing's details so I can get insights about it |
| **Inputs** | Address (with autocomplete), monthly rent, bedrooms, bathrooms, square footage (optional), lease length, amenities (checkboxes: laundry in-unit, laundry in-building, dishwasher, doorman, elevator, gym, rooftop, parking, pet-friendly, outdoor space, central AC, utilities included) |
| **Success Criteria** | User can fill out the form in under 60 seconds; address autocomplete works for NYC addresses |

### Feature 2: Market Value Rating

| Field | Detail |
|-------|--------|
| **What** | Shows whether the listing's rent is above, at, or below market value compared to similar units |
| **User Story** | As a renter, I want to know if the asking rent is fair so I can negotiate or prioritize accordingly |
| **Display** | Percentage indicator (e.g., "12% above market value"), color-coded (green = below, yellow = at, red = above), comparison basis shown (e.g., "compared to 1BR units in Astoria") |
| **Data Sources** | HUD Fair Market Rents by ZIP code, Rentometer API (if budget allows) |
| **Success Criteria** | Rating displayed for any valid NYC address; comparison methodology is transparent to the user |

### Feature 3: Area Safety Rating

| Field | Detail |
|-------|--------|
| **What** | A safety score (0-100) for the neighborhood where the listing is located |
| **User Story** | As a renter unfamiliar with a neighborhood, I want to know how safe it is so I can make an informed decision |
| **Display** | Numerical score (0-100), color-coded, with brief context (e.g., "Based on NYPD crime data for this precinct") |
| **Data Sources** | NYPD CompStat data, NYC Open Data crime datasets |
| **Success Criteria** | Score displayed for any valid NYC address; methodology is explained to the user |

### Feature 4: POI Commute Calculator

| Field | Detail |
|-------|--------|
| **What** | Shows transit time, walking time, and distance from the listing to user-defined points of interest |
| **User Story** | As a renter, I want to know how far my commute to work and other important places would be so I don't have to check Google Maps separately |
| **Inputs** | User enters 1+ POI addresses with labels (e.g., "Work - 350 5th Ave") |
| **Display** | For each POI: label, transit time, walking time, distance. Sorted by transit time |
| **Data Sources** | Google Maps Distance Matrix API |
| **Success Criteria** | Accurate commute times displayed; supports at least 5 custom POIs per evaluation |

### Feature 5: Results Dashboard

| Field | Detail |
|-------|--------|
| **What** | A single page displaying all scores and insights for the evaluated listing |
| **User Story** | As a renter, I want to see all insights at a glance so I can quickly evaluate this listing |
| **Layout** | Top section: the 3 core scores (market value, safety, commute) displayed prominently and expanded by default. Below: collapsible sections for additional details (methodology, data sources, neighborhood context) |
| **Actions** | "Evaluate Another Listing" button to return to input form |
| **Success Criteria** | All scores load within 5 seconds; page is readable on mobile; key scores visible without scrolling |

## 6. Success Metrics

### Short Term (1 month)
| Metric | Target |
|--------|--------|
| Functional completeness | All 3 core scores display correctly for any NYC address |
| Bug-free | No logic errors in scoring calculations |
| Responsiveness | Works on desktop and mobile browsers |

### Medium Term (3 months)
| Metric | Target |
|--------|--------|
| User impressions | Friends, family, and portfolio reviewers find it impressive and useful |
| Portfolio impact | Demonstrates full-stack skills, API integration, data processing |

## 7. Design Direction

| Aspect | Direction |
|--------|-----------|
| **Visual Style** | Clean and minimal — let the data speak |
| **Color Palette** | Neutral base with color-coded scores (green/yellow/red) |
| **Typography** | Modern, readable, professional |
| **Mental Model** | Familiar input → results pattern (like a search engine) |
| **Mobile** | Fully responsive, mobile-first where possible |

### Key Screens

1. **Landing Page** — App name, tagline, brief explainer, input form (or CTA to start)
2. **Input Form** — Could be on landing page or separate; listing details + POI inputs
3. **Results Dashboard** — All scores and insights for the evaluated listing

## 8. Technical Considerations

| Aspect | Requirement |
|--------|-------------|
| **Backend** | Python |
| **Database** | Supabase (Postgres) — store HUD FMR data, crime data for fast lookups |
| **APIs** | Google Maps Distance Matrix, NYC Open Data, HUD FMR |
| **Performance** | Results within 5 seconds of form submission |
| **Security** | API keys stored server-side, no sensitive data collected from users |
| **Hosting** | Free tier (Vercel, Railway, or similar) |
| **No Auth Required** | No user accounts for v1 |

## 9. Constraints

| Constraint | Detail |
|------------|--------|
| **Budget** | Free tier APIs preferred; Google Maps $200/mo free credit is sufficient |
| **Data Freshness** | HUD FMR is annual; crime data updates vary. Acceptable for v1 |
| **NYC Only** | All scoring and data is NYC-specific |
| **No Listing Data** | RentLens does not source or display listings — user provides listing details |

## 10. V2 Features (Not in MVP)

| Feature | Why It Can Wait |
|---------|----------------|
| Things to do / lifestyle score | Nice-to-have, not core to the evaluation |
| Save & compare multiple listings | Requires accounts/storage; core value works without it |
| Lookup history | Requires accounts/storage |
| User accounts | No need for v1 — evaluate and go |
| Neighborhood deep-dive pages | Bonus content, not core evaluation |
| Side-by-side comparison | Depends on save/history feature |

## 11. Definition of Done (Launch Checklist)

- [ ] Landing page with clear value proposition
- [ ] Input form accepts all listing fields + custom POIs
- [ ] Market value rating calculates and displays correctly
- [ ] Safety score calculates and displays correctly
- [ ] POI commute times calculate and display correctly
- [ ] Results dashboard shows all scores with proper layout
- [ ] Collapsible sections work for additional details
- [ ] Mobile responsive on common screen sizes
- [ ] No console errors or broken layouts
- [ ] Deployed to a public URL
