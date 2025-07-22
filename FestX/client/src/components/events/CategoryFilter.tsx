import {
  Book,
  Users,
  Briefcase,
  Trophy,
  Workflow,
  Megaphone,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  onCategoryChange: (category: string | null) => void;
  currentCategory: string | null;
}

const CATEGORIES = [
  { 
    id: null, 
    name: "All Events", 
    icon: <LayoutGrid className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "academic", 
    name: "Academic", 
    icon: <Book className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "social", 
    name: "Social", 
    icon: <Users className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "career", 
    name: "Career", 
    icon: <Briefcase className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "sports", 
    name: "Sports", 
    icon: <Trophy className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "workshop", 
    name: "Workshop", 
    icon: <Workflow className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "conference", 
    name: "Conference", 
    icon: <Megaphone className="h-4 w-4 mr-2" /> 
  },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  onCategoryChange, 
  currentCategory 
}) => {
  return (
    <div className="overflow-x-auto pb-2 hide-scrollbar">
      <div className="flex space-x-2 min-w-max">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id || "all"}
            onClick={() => onCategoryChange(category.id)}
            variant="outline"
            className={cn(
              "px-4 py-2 rounded-lg border transition duration-200 flex items-center",
              currentCategory === category.id
                ? "bg-zinc-800 text-primary border-primary"
                : "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
            )}
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
