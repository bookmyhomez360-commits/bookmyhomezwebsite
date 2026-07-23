import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';
import { Property, User } from './types';
import { INITIAL_PROPERTIES, REGISTERED_USERS } from './data/initialProperties';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using databaseId if provided
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

const PROPERTIES_COLLECTION = 'properties';
const USERS_COLLECTION = 'users';

/**
 * Seed initial properties into Firestore if collection is empty
 */
export async function seedInitialPropertiesIfEmpty() {
  try {
    const snap = await getDocs(collection(db, PROPERTIES_COLLECTION));
    if (snap.empty) {
      for (const prop of INITIAL_PROPERTIES) {
        await setDoc(doc(db, PROPERTIES_COLLECTION, String(prop.id)), prop);
      }
    }
  } catch (err) {
    console.error('Error checking/seeding properties in Firestore:', err);
  }
}

/**
 * Real-time listener for properties collection
 */
export function subscribeToProperties(callback: (properties: Property[]) => void) {
  const q = query(collection(db, PROPERTIES_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Property;
        items.push({
          ...data,
          id: typeof data.id === 'number' ? data.id : Number(docSnap.id) || Date.now(),
        });
      });
      // Sort newest first by id
      items.sort((a, b) => (b.id || 0) - (a.id || 0));
      callback(items);
    },
    (error) => {
      console.error('Error listening to properties snapshot:', error);
    }
  );
}

/**
 * Save a new property or update existing property in Firestore
 */
export async function savePropertyToFirestore(property: Property) {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, String(property.id));
    await setDoc(
      docRef,
      {
        ...property,
        createdAt: property.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving property to Firestore:', err);
    throw err;
  }
}

/**
 * Update property status or partial fields in Firestore
 */
export async function updatePropertyInFirestore(id: number, partialData: Partial<Property>) {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, String(id));
    await updateDoc(docRef, partialData as Record<string, any>);
    return true;
  } catch (err) {
    console.error('Error updating property in Firestore:', err);
    throw err;
  }
}

/**
 * Delete property from Firestore
 */
export async function deletePropertyFromFirestore(id: number) {
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, String(id));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting property from Firestore:', err);
    throw err;
  }
}

/**
 * Seed initial users into Firestore
 */
export async function seedInitialUsersIfEmpty() {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    if (snap.empty) {
      for (const u of REGISTERED_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

/**
 * Save user registration to Firestore
 */
export async function saveUserToFirestore(user: User & { password?: string }) {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    throw err;
  }
}
