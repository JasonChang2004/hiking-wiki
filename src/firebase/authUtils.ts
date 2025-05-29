import { db } from './index'
import { doc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '../types'; // Import UserProfile type

export const checkIsAdmin = async (uid: string): Promise<boolean> => {
  if (!uid) return false; // Add a check for uid
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserProfile; // Cast to UserProfile
      return userData.isAdmin === true;
    }
    return false; // User document doesn't exist
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false; // Return false on error
  }
};
