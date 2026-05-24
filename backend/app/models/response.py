from pydantic import BaseModel


class MarketValueResult(BaseModel):
    score_pct: float
    label: str
    color: str
    fmr: int
    user_rent: float
    comparison_basis: str


class EvaluateResponse(BaseModel):
    address: str
    market_value: MarketValueResult
