import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'auth_token';

export async function readToken(): Promise<string | null> {
  if (Platform.OS !== 'web') return SecureStore.getItemAsync(KEY);

  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function writeToken(token: string | null): Promise<void> {
  if (Platform.OS !== 'web') {
    await (token ? SecureStore.setItemAsync(KEY, token) : SecureStore.deleteItemAsync(KEY));
    return;
  }

  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    // Private windows may block storage, so the session simply lasts until the page closes
  }
}
