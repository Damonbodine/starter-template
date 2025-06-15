-- Seed data for the starter template database
-- This file contains sample data for development and testing

-- Insert sample categories
INSERT INTO public.categories (id, name, slug, description, color, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Technology', 'technology', 'Posts about technology and programming', '#3B82F6', '💻', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'web-development', 'Frontend and backend development', '#10B981', '🌐', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Mobile Development', 'mobile-development', 'iOS, Android, and cross-platform development', '#8B5CF6', '📱', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Design', 'design', 'UI/UX design and user experience', '#F59E0B', '🎨', 4),
('550e8400-e29b-41d4-a716-446655440005', 'DevOps', 'devops', 'Development operations and infrastructure', '#EF4444', '⚙️', 5);

-- Insert subcategories
INSERT INTO public.categories (id, name, slug, description, color, parent_id, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'React', 'react', 'React.js development', '#61DAFB', '550e8400-e29b-41d4-a716-446655440002', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Next.js', 'nextjs', 'Next.js framework', '#000000', '550e8400-e29b-41d4-a716-446655440002', 2),
('550e8400-e29b-41d4-a716-446655440013', 'React Native', 'react-native', 'React Native development', '#61DAFB', '550e8400-e29b-41d4-a716-446655440003', 1),
('550e8400-e29b-41d4-a716-446655440014', 'Flutter', 'flutter', 'Flutter development', '#02569B', '550e8400-e29b-41d4-a716-446655440003', 2),
('550e8400-e29b-41d4-a716-446655440015', 'Docker', 'docker', 'Docker containerization', '#2496ED', '550e8400-e29b-41d4-a716-446655440005', 1);

-- Note: For profiles and posts, we'll need actual user IDs from auth.users
-- This is just a template - real seed data should be inserted after user creation

-- Sample profiles (these would be created automatically via triggers)
-- But we can insert some sample data for testing if users exist

-- Create a function to insert sample data safely
CREATE OR REPLACE FUNCTION public.insert_sample_data()
RETURNS VOID AS $$
DECLARE
    sample_user_id UUID;
    sample_post_id UUID;
BEGIN
    -- Try to get the first user, or create a sample one for testing
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    IF sample_user_id IS NULL THEN
        -- For testing only - in production, users should be created through auth
        RAISE NOTICE 'No users found. Sample posts and comments will not be created.';
        RETURN;
    END IF;

    -- Update the profile for the sample user
    UPDATE public.profiles 
    SET 
        full_name = 'John Doe',
        bio = 'Full-stack developer passionate about React and TypeScript',
        website = 'https://johndoe.dev',
        location = 'San Francisco, CA'
    WHERE id = sample_user_id;

    -- Insert sample posts
    INSERT INTO public.posts (id, title, slug, content, excerpt, status, author_id, featured_image, tags, published_at) VALUES
    (
        uuid_generate_v4(),
        'Getting Started with React and TypeScript',
        'getting-started-react-typescript',
        'TypeScript has become an essential tool for React development. In this post, we''ll explore how to set up a new React project with TypeScript and the benefits it brings to your development workflow.',
        'Learn how to set up React with TypeScript for better type safety and developer experience.',
        'published',
        sample_user_id,
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        ARRAY['react', 'typescript', 'javascript', 'frontend'],
        NOW() - INTERVAL '2 days'
    ),
    (
        uuid_generate_v4(),
        'Building Mobile Apps with React Native',
        'building-mobile-apps-react-native',
        'React Native allows you to build native mobile applications using React. This comprehensive guide covers everything you need to know to get started with cross-platform mobile development.',
        'A comprehensive guide to React Native development for beginners.',
        'published',
        sample_user_id,
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        ARRAY['react-native', 'mobile', 'ios', 'android'],
        NOW() - INTERVAL '1 day'
    ),
    (
        uuid_generate_v4(),
        'Next.js 14 New Features',
        'nextjs-14-new-features',
        'Next.js 14 introduces several exciting new features including improved performance, better developer experience, and enhanced App Router capabilities.',
        'Explore the latest features in Next.js 14 and how they improve your development workflow.',
        'draft',
        sample_user_id,
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        ARRAY['nextjs', 'react', 'web-development'],
        NULL
    );

    -- Get a sample post ID for comments
    SELECT id INTO sample_post_id FROM public.posts WHERE author_id = sample_user_id LIMIT 1;

    -- Insert sample comments
    IF sample_post_id IS NOT NULL THEN
        INSERT INTO public.comments (post_id, author_id, content, status) VALUES
        (sample_post_id, sample_user_id, 'Great article! This really helped me understand TypeScript better.', 'approved'),
        (sample_post_id, NULL, 'Anonymous User', 'anonymous@example.com', 'Thanks for sharing this. Looking forward to more content like this.', 'approved'),
        (sample_post_id, NULL, 'React Developer', 'dev@example.com', 'Could you cover testing with TypeScript in a future post?', 'pending');
    END IF;

    -- Link posts to categories
    INSERT INTO public.post_categories (post_id, category_id)
    SELECT p.id, c.id
    FROM public.posts p, public.categories c
    WHERE p.author_id = sample_user_id
    AND c.slug IN ('technology', 'web-development', 'react', 'typescript');

    RAISE NOTICE 'Sample data inserted successfully.';
END;
$$ LANGUAGE plpgsql;

-- Call the function to insert sample data
-- SELECT public.insert_sample_data();