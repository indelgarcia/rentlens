# Project Brief - RentLens

## Vision
RentLens helps NYC apartment hunters evaluate any listing by providing market value comparison, neighborhood safety scores, and commute times to their important places — all in one dashboard.

## What RentLens IS
- A listing evaluator: user inputs a listing they found, gets scores back
- NYC-specific: all data and scoring is for New York City
- A portfolio project: should demonstrate full-stack skills, clean code, good UX

## What RentLens is NOT
- A listing search engine (user brings their own listing)
- A property management tool
- An application/lease platform
- Available outside NYC

## Core User Flow
1. User finds listing on StreetEasy/Zillow/Craigslist
2. User enters listing details + custom POIs into RentLens
3. RentLens returns market value rating, safety score, commute times
4. User makes a more informed decision

## Quality Gates
- All 3 core scores must work for any valid NYC address
- Results must load within 5 seconds
- Must be mobile responsive
- No hardcoded API keys
- Clean, minimal UI — let the data speak

## Key Constraints
- Free tier APIs preferred, ask before using paid APIs
- No user accounts in v1
- No save/compare/history in v1
- No AI-powered features in v1
- NYC addresses only
