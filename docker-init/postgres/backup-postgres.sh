#!/bin/bash
# PostgreSQL Backup Script for PetPro application
# This script performs automated backups of PostgreSQL databases

# Configuration
BACKUP_DIR="/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_RETENTION_DAYS=7
DATABASES=("petpro" "petpro_dev" "petpro_test" "petpro_staging")
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
PGPASSWORD=${POSTGRES_PASSWORD:-postgres}
BACKUP_PREFIX="petpro_backup"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}
mkdir -p ${BACKUP_DIR}/daily
mkdir -p ${BACKUP_DIR}/weekly
mkdir -p ${BACKUP_DIR}/monthly

# Determine backup type (daily, weekly, monthly)
DAY_OF_WEEK=$(date +"%u")
DAY_OF_MONTH=$(date +"%d")

if [ "$DAY_OF_MONTH" = "01" ]; then
  BACKUP_TYPE="monthly"
  RETENTION_DAYS=365
elif [ "$DAY_OF_WEEK" = "7" ]; then  # Sunday
  BACKUP_TYPE="weekly"
  RETENTION_DAYS=30
else
  BACKUP_TYPE="daily"
  RETENTION_DAYS=${BACKUP_RETENTION_DAYS}
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_TYPE}"
echo "Performing ${BACKUP_TYPE} backup to ${BACKUP_PATH}"

# Function to backup a single database
backup_database() {
  local db=$1
  local backup_file="${BACKUP_PATH}/${BACKUP_PREFIX}_${db}_${TIMESTAMP}.sql.gz"
  
  echo "Backing up database: ${db} to ${backup_file}"
  
  # Perform the backup using pg_dump and compress
  if pg_dump -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${db} | gzip > ${backup_file}; then
    echo "Successfully backed up ${db}"
    # Create a checksum file for verification
    md5sum ${backup_file} > ${backup_file}.md5
  else
    echo "Error backing up ${db}"
    rm -f ${backup_file}
    return 1
  fi
}

# Backup all databases
for db in "${DATABASES[@]}"; do
  backup_database $db
done

# Create a full backup with all databases
echo "Creating full backup of all databases"
FULL_BACKUP_FILE="${BACKUP_PATH}/${BACKUP_PREFIX}_full_${TIMESTAMP}.sql.gz"
if pg_dumpall -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} | gzip > ${FULL_BACKUP_FILE}; then
  echo "Successfully created full backup"
  # Create a checksum for verification
  md5sum ${FULL_BACKUP_FILE} > ${FULL_BACKUP_FILE}.md5
else
  echo "Error creating full backup"
  rm -f ${FULL_BACKUP_FILE}
fi

# Clean up old backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days in ${BACKUP_PATH}"
find ${BACKUP_PATH} -name "${BACKUP_PREFIX}*" -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup completed at $(date)"

# If this is not running in a container, you might want to sync to offsite storage
# Uncomment and adjust as needed
# if command -v aws &> /dev/null; then
#   echo "Syncing backups to S3"
#   aws s3 sync ${BACKUP_DIR} s3://petpro-backups/postgres/
# fi
