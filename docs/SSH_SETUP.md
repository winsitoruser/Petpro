# SSH Setup Guide for PetPro

This document outlines the SSH configuration for the PetPro application, including key generation, server access, and deployment workflows.

## SSH Key Management

### Generated SSH Keys
The project uses ED25519 SSH keys stored in the `.ssh/` directory:
- Private key: `.ssh/petpro_ed25519` (Keep secure, never commit to repository)
- Public key: `.ssh/petpro_ed25519.pub` (Safe to share, deploy to servers)

### Key Distribution
To set up a new server for SSH access:

```bash
# Copy public key to server
ssh-copy-id -i .ssh/petpro_ed25519.pub user@server

# Alternative manual method
cat .ssh/petpro_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## SSH Configuration

The SSH configuration file (`.ssh/config`) includes settings for:
- Host aliases for easy connection
- Identity file mapping
- Connection settings

To connect to a configured server:

```bash
ssh petpro-production    # Connects to production server
ssh petpro-staging       # Connects to staging server
ssh petpro-development   # Connects to development server
```

## GitHub Actions SSH Deployment

### Workflow Configuration
The `.github/workflows/ssh-deploy.yml` file provides a reusable workflow for SSH-based deployments.

### Required Secrets
Set up these secrets in your GitHub repository:
- `SSH_PRIVATE_KEY`: The private SSH key for deployment (from `.ssh/petpro_ed25519`)
- `SSH_USER`: The username for SSH authentication
- `SLACK_WEBHOOK_URL`: (Optional) For deployment notifications

### Usage Example
```yaml
jobs:
  deploy-to-production:
    uses: ./.github/workflows/ssh-deploy.yml
    with:
      environment: production
      target_host: your-production-server.com
    secrets:
      SSH_PRIVATE_KEY: ${{ secrets.PRODUCTION_SSH_KEY }}
      SSH_USER: ${{ secrets.PRODUCTION_SSH_USER }}
```

## Security Best Practices

1. **Never commit private keys**: Keep private keys out of the repository
2. **Use specific user accounts**: Create dedicated deployment users on servers
3. **Restrict permissions**: Set proper file permissions (600 for private keys)
4. **Key rotation**: Periodically rotate SSH keys (every 90-180 days)
5. **Access logging**: Enable SSH access logging on servers

## SSH Key Backup

Store backup copies of SSH keys securely (not in the repository):
- Company password manager
- Secure offline storage
- Encrypted backup system

## Setting Up SSH Keys for New Team Members

1. Each team member should generate their own SSH key pair
2. Add public keys to the authorized server accounts
3. Store private keys securely on developer machines
4. Use the SSH configuration template for consistent settings

## Troubleshooting

Common SSH issues and solutions:
- Permission denied: Check key permissions (chmod 600)
- Connection refused: Verify server address and firewall settings
- Host key verification failed: Update known_hosts file
