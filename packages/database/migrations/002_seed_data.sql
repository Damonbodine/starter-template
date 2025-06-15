-- Migration: 002_seed_data
-- Description: Seed data for categories and sample content
-- Created: 2025-06-15

-- Insert sample categories
INSERT INTO public.categories (id, name, slug, description, color, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Technology', 'technology', 'Posts about technology and programming', '#3B82F6', '💻', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'web-development', 'Frontend and backend development', '#10B981', '🌐', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Mobile Development', 'mobile-development', 'iOS, Android, and cross-platform development', '#8B5CF6', '📱', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Design', 'design', 'UI/UX design and user experience', '#F59E0B', '🎨', 4),
('550e8400-e29b-41d4-a716-446655440005', 'DevOps', 'devops', 'Development operations and infrastructure', '#EF4444', '⚙️', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert subcategories
INSERT INTO public.categories (id, name, slug, description, color, parent_id, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'React', 'react', 'React.js development', '#61DAFB', '550e8400-e29b-41d4-a716-446655440002', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Next.js', 'nextjs', 'Next.js framework', '#000000', '550e8400-e29b-41d4-a716-446655440002', 2),
('550e8400-e29b-41d4-a716-446655440013', 'React Native', 'react-native', 'React Native development', '#61DAFB', '550e8400-e29b-41d4-a716-446655440003', 1),
('550e8400-e29b-41d4-a716-446655440014', 'Flutter', 'flutter', 'Flutter development', '#02569B', '550e8400-e29b-41d4-a716-446655440003', 2),
('550e8400-e29b-41d4-a716-446655440015', 'Docker', 'docker', 'Docker containerization', '#2496ED', '550e8400-e29b-41d4-a716-446655440005', 1)
ON CONFLICT (id) DO NOTHING;

-- Create a function to insert sample data safely
CREATE OR REPLACE FUNCTION public.insert_sample_data()
RETURNS VOID AS $$
DECLARE
    sample_user_id UUID;
    sample_post_id UUID;
    sample_post_1_id UUID;
    sample_post_2_id UUID;
    sample_post_3_id UUID;
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

    -- Generate UUIDs for sample posts
    sample_post_1_id := uuid_generate_v4();
    sample_post_2_id := uuid_generate_v4();
    sample_post_3_id := uuid_generate_v4();

    -- Insert sample posts
    INSERT INTO public.posts (id, title, slug, content, excerpt, status, author_id, featured_image, tags, published_at) VALUES
    (
        sample_post_1_id,
        'Getting Started with React and TypeScript',
        'getting-started-react-typescript',
        'TypeScript has become an essential tool for React development. In this post, we''ll explore how to set up a new React project with TypeScript and the benefits it brings to your development workflow.

## Why TypeScript with React?

TypeScript adds static type checking to JavaScript, which helps catch errors at compile time rather than runtime. When combined with React, it provides:

- **Better Developer Experience**: IntelliSense, auto-completion, and refactoring tools
- **Type Safety**: Catch prop type errors and state management issues early
- **Self-Documenting Code**: Types serve as documentation for your components
- **Easier Refactoring**: Safe refactoring across large codebases

## Setting Up the Project

Let''s create a new React project with TypeScript:

```bash
npx create-react-app my-app --template typescript
cd my-app
npm start
```

## Component Types

Here''s how to type a simple React component:

```typescript
interface Props {
  name: string;
  age?: number;
}

const UserProfile: React.FC<Props> = ({ name, age }) => {
  return (
    <div>
      <h1>{name}</h1>
      {age && <p>Age: {age}</p>}
    </div>
  );
};
```

## Conclusion

TypeScript and React make a powerful combination that can significantly improve your development experience and code quality.',
        'Learn how to set up React with TypeScript for better type safety and developer experience.',
        'published',
        sample_user_id,
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        ARRAY['react', 'typescript', 'javascript', 'frontend'],
        NOW() - INTERVAL '2 days'
    ),
    (
        sample_post_2_id,
        'Building Mobile Apps with React Native',
        'building-mobile-apps-react-native',
        'React Native allows you to build native mobile applications using React. This comprehensive guide covers everything you need to know to get started with cross-platform mobile development.

## What is React Native?

React Native is a framework developed by Facebook that allows developers to build mobile applications using React and JavaScript. The key advantage is that you can write once and deploy to both iOS and Android platforms.

## Key Benefits

- **Cross-Platform Development**: Write once, run on both iOS and Android
- **Native Performance**: Uses native components for better performance
- **Hot Reloading**: See changes instantly during development
- **Large Community**: Extensive ecosystem and community support

## Getting Started

First, set up your development environment:

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create a new project
react-native init MyApp
cd MyApp

# Run on iOS
react-native run-ios

# Run on Android
react-native run-android
```

## Your First Component

Here''s a simple React Native component:

```javascript
import React from ''react'';
import { View, Text, StyleSheet } from ''react-native'';

const HelloWorld = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, React Native!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: ''center'',
    alignItems: ''center'',
  },
  text: {
    fontSize: 20,
    fontWeight: ''bold'',
  },
});

export default HelloWorld;
```

## Navigation

For navigation between screens, use React Navigation:

```bash
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context
```

## Conclusion

React Native provides a powerful way to build mobile applications with familiar React concepts. Start with simple components and gradually build more complex features as you learn.',
        'A comprehensive guide to React Native development for beginners.',
        'published',
        sample_user_id,
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        ARRAY['react-native', 'mobile', 'ios', 'android'],
        NOW() - INTERVAL '1 day'
    ),
    (
        sample_post_3_id,
        'Next.js 14 New Features',
        'nextjs-14-new-features',
        'Next.js 14 introduces several exciting new features including improved performance, better developer experience, and enhanced App Router capabilities.

## What''s New in Next.js 14

Next.js 14 brings significant improvements to the framework:

### 1. Turbopack (Beta)
- Up to 53% faster local server startup
- Up to 5x faster code updates with Fast Refresh
- Improved bundle optimization

### 2. Server Actions (Stable)
- Simplified form handling
- Better data mutation patterns
- Type-safe server-side functions

### 3. Partial Prerendering (Preview)
- Combines static and dynamic rendering
- Faster initial page loads
- Better SEO performance

## Getting Started

To upgrade to Next.js 14:

```bash
npm install next@latest react@latest react-dom@latest
```

## Server Actions Example

Here''s how to use Server Actions:

```typescript
// app/actions.ts
"use server"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  // Save to database
  // ...
  
  redirect("/posts");
}

