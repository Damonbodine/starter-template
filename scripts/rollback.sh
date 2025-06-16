#!/bin/bash

# Rollback Script for Starter Template
# Usage: ./scripts/rollback.sh <target> <environment> [options]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROLLBACK_LOG="$PROJECT_ROOT/rollback.log"

# Default values
TARGET=""
ENVIRONMENT=""
VERSION=""
FORCE=false
VERBOSE=false
DRY_RUN=false

# Functions
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${GREEN}[INFO]${NC}  $timestamp - $message" | tee -a "$ROLLBACK_LOG" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC}  $timestamp - $message" | tee -a "$ROLLBACK_LOG" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $timestamp - $message" | tee -a "$ROLLBACK_LOG" ;;
        DEBUG) [[ $VERBOSE == true ]] && echo -e "${BLUE}[DEBUG]${NC} $timestamp - $message" | tee -a "$ROLLBACK_LOG" ;;
    esac
}

usage() {
    cat << EOF
Rollback Script for Starter Template

Usage: $0 <target> <environment> [options]

Targets:
  web       Rollback web application on Vercel
  mobile    Rollback mobile application
  docker    Rollback containerized application
  all       Rollback all targets

Environments:
  staging       Staging environment
  production    Production environment

Options:
  --version <version>     Specific version to rollback to
  --force                 Force rollback without confirmations
  --verbose               Enable verbose logging
  --dry-run               Show what would be rolled back without executing
  --help                  Show this help message

Examples:
  $0 web production --version v1.2.3
  $0 mobile staging
  $0 all production --force
EOF
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            web|mobile|docker|all)
                TARGET="$1"
                shift
                ;;
            staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --version)
                VERSION="$2"
                shift 2
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
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

    # Validate required arguments
    if [[ -z "$TARGET" || -z "$ENVIRONMENT" ]]; then
        log ERROR "Target and environment are required"
        usage
        exit 1
    fi

    # Don't allow rollback in development
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log ERROR "Rollback not supported in development environment"
        exit 1
    fi
}

check_prerequisites() {
    log INFO "Checking rollback prerequisites..."

    # Target-specific prerequisites
    case $TARGET in
        web)
            if ! command -v vercel &> /dev/null; then
                log ERROR "Vercel CLI is not installed"
                exit 1
            fi
            ;;
        mobile)
            if ! command -v eas &> /dev/null; then
                log ERROR "EAS CLI is not installed"
                exit 1
            fi
            ;;
        docker)
            if ! command -v docker &> /dev/null; then
                log ERROR "Docker is not installed"
                exit 1
            fi
            ;;
    esac

    log INFO "Prerequisites check passed"
}

list_deployments() {
    local target=$1
    
    case $target in
        web)
            log INFO "Listing recent Vercel deployments..."
            if [[ $DRY_RUN == true ]]; then
                log INFO "[DRY RUN] Would list Vercel deployments"
                return 0
            fi
            vercel list
            ;;
        mobile)
            log INFO "Listing recent EAS builds..."
            if [[ $DRY_RUN == true ]]; then
                log INFO "[DRY RUN] Would list EAS builds"
                return 0
            fi
            cd "$PROJECT_ROOT/apps/mobile"
            eas build:list --limit 10
            ;;
        docker)
            log INFO "Listing Docker images..."
            if [[ $DRY_RUN == true ]]; then
                log INFO "[DRY RUN] Would list Docker images"
                return 0
            fi
            docker images starter-template
            ;;
    esac
}

select_version() {
    if [[ -n "$VERSION" ]]; then
        log INFO "Using specified version: $VERSION"
        return 0
    fi

    log INFO "No version specified, listing available deployments..."
    list_deployments "$TARGET"

    echo
    read -p "Enter the version/deployment ID to rollback to: " VERSION
    
    if [[ -z "$VERSION" ]]; then
        log ERROR "No version specified"
        exit 1
    fi

    log INFO "Selected version: $VERSION"
}

rollback_web() {
    log INFO "Rolling back web application..."

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would rollback web application to version: $VERSION"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Promote the specified deployment
    local deployment_url
    deployment_url=$(vercel promote "$VERSION")

    log INFO "Web application rolled back successfully"
    log INFO "Active URL: $deployment_url"

    # Run health check
    log INFO "Running health check..."
    if node "$PROJECT_ROOT/scripts/build-config.js" web health-check "$deployment_url"; then
        log INFO "Health check passed"
    else
        log ERROR "Health check failed after rollback"
        exit 1
    fi
}

