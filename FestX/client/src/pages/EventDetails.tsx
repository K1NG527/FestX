import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, User, Bookmark, BookmarkCheck, Share2, X } from "lucide-react";
import { useState } from "react";
import { EventWithCount } from "@/types";
import { formatFullDate, formatTimeRange, getCategoryColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const EventDetails = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // Default user for demo

  // Fetch event details
  const { data: event, isLoading, error } = useQuery<EventWithCount>({
    queryKey: ['/api/events', parseInt(id)],
    queryFn: async () => {
      return await fetch(`/api/events/${id}`).then(res => res.json());
    }
  });

  // Check if user is registered for this event
  const { data: userEvents = [] } = useQuery({
    queryKey: ['/api/users', userId, 'events'],
    queryFn: async () => {
      return await fetch(`/api/users/${userId}/events`).then(res => res.json());
    }
  });
  
  const isRegistered = userEvents.some((userEvent: any) => userEvent.id === parseInt(id));

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/registrations', {
        userId,
        eventId: parseInt(id)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You've registered for the event.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', parseInt(id)] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'events'] });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Cancel registration mutation
  const cancelRegistrationMutation = useMutation({
    mutationFn: () => {
      return apiRequest('DELETE', `/api/registrations/${userId}/${id}`, undefined);
    },
    onSuccess: () => {
      toast({
        description: "Registration cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', parseInt(id)] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'events'] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleRegister = () => {
    if (event && event.registrationCount >= event.capacity) {
      toast({
        description: "This event is fully booked.",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate();
  };

  const handleCancelRegistration = () => {
    cancelRegistrationMutation.mutate();
  };

  const toggleSaveEvent = () => {
    setIsSaved(!isSaved);
    
    toast({
      description: isSaved 
        ? "Event removed from saved items" 
        : "Event saved to your list",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      })
      .then(() => {
        toast({
          description: "Event shared successfully!",
        });
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        description: "Event link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="w-full h-64 rounded-t-lg" />
        <div className="p-6 bg-white rounded-b-lg shadow-md">
          <Skeleton className="w-3/4 h-8 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </div>
          <Skeleton className="w-full h-40 mb-6" />
          <Skeleton className="w-full h-20 mb-6" />
          <Skeleton className="w-full h-12" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Event</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the event details. It may have been removed or there was a network issue.
          </p>
          <Button onClick={() => setLocation("/")}>Return to Events</Button>
        </div>
      </div>
    );
  }

  const categoryColors = getCategoryColor(event.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img 
            src={event.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80"} 
            alt={event.title} 
            className="w-full h-64 object-cover"
          />
          <Button 
            onClick={() => setLocation("/")}
            variant="outline" 
            size="icon" 
            className="absolute top-4 right-4 bg-white shadow-md hover:bg-neutral-100 transition"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-neutral-600" />
          </Button>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-sm font-medium ${categoryColors.bg} ${categoryColors.text} rounded-full shadow-md`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-sans font-bold text-neutral-900">{event.title}</h2>
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSaveEvent}
                aria-label={isSaved ? "Unsave event" : "Save event"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-6 w-6 text-primary-900" />
                ) : (
                  <Bookmark className="h-6 w-6 text-neutral-600 hover:text-primary-900" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleShare}
                aria-label="Share event"
              >
                <Share2 className="h-6 w-6 text-neutral-600 hover:text-primary-900" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-700" />
              <span className="text-neutral-900">{formatFullDate(event.date)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-700" />
              <span className="text-neutral-900">{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary-700" />
              <span className="text-neutral-900">{event.location}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">About this event</h3>
            <p className="text-neutral-700 mb-4 whitespace-pre-line">{event.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Organizer</h3>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-primary-900" />
              </div>
              <div>
                <p className="font-medium">Event Organizer</p>
                <p className="text-sm text-neutral-600">Contact: organizer@university.edu</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-neutral-900 font-medium">Registration Status</p>
                <p className="text-sm text-primary-700">
                  <span className="font-medium">{event.registrationCount}</span> out of <span className="font-medium">{event.capacity}</span> spots filled
                </p>
              </div>
              
              {isRegistered ? (
                <Button 
                  variant="outline" 
                  onClick={handleCancelRegistration}
                  disabled={cancelRegistrationMutation.isPending}
                >
                  {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel Registration"}
                </Button>
              ) : event.registrationCount >= event.capacity ? (
                <Button variant="outline" className="cursor-not-allowed" disabled>
                  Fully Booked
                </Button>
              ) : (
                <Button 
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register Now"}
                </Button>
              )}
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-md">
              <p className="text-sm text-neutral-600">
                By registering for this event, you'll receive email confirmations and updates. You can cancel your registration at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
