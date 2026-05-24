import re
from fastapi import HTTPException


def extract_zip(address: str) -> str:
    matches = re.findall(r"\b(\d{5})\b", address)
    if not matches:
        raise HTTPException(
            status_code=400,
            detail="Could not extract a ZIP code from the address. Make sure it ends with a 5-digit ZIP (e.g. 'Astoria, NY 11102').",
        )
    return matches[-1]
