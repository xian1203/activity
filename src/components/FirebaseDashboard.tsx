import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  chatService, 
  todoService, 
  fileService, 
  eventService, 
  productService, 
  feedbackService, 
  blogService, 
  notificationService,
  chatRoomService,
  ChatMessage,
  ChatRoom,
  TodoItem,
  FileItem,
  Event,
  Booking,
  Product,
  Feedback,
  BlogPost,
  Notification
} from '@/lib/firebaseServices';
import { sampleProducts } from '@/data/sampleProducts';
import { Timestamp } from 'firebase/firestore';
import ProfileCard from './ProfileCard';
import { CloudinaryService } from '@/lib/cloudinary';
import { 
  MessageSquare, 
  CheckSquare, 
  Upload, 
  Calendar, 
  ShoppingBag, 
  Star, 
  FileText, 
  Bell,
  Send,
  Plus,
  Trash2,
  Edit,
  Heart,
  Download,
  Clock,
  MapPin,
  DollarSign,
  Shield,
  User,
  Camera,
  X
} from 'lucide-react';

export const FirebaseDashboard = () => {
  const { user, userProfile, signIn, signUp, signInWithGoogle, forgotPassword, logout, elevateToAdmin, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
  // Admin authentication states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  const [adminSignupCode, setAdminSignupCode] = useState('');

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  
  // Todo states
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  
  // File upload states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Event states
  const [events, setEvents] = useState<Event[]>([]);
  const [userBookings, setUserBookings] = useState<Record<string, Booking>>({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to tomorrow
    location: '',
    price: '',
    maxSlots: '',
    imageUrl: ''
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Product states
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    inStock: true
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Feedback states
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });
  
  // Blog states
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', published: true });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<{ title: string; message: string; type: Notification['type'] }>({ title: '', message: '', type: 'info' });

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    displayName: '',
    photoURL: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [profileImageUploadProgress, setProfileImageUploadProgress] = useState(0);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    
    // Check if user is admin
    const isUserAdmin = userProfile?.role === 'admin';
    
    // Load todos
    const unsubscribeTodos = todoService.subscribeToTodos(user.uid, setTodos);
    
    // Load files
    const filesResult = await fileService.getUserFiles(user.uid, isUserAdmin);
    setFiles(filesResult);
    
    // Load events
    console.log('Loading events...');
    const eventsResult = await eventService.getEvents();
    console.log('Events result:', eventsResult);
    if (eventsResult.success) {
      setEvents(eventsResult.data);
      console.log('Events loaded:', eventsResult.data);
      // Check user bookings
      const bookings: Record<string, Booking> = {};
      for (const event of eventsResult.data) {
        const booking = await eventService.getUserBooking(event.id!, user.uid);
        if (booking.success && booking.data) {
          bookings[event.id!] = booking.data;
        }
      }
      setUserBookings(bookings);
      console.log('User bookings loaded:', bookings);
    } else {
      console.error('Failed to load events:', eventsResult);
    }
    
    // Load products and favorites
    setIsLoadingProducts(true);
    try {
    const productsResult = await productService.getProducts();
    if (productsResult.success) setProducts(productsResult.data);
    
    const favoritesResult = await productService.getUserFavorites(user.uid);
    if (favoritesResult.success) setFavorites(favoritesResult.data);
    } finally {
      setIsLoadingProducts(false);
    }
    
    // Load feedback
    const feedbackResult = await feedbackService.getFeedback();
    if (feedbackResult.success) setFeedback(feedbackResult.data);
    
    const avgRating = await feedbackService.getAverageRating();
    if (avgRating.success) setAverageRating(avgRating.average);
    
    // Load blog posts
    const postsResult = await blogService.getPosts();
    if (postsResult.success) setBlogPosts(postsResult.data);
    
    // Subscribe to notifications (user-specific only to avoid Firestore 'in' with null)
    const unsubscribeNotifications = notificationService.subscribeToNotifications(user.uid, setNotifications);
    
    return () => {
      unsubscribeTodos();
      unsubscribeNotifications();
    };
  }, [user, userProfile]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      // If loadAllData returns a cleanup function, handle it
      const maybeCleanup = loadAllData();
      // If it's a Promise, ignore cleanup here (subs are cleaned up on unmount anyway)
      if (typeof maybeCleanup === 'function') {
        return maybeCleanup as unknown as () => void;
      }
    }
  }, [user, loadAllData]);

  // Authentication handlers
  const handleAuth = async () => {
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const result = isSignUp ? await signUp(email, password, displayName) : await signIn(email, password);

    if (result.success) {
      toast({ title: 'Success', description: isSignUp ? 'Account created!' : 'Signed in successfully!' });
      setEmail('');
      setPassword('');
      setDisplayName('');
    } else {
      toast({ title: 'Error', description: 'Authentication failed. Please try again.', variant: 'destructive' });
    }
  };

  const handleAdminAuth = async () => {
    if (!adminEmail || !adminPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (isAdminSignUp && !adminSignupCode) {
      toast({ title: 'Error', description: 'Admin code is required for admin signup', variant: 'destructive' });
      return;
    }

    try {
      console.log('Admin auth attempt:', { isAdminSignUp, adminEmail, hasCode: !!adminSignupCode });
      
      const result = isAdminSignUp 
        ? await signUp(adminEmail, adminPassword, adminDisplayName) 
        : await signIn(adminEmail, adminPassword);

      console.log('Auth result:', result);

      if (result.success) {
        if (isAdminSignUp) {
          // For admin signup, we need to elevate the user to admin
          console.log('Attempting admin elevation with code:', adminSignupCode);
          const elevateResult = await elevateToAdmin(adminSignupCode);
          console.log('Elevate result:', elevateResult);
          
          if (elevateResult.success) {
            toast({ title: 'Success', description: 'Admin account created and elevated!' });
          } else {
            console.error('Admin elevation failed:', elevateResult.error);
            toast({ 
              title: 'Warning', 
              description: `Account created but admin elevation failed: ${elevateResult.error}`, 
              variant: 'destructive' 
            });
          }
        } else {
          toast({ title: 'Success', description: 'Admin signed in successfully!' });
        }
        setAdminEmail('');
        setAdminPassword('');
        setAdminDisplayName('');
        setAdminSignupCode('');
      } else {
        console.error('Admin auth failed:', result.error);
        const errorMessage = result.error instanceof Error ? result.error.message : 'Unknown error';
        toast({ 
          title: 'Error', 
          description: `Admin authentication failed: ${errorMessage}`, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Admin auth exception:', error);
      toast({ 
        title: 'Error', 
        description: `Admin authentication exception: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      toast({ title: 'Success', description: 'Signed in with Google!' });
    } else {
      toast({ title: 'Error', description: 'Google sign-in failed.', variant: 'destructive' });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      toast({ title: 'Success', description: 'Password reset email sent!' });
      setShowForgotPassword(false);
    } else {
      toast({ title: 'Error', description: 'Failed to send reset email.', variant: 'destructive' });
    }
  };

  // Chat handlers
  useEffect(() => {
    if (user) {
      // Load chat rooms
      const unsubscribeRooms = chatRoomService.subscribeToRooms(setChatRooms);
      return unsubscribeRooms;
    }
    return;
  }, [user]);

  // Auto-select first room when rooms are loaded
  useEffect(() => {
    if (chatRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(chatRooms[0].id!);
    }
  }, [chatRooms, selectedRoom]);

  useEffect(() => {
    if (user && selectedRoom) {
      const unsubscribe = chatService.subscribeToMessages(selectedRoom, setMessages);
      return unsubscribe;
    }
    return;
  }, [user, selectedRoom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedRoom) return;
    
    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      text: newMessage,
      userId: user.uid,
      userName: userProfile?.displayName || user.email || 'Anonymous',
      userPhoto: userProfile?.photoURL,
      roomId: selectedRoom
    };

    const result = await chatService.sendMessage(message);
    if (result.success) {
      setNewMessage('');
    } else {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  };

  const createChatRoom = async () => {
    if (!user || !newRoom.name.trim() || !newRoom.description.trim()) return;
    
    const room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'> = {
      name: newRoom.name,
      description: newRoom.description,
      createdBy: user.uid,
      createdByEmail: user.email || '',
      isActive: true
    };

    const result = await chatRoomService.createRoom(room);
    if (result.success) {
      toast({ title: 'Success', description: 'Chat room created!' });
      setNewRoom({ name: '', description: '' });
    } else {
      toast({ title: 'Error', description: 'Failed to create chat room', variant: 'destructive' });
    }
  };

  // Todo handlers
  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;
    
    const todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'> = {
      text: newTodo,
      completed: false,
      userid: user.uid
    };

    const result = await todoService.addTodo(todo);
    if (result.success) {
      setNewTodo('');
    } else {
      const errorMessage = result.error === 'Admins cannot create todos' 
        ? 'Admins cannot create todos' 
        : 'Failed to add todo';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    if (!user) return;
    await todoService.updateTodo(todoId, { completed });
  };

  const deleteTodo = async (todoId: string) => {
    if (!user) return;
    await todoService.deleteTodo(todoId);
  };

  const deleteFile = async (fileId: string, publicId: string) => {
    if (!user) return;
    const result = await fileService.deleteFile(fileId, publicId);
    if (result.success) {
      toast({ title: 'Success', description: 'File deleted successfully!' });
      const filesResult = await fileService.getUserFiles(user.uid, isAdmin);
      setFiles(filesResult);
    } else {
      toast({ title: 'Error', description: 'Failed to delete file', variant: 'destructive' });
    }
  };

  // File upload handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    const result = await fileService.uploadFile(
      file, 
      user.uid, 
      userProfile?.displayName || user.displayName || 'Anonymous',
      user.email || '',
      setUploadProgress
    );
    setIsUploading(false);

    if (result.success) {
      toast({ title: 'Success', description: 'File uploaded successfully!' });
      const filesResult = await fileService.getUserFiles(user.uid, isAdmin);
      setFiles(filesResult);
    } else {
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
    }
  };

  // Event handlers
  const createEvent = async () => {
    console.log('Creating event...', { user, isAdmin, newEvent });
    
    if (!user || !newEvent.title.trim() || !newEvent.description.trim() || !newEvent.date || !newEvent.maxSlots) {
      console.log('Validation failed:', { user: !!user, isAdmin, title: newEvent.title.trim(), description: newEvent.description.trim(), date: newEvent.date, maxSlots: newEvent.maxSlots });
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      // Simple date conversion
      const dateObj = new Date(newEvent.date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        toast({ title: 'Error', description: 'Invalid date format. Please select a valid date and time.', variant: 'destructive' });
        return;
      }
      
      // Check if the date is in the future
      if (dateObj <= new Date()) {
        toast({ title: 'Error', description: 'Event date must be in the future.', variant: 'destructive' });
        return;
      }

      // Create timestamp
      const timestamp = Timestamp.fromDate(dateObj);
      
      const event: Omit<Event, 'id' | 'bookedSlots'> = {
        title: newEvent.title,
        description: newEvent.description,
        date: timestamp,
        location: newEvent.location?.trim() || undefined,
        price: newEvent.price ? parseFloat(newEvent.price) : undefined,
        maxSlots: parseInt(newEvent.maxSlots),
        ...(newEvent.imageUrl?.trim() && { imageUrl: newEvent.imageUrl.trim() })
      };

      console.log('Event object to create:', event);
      console.log('Event imageUrl value:', event.imageUrl);
      console.log('Event imageUrl type:', typeof event.imageUrl);
      console.log('Calling eventService.createEvent...');

      const result = await eventService.createEvent(event);
      console.log('Event creation result:', result);

      if (result.success) {
        toast({ title: 'Success', description: 'Event created successfully!' });
        setNewEvent({
          title: '',
          description: '',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to tomorrow
          location: '',
          price: '',
          maxSlots: '',
          imageUrl: ''
        });
        
        console.log('Reloading events...');
        // Reload events
        const eventsResult = await eventService.getEvents();
        if (eventsResult.success) {
          setEvents(eventsResult.data);
          console.log('Events reloaded:', eventsResult.data);
        } else {
          console.error('Failed to reload events:', eventsResult);
        }
      } else {
        console.error('Event creation failed:', result);
        toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error in createEvent:', error);
      toast({ title: 'Error', description: `Failed to create event: ${error}`, variant: 'destructive' });
    }
  };

  const updateEvent = async () => {
    if (!editingEvent || !user || !isAdmin) return;

    try {
      // The editingEvent.date is already a Timestamp, so we need to convert it to a Date for validation
      console.log('Original date for update:', editingEvent.date);
      const dateObj = editingEvent.date.toDate();
      console.log('Converted Date object for update:', dateObj);
      
      // Check if the date is in the future
      if (dateObj <= new Date()) {
        console.error('Date is in the past or present for update:', dateObj);
        toast({ title: 'Error', description: 'Event date must be in the future.', variant: 'destructive' });
        return;
      }

      const updates: Partial<Event> = {
        title: editingEvent.title,
        description: editingEvent.description,
        date: Timestamp.fromDate(dateObj),
        location: editingEvent.location?.trim() || undefined,
        price: editingEvent.price,
        maxSlots: editingEvent.maxSlots,
        ...(editingEvent.imageUrl?.trim() && { imageUrl: editingEvent.imageUrl.trim() })
      };

      console.log('Event updates to apply:', updates);
      const result = await eventService.updateEvent(editingEvent.id!, updates);
      if (result.success) {
        toast({ title: 'Success', description: 'Event updated successfully!' });
        setEditingEvent(null);
        // Reload events
        const eventsResult = await eventService.getEvents();
        if (eventsResult.success) setEvents(eventsResult.data);
      } else {
        console.error('Event update failed:', result);
        toast({ title: 'Error', description: 'Failed to update event', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error in updateEvent:', error);
      toast({ title: 'Error', description: `Failed to update event: ${error}`, variant: 'destructive' });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user || !isAdmin) return;

    const result = await eventService.deleteEvent(eventId);
    if (result.success) {
      toast({ title: 'Success', description: 'Event deleted successfully!' });
      // Reload events
      const eventsResult = await eventService.getEvents();
      if (eventsResult.success) setEvents(eventsResult.data);
    } else {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    }
  };

  const bookEvent = async (event: Event) => {
    if (!user) return;

    const booking = {
      eventId: event.id!,
      userid: user.uid,
      userName: userProfile?.displayName || user.email || 'Anonymous',
      userEmail: user.email || ''
    };

    const result = await eventService.bookEvent(booking);
    if (result.success) {
      toast({ title: 'Success', description: 'Event booked successfully!' });
      const eventsResult = await eventService.getEvents();
      if (eventsResult.success) setEvents(eventsResult.data);
    } else {
      const err = (result as { success: false; error?: unknown }).error;
      toast({ title: 'Error', description: typeof err === 'string' ? err : 'Failed to book event', variant: 'destructive' });
    }
  };

  // Product handlers
  const createProduct = async () => {
    if (!user || !newProduct.name.trim() || !newProduct.description.trim() || !newProduct.price.trim() || !newProduct.imageUrl.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const product: Omit<Product, 'id'> = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl.trim(),
      inStock: newProduct.inStock
    };

    const result = await productService.createProduct(product);
    if (result.success) {
      toast({ title: 'Success', description: 'Product created successfully!' });
      setNewProduct({ name: '', description: '', price: '', imageUrl: '', inStock: true });
      setShowProductForm(false);
      // Reload products
      const productsResult = await productService.getProducts();
      if (productsResult.success) setProducts(productsResult.data);
    } else {
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
    }
  };

  const updateProduct = async () => {
    if (!editingProduct || !editingProduct.name.trim() || !editingProduct.description.trim() || !editingProduct.price) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const updatedProduct = {
      name: editingProduct.name.trim(),
      description: editingProduct.description.trim(),
      price: editingProduct.price,
      imageUrl: editingProduct.imageUrl?.trim() || '',
      inStock: editingProduct.inStock
    };

    const result = await productService.updateProduct(editingProduct.id!, updatedProduct);
    if (result.success) {
      toast({ title: 'Success', description: 'Product updated successfully!' });
      setEditingProduct(null);
      // Reload products
      const productsResult = await productService.getProducts();
      if (productsResult.success) setProducts(productsResult.data);
    } else {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    }
  };

  const deleteProduct = async (productId: string) => {
    const result = await productService.deleteProduct(productId);
    if (result.success) {
      toast({ title: 'Success', description: 'Product deleted successfully!' });
      setProducts(products.filter(product => product.id !== productId));
      // Remove from favorites if it was favorited
      if (favorites.includes(productId)) {
        setFavorites(favorites.filter(id => id !== productId));
      }
    } else {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const populateSampleProducts = async () => {
    if (!user) return;
    
    try {
      let successCount = 0;
      for (const product of sampleProducts) {
        const result = await productService.createProduct(product);
        if (result.success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast({ title: 'Success', description: `Added ${successCount} sample products!` });
        // Reload products
        const productsResult = await productService.getProducts();
        if (productsResult.success) setProducts(productsResult.data);
      } else {
        toast({ title: 'Error', description: 'Failed to add sample products', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to populate sample products', variant: 'destructive' });
    }
  };

  const clearAllProducts = async () => {
    if (!user || !isAdmin) return;
    
    if (confirm('Are you sure you want to delete all products? This action cannot be undone.')) {
      try {
        let deletedCount = 0;
        for (const product of products) {
          const result = await productService.deleteProduct(product.id!);
          if (result.success) {
            deletedCount++;
          }
        }
        
        if (deletedCount > 0) {
          toast({ title: 'Success', description: `Deleted ${deletedCount} products!` });
          setProducts([]);
          setFavorites([]);
        } else {
          toast({ title: 'Error', description: 'Failed to delete products', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to clear products', variant: 'destructive' });
      }
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;

    const isFavorite = favorites.includes(productId);
    const result = isFavorite 
      ? await productService.removeFromFavorites(user.uid, productId)
      : await productService.addToFavorites(user.uid, productId);

    if (result.success) {
      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        setFavorites([...favorites, productId]);
      }
    }
  };

  // Feedback handlers
  const submitFeedback = async () => {
    if (!user || !newFeedback.comment.trim()) return;

    const fb: Omit<Feedback, 'id' | 'createdAt'> = {
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      userid: user.uid,
      userName: userProfile?.displayName || user.email || 'Anonymous'
    };

    const result = await feedbackService.submitFeedback(fb);
    if (result.success) {
      toast({ title: 'Success', description: 'Feedback submitted!' });
      setNewFeedback({ rating: 5, comment: '' });
      const feedbackResult = await feedbackService.getFeedback();
      if (feedbackResult.success) setFeedback(feedbackResult.data);
    } else {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
    }
  };

  // Blog handlers
  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    const post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title: newPost.title,
      content: newPost.content,
      authorId: user.uid,
      authorName: userProfile?.displayName || user.email || 'Anonymous',
      published: newPost.published
    };

    const result = await blogService.createPost(post);
    if (result.success) {
      toast({ title: 'Success', description: 'Post created!' });
      setNewPost({ title: '', content: '', published: true });
      const postsResult = await blogService.getPosts();
      if (postsResult.success) setBlogPosts(postsResult.data);
    } else {
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
    }
  };

  const deletePost = async (postId: string) => {
    const result = await blogService.deletePost(postId);
    if (result.success) {
      toast({ title: 'Success', description: 'Post deleted!' });
      setBlogPosts(blogPosts.filter(post => post.id !== postId));
    } else {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    }
  };

  // Notification handlers
  const sendNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) return;

    const notification: Omit<Notification, 'id' | 'read' | 'createdAt'> = {
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      userid: user?.uid || null
    };

    const result = await notificationService.sendNotification(notification);
    if (result.success) {
      toast({ title: 'Success', description: 'Notification sent!' });
      setNewNotification({ title: '', message: '', type: 'info' });
    } else {
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  // Profile editing functions
  const startProfileEdit = () => {
    setEditingProfile({
      displayName: userProfile?.displayName || '',
      photoURL: userProfile?.photoURL || ''
    });
    setIsEditingProfile(true);
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setEditingProfile({ displayName: '', photoURL: '' });
    setProfileImageFile(null);
    setProfileImageUploadProgress(0);
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Please select an image smaller than 5MB', variant: 'destructive' });
        return;
      }
      setProfileImageFile(file);
    }
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImageFile) return null;

    try {
      setIsUploadingProfileImage(true);
      setProfileImageUploadProgress(0);

      const cloudinary = new CloudinaryService();
      const response = await cloudinary.uploadFile(
        profileImageFile,
        'profile-images',
        (progress) => setProfileImageUploadProgress(progress)
      );

      return response.secure_url;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload profile image', variant: 'destructive' });
      return null;
    } finally {
      setIsUploadingProfileImage(false);
      setProfileImageUploadProgress(0);
    }
  };

  const saveProfileChanges = async () => {
    try {
      let newPhotoURL = editingProfile.photoURL;

      // Upload new image if selected
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          newPhotoURL = uploadedUrl;
        } else {
          return; // Upload failed
        }
      }

      // Update profile
      const result = await updateUserProfile({
        displayName: editingProfile.displayName,
        photoURL: newPhotoURL
      });

      if (result.success) {
        toast({ title: 'Profile updated', description: 'Your profile has been updated successfully' });
        setIsEditingProfile(false);
        setProfileImageFile(null);
        setProfileImageUploadProgress(0);
      } else {
        toast({ title: 'Update failed', description: 'Failed to update profile', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  console.log('Admin check:', { userProfile, role: userProfile?.role, isAdmin });

  // Debug effect for events tab
  useEffect(() => {
    console.log('Events tab debug - isAdmin:', isAdmin, 'userProfile:', userProfile, 'user:', user);
  }, [isAdmin, userProfile, user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Firebase Dashboard</h1>
          <p className="text-muted-foreground">Choose your authentication method</p>
        </div>
        
        <div className="flex gap-4 mb-6">
          <Button 
            variant={!isAdminMode ? "default" : "outline"} 
            onClick={() => setIsAdminMode(false)}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            User Login
          </Button>
          <Button 
            variant={isAdminMode ? "default" : "outline"} 
            onClick={() => setIsAdminMode(true)}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </div>

        {!isAdminMode ? (
          // Regular User Authentication
          <Card>
            <CardHeader>
              <CardTitle className="text-center">User Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in as a regular user to access basic features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showForgotPassword ? (
                <>
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {isSignUp && (
                      <Input placeholder="Display Name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAuth} className="flex-1">{isSignUp ? 'Sign Up' : 'Sign In'}</Button>
                    <Button onClick={handleGoogleSignIn} variant="outline" className="flex-1">Google</Button>
                  </div>
                  <div className="text-center space-y-2">
                    <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-sm">
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </Button>
                    {!isSignUp && (
                      <Button variant="link" onClick={() => setShowForgotPassword(true)} className="text-sm">
                        Forgot Password?
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={handleForgotPassword} className="flex-1">Send Reset Email</Button>
                    <Button variant="outline" onClick={() => setShowForgotPassword(false)} className="flex-1">Back to Sign In</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Admin Authentication
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Authentication
              </CardTitle>
              <CardDescription className="text-center">
                Sign in as an administrator to access all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Admin Email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                />
                <Input 
                  type="password" 
                  placeholder="Admin Password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                />
                {isAdminSignUp && (
                  <>
                    <Input 
                      placeholder="Admin Display Name (optional)" 
                      value={adminDisplayName} 
                      onChange={(e) => setAdminDisplayName(e.target.value)} 
                    />
                    <Input 
                      type="password" 
                      placeholder="Admin Code (required for signup)" 
                      value={adminSignupCode} 
                      onChange={(e) => setAdminSignupCode(e.target.value)} 
                    />
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdminAuth} className="flex-1">
                  {isAdminSignUp ? 'Create Admin Account' : 'Admin Sign In'}
                </Button>
              </div>
              <div className="text-center">
                <Button variant="link" onClick={() => setIsAdminSignUp(!isAdminSignUp)} className="text-sm">
                  {isAdminSignUp ? 'Already have an admin account? Sign In' : 'Need an admin account? Sign Up'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {isAdminSignUp 
                  ? "Admin signup requires a valid admin code. Contact your system administrator."
                  : "Admin accounts have full access to all features."
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firebase Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userProfile?.displayName || user.email}!</p>
          <p className="text-xs text-muted-foreground">Role: {userProfile?.role || 'user'} | Admin: {isAdmin ? 'Yes' : 'No'}</p>
          {!isAdmin && (
            <div className="mt-2 flex gap-2 items-center">
              <Input placeholder="Enter admin code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="max-w-xs" />
              <Button
                variant="secondary"
                onClick={async () => {
                  const res = await elevateToAdmin(adminCode);
                  if (res.success) {
                    toast({ title: 'Admin enabled', description: 'You now have admin access.' });
                    setAdminCode('');
                  } else {
                    toast({ title: 'Invalid code', description: 'Admin code is incorrect or not configured.', variant: 'destructive' });
                  }
                }}
              >Unlock Admin</Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={userProfile?.photoURL} />
            <AvatarFallback>{userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button onClick={logout} variant="outline">Sign Out</Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="todo">Todo</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat Rooms Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Room Creation (Admin Only) */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Create Chat Room</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input 
                      placeholder="Room name" 
                      value={newRoom.name} 
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} 
                    />
                    <Textarea 
                      placeholder="Room description" 
                      value={newRoom.description} 
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} 
                      rows={2}
                    />
                    <Button onClick={createChatRoom} size="sm" className="w-full">
                      Create Room
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Room List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chat Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chatRooms.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No chat rooms available</p>
                  ) : (
                    chatRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-2 rounded cursor-pointer text-sm ${
                          selectedRoom === room.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedRoom(room.id!)}
                      >
                        <div className="font-medium">{room.name}</div>
                        <div className="text-xs text-muted-foreground">{room.description}</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> 
                    {selectedRoom ? chatRooms.find(r => r.id === selectedRoom)?.name || 'Chat' : 'Select a room'}
                  </CardTitle>
                  <CardDescription>
                    {selectedRoom ? chatRooms.find(r => r.id === selectedRoom)?.description : 'Choose a chat room to start messaging'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRoom ? (
                    <>
                      <div className="h-64 border rounded-lg p-4 overflow-y-auto space-y-2">
                        {messages.map((message) => (
                          <div key={message.id} className="flex items-start gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.userPhoto} />
                              <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{message.userName}</span>
                                <span className="text-xs text-muted-foreground">{message.timestamp?.toDate().toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm">{message.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type a message..." 
                          value={newMessage} 
                          onChange={(e) => setNewMessage(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                        />
                        <Button 
                          onClick={sendMessage} 
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 border rounded-lg p-4 flex items-center justify-center">
                      <p className="text-muted-foreground">Select a chat room to start messaging</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Todo Tab */}
        <TabsContent value="todo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Todo List (Users Only)</CardTitle>
              <CardDescription>Regular users can create and manage their own tasks. Admins cannot create todos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Add a new todo..." value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isAdmin && addTodo()} disabled={isAdmin} />
                <Button onClick={addTodo} disabled={isAdmin} title={isAdmin ? 'Admins cannot create todos' : undefined}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-2 p-2 border rounded">
                    <input type="checkbox" checked={todo.completed} onChange={(e) => toggleTodo(todo.id!, e.target.checked)} className="rounded" disabled={isAdmin} />
                    <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.text}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id!)} disabled={isAdmin}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              {isAdmin && <p className="text-xs text-muted-foreground">Admins cannot create or modify todos.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> File Upload & Download</CardTitle>
              <CardDescription>
                Upload files to Cloudinary with progress tracking. 
                {isAdmin ? ' Admins can view all uploaded files.' : ' You can only view your own files.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload a file</p>
                </label>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          {isAdmin && file.userName && (
                            <>
                              <span>•</span>
                              <span>Uploaded by {file.userName}</span>
                              {file.userEmail && <span>({file.userEmail})</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>Download</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id!, file.publicId)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {/* Event Creation Form (All Authenticated Users) */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create New Event</CardTitle>
                <CardDescription>Create events that users can book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input 
                      placeholder="Event title..." 
                      value={newEvent.title} 
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Slots *</label>
                    <Input 
                      type="number" 
                      placeholder="Maximum attendees..." 
                      value={newEvent.maxSlots} 
                      onChange={(e) => setNewEvent({ ...newEvent, maxSlots: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date & Time *</label>
                    <Input 
                      type="datetime-local" 
                      value={newEvent.date} 
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Price (optional)..." 
                      value={newEvent.price} 
                      onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Event location (optional)..." 
                      value={newEvent.location} 
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      placeholder="Event image URL (optional)..." 
                      value={newEvent.imageUrl} 
                      onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea 
                    placeholder="Event description..." 
                    value={newEvent.description} 
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createEvent}>Create Event</Button>
                  <Button variant="outline" onClick={() => console.log('Test - Current state:', { isAdmin, userProfile, newEvent })}>Debug Info</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Event Booking System</CardTitle>
              <CardDescription>
                {isAdmin ? 'Manage events and view bookings. Users can book available events.' : 'Book events with real-time slot availability'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {isAdmin ? 'No events created yet. Create your first event above!' : 'No events available at the moment.'}
                  </div>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      {event.imageUrl && (<img src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover" />)}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingEvent(event)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id!)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{event.date.toDate().toLocaleDateString()}</span></div>
                          {event.location && (<div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>)}
                          {event.price && (<div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /><span>₱{event.price}</span></div>)}
                          <div className="flex items-center justify-between">
                            <span>Slots: {event.bookedSlots}/{event.maxSlots}</span>
                            {!isAdmin && (
                              userBookings[event.id!] ? (
                                <Badge variant="secondary">Booked</Badge>
                              ) : event.bookedSlots >= event.maxSlots ? (
                                <Badge variant="destructive">Full</Badge>
                              ) : (
                                <Button size="sm" onClick={() => bookEvent(event)}>Book Now</Button>
                              )
                            )}
                            {isAdmin && (
                              <Badge variant={event.bookedSlots >= event.maxSlots ? "destructive" : "default"}>
                                {event.bookedSlots >= event.maxSlots ? "Full" : "Available"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Edit Dialog */}
          {editingEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Edit className="w-5 h-5" /> Edit Event</CardTitle>
                <CardDescription>Update event details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input 
                      placeholder="Event title..." 
                      value={editingEvent.title} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Slots *</label>
                    <Input 
                      type="number" 
                      placeholder="Maximum attendees..." 
                      value={editingEvent.maxSlots.toString()} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, maxSlots: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date & Time *</label>
                    <Input 
                      type="datetime-local" 
                      value={editingEvent.date.toDate().toISOString().slice(0, 16)} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: Timestamp.fromDate(new Date(e.target.value)) })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Price (optional)..." 
                      value={editingEvent.price?.toString() || ''} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, price: e.target.value ? parseFloat(e.target.value) : undefined })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Event location (optional)..." 
                      value={editingEvent.location || ''} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      placeholder="Event image URL (optional)..." 
                      value={editingEvent.imageUrl || ''} 
                      onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea 
                    placeholder="Event description..." 
                    value={editingEvent.description} 
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} 
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateEvent}>Update Event</Button>
                  <Button variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Product Creation Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Product</CardTitle>
                  <CardDescription>Create new products for your catalog</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductForm(!showProductForm)}
                >
                  {showProductForm ? 'Hide Form' : 'Show Form'}
                </Button>
              </div>
            </CardHeader>
            {showProductForm && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Product Name *</label>
                    <Input 
                      placeholder="Enter product name..." 
                      value={newProduct.name} 
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price *</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL *</label>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      value={newProduct.imageUrl} 
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={newProduct.inStock} 
                      onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })} 
                    />
                    <label className="text-sm">In Stock</label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea 
                    placeholder="Describe your product..." 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createProduct}>Create Product</Button>
                  <Button variant="outline" onClick={populateSampleProducts}>Add Sample Products</Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Product Search and Filter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> 
                    Product Catalog 
                    <Badge variant="secondary" className="ml-2">{products.length}</Badge>
                  </CardTitle>
              <CardDescription>Browse products and manage your favorites</CardDescription>
                </div>
                {isAdmin && products.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={clearAllProducts}>
                    Clear All Products
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search products..." 
                  value={productSearchTerm} 
                  onChange={(e) => setProductSearchTerm(e.target.value)} 
                  className="max-w-sm"
                />
                <Button variant="outline" onClick={() => setProductSearchTerm('')}>Clear</Button>
              </div>
              
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground">Create your first product or add some sample products to get started!</p>
                </div>
              ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {products
                    .filter(product => 
                      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      product.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                    )
                    .map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleFavorite(product.id!)}>
                          <Heart className={`w-4 h-4 ${favorites.includes(product.id!) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                            {isAdmin && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => setEditingProduct(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id!)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">₱{product.price}</span>
                        <Badge variant={product.inStock ? 'default' : 'secondary'}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </CardContent>
          </Card>

          {/* Product Edit Dialog */}
          {editingProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Edit className="w-5 h-5" /> Edit Product</CardTitle>
                <CardDescription>Update product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Product Name *</label>
                    <Input 
                      placeholder="Enter product name..." 
                      value={editingProduct.name} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price *</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={editingProduct.price} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      value={editingProduct.imageUrl || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={editingProduct.inStock} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })} 
                    />
                    <label className="text-sm">In Stock</label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea 
                    placeholder="Describe your product..." 
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} 
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateProduct}>Update Product</Button>
                  <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Favorites Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" /> 
                My Favorites 
                <Badge variant="secondary" className="ml-2">{favorites.length}</Badge>
              </CardTitle>
              <CardDescription>Products you've added to your favorites</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No favorites yet. Click the heart icon on any product to add it to your favorites!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products
                    .filter(product => favorites.includes(product.id!))
                    .map((product) => (
                    <Card key={product.id} className="overflow-hidden border-2 border-red-200">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Button variant="ghost" size="sm" onClick={() => toggleFavorite(product.id!)}>
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">₱{product.price}</span>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5" /> Feedback & Rating System</CardTitle>
              <CardDescription>Submit feedback and see average ratings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{averageRating}</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setNewFeedback({ ...newFeedback, rating: star })} className="p-1">
                        <Star className={`w-5 h-5 ${star <= newFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Comment</label>
                  <Textarea placeholder="Share your feedback..." value={newFeedback.comment} onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })} className="mt-1" />
                </div>
                <Button onClick={submitFeedback}>Submit Feedback</Button>
              </div>
              <div className="space-y-2">
                {feedback.map((item) => (
                  <div key={item.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.userName}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Blog System with CRUD</CardTitle>
              <CardDescription>Create, read, update, and delete blog posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 border rounded">
                <h3 className="font-semibold">Create New Post</h3>
                <Input placeholder="Post title..." value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                <Textarea placeholder="Post content..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={4} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={newPost.published} onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })} />
                  <label className="text-sm">Publish immediately</label>
                </div>
                <Button onClick={createPost}>Create Post</Button>
              </div>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingPost(post)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePost(post.id!)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">By {post.authorName} • {post.createdAt.toDate().toLocaleDateString()}</p>
                      <p className="text-sm">{post.content}</p>
                      {!post.published && (<Badge variant="secondary" className="mt-2">Draft</Badge>)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> 
                Real-time Notifications
              </CardTitle>
              <CardDescription>Send and receive notifications in real-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notification Creation Form - Admin Only */}
              {isAdmin && (
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <h3 className="font-semibold text-lg">Send Notification (Admin Only)</h3>
                  <Input placeholder="Notification title..." value={newNotification.title} onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })} />
                  <Textarea placeholder="Notification message..." value={newNotification.message} onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} rows={3} />
                  <div className="flex gap-2">
                    <select 
                      value={newNotification.type} 
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification['type'] })} 
                      className="px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                    <Button onClick={sendNotification} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Send Notification
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Message for non-admin users */}
              {!isAdmin && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-5 h-5" />
                    <p className="text-sm">Only administrators can send notifications. You can view received notifications below.</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">Notifications will appear here when sent</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg transition-all duration-200 ${
                      !notification.read 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-card border-border hover:border-border/60'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.createdAt.toDate().toLocaleString()}</p>
                      </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant={
                              notification.type === 'error' ? 'destructive' : 
                              notification.type === 'warning' ? 'secondary' : 
                              notification.type === 'success' ? 'default' : 
                              'outline'
                            }
                            className="capitalize"
                          >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => markNotificationAsRead(notification.id!)}
                              className="text-xs h-7 px-2 bg-background hover:bg-accent text-foreground border-border"
                            >
                              Mark Read
                            </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> 
                User Profile
              </CardTitle>
              <CardDescription>View and manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Card Display */}
              <div className="flex justify-center">
                <ProfileCard
                  name={userProfile?.displayName || user.email || 'Anonymous User'}
                  title={userProfile?.role === 'admin' ? 'Administrator' : 'User'}
                  handle={user.email?.split('@')[0] || 'user'}
                  status={userProfile?.role === 'admin' ? 'Admin' : 'Online'}
                  contactText="Edit Profile"
                  avatarUrl={userProfile?.photoURL || '/placeholder.svg'}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  onContactClick={startProfileEdit}
                />
              </div>

              {/* Profile Edit Form */}
              {isEditingProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      Edit Profile
                    </CardTitle>
                    <CardDescription>Update your profile information and photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Avatar Preview */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage 
                            src={profileImageFile ? URL.createObjectURL(profileImageFile) : editingProfile.photoURL || '/placeholder.svg'} 
                          />
                          <AvatarFallback>
                            {editingProfile.displayName?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Profile Photo</p>
                        {profileImageFile && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600">{profileImageFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProfileImageFile(null)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {isUploadingProfileImage && (
                          <div className="space-y-2">
                            <Progress value={profileImageUploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground">Uploading... {Math.round(profileImageUploadProgress)}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Display Name</label>
                        <Input
                          value={editingProfile.displayName}
                          onChange={(e) => setEditingProfile(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Enter your display name"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button onClick={saveProfileChanges} disabled={isUploadingProfileImage}>
                        {isUploadingProfileImage ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={cancelProfileEdit}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{userProfile?.displayName || 'No display name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">User ID:</span>
                        <span className="text-sm font-mono">{user.uid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Role:</span>
                        <Badge variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}>
                          {userProfile?.role || 'user'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Admin Status:</span>
                        <Badge variant={isAdmin ? 'default' : 'outline'}>
                          {isAdmin ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email Verified:</span>
                        <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                          {user.emailVerified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{events.length}</div>
                        <div className="text-sm text-muted-foreground">Events</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{products.length}</div>
                        <div className="text-sm text-muted-foreground">Products</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{todos.length}</div>
                        <div className="text-sm text-muted-foreground">Todos</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{favorites.length}</div>
                        <div className="text-sm text-muted-foreground">Favorites</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Account Created:</span>
                        <span className="text-sm">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Sign In:</span>
                        <span className="text-sm">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Elevation Section */}
              {!isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Access</CardTitle>
                    <CardDescription>Enter admin code to unlock administrator privileges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter admin code" 
                        value={adminCode} 
                        onChange={(e) => setAdminCode(e.target.value)} 
                        className="max-w-xs" 
                      />
                      <Button
                        variant="default"
                        onClick={async () => {
                          const res = await elevateToAdmin(adminCode);
                          if (res.success) {
                            toast({ title: 'Admin enabled', description: 'You now have admin access.' });
                            setAdminCode('');
                          } else {
                            toast({ title: 'Invalid code', description: 'Admin code is incorrect or not configured.', variant: 'destructive' });
                          }
                        }}
                      >
                        Unlock Admin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
