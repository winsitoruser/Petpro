#!/bin/bash
# PostgreSQL Restore Script for PetPro application
# This script restores PostgreSQL databases from backups

# Configuration - can be overridden by environment variables
BACKUP_DIR=${BACKUP_DIR:-"/backup"}
POSTGRES_HOST=${POSTGRES_HOST:-"postgres"}
POSTGRES_PORT=${POSTGRES_PORT:-"5432"}
POSTGRES_USER=${POSTGRES_USER:-"postgres"}
PGPASSWORD=${POSTGRES_PASSWORD:-"postgres"}
BACKUP_PREFIX="petpro_backup"

# Usage information
show_usage() {
  echo "Usage: $0 [OPTIONS] BACKUP_FILE"
  echo "Restore PostgreSQL database from backup"
  echo ""
  echo "Options:"
  echo "  -d, --database DATABASE   Restore to specific database (default: derived from filename)"
  echo "  -l, --list                List available backups"
  echo "  -f, --full                Restore full backup (all databases)"
  echo "  -h, --help                Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --list                                   # List available backups"
  echo "  $0 petpro_backup_petpro_20250813_120000.sql.gz  # Restore specific database backup"
  echo "  $0 -f petpro_backup_full_20250813_120000.sql.gz # Restore full backup"
}

# List available backups
list_backups() {
  echo "Available backups:"
  echo "=================================================="
  echo "BACKUP TYPE | DATABASE | DATE | SIZE"
  echo "=================================================="
  
  # Daily backups
  if [ -d "${BACKUP_DIR}/daily" ]; then
    find ${BACKUP_DIR}/daily -name "${BACKUP_PREFIX}*.sql.gz" | sort | while read backup; do
      file=$(basename $backup)
      db=$(echo $file | cut -d'_' -f3)
      timestamp=$(echo $file | grep -oP '\d{8}_\d{6}')
      date_formatted=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo $timestamp)
      size=$(du -h $backup | cut -f1)
      echo "Daily | $db | $date_formatted | $size"
    done
  fi
  
  # Weekly backups
  if [ -d "${BACKUP_DIR}/weekly" ]; then
    find ${BACKUP_DIR}/weekly -name "${BACKUP_PREFIX}*.sql.gz" | sort | while read backup; do
      file=$(basename $backup)
      db=$(echo $file | cut -d'_' -f3)
      timestamp=$(echo $file | grep -oP '\d{8}_\d{6}')
      date_formatted=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo $timestamp)
      size=$(du -h $backup | cut -f1)
      echo "Weekly | $db | $date_formatted | $size"
    done
  fi
  
  # Monthly backups
  if [ -d "${BACKUP_DIR}/monthly" ]; then
    find ${BACKUP_DIR}/monthly -name "${BACKUP_PREFIX}*.sql.gz" | sort | while read backup; do
      file=$(basename $backup)
      db=$(echo $file | cut -d'_' -f3)
      timestamp=$(echo $file | grep -oP '\d{8}_\d{6}')
      date_formatted=$(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo $timestamp)
      size=$(du -h $backup | cut -f1)
      echo "Monthly | $db | $date_formatted | $size"
    done
  fi
}

# Verify backup file
verify_backup() {
  local backup_file="$1"
  
  # Check if backup file exists
  if [ ! -f "$backup_file" ]; then
    echo "Error: Backup file not found: $backup_file"
    return 1
  fi
  
  # Verify checksum if available
  if [ -f "${backup_file}.md5" ]; then
    echo "Verifying backup integrity..."
    if md5sum -c "${backup_file}.md5"; then
      echo "Backup integrity verified."
    else
      echo "Error: Backup integrity check failed."
      return 1
    fi
  else
    echo "Warning: No checksum file found. Skipping integrity verification."
  fi
  
  return 0
}

# Restore database from backup
restore_database() {
  local backup_file="$1"
  local target_db="$2"
  local is_full="$3"
  
  # Verify backup file
  if ! verify_backup "$backup_file"; then
    return 1
  fi
  
  # Ask for confirmation
  echo "WARNING: This will overwrite existing database data."
  read -p "Are you sure you want to proceed? (y/N): " confirm
  if [[ "$confirm" != [yY] ]]; then
    echo "Restore cancelled."
    return 0
  fi
  
  # Perform restore
  echo "Restoring from backup: $backup_file"
  
  if [ "$is_full" = "true" ]; then
    echo "Performing full restore of all databases..."
    if gunzip -c "$backup_file" | psql -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} postgres; then
      echo "Full restore completed successfully."
    else
      echo "Error: Failed to restore all databases."
      return 1
    fi
  else
    echo "Restoring database: $target_db"
    
    # Check if database exists, create if not
    if ! psql -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -lqt | cut -d \| -f 1 | grep -qw "$target_db"; then
      echo "Creating database: $target_db"
      if ! psql -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -c "CREATE DATABASE $target_db"; then
        echo "Error: Failed to create database: $target_db"
        return 1
      fi
    fi
    
    # Restore single database
    if gunzip -c "$backup_file" | psql -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} "$target_db"; then
      echo "Database '$target_db' restored successfully."
    else
      echo "Error: Failed to restore database: $target_db"
      return 1
    fi
  fi
}

# Parse command line arguments
target_db=""
is_full="false"
show_list="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--database)
      target_db="$2"
      shift 2
      ;;
    -l|--list)
      show_list="true"
      shift
      ;;
    -f|--full)
      is_full="true"
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      if [[ "$1" == -* ]]; then
        echo "Unknown option: $1"
        show_usage
        exit 1
      else
        backup_file="$1"
        shift
      fi
      ;;
  esac
done

# Main execution
if [ "$show_list" = "true" ]; then
  list_backups
  exit 0
fi

if [ -z "$backup_file" ]; then
  echo "Error: No backup file specified."
  show_usage
  exit 1
fi

# If not full backup and no target database specified, try to determine from filename
if [ "$is_full" != "true" ] && [ -z "$target_db" ]; then
  # Extract database name from backup filename
  filename=$(basename "$backup_file")
  if [[ "$filename" == "${BACKUP_PREFIX}_full_"* ]]; then
    is_full="true"
  elif [[ "$filename" == "${BACKUP_PREFIX}_"*"_"* ]]; then
    target_db=$(echo "$filename" | cut -d'_' -f3)
  fi
  
  if [ -z "$target_db" ] && [ "$is_full" != "true" ]; then
    echo "Error: Could not determine target database from filename."
    echo "Please specify target database with --database option."
    exit 1
  fi
fi

# Find backup file if not a full path
if [ ! -f "$backup_file" ]; then
  # Check in backup directories
  for dir in "${BACKUP_DIR}/daily" "${BACKUP_DIR}/weekly" "${BACKUP_DIR}/monthly"; do
    if [ -f "${dir}/${backup_file}" ]; then
      backup_file="${dir}/${backup_file}"
      break
    fi
  done
  
  if [ ! -f "$backup_file" ]; then
    echo "Error: Backup file not found: $backup_file"
    exit 1
  fi
fi

# Perform restore
if [ "$is_full" = "true" ]; then
  restore_database "$backup_file" "" "true"
else
  restore_database "$backup_file" "$target_db" "false"
fi
