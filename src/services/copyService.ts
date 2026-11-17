import { generateId, getNowISO } from '../lib/formatters';
import { repositories } from '../repositories';
import { BookCopy, CopyCondition, CopyStatus } from '../types/library';

export interface CreateCopyInput {
  bookId: string;
  assetCode: string;
  condition: CopyCondition;
  notes?: string;
}

export interface UpdateCopyInput {
  assetCode: string;
  condition: CopyCondition;
  status: CopyStatus;
  notes?: string;
}

export const copyService = {
  listByBook(bookId: string): BookCopy[] {
    return repositories.copies
      .findByBookId(bookId)
      .sort((a, b) => a.assetCode.localeCompare(b.assetCode, 'pt-BR'));
  },

  listAvailableByBook(bookId: string): BookCopy[] {
    return this.listByBook(bookId).filter((c) => c.status === 'available');
  },

  createCopy(input: CreateCopyInput): BookCopy {
    const book = repositories.books.findById(input.bookId);
    if (!book) {
      throw new Error('Livro relacionado não encontrado.');
    }

    const code = input.assetCode.trim().toUpperCase();
    if (!code) {
      throw new Error('O código de patrimônio do exemplar é obrigatório.');
    }

    const duplicate = repositories.copies.findByAssetCode(code);
    if (duplicate) {
      throw new Error(`Já existe um exemplar cadastrado com o código "${code}".`);
    }

    const now = getNowISO();
    const copy: BookCopy = {
      id: generateId('copy'),
      bookId: input.bookId,
      assetCode: code,
      condition: input.condition,
      status: 'available',
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    return repositories.copies.save(copy);
  },

  updateCopy(copyId: string, input: UpdateCopyInput): BookCopy {
    const existing = repositories.copies.findById(copyId);
    if (!existing) {
      throw new Error('Exemplar não encontrado.');
    }

    const code = input.assetCode.trim().toUpperCase();
    if (!code) {
      throw new Error('O código de patrimônio do exemplar é obrigatório.');
    }

    const duplicate = repositories.copies.findByAssetCode(code);
    if (duplicate && duplicate.id !== copyId) {
      throw new Error(`Já existe outro exemplar cadastrado com o código "${code}".`);
    }

    const activeLoanForCopy = repositories.loans
      .findByCopyId(copyId)
      .find((l) => l.status === 'active');

    if (activeLoanForCopy && input.status !== 'loaned') {
      throw new Error(
        'Este exemplar está em um empréstimo ativo. Registre a devolução antes de alterar sua situação.'
      );
    }

    if (!activeLoanForCopy && input.status === 'loaned') {
      throw new Error(
        'Não é possível marcar manualmente um exemplar como "Emprestado" sem uma retirada confirmada.'
      );
    }

    const updated: BookCopy = {
      ...existing,
      assetCode: code,
      condition: input.condition,
      status: input.status,
      notes: input.notes?.trim() || undefined,
      updatedAt: getNowISO(),
    };

    return repositories.copies.save(updated);
  },

  deleteCopy(copyId: string): void {
    const existing = repositories.copies.findById(copyId);
    if (!existing) {
      throw new Error('Exemplar não encontrado.');
    }

    const loans = repositories.loans.findByCopyId(copyId);
    if (loans.some((l) => l.status === 'active')) {
      throw new Error('Não é possível excluir um exemplar que está atualmente emprestado.');
    }

    if (existing.status === 'loaned') {
      throw new Error('Não é possível excluir um exemplar emprestado.');
    }

    repositories.copies.delete(copyId);
  },

  suggestNextAssetCode(): string {
    const existing = repositories.copies.findAll();
    let num = existing.length + 101;
    let candidate = `PAT-${String(num).padStart(5, '0')}`;
    while (repositories.copies.findByAssetCode(candidate)) {
      num++;
      candidate = `PAT-${String(num).padStart(5, '0')}`;
    }
    return candidate;
  },
};
