import { Button } from '@/components/ui/button'
import { ArrowRight, Code2, Package, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container relative">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          Build faster with our Turborepo starter
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          A modern monorepo starter with Next.js, React Native, and shared packages. 
          Start building your next project in minutes, not hours.
        </p>
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button asChild>
            <Link href="/docs">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] py-8 md:py-12 lg:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-8">
            <Code2 className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">TypeScript First</h3>
            <p className="text-center text-sm text-muted-foreground">
              Built with TypeScript from the ground up for type safety and better DX.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-8">
            <Package className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Shared Packages</h3>
            <p className="text-center text-sm text-muted-foreground">
              Share code between web and mobile apps with optimized packages.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-8">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Fast Development</h3>
            <p className="text-center text-sm text-muted-foreground">
              Turborepo caching and optimized builds for lightning-fast iteration.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] py-8 md:py-12 lg:py-24">
        <h2 className="mb-8 text-center text-2xl font-bold">What&apos;s Included</h2>
        <div className="rounded-lg border bg-card p-8">
          <ul className="grid gap-4 md:grid-cols-2">
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">Next.js 14 App</h4>
                <p className="text-sm text-muted-foreground">
                  Latest App Router with Server Components
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">Expo React Native</h4>
                <p className="text-sm text-muted-foreground">
                  Cross-platform mobile app development
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">Tailwind CSS</h4>
                <p className="text-sm text-muted-foreground">
                  Utility-first CSS with custom configuration
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">Supabase Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Database types and utilities ready to use
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">shadcn/ui Components</h4>
                <p className="text-sm text-muted-foreground">
                  Beautiful, accessible components out of the box
                </p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <h4 className="font-semibold">Developer Tools</h4>
                <p className="text-sm text-muted-foreground">
                  ESLint, Prettier, Husky, and more configured
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}