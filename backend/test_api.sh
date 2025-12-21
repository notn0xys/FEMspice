#!/bin/bash

API_URL="https://femspice-api.noxunya.dev"

echo "=== Testing FEMspice API ==="
echo ""

# Health check
echo "1. Health Check:"
curl -s "$API_URL/health"
echo -e "\n"

# Meow endpoint
echo "2. Meow:"
curl -s "$API_URL/meow"
echo -e "\n"

# Login test (will fail with wrong credentials, but tests the endpoint)
echo "3. Login (expecting 401 - testing endpoint works):"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass"
echo -e "\n"

# Simulate test endpoint
echo "4. Simulate Test (simple circuit):"
curl -s -X POST "$API_URL/simulate/test" \
  -H "Content-Type: application/json" \
  -d '{
    "components": [
      {"id": "v1", "type": "voltageSource", "value": 5, "connections": {"top": "n1", "bottom": "0"}},
      {"id": "r1", "type": "resistor", "value": 1000, "connections": {"left": "n1", "right": "0"}},
      {"id": "gnd", "type": "ground", "connections": {"top": "0"}}
    ]
  }'
echo -e "\n"

# Load test - send 10 requests to check load balancing
echo "5. Load Balancing Test (10 requests to /health):"
for i in {1..10}; do
  curl -s "$API_URL/health" &
done
wait
echo -e "\nDone! Check docker logs to see distribution across backends."
echo ""

echo "=== Test Complete ==="
