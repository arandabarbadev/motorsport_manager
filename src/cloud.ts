import { FIREBASE_CONFIG } from './firebase-config';
import { CAREER_STORAGE_KEY, ROSTER_STORAGE_KEY } from './storage-keys';

// ============================================================
// CLOUD SYNC (Firebase): email/password login + career/roster
// synced to Firestore, like Rafa's other apps. While Firebase is
// not configured (empty apiKey) everything is a no-op and the
// game stays in LOCAL mode. Firebase loads lazily so it does not
// weigh down the first paint.
// ============================================================

export const firebaseConfigured: boolean = FIREBASE_CONFIG.apiKey !== '';

let auth: import('firebase/auth').Auth | null = null;
let db: import('firebase/firestore').Firestore | null = null;
let authMod: typeof import('firebase/auth') | null = null;
let currentUid: string | null = null;
let started = false;

export const getUid = (): string | null => currentUid;

export async function initCloud(): Promise<void> {
  if (!firebaseConfigured || started) return;
  started = true;
  const [appMod, authModule, fsMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  const app = appMod.initializeApp(FIREBASE_CONFIG);
  authMod = authModule;
  auth = authModule.getAuth(app);
  db = fsMod.getFirestore(app);
}

// Calls back with the session on every change (starts with the
// restored session, or null if none).
export function watchAuth(onChange: (uid: string | null) => void): () => void {
  if (!authMod || !auth) {
    onChange(null);
    return () => undefined;
  }
  return authMod.onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    onChange(currentUid);
  });
}

export async function login(email: string, password: string): Promise<void> {
  if (!authMod || !auth) throw new Error('Firebase sin configurar');
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  currentUid = cred.user.uid;
  await pullCloudState(currentUid);
}

// One-click Google sign-in (provider must be enabled in the console).
export async function loginWithGoogle(): Promise<void> {
  if (!authMod || !auth) throw new Error('Firebase sin configurar');
  const provider = new authMod.GoogleAuthProvider();
  const cred = await authMod.signInWithPopup(auth, provider);
  currentUid = cred.user.uid;
  await pullCloudState(currentUid);
}

export async function register(email: string, password: string): Promise<void> {
  if (!authMod || !auth) throw new Error('Firebase sin configurar');
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  currentUid = cred.user.uid;
  await pushCloudState(currentUid);
}

export async function logout(): Promise<void> {
  if (!authMod || !auth) return;
  await authMod.signOut(auth);
  currentUid = null;
}

interface CloudState {
  career: string | null;
  roster: string | null;
}

// On login: if the cloud save differs from the local one, the cloud
// version wins and the page reloads with it (equal strings are
// skipped, so there is no reload loop). Empty cloud -> push local.
async function pullCloudState(uid: string): Promise<void> {
  if (!db) return;
  try {
    const fs = await import('firebase/firestore');
    const snap = await fs.getDoc(fs.doc(db, 'f1manager', uid));
    if (!snap.exists()) {
      await pushCloudState(uid);
      return;
    }
    const data = snap.data() as Partial<CloudState>;
    const sameCareer = data.career === localStorage.getItem(CAREER_STORAGE_KEY);
    const sameRoster = data.roster === localStorage.getItem(ROSTER_STORAGE_KEY);
    if (sameCareer && sameRoster) return;
    if (data.career) localStorage.setItem(CAREER_STORAGE_KEY, data.career);
    if (data.roster) localStorage.setItem(ROSTER_STORAGE_KEY, data.roster);
    location.reload();
  } catch {
    // offline or permissions: keep playing locally
  }
}

let syncTimer: number | undefined;

// Write-through: debounced push of the local saves to the cloud.
// Called by the screens after every save.
export function scheduleCloudSync(): void {
  if (!db || !currentUid) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    void pushCloudState(currentUid!);
  }, 800);
}

async function pushCloudState(uid: string): Promise<void> {
  if (!db) return;
  try {
    const fs = await import('firebase/firestore');
    const state: CloudState = {
      career: localStorage.getItem(CAREER_STORAGE_KEY),
      roster: localStorage.getItem(ROSTER_STORAGE_KEY),
    };
    await fs.setDoc(fs.doc(db, 'f1manager', uid), state);
  } catch {
    // ignore: the next save retries
  }
}
