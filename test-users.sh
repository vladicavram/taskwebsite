#!/bin/bash

echo "Creating test users..."
curl -X POST https://dozo.md/api/admin/emergency-seed \
  -H "Content-Type: application/json" \
  -d '{}'

echo -e "\n\nTesting login with alice@example.com..."
curl -X POST https://dozo.md/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=alice@example.com&password=password123" \
  -i 2>&1 | grep -E "(HTTP|error)"

echo -e "\n\nTesting login with bob@example.com..."
curl -X POST https://dozo.md/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=bob@example.com&password=password123" \
  -i 2>&1 | grep -E "(HTTP|error)"
