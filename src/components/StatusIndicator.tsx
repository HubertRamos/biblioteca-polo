import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MinusCircle,
  XCircle,
} from 'lucide-react';
import {
  COPY_STATUS_LABELS,
  LOAN_STATUS_LABELS,
  READER_STATUS_LABELS,
} from '../lib/formatters';
import { CopyStatus, LoanStatus, ReaderStatus } from '../types/library';

export function LoanStatusText({
  status,
  isOverdue = false,
  daysOverdue = 0,
}: {
  status: LoanStatus;
  isOverdue?: boolean;
  daysOverdue?: number;
}) {
  if (status === 'active' && isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DC2626] whitespace-nowrap">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>
          Atrasado ({daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'})
        </span>
      </span>
    );
  }

  const config: Record<
    LoanStatus,
    { color: string; Icon: typeof Clock }
  > = {
    pending: { color: 'text-[#B45309]', Icon: Clock },
    approved: { color: 'text-[#1D4ED8]', Icon: CheckCircle2 },
    active: { color: 'text-[#15803D]', Icon: CheckCircle2 },
    returned: { color: 'text-stone-600', Icon: CheckCircle2 },
    rejected: { color: 'text-[#DC2626]', Icon: XCircle },
    cancelled: { color: 'text-stone-500', Icon: MinusCircle },
    expired: { color: 'text-stone-500', Icon: Clock },
  };

  const { color, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${color}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{LOAN_STATUS_LABELS[status]}</span>
    </span>
  );
}

export function CopyStatusText({ status }: { status: CopyStatus }) {
  const colorMap: Record<CopyStatus, string> = {
    available: 'text-[#15803D]',
    loaned: 'text-[#1D4ED8]',
    maintenance: 'text-[#B45309]',
    lost: 'text-[#DC2626]',
  };

  return (
    <span className={`text-xs font-medium whitespace-nowrap ${colorMap[status]}`}>
      {COPY_STATUS_LABELS[status]}
    </span>
  );
}

export function ReaderStatusText({ status }: { status: ReaderStatus }) {
  return (
    <span
      className={`text-xs font-medium whitespace-nowrap ${
        status === 'active' ? 'text-[#15803D]' : 'text-stone-500'
      }`}
    >
      {READER_STATUS_LABELS[status]}
    </span>
  );
}
