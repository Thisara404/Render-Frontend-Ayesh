import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import adminService from "@/services/adminService";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhotographers: 0,
    totalBookings: 0,
    userGrowth: "+0%",
    photographerGrowth: "+0%",
    bookingGrowth: "+0%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users and photographers
        const users = await adminService.getUsers();
        const photographers = await adminService.getPhotographers();
        
        // TODO: Fetch bookings when the API is available
        const bookings = 0;
        
        setStats({
          totalUsers: users.length,
          totalPhotographers: photographers.length,
          totalBookings: bookings,
          userGrowth: "+12%", // Placeholder - will be calculated in the future
          photographerGrowth: "+5%", // Placeholder - will be calculated in the future
          bookingGrowth: "+18%" // Placeholder - will be calculated in the future
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 flex items-center">
              <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin mr-2"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.userGrowth} from last month</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Photographers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 flex items-center">
              <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin mr-2"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{stats.totalPhotographers}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.photographerGrowth} from last month</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 flex items-center">
              <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin mr-2"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.bookingGrowth} from last month</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;