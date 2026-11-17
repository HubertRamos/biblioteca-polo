/**
 * Abstração da camada de persistência.
 *
 * Arquitetura preparada para migração futura para Supabase (PostgreSQL):
 * Os repositórios consomem esta interface ou podem ser substituídos por
 * implementações Supabase mantendo exatamente os mesmos contratos de serviço.
 */
export interface StorageDriver {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clearByPrefix(prefix: string): void;
}

export const STORAGE_PREFIX = 'bed_v1_';

export const STORAGE_KEYS = {
  BOOKS: `${STORAGE_PREFIX}books`,
  COPIES: `${STORAGE_PREFIX}copies`,
  READERS: `${STORAGE_PREFIX}readers`,
  LOANS: `${STORAGE_PREFIX}loans`,
  ACTIVITIES: `${STORAGE_PREFIX}activities`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  SESSION: `${STORAGE_PREFIX}session_user_id`,
  SEEDED: `${STORAGE_PREFIX}seeded`,
} as const;

class LocalStorageDriver implements StorageDriver {
  private memoryFallback = new Map<string, string>();

  private isStorageAvailable(): boolean {
    try {
      const testKey = '__bed_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const raw = this.isStorageAvailable()
        ? window.localStorage.getItem(key)
        : this.memoryFallback.get(key) ?? null;

      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    if (this.isStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    } else {
      this.memoryFallback.set(key, serialized);
    }
  }

  removeItem(key: string): void {
    if (this.isStorageAvailable()) {
      window.localStorage.removeItem(key);
    } else {
      this.memoryFallback.delete(key);
    }
  }

  clearByPrefix(prefix: string): void {
    if (this.isStorageAvailable()) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } else {
      Array.from(this.memoryFallback.keys()).forEach((k) => {
        if (k.startsWith(prefix)) {
          this.memoryFallback.delete(k);
        }
      });
    }
  }
}

export const storageDriver: StorageDriver = new LocalStorageDriver();
