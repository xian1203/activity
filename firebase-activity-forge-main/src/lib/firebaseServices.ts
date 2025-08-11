import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc, query, where, orderBy, onSnapshot, Timestamp, serverTimestamp, limit, startAfter } from 'firebase/firestore';
import { db } from './firebase';
import { cloudinaryService } from './cloudinary';

// ===== INTERFACES =====
export interface ChatMessage {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  roomId: string;
  timestamp?: Timestamp;
}

export interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface TodoItem {
  id?: string;
  text: string;
  completed: boolean;
  userid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FileItem {
  id?: string;
  name: string;
  size: number;
  url: string;
  publicId: string; // Cloudinary public ID for deletion
  userid: string;
  userName?: string; // Display name of the user who uploaded the file
  userEmail?: string; // Email of the user who uploaded the file
  uploadedAt: Timestamp;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: string;
  price?: number;
  maxSlots: number;
  bookedSlots: number;
  imageUrl?: string;
}

export interface Booking {
  id?: string;
  eventId: string;
  userid: string;
  userName: string;
  userEmail: string;
  bookedAt: Timestamp;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
}

export interface Feedback {
  id?: string;
  rating: number;
  comment: string;
  userid: string;
  userName: string;
  createdAt: Timestamp;
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  userid?: string;
  read: boolean;
  createdAt: Timestamp;
}

// ===== CHAT ROOM SERVICE =====
export const chatRoomService = {
  async createRoom(room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'chatRooms'), {
        ...room,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getRooms() {
    try {
      const q = query(collection(db, 'chatRooms'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatRoom[];
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error };
    }
  },

  subscribeToRooms(callback: (rooms: ChatRoom[]) => void) {
    const q = query(collection(db, 'chatRooms'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatRoom[];
      callback(rooms);
    });
  },

  async updateRoom(roomId: string, updates: Partial<ChatRoom>) {
    try {
      const docRef = doc(db, 'chatRooms', roomId);
      await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteRoom(roomId: string) {
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== CHAT SERVICE (Updated for Room Support) =====
export const chatService = {
  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
      const docRef = await addDoc(collection(db, 'chatRooms', message.roomId, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chatRooms', roomId, 'messages'), 
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
      callback(messages);
    });
  },

  async getMessages(roomId: string) {
    try {
      const q = query(
        collection(db, 'chatRooms', roomId, 'messages'), 
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
      return { success: true, data: messages };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== TODO LIST (Firestore) =====
export const todoService = {
  async addTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      // Check if user is an admin - admins cannot create todos
      const userDoc = await getDoc(doc(db, 'users', todo.userid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          return { success: false, error: 'Admins cannot create todos' };
        }
      }
      
      const docRef = await addDoc(collection(db, 'todos'), {
        ...todo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  subscribeToTodos(userId: string, callback: (todos: TodoItem[]) => void) {
    const q = query(collection(db, 'todos'), where('userid', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TodoItem[];
      callback(todos);
    });
  },

  async updateTodo(todoId: string, updates: Partial<TodoItem>) {
    try {
      const docRef = doc(db, 'todos', todoId);
      await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteTodo(todoId: string) {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== FILE UPLOAD SERVICE =====
export const fileService = {
  async uploadFile(file: File, userId: string, userName?: string, userEmail?: string, onProgress?: (progress: number) => void) {
    try {
      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinaryService.uploadFile(
        file, 
        `firebase-app/${userId}`,
        onProgress
      );
      
      const fileItem: Omit<FileItem, 'id' | 'uploadedAt'> = {
        name: file.name,
        size: cloudinaryResponse.bytes,
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        userid: userId,
        userName: userName,
        userEmail: userEmail
      };
      
      const docRef = await addDoc(collection(db, 'files'), {
        ...fileItem,
        uploadedAt: Timestamp.now()
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteFile(fileId: string, publicId: string) {
    try {
      // First delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));
      
      // Then try to delete from Cloudinary
      try {
        await cloudinaryService.deleteFile(publicId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
        // The file will remain in Cloudinary but be removed from Firestore
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getUserFiles(userId: string, isAdmin: boolean = false) {
    try {
      let q;
      if (isAdmin) {
        // Admins can see all files from all users
        q = query(
          collection(db, 'files'),
          orderBy('uploadedAt', 'desc')
        );
      } else {
        // Regular users can only see their own files
        q = query(
          collection(db, 'files'),
          where('userid', '==', userId),
          orderBy('uploadedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FileItem, 'id'>;
        return {
          id: doc.id,
          ...data
        } as FileItem;
      });
    } catch (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
  }
};

// ===== EVENT BOOKING SERVICE =====
export const eventService = {
  async createEvent(event: Omit<Event, 'id' | 'bookedSlots'>) {
    try {
      console.log('eventService.createEvent called with:', event);
      console.log('Event date type:', typeof event.date);
      console.log('Event date value:', event.date);
      console.log('Adding document to events collection...');
      
      const eventData = {
        title: event.title,
        description: event.description,
        date: event.date,
        maxSlots: event.maxSlots,
        bookedSlots: 0,
        ...(event.location && { location: event.location }),
        ...(event.price !== undefined && { price: event.price }),
        ...(event.imageUrl && { imageUrl: event.imageUrl })
      };
      
      console.log('Event data to save:', eventData);
      console.log('Event imageUrl in eventData:', eventData.imageUrl);
      console.log('Event imageUrl type in eventData:', typeof eventData.imageUrl);
      console.log('Event date type in eventData:', typeof eventData.date);
      console.log('Event date value in eventData:', eventData.date);
      console.log('Event date toDate() method available:', typeof eventData.date.toDate === 'function');
      
      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      console.log('Event created successfully with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error in eventService.createEvent:', error);
      return { success: false, error };
    }
  },

  async getEvents() {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      return { success: true, data: events };
    } catch (error) {
      return { success: false, error };
    }
  },

  async bookEvent(booking: Omit<Booking, 'id' | 'bookedAt'>) {
    try {
      // Check if event exists and has available slots
      const eventDoc = await getDoc(doc(db, 'events', booking.eventId));
      if (!eventDoc.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const event = eventDoc.data() as Event;
      if (event.bookedSlots >= event.maxSlots) {
        return { success: false, error: 'Event is full' };
      }
      
      // Check if user already booked
      const existingBooking = await this.getUserBooking(booking.eventId, booking.userid);
      if (existingBooking.success && existingBooking.data) {
        return { success: false, error: 'Already booked this event' };
      }
      
      // Create booking
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        bookedAt: Timestamp.now()
      });
      
      // Update event slots
      await updateDoc(doc(db, 'events', booking.eventId), {
        bookedSlots: event.bookedSlots + 1
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getUserBooking(eventId: string, userId: string) {
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('eventId', '==', eventId),
        where('userid', '==', userId)
      );
      const snapshot = await getDocs(q);
      const booking = snapshot.docs[0];
      return { success: true, data: booking ? { id: booking.id, ...booking.data() } as Booking : null };
    } catch (error) {
      return { success: false, error };
    }
  },

  async updateEvent(eventId: string, updates: Partial<Event>) {
    try {
      const docRef = doc(db, 'events', eventId);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteEvent(eventId: string) {
    try {
      // First delete all bookings for this event
      const bookingsQuery = query(collection(db, 'bookings'), where('eventId', '==', eventId));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const deletePromises = bookingsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the event
      await deleteDoc(doc(db, 'events', eventId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== PRODUCT SERVICE =====
export const productService = {
  async createProduct(product: Omit<Product, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'products'), product);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      return { success: true, data: products };
    } catch (error) {
      return { success: false, error };
    }
  },

  async addToFavorites(userId: string, productId: string) {
    try {
      await setDoc(doc(db, 'users', userId, 'favorites', productId), {
        productId,
        addedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async removeFromFavorites(userId: string, productId: string) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', productId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getUserFavorites(userId: string) {
    try {
      const q = query(collection(db, 'users', userId, 'favorites'), orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(q);
      const favorites = snapshot.docs.map(doc => doc.data().productId);
      return { success: true, data: favorites };
    } catch (error) {
      return { success: false, error };
    }
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteProduct(productId: string) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== FEEDBACK SERVICE =====
export const feedbackService = {
  async submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'feedbacks'), {
        ...feedback,
        createdAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getFeedback() {
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
      return { success: true, data: feedback };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getAverageRating() {
    try {
      const q = query(collection(db, 'feedbacks'));
      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc => doc.data() as Feedback);
      
      if (feedback.length === 0) {
        return { success: true, average: 0 };
      }
      
      const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
      const average = totalRating / feedback.length;
      
      return { success: true, average };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== BLOG SERVICE =====
export const blogService = {
  async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'blogPosts'), {
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getPosts() {
    try {
      const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
      return { success: true, data: posts };
    } catch (error) {
      return { success: false, error };
    }
  },

  async updatePost(postId: string, updates: Partial<BlogPost>) {
    try {
      const docRef = doc(db, 'blogPosts', postId);
      await updateDoc(docRef, {
        title: updates.title,
        content: updates.content,
        authorId: updates.authorId,
        authorName: updates.authorName,
        published: updates.published,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deletePost(postId: string) {
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

// ===== NOTIFICATION SERVICE =====
export const notificationService = {
  async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getNotifications(userId?: string) {
    try {
      let q;
          if (userId) {
      q = query(collection(db, 'notifications'), where('userid', '==', userId), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'notifications'), where('userid', '==', null), orderBy('createdAt', 'desc'));
    }
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })) as Notification[];
      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error };
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
        const q = query(
      collection(db, 'notifications'), 
      where('userid', 'in', [userId, null]),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })) as Notification[];
      callback(notifications);
    });
  },

  async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};
