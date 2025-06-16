#!/bin/bash

# Deployment Script for Starter Template
# Usage: ./scripts/deploy.sh <target> <environment> [options]
# Examples:
#   ./scripts/deploy.sh web staging
#   ./scripts/deploy.sh mobile production --platform ios
#   ./scripts/deploy.sh docker staging --registry ecr

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
DEPLOY_LOG="$PROJECT_ROOT/deploy.log"

# Default values
TARGET=""
ENVIRONMENT=""
PLATFORM="all"
REGISTRY=""
SKIP_TESTS=false
SKIP_BUILD=false
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
        INFO)  echo -e "${GREEN}[INFO]${NC}  $timestamp - $message" | tee -a "$DEPLOY_LOG" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC}  $timestamp - $message" | tee -a "$DEPLOY_LOG" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $timestamp - $message" | tee -a "$DEPLOY_LOG" ;;
        DEBUG) [[ $VERBOSE == true ]] && echo -e "${BLUE}[DEBUG]${NC} $timestamp - $message" | tee -a "$DEPLOY_LOG" ;;
    esac
}

usage() {
    cat << EOF
Deployment Script for Starter Template

Usage: $0 <target> <environment> [options]

Targets:
  web       Deploy web application to Vercel
  mobile    Deploy mobile application with EAS
  docker    Deploy containerized application
  all       Deploy all targets

Environments:
  development   Development environment
  staging       Staging environment
  production    Production environment

Options:
  --platform <ios|android|all>  Mobile platform (default: all)
  --registry <ecr|gcr|docker>   Docker registry (default: docker)
  --skip-tests                  Skip running tests
  --skip-build                  Skip build step
  --force                       Force deployment without confirmations
  --verbose                     Enable verbose logging
  --dry-run                     Show what would be deployed without executing
  --help                        Show this help message

Examples:
  $0 web staging
  $0 mobile production --platform ios
  $0 docker staging --registry ecr
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
            development|staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --platform)
                PLATFORM="$2"
                shift 2
                ;;
            --registry)
                REGISTRY="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
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

    # Validate target
    if [[ ! "$TARGET" =~ ^(web|mobile|docker|all)$ ]]; then
        log ERROR "Invalid target: $TARGET"
        exit 1
    fi

    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        log ERROR "Invalid environment: $ENVIRONMENT"
        exit 1
    fi
}

check_prerequisites() {
    log INFO "Checking prerequisites..."

    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log ERROR "Not in project root directory"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log ERROR "Node.js is not installed"
        exit 1
    fi

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log ERROR "pnpm is not installed"
        exit 1
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        log ERROR "git is not installed"
        exit 1
    fi

    # Check for uncommitted changes
    if [[ $(git status --porcelain) ]]; then
        if [[ $FORCE != true ]]; then
            log ERROR "Uncommitted changes detected. Use --force to deploy anyway"
            exit 1
        else
            log WARN "Deploying with uncommitted changes"
        fi
    fi

    # Target-specific prerequisites
    case $TARGET in
        web)
            if ! command -v vercel &> /dev/null; then
                log WARN "Vercel CLI not found, installing..."
                npm install -g vercel
            fi
            ;;
        mobile)
            if ! command -v eas &> /dev/null; then
                log ERROR "EAS CLI is not installed. Run: npm install -g eas-cli"
                exit 1
            fi
            if ! command -v expo &> /dev/null; then
                log ERROR "Expo CLI is not installed. Run: npm install -g expo-cli"
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

load_environment() {
    log INFO "Loading environment configuration for $ENVIRONMENT..."

    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [[ -f "$env_file" ]]; then
        log DEBUG "Loading environment from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        log WARN "Environment file not found: $env_file"
    fi

    # Validate required environment variables
    node "$PROJECT_ROOT/scripts/build-config.js" $TARGET validate || {
        log ERROR "Environment validation failed"
        exit 1
    }
}

run_tests() {
    if [[ $SKIP_TESTS == true ]]; then
        log INFO "Skipping tests (--skip-tests)"
        return 0
    fi

    log INFO "Running tests..."

    cd "$PROJECT_ROOT"

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would run tests"
        return 0
    fi

    case $TARGET in
        web)
            pnpm test --filter=web
            ;;
        mobile)
            pnpm test --filter=mobile
            ;;
        docker|all)
            pnpm test
            ;;
    esac

    log INFO "Tests passed"
}

build_application() {
    if [[ $SKIP_BUILD == true ]]; then
        log INFO "Skipping build (--skip-build)"
        return 0
    fi

    log INFO "Building application..."

    cd "$PROJECT_ROOT"

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would build application"
        return 0
    fi

    # Use build configuration script
    node "$PROJECT_ROOT/scripts/build-config.js" $TARGET

    log INFO "Build completed"
}

deploy_web() {
    log INFO "Deploying web application to Vercel..."

    cd "$PROJECT_ROOT"

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would deploy web application to Vercel"
        return 0
    fi

    # Set deployment flags based on environment
    local deploy_flags=""
    if [[ $ENVIRONMENT == "production" ]]; then
        deploy_flags="--prod"
    fi

    # Deploy with Vercel
    local deployment_url
    deployment_url=$(vercel deploy $deploy_flags --confirm)

    log INFO "Web application deployed successfully"
    log INFO "Deployment URL: $deployment_url"

    # Run health check
    if command -v node &> /dev/null; then
        log INFO "Running health check..."
        if node "$PROJECT_ROOT/scripts/build-config.js" web health-check "$deployment_url"; then
            log INFO "Health check passed"
        else
            log WARN "Health check failed"
        fi
    fi
}

