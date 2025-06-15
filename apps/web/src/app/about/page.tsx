export default function AboutPage() {
  return (
    <div className="container relative">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          About This Template
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          A comprehensive monorepo starter designed to accelerate your development workflow.
        </p>
      </section>

      <section className="mx-auto max-w-[980px] py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">Why This Template?</h2>
          <p className="text-muted-foreground mb-6">
            This template brings together the best tools and practices for modern web and mobile development
            in a monorepo structure. It&apos;s designed to help teams start building immediately without
            spending days on configuration.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">🚀 Performance First</h3>
              <p className="text-sm text-muted-foreground">
                Optimized builds with Turborepo caching, tree-shaking, and code splitting
                ensure your apps load fast and stay fast.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">📱 Cross-Platform</h3>
              <p className="text-sm text-muted-foreground">
                Share code between web and mobile apps with properly configured workspaces
                and TypeScript path mappings.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">🎨 Beautiful UI</h3>
              <p className="text-sm text-muted-foreground">
                Pre-configured with Tailwind CSS and shadcn/ui components for consistent,
                accessible design across your apps.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">🛠️ Developer Experience</h3>
              <p className="text-sm text-muted-foreground">
                TypeScript, ESLint, Prettier, and Git hooks configured out of the box
                for a smooth development workflow.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Tech Stack</h2>
          <div className="rounded-lg border bg-card p-6">
            <ul className="space-y-2">
              <li><strong>Build System:</strong> Turborepo for fast, cached builds</li>
              <li><strong>Web Framework:</strong> Next.js 14 with App Router</li>
              <li><strong>Mobile Framework:</strong> Expo with React Native</li>
              <li><strong>Styling:</strong> Tailwind CSS with custom configuration</li>
              <li><strong>UI Components:</strong> shadcn/ui with Radix UI primitives</li>
              <li><strong>Database:</strong> Supabase with TypeScript types</li>
              <li><strong>Package Manager:</strong> pnpm for efficient dependency management</li>
              <li><strong>Language:</strong> TypeScript throughout</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Get Started</h2>
          <p className="text-muted-foreground mb-4">
            Clone this template and start building your next project:
          </p>
          <div className="rounded-lg border bg-muted p-4">
            <code className="text-sm">
              git clone [your-repo-url]<br />
              cd starter-template<br />
              pnpm install<br />
              pnpm dev
            </code>
          </div>
        </div>
      </section>
    </div>
  )
}