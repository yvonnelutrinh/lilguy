"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback } from "react";

export default function AuthButton() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const handleSignIn = useCallback(async () => {
    try {
      // Redirect to Clerk hosted sign-in page
      window.location.href = "/sign-in";
    } catch (err) {
      console.error("Error signing in:", err);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }, [signOut]);

  return isSignedIn ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Signed in as {user?.primaryEmailAddress?.emailAddress}</span>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Sign In
    </button>
  );
}
