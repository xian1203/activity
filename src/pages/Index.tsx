import { useState } from "react";
import { ActivityCard } from "@/components/ui/activity-card";
import { FloatingElements } from "@/components/ui/floating-elements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { activities } from "@/data/activities";
import { Search, Filter, Code2, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FirebaseDashboard } from "@/components/FirebaseDashboard";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { toast } = useToast();

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  const categories = ["All", ...Array.from(new Set(activities.map(a => a.category)))];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || activity.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "All" || activity.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleLearnMore = (activity: typeof activities[0]) => {
    toast({
      title: "Firebase Integration Ready",
      description: "This activity is ready to use with Firebase! Check out the demo above to test authentication and database operations.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      <FloatingElements />
      
      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Firebase Activity Forge</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            10 Firebase Activities
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Master modern web development with these hands-on Firebase projects. Each activity teaches essential backend concepts through practical implementation.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Database className="w-4 h-4" />
              Firebase Integration
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Zap className="w-4 h-4" />
              Real-time Features
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Code2 className="w-4 h-4" />
              React + TypeScript
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
              />
            </div>
            
            <div className="flex gap-2">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className="text-xs"
                >
                  {difficulty}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.slice(0, 3).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Application Dashboard */}
      <section className="relative z-10 container mx-auto px-6 py-12">
        <FirebaseDashboard />
      </section>

      {/* Activities Grid */}
      <main className="relative z-10 container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              description={activity.description}
              icon={activity.icon}
              difficulty={activity.difficulty}
              category={activity.category}
              features={activity.features}
              gradientClass={activity.gradientClass}
              onLearnMore={() => handleLearnMore(activity)}
            />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No activities found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Ready to start building? Firebase is already integrated and ready to use!
            </p>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Explore the Firebase-powered features in the dashboard above
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;