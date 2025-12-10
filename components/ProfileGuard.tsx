'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseUserProvider';
import { useProfileCompletionPrompt } from '@/hooks/useProfileCompletionPrompt';
import { useUserProfile } from '@/hooks/useProfile';

const PUBLIC_PATHS = new Set(['/login', '/signup', '/auth/callback', '/']);
const PROFILE_SETUP_PATHS = new Set(['/complete-profile', '/profile/edit']);

export default function ProfileGuard({ children }: { readonly children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const pathname = usePathname();
  const {
    isPromptOpen,
    profileCompletionModal,
    showProfileCompletionPrompt,
    hideProfileCompletionPrompt,
  } = useProfileCompletionPrompt({ closeRedirect: '/' });

  useEffect(() => {
    // Wait for all loading to finish
    if (authLoading || profileLoading) {
      return;
    }

    // If not logged in, we don't need to check profile (AppLayout/Middleware handles auth protection)
    if (!user) {
      return;
    }

    // Check if current path is public or part of the setup flow
    const isPublicPath = PUBLIC_PATHS.has(pathname);
    const isSetupPath = PROFILE_SETUP_PATHS.has(pathname);
    const isProtectedPath = !isPublicPath && !isSetupPath;

    if (!isProtectedPath) {
      hideProfileCompletionPrompt();
      return;
    }

    if (profile?.first_name) {
      hideProfileCompletionPrompt();
      return;
    }

    showProfileCompletionPrompt();
  }, [
    user,
    profile,
    authLoading,
    profileLoading,
    pathname,
    hideProfileCompletionPrompt,
    showProfileCompletionPrompt,
  ]);

  // We render children while checking to avoid flash of white content
  // The useEffect will handle the redirect if needed
  if (isPromptOpen) {
    return profileCompletionModal;
  }

  return <>{children}</>;
}
