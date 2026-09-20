import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: 'include' },
  plugins: [emailOTPClient()],
});

export const { useSession, signOut } = authClient;
