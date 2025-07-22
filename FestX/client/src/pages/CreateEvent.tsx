import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { EVENT_CATEGORIES } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, ImagePlus } from "lucide-react";

// Extend the zod schema for the form
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  location: z.string().min(3, "Location is required"),
  capacity: z.string().transform((val) => parseInt(val, 10)),
  category: z.enum(EVENT_CATEGORIES),
  imageUrl: z.string().optional(),
  sendNotifications: z.boolean().default(false),
  organizerId: z.number().default(1) // Default user for demo
});

type FormValues = z.infer<typeof formSchema>;

const CreateEvent = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Create form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0], // Today's date as default
      startTime: "09:00",
      endTime: "17:00",
      location: "",
      capacity: "100",
      category: "academic",
      imageUrl: "",
      sendNotifications: false,
      organizerId: 1
    }
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return apiRequest('POST', '/api/events', values);
    },
    onSuccess: async (response) => {
      const newEvent = await response.json();
      
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setTimeout(() => {
        setLocation(`/events/${newEvent.id}`);
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error Creating Event",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    // Use a mocked image URL if none provided
    if (!values.imageUrl && imagePreview) {
      values.imageUrl = imagePreview;
    } else if (!values.imageUrl) {
      // Use a default image based on category
      const categoryImageMap: Record<string, string> = {
        academic: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        social: "https://images.unsplash.com/photo-1560523159-4a9692d222f8",
        career: "https://images.unsplash.com/photo-1559223607-a43c990c692c",
        sports: "https://images.unsplash.com/photo-1569683795546-bf1ca0a8696a",
        workshop: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        conference: "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd"
      };
      
      values.imageUrl = categoryImageMap[values.category] || 
        "https://images.unsplash.com/photo-1560523159-4a9692d222f8";
    }
    
    createEventMutation.mutate(values);
  };

  // For demo - simulate uploading an image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, we would upload this file to a server
      // For this demo, we'll just create a temporary object URL
      const file = e.target.files[0];
      const mockImageUrls = [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        "https://images.unsplash.com/photo-1560523159-4a9692d222f8",
        "https://images.unsplash.com/photo-1559223607-a43c990c692c",
        "https://images.unsplash.com/photo-1569683795546-bf1ca0a8696a",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd"
      ];
      
      // Randomly select a mock image URL
      const randomImageUrl = mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];
      setImagePreview(randomImageUrl);
      
      toast({
        description: "Image uploaded successfully!",
      });
    }
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-sans font-bold text-neutral-900 mb-8">Create New Event</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your campus event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter event title" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="time" 
                              {...field} 
                            />
                            <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="time" 
                              {...field} 
                            />
                            <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Building and room number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="Maximum number of attendees" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Image</FormLabel>
                      <FormControl>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-neutral-300 rounded-md">
                          <div className="space-y-1 text-center">
                            {imagePreview ? (
                              <div className="mb-3">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="h-32 mx-auto object-cover rounded" 
                                />
                              </div>
                            ) : (
                              <ImagePlus className="mx-auto h-12 w-12 text-neutral-400" />
                            )}
                            <div className="flex text-sm text-neutral-600">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-700 hover:text-primary-500 focus-within:outline-none">
                                <span>Upload a file</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                                <Input 
                                  type="hidden" 
                                  {...field} 
                                  value={imagePreview || ""}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sendNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-neutral-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-neutral-700">
                          Send email notifications
                        </FormLabel>
                        <p className="text-sm text-neutral-500">
                          Notify registered participants about updates to this event
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreateEvent;
