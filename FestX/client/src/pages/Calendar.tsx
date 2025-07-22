import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from "lucide-react";
import { Event } from "@/types";
import { 
  formatDate, 
  getMonthAndYear,
  getCalendarDayClass,
  formatTimeRange,
  getCategoryColor
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Fetch all events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      return await fetch('/api/events').then(res => res.json());
    }
  });

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Generate calendar data for the month
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get day of the week of the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get last day of the previous month
    const lastDayOfPrevMonth = new Date(year, month, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();
    
    const calendarDays = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date())
      });
    }
    
    // Add days from next month to fill the last week
    const daysNeeded = 42 - calendarDays.length; // 42 = 6 rows * 7 days
    for (let day = 1; day <= daysNeeded; day++) {
      const date = new Date(year, month + 1, day);
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendarData();

  // Check if a date has any events
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event: Event) => event.date === dateStr);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get upcoming events
  const getUpcomingEvents = (): Event[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter((event: Event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a: Event, b: Event) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="bg-zinc-950 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/30"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Event Calendar
          </h1>
          <p className="text-zinc-300">
            Browse upcoming events by date
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousMonth}
                className="rounded-l border-zinc-700 hover:bg-zinc-800 text-zinc-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-lg font-medium mx-4 text-white">{getMonthAndYear(currentMonth)}</h3>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
                className="rounded-r border-zinc-700 hover:bg-zinc-800 text-zinc-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex">
              <Button 
                variant={viewMode === "month" ? "default" : "outline"} 
                onClick={() => setViewMode("month")}
                className={`rounded-l ${viewMode === "month" ? "bg-primary text-white" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
              >
                Month
              </Button>
              <Button 
                variant={viewMode === "week" ? "default" : "outline"} 
                onClick={() => setViewMode("week")}
                className={`rounded-none border-l-0 border-r-0 ${viewMode === "week" ? "bg-primary text-white" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
              >
                Week
              </Button>
              <Button 
                variant={viewMode === "day" ? "default" : "outline"} 
                onClick={() => setViewMode("day")}
                className={`rounded-r ${viewMode === "day" ? "bg-primary text-white" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}
              >
                Day
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-[600px] w-full rounded-lg bg-zinc-800" />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
              {/* Week day headers */}
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Sun</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Mon</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Tue</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Wed</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Thu</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Fri</div>
              <div className="bg-zinc-800 text-center py-2 font-medium text-zinc-400">Sat</div>
              
              {/* Calendar grid */}
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                const hasPrimaryEvent = dayEvents.some(event => event.category === 'academic' || event.category === 'career');
                const dayClass = day.isToday 
                  ? "bg-primary/10 text-primary font-bold" 
                  : day.isCurrentMonth 
                    ? "text-zinc-200" 
                    : "text-zinc-500";
                
                return (
                  <div 
                    key={index} 
                    className={`bg-zinc-900 p-1 min-h-[100px] text-right hover:bg-zinc-900/80 transition border-t border-zinc-800 ${
                      day.isToday ? "ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <span className={`inline-block px-1 rounded-full ${dayClass} ${
                      hasPrimaryEvent && day.isCurrentMonth && !day.isToday ? "bg-primary/5" : ""
                    }`}>
                      {day.day}
                    </span>
                    
                    {dayEvents.length > 0 && day.isCurrentMonth && (
                      <div className="mt-1 text-left">
                        {dayEvents.slice(0, 2).map((event: Event) => {
                          const categoryColors = getCategoryColor(event.category);
                          const borderClass = categoryColors.bg.replace('bg-', 'border-');
                          
                          return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                              <div 
                                className={`bg-zinc-800 rounded-sm p-1 text-xs truncate border-l-2 ${borderClass} mb-1 hover:bg-zinc-700 transition`}
                              >
                                <span 
                                  className={`inline-block w-2 h-2 rounded-full ${categoryColors.bg} mr-1`}
                                ></span>
                                <span className="text-zinc-300">{event.title}</span>
                              </div>
                            </Link>
                          );
                        })}
                        
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-primary font-medium pl-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
            <Link href="/dashboard">
              <Button variant="link" className="text-primary hover:text-primary/90 -mr-2 p-0">
                View All Events <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full bg-zinc-800" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-zinc-400 py-4">No upcoming events found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event: Event) => {
                const eventDate = new Date(event.date);
                const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = eventDate.getDate();
                const categoryColors = getCategoryColor(event.category);
                
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="bg-zinc-800 hover:bg-zinc-800/70 transition rounded-lg overflow-hidden h-full border border-zinc-700">
                      <div className="p-4">
                        <div className="flex items-start mb-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-zinc-700 rounded-lg flex flex-col items-center justify-center text-white mr-3">
                            <span className="text-xs">{month}</span>
                            <span className="text-xl font-bold">{day}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white line-clamp-1">{event.title}</h4>
                            <Badge className={`mt-1 ${categoryColors.bg} ${categoryColors.text}`}>
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-400 space-y-1">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-zinc-500" />
                            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-zinc-500" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
