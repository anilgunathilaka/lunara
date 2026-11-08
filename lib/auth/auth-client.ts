import { createAuthClient } from 'better-auth/react';

// No baseURL: the auth API is always same-origin (/api/auth), and Better
// Auth then uses the page's own origin. This avoids a build-time
// NEXT_PUBLIC_ URL that would have to match each deployment.
export const authClient = createAuthClient();

export const { signIn, signOut, signUp, useSession } = authClient;
