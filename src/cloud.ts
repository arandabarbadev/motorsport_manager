import { FIREBASE_CONFIG } from './firebase-config';
import {
  SLOT_IDS,
  SlotId,
  careerKeyFor,
  getActiveSlot,
  rawSlotName,
  rosterKeyFor,
  setActiveSlot,
  setSlotName,
  slotName,
} from './slots';

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

interface CloudSlotEntry {
  career: string | null;
  roster: string | null;
  name: string | null;
}

// Spec 013: one document per user carries the THREE slots (and the
// active one). The pre-013 shape ({career, roster} only) is read as
// slot 'a' — same migration as the local one.
interface CloudSlotsDoc {
  slots?: Partial<Record<SlotId, Partial<CloudSlotEntry>>>;
  active?: string;
  // Legacy (pre-013) fields, only for reading old documents.
  career?: string | null;
  roster?: string | null;
}

// On login: if the cloud save differs from the local one, the cloud
// version wins and the page reloads with it (equal bundles are
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
    const data = snap.data() as CloudSlotsDoc;
    let changed = false;

    if (data.slots && typeof data.slots === 'object') {
      // Current format: the three slots + the active one.
      for (const slot of SLOT_IDS) {
        const entry = data.slots[slot] ?? {};
        const cloudCareer = entry.career ?? null;
        const cloudRoster = entry.roster ?? null;
        const cloudName = entry.name ?? null;
        if (cloudCareer !== localStorage.getItem(careerKeyFor(slot))) {
          changed = true;
          if (cloudCareer !== null) localStorage.setItem(careerKeyFor(slot), cloudCareer);
          else localStorage.removeItem(careerKeyFor(slot));
        }
        if (cloudRoster !== localStorage.getItem(rosterKeyFor(slot))) {
          changed = true;
          if (cloudRoster !== null) localStorage.setItem(rosterKeyFor(slot), cloudRoster);
          else localStorage.removeItem(rosterKeyFor(slot));
        }
        if (cloudName !== rawSlotName(slot)) {
          changed = true;
          if (cloudName !== null) setSlotName(slot, cloudName);
          else setSlotName(slot, ''); // back to the default name
        }
      }
      const active = data.active === 'b' || data.active === 'c' ? data.active : 'a';
      if (active !== getActiveSlot()) {
        changed = true;
        setActiveSlot(active as SlotId);
      }
    } else if ((data.career ?? null) !== null || (data.roster ?? null) !== null) {
      // Legacy single save: becomes slot 'a' (only if 'a' is empty,
      // never overwriting a slot that was already played).
      if (localStorage.getItem(careerKeyFor('a')) === null) {
        if (data.career) localStorage.setItem(careerKeyFor('a'), data.career);
        if (data.roster) localStorage.setItem(rosterKeyFor('a'), data.roster);
        changed = true;
      }
    }

    if (changed) location.reload();
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
    // Spec 013: push the three slots + the active one (one document
    // per user). Empty slots travel as nulls so deletes replicate.
    const slots = {} as Record<SlotId, CloudSlotEntry>;
    for (const slot of SLOT_IDS) {
      const career = localStorage.getItem(careerKeyFor(slot));
      slots[slot] = {
        career,
        roster: localStorage.getItem(rosterKeyFor(slot)),
        name: career !== null ? slotName(slot) : null,
      };
    }
    await fs.setDoc(fs.doc(db, 'f1manager', uid), { slots, active: getActiveSlot() });
  } catch {
    // ignore: the next save retries
  }
}
