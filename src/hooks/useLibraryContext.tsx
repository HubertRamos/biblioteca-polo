import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authService } from '../services/authService';
import {
  bookService,
  CreateBookInput,
  UpdateBookInput,
} from '../services/bookService';
import {
  copyService,
  CreateCopyInput,
  UpdateCopyInput,
} from '../services/copyService';
import { loanService } from '../services/loanService';
import {
  CreateReaderInput,
  readerService,
  UpdateReaderInput,
} from '../services/readerService';
import { seedService } from '../services/seedService';
import { settingsService } from '../services/settingsService';
import {
  ActivityEvent,
  BookCopy,
  BookWithAvailability,
  CopyCondition,
  DashboardStats,
  DemoUser,
  LibrarySettings,
  LoanEnriched,
  Reader,
} from '../types/library';
import { useToast } from './useToast';

interface LibraryContextValue {
  currentUser: DemoUser | null;
  demoUsers: DemoUser[];
  books: BookWithAvailability[];
  categories: string[];
  readers: Reader[];
  loans: LoanEnriched[];
  activities: ActivityEvent[];
  stats: DashboardStats;
  settings: LibrarySettings;
  refreshAll: () => void;

  // Autenticação simulada (provisória até migração para Supabase Auth)
  loginAsDemoUser: (userId: string) => void;
  logout: () => void;

  // Livros e exemplares
  getCopiesForBook: (bookId: string) => BookCopy[];
  getAvailableCopiesForBook: (bookId: string) => BookCopy[];
  suggestNextAssetCode: () => string;
  createBook: (input: CreateBookInput) => BookWithAvailability;
  updateBook: (bookId: string, input: UpdateBookInput) => BookWithAvailability;
  deleteBook: (bookId: string) => void;
  createCopy: (input: CreateCopyInput) => BookCopy;
  updateCopy: (copyId: string, input: UpdateCopyInput) => BookCopy;
  deleteCopy: (copyId: string) => void;

  // Leitores
  createReader: (input: CreateReaderInput) => Reader;
  updateReader: (readerId: string, input: UpdateReaderInput) => Reader;
  toggleReaderStatus: (readerId: string) => Reader;
  deleteReader: (readerId: string) => void;

  // Empréstimos
  requestLoan: (bookId: string, notes?: string) => LoanEnriched;
  approveLoan: (loanId: string) => LoanEnriched;
  rejectLoan: (loanId: string, reason?: string) => LoanEnriched;
  cancelLoan: (loanId: string) => LoanEnriched;
  expireLoan: (loanId: string) => LoanEnriched;
  confirmPickup: (loanId: string, copyId: string) => LoanEnriched;
  confirmReturn: (
    loanId: string,
    returnCondition?: CopyCondition,
    notes?: string
  ) => LoanEnriched;

  // Configurações e demonstração
  updateSettings: (input: { defaultLoanDays: number; schoolName: string }) => void;
  restoreDemoData: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useToast();
  const [version, setVersion] = useState(0);

  // Garante inicialização única antes de ler os serviços
  useEffect(() => {
    seedService.ensureSeeded();
    setVersion((v) => v + 1);
  }, []);

  const refreshAll = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Leitura reativa via version tick
  void version;
  const currentUser = authService.getCurrentUser();
  const demoUsers = authService.getDemoUsers();
  const books = bookService.listBooks();
  const categories = bookService.getCategories();
  const readers = readerService.listReaders();
  const loans = loanService.listLoans();
  const activities = loanService.listRecentActivities(15);
  const stats = loanService.getDashboardStats();
  const settings = settingsService.getSettings();

  const runAction = <T,>(
    fn: () => T,
    successTitle?: string,
    successDescription?: string
  ): T => {
    try {
      const result = fn();
      refreshAll();
      if (successTitle) {
        notify(successTitle, 'success', successDescription);
      }
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro inesperado ao executar operação.';
      notify('Operação não concluída', 'error', message);
      throw err;
    }
  };

  const loginAsDemoUser = (userId: string) => {
    runAction(() => {
      const user = authService.loginAsDemoUser(userId);
      notify(`Sessão iniciada como ${user.name}`, 'info');
      return user;
    });
  };

  const logout = () => {
    authService.logout();
    refreshAll();
    notify('Você saiu da sessão atual.', 'info');
  };

  const actorName = currentUser?.name ?? 'Bibliotecário';

