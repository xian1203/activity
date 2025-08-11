import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { firestoreService, Activity } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

export const FirebaseExample = () => {
  const { user, signIn, signUp, logout } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    const result = await firestoreService.getActivities();
    setLoading(false);

    if (result.success) {
      setActivities(result.data || []);
      toast({
        title: "Success",
        description: `Loaded ${result.data?.length || 0} activities`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    }
  };

  const createSampleActivity = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to create activities",
        variant: "destructive",
      });
      return;
    }

    const sampleActivity = {
      title: "Sample Activity",
      description: "This is a sample activity created for testing",
      category: "Exercise",
      duration: 30,
      difficulty: 'medium' as const,
      userId: user.uid,
    };

    setLoading(true);
    const result = await firestoreService.createActivity(sampleActivity);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Sample activity created!",
      });
      loadActivities(); // Reload activities
    } else {
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Authentication</CardTitle>
          <CardDescription>
            Test Firebase authentication functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSignIn} 
                  disabled={loading}
                  variant="default"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignUp} 
                  disabled={loading}
                  variant="outline"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Signed in as: {user.email}
              </p>
              <Button onClick={handleLogout} variant="destructive">
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Firestore Operations</CardTitle>
            <CardDescription>
              Test Firestore database operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={loadActivities} disabled={loading}>
                Load Activities
              </Button>
              <Button onClick={createSampleActivity} disabled={loading} variant="outline">
                Create Sample Activity
              </Button>
            </div>

            {activities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Activities ({activities.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {activity.category}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {activity.duration}min
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
