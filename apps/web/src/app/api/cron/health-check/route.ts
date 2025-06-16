import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@starter-template/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Scheduled health check that runs every 5 minutes
// This can be used to send alerts or update external monitoring services
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const supabase = createSupabaseServiceClient();
    
    // Perform comprehensive health checks
    const healthChecks = await Promise.allSettled([
      // Database connectivity
      supabase.from('profiles').select('count').limit(1),
      
      // Authentication service
      supabase.auth.getUser(),
      
      // Storage service (if configured)
      supabase.storage.listBuckets(),
    ]);
    
    const results = {
      timestamp: new Date().toISOString(),
      database: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      auth: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      storage: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      errors: healthChecks
        .map((check, index) => ({
          service: ['database', 'auth', 'storage'][index],
          error: check.status === 'rejected' ? check.reason : null,
        }))
        .filter(item => item.error !== null),
    };
    
    // Here you could send alerts to external monitoring services
    // if any services are unhealthy
    
    if (results.errors.length > 0) {
      console.error('Health check failed:', results.errors);
      
      // Example: Send to external monitoring service
      // await sendAlert({
      //   type: 'health_check_failed',
      //   errors: results.errors,
      //   timestamp: results.timestamp,
      // });
    }
    
    return NextResponse.json({
      status: 'completed',
      results,
    });
  } catch (error) {
    console.error('Cron health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Optional: Send alerts to external services
async function sendAlert(alert: {
  type: string;
  errors: any[];
  timestamp: string;
}) {
  // Example implementations:
  
  // 1. Send to Slack webhook
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   await fetch(process.env.SLACK_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `🚨 Health Check Alert: ${alert.errors.length} service(s) failing`,
  //       blocks: [
  //         {
  //           type: 'section',
  //           text: {
  //             type: 'mrkdwn',
  //             text: `*Health Check Failed*\nTime: ${alert.timestamp}\nErrors: ${alert.errors.length}`,
  //           },
  //         },
  //       ],
  //     }),
  //   });
  // }
  
  // 2. Send to Discord webhook
  // if (process.env.DISCORD_WEBHOOK_URL) {
  //   await fetch(process.env.DISCORD_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       content: `🚨 Health check failed: ${alert.errors.length} service(s) down`,
  //       embeds: [
  //         {
  //           title: 'Health Check Alert',
  //           color: 0xff0000,
  //           timestamp: alert.timestamp,
  //           fields: alert.errors.map(error => ({
  //             name: error.service,
  //             value: error.error.message || 'Unknown error',
  //             inline: true,
  //           })),
  //         },
  //       ],
  //     }),
  //   });
  // }
  
  // 3. Send to email service
  // if (process.env.EMAIL_WEBHOOK_URL) {
  //   await fetch(process.env.EMAIL_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       to: process.env.ALERT_EMAIL,
  //       subject: 'Health Check Alert - Services Down',
  //       html: `
  //         <h2>Health Check Alert</h2>
  //         <p><strong>Time:</strong> ${alert.timestamp}</p>
  //         <p><strong>Failed Services:</strong> ${alert.errors.length}</p>
  //         <ul>
  //           ${alert.errors.map(error => `
  //             <li><strong>${error.service}:</strong> ${error.error.message}</li>
  //           `).join('')}
  //         </ul>
  //       `,
  //     }),
  //   });
  // }
}