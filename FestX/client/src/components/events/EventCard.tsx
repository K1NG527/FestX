import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Bookmark,
  BookmarkCheck,
  Calendar,
  Users,
  Star
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@/types";
import { 
  formatDate, 
  formatTimeRange, 
  getCategoryColor,
  getCapacityStatusColor
} from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface EventCardProps {
  event: Event;
  registrationCount: number;
  userId?: number;
  hideActions?: boolean;
  isRegistered?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  registrationCount, 
  userId,
  hideActions,
  isRegistered = false
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Use the logged-in user's ID or fall back to a default
  const currentUserId = userId || (user?.id ? user.id : 1);
  
  const categoryColors = getCategoryColor(event.category);
  const capacityColor = getCapacityStatusColor(registrationCount, event.capacity);
  
  // Calculate if the event is today or in the past
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = eventDate.getTime() === today.getTime();
  const isPast = eventDate.getTime() < today.getTime();
  
  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/registrations', {
        userId: currentUserId,
        eventId: event.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You've registered for ${event.title}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUserId, 'events'] });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRegistered) {
      toast({
        description: "You're already registered for this event.",
      });
      return;
    }
    
    if (registrationCount >= event.capacity) {
      toast({
        description: "This event is fully booked.",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate();
  };

  const toggleSaveEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    
    toast({
      description: isSaved 
        ? "Event removed from saved items" 
        : "Event saved to your list",
    });
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="event-card h-full flex flex-col">
        <div className="relative">
          <img 
            src={event.imageUrl || "https://images.unsplash.com/photo-1560523159-4a9692d222f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"} 
            alt={event.title} 
            className="w-full h-48 object-cover"
          />
          
          {/* Category badge */}
          <div className="absolute top-0 right-0 mt-3 mr-3">
            <span className="zomato-badge">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
          </div>
          
          {/* Date indicator */}
          <div className="absolute bottom-0 right-0 mb-3 mr-3">
            <div className="bg-zinc-800 text-white text-xs px-2 py-1 rounded flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(event.date)}
              {isToday && <span className="ml-1 text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5">TODAY</span>}
              {isPast && <span className="ml-1 text-[10px] bg-zinc-600 text-white rounded-full px-1.5 py-0.5">PAST</span>}
            </div>
          </div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
          
          {/* Title on image */}
          <div className="absolute bottom-0 left-0 p-4 z-10">
            <h3 className="text-xl font-bold text-white line-clamp-2">{event.title}</h3>
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col bg-zinc-900">
          <div className="flex items-center mb-3 text-sm text-zinc-400">
            <MapPin className="h-4 w-4 mr-1 text-zinc-500" />
            <span>{event.location}</span>
          </div>
          
          <p className="text-zinc-400 mb-4 text-sm line-clamp-2">{event.description}</p>
          
          <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
            <div className="flex items-center text-xs bg-zinc-800 rounded-md p-2">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="text-zinc-300">{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
            <div className="flex items-center text-xs bg-zinc-800 rounded-md p-2">
              <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="text-zinc-300">
                <span className="font-medium">{registrationCount}/{event.capacity}</span> spots
              </span>
            </div>
          </div>
          
          {!hideActions && (
            <div className="flex justify-between items-center">
              {isRegistered ? (
                <Button variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  Registered
                </Button>
              ) : registrationCount >= event.capacity ? (
                <Button variant="outline" className="cursor-not-allowed border-zinc-700 text-zinc-500 bg-zinc-800/50" disabled>
                  Fully Booked
                </Button>
              ) : (
                <Button 
                  onClick={handleRegister} 
                  disabled={registerMutation.isPending}
                  className="zomato-button"
                >
                  {registerMutation.isPending ? "Registering..." : "Register Now"}
                </Button>
              )}
              
              <button 
                className="p-2 text-zinc-400 hover:text-primary transition" 
                onClick={toggleSaveEvent}
                aria-label={isSaved ? "Unsave event" : "Save event"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
