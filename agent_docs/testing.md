# Testing Strategy - RentLens

## Approach
For this MVP portfolio project, focus on manual testing and basic automated checks. Full test suites are v2.

## Backend Testing

### Manual Verification (during development)
- Use FastAPI's built-in `/docs` (Swagger UI) to test endpoints
- Test `/api/evaluate` with known NYC addresses and verify scores make sense
- Test edge cases: invalid address, missing fields, 0 rent, no POIs

### Basic Automated Tests (stretch goal)
```bash
pip install pytest httpx
pytest tests/
```

```python
# tests/test_evaluate.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_evaluate_valid_address():
    response = client.post("/api/evaluate", json={
        "address": "350 5th Ave, New York, NY 10118",
        "rent": 3000,
        "bedrooms": 1,
        "bathrooms": 1
    })
    assert response.status_code == 200
    data = response.json()
    assert "market_value" in data
    assert "safety" in data

def test_evaluate_missing_fields():
    response = client.post("/api/evaluate", json={
        "address": "350 5th Ave, New York, NY 10118"
    })
    assert response.status_code == 422  # Pydantic validation error
```

## Frontend Testing

### Manual Verification
- Test form submission with various inputs
- Test on mobile viewport (Chrome DevTools)
- Test loading states and error states
- Verify results display correctly for different score ranges

### Visual Checklist
- [ ] Landing page renders correctly on desktop
- [ ] Landing page renders correctly on mobile
- [ ] Form validation shows helpful errors
- [ ] Loading state appears during evaluation
- [ ] All three scores display with correct colors
- [ ] Collapsible sections open and close
- [ ] "Evaluate Another" button works

## End-to-End Verification
After deployment, test the full flow:
1. Visit live URL
2. Enter a real NYC listing
3. Verify all 3 scores return
4. Check mobile responsiveness
5. Try edge cases (studio, 4BR, Manhattan vs outer boroughs)

## Data Validation
- HUD FMR: spot-check a few ZIP codes against official HUD website
- Safety: compare a known safe/unsafe neighborhood and verify scores reflect reality
- Commute: compare transit times against Google Maps directly
