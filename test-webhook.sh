#!/bin/bash

# Default values
URL=""
SECRET="your-webhook-secret-here"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      URL="$2"
      shift 2
      ;;
    --secret)
      SECRET="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 --url <webhook-url> [--secret <secret>]"
      exit 1
      ;;
  esac
done

# Check if URL is provided
if [ -z "$URL" ]; then
  echo "Error: --url is required"
  echo "Usage: $0 --url <webhook-url> [--secret <secret>]"
  exit 1
fi

# Generate test data
REPORT_ID="report_$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "type": "y2_intelligence_report",
  "id": "$REPORT_ID",
  "version": "1.0",
  "timestamp": "$TIMESTAMP",
  "profile": {
    "id": "profile_test_001",
    "slug": "bitcoin-analysis",
    "name": "Bitcoin Market Analysis",
    "topic": "Daily Bitcoin price movements and market sentiment",
    "frequency": "daily"
  },
  "subscription": {
    "id": "sub_test_001",
    "deliveryMethod": "webhook"
  },
  "content": {
    "html": "<h1>Bitcoin Market Report</h1><p>Bitcoin showed strong momentum today, breaking through key resistance levels at \$45,000. Trading volume increased by 25% compared to the 7-day average.</p><h2>Key Highlights</h2><ul><li>Price: \$45,234 (+3.2%)</li><li>24h Volume: \$28.3B</li><li>Market Cap: \$885B</li></ul><p>Technical indicators suggest continued bullish sentiment with RSI at 65 and MACD showing positive divergence.</p>",
    "text": "Bitcoin showed strong momentum today, breaking through key resistance levels at \$45,000. Trading volume increased by 25% compared to the 7-day average. Price: \$45,234 (+3.2%), 24h Volume: \$28.3B, Market Cap: \$885B",
    "smsSummary": "BTC breaks \$45k resistance (+3.2%). Volume up 25%. Bullish momentum continues. RSI: 65",
    "sources": [
      "https://coinmarketcap.com/currencies/bitcoin",
      "https://www.tradingview.com/symbols/BTCUSD",
      "https://glassnode.com/metrics"
    ]
  },
  "metadata": {
    "generatedAt": $(date +%s)000,
    "generatedAtISO": "$TIMESTAMP",
    "reportId": "$REPORT_ID",
    "subscriptionId": "sub_test_001",
    "environment": "test"
  }
}
EOF
)

# Calculate HMAC signature
SIGNATURE="sha256=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)"

# Send webhook
echo "📤 Sending webhook to: $URL"
echo "📝 Report ID: $REPORT_ID"
echo "🔐 Signature: $SIGNATURE"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-Y2-Report-ID: $REPORT_ID" \
  -H "X-Y2-Timestamp: $TIMESTAMP" \
  -H "X-Y2-Signature: $SIGNATURE" \
  -d "$PAYLOAD")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Print results
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
else
  echo "❌ Failed! (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  exit 1
fi