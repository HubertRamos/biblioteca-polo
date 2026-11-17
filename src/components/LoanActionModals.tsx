import { useEffect, useState } from 'react';
import { useLibrary } from '../hooks/useLibraryContext';
import {
  addDaysToISO,
  COPY_CONDITION_LABELS,
  formatDateBR,
  getNowISO,
} from '../lib/formatters';
import { CopyCondition, LoanEnriched } from '../types/library';
import { Modal } from './Modal';

export function PickupConfirmModal({
  loan,
  onClose,
}: {
  loan: LoanEnriched | null;
  onClose: () => void;
}) {
  const { getAvailableCopiesForBook, confirmPickup, settings } = useLibrary();
  const [selectedCopyId, setSelectedCopyId] = useState('');

  const availableCopies = loan ? getAvailableCopiesForBook(loan.bookId) : [];

  useEffect(() => {
    if (loan && availableCopies.length > 0) {
      setSelectedCopyId(availableCopies[0].id);
    } else {
      setSelectedCopyId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan?.id]);

  if (!loan) return null;

  const estimatedDue = addDaysToISO(getNowISO(), settings.defaultLoanDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCopyId) return;
    try {
      confirmPickup(loan.id, selectedCopyId);
      onClose();
    } catch {
      // Erro exibido via toast
    }
  };

  return (
    <Modal
      open={Boolean(loan)}
      onClose={onClose}
      title="Confirmar Retirada Física"
      subtitle={`Leitor: ${loan.readerName} (${loan.readerRegistration})`}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-1">
          <p className="font-medium text-stone-900 text-sm">{loan.bookTitle}</p>
          <p className="text-stone-600">{loan.bookAuthor}</p>
          <p className="pt-1 text-stone-500">
            Prazo de empréstimo:{' '}
            <strong className="text-stone-800">
              {settings.defaultLoanDays} dias corridos
            </strong>{' '}
            · Devolução prevista em{' '}
            <strong className="font-mono text-stone-800 tabular-nums">
              {formatDateBR(estimatedDue)}
            </strong>
          </p>
        </div>

        {availableCopies.length === 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            Não há exemplares físicos disponíveis no momento para efetuar a
            retirada. Aguarde uma devolução.
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-stone-700">
              Selecione o exemplar físico entregue *
            </label>
            <select
              value={selectedCopyId}
              onChange={(e) => setSelectedCopyId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            >
              {availableCopies.map((copy) => (
                <option key={copy.id} value={copy.id}>
                  {copy.assetCode} — Conservação:{' '}
                  {COPY_CONDITION_LABELS[copy.condition]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={availableCopies.length === 0 || !selectedCopyId}
            className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] disabled:opacity-50"
          >
            Confirmar retirada
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ReturnConfirmModal({
  loan,
  onClose,
}: {
  loan: LoanEnriched | null;
  onClose: () => void;
}) {
  const { confirmReturn } = useLibrary();
  const [condition, setCondition] = useState<CopyCondition>('good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (loan) {
      setCondition('good');
      setNotes('');
    }
  }, [loan]);

  if (!loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      confirmReturn(loan.id, condition, notes);
      onClose();
    } catch {
      // Erro exibido via toast
    }
  };

  return (
    <Modal
      open={Boolean(loan)}
      onClose={onClose}
      title="Confirmar Devolução"
      subtitle={`Exemplar ${loan.copyCode ?? '—'} · ${loan.readerName}`}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-1">
          <p className="text-sm font-medium text-stone-900">{loan.bookTitle}</p>
          <p className="text-stone-600">
            Retirado em {formatDateBR(loan.pickupDate)} · Previsto para{' '}
            {formatDateBR(loan.dueDate)}
          </p>
          {loan.isOverdue && (
            <p className="font-medium text-[#DC2626] pt-1">
              Devolução com {loan.daysOverdue}{' '}
              {loan.daysOverdue === 1 ? 'dia' : 'dias'} de atraso.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Estado de conservação na devolução
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as CopyCondition)}
            className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          >
            {Object.entries(COPY_CONDITION_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Observações do recebimento (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: Livro conferido sem avarias"
            className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224]"
          >
            Confirmar devolução
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function RejectReasonModal({
  loan,
  onClose,
}: {
  loan: LoanEnriched | null;
  onClose: () => void;
}) {
  const { rejectLoan } = useLibrary();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (loan) setReason('');
  }, [loan]);

  if (!loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      rejectLoan(loan.id, reason);
      onClose();
    } catch {
      // Erro via toast
    }
  };

  return (
    <Modal
      open={Boolean(loan)}
      onClose={onClose}
      title="Rejeitar Solicitação"
      subtitle={`${loan.bookTitle} · ${loan.readerName}`}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-700">
            Motivo da rejeição (opcional)
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: Exemplar reservado para atividade em sala ou leitor com pendência."
            className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirmar rejeição
          </button>
        </div>
      </form>
    </Modal>
  );
}
