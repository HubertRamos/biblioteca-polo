export type UserRole = 'admin' | 'student' | 'teacher';

export type ReaderType = 'student' | 'teacher';

export type ReaderStatus = 'active' | 'inactive';

export type CopyCondition = 'excellent' | 'good' | 'fair' | 'damaged';

export type CopyStatus = 'available' | 'loaned' | 'maintenance' | 'lost';

export type LoanStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'returned'
  | 'rejected'
  | 'cancelled'
  | 'expired';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher: string;
  publicationYear: number;
  category: string;
  description: string;
  coverUrl?: string;
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  assetCode: string; // Código de patrimônio / tombamento
  condition: CopyCondition;
  status: CopyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookAvailability {
  totalCopies: number;
  availableCopies: number;
  loanedCopies: number;
  maintenanceCopies: number;
  lostCopies: number;
}

export interface BookWithAvailability extends Book {
  availability: BookAvailability;
}

export interface Reader {
  id: string;
  fullName: string;
  registrationNumber: string; // Matrícula
  email: string;
  type: ReaderType;
  departmentOrClass?: string; // Turma ou departamento
  status: ReaderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  copyId?: string;
  readerId: string;
  // Snapshots preservam o histórico mesmo se livro/leitor forem editados ou desativados
  bookTitle: string;
  bookAuthor: string;
  copyCode?: string;
  readerName: string;
  readerRegistration: string;
  readerType: ReaderType;
  status: LoanStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  expiredAt?: string;
  pickupDate?: string;
  dueDate?: string;
  returnDate?: string;
  returnedTo?: string;
  notes?: string;
  updatedAt: string;
}

export interface LoanEnriched extends Loan {
  isOverdue: boolean;
  daysOverdue: number;
  daysRemaining: number | null;
}

export interface ActivityEvent {
  id: string;
  loanId?: string;
  type:
    | 'loan_requested'
    | 'loan_approved'
    | 'loan_rejected'
    | 'loan_cancelled'
    | 'loan_expired'
    | 'loan_pickup'
    | 'loan_returned'
    | 'book_created'
    | 'reader_created';
  title: string;
  description: string;
  actorName: string;
  createdAt: string;
}

export interface LibrarySettings {
  defaultLoanDays: number;
  schoolName: string;
  updatedAt: string;
}

/**
 * Usuário de demonstração para simulação local.
 * IMPORTANTE: Em produção, este modelo deve ser substituído por Supabase Auth (auth.users + tabela profiles).
 */
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  readerId?: string; // Vincula aluno/professor ao registro em Reader
  subtitle: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  pendingRequests: number;
  approvedWaitingPickup: number;
  overdueLoans: number;
  totalReaders: number;
  activeReaders: number;
}
