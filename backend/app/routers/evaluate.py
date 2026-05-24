from fastapi import APIRouter
from app.models.request import EvaluateRequest
from app.models.response import EvaluateResponse
from app.services.market_value import get_market_value
from app.services.safety import get_safety_score

router = APIRouter(prefix="/api")


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate(body: EvaluateRequest):
    market_value = get_market_value(body.address, body.bedrooms, body.rent)
    safety = get_safety_score(body.address)
    return EvaluateResponse(address=body.address, market_value=market_value, safety=safety)
