import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types";
import { 
  formatDate, 
  formatTimeRange, 
  getCategoryColor 
} from "@/lib/utils";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck, Clock, MapPin, Users, Bell, CalendarX } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch user's registered events
  const { data: registeredEvents = [], isLoading: isRegisteredLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'events'],
    queryFn: async () => {
      if (!user?.id) return [];
      return await fetch(`/api/users/${user.id}/events`).then(res => res.json());
    },
    enabled: !!user?.id
  });
  
  // Function to filter events based on date (upcoming or past)
  const filterEventsByDate = (events: Event[], isPast: boolean): Event[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter((event: Event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (isPast) {
        return eventDate.getTime() < today.getTime();
      } else {
        return eventDate.getTime() >= today.getTime();
      }
    }).sort((a: Event, b: Event) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return isPast ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  };
  
  const upcomingEvents = filterEventsByDate(registeredEvents, false);
  const pastEvents = filterEventsByDate(registeredEvents, true);
  
  // Check if event is happening today
  const isToday = (date: string): boolean => {
    const eventDate = new Date(date);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };
  
  // For notifications - these would be connected to a real notification system in production
  const notifications = [
    { 
      id: 1, 
      message: "Your event 'Annual Tech Symposium' starts tomorrow!", 
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), 
      read: false,
      eventId: 1
    },
    { 
      id: 2, 
      message: "Event location for 'Campus Job Fair' has been updated", 
      date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), 
      read: true,
      eventId: 3
    },
    { 
      id: 3, 
      message: "Don't forget to bring your laptop to 'Coding Workshop'", 
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), 
      read: true,
      eventId: 2
    }
  ];
  
  // Calculate statistics
  const totalRegistered = registeredEvents.length;
  const eventsToday = upcomingEvents.filter(event => isToday(event.date)).length;
  const eventsThisWeek = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= nextWeek;
  }).length;
  
  return (
    <div className="bg-zinc-950 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/30"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            My Dashboard
          </h1>
          <p className="text-zinc-300">
            Track your registered events and get personalized updates
          </p>
        </div>
      </div>
      
      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats cards */}
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardContent className="flex items-center py-6">
              <div className="w-12 h-12 bg-primary-950 rounded-lg flex items-center justify-center mr-4">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Events</p>
                <h3 className="text-3xl font-bold">{isRegisteredLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : totalRegistered}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardContent className="flex items-center py-6">
              <div className="w-12 h-12 bg-primary-950 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Today</p>
                <h3 className="text-3xl font-bold">{isRegisteredLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : eventsToday}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardContent className="flex items-center py-6">
              <div className="w-12 h-12 bg-primary-950 rounded-lg flex items-center justify-center mr-4">
                <CalendarX className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">This Week</p>
                <h3 className="text-3xl font-bold">{isRegisteredLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : eventsThisWeek}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for registered events */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 mt-6 overflow-hidden">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-zinc-800 p-4">
              <TabsList className="grid grid-cols-3 bg-zinc-800">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Past Events
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upcoming" className="p-4">
              {isRegisteredLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No Upcoming Events</h3>
                  <p className="text-zinc-400 mb-6">You don't have any upcoming events to attend.</p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90">Browse Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event: Event) => {
                    const eventDate = new Date(event.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isTodayEvent = eventDate.getTime() === today.getTime();
                    const categoryColor = getCategoryColor(event.category);
                    
                    return (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-800/80 transition border border-zinc-700">
                          <div className="flex-shrink-0 w-20 h-20 bg-zinc-700 rounded-lg flex flex-col items-center justify-center text-white mr-4">
                            <span className="text-xs uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-2xl font-bold">{eventDate.getDate()}</span>
                            <span className="text-xs">{eventDate.getFullYear()}</span>
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="text-lg font-medium text-white">{event.title}</h3>
                                  {isTodayEvent && (
                                    <Badge className="ml-2 bg-primary text-white">Today</Badge>
                                  )}
                                </div>
                                <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                              </div>
                              <Badge className={`${categoryColor.bg} ${categoryColor.text}`}>
                                {event.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center mt-3 text-sm">
                              <div className="flex items-center text-zinc-400 mr-4">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                              </div>
                              <div className="flex items-center text-zinc-400 mr-4">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center text-zinc-400">
                                <Users className="w-4 h-4 mr-1" />
                                <span>{event.registrationCount || 0}/{event.capacity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="p-4">
              {isRegisteredLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : pastEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
                    <CalendarX className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No Past Events</h3>
                  <p className="text-zinc-400 mb-6">You haven't attended any events yet.</p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90">Browse Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastEvents.map((event: Event) => {
                    const categoryColor = getCategoryColor(event.category);
                    
                    return (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex bg-zinc-800/50 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/80 transition border border-zinc-700/50">
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <h3 className="text-base font-medium text-zinc-300">{event.title}</h3>
                              <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                                {formatDate(event.date)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center mt-2 text-xs">
                              <div className="flex items-center text-zinc-500 mr-4">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                <span>{event.location}</span>
                              </div>
                              <Badge className={`text-xs ${categoryColor.bg} ${categoryColor.text}`}>
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notifications" className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No Notifications</h3>
                  <p className="text-zinc-400">You don't have any notifications at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const notifDate = new Date(notification.date);
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border ${notification.read 
                          ? 'bg-zinc-800/50 border-zinc-700/50' 
                          : 'bg-zinc-800 border-primary/20'}`}
                      >
                        <div className="flex">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            notification.read ? 'bg-zinc-700' : 'bg-primary/20'
                          }`}>
                            <Bell className={`h-5 w-5 ${notification.read ? 'text-zinc-400' : 'text-primary'}`} />
                          </div>
                          <div className="flex-grow">
                            <p className={`${notification.read ? 'text-zinc-300' : 'text-white'}`}>
                              {notification.message}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-zinc-500">
                                {new Date(notification.date).toLocaleDateString()} · {new Date(notification.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <Link href={`/events/${notification.eventId}`}>
                                <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                                  View Event
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;