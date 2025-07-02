import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import DashboardStats from "@/components/admin/DashboardStats";
import UsersManagement from "@/components/admin/users.mngt";
import PhotographersManagement from "@/components/admin/photographers.mngt";
import BookingsManagement from "@/components/admin/bookings.mngt";
import SystemSettings from "@/components/admin/system.settings";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isAuthenticated, loading } = useAuth();
  
  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [navigate, isAuthenticated, user, loading]);

  // If still checking authentication or no user, show loading
  if (loading || !user) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dashboard statistics */}
        <DashboardStats />

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UsersManagement searchTerm={searchTerm} />
          </TabsContent>
          
          <TabsContent value="photographers" className="space-y-4">
            <PhotographersManagement searchTerm={searchTerm} />
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4">
            <BookingsManagement searchTerm={searchTerm} />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <SystemSettings />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Link to="/how-it-works/admin">
            <Button variant="outline">
              How It Works for Administrators
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
