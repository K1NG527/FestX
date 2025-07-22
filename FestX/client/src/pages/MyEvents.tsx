import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import EventCard from "@/components/events/EventCard";
import { Event } from "@/types";

const MyEvents = () => {
  const userId = 1; // Default user for demo
  const [activeTab, setActiveTab] = useState("registered");

  // Fetch user's registered events
  const { 
    data: registeredEvents = [], 
    isLoading: isLoadingRegistered,
    error: registeredError
  } = useQuery({
    queryKey: ['/api/users', userId, 'events'],
    queryFn: async () => {
      return await fetch(`/api/users/${userId}/events`).then(res => res.json());
    }
  });

  // Fetch all events to find created ones (for demo, filtering client-side)
  const {
    data: allEvents = [],
    isLoading: isLoadingAll,
    error: allEventsError
  } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      return await fetch('/api/events').then(res => res.json());
    }
  });

  // For this demo, we'll filter to events created by this user (organizerId=1)
  const createdEvents = allEvents.filter((event: Event) => event.organizerId === userId);

  const isLoading = isLoadingRegistered || isLoadingAll;
  const error = registeredError || allEventsError;

  if (error) {
    return (
      <div className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-sans font-bold text-red-600 mb-4">Error Loading Events</h2>
            <p className="text-neutral-600 mb-6">
              We couldn't load your events. Please try again later.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-sans font-bold text-neutral-900 mb-4 md:mb-0">My Events</h2>
          <Button asChild>
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Link>
          </Button>
        </div>

        <Tabs 
          defaultValue="registered" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="registered">Registered Events</TabsTrigger>
            <TabsTrigger value="created">Created Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registered">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-80 w-full" />
                ))}
              </div>
            ) : registeredEvents.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Registered Events</h3>
                <p className="text-neutral-600 mb-6">
                  You haven't registered for any events yet.
                </p>
                <Button asChild>
                  <Link href="/">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {registeredEvents.map((event: Event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    registrationCount={event.registrationCount || 0}
                    userId={userId}
                    isRegistered={true}
                    hideActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="created">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-80 w-full" />
                ))}
              </div>
            ) : createdEvents.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Created Events</h3>
                <p className="text-neutral-600 mb-6">
                  You haven't created any events yet.
                </p>
                <Button asChild>
                  <Link href="/create">Create an Event</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {createdEvents.map((event: Event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    registrationCount={event.registrationCount || 0}
                    userId={userId}
                    hideActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyEvents;
