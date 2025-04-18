"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "../ui/Button/Button";
import React, { useCallback } from "react";

const SignInButton: React.FC = () => {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const handleSignIn = useCallback(async () => {
    try {
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
      <Button
        variant="outline"
        size="sm"
        className="pixel-button gap-1 p-1"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </div>
  ) : (
    <Button
      variant="outline"
      size="sm"
      className="pixel-button gap-1 p-1"
      onClick={handleSignIn}
    >
      Sign In
    </Button>
  );
};

export default SignInButton;
