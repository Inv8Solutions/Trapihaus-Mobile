import Constants from "expo-constants";
import { Platform } from "react-native";

// Web SDK (keeps web behavior working)
import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth as getWebAuth,
    onAuthStateChanged as onWebAuthStateChanged,
    signOut as signOutWeb,
} from "firebase/auth";
import { getFirestore as getWebFirestore } from "firebase/firestore";
import { getStorage as getWebStorage } from "firebase/storage";

// Your web app's Firebase configuration (only used for web builds)
const firebaseConfig = {
  apiKey: "AIzaSyCXSMkw0LqFvzZvQJ5ajrYOD9eAPlTS_uk",
  authDomain: "trapihaus.firebaseapp.com",
  projectId: "trapihaus",
  storageBucket: "trapihaus.firebasestorage.app",
  messagingSenderId: "536910313015",
  appId: "1:536910313015:web:f16ae0747eb92e302df1b2",
  measurementId: "G-J061VM5YLQ",
};

// Exports that work on both web and native
let app: any;
let auth: any;
let firestore: any;
let storage: any;
let isUsingNativeFirebase = false;

if (Platform.OS === "web") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getWebAuth(app);
  firestore = getWebFirestore(app);
  storage = getWebStorage(app);
} else {
  // Expo Go does not include RN Firebase native modules; use Web SDK fallback there.
  const isExpoGo = Constants.appOwnership === "expo";

  if (!isExpoGo) {
    try {
      // Load native modules lazily so Expo Go never attempts to import them.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const firebaseApp = require("@react-native-firebase/app").default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const authRN = require("@react-native-firebase/auth").default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const firestoreRN = require("@react-native-firebase/firestore").default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const storageRN = require("@react-native-firebase/storage").default;

      // RN Firebase provides native configuration via google-services files.
      app = firebaseApp.app();
      auth = authRN();
      firestore = firestoreRN();
      storage = storageRN();
      isUsingNativeFirebase = true;
    } catch {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getWebAuth(app);
      firestore = getWebFirestore(app);
      storage = getWebStorage(app);
    }
  } else {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getWebAuth(app);
    firestore = getWebFirestore(app);
    storage = getWebStorage(app);
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (isUsingNativeFirebase) {
    return auth.signInWithEmailAndPassword(email, password);
  }
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function sendPasswordReset(email: string) {
  if (isUsingNativeFirebase) {
    return auth.sendPasswordResetEmail(email);
  }
  const { sendPasswordResetEmail } = await import("firebase/auth");
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(
  listener: (signedIn: boolean) => void,
): () => void {
  if (isUsingNativeFirebase) {
    return auth.onAuthStateChanged((user: any) => listener(Boolean(user)));
  }
  return onWebAuthStateChanged(auth, (user) => listener(Boolean(user)));
}

export async function signOutCurrentUser() {
  if (isUsingNativeFirebase) {
    return auth.signOut();
  }
  return signOutWeb(auth);
}

export async function fetchListingsCollection() {
  if (isUsingNativeFirebase) {
    const snapshot = await firestore.collection("listings").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  const { collection, getDocs } = await import("firebase/firestore");
  const snapshot = await getDocs(collection(firestore, "listings"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function fetchListingById(id: string) {
  if (isUsingNativeFirebase) {
    const doc = await firestore.collection("listings").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  const { doc, getDoc } = await import("firebase/firestore");
  const snapshot = await getDoc(doc(firestore, "listings", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function fetchReviewsByListingId(listingId: string) {
  if (isUsingNativeFirebase) {
    const snapshot = await firestore
      .collection("reviews")
      .where("listingId", "==", listingId)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  const { collection, getDocs, query, where } =
    await import("firebase/firestore");
  const q = query(
    collection(firestore, "reviews"),
    where("listingId", "==", listingId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function fetchReservationsForUser(uid: string) {
  if (isUsingNativeFirebase) {
    const snapshot = await firestore
      .collection("reservations")
      .where("userId", "==", uid)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  const { collection, getDocs, query, where } =
    await import("firebase/firestore");
  const q = query(
    collection(firestore, "reservations"),
    where("userId", "==", uid),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export { app, auth, firebaseConfig, firestore, isUsingNativeFirebase, storage };

/*
Native setup notes:
- Place `google-services.json` in `android/app/` for Android.
- Place `GoogleService-Info.plist` in `ios/` (and add it to the Xcode project) for iOS.
- Run `npx pod-install` (or `cd ios && pod install`) after adding iOS files.
- If you use Expo managed workflow, run `expo prebuild` or use EAS Build to apply native modules.

Example quick commands:
```
npx pod-install ios
expo prebuild --platform android,ios   # if using Expo managed and you need native config
expo run:ios
expo run:android
// or use EAS Build: `eas build --platform ios` / `eas build --platform android`
```

If you want I can also:
- Edit `constants/firebase.ts` to keep a single canonical API (already done),
- Add CI/dev scripts for `npx pod-install` and prebuild, or
- Add docs / .env handling for web vs native API keys.
*/
