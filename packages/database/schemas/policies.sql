-- Row Level Security (RLS) Policies for Starter Template
-- This file contains all RLS policies for secure data access

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES TABLE POLICIES
-- =============================================================================

-- Users can view all public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- =============================================================================
-- POSTS TABLE POLICIES
-- =============================================================================

-- Everyone can view published posts
CREATE POLICY "Published posts are viewable by everyone" ON public.posts
    FOR SELECT USING (
        status = 'published' 
        OR auth.uid() = author_id
    );

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    );

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- =============================================================================
-- COMMENTS TABLE POLICIES
-- =============================================================================

-- Everyone can view approved comments
CREATE POLICY "Approved comments are viewable by everyone" ON public.comments
    FOR SELECT USING (
        status = 'approved'
        OR auth.uid() = author_id
        OR auth.uid() IN (
            SELECT author_id FROM public.posts WHERE id = post_id
        )
    );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND (auth.uid() = author_id OR author_id IS NULL)
    );

-- Comment authors can update their own comments (within time limit)
CREATE POLICY "Authors can update own comments" ON public.comments
    FOR UPDATE USING (
        auth.uid() = author_id 
        AND created_at > NOW() - INTERVAL '1 hour'
    );

-- Comment authors can delete their own comments
CREATE POLICY "Authors can delete own comments" ON public.comments
    FOR DELETE USING (
        auth.uid() = author_id
        OR auth.uid() IN (
            SELECT author_id FROM public.posts WHERE id = post_id
        )
    );

-- =============================================================================
-- CATEGORIES TABLE POLICIES
-- =============================================================================

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Only authenticated users can create categories
CREATE POLICY "Authenticated users can create categories" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update categories
CREATE POLICY "Authenticated users can update categories" ON public.categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete categories
CREATE POLICY "Authenticated users can delete categories" ON public.categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================================================
-- POST_CATEGORIES TABLE POLICIES
-- =============================================================================

-- Everyone can view post-category relationships
CREATE POLICY "Post categories are viewable by everyone" ON public.post_categories
    FOR SELECT USING (true);

-- Post authors can manage their post categories
CREATE POLICY "Post authors can manage categories" ON public.post_categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT author_id FROM public.posts WHERE id = post_id
        )
    );

CREATE POLICY "Post authors can update post categories" ON public.post_categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT author_id FROM public.posts WHERE id = post_id
        )
    );

CREATE POLICY "Post authors can delete post categories" ON public.post_categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT author_id FROM public.posts WHERE id = post_id
        )
    );

-- =============================================================================
-- ADVANCED POLICIES (Optional - Uncomment to enable)
-- =============================================================================

-- Admin role policies (requires custom claims in JWT)
/*
-- Admins can do everything
CREATE POLICY "Admins have full access to posts" ON public.posts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins have full access to comments" ON public.comments
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Admins have full access to categories" ON public.categories
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );
*/

-- Moderator policies for comment management
/*
CREATE POLICY "Moderators can manage comments" ON public.comments
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'moderator')
    );
*/

-- Team member policies for collaborative posts
/*
CREATE POLICY "Team members can edit shared posts" ON public.posts
    FOR UPDATE USING (
        auth.uid() = author_id 
        OR auth.uid() IN (
            SELECT unnest(string_to_array(metadata->>'collaborators', ','))::uuid
            FROM public.posts 
            WHERE id = posts.id
        )
    );
*/

-- Time-based policies
/*
CREATE POLICY "Comments can only be edited within 24 hours" ON public.comments
    FOR UPDATE USING (
        auth.uid() = author_id 
        AND created_at > NOW() - INTERVAL '24 hours'
    );
*/

-- Content moderation policies
/*
CREATE POLICY "Hide flagged content from public" ON public.posts
    FOR SELECT USING (
        status = 'published' 
        AND (metadata->>'flagged')::boolean IS NOT TRUE
        OR auth.uid() = author_id
        OR auth.jwt() ->> 'role' IN ('admin', 'moderator')
    );
*/

-- =============================================================================
-- UTILITY FUNCTIONS FOR POLICY MANAGEMENT
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(auth.jwt() ->> 'role' = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() ->> 'role' IN ('admin', 'moderator'), 
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a post
CREATE OR REPLACE FUNCTION public.owns_post(post_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.posts 
        WHERE id = post_id 
        AND author_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can moderate content
CREATE OR REPLACE FUNCTION public.can_moderate()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() ->> 'role' IN ('admin', 'moderator'),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- POLICY TESTING QUERIES (Development Only)
-- =============================================================================

/*
-- Test queries to verify policies work correctly
-- Run these with different user contexts to verify access control

-- Test profile access
SELECT * FROM public.profiles; -- Should show all profiles

-- Test post access
SELECT * FROM public.posts; -- Should only show published posts or own posts

-- Test comment access
SELECT * FROM public.comments; -- Should only show approved comments or own comments

-- Test category access
SELECT * FROM public.categories; -- Should show all categories

-- Test admin functions
SELECT public.is_admin(); -- Should return true/false based on JWT
SELECT public.is_moderator(); -- Should return true/false based on JWT
*/