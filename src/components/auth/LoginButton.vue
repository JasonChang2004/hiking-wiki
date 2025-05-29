<template>
  <template v-if="!user">
    <button @click="login" class="wiki-button">
      使用 Google 登入
    </button>
  </template>
  <template v-else>
    <!-- Display name from Firebase Auth user object or UserProfile -->
    <span v-if="userProfile?.displayName || user.displayName" class="hidden sm:inline text-gray-600 mr-2">
      {{ userProfile?.displayName || user.displayName }}
      <span v-if="userProfile?.isAdmin" class="text-xs text-blue-600 ml-1">(管理員)</span>
    </span>
    <button @click="logout" class="text-wiki-link hover:underline">
      登出
    </button>
  </template>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, provider, db } from '../../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth' // Firebase User type
import { doc, setDoc, getDoc } from 'firebase/firestore' // getDoc 추가
import type { UserProfile } from '../../types' // UserProfile type

const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null); // For storing isAdmin status

const login = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    if (result.user) {
      // Check if user document already exists
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let isAdmin = false;
      if (userDocSnap.exists()) {
        // User exists, retain their isAdmin status
        isAdmin = userDocSnap.data()?.isAdmin || false;
      }
      
      // Create or update user document in Firestore
      // Use Omit to exclude 'id' when creating data for setDoc
      const userProfileData: Omit<UserProfile, 'id'> = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        isAdmin: isAdmin, // Set isAdmin based on existing doc or default to false
      };
      await setDoc(userDocRef, userProfileData, { merge: true });
      console.log('✅ 使用者資訊已同步寫入 Firestore');
      userProfile.value = { id: result.user.uid, ...userProfileData };
    }
  } catch (err) {
    console.error('登入失敗', err)
    // Handle login error (e.g., display a message to the user)
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    userProfile.value = null; // Clear user profile on logout
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

onMounted(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, async (u) => { // Renamed to avoid conflict if we need another unsubscribe
    user.value = u
    if (u) {
      // Fetch user profile from Firestore to get isAdmin status
      const userDocRef = doc(db, 'users', u.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        userProfile.value = { id: u.uid, ...userDocSnap.data() } as UserProfile;
      } else {
        const newUserProfileData: Omit<UserProfile, 'id'> = {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            isAdmin: false,
        };
        await setDoc(userDocRef, newUserProfileData, { merge: true });
        userProfile.value = { id: u.uid, ...newUserProfileData };
      }
    } else {
      userProfile.value = null;
    }
  })
  
  onUnmounted(() => {
    unsubscribeAuth(); // Call the renamed unsubscribe function
  });
})
</script>
