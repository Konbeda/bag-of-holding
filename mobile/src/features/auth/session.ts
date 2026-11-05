import { create } from 'zustand';

import { api, setAuthToken } from '@/lib/api';
import { readToken, writeToken } from '@/lib/token-storage';

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type SessionState = {
  user: User | null;
  ready: boolean;
};

export const useSession = create<SessionState>(() => ({ user: null, ready: false }));

export async function applySession(token: string, user: User) {
  setAuthToken(token);
  await writeToken(token);
  useSession.setState({ user, ready: true });
}

export async function clearSession() {
  setAuthToken(null);
  await writeToken(null);
  useSession.setState({ user: null, ready: true });
}

export async function restoreSession() {
  const token = await readToken();

  if (!token) {
    useSession.setState({ ready: true });
    return;
  }

  setAuthToken(token);

  try {
    const { data } = await api<{ data: User }>('/me');
    useSession.setState({ user: data, ready: true });
  } catch {
    // An expired token is already cleared by the 401 handler, and a network failure keeps it for next time
    setAuthToken(null);
    useSession.setState({ ready: true });
  }
}
