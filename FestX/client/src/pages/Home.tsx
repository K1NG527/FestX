import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  MapPin, 
  Tag, 
  BookmarkPlus,
  ChevronRight
} from "lucide-react";
import CategoryFilter from "@/components/events/CategoryFilter";
import EventList from "@/components/events/EventList";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // Update greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        description: `Searching for "${searchQuery}"...`,
      });
      // In a real app, we would implement search via API call
    }
  };

  return (
    <div className="bg-zinc-950">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-900"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80')] bg-cover bg-center opacity-100 mix-blend-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-lg text-primary font-medium mb-2">
                  {greeting}, {user?.username || 'Explorer'}
                </h2>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70">
                    Discover
                  </span> the best campus events near you
                </h1>
                <p className="text-lg text-zinc-300 max-w-lg mb-8">
                  Join academic, social, workshops, and other exciting events all in one place. 
                  Your college experience just got better.
                </p>
              </div>
              
              <div className="hidden md:block">
                <div className="bg-zinc-800/80 backdrop-blur-sm p-5 rounded-lg shadow-xl border border-zinc-700/50 w-72">
                  <div className="flex items-center mb-3">
                    <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-semibold text-white">Quick Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Upcoming events</span>
                      <span className="font-semibold text-white">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Your registrations</span>
                      <span className="font-semibold text-white">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Today's events</span>
                      <span className="font-semibold text-white">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 max-w-lg mx-auto md:mx-0">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  className="w-full px-4 py-6 rounded-lg zomato-input text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 bg-primary hover:bg-primary/90 text-white rounded-r-lg transition"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-zinc-900 py-6 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/calendar">
              <a className="bg-zinc-800 p-3 rounded-lg flex items-center hover:bg-zinc-800/80 transition">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Calendar View</span>
                </div>
              </a>
            </Link>
            
            <Link href="/">
              <a className="bg-zinc-800 p-3 rounded-lg flex items-center hover:bg-zinc-800/80 transition">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Popular Events</span>
                </div>
              </a>
            </Link>
            
            <Link href="/my-events">
              <a className="bg-zinc-800 p-3 rounded-lg flex items-center hover:bg-zinc-800/80 transition">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <BookmarkPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">My Events</span>
                </div>
              </a>
            </Link>
            
            <Link href="/create">
              <a className="bg-zinc-800 p-3 rounded-lg flex items-center hover:bg-zinc-800/80 transition">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Create Event</span>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Explore Categories</h2>
            <Link href="/calendar">
              <a className="text-primary flex items-center text-sm hover:underline">
                <span>View Calendar</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </Link>
          </div>
          <CategoryFilter 
            onCategoryChange={handleCategoryChange}
            currentCategory={selectedCategory}
          />
        </div>
      </section>

      {/* Events Listing */}
      <section className="py-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {selectedCategory 
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events` 
                : "All Events"
              }
            </h2>
          </div>
          <EventList 
            category={selectedCategory}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
