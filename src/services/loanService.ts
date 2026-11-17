import {
  addDaysToISO,
  computeLoanOverdueInfo,
  generateId,
  getNowISO,
} from '../lib/formatters';
import { repositories } from '../repositories';
import {
  ActivityEvent,
  CopyCondition,
  DashboardStats,
  Loan,
  LoanEnriched,
} from '../types/library';
import { bookService } from './bookService';

function enrichLoan(loan: Loan): LoanEnriched {
  const overdue = computeLoanOverdueInfo(loan);
  return {
    ...loan,
    ...overdue,
  };
}

export const loanService = {
  listLoans(): LoanEnriched[] {
    return repositories.loans
      .findAll()
      .map(enrichLoan)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  },

  listLoansByReader(readerId: string): LoanEnriched[] {
    return repositories.loans
      .findByReaderId(readerId)
      .map(enrichLoan)
      .sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
  },

  listRecentActivities(limit = 12): ActivityEvent[] {
    return repositories.activities.findAll().slice(0, limit);
  },

  getDashboardStats(): DashboardStats {
    const books = bookService.listBooks();
    const copies = repositories.copies.findAll();
    const readers = repositories.readers.findAll();
    const loans = this.listLoans();

    return {
      totalBooks: books.length,
      totalCopies: copies.length,
      availableCopies: copies.filter((c) => c.status === 'available').length,
      activeLoans: loans.filter((l) => l.status === 'active').length,
      pendingRequests: loans.filter((l) => l.status === 'pending').length,
      approvedWaitingPickup: loans.filter((l) => l.status === 'approved').length,
      overdueLoans: loans.filter((l) => l.isOverdue).length,
      totalReaders: readers.length,
      activeReaders: readers.filter((r) => r.status === 'active').length,
    };
  },

  /**
   * Etapa 1 — Solicitação de empréstimo (status: pending)
   */
  requestLoan(bookId: string, readerId: string, notes?: string): LoanEnriched {
    const reader = repositories.readers.findById(readerId);
    if (!reader) {
      throw new Error('Cadastro de leitor não encontrado.');
    }
    if (reader.status !== 'active') {
      throw new Error(
        'Seu cadastro de leitor está desativado. Procure a biblioteca para regularização.'
      );
    }

    const book = bookService.getBookById(bookId);
    if (!book) {
      throw new Error('Livro não encontrado no acervo.');
    }

    if (book.availability.availableCopies < 1) {
      throw new Error(
        'Não há exemplares disponíveis deste livro no momento para solicitação.'
      );
    }

    const readerLoans = repositories.loans.findByReaderId(readerId);
    const duplicateOpenLoan = readerLoans.find(
      (l) =>
        l.bookId === bookId &&
        (l.status === 'pending' || l.status === 'approved' || l.status === 'active')
    );

    if (duplicateOpenLoan) {
      throw new Error(
        'Você já possui uma solicitação em aberto ou um empréstimo ativo para este livro.'
      );
    }

    const now = getNowISO();
    const loan: Loan = {
      id: generateId('loan'),
      bookId: book.id,
      readerId: reader.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      readerName: reader.fullName,
      readerRegistration: reader.registrationNumber,
      readerType: reader.type,
      status: 'pending',
      requestedAt: now,
      notes: notes?.trim() || undefined,
      updatedAt: now,
    };

    repositories.loans.save(loan);

    repositories.activities.add({
      id: generateId('act'),
      loanId: loan.id,
      type: 'loan_requested',
      title: 'Solicitação de empréstimo',
      description: `${reader.fullName} solicitou "${book.title}".`,
      actorName: reader.fullName,
      createdAt: now,
    });

    return enrichLoan(loan);
  },

  /**
   * Etapa 2 — Aprovação pelo bibliotecário (pending -> approved)
   * Não inicia contagem de prazo nem bloqueia exemplar físico ainda.
   */
  approveLoan(loanId: string, librarianName: string): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Solicitação não encontrada.');
    }
    if (loan.status !== 'pending') {
      throw new Error(
        'Operação inválida: somente solicitações pendentes podem ser aprovadas.'
      );
    }

    const book = bookService.getBookById(loan.bookId);
    if (!book || book.availability.availableCopies < 1) {
      throw new Error(
        'Não há exemplares disponíveis no momento para aprovar esta solicitação.'
      );
    }

    const reader = repositories.readers.findById(loan.readerId);
    if (!reader || reader.status !== 'active') {
      throw new Error(
        'Não é possível aprovar porque o cadastro do leitor está desativado.'
      );
    }

    const now = getNowISO();
    const updated: Loan = {
      ...loan,
      status: 'approved',
      approvedAt: now,
      approvedBy: librarianName,
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_approved',
      title: 'Solicitação aprovada',
      description: `Pedido de ${updated.readerName} para "${updated.bookTitle}" aprovado para retirada.`,
      actorName: librarianName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },

  /**
   * Etapa 2b — Rejeição pelo bibliotecário (pending -> rejected)
   */
  rejectLoan(
    loanId: string,
    librarianName: string,
    reason?: string
  ): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Solicitação não encontrada.');
    }
    if (loan.status !== 'pending') {
      throw new Error(
        'Operação inválida: somente solicitações pendentes podem ser rejeitadas.'
      );
    }

    const now = getNowISO();
    const updated: Loan = {
      ...loan,
      status: 'rejected',
      rejectedAt: now,
      rejectionReason:
        reason?.trim() || 'Solicitação recusada pela equipe da biblioteca.',
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_rejected',
      title: 'Solicitação rejeitada',
      description: `Pedido de ${updated.readerName} para "${updated.bookTitle}" foi rejeitado.`,
      actorName: librarianName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },

  /**
   * Cancelamento (pending | approved -> cancelled)
   */
  cancelLoan(loanId: string, actorName: string): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Solicitação não encontrada.');
    }
    if (loan.status !== 'pending' && loan.status !== 'approved') {
      throw new Error(
        'Operação inválida: somente solicitações pendentes ou aprovadas aguardando retirada podem ser canceladas.'
      );
    }

    const now = getNowISO();
    const updated: Loan = {
      ...loan,
      status: 'cancelled',
      cancelledAt: now,
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_cancelled',
      title: 'Solicitação cancelada',
      description: `Solicitação de "${updated.bookTitle}" (${updated.readerName}) foi cancelada.`,
      actorName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },

  /**
   * Expiração (pending | approved -> expired)
   */
  expireLoan(loanId: string, librarianName: string): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Solicitação não encontrada.');
    }
    if (loan.status !== 'pending' && loan.status !== 'approved') {
      throw new Error(
        'Operação inválida: apenas solicitações ainda não retiradas podem expirar.'
      );
    }

    const now = getNowISO();
    const updated: Loan = {
      ...loan,
      status: 'expired',
      expiredAt: now,
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_expired',
      title: 'Solicitação expirada',
      description: `Prazo de retirada para "${updated.bookTitle}" (${updated.readerName}) expirou.`,
      actorName: librarianName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },

  /**
   * Etapa 3 — Confirmação da retirada física (approved -> active)
   * Vincula exemplar específico, marca exemplar como loaned e inicia contagem do prazo.
   */
  confirmPickup(
    loanId: string,
    copyId: string,
    librarianName: string
  ): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Solicitação não encontrada.');
    }
    if (loan.status !== 'approved') {
      throw new Error(
        'Operação inválida: não é possível confirmar a retirada sem aprovação prévia.'
      );
    }

    const reader = repositories.readers.findById(loan.readerId);
    if (!reader || reader.status !== 'active') {
      throw new Error(
        'O cadastro do leitor está desativado. Reative-o antes de entregar o exemplar.'
      );
    }

    const copy = repositories.copies.findById(copyId);
    if (!copy || copy.bookId !== loan.bookId) {
      throw new Error('Exemplar selecionado não pertence a este título.');
    }
    if (copy.status !== 'available') {
      throw new Error(
        `O exemplar ${copy.assetCode} não está disponível para retirada no momento.`
      );
    }

    // Regra de integridade: impedir dois empréstimos ativos para o mesmo exemplar
    const conflictingActiveLoan = repositories.loans
      .findByCopyId(copy.id)
      .find((l) => l.status === 'active');
    if (conflictingActiveLoan) {
      throw new Error(
        `Conflito detectado: o exemplar ${copy.assetCode} já está vinculado a outro empréstimo ativo.`
      );
    }

    const settings = repositories.settings.get();
    const loanDays = settings.defaultLoanDays || 7;
    const now = getNowISO();
    const dueDate = addDaysToISO(now, loanDays);

    repositories.copies.save({
      ...copy,
      status: 'loaned',
      updatedAt: now,
    });

    const updated: Loan = {
      ...loan,
      status: 'active',
      copyId: copy.id,
      copyCode: copy.assetCode,
      pickupDate: now,
      dueDate,
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_pickup',
      title: 'Retirada física confirmada',
      description: `${updated.readerName} retirou "${updated.bookTitle}" (exemplar ${copy.assetCode}).`,
      actorName: librarianName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },

  /**
   * Etapa 4 — Confirmação da devolução (active -> returned)
   * Libera o exemplar e preserva todo o histórico.
   */
  confirmReturn(
    loanId: string,
    librarianName: string,
    returnCondition?: CopyCondition,
    notes?: string
  ): LoanEnriched {
    const loan = repositories.loans.findById(loanId);
    if (!loan) {
      throw new Error('Empréstimo não encontrado.');
    }
    if (loan.status !== 'active') {
      throw new Error(
        'Operação inválida: somente empréstimos ativos podem ser devolvidos.'
      );
    }

    const now = getNowISO();

    if (loan.copyId) {
      const copy = repositories.copies.findById(loan.copyId);
      if (copy) {
        repositories.copies.save({
          ...copy,
          status: 'available',
          condition: returnCondition ?? copy.condition,
          updatedAt: now,
        });
      }
    }

    const updated: Loan = {
      ...loan,
      status: 'returned',
      returnDate: now,
      returnedTo: librarianName,
      notes: notes?.trim()
        ? loan.notes
          ? `${loan.notes} | Devolução: ${notes.trim()}`
          : notes.trim()
        : loan.notes,
      updatedAt: now,
    };

    repositories.loans.save(updated);

    repositories.activities.add({
      id: generateId('act'),
      loanId: updated.id,
      type: 'loan_returned',
      title: 'Devolução registrada',
      description: `${updated.readerName} devolveu "${updated.bookTitle}" (${updated.copyCode ?? 'exemplar'}).`,
      actorName: librarianName,
      createdAt: now,
    });

    return enrichLoan(updated);
  },
};
