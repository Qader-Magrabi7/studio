import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import type { SavedLocation } from "@/lib/types";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const LOCATIONS_COLLECTION = "saved_locations";

export async function getSavedLocations(): Promise<SavedLocation[]> {
    if (!firebaseConfig.projectId) {
        console.warn("Firebase projectId is not set. Returning empty array for saved locations.");
        return [];
    }
    try {
        const locationsCollection = collection(db, LOCATIONS_COLLECTION);
        const q = query(locationsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavedLocation));
    } catch (error) {
        console.error("Error fetching saved locations:", error);
        // Return empty array on error to prevent app crash
        return [];
    }
}

export async function addSavedLocation(name: string, summary: string): Promise<SavedLocation> {
    if (!firebaseConfig.projectId) {
        throw new Error("Firebase projectId is not set. Cannot save to Firestore.");
    }
    const newLocation = {
        name,
        summary,
        createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, LOCATIONS_COLLECTION), newLocation);
    return {
        id: docRef.id,
        ...newLocation
    };
}

export { db };