// app/create-post/page.tsx
import { createPost } from "../actions";

export default function CreatePost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" />
      <textarea name="content" placeholder="Post content" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Performance Improvements

Next.js 14 includes several performance optimizations:

- Improved image optimization
- Better tree shaking
- Reduced bundle sizes
- Faster builds with Turbopack

## Migration Guide

Most applications can upgrade to Next.js 14 without breaking changes. However, check the migration guide for any specific considerations for your application.

## Conclusion

Next.js 14 represents a significant step forward in React development, offering improved performance, better developer experience, and new features that make building web applications even more enjoyable.',
        'Explore the latest features in Next.js 14 and how they improve your development workflow.',
        'draft',
        sample_user_id,
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        ARRAY['nextjs', 'react', 'web-development'],
        NULL
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Insert sample comments for the React TypeScript post
    INSERT INTO public.comments (post_id, author_id, content, status) VALUES
    (sample_post_1_id, sample_user_id, 'Great article! This really helped me understand TypeScript better. The examples are clear and practical.', 'approved'),
    (sample_post_1_id, NULL, 'Anonymous User', 'anonymous@example.com', 'Thanks for sharing this. Looking forward to more content like this.', 'approved'),
    (sample_post_1_id, NULL, 'React Developer', 'dev@example.com', 'Could you cover testing with TypeScript in a future post?', 'pending')
    ON CONFLICT DO NOTHING;

    -- Insert sample comments for the React Native post
    INSERT INTO public.comments (post_id, author_id, content, status) VALUES
    (sample_post_2_id, sample_user_id, 'Excellent introduction to React Native! The step-by-step approach makes it easy to follow.', 'approved'),
    (sample_post_2_id, NULL, 'Mobile Dev', 'mobile@example.com', 'Any plans to cover performance optimization in React Native?', 'approved')
    ON CONFLICT DO NOTHING;

    -- Link posts to categories
    INSERT INTO public.post_categories (post_id, category_id) VALUES
    -- React TypeScript post
    (sample_post_1_id, '550e8400-e29b-41d4-a716-446655440001'), -- Technology
    (sample_post_1_id, '550e8400-e29b-41d4-a716-446655440002'), -- Web Development
    (sample_post_1_id, '550e8400-e29b-41d4-a716-446655440011'), -- React
    -- React Native post
    (sample_post_2_id, '550e8400-e29b-41d4-a716-446655440001'), -- Technology
    (sample_post_2_id, '550e8400-e29b-41d4-a716-446655440003'), -- Mobile Development
    (sample_post_2_id, '550e8400-e29b-41d4-a716-446655440013'), -- React Native
    -- Next.js post
    (sample_post_3_id, '550e8400-e29b-41d4-a716-446655440001'), -- Technology
    (sample_post_3_id, '550e8400-e29b-41d4-a716-446655440002'), -- Web Development
    (sample_post_3_id, '550e8400-e29b-41d4-a716-446655440012')  -- Next.js
    ON CONFLICT (post_id, category_id) DO NOTHING;

    RAISE NOTICE 'Sample data inserted successfully.';
END;
$$ LANGUAGE plpgsql;

-- Record this migration
INSERT INTO public.schema_migrations (version, description) 
VALUES ('002', 'Seed data for categories and sample content')
ON CONFLICT (version) DO NOTHING;

-- Note: To insert sample data, call the function after users are created:
-- SELECT public.insert_sample_data();