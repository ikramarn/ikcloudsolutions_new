'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { safeStorage } from '@/lib/storage';

export const CONSENT_STORAGE_KEY = 'ik_consent_v1';

interface ConsentRecord {
  version: 1;
  analytics: boolean;
  decidedAt: string;
}

interface ConsentContextValue {
  /** The stored (or in-memory) choice; null until the visitor decides. */
  record: ConsentRecord | null;
  /** True once the client has read its storage; false during SSR and hydration. */
  ready: boolean;
  bannerVisible: boolean;
  accept: () => void;
  reject: () => void;
  reopen: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function parseRecord(raw: string): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === 1 &&
      'analytics' in value &&
      typeof value.analytics === 'boolean' &&
      'decidedAt' in value &&
      typeof value.decidedAt === 'string'
    ) {
      return { version: 1, analytics: value.analytics, decidedAt: value.decidedAt };
    }
  } catch {
    // A corrupt record counts as no decision.
  }
  return null;
}

/**
 * A per-provider store: reads safeStorage and keeps an in-memory copy for when storage is
 * blocked, so the choice is honoured for the session even if it cannot be persisted.
 * Snapshots are strings so they stay referentially stable between reads.
 */
function createConsentStore() {
  let memory = '';
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      window.addEventListener('storage', listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
      };
    },
    getSnapshot: (): string => safeStorage.get(CONSENT_STORAGE_KEY) ?? memory,
    // Null on the server and during hydration: nothing is known about the visitor yet.
    getServerSnapshot: (): string | null => null,
    save(analytics: boolean) {
      const record: ConsentRecord = { version: 1, analytics, decidedAt: new Date().toISOString() };
      const raw = JSON.stringify(record);
      memory = raw;
      safeStorage.set(CONSENT_STORAGE_KEY, raw);
      notify();
    },
  };
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createConsentStore);
  const snapshot = useSyncExternalStore<string | null>(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [reopened, setReopened] = useState(false);

  const record = useMemo(() => (snapshot === null ? null : parseRecord(snapshot)), [snapshot]);
  const ready = snapshot !== null;

  const decide = useCallback(
    (analytics: boolean) => {
      store.save(analytics);
      setReopened(false);
    },
    [store],
  );
  const accept = useCallback(() => decide(true), [decide]);
  const reject = useCallback(() => decide(false), [decide]);
  const reopen = useCallback(() => setReopened(true), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      record,
      ready,
      bannerVisible: ready && (record === null || reopened),
      accept,
      reject,
      reopen,
    }),
    [record, ready, reopened, accept, reject, reopen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used inside ConsentProvider.');
  return context;
}
