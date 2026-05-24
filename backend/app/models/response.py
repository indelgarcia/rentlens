from pydantic import BaseModel


class MarketValueResult(BaseModel):
    score_pct: float
    label: str
    color: str
    fmr: int
    user_rent: float
    comparison_basis: str


class SafetyDetails(BaseModel):
    felonies: int
    misdemeanors: int
    violations: int
    radius_meters: int
    data_period: str


class SafetyResult(BaseModel):
    score: int
    label: str
    color: str
    details: SafetyDetails


class CommuteEntry(BaseModel):
    label: str
    address: str
    transit_time: str | None
    walking_time: str | None
    distance_miles: float | None


class EvaluateResponse(BaseModel):
    address: str
    market_value: MarketValueResult
    safety: SafetyResult
    commutes: list[CommuteEntry] = []
