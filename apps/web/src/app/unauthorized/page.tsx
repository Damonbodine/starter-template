/**
 * Unauthorized Page
 * Displayed when user doesn't have required permissions
 */

import Link from 'next/link';
import { Button } from '@starter-template/ui/components/button';
import { Icons } from '@starter-template/ui/components/icons';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icons.shield className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. 
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <Icons.home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/logout">
              <Icons.logOut className="mr-2 h-4 w-4" />
              Sign Out
            </Link>
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact{' '}
            <a 
              href="mailto:support@example.com" 
              className="text-primary hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}