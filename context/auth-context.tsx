import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const STORAGE_KEY = "@trapihaus/isSignedIn";

type AuthContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
  signInWithAdmin: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        setIsSignedIn(stored === "1");
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isSignedIn,
      async signInWithAdmin(username: string, password: string) {
        const ok = username.trim() === "admin" && password === "admin";
        if (!ok) return false;
        setIsSignedIn(true);
        await AsyncStorage.setItem(STORAGE_KEY, "1");
        return true;
      },
      async signOut() {
        setIsSignedIn(false);
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isReady, isSignedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
