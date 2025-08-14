#!/bin/bash
set -e

# Script to import saved objects into Kibana
# Waits for Kibana to be ready before importing

echo "Waiting for Kibana to be ready..."
until curl -s "http://kibana:5601/api/status" | grep -q "available"; do
  echo "Kibana is not ready yet, waiting..."
  sleep 10
done

echo "Kibana is ready, importing saved objects..."

# Import alerts configuration
curl -X POST \
  "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@/alerts/kibana-alerts.ndjson

# Import index patterns
curl -X POST \
  "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@/dashboards/index-patterns.ndjson

# Import dashboards
curl -X POST \
  "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@/dashboards/petpro-dashboards.ndjson

echo "Import completed successfully!"