  const value: LibraryContextValue = {
    currentUser,
    demoUsers,
    books,
    categories,
    readers,
    loans,
    activities,
    stats,
    settings,
    refreshAll,
    loginAsDemoUser,
    logout,

    getCopiesForBook: (bookId) => copyService.listByBook(bookId),
    getAvailableCopiesForBook: (bookId) => copyService.listAvailableByBook(bookId),
    suggestNextAssetCode: () => copyService.suggestNextAssetCode(),

    createBook: (input) =>
      runAction(
        () => bookService.createBook(input, actorName),
        'Livro cadastrado',
        `"${input.title}" foi adicionado ao acervo.`
      ),
    updateBook: (bookId, input) =>
      runAction(
        () => bookService.updateBook(bookId, input),
        'Livro atualizado',
        `Os dados de "${input.title}" foram salvos.`
      ),
    deleteBook: (bookId) =>
      runAction(
        () => bookService.deleteBook(bookId),
        'Livro removido',
        'O registro bibliográfico e seus exemplares foram removidos.'
      ),

    createCopy: (input) =>
      runAction(
        () => copyService.createCopy(input),
        'Exemplar adicionado',
        `Patrimônio ${input.assetCode.toUpperCase()} registrado.`
      ),
    updateCopy: (copyId, input) =>
      runAction(
        () => copyService.updateCopy(copyId, input),
        'Exemplar atualizado',
        `Patrimônio ${input.assetCode.toUpperCase()} atualizado.`
      ),
    deleteCopy: (copyId) =>
      runAction(
        () => copyService.deleteCopy(copyId),
        'Exemplar removido',
        'O exemplar foi excluído do inventário.'
      ),

    createReader: (input) =>
      runAction(
        () => readerService.createReader(input, actorName),
        'Leitor cadastrado',
        `${input.fullName} foi adicionado(a) com sucesso.`
      ),
    updateReader: (readerId, input) =>
      runAction(
        () => readerService.updateReader(readerId, input),
        'Cadastro atualizado',
        `Dados de ${input.fullName} atualizados.`
      ),
    toggleReaderStatus: (readerId) =>
      runAction(() => {
        const updated = readerService.toggleStatus(readerId);
        return updated;
      }, 'Status do leitor alterado'),
    deleteReader: (readerId) =>
      runAction(
        () => readerService.deleteReader(readerId),
        'Leitor excluído',
        'O cadastro foi removido.'
      ),

    requestLoan: (bookId, notes) => {
      if (!currentUser?.readerId) {
        const msg = 'Selecione um perfil de Aluno ou Professor para solicitar empréstimo.';
        notify('Acesso não permitido', 'error', msg);
        throw new Error(msg);
      }
      const readerId = currentUser.readerId;
      return runAction(
        () => loanService.requestLoan(bookId, readerId, notes),
        'Solicitação enviada',
        'Seu pedido está aguardando aprovação da biblioteca.'
      );
    },
    approveLoan: (loanId) =>
      runAction(
        () => loanService.approveLoan(loanId, actorName),
        'Solicitação aprovada',
        'O leitor já pode comparecer à biblioteca para retirar o exemplar.'
      ),
    rejectLoan: (loanId, reason) =>
      runAction(
        () => loanService.rejectLoan(loanId, actorName, reason),
        'Solicitação rejeitada'
      ),
    cancelLoan: (loanId) =>
      runAction(
        () => loanService.cancelLoan(loanId, actorName),
        'Solicitação cancelada'
      ),
    expireLoan: (loanId) =>
      runAction(
        () => loanService.expireLoan(loanId, actorName),
        'Solicitação marcada como expirada'
      ),
    confirmPickup: (loanId, copyId) =>
      runAction(
        () => loanService.confirmPickup(loanId, copyId, actorName),
        'Retirada confirmada',
        'Empréstimo iniciado e prazo de devolução calculado.'
      ),
    confirmReturn: (loanId, returnCondition, notes) =>
      runAction(
        () => loanService.confirmReturn(loanId, actorName, returnCondition, notes),
        'Devolução confirmada',
        'O exemplar retornou ao acervo disponível.'
      ),

    updateSettings: (input) =>
      runAction(
        () => settingsService.updateSettings(input),
        'Configurações salvas',
        `Prazo padrão ajustado para ${input.defaultLoanDays} dia(s).`
      ),
    restoreDemoData: () =>
      runAction(
        () => settingsService.restoreDemoData(),
        'Dados restaurados',
        'O acervo e as movimentações iniciais de demonstração foram restaurados.'
      ),
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary deve ser utilizado dentro de LibraryProvider.');
  }
  return ctx;
}
