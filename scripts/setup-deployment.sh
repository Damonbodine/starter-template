#!/bin/bash

# Deployment Setup Script for Starter Template
# This script sets up the deployment environment and configures all necessary services

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${GREEN}[INFO]${NC}  $timestamp - $message" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC}  $timestamp - $message" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $timestamp - $message" ;;
        DEBUG) echo -e "${BLUE}[DEBUG]${NC} $timestamp - $message" ;;
    esac
}

usage() {
    cat << EOF
Deployment Setup Script for Starter Template

Usage: $0 [options]

Options:
  --vercel              Setup Vercel deployment
  --eas                 Setup EAS (Expo Application Services)
  --github              Setup GitHub Actions secrets
  --docker              Setup Docker deployment
  --all                 Setup all deployment targets
  --help                Show this help message

Examples:
  $0 --all
  $0 --vercel --eas
  $0 --github
EOF
}

check_prerequisites() {
    log INFO "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log ERROR "Node.js is not installed"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log ERROR "npm is not installed"
        exit 1
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        log ERROR "git is not installed"
        exit 1
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log ERROR "Not in a git repository"
        exit 1
    fi

    log INFO "Prerequisites check passed"
}

setup_vercel() {
    log INFO "Setting up Vercel deployment..."

    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        log INFO "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Login to Vercel
    log INFO "Please login to Vercel..."
    vercel login

    # Link project
    cd "$PROJECT_ROOT"
    log INFO "Linking project to Vercel..."
    vercel link

    # Set up environment variables
    log INFO "Setting up Vercel environment variables..."
    
    # Production environment
    vercel env add NEXT_PUBLIC_SUPABASE_URL production
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    vercel env add SUPABASE_SERVICE_ROLE_KEY production
    vercel env add NEXTAUTH_SECRET production
    vercel env add NEXTAUTH_URL production
    vercel env add CRON_SECRET production

    # Staging environment
    vercel env add NEXT_PUBLIC_SUPABASE_URL preview
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
    vercel env add SUPABASE_SERVICE_ROLE_KEY preview
    vercel env add NEXTAUTH_SECRET preview
    vercel env add NEXTAUTH_URL preview
    vercel env add CRON_SECRET preview

    log INFO "Vercel setup completed"
    log INFO "Remember to configure your custom domain in the Vercel dashboard"
}

setup_eas() {
    log INFO "Setting up EAS (Expo Application Services)..."

    # Install EAS CLI if not present
    if ! command -v eas &> /dev/null; then
        log INFO "Installing EAS CLI..."
        npm install -g eas-cli
    fi

    # Install Expo CLI if not present
    if ! command -v expo &> /dev/null; then
        log INFO "Installing Expo CLI..."
        npm install -g expo-cli
    fi

    # Login to Expo
    log INFO "Please login to Expo..."
    eas login

    # Initialize EAS
    cd "$PROJECT_ROOT/apps/mobile"
    log INFO "Initializing EAS project..."
    eas build:configure

    # Set up environment variables
    log INFO "Setting up EAS environment variables..."
    eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url"
    eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-supabase-anon-key"

    # Configure app store credentials
    log INFO "Configuring app store credentials..."
    log WARN "You'll need to set up:"
    log WARN "1. Apple Developer account credentials"
    log WARN "2. Google Play Console credentials"
    log WARN "3. App signing certificates"

    log INFO "EAS setup completed"
    log INFO "Update the app.config.js with your actual project details"
}

setup_github_actions() {
    log INFO "Setting up GitHub Actions secrets..."

    # Check if GitHub CLI is available
    if ! command -v gh &> /dev/null; then
        log WARN "GitHub CLI not found. Please install 'gh' or set secrets manually"
        log INFO "Required secrets:"
        log INFO "  VERCEL_TOKEN"
        log INFO "  VERCEL_ORG_ID"
        log INFO "  VERCEL_PROJECT_ID"
        log INFO "  EXPO_TOKEN"
        log INFO "  NEXT_PUBLIC_SUPABASE_URL"
        log INFO "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
        log INFO "  SUPABASE_SERVICE_ROLE_KEY"
        log INFO "  CRON_SECRET"
        return 0
    fi

    # Check if authenticated with GitHub
    if ! gh auth status &> /dev/null; then
        log INFO "Please authenticate with GitHub..."
        gh auth login
    fi

    log INFO "Setting up GitHub repository secrets..."
    
    # Vercel secrets
    read -p "Enter your Vercel Token: " -s VERCEL_TOKEN
    echo
    gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"

    read -p "Enter your Vercel Org ID: " VERCEL_ORG_ID
    gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"

    read -p "Enter your Vercel Project ID: " VERCEL_PROJECT_ID
    gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

    # Expo secrets
    read -p "Enter your Expo Token: " -s EXPO_TOKEN
    echo
    gh secret set EXPO_TOKEN --body "$EXPO_TOKEN"

    # Supabase secrets
    read -p "Enter your Supabase URL: " SUPABASE_URL
    gh secret set NEXT_PUBLIC_SUPABASE_URL --body "$SUPABASE_URL"
    gh secret set EXPO_PUBLIC_SUPABASE_URL --body "$SUPABASE_URL"

    read -p "Enter your Supabase Anon Key: " -s SUPABASE_ANON_KEY
    echo
    gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
    gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"

    read -p "Enter your Supabase Service Role Key: " -s SERVICE_ROLE_KEY
    echo
    gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SERVICE_ROLE_KEY"

    # Generate secure cron secret
    CRON_SECRET=$(openssl rand -base64 32)
    gh secret set CRON_SECRET --body "$CRON_SECRET"

    log INFO "GitHub Actions secrets setup completed"
}

