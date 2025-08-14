#!/bin/bash
set -e

echo "Generating Elasticsearch certificates..."

# Create instance directory
mkdir -p /usr/share/elasticsearch/config/certs

# Generate CA
if [ ! -f /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12 ]; then
  bin/elasticsearch-certutil ca --silent --out /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12 --pass "${ELASTIC_PASSWORD:-changeme}"
  echo "CA certificate generated."
fi

# Generate certificates
if [ ! -f /usr/share/elasticsearch/config/certs/elastic-certificates.p12 ]; then
  bin/elasticsearch-certutil cert --silent --in /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12 --out /usr/share/elasticsearch/config/certs/elastic-certificates.p12 --pass "${ELASTIC_PASSWORD:-changeme}" --ca-pass "${ELASTIC_PASSWORD:-changeme}"
  echo "Node certificates generated."
fi

# Set permissions
chmod 640 /usr/share/elasticsearch/config/certs/elastic-certificates.p12
chmod 640 /usr/share/elasticsearch/config/certs/elastic-stack-ca.p12

echo "Certificate generation complete!"
