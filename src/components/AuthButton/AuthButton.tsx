"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import { PixelButton } from "../UI/PixelButton";

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
      <span className="font-pixel text-pixel-sm text-pixel-blue-dark">Signed in as {user?.primaryEmailAddress?.emailAddress}</span>
      <PixelButton 
        variant="beige" 
        size="sm"
        onClick={handleSignOut}
      >
        Sign Out
      </PixelButton>
    </div>
  ) : (
    <PixelButton 
      variant="primary" 
      size="sm"
      onClick={handleSignIn}
    >
      Sign In
    </PixelButton>
  );
}