setup_docker() {
    log INFO "Setting up Docker deployment..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker is not installed"
        exit 1
    fi

    # Build Docker image
    cd "$PROJECT_ROOT"
    log INFO "Building Docker image..."
    docker build -t starter-template:latest .

    # Set up Docker registry (example for Docker Hub)
    log INFO "Docker setup completed"
    log WARN "Configure your Docker registry credentials:"
    log WARN "1. Docker Hub: Set DOCKER_USERNAME and DOCKER_PASSWORD"
    log WARN "2. AWS ECR: Set ECR_REGISTRY and configure AWS credentials"
    log WARN "3. Google GCR: Set GCP_PROJECT_ID and configure GCP credentials"
}

create_deployment_guide() {
    local guide_file="$PROJECT_ROOT/DEPLOYMENT.md"
    
    cat > "$guide_file" << 'EOF'
# Deployment Guide

This guide covers how to deploy the Starter Template to various platforms.

## Prerequisites

- Node.js 18+
- pnpm 8+
- Git

## Quick Start

1. **Setup deployment environment:**
   ```bash
   ./scripts/setup-deployment.sh --all
   ```

2. **Deploy to staging:**
   ```bash
   ./scripts/deploy.sh web staging
   ```

3. **Deploy to production:**
   ```bash
   ./scripts/deploy.sh web production
   ```

## Platform-Specific Deployment

### Web Application (Vercel)

1. **Setup:**
   ```bash
   ./scripts/setup-deployment.sh --vercel
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh web production
   ```

3. **Rollback:**
   ```bash
   ./scripts/rollback.sh web production --version <deployment-id>
   ```

### Mobile Application (EAS)

1. **Setup:**
   ```bash
   ./scripts/setup-deployment.sh --eas
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh mobile production --platform all
   ```

3. **OTA Update:**
   ```bash
   cd apps/mobile
   eas update --channel production --message "Hot fix"
   ```

### Docker Deployment

1. **Setup:**
   ```bash
   ./scripts/setup-deployment.sh --docker
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh docker production --registry ecr
   ```

## Environment Variables

### Required for All Environments

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Production Only

- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- Registry credentials (for Docker)

## CI/CD

GitHub Actions workflows are configured for automatic deployment:

- **Web:** `.github/workflows/deploy-web.yml`
- **Mobile:** `.github/workflows/deploy-mobile.yml`

### Manual Deployment

Trigger manual deployment using GitHub Actions:

1. Go to Actions tab in your GitHub repository
2. Select the deployment workflow
3. Click "Run workflow"
4. Choose environment and options

## Monitoring

### Health Checks

- Web: `https://your-domain.com/api/health`
- Check logs in Vercel dashboard

### Error Tracking

Configure Sentry DSN in environment variables:
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`

## Troubleshooting

### Common Issues

1. **Build fails:** Check environment variables and dependencies
2. **Health check fails:** Verify database connectivity
3. **Mobile build fails:** Check EAS configuration and certificates

### Rollback Procedures

Use the rollback script for quick recovery:
```bash
./scripts/rollback.sh <target> <environment> --version <version>
```

## Security

- Environment variables are encrypted in CI/CD
- Secrets are stored securely in platform vaults
- Regular security audits with `pnpm audit`

## Support

For deployment issues, check:
1. Platform status pages (Vercel, Expo)
2. Application logs
3. Health check endpoints
4. GitHub Actions logs
EOF

    log INFO "Deployment guide created: $guide_file"
}

main() {
    local setup_vercel=false
    local setup_eas=false
    local setup_github=false
    local setup_docker=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --vercel)
                setup_vercel=true
                shift
                ;;
            --eas)
                setup_eas=true
                shift
                ;;
            --github)
                setup_github=true
                shift
                ;;
            --docker)
                setup_docker=true
                shift
                ;;
            --all)
                setup_vercel=true
                setup_eas=true
                setup_github=true
                setup_docker=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log ERROR "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # If no options specified, show usage
    if [[ $setup_vercel == false && $setup_eas == false && $setup_github == false && $setup_docker == false ]]; then
        usage
        exit 1
    fi

    log INFO "Starting deployment setup..."

    # Check prerequisites
    check_prerequisites

    # Run setup steps
    if [[ $setup_vercel == true ]]; then
        setup_vercel
    fi

    if [[ $setup_eas == true ]]; then
        setup_eas
    fi

    if [[ $setup_github == true ]]; then
        setup_github_actions
    fi

    if [[ $setup_docker == true ]]; then
        setup_docker
    fi

    # Create deployment guide
    create_deployment_guide

    log INFO "Deployment setup completed successfully!"
    log INFO "Next steps:"
    log INFO "1. Review and update environment variables"
    log INFO "2. Test deployments in staging environment"
    log INFO "3. Configure monitoring and alerts"
    log INFO "4. Read the deployment guide: DEPLOYMENT.md"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi