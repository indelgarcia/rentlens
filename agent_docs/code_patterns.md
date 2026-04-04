# Code Patterns - RentLens

## File Naming
- **Frontend components:** PascalCase (`ScoreCard.tsx`, `ListingForm.tsx`)
- **Frontend pages:** `page.tsx` inside route folders (Next.js App Router convention)
- **Backend modules:** snake_case (`market_value.py`, `safety.py`)
- **Backend models:** snake_case files, PascalCase classes (`class EvaluateRequest`)

## Frontend Patterns

### Component Structure
```tsx
// components/ScoreCard.tsx
interface ScoreCardProps {
  title: string;
  score: string;
  label: string;
  color: "green" | "yellow" | "red";
}

export default function ScoreCard({ title, score, label, color }: ScoreCardProps) {
  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold">{score}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
```

### API Calls
```tsx
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function evaluateListing(data: EvaluateRequest) {
  const res = await fetch(`${API_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Evaluation failed");
  return res.json();
}
```

## Backend Patterns

### Router Structure
```python
# routers/evaluate.py
from fastapi import APIRouter, HTTPException
from app.models.request import EvaluateRequest
from app.models.response import EvaluateResponse
from app.services import market_value, safety, commute

router = APIRouter()

@router.post("/api/evaluate", response_model=EvaluateResponse)
async def evaluate_listing(request: EvaluateRequest):
    mv = await market_value.calculate(request)
    sf = await safety.calculate(request.address)
    cm = await commute.calculate(request.address, request.pois)
    return EvaluateResponse(market_value=mv, safety=sf, commutes=cm)
```

### Service Structure
```python
# services/market_value.py
from app.config import supabase

async def calculate(request):
    # 1. Extract ZIP from address
    # 2. Query Supabase for FMR
    # 3. Calculate percentage
    # 4. Return result
    pass
```

### Pydantic Models
```python
# models/request.py
from pydantic import BaseModel

class POI(BaseModel):
    label: str
    address: str

class EvaluateRequest(BaseModel):
    address: str
    rent: int
    bedrooms: int
    bathrooms: int
    sqft: int | None = None
    lease_length: int | None = 12
    amenities: list[str] = []
    pois: list[POI] = []
```

## Error Handling

### Backend
- External API failures: return partial results with error message for failed service
- Invalid address: return 400 with clear message
- Supabase down: return 503 with retry suggestion

### Frontend
- Loading states: show skeleton UI while waiting
- Error states: show friendly message with "try again" option
- Partial results: display what succeeded, note what failed

## Git Conventions
- Commit messages: 1-2 short sentences
- Branch: work on `main` for now (solo portfolio project)
- Commit frequently: after each feature or meaningful change
