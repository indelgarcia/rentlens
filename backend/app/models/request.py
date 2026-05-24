from pydantic import BaseModel


class POI(BaseModel):
    label: str
    address: str


class EvaluateRequest(BaseModel):
    address: str
    bedrooms: int
    rent: float
    pois: list[POI] = []
