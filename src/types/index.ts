// src/types/index.ts
import type { Timestamp } from 'firebase/firestore';

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  uid: string;
  displayName: string | null; // displayName can be null from Firebase Auth
  createdAt: Timestamp | Date; // Can be Firestore Timestamp or JS Date
  updatedAt?: Timestamp | Date;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  references?: string;
  reviewComment?: string;
  reviewedAt?: Timestamp | Date;
  // For potential future enhancements
  summary?: string; 
  imageUrl?: string; 
}

export interface UserProfile { // Renamed from User to avoid conflict with Firebase User type
  id: string; // UID from Auth, doc ID in Firestore 'users' collection
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
}

export interface NotificationMessage {
  id: string;
  uid: string;        // Receiver UID
  message: string;
  type: 'article_published' | 'article_approved' | 'article_rejected' | 'comment' | 'mention' | 'system' | 'status' | string;
  read: boolean;
  createdAt: Timestamp | Date;
  articleId?: string;
}

export interface CategoryItem {
  name: string;
  label: string;
  icon: string;
  count: number;
}
