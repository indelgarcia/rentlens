import re
from fastapi import HTTPException
from app.config import supabase_client
from app.models.response import MarketValueResult

BEDROOM_COLUMNS = {
    0: "efficiency",
    1: "one_br",
    2: "two_br",
    3: "three_br",
    4: "four_br",
}

BEDROOM_LABELS = {
    0: "Studio",
    1: "1BR",
    2: "2BR",
    3: "3BR",
    4: "4BR",
}


def _extract_zip(address: str) -> str:
    matches = re.findall(r"\b(\d{5})\b", address)
    if not matches:
        raise HTTPException(status_code=400, detail="Could not extract a ZIP code from the address. Make sure it ends with a 5-digit ZIP (e.g. 'Astoria, NY 11102').")
    return matches[-1]


def get_market_value(address: str, bedrooms: int, rent: float) -> MarketValueResult:
    if bedrooms not in BEDROOM_COLUMNS:
        raise HTTPException(status_code=400, detail=f"Bedrooms must be 0–4, got {bedrooms}.")

    zip_code = _extract_zip(address)
    col = BEDROOM_COLUMNS[bedrooms]

    result = supabase_client.table("fair_market_rents").select(f"{col}, fiscal_year, borough").eq("zip_code", zip_code).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"No FMR data found for ZIP code {zip_code}. Only NYC ZIP codes are supported.")

    row = result.data[0]
    fmr: int = row[col]
    fiscal_year: int = row.get("fiscal_year", 2026)

    score_pct = round(((rent - fmr) / fmr) * 100, 1)

    if score_pct > 5:
        label, color = "above market value", "red"
    elif score_pct < -5:
        label, color = "below market value", "green"
    else:
        label, color = "at market value", "yellow"

    bedroom_label = BEDROOM_LABELS[bedrooms]
    comparison_basis = f"{bedroom_label} in ZIP {zip_code} (FY{fiscal_year} HUD FMR)"

    return MarketValueResult(
        score_pct=score_pct,
        label=label,
        color=color,
        fmr=fmr,
        user_rent=rent,
        comparison_basis=comparison_basis,
    )
