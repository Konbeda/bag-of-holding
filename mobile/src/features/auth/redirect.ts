import type { Href } from 'expo-router';

// Only same-app paths are accepted, so a crafted link cannot send people to another site
export function safeRedirect(target: string | undefined): Href {
  return target && target.startsWith('/') && !target.startsWith('//') ? (target as Href) : '/';
}
