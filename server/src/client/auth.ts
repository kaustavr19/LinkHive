import { account } from './appwrite.js';
import { ID, OAuthProvider } from 'appwrite';

export interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await account.get();
    return user as unknown as User;
  } catch {
    return null;
  }
}

export async function register(email: string, password: string, name: string): Promise<User> {
  const user = await account.create(ID.unique(), email, password, name);
  await login(email, password);
  return user as unknown as User;
}

export async function login(email: string, password: string): Promise<void> {
  await account.createEmailPasswordSession(email, password);
}

export function loginWithGoogle(): void {
  account.createOAuth2Session(
    OAuthProvider.Google,
    `${window.location.origin}/`,
    `${window.location.origin}/login`,
  );
}

export function loginWithGithub(): void {
  account.createOAuth2Session(
    OAuthProvider.Github,
    `${window.location.origin}/`,
    `${window.location.origin}/login`,
  );
}

export async function logout(): Promise<void> {
  await account.deleteSession('current');
}

export async function logoutAll(): Promise<void> {
  await account.deleteSessions();
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  await account.createRecovery(email, `${window.location.origin}/reset-password`);
}

export async function confirmPasswordRecovery(
  userId: string,
  secret: string,
  newPassword: string,
): Promise<void> {
  await account.updateRecovery(userId, secret, newPassword);
}

export async function updateName(name: string): Promise<void> {
  await account.updateName(name);
}

export async function updatePassword(newPassword: string, oldPassword: string): Promise<void> {
  await account.updatePassword(newPassword, oldPassword);
}

export async function deleteAccount(): Promise<void> {
  await account.updateStatus();
}