deploy_mobile() {
    log INFO "Deploying mobile application with EAS..."

    cd "$PROJECT_ROOT/apps/mobile"

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would deploy mobile application with EAS"
        return 0
    fi

    # Set build profile based on environment
    local profile=$ENVIRONMENT
    if [[ $ENVIRONMENT == "development" ]]; then
        profile="preview"
    fi

    # Build and deploy
    if [[ $PLATFORM == "all" ]]; then
        eas build --platform all --profile "$profile" --non-interactive
    else
        eas build --platform "$PLATFORM" --profile "$profile" --non-interactive
    fi

    log INFO "Mobile application deployed successfully"

    # Publish OTA update for non-production builds
    if [[ $ENVIRONMENT != "production" ]]; then
        log INFO "Publishing OTA update..."
        eas update --channel "$ENVIRONMENT" --message "Deployment from CI/CD"
    fi
}

deploy_docker() {
    log INFO "Deploying Docker container..."

    cd "$PROJECT_ROOT"

    if [[ $DRY_RUN == true ]]; then
        log INFO "[DRY RUN] Would deploy Docker container"
        return 0
    fi

    # Build Docker image
    local image_tag="starter-template:$ENVIRONMENT-$(git rev-parse --short HEAD)"
    docker build -t "$image_tag" .

    # Push to registry
    case $REGISTRY in
        ecr)
            deploy_to_ecr "$image_tag"
            ;;
        gcr)
            deploy_to_gcr "$image_tag"
            ;;
        docker)
            deploy_to_docker_hub "$image_tag"
            ;;
        *)
            log INFO "No registry specified, image built locally: $image_tag"
            ;;
    esac

    log INFO "Docker deployment completed"
}

deploy_to_ecr() {
    local image_tag=$1
    log INFO "Pushing to Amazon ECR..."

    # Login to ECR
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ECR_REGISTRY"

    # Tag and push
    docker tag "$image_tag" "$ECR_REGISTRY/starter-template:$ENVIRONMENT"
    docker tag "$image_tag" "$ECR_REGISTRY/starter-template:latest"
    docker push "$ECR_REGISTRY/starter-template:$ENVIRONMENT"
    docker push "$ECR_REGISTRY/starter-template:latest"
}

deploy_to_gcr() {
    local image_tag=$1
    log INFO "Pushing to Google Container Registry..."

    # Configure Docker for GCR
    gcloud auth configure-docker

    # Tag and push
    docker tag "$image_tag" "gcr.io/$GCP_PROJECT_ID/starter-template:$ENVIRONMENT"
    docker tag "$image_tag" "gcr.io/$GCP_PROJECT_ID/starter-template:latest"
    docker push "gcr.io/$GCP_PROJECT_ID/starter-template:$ENVIRONMENT"
    docker push "gcr.io/$GCP_PROJECT_ID/starter-template:latest"
}

deploy_to_docker_hub() {
    local image_tag=$1
    log INFO "Pushing to Docker Hub..."

    # Login to Docker Hub
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

    # Tag and push
    docker tag "$image_tag" "$DOCKER_USERNAME/starter-template:$ENVIRONMENT"
    docker tag "$image_tag" "$DOCKER_USERNAME/starter-template:latest"
    docker push "$DOCKER_USERNAME/starter-template:$ENVIRONMENT"
    docker push "$DOCKER_USERNAME/starter-template:latest"
}

confirm_deployment() {
    if [[ $FORCE == true || $DRY_RUN == true ]]; then
        return 0
    fi

    echo
    log INFO "Deployment Summary:"
    log INFO "  Target: $TARGET"
    log INFO "  Environment: $ENVIRONMENT"
    log INFO "  Platform: $PLATFORM"
    [[ -n "$REGISTRY" ]] && log INFO "  Registry: $REGISTRY"
    echo

    read -p "Do you want to continue with this deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log INFO "Deployment cancelled"
        exit 0
    fi
}

cleanup() {
    log DEBUG "Cleaning up temporary files..."
    # Add any cleanup logic here
}

main() {
    # Initialize logging
    echo "=== Deployment started at $(date) ===" >> "$DEPLOY_LOG"

    # Set up error handling
    trap cleanup EXIT

    log INFO "Starting deployment process..."

    # Parse command line arguments
    parse_args "$@"

    # Show deployment summary and confirm
    confirm_deployment

    # Check prerequisites
    check_prerequisites

    # Load environment configuration
    load_environment

    # Run tests
    run_tests

    # Build application
    build_application

    # Deploy based on target
    case $TARGET in
        web)
            deploy_web
            ;;
        mobile)
            deploy_mobile
            ;;
        docker)
            deploy_docker
            ;;
        all)
            deploy_web
            deploy_mobile
            ;;
    esac

    log INFO "Deployment completed successfully!"
    echo "=== Deployment completed at $(date) ===" >> "$DEPLOY_LOG"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi