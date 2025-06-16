/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */

'use client';

import { useAuth } from '../../lib/auth/context';
import { Button } from '@starter-template/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter-template/ui/components/card';
import { Icons } from '@starter-template/ui/components/icons';
import { AdminOnly, ModeratorPlus, ShowForAuth } from '../../lib/auth/guards';

export default function DashboardPage() {
  const auth = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {auth.user?.display_name || auth.user?.first_name || 'User'}!
            </p>
          </div>
          
          <Button onClick={handleSignOut} variant="outline">
            <Icons.logOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{auth.user?.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <p className="text-sm text-muted-foreground capitalize">{auth.user?.role}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground capitalize">{auth.user?.status}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Verified</label>
                <p className="text-sm text-muted-foreground">
                  {auth.isEmailVerified() ? '✅ Verified' : '❌ Not verified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ShowForAuth>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.user className="mr-2 h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </ShowForAuth>

          <ShowForAuth>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.settings className="mr-2 h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>Configure your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </ShowForAuth>

          <ModeratorPlus>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.shield className="mr-2 h-5 w-5" />
                  Moderation
                </CardTitle>
                <CardDescription>Content moderation tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Moderate Content
                </Button>
              </CardContent>
            </Card>
          </ModeratorPlus>

          <AdminOnly>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </AdminOnly>

          <AdminOnly>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.barChart className="mr-2 h-5 w-5" />
                  Analytics
                </CardTitle>
                <CardDescription>View system analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </AdminOnly>
        </div>

        {/* Permissions Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Examples</CardTitle>
            <CardDescription>
              Examples of conditional content based on roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ShowForAuth fallback={<p className="text-muted-foreground">Sign in to see this content</p>}>
              <p className="text-green-600">✅ You are signed in!</p>
            </ShowForAuth>

            <ModeratorPlus fallback={<p className="text-muted-foreground">Moderator access required</p>}>
              <p className="text-blue-600">✅ You have moderator privileges!</p>
            </ModeratorPlus>

            <AdminOnly fallback={<p className="text-muted-foreground">Admin access required</p>}>
              <p className="text-purple-600">✅ You have admin privileges!</p>
            </AdminOnly>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}