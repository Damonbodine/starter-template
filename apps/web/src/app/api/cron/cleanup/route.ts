import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@starter-template/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Daily cleanup cron job that runs at midnight UTC
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const supabase = createSupabaseServiceClient();
    const now = new Date();
    const results: any[] = [];
    
    // 1. Clean up expired sessions (older than 30 days)
    try {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // This would be a custom table for session tracking if you have one
      // const { data: expiredSessions, error: sessionError } = await supabase
      //   .from('user_sessions')
      //   .delete()
      //   .lt('expires_at', thirtyDaysAgo.toISOString());
      
      // if (sessionError) throw sessionError;
      
      results.push({
        task: 'cleanup_expired_sessions',
        status: 'completed',
        // count: expiredSessions?.length || 0,
        count: 0, // Placeholder
      });
    } catch (error) {
      results.push({
        task: 'cleanup_expired_sessions',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // 2. Clean up draft posts older than 7 days with no activity
    try {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: oldDrafts, error: draftError } = await supabase
        .from('posts')
        .delete()
        .eq('status', 'draft')
        .lt('updated_at', sevenDaysAgo.toISOString())
        .select('id');
      
      if (draftError) throw draftError;
      
      results.push({
        task: 'cleanup_old_drafts',
        status: 'completed',
        count: oldDrafts?.length || 0,
      });
    } catch (error) {
      results.push({
        task: 'cleanup_old_drafts',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // 3. Clean up orphaned comments (posts that no longer exist)
    try {
      const { data: orphanedComments, error: commentError } = await supabase
        .from('comments')
        .delete()
        .not('post_id', 'in', `(SELECT id FROM posts)`)
        .select('id');
      
      if (commentError) throw commentError;
      
      results.push({
        task: 'cleanup_orphaned_comments',
        status: 'completed',
        count: orphanedComments?.length || 0,
      });
    } catch (error) {
      results.push({
        task: 'cleanup_orphaned_comments',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // 4. Clean up unused file uploads (files not referenced by any posts)
    try {
      // List all files in storage
      const { data: files, error: listError } = await supabase.storage
        .from('uploads')
        .list('', { limit: 1000 });
      
      if (listError) throw listError;
      
      let deletedCount = 0;
      
      if (files && files.length > 0) {
        // Check which files are referenced in posts
        const { data: referencedFiles, error: refError } = await supabase
          .from('posts')
          .select('content')
          .not('content', 'is', null);
        
        if (refError) throw refError;
        
        // Extract file URLs from post content
        const referencedFileNames = new Set<string>();
        referencedFiles?.forEach(post => {
          const matches = post.content?.match(/\/uploads\/([^"'\s]+)/g) || [];
          matches.forEach(match => {
            const fileName = match.replace('/uploads/', '');
            referencedFileNames.add(fileName);
          });
        });
        
        // Delete unreferenced files older than 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        for (const file of files) {
          const fileDate = new Date(file.created_at);
          if (
            !referencedFileNames.has(file.name) &&
            fileDate < oneDayAgo
          ) {
            const { error: deleteError } = await supabase.storage
              .from('uploads')
              .remove([file.name]);
            
            if (!deleteError) {
              deletedCount++;
            }
          }
        }
      }
      
      results.push({
        task: 'cleanup_unused_files',
        status: 'completed',
        count: deletedCount,
      });
    } catch (error) {
      results.push({
        task: 'cleanup_unused_files',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // 5. Update statistics and analytics
    try {
      // Example: Update daily statistics
      const { data: stats, error: statsError } = await supabase.rpc(
        'update_daily_stats',
        { date: now.toISOString().split('T')[0] }
      );
      
      // This would be a custom function in your database
      // CREATE OR REPLACE FUNCTION update_daily_stats(date text)
      // RETURNS void AS $$
      // BEGIN
      //   INSERT INTO daily_stats (date, total_posts, total_users, total_comments)
      //   VALUES (
      //     date::date,
      //     (SELECT COUNT(*) FROM posts WHERE DATE(created_at) = date::date),
      //     (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = date::date),
      //     (SELECT COUNT(*) FROM comments WHERE DATE(created_at) = date::date)
      //   )
      //   ON CONFLICT (date) DO UPDATE SET
      //     total_posts = EXCLUDED.total_posts,
      //     total_users = EXCLUDED.total_users,
      //     total_comments = EXCLUDED.total_comments;
      // END;
      // $$ LANGUAGE plpgsql;
      
      results.push({
        task: 'update_statistics',
        status: statsError ? 'failed' : 'completed',
        error: statsError?.message,
      });
    } catch (error) {
      results.push({
        task: 'update_statistics',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // Log cleanup results
    const successfulTasks = results.filter(r => r.status === 'completed');
    const failedTasks = results.filter(r => r.status === 'failed');
    
    console.log(`Cleanup completed: ${successfulTasks.length} successful, ${failedTasks.length} failed`);
    
    if (failedTasks.length > 0) {
      console.error('Failed cleanup tasks:', failedTasks);
    }
    
    return NextResponse.json({
      status: 'completed',
      timestamp: now.toISOString(),
      summary: {
        total_tasks: results.length,
        successful: successfulTasks.length,
        failed: failedTasks.length,
      },
      results,
    });
  } catch (error) {
    console.error('Cleanup cron job error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}