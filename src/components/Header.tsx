import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { UserCircle, Menu, X, ChevronDown, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "./ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle"; // Add this import

interface UserData {
  name?: string;
  email: string;
  role?: string;
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Add scroll event listener to make header solid after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add event listener only on home page
    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    } else {
      setScrolled(true); // Always scrolled (solid) on non-home pages
    }
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data from localStorage');
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'photographer':
        return '/dashboard';
      case 'admin':
        return '/admin';
      case 'user':
      default:
        return '/bookings';
    }
  };

  // Header classes based on scroll position and page
  const headerClasses = isHomePage && !scrolled
    ? "w-full absolute top-0 z-50 transition-all duration-300"
    : "w-full sticky top-0 z-50 bg-photo-beige dark:bg-photo-darknavy border-b border-photo-navy/20 dark:border-photo-beige/20 transition-all duration-300"; // Updated for dark mode

  // Text color for links based on scroll position
  const textClass = isHomePage && !scrolled ? "text-photo-beige" : "text-photo-navy dark:text-photo-beige";
  const hoverClass = isHomePage && !scrolled ? "hover:text-photo-beige/80" : "hover:text-photo-rust dark:hover:text-photo-rust";
  const logoClass = isHomePage && !scrolled 
    ? "text-2xl font-serif font-bold text-photo-beige" 
    : "text-2xl font-serif font-bold bg-gradient-to-r from-photo-navy to-photo-rust bg-clip-text text-transparent";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/assets/images/logo.png" alt="SnapBook Logo" className="h-10 mr-3" />
            <h1 className={logoClass}>
              SnapBook
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
              Home
            </Link>
            <Link to="/photographers" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
              Photographers
            </Link>
            
            {user?.role === 'user' && (
              <Link to="/bookings" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
                My Bookings
              </Link>
            )}
            
            {user?.role === 'photographer' && (
              <Link to="/dashboard" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
                Dashboard
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link to="/admin" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
                Admin Panel
              </Link>
            )}
            
            <Link to="/how-it-works" className={`text-sm font-medium ${textClass} ${hoverClass} transition-colors`}>
              How It Works
            </Link>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Add Theme Toggle Button here */}
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isHomePage && !scrolled ? "outline" : "ghost"} 
                    size="sm" 
                    className={`flex items-center ${isHomePage && !scrolled ? 'text-neutral-500 border-white/40 hover:bg-white/10' : ''}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>{user?.name || user?.email}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()}>
                      {user?.role === 'user' ? 'My Bookings' : 'Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant={isHomePage && !scrolled ? "outline" : "ghost"} 
                  asChild
                  className={isHomePage && !scrolled ? ' text-neutral-500 border-photo-beige/40 hover:bg-photo-beige/10' : ''}
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild
                  className={isHomePage && !scrolled ? 'bg-photo-beige text-photo-navy hover:bg-photo-beige/90' : 'bg-photo-navy text-photo-beige hover:bg-photo-navy/90'}
                >
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Add Theme Toggle Button here for mobile */}
            <ThemeToggle />
            
            <button 
              className={`${textClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 space-y-4 border-t border-photo-navy/20 dark:border-photo-beige/20 bg-photo-beige dark:bg-photo-darknavy">
          <Link 
            to="/" 
            className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/photographers" 
            className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
            onClick={() => setMobileMenuOpen(false)}
          >
            Photographers
          </Link>
          
          {user?.role === 'user' && (
            <Link 
              to="/bookings" 
              className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
          )}
          
          {user?.role === 'photographer' && (
            <Link 
              to="/dashboard" 
              className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          
          <Link 
            to="/how-it-works" 
            className="block py-2 text-sm font-medium text-photo-navy dark:text-photo-beige hover:text-photo-rust dark:hover:text-photo-rust"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium">{user?.name || user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="justify-start">
                    <Link 
                      to={getDashboardLink()}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {user?.role === 'user' ? 'My Bookings' : 'Dashboard'}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link 
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
