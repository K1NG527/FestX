import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignJustify, X, User, LogOut, Plus, Calendar, Bookmark, Home } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Browse Events", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="w-4 h-4 mr-2" /> },
    { name: "My Events", path: "/my-events", icon: <Bookmark className="w-4 h-4 mr-2" /> },
    { name: "Dashboard", path: "/dashboard", icon: <User className="w-4 h-4 mr-2" /> },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-zinc-900 to-zinc-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="ml-2 text-xl font-sans font-bold text-white">
                  FestX
                </span>
              </a>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center ${
                    isActive(link.path)
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </a>
              </Link>
            ))}
            <Link href="/create">
              <Button 
                className="ml-4 bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1" 
                variant="default"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-2 p-0 h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 bg-primary-700 text-white">
                    <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-800 border-zinc-700 text-zinc-300">
                <div className="p-2 border-b border-zinc-700">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-zinc-700 hover:text-white flex items-center gap-2 p-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <AlignJustify className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </a>
              </Link>
            ))}
            <Link href="/create">
              <a 
                className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </a>
            </Link>
            
            {/* Mobile logout option */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </button>
          </div>
          
          {/* User info in mobile menu */}
          <div className="pt-4 pb-3 border-t border-zinc-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 bg-primary-700 text-white">
                  <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.username}</div>
                <div className="text-sm font-medium text-zinc-400">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
