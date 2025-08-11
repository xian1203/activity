import { 
  Shield, 
  User, 
  MessageCircle, 
  CheckSquare, 
  Upload, 
  Calendar, 
  Heart, 
  MessageSquare, 
  FileText, 
  Bell 
} from "lucide-react";

export const activities = [
  {
    id: 1,
    title: "User Authentication System",
    description: "Implement comprehensive user authentication with email/password and Google Sign-in, including sign-up, login, forgot password, and logout functionality.",
    icon: Shield,
    difficulty: "Beginner" as const,
    category: "Authentication",
    features: [
      "Email/Password Authentication",
      "Google Sign-in Integration", 
      "Password Reset Functionality",
      "Secure Session Management"
    ],
    gradientClass: "bg-gradient-primary",
    technologies: ["Firebase Auth", "React", "TypeScript"],
    estimatedTime: "4-6 hours"
  },
  {
    id: 2,
    title: "User Profile Management",
    description: "Create a comprehensive profile management system where users can view and update their personal information, including avatar uploads to cloud storage.",
    icon: User,
    difficulty: "Intermediate" as const,
    category: "User Management",
    features: [
      "Profile Information Updates",
      "Avatar Image Upload",
      "Data Persistence with Firestore",
      "Real-time Profile Sync"
    ],
    gradientClass: "bg-gradient-secondary",
    technologies: ["Firestore", "Firebase Storage", "React"],
    estimatedTime: "5-7 hours"
  },
  {
    id: 3,
    title: "Real-time Chat Application",
    description: "Build an interactive chat system with real-time messaging capabilities, supporting both private conversations and group chat rooms.",
    icon: MessageCircle,
    difficulty: "Advanced" as const,
    category: "Real-time Communication",
    features: [
      "Real-time Message Updates",
      "Group Chat Rooms",
      "Message History Persistence",
      "Online User Status"
    ],
    gradientClass: "bg-gradient-accent",
    technologies: ["Firestore", "Real-time Listeners", "React"],
    estimatedTime: "8-12 hours"
  },
  {
    id: 4,
    title: "To-Do List with Real-time Sync",
    description: "Develop a collaborative to-do list application with real-time synchronization across devices, supporting full CRUD operations.",
    icon: CheckSquare,
    difficulty: "Intermediate" as const,
    category: "Productivity",
    features: [
      "Real-time Task Synchronization",
      "CRUD Operations (Add/Edit/Delete)",
      "Task Status Management",
      "Persistent Login Sessions"
    ],
    gradientClass: "bg-gradient-primary",
    technologies: ["Firebase Realtime Database", "React", "TypeScript"],
    estimatedTime: "6-8 hours"
  },
  {
    id: 5,
    title: "File Upload & Download Hub",
    description: "Create a robust file management system with upload progress tracking, file organization, and secure download capabilities.",
    icon: Upload,
    difficulty: "Intermediate" as const,
    category: "File Management",
    features: [
      "File Upload with Progress Bar",
      "File Organization & Listing",
      "Secure Download Links",
      "File Type Validation"
    ],
    gradientClass: "bg-gradient-secondary",
    technologies: ["Firebase Storage", "React", "File APIs"],
    estimatedTime: "5-7 hours"
  },
  {
    id: 6,
    title: "Event Booking System",
    description: "Design a comprehensive event management platform with real-time slot availability, booking prevention, and dynamic capacity management.",
    icon: Calendar,
    difficulty: "Advanced" as const,
    category: "Event Management",
    features: [
      "Real-time Slot Availability",
      "Double Booking Prevention",
      "Dynamic Capacity Updates",
      "Booking History Tracking"
    ],
    gradientClass: "bg-gradient-accent",
    technologies: ["Firestore", "Transaction APIs", "React"],
    estimatedTime: "10-14 hours"
  },
  {
    id: 7,
    title: "Product Catalog with Favorites",
    description: "Build an e-commerce style product catalog with personalized favorites functionality and user preference management.",
    icon: Heart,
    difficulty: "Beginner" as const,
    category: "E-commerce",
    features: [
      "Product Catalog Display",
      "Favorites Management",
      "User Preference Storage",
      "Product Search & Filter"
    ],
    gradientClass: "bg-gradient-primary",
    technologies: ["Firestore", "React", "Search APIs"],
    estimatedTime: "4-6 hours"
  },
  {
    id: 8,
    title: "Feedback & Rating System",
    description: "Implement a comprehensive feedback platform with star ratings, comment moderation, and dynamic rating calculations.",
    icon: MessageSquare,
    difficulty: "Intermediate" as const,
    category: "User Engagement",
    features: [
      "5-Star Rating System",
      "Comment Submission",
      "Dynamic Average Calculation",
      "Feedback Moderation"
    ],
    gradientClass: "bg-gradient-secondary",
    technologies: ["Firestore", "React", "Analytics"],
    estimatedTime: "5-7 hours"
  },
  {
    id: 9,
    title: "Blog Platform with CRUD",
    description: "Create a full-featured blogging platform with content management, author controls, and public/private post visibility.",
    icon: FileText,
    difficulty: "Advanced" as const,
    category: "Content Management",
    features: [
      "Full CRUD Operations",
      "Author Permission Controls",
      "Public Post Listings",
      "Rich Text Editor Integration"
    ],
    gradientClass: "bg-gradient-accent",
    technologies: ["Firestore", "Authentication", "Rich Text"],
    estimatedTime: "12-16 hours"
  },
  {
    id: 10,
    title: "Real-time Notification System",
    description: "Develop an advanced notification system with real-time delivery, admin controls, and live UI updates for all connected users.",
    icon: Bell,
    difficulty: "Advanced" as const,
    category: "Real-time Features",
    features: [
      "Real-time Notification Delivery",
      "Admin Notification Panel",
      "Live UI Updates",
      "Notification History"
    ],
    gradientClass: "bg-gradient-primary",
    technologies: ["Firestore Listeners", "Admin SDK", "React"],
    estimatedTime: "8-12 hours"
  }
];