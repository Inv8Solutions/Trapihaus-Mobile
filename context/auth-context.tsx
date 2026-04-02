import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { signOutCurrentUser, subscribeToAuthState } from "@/constants/firebase";

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
    let isFirstAuthEvent = true;
    const unsubscribe = subscribeToAuthState((signedIn) => {
      setIsSignedIn(signedIn);
      if (isFirstAuthEvent) {
        setIsReady(true);
        isFirstAuthEvent = false;
      }
    });

    return () => {
      unsubscribe();
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
        return true;
      },
      async signOut() {
        await signOutCurrentUser();
        setIsSignedIn(false);
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
