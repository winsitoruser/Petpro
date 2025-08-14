#!/bin/bash
set -e

echo "Setting up Elasticsearch users and passwords..."

# Wait for Elasticsearch to be ready
until curl -s -X GET "http://localhost:9200/" | grep -q "You Know, for Search"; do
  echo "Elasticsearch is not ready yet, waiting..."
  sleep 5
done

# Set passwords for built-in users
echo "Setting built-in user passwords..."
bin/elasticsearch-setup-passwords auto -b > /tmp/es-passwords.txt

# Extract passwords from output
ELASTIC_PASSWORD=$(grep "PASSWORD elastic" /tmp/es-passwords.txt | awk '{print $4}')
KIBANA_PASSWORD=$(grep "PASSWORD kibana_system" /tmp/es-passwords.txt | awk '{print $4}')
LOGSTASH_PASSWORD=$(grep "PASSWORD logstash_system" /tmp/es-passwords.txt | awk '{print $4}')

# Store passwords in a secure location for other services to access
echo "${ELASTIC_PASSWORD}" > /usr/share/elasticsearch/config/certs/elastic_password
echo "${KIBANA_PASSWORD}" > /usr/share/elasticsearch/config/certs/kibana_password
echo "${LOGSTASH_PASSWORD}" > /usr/share/elasticsearch/config/certs/logstash_password

# Set proper permissions
chmod 640 /usr/share/elasticsearch/config/certs/elastic_password
chmod 640 /usr/share/elasticsearch/config/certs/kibana_password
chmod 640 /usr/share/elasticsearch/config/certs/logstash_password

# Create additional custom roles and users
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" "http://localhost:9200/_security/role/petpro_log_reader" -H "Content-Type: application/json" -d'
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["petpro-*"],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}'

curl -X POST -u "elastic:${ELASTIC_PASSWORD}" "http://localhost:9200/_security/role/petpro_log_writer" -H "Content-Type: application/json" -d'
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["petpro-*"],
      "privileges": ["create", "create_index", "index", "write"]
    }
  ]
}'

# Create application user for backend services
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" "http://localhost:9200/_security/user/petpro_app" -H "Content-Type: application/json" -d'
{
  "password": "app_password_change_me",
  "roles": ["petpro_log_writer"],
  "full_name": "PetPro Application"
}'

# Create read-only user for developers
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" "http://localhost:9200/_security/user/petpro_dev" -H "Content-Type: application/json" -d'
{
  "password": "dev_password_change_me",
  "roles": ["petpro_log_reader"],
  "full_name": "PetPro Developer"
}'

echo "User setup completed successfully!"

# Clean up
rm -f /tmp/es-passwords.txt
