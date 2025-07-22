import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date string (YYYY-MM-DD) to display format (e.g., Nov 15)
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format date string (YYYY-MM-DD) to full display format (e.g., November 15, 2023)
export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  });
}

// Format time string (HH:MM) to display format (e.g., 9:00 AM)
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

// Format time range for display (e.g., 9:00 AM - 5:00 PM)
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Get category color class for different category types
export function getCategoryColor(category: string): { bg: string, text: string } {
  switch (category) {
    case 'academic':
      return { bg: 'bg-amber-500', text: 'text-white' };
    case 'social':
      return { bg: 'bg-pink-500', text: 'text-white' };
    case 'career':
      return { bg: 'bg-blue-500', text: 'text-white' };
    case 'sports':
      return { bg: 'bg-green-500', text: 'text-white' };
    case 'workshop':
      return { bg: 'bg-purple-500', text: 'text-white' };
    case 'conference':
      return { bg: 'bg-cyan-500', text: 'text-white' };
    default:
      return { bg: 'bg-gray-500', text: 'text-white' };
  }
}

// Get capacity status color
export function getCapacityStatusColor(registered: number, capacity: number): string {
  const percentFull = (registered / capacity) * 100;
  
  if (percentFull >= 100) {
    return 'text-red-600'; // Fully booked
  } else if (percentFull >= 80) {
    return 'text-amber-600'; // Almost full
  } else {
    return 'text-primary-700'; // Plenty of space
  }
}

// Get the month name and year from a date
export function getMonthAndYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

// Get formatted date for calendar day cell
export function getCalendarDayClass(isCurrentMonth: boolean, isToday: boolean): string {
  if (!isCurrentMonth) return 'text-gray-400';
  if (isToday) return 'font-medium text-primary-900';
  return '';
}
