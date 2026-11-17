import { generateId, getNowISO } from '../lib/formatters';
import { repositories } from '../repositories';
import {
  Book,
  BookAvailability,
  BookCopy,
  BookWithAvailability,
  CopyCondition,
} from '../types/library';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  publisher: string;
  publicationYear: number;
  category: string;
  description: string;
  coverUrl?: string;
  initialCopiesCount?: number;
  initialAssetCodePrefix?: string;
  initialCondition?: CopyCondition;
}

export interface UpdateBookInput {
  title: string;
  author: string;
  isbn?: string;
  publisher: string;
  publicationYear: number;
  category: string;
  description: string;
  coverUrl?: string;
}

function computeAvailabilityFromCopies(copies: BookCopy[]): BookAvailability {
  let availableCopies = 0;
  let loanedCopies = 0;
  let maintenanceCopies = 0;
  let lostCopies = 0;

  for (const copy of copies) {
    if (copy.status === 'available') availableCopies++;
    else if (copy.status === 'loaned') loanedCopies++;
    else if (copy.status === 'maintenance') maintenanceCopies++;
    else if (copy.status === 'lost') lostCopies++;
  }

  return {
    totalCopies: copies.length,
    availableCopies,
    loanedCopies,
    maintenanceCopies,
    lostCopies,
  };
}

export const bookService = {
  listBooks(): BookWithAvailability[] {
    const books = repositories.books.findAll();
    const allCopies = repositories.copies.findAll();

    return books.map((book) => {
      const bookCopies = allCopies.filter((c) => c.bookId === book.id);
      return {
        ...book,
        availability: computeAvailabilityFromCopies(bookCopies),
      };
    });
  },

  getBookById(bookId: string): BookWithAvailability | null {
    const book = repositories.books.findById(bookId);
    if (!book) return null;
    const copies = repositories.copies.findByBookId(bookId);
    return {
      ...book,
      availability: computeAvailabilityFromCopies(copies),
    };
  },

  getCategories(): string[] {
    const categories = new Set(repositories.books.findAll().map((b) => b.category));
    return Array.from(categories).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  },

  createBook(input: CreateBookInput, actorName = 'Bibliotecário'): BookWithAvailability {
    if (!input.title.trim()) throw new Error('O título do livro é obrigatório.');
    if (!input.author.trim()) throw new Error('O autor do livro é obrigatório.');
    if (!input.publisher.trim()) throw new Error('A editora é obrigatória.');
    if (!input.category.trim()) throw new Error('A categoria é obrigatória.');
    if (
      !Number.isFinite(input.publicationYear) ||
      input.publicationYear < 1400 ||
      input.publicationYear > new Date().getFullYear() + 1
    ) {
      throw new Error('Informe um ano de publicação válido.');
    }

    const now = getNowISO();
    const book: Book = {
      id: generateId('book'),
      title: input.title.trim(),
      author: input.author.trim(),
      isbn: input.isbn?.trim() || undefined,
      publisher: input.publisher.trim(),
      publicationYear: Number(input.publicationYear),
      category: input.category.trim(),
      description: input.description.trim() || 'Sem descrição cadastrada.',
      coverUrl: input.coverUrl?.trim() || undefined,
      accentColor: '#14532D',
      createdAt: now,
      updatedAt: now,
    };

    repositories.books.save(book);

    const copiesToCreate = Math.max(0, Math.min(30, input.initialCopiesCount ?? 1));
    const existingCopies = repositories.copies.findAll();
    let sequence = existingCopies.length + 101;

    for (let i = 0; i < copiesToCreate; i++) {
      let assetCode = input.initialAssetCodePrefix?.trim()
        ? `${input.initialAssetCodePrefix.trim()}-${String(i + 1).padStart(2, '0')}`
        : `PAT-${String(sequence).padStart(5, '0')}`;

      while (repositories.copies.findByAssetCode(assetCode)) {
        sequence++;
        assetCode = `PAT-${String(sequence).padStart(5, '0')}`;
      }
      sequence++;

      repositories.copies.save({
        id: generateId('copy'),
        bookId: book.id,
        assetCode,
        condition: input.initialCondition ?? 'excellent',
        status: 'available',
        createdAt: now,
        updatedAt: now,
      });
    }

    repositories.activities.add({
      id: generateId('act'),
      type: 'book_created',
      title: 'Livro cadastrado no acervo',
      description: `"${book.title}" adicionado com ${copiesToCreate} exemplar(es).`,
      actorName,
      createdAt: now,
    });

    return this.getBookById(book.id)!;
  },

  updateBook(bookId: string, input: UpdateBookInput): BookWithAvailability {
    const existing = repositories.books.findById(bookId);
    if (!existing) {
      throw new Error('Livro não encontrado.');
    }
    if (!input.title.trim()) throw new Error('O título do livro é obrigatório.');
    if (!input.author.trim()) throw new Error('O autor do livro é obrigatório.');
    if (!input.publisher.trim()) throw new Error('A editora é obrigatória.');
    if (!input.category.trim()) throw new Error('A categoria é obrigatória.');
    if (
      !Number.isFinite(input.publicationYear) ||
      input.publicationYear < 1400 ||
      input.publicationYear > new Date().getFullYear() + 1
    ) {
      throw new Error('Informe um ano de publicação válido.');
    }

    const updated: Book = {
      ...existing,
      title: input.title.trim(),
      author: input.author.trim(),
      isbn: input.isbn?.trim() || undefined,
      publisher: input.publisher.trim(),
      publicationYear: Number(input.publicationYear),
      category: input.category.trim(),
      description: input.description.trim() || 'Sem descrição cadastrada.',
      coverUrl: input.coverUrl?.trim() || undefined,
      updatedAt: getNowISO(),
    };

    repositories.books.save(updated);
    return this.getBookById(bookId)!;
  },

  deleteBook(bookId: string): void {
    const existing = repositories.books.findById(bookId);
    if (!existing) {
      throw new Error('Livro não encontrado.');
    }

    const relatedLoans = repositories.loans.findByBookId(bookId);
    const hasActiveLoans = relatedLoans.some((l) => l.status === 'active');
    if (hasActiveLoans) {
      throw new Error(
        'Não é possível excluir este livro porque existem empréstimos ativos vinculados a ele.'
      );
    }

    const hasPendingOrApproved = relatedLoans.some(
      (l) => l.status === 'pending' || l.status === 'approved'
    );
    if (hasPendingOrApproved) {
      throw new Error(
        'Não é possível excluir este livro enquanto houver solicitações pendentes ou aprovadas aguardando retirada.'
      );
    }

    repositories.copies.deleteByBookId(bookId);
    repositories.books.delete(bookId);
  },
};
