import time

import googlemaps
from fastapi import HTTPException

from app.config import GOOGLE_MAPS_API_KEY
from app.models.request import POI
from app.models.response import CommuteEntry


def get_commute_times(listing_address: str, pois: list[POI]) -> list[CommuteEntry]:
    if not GOOGLE_MAPS_API_KEY:
        return []

    active_pois = [p for p in pois if p.address.strip()]
    if not active_pois:
        return []

    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        destinations = [p.address for p in active_pois]

        # Two batched calls: one for transit, one for walking
        transit_result = gmaps.distance_matrix(
            origins=[listing_address],
            destinations=destinations,
            mode="transit",
            departure_time=int(time.time()) + 60,
        )
        walking_result = gmaps.distance_matrix(
            origins=[listing_address],
            destinations=destinations,
            mode="walking",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Commute service unavailable: {e}")

    entries = []
    t_elements = transit_result["rows"][0]["elements"]
    w_elements = walking_result["rows"][0]["elements"]

    for i, poi in enumerate(active_pois):
        t = t_elements[i]
        w = w_elements[i]
        entries.append(
            CommuteEntry(
                label=poi.label,
                address=poi.address,
                transit_time=t["duration"]["text"] if t["status"] == "OK" else None,
                walking_time=w["duration"]["text"] if w["status"] == "OK" else None,
                distance_miles=(
                    round(t["distance"]["value"] / 1609.34, 1) if t["status"] == "OK" else None
                ),
            )
        )

    return entries
