import { STORAGE_KEYS, StorageDriver } from '../lib/storage';
import { getNowISO } from '../lib/formatters';
import {
  ActivityEvent,
  Book,
  BookCopy,
  LibrarySettings,
  Loan,
  Reader,
} from '../types/library';
import {
  IActivityRepository,
  IBookRepository,
  ICopyRepository,
  ILoanRepository,
  IReaderRepository,
  ISettingsRepository,
} from './interfaces';

export class LocalBookRepository implements IBookRepository {
  constructor(private readonly driver: StorageDriver) {}

  findAll(): Book[] {
    return this.driver.getItem<Book[]>(STORAGE_KEYS.BOOKS) ?? [];
  }

  findById(id: string): Book | null {
    return this.findAll().find((b) => b.id === id) ?? null;
  }

  save(book: Book): Book {
    const items = this.findAll();
    const idx = items.findIndex((b) => b.id === book.id);
    if (idx >= 0) {
      items[idx] = book;
    } else {
      items.unshift(book);
    }
    this.driver.setItem(STORAGE_KEYS.BOOKS, items);
    return book;
  }

  saveAll(books: Book[]): void {
    this.driver.setItem(STORAGE_KEYS.BOOKS, books);
  }

  delete(id: string): void {
    const items = this.findAll().filter((b) => b.id !== id);
    this.driver.setItem(STORAGE_KEYS.BOOKS, items);
  }
}

export class LocalCopyRepository implements ICopyRepository {
  constructor(private readonly driver: StorageDriver) {}

  findAll(): BookCopy[] {
    return this.driver.getItem<BookCopy[]>(STORAGE_KEYS.COPIES) ?? [];
  }

  findById(id: string): BookCopy | null {
    return this.findAll().find((c) => c.id === id) ?? null;
  }

  findByBookId(bookId: string): BookCopy[] {
    return this.findAll().filter((c) => c.bookId === bookId);
  }

  findByAssetCode(assetCode: string): BookCopy | null {
    const normalized = assetCode.trim().toLowerCase();
    return (
      this.findAll().find((c) => c.assetCode.trim().toLowerCase() === normalized) ?? null
    );
  }

  save(copy: BookCopy): BookCopy {
    const items = this.findAll();
    const idx = items.findIndex((c) => c.id === copy.id);
    if (idx >= 0) {
      items[idx] = copy;
    } else {
      items.push(copy);
    }
    this.driver.setItem(STORAGE_KEYS.COPIES, items);
    return copy;
  }

  saveAll(copies: BookCopy[]): void {
    this.driver.setItem(STORAGE_KEYS.COPIES, copies);
  }

  delete(id: string): void {
    const items = this.findAll().filter((c) => c.id !== id);
    this.driver.setItem(STORAGE_KEYS.COPIES, items);
  }

  deleteByBookId(bookId: string): void {
    const items = this.findAll().filter((c) => c.bookId !== bookId);
    this.driver.setItem(STORAGE_KEYS.COPIES, items);
  }
}

export class LocalReaderRepository implements IReaderRepository {
  constructor(private readonly driver: StorageDriver) {}

  findAll(): Reader[] {
    return this.driver.getItem<Reader[]>(STORAGE_KEYS.READERS) ?? [];
  }

  findById(id: string): Reader | null {
    return this.findAll().find((r) => r.id === id) ?? null;
  }

  findByRegistration(registrationNumber: string): Reader | null {
    const normalized = registrationNumber.trim().toLowerCase();
    return (
      this.findAll().find(
        (r) => r.registrationNumber.trim().toLowerCase() === normalized
      ) ?? null
    );
  }

  findByEmail(email: string): Reader | null {
    const normalized = email.trim().toLowerCase();
    return (
      this.findAll().find((r) => r.email.trim().toLowerCase() === normalized) ?? null
    );
  }

  save(reader: Reader): Reader {
    const items = this.findAll();
    const idx = items.findIndex((r) => r.id === reader.id);
    if (idx >= 0) {
      items[idx] = reader;
    } else {
      items.unshift(reader);
    }
    this.driver.setItem(STORAGE_KEYS.READERS, items);
    return reader;
  }

  saveAll(readers: Reader[]): void {
    this.driver.setItem(STORAGE_KEYS.READERS, readers);
  }

  delete(id: string): void {
    const items = this.findAll().filter((r) => r.id !== id);
    this.driver.setItem(STORAGE_KEYS.READERS, items);
  }
}

export class LocalLoanRepository implements ILoanRepository {
  constructor(private readonly driver: StorageDriver) {}

  findAll(): Loan[] {
    return this.driver.getItem<Loan[]>(STORAGE_KEYS.LOANS) ?? [];
  }

  findById(id: string): Loan | null {
    return this.findAll().find((l) => l.id === id) ?? null;
  }

  findByReaderId(readerId: string): Loan[] {
    return this.findAll().filter((l) => l.readerId === readerId);
  }

  findByBookId(bookId: string): Loan[] {
    return this.findAll().filter((l) => l.bookId === bookId);
  }

  findByCopyId(copyId: string): Loan[] {
    return this.findAll().filter((l) => l.copyId === copyId);
  }

  save(loan: Loan): Loan {
    const items = this.findAll();
    const idx = items.findIndex((l) => l.id === loan.id);
    if (idx >= 0) {
      items[idx] = loan;
    } else {
      items.unshift(loan);
    }
    this.driver.setItem(STORAGE_KEYS.LOANS, items);
    return loan;
  }

  saveAll(loans: Loan[]): void {
    this.driver.setItem(STORAGE_KEYS.LOANS, loans);
  }
}

export class LocalActivityRepository implements IActivityRepository {
  constructor(private readonly driver: StorageDriver) {}

  findAll(): ActivityEvent[] {
    return this.driver.getItem<ActivityEvent[]>(STORAGE_KEYS.ACTIVITIES) ?? [];
  }

  add(event: ActivityEvent): ActivityEvent {
    const items = this.findAll();
    items.unshift(event);
    const trimmed = items.slice(0, 60);
    this.driver.setItem(STORAGE_KEYS.ACTIVITIES, trimmed);
    return event;
  }

  saveAll(events: ActivityEvent[]): void {
    this.driver.setItem(STORAGE_KEYS.ACTIVITIES, events);
  }
}

export const DEFAULT_LIBRARY_SETTINGS: LibrarySettings = {
  defaultLoanDays: 7,
  schoolName: 'Colégio Estadual Machado de Assis',
  updatedAt: getNowISO(),
};

export class LocalSettingsRepository implements ISettingsRepository {
  constructor(private readonly driver: StorageDriver) {}

  get(): LibrarySettings {
    return (
      this.driver.getItem<LibrarySettings>(STORAGE_KEYS.SETTINGS) ??
      DEFAULT_LIBRARY_SETTINGS
    );
  }

  save(settings: LibrarySettings): LibrarySettings {
    this.driver.setItem(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  }
}
