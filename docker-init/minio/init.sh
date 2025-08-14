#!/bin/bash
# MinIO initialization script for PetPro development environment

set -e

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until mc config host add minio http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" --insecure; do
  echo "MinIO is not ready yet, waiting..."
  sleep 3
done

# Create buckets
echo "Creating buckets..."

# Create main buckets for the application
mc mb --ignore-existing minio/petpro-uploads
mc mb --ignore-existing minio/petpro-profiles
mc mb --ignore-existing minio/petpro-products
mc mb --ignore-existing minio/petpro-documents

# Set bucket policies (example: make uploads publicly readable)
echo "Setting bucket policies..."
cat > /tmp/uploads-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::petpro-uploads/*"]
    }
  ]
}
EOF

mc policy set-json /tmp/uploads-policy.json minio/petpro-uploads

# Create users for different services
echo "Creating service users..."
mc admin user add minio petpro-backend-user petpro-backend-password

# Create policy for backend service
cat > /tmp/backend-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::petpro-uploads/*",
        "arn:aws:s3:::petpro-profiles/*",
        "arn:aws:s3:::petpro-products/*",
        "arn:aws:s3:::petpro-documents/*"
      ]
    }
  ]
}
EOF

# Apply policy to user
mc admin policy create minio backend-policy /tmp/backend-policy.json
mc admin policy attach minio backend-policy --user petpro-backend-user

echo "MinIO initialization completed successfully!"
