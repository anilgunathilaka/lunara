import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

// No baseURL: the auth API is always same-origin (/api/auth), and Better
// Auth then uses the page's own origin. This avoids a build-time
// NEXT_PUBLIC_ URL that would have to match each deployment.
//
// Passwordless sign-in (lib/auth/auth.ts):
//   await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
//   await authClient.signIn.emailOtp({ email, otp });
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;
