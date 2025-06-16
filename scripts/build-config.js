#!/usr/bin/env node

/**
 * Build Configuration Script
 * 
 * This script manages environment-specific build configurations and validates
 * environment variables before deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Environment validation rules
const ENV_VALIDATION = {
  development: {
    required: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
    optional: [
      'DATABASE_URL',
      'REDIS_URL',
      'SMTP_HOST',
    ],
  },
  staging: {
    required: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'NEXT_PUBLIC_APP_URL',
    ],
    optional: [
      'DATABASE_URL',
      'REDIS_URL',
      'SMTP_HOST',
      'STRIPE_PUBLIC_KEY',
      'SENTRY_DSN',
    ],
  },
  production: {
    required: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'NEXT_PUBLIC_APP_URL',
      'CRON_SECRET',
    ],
    sensitive: [
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY',
      'REDIS_PASSWORD',
      'CRON_SECRET',
    ],
  },
};

// Build configurations for different targets
const BUILD_CONFIGS = {
  web: {
    development: {
      command: 'pnpm build --filter=web',
      env: {
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
    staging: {
      command: 'pnpm build --filter=web',
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        ANALYZE: 'false',
      },
    },
    production: {
      command: 'pnpm build --filter=web',
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        ANALYZE: 'true',
      },
    },
  },
  mobile: {
    development: {
      command: 'eas build --platform all --profile development',
      env: {
        NODE_ENV: 'development',
        EXPO_USE_FAST_RESOLVER: '1',
      },
    },
    staging: {
      command: 'eas build --platform all --profile staging',
      env: {
        NODE_ENV: 'staging',
        EXPO_USE_FAST_RESOLVER: '1',
      },
    },
    production: {
      command: 'eas build --platform all --profile production',
      env: {
        NODE_ENV: 'production',
        EXPO_USE_FAST_RESOLVER: '1',
      },
    },
  },
};

class BuildConfigManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.target = process.argv[2] || 'web';
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    }[level];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  validateEnvironment() {
    this.log(`Validating environment: ${this.environment}`);
    
    const validation = ENV_VALIDATION[this.environment];
    if (!validation) {
      throw new Error(`No validation rules for environment: ${this.environment}`);
    }

    const missing = [];
    const warnings = [];

    // Check required variables
    for (const variable of validation.required) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }

    // Check optional variables
    if (validation.optional) {
      for (const variable of validation.optional) {
        if (!process.env[variable]) {
          warnings.push(variable);
        }
      }
    }

    // Check sensitive variables in production
    if (this.environment === 'production' && validation.sensitive) {
      for (const variable of validation.sensitive) {
        const value = process.env[variable];
        if (value) {
          // Check for common weak patterns
          if (
            value.includes('test') ||
            value.includes('dev') ||
            value.includes('example') ||
            value.length < 16
          ) {
            this.log(
              `⚠️ Variable ${variable} may be using a test/weak value in production`,
              'warn'
            );
          }
        }
      }
    }

    if (missing.length > 0) {
      this.log(`Missing required environment variables: ${missing.join(', ')}`, 'error');
      throw new Error('Environment validation failed');
    }

    if (warnings.length > 0 && this.verbose) {
      this.log(`Missing optional environment variables: ${warnings.join(', ')}`, 'warn');
    }

    this.log('Environment validation passed');
  }

  loadEnvironmentFile() {
    const envFile = path.join(process.cwd(), `.env.${this.environment}`);
    
    if (fs.existsSync(envFile)) {
      this.log(`Loading environment file: .env.${this.environment}`);
      
      // Load environment variables from file
      const envContent = fs.readFileSync(envFile, 'utf8');
      const envLines = envContent.split('\n').filter(line => 
        line.trim() && !line.startsWith('#')
      );
      
      for (const line of envLines) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    } else {
      this.log(`Environment file not found: .env.${this.environment}`, 'warn');
    }
  }

  generateBuildInfo() {
    const buildInfo = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      target: this.target,
      version: process.env.npm_package_version || '1.0.0',
      commit: this.getGitCommit(),
      branch: this.getGitBranch(),
      nodeVersion: process.version,
    };

    // Write build info for runtime access
    const buildInfoPath = path.join(process.cwd(), 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
    this.log(`Build info generated: ${buildInfoPath}`);
    
    return buildInfo;
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  prepareBuild() {
    this.log(`Preparing build for ${this.target} in ${this.environment} environment`);

    // Load environment file
    this.loadEnvironmentFile();

    // Validate environment
    this.validateEnvironment();

    // Generate build info
    const buildInfo = this.generateBuildInfo();

    // Get build configuration
    const config = BUILD_CONFIGS[this.target]?.[this.environment];
    if (!config) {
      throw new Error(`No build configuration for ${this.target} in ${this.environment}`);
    }

    // Set build environment variables
    Object.assign(process.env, config.env);

    this.log('Build preparation completed');
    
    return { buildInfo, config };
  }

  runBuild() {
    try {
      const { buildInfo, config } = this.prepareBuild();

      this.log(`Starting build with command: ${config.command}`);
      
      // Execute build command
      execSync(config.command, {
        stdio: 'inherit',
        env: process.env,
        cwd: this.target === 'mobile' ? path.join(process.cwd(), 'apps/mobile') : process.cwd(),
      });

      this.log('Build completed successfully');
      
      return buildInfo;
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  // Health check for deployed applications
  async healthCheck(url) {
    this.log(`Running health check against: ${url}`);
    
    try {
      const response = await fetch(`${url}/api/health`);
      const health = await response.json();
      
      if (health.status === 'healthy') {
        this.log('Health check passed');
        return true;
      } else {
        this.log(`Health check failed: ${health.status}`, 'warn');
        return false;
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`, 'error');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const manager = new BuildConfigManager();
  
  const command = process.argv[3];
  
  switch (command) {
    case 'validate':
      manager.loadEnvironmentFile();
      manager.validateEnvironment();
      break;
    
    case 'info':
      manager.loadEnvironmentFile();
      const buildInfo = manager.generateBuildInfo();
      console.log(JSON.stringify(buildInfo, null, 2));
      break;
    
    case 'health-check':
      const url = process.argv[4];
      if (!url) {
        console.error('Usage: node build-config.js <target> health-check <url>');
        process.exit(1);
      }
      manager.healthCheck(url).then(success => {
        process.exit(success ? 0 : 1);
      });
      break;
    
    default:
      manager.runBuild();
      break;
  }
}

module.exports = BuildConfigManager;