import {
  CopyCondition,
  CopyStatus,
  Loan,
  LoanStatus,
  ReaderStatus,
  ReaderType,
  UserRole,
} from '../types/library';

export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getNowISO(): string {
  return new Date().toISOString();
}

export function addDaysToISO(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function subtractDaysFromNowISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function formatDateBR(isoDate?: string): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeBR(isoDate?: string): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function startOfDayTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function computeLoanOverdueInfo(loan: Loan): {
  isOverdue: boolean;
  daysOverdue: number;
  daysRemaining: number | null;
} {
  if (loan.status !== 'active' || !loan.dueDate) {
    return { isOverdue: false, daysOverdue: 0, daysRemaining: null };
  }

  const todayTs = startOfDayTimestamp(new Date());
  const dueTs = startOfDayTimestamp(new Date(loan.dueDate));
  const diffDays = Math.round((dueTs - todayTs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isOverdue: true,
      daysOverdue: Math.abs(diffDays),
      daysRemaining: diffDays,
    };
  }

  return {
    isOverdue: false,
    daysOverdue: 0,
    daysRemaining: diffDays,
  };
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  pending: 'Aguardando aprovação',
  approved: 'Aprovado (aguardando retirada)',
  active: 'Empréstimo ativo',
  returned: 'Devolvido',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

export const COPY_CONDITION_LABELS: Record<CopyCondition, string> = {
  excellent: 'Ótimo',
  good: 'Bom',
  fair: 'Regular',
  damaged: 'Danificado',
};

export const COPY_STATUS_LABELS: Record<CopyStatus, string> = {
  available: 'Disponível',
  loaned: 'Emprestado',
  maintenance: 'Em manutenção',
  lost: 'Extraviado',
};

export const READER_TYPE_LABELS: Record<ReaderType, string> = {
  student: 'Aluno',
  teacher: 'Professor',
};

export const READER_STATUS_LABELS: Record<ReaderStatus, string> = {
  active: 'Ativo',
  inactive: 'Desativado',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Bibliotecário / Admin',
  student: 'Aluno',
  teacher: 'Professor',
};
