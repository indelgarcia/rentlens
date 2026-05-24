from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException

from app.config import supabase_client, NYC_OPEN_DATA_APP_TOKEN
from app.models.response import SafetyDetails, SafetyResult
from app.utils import extract_zip

_SODA_URL = "https://data.cityofnewyork.us/resource/5uac-w243.json"  # NYPD Complaints Current Year To Date
_GEOSEARCH_URL = "https://geosearch.planninglabs.nyc/v2/search"
_RADIUS_METERS = 1000
_CACHE_TTL_DAYS = 7


def _geocode(address: str) -> tuple[float, float]:
    """Returns (lat, lng) using NYC Planning's GeoSearch API — handles NYC-specific address formats."""
    try:
        resp = httpx.get(
            _GEOSEARCH_URL,
            params={"text": address, "size": "1"},
            timeout=10,
        )
        resp.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Geocoding service unavailable: {e}")

    features = resp.json().get("features", [])
    if not features:
        raise HTTPException(status_code=400, detail=f"Could not geocode address '{address}'. Try including the full street address with ZIP code.")

    # GeoJSON coordinates are [lng, lat]
    lng, lat = features[0]["geometry"]["coordinates"]
    return float(lat), float(lng)


def _query_soda(lat: float, lng: float) -> tuple[int, int, int]:
    where = f"within_circle(lat_lon, {lat}, {lng}, {_RADIUS_METERS})"
    params = {
        "$where": where,
        "$select": "law_cat_cd, count(*) as total",
        "$group": "law_cat_cd",
        "$limit": "10",
    }
    headers = {}
    if NYC_OPEN_DATA_APP_TOKEN:
        headers["X-App-Token"] = NYC_OPEN_DATA_APP_TOKEN

    try:
        resp = httpx.get(_SODA_URL, params=params, headers=headers, timeout=15)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Crime data service unavailable: {e}")

    felonies = misdemeanors = violations = 0
    for row in resp.json():
        cat = row.get("law_cat_cd", "").upper()
        count = int(row.get("total", 0))
        if cat == "FELONY":
            felonies = count
        elif cat == "MISDEMEANOR":
            misdemeanors = count
        elif cat == "VIOLATION":
            violations = count

    return felonies, misdemeanors, violations


def _score(felonies: int, misdemeanors: int, violations: int) -> tuple[int, str, str]:
    # Divisor 100 calibrated for NYC's wide density range:
    # residential (~1000 weighted) → ~90, dense commercial (~9000 weighted) → ~9
    weighted = felonies * 3 + misdemeanors * 2 + violations * 1
    score = max(0, min(100, 100 - weighted // 100))
    if score >= 70:
        label, color = "Low Crime", "green"
    elif score >= 40:
        label, color = "Moderate", "yellow"
    else:
        label, color = "High Crime", "red"
    return score, label, color


def get_safety_score(address: str) -> SafetyResult:
    zip_code = extract_zip(address)

    cached = supabase_client.table("crime_cache").select("*").eq("zip_code", zip_code).execute()
    if cached.data:
        row = cached.data[0]
        calculated_at = datetime.fromisoformat(row["calculated_at"].replace("Z", "+00:00"))
        if calculated_at.tzinfo is None:
            calculated_at = calculated_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - calculated_at < timedelta(days=_CACHE_TTL_DAYS):
            score, label, color = _score(row["felonies"], row["misdemeanors"], row["violations"])
            return SafetyResult(
                score=score,
                label=label,
                color=color,
                details=SafetyDetails(
                    felonies=row["felonies"],
                    misdemeanors=row["misdemeanors"],
                    violations=row["violations"],
                    radius_meters=_RADIUS_METERS,
                    data_period="Current year to date (NYPD)",
                ),
            )

    lat, lng = _geocode(address)
    felonies, misdemeanors, violations = _query_soda(lat, lng)
    score, label, color = _score(felonies, misdemeanors, violations)

    supabase_client.table("crime_cache").upsert(
        {
            "zip_code": zip_code,
            "felonies": felonies,
            "misdemeanors": misdemeanors,
            "violations": violations,
            "safety_score": score,
        },
        on_conflict="zip_code",
    ).execute()

    return SafetyResult(
        score=score,
        label=label,
        color=color,
        details=SafetyDetails(
            felonies=felonies,
            misdemeanors=misdemeanors,
            violations=violations,
            radius_meters=_RADIUS_METERS,
            data_period="Current year to date (NYPD)",
        ),
    )
