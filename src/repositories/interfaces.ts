import {
  ActivityEvent,
  Book,
  BookCopy,
  LibrarySettings,
  Loan,
  Reader,
} from '../types/library';

/**
 * Contratos de repositório desacoplados da tecnologia de persistência.
 * Para migrar para Supabase (PostgreSQL), basta implementar estas interfaces
 * usando `@supabase/supabase-js` e alterar a exportação em `src/repositories/index.ts`.
 */

export interface IBookRepository {
  findAll(): Book[];
  findById(id: string): Book | null;
  save(book: Book): Book;
  saveAll(books: Book[]): void;
  delete(id: string): void;
}

export interface ICopyRepository {
  findAll(): BookCopy[];
  findById(id: string): BookCopy | null;
  findByBookId(bookId: string): BookCopy[];
  findByAssetCode(assetCode: string): BookCopy | null;
  save(copy: BookCopy): BookCopy;
  saveAll(copies: BookCopy[]): void;
  delete(id: string): void;
  deleteByBookId(bookId: string): void;
}

export interface IReaderRepository {
  findAll(): Reader[];
  findById(id: string): Reader | null;
  findByRegistration(registrationNumber: string): Reader | null;
  findByEmail(email: string): Reader | null;
  save(reader: Reader): Reader;
  saveAll(readers: Reader[]): void;
  delete(id: string): void;
}

export interface ILoanRepository {
  findAll(): Loan[];
  findById(id: string): Loan | null;
  findByReaderId(readerId: string): Loan[];
  findByBookId(bookId: string): Loan[];
  findByCopyId(copyId: string): Loan[];
  save(loan: Loan): Loan;
  saveAll(loans: Loan[]): void;
}

export interface IActivityRepository {
  findAll(): ActivityEvent[];
  add(event: ActivityEvent): ActivityEvent;
  saveAll(events: ActivityEvent[]): void;
}

export interface ISettingsRepository {
  get(): LibrarySettings;
  save(settings: LibrarySettings): LibrarySettings;
}
