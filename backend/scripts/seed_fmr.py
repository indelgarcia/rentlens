#!/usr/bin/env python3
"""
Seed the fair_market_rents table with HUD FY2026 Small Area FMR data for NYC.

Usage (from backend/ with venv activated):
    python scripts/seed_fmr.py

If the automatic download fails, manually download the xlsx from:
    https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html
Then run:
    python scripts/seed_fmr.py path/to/downloaded_file.xlsx
"""

import io
import os
import sys

import openpyxl
import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

HUD_SAFMR_URL = (
    "https://www.huduser.gov/portal/datasets/fmr/smallarea/fy2026_safmrs_final.xlsx"
)

# NYC ZIP code 3-digit prefixes → borough name
NYC_BOROUGH_MAP = {
    "100": "Manhattan",
    "101": "Manhattan",
    "102": "Manhattan",
    "103": "Staten Island",
    "104": "Bronx",
    "112": "Brooklyn",
    "113": "Queens",
    "114": "Queens",
    "116": "Queens",
}


def download_xlsx() -> io.BytesIO:
    print(f"Downloading HUD FY2026 SAFMR data...")
    resp = requests.get(HUD_SAFMR_URL, timeout=60)
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024:.0f} KB")
    return io.BytesIO(resp.content)


def load_xlsx(path: str) -> io.BytesIO:
    with open(path, "rb") as f:
        return io.BytesIO(f.read())


def find_col(headers: list[str], *keywords: str) -> int | None:
    for i, h in enumerate(headers):
        if any(kw in h for kw in keywords):
            return i
    return None


def parse_xlsx(file_obj: io.BytesIO) -> list[dict]:
    wb = openpyxl.load_workbook(file_obj, read_only=True, data_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    headers = [str(h).lower().strip() if h else "" for h in rows[0]]
    print(f"Columns found: {headers}")

    zip_col = find_col(headers, "zcta", "zip_code", "zip")
    eff_col = find_col(headers, "efficiency", "_eff", "eff", "0br")
    br1_col = find_col(headers, "one_bedroom", "one-bedroom", "br1", "1br", "onebr")
    br2_col = find_col(headers, "two_bedroom", "two-bedroom", "br2", "2br", "twobr")
    br3_col = find_col(headers, "three_bedroom", "three-bedroom", "br3", "3br", "threebr")
    br4_col = find_col(headers, "four_bedroom", "four-bedroom", "br4", "4br", "fourbr")

    missing = [
        name
        for name, col in [("zip", zip_col), ("eff", eff_col), ("1br", br1_col), ("2br", br2_col), ("3br", br3_col), ("4br", br4_col)]
        if col is None
    ]
    if missing:
        print(f"ERROR: Could not find columns for: {missing}")
        print("Update the find_col() calls to match the actual header names above.")
        sys.exit(1)

    records = []
    for row in rows[1:]:
        raw_zip = row[zip_col]
        if not raw_zip:
            continue
        zip_code = str(raw_zip).strip().split(".")[0].zfill(5)
        if len(zip_code) != 5 or zip_code[:3] not in NYC_BOROUGH_MAP:
            continue

        records.append(
            {
                "zip_code": zip_code,
                "borough": NYC_BOROUGH_MAP[zip_code[:3]],
                "efficiency": int(row[eff_col]) if row[eff_col] else None,
                "one_br": int(row[br1_col]) if row[br1_col] else None,
                "two_br": int(row[br2_col]) if row[br2_col] else None,
                "three_br": int(row[br3_col]) if row[br3_col] else None,
                "four_br": int(row[br4_col]) if row[br4_col] else None,
                "fiscal_year": 2026,
            }
        )

    return records


def seed(records: list[dict]) -> None:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"Seeding {len(records)} NYC ZIP codes into fair_market_rents...")

    batch_size = 100
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        client.table("fair_market_rents").upsert(
            batch, on_conflict="zip_code,fiscal_year"
        ).execute()
        print(f"  {min(i + batch_size, len(records))}/{len(records)} inserted")

    print("Seeding complete.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(f"Loading from file: {sys.argv[1]}")
        file_obj = load_xlsx(sys.argv[1])
    else:
        try:
            file_obj = download_xlsx()
        except requests.HTTPError as e:
            print(f"Download failed: {e}")
            print("Download the xlsx manually from:")
            print("  https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html")
            print("Then run: python scripts/seed_fmr.py <path_to_file.xlsx>")
            sys.exit(1)

    records = parse_xlsx(file_obj)
    print(f"Parsed {len(records)} NYC ZIP codes from HUD data.")
    seed(records)
