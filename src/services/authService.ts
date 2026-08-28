import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";
import { auth, database } from "./firebase";
import type { UserProfile, UserRole } from "../types";

export const registerUser = async (email: string, password: string, name: string): Promise<UserProfile> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const newUserProfile: UserProfile = {
    uid: user.uid,
    name: name || email.split("@")[0],
    email: user.email || email,
    role: "user", // Default role
    createdAt: Date.now(),
    status: "active",
    flashCount: 0
  };

  await set(ref(database, `users/${user.uid}`), newUserProfile);
  return newUserProfile;
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    // If user exists in Auth but not in RTDB, auto-create basic profile
    const newProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split("@")[0] || "User",
      email: user.email || email,
      role: "user",
      createdAt: Date.now(),
      status: "active",
      flashCount: 0
    };
    await set(ref(database, `users/${user.uid}`), newProfile);
    return newProfile;
  }

  if (profile.status === 'disabled') {
    await signOut(auth);
    throw new Error("Your account has been disabled by an administrator.");
  }

  return profile;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const snapshot = await get(ref(database, 'users'));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as UserProfile[];
  }
  return [];
};

export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  await update(ref(database, `users/${uid}`), { role });
};

export const updateUserStatus = async (uid: string, status: 'active' | 'disabled'): Promise<void> => {
  await update(ref(database, `users/${uid}`), { status });
};
