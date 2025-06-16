import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@starter-template/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'unhealthy';
      usage: {
        used: number;
        total: number;
        percentage: number;
      };
    };
    disk: {
      status: 'healthy' | 'unhealthy';
      usage?: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

async function checkDatabase(): Promise<HealthCheck['checks']['database']> {
  try {
    const start = Date.now();
    const supabase = createSupabaseServiceClient();
    
    // Simple health check query
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

function checkMemory(): HealthCheck['checks']['memory'] {
  try {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal;
    const usedMemory = usage.heapUsed;
    const percentage = (usedMemory / totalMemory) * 100;
    
    return {
      status: percentage > 90 ? 'unhealthy' : 'healthy',
      usage: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(percentage),
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      usage: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    };
  }
}

function checkDisk(): HealthCheck['checks']['disk'] {
  // In serverless environments, disk checks are not applicable
  // This is a placeholder for containerized deployments
  return {
    status: 'healthy',
    usage: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const [databaseCheck, memoryCheck, diskCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkDisk()),
    ]);
    
    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      disk: diskCheck,
    };
    
    // Determine overall status
    let status: HealthCheck['status'] = 'healthy';
    
    if (checks.database.status === 'unhealthy') {
      status = 'unhealthy';
    } else if (
      checks.memory.status === 'unhealthy' || 
      checks.disk.status === 'unhealthy'
    ) {
      status = 'degraded';
    }
    
    const healthCheck: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks,
    };
    
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'unhealthy',
          error: 'Health check failed',
        },
        memory: {
          status: 'unhealthy',
          usage: { used: 0, total: 0, percentage: 0 },
        },
        disk: {
          status: 'unhealthy',
        },
      },
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

// Simple health check for load balancers
export async function HEAD(): Promise<NextResponse> {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      return new NextResponse(null, { status: 503 });
    }
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}