import { auth, firestore, isUsingNativeFirebase } from "@/constants/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type TripSelection = {
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number;
  location?: string | null;
};

type TripContextValue = {
  selection: TripSelection;
  setSelection: (next: TripSelection) => Promise<void>;
};

const STORAGE_KEY = "@trapihaus:tripSelection";

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelectionState] = useState<TripSelection>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setSelectionState(parsed ?? {});
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const setSelection = async (next: TripSelection) => {
    setSelectionState(next ?? {});
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next ?? {}));
    } catch (err) {
      // ignore
    }

    try {
      const uid = (auth && (auth.currentUser as any)?.uid) || null;
      if (!uid) return;

      if (isUsingNativeFirebase) {
        // Native RN Firebase
        await firestore
          .collection("userSelections")
          .doc(uid)
          .set(next ?? {}, { merge: true });
      } else {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(firestore, "userSelections", uid), next ?? {}, {
          merge: true,
        });
      }
    } catch (err) {
      // ignore write error
    }
  };

  return (
    <TripContext.Provider value={{ selection, setSelection }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
