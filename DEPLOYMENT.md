# 🚀 Deployment Guide - Starter Template

This comprehensive guide covers all aspects of deploying the Starter Template across multiple platforms including Vercel (web), EAS (mobile), and Docker (containerized).

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Platform Setup](#platform-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
- [CI/CD Pipelines](#cicd-pipelines)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## 🚀 Quick Start

### Automated Setup
```bash
# Setup all deployment platforms
./scripts/setup-deployment.sh --all

# Deploy to staging
./scripts/deploy.sh web staging
./scripts/deploy.sh mobile staging

# Deploy to production
./scripts/deploy.sh web production
./scripts/deploy.sh mobile production
```

### Manual Deployment
```bash
# Web application
vercel --prod

# Mobile application
cd apps/mobile && eas build --platform all --profile production
```

## 📚 Prerequisites

### Required Tools
- **Node.js** 18.17.0+
- **pnpm** 8.15.0+
- **Git** (latest)

### Platform-Specific Requirements

#### Web Deployment (Vercel)
- Vercel CLI: `npm install -g vercel`
- Vercel account with project linked

#### Mobile Deployment (EAS)
- EAS CLI: `npm install -g eas-cli`
- Expo CLI: `npm install -g expo-cli`
- Expo account
- Apple Developer account (for iOS)
- Google Play Console account (for Android)

#### Docker Deployment
- Docker Desktop or Docker Engine
- Container registry access (Docker Hub, ECR, GCR)

## 🛠️ Platform Setup

### 1. Vercel Setup

```bash
# Install and login
npm install -g vercel
vercel login

# Link project
cd /path/to/starter-template
vercel link

# Configure environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

### 2. EAS Setup

```bash
# Install and login
npm install -g eas-cli expo-cli
eas login

# Configure EAS
cd apps/mobile
eas build:configure

# Set up app store credentials
eas credentials:configure
```

### 3. GitHub Actions Setup

Configure the following secrets in your GitHub repository:

**Vercel Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Expo Secrets:**
- `EXPO_TOKEN`

**Environment Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

## 🌍 Environment Configuration

### Environment Files

The project uses environment-specific configuration files:

```
.env.development    # Local development
.env.staging       # Staging environment
.env.production    # Production environment
```

### Required Variables

#### Web Application
```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side Only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=https://your-domain.com
CRON_SECRET=your-cron-secret
```

#### Mobile Application
```bash
# Expo Configuration
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_APP_VARIANT=production
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Environment Validation

Use the build configuration script to validate environments:

```bash
# Validate environment variables
node scripts/build-config.js web validate
node scripts/build-config.js mobile validate
```

## 🎯 Deployment Methods

### Web Application Deployment

#### 1. Vercel (Recommended)

**Automatic Deployment:**
```bash
# Staging
git push origin develop

# Production
git push origin main
```

**Manual Deployment:**
```bash
# Deploy to staging
./scripts/deploy.sh web staging

# Deploy to production
./scripts/deploy.sh web production --force
```

**Direct Vercel CLI:**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### 2. Docker Deployment

**Build and Deploy:**
```bash
# Build Docker image
docker build -t starter-template:latest .

# Run locally
docker run -p 3000:3000 starter-template:latest

# Deploy to registry
./scripts/deploy.sh docker production --registry ecr
```

**Docker Compose:**
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

### Mobile Application Deployment

#### 1. EAS Build (Recommended)

**Automatic Deployment:**
```bash
# Triggered by CI/CD on push to main/develop
```

**Manual Deployment:**
```bash
# All platforms
./scripts/deploy.sh mobile production --platform all

# iOS only
./scripts/deploy.sh mobile production --platform ios

# Android only
./scripts/deploy.sh mobile production --platform android
```

**Direct EAS CLI:**
```bash
cd apps/mobile

# Development build
eas build --platform all --profile development

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --latest
```

#### 2. Over-the-Air (OTA) Updates

**Deploy OTA Update:**
```bash
cd apps/mobile

# To staging
eas update --channel staging --message "Bug fixes"

# To production
eas update --channel production --message "Feature update"
```

## 🔄 CI/CD Pipelines

### GitHub Actions Workflows

#### Web Deployment (`.github/workflows/deploy-web.yml`)

**Triggers:**
- Push to `main` → Production deployment
- Push to `develop` → Staging deployment
- Manual workflow dispatch

**Pipeline Steps:**
1. Environment setup and validation
2. Install dependencies and build packages
3. Run tests and type checking
4. Build web application
5. Deploy to Vercel
6. Run post-deployment health checks
7. Send notifications

#### Mobile Deployment (`.github/workflows/deploy-mobile.yml`)

**Triggers:**
- Push to `main` → Production build
- Push to `develop` → Staging build
- Manual workflow dispatch with platform selection

**Pipeline Steps:**
1. Environment configuration
2. Install dependencies and build packages
3. Run mobile tests
4. Build iOS/Android applications with EAS
5. Publish OTA updates (non-production)
6. Submit to app stores (production, optional)

### Manual Workflow Triggers

**Web Deployment:**
1. Go to GitHub Actions → "Deploy Web Application"
2. Click "Run workflow"
3. Select environment (staging/production)
4. Click "Run workflow"

**Mobile Deployment:**
1. Go to GitHub Actions → "Deploy Mobile Application"
2. Click "Run workflow"
3. Select platform (ios/android/all)
4. Select profile (development/staging/production)
5. Choose whether to submit to stores
6. Click "Run workflow"

## 📊 Monitoring & Health Checks

### Health Check Endpoints

#### Web Application
```bash
# Basic health check
curl https://your-domain.com/api/health

# Detailed health information
curl https://your-domain.com/api/health | jq '.'
```

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    },
    "memory": {
      "status": "healthy",
      "usage": {
        "used": 256,
        "total": 512,
        "percentage": 50
      }
    }
  }
}
```

#### Automated Health Checks

**Vercel Cron Jobs:**
- Health check every 5 minutes: `/api/cron/health-check`
- Daily cleanup at midnight: `/api/cron/cleanup`

**GitHub Actions Health Checks:**
- Post-deployment verification
- Smoke tests on critical endpoints
- E2E tests in staging environment

### Monitoring Tools

#### Application Performance Monitoring
- **Vercel Analytics**: Automatic web vitals tracking
- **Sentry**: Error tracking and performance monitoring
- **Supabase Dashboard**: Database performance metrics

#### Log Aggregation
- **Vercel Logs**: Real-time application logs
- **GitHub Actions**: CI/CD pipeline logs
- **EAS Logs**: Mobile build and deployment logs

## 🔄 Rollback Procedures

### Web Application Rollback

#### Automated Rollback (Vercel)
```bash
# List recent deployments
vercel list

