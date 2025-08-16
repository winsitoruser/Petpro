#!/bin/bash
# SSH Key Management Script for PetPro
# This script helps with creating, distributing, and rotating SSH keys

set -e

# Configuration
SSH_DIR="$PWD/.ssh"
KEY_NAME="petpro_ed25519"
KEY_COMMENT="petpro-deployment"
KEY_TYPE="ed25519"

function show_help {
  echo "PetPro SSH Key Management Tool"
  echo "----------------------------"
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  generate          Generate new SSH key pair"
  echo "  deploy HOST       Deploy public key to server (requires password)"
  echo "  rotate            Rotate keys (generate new and update servers)"
  echo "  backup            Backup existing keys"
  echo "  list-servers      List configured servers"
  echo "  check             Check SSH connections to all servers"
  echo "  help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 generate"
  echo "  $0 deploy petpro-naincode"
  exit 0
}

function generate_key {
  echo "📝 Generating new SSH key pair: $KEY_NAME..."
  
  # Backup existing key if it exists
  if [ -f "$SSH_DIR/$KEY_NAME" ]; then
    echo "🔄 Backing up existing key..."
    backup_keys
  fi
  
  # Generate new key
  ssh-keygen -t "$KEY_TYPE" -C "$KEY_COMMENT" -f "$SSH_DIR/$KEY_NAME" -N ""
  
  echo "✅ SSH key generated successfully:"
  echo "  - Private key: $SSH_DIR/$KEY_NAME"
  echo "  - Public key:  $SSH_DIR/$KEY_NAME.pub"
  echo ""
  echo "Public key content (add to authorized_keys on servers):"
  cat "$SSH_DIR/$KEY_NAME.pub"
}

function deploy_key {
  HOST=$1
  
  if [ -z "$HOST" ]; then
    echo "❌ Error: Please specify a host to deploy to"
    echo "Usage: $0 deploy HOST"
    exit 1
  fi
  
  echo "🚀 Deploying SSH key to $HOST..."
  
  # Check if key exists
  if [ ! -f "$SSH_DIR/$KEY_NAME.pub" ]; then
    echo "❌ Error: SSH key not found at $SSH_DIR/$KEY_NAME.pub"
    exit 1
  fi
  
  # Deploy using ssh-copy-id
  ssh-copy-id -i "$SSH_DIR/$KEY_NAME.pub" "$HOST"
  
  echo "✅ SSH key deployed to $HOST successfully"
}

function rotate_keys {
  echo "🔄 Rotating SSH keys..."
  
  # Backup existing keys
  backup_keys
  
  # Generate new key
  generate_key
  
  echo "🔔 Manual step required:"
  echo "You need to deploy the new key to all servers before removing the old key."
  echo "Run this command for each server:"
  echo "  $0 deploy SERVER_NAME"
  echo ""
  echo "Once completed, you can safely remove the old keys:"
  echo "  rm $SSH_DIR/$KEY_NAME.backup*"
}

function backup_keys {
  echo "💾 Backing up existing SSH keys..."
  
  TIMESTAMP=$(date +"%Y%m%d%H%M%S")
  
  if [ -f "$SSH_DIR/$KEY_NAME" ]; then
    cp "$SSH_DIR/$KEY_NAME" "$SSH_DIR/${KEY_NAME}.backup-${TIMESTAMP}"
    cp "$SSH_DIR/$KEY_NAME.pub" "$SSH_DIR/${KEY_NAME}.pub.backup-${TIMESTAMP}"
    echo "✅ Keys backed up with timestamp $TIMESTAMP"
  else
    echo "ℹ️ No existing keys to backup"
  fi
}

function list_servers {
  echo "📋 PetPro Configured Servers:"
  echo ""
  
  if [ -f "$SSH_DIR/config" ]; then
    grep -E "^Host petpro-" "$SSH_DIR/config" | sed 's/Host //' | while read -r server; do
      host_entry=$(grep -A 4 "^Host $server" "$SSH_DIR/config" | grep "HostName" | awk '{print $2}')
      echo "  - $server ($host_entry)"
    done
  else
    echo "❌ SSH config file not found"
  fi
}

function check_connections {
  echo "🔍 Checking SSH connections to all servers..."
  echo ""
  
  if [ -f "$SSH_DIR/config" ]; then
    grep -E "^Host petpro-" "$SSH_DIR/config" | sed 's/Host //' | while read -r server; do
      echo -n "  - $server: "
      if ssh -i "$SSH_DIR/$KEY_NAME" -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$server" "echo 2>&1" >/dev/null; then
        echo "✅ Connection successful"
      else
        echo "❌ Connection failed"
      fi
    done
  else
    echo "❌ SSH config file not found"
  fi
}

# Create SSH directory if it doesn't exist
mkdir -p "$SSH_DIR"

# Process command
case $1 in
  "generate")
    generate_key
    ;;
  "deploy")
    deploy_key "$2"
    ;;
  "rotate")
    rotate_keys
    ;;
  "backup")
    backup_keys
    ;;
  "list-servers")
    list_servers
    ;;
  "check")
    check_connections
    ;;
  "help" | "--help" | "-h" | "")
    show_help
    ;;
  *)
    echo "❌ Unknown command: $1"
    show_help
    ;;
esac
