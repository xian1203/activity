import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  features: string[];
  gradientClass: string;
  onLearnMore: () => void;
}

export const ActivityCard = ({
  title,
  description,
  icon: Icon,
  difficulty,
  category,
  features,
  gradientClass,
  onLearnMore,
}: ActivityCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-card backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-glow-primary">
      <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10", gradientClass)} />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-lg", gradientClass)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Badge variant="outline" className={cn("text-xs", getDifficultyColor(difficulty))}>
            {difficulty}
          </Badge>
        </div>
        
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        
        <CardDescription className="text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
        
        <Badge variant="secondary" className="w-fit text-xs">
          {category}
        </Badge>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Key Features:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          onClick={onLearnMore}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:shadow-glow-primary"
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
};