# Promote previous deployment
vercel promote <deployment-url>
```

#### Script-based Rollback
```bash
# Interactive rollback
./scripts/rollback.sh web production

# Rollback to specific version
./scripts/rollback.sh web production --version <deployment-id>

# Force rollback without confirmation
./scripts/rollback.sh web production --version <deployment-id> --force
```

### Mobile Application Rollback

#### OTA Rollback
```bash
cd apps/mobile

# Rollback to previous update
eas update --channel production --message "Rollback" --branch previous-stable

# Publish specific version
eas update --channel production --branch <commit-hash>
```

#### Binary Rollback
For critical issues requiring binary rollback:
1. Remove app from app stores (temporary)
2. Re-publish previous stable version
3. Force update users through app store

### Docker Rollback

#### Container Rollback
```bash
# List available images
docker images starter-template

# Stop current container
docker stop starter-template-web

# Start previous version
docker run -d --name starter-template-web starter-template:previous-tag
```

#### Orchestration Rollback
```bash
# Kubernetes
kubectl rollout undo deployment/starter-template-web

# Docker Swarm
docker service update --rollback starter-template-web
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures

**Symptom:** Build fails with dependency errors
```bash
# Solution: Clear caches and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Symptom:** TypeScript compilation errors
```bash
# Solution: Run type checking
pnpm type-check
# Fix reported errors before deploying
```

#### Deployment Failures

**Symptom:** Vercel deployment fails
```bash
# Check Vercel logs
vercel logs <deployment-url>

# Verify environment variables
vercel env ls
```

**Symptom:** EAS build fails
```bash
# Check build logs
eas build:list
eas build:view <build-id>

# Verify credentials
eas credentials
```

#### Runtime Issues

**Symptom:** Health check failures
```bash
# Check application logs
vercel logs --follow

# Test database connectivity
node scripts/build-config.js web health-check <url>
```

**Symptom:** Environment variable issues
```bash
# Validate environment
node scripts/build-config.js web validate
```

### Emergency Procedures

#### Critical Production Issues
1. **Immediate Rollback**
   ```bash
   ./scripts/rollback.sh web production --force
   ```

2. **Incident Response**
   - Check health dashboards
   - Review error logs
   - Notify stakeholders
   - Document incident

3. **Post-Incident**
   - Root cause analysis
   - Update monitoring
   - Improve deployment process

## 🔒 Security Considerations

### Secret Management

#### Environment Variables
- **Never commit secrets** to version control
- Use platform-specific secret management:
  - Vercel: Environment Variables
  - GitHub: Repository Secrets
  - EAS: Expo Secrets

#### Secret Rotation
```bash
# Generate new secrets
openssl rand -base64 32

# Update in all environments
vercel env add NEXTAUTH_SECRET production
gh secret set NEXTAUTH_SECRET --body "<new-secret>"
```

### Security Headers

The application includes security headers via `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Database Security

- **Row Level Security (RLS)** enabled on all tables
- **Service role key** only used server-side
- **Anonymous key** with limited permissions for client-side

### Monitoring Security

- **Security audits**: `pnpm audit`
- **Dependency updates**: Automated with Dependabot
- **Penetration testing**: Regular security assessments

## 📞 Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Supabase Documentation](https://supabase.com/docs)

### Support Channels
- **GitHub Issues**: Technical support and bug reports
- **Discord**: Community support
- **Email**: Critical production issues

### Monitoring Dashboards
- **Vercel Dashboard**: Application metrics and logs
- **Supabase Dashboard**: Database and API metrics
- **GitHub Actions**: CI/CD pipeline status

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations applied
- [ ] Security audit completed

### Deployment
- [ ] Staging deployment successful
- [ ] Health checks passing
- [ ] Performance tests completed
- [ ] Rollback plan ready

### Post-Deployment
- [ ] Production health checks passing
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Documentation updated

This deployment guide ensures reliable, secure, and scalable deployment of the Starter Template across all supported platforms.