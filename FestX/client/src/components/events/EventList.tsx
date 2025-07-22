import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Event } from "@/types";

interface EventListProps {
  category: string | null;
  userId?: number;
}

const EventList: React.FC<EventListProps> = ({ category, userId }) => {
  const [sortOrder, setSortOrder] = useState<string>("date-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // Fetch all events or events by category
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: category ? ['/api/events/category', category] : ['/api/events'],
    queryFn: async () => {
      const url = category 
        ? `/api/events/category/${category}` 
        : '/api/events';
      return await fetch(url).then(res => res.json());
    }
  });

  // Fetch user registrations if userId is provided
  const { data: userEvents = [] } = useQuery({
    queryKey: ['/api/users', userId, 'events'],
    queryFn: async () => {
      if (!userId) return [];
      return await fetch(`/api/users/${userId}/events`).then(res => res.json());
    },
    enabled: !!userId
  });

  // Check if user is registered for an event
  const isUserRegistered = (eventId: number) => {
    return userEvents.some((event: Event) => event.id === eventId);
  };

  // Sort events based on selected order
  const sortEvents = (eventList: Event[]) => {
    const sortedEvents = [...eventList];
    
    switch (sortOrder) {
      case "date-asc":
        return sortedEvents.sort((a, b) => 
          new Date(`${a.date}T${a.startTime}`).getTime() - 
          new Date(`${b.date}T${b.startTime}`).getTime()
        );
      case "date-desc":
        return sortedEvents.sort((a, b) => 
          new Date(`${b.date}T${b.startTime}`).getTime() - 
          new Date(`${a.date}T${a.startTime}`).getTime()
        );
      default:
        return sortedEvents;
    }
  };

  const sortedEvents = sortEvents(events);
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading events. Please try again later.</p>
      </div>
    );
  }

  return (
    <section id="browse" className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-sans font-bold text-neutral-900">
            {category 
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Events` 
              : "Upcoming Events"}
          </h2>
          <div className="mt-3 md:mt-0 flex items-center space-x-3">
            <span className="text-sm text-neutral-600">Sort by:</span>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value)}
            >
              <SelectTrigger className="bg-white border border-neutral-200 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date: Soonest First</SelectItem>
                <SelectItem value="date-desc">Date: Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-neutral-600">No events found. Try changing your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentEvents.map((event: Event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  registrationCount={event.registrationCount || 0}
                  userId={userId}
                  isRegistered={isUserRegistered(event.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default EventList;
