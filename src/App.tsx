import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext"; // Add this line

import Index from "./pages/Index";
import PhotographersList from "./pages/PhotographersList";
import PhotographerDetail from "./pages/PhotographerDetail";
import UserBookings from "./pages/UserBookings";
import PhotographerDashboard from "./pages/PhotographerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light"> {/* Add this line */}
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/photographers" element={<PhotographersList />} />
              <Route path="/photographer/:id" element={<PhotographerDetail />} />
              <Route path="/bookings" element={<UserBookings />} />
              <Route path="/dashboard" element={<PhotographerDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/how-it-works/:role" element={<HowItWorks />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