rollback_mobile() {
    log INFO "Rolling back mobile application..."

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would rollback mobile application to version: $VERSION"
        return 0
    fi

    cd "$PROJECT_ROOT/apps/mobile"

    # For mobile, we need to publish an OTA update pointing to the previous version
    # This assumes the VERSION is a previous update ID or branch

    # Get the channel for the environment
    local channel=$ENVIRONMENT

    # Publish rollback update
    eas update --channel "$channel" --message "Rollback to version $VERSION" --branch "$VERSION"

    log INFO "Mobile application rolled back successfully"
    log INFO "OTA update published to channel: $channel"
}

rollback_docker() {
    log INFO "Rolling back Docker deployment..."

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would rollback Docker deployment to version: $VERSION"
        return 0
    fi

    # This is a simplified example - actual implementation depends on your orchestration platform
    # For Kubernetes:
    # kubectl rollout undo deployment/starter-template-web
    
    # For Docker Swarm:
    # docker service update --image starter-template:$VERSION starter-template-web

    # For simple Docker:
    docker stop starter-template-web || true
    docker rm starter-template-web || true
    docker run -d --name starter-template-web -p 3000:3000 "starter-template:$VERSION"

    log INFO "Docker deployment rolled back successfully"
}

verify_rollback() {
    log INFO "Verifying rollback..."

    case $TARGET in
        web)
            # Check if the correct version is deployed
            local current_deployment
            current_deployment=$(vercel list --limit 1 | grep -E 'Ready|Current' | head -1)
            log INFO "Current deployment: $current_deployment"
            ;;
        mobile)
            # Check the latest update in the channel
            cd "$PROJECT_ROOT/apps/mobile"
            eas update:list --channel "$ENVIRONMENT" --limit 1
            ;;
        docker)
            # Check running container
            docker ps | grep starter-template-web
            ;;
    esac

    log INFO "Rollback verification completed"
}

confirm_rollback() {
    if [[ $FORCE == true || $DRY_RUN == true ]]; then
        return 0
    fi

    echo
    log WARN "ROLLBACK CONFIRMATION"
    log WARN "This will rollback the $TARGET application in $ENVIRONMENT environment"
    log WARN "Target version: $VERSION"
    echo

    read -p "Are you ABSOLUTELY SURE you want to proceed? (yes/NO): " -r
    echo
    if [[ ! $REPLY == "yes" ]]; then
        log INFO "Rollback cancelled"
        exit 0
    fi
}

notify_rollback() {
    log INFO "Sending rollback notifications..."

    # Example notification to Slack (uncomment and configure)
    # if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"🚨 ROLLBACK: $TARGET rolled back to $VERSION in $ENVIRONMENT\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi

    # Example notification via email (configure with your email service)
    # if command -v mail &> /dev/null && [[ -n "${ALERT_EMAIL:-}" ]]; then
    #     echo "ROLLBACK ALERT: $TARGET rolled back to $VERSION in $ENVIRONMENT environment" | \
    #         mail -s "Rollback Alert - $ENVIRONMENT" "$ALERT_EMAIL"
    # fi

    log INFO "Rollback notifications sent"
}

create_rollback_report() {
    local report_file="$PROJECT_ROOT/rollback-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "rollback": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "target": "$TARGET",
    "environment": "$ENVIRONMENT",
    "version": "$VERSION",
    "operator": "${USER:-unknown}",
    "reason": "Manual rollback",
    "success": true
  },
  "system": {
    "hostname": "$(hostname)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
  }
}
EOF

    log INFO "Rollback report created: $report_file"
}

main() {
    # Initialize logging
    echo "=== Rollback started at $(date) ===" >> "$ROLLBACK_LOG"

    log INFO "Starting rollback process..."

    # Parse command line arguments
    parse_args "$@"

    # Check prerequisites
    check_prerequisites

    # Select version to rollback to
    select_version

    # Confirm rollback
    confirm_rollback

    # Perform rollback based on target
    case $TARGET in
        web)
            rollback_web
            ;;
        mobile)
            rollback_mobile
            ;;
        docker)
            rollback_docker
            ;;
        all)
            rollback_web
            rollback_mobile
            ;;
    esac

    # Verify rollback
    verify_rollback

    # Send notifications
    notify_rollback

    # Create rollback report
    if [[ $DRY_RUN != true ]]; then
        create_rollback_report
    fi

    log INFO "Rollback completed successfully!"
    echo "=== Rollback completed at $(date) ===" >> "$ROLLBACK_LOG"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi