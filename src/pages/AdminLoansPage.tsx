import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  PickupConfirmModal,
  RejectReasonModal,
  ReturnConfirmModal,
} from '../components/LoanActionModals';
import { ConfirmDialog } from '../components/Modal';
import { LoanStatusText } from '../components/StatusIndicator';
import { useLibrary } from '../hooks/useLibraryContext';
import { formatDateBR, READER_TYPE_LABELS } from '../lib/formatters';
import { LoanEnriched, LoanStatus } from '../types/library';

type LoanFilter = 'all' | LoanStatus | 'overdue';

export function AdminLoansPage() {
  const { loans, approveLoan, cancelLoan, expireLoan } = useLibrary();

  const [statusFilter, setStatusFilter] = useState<LoanFilter>('all');
  const [search, setSearch] = useState('');

  const [pickupLoan, setPickupLoan] = useState<LoanEnriched | null>(null);
  const [returnLoan, setReturnLoan] = useState<LoanEnriched | null>(null);
  const [rejectLoan, setRejectLoan] = useState<LoanEnriched | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<LoanEnriched | null>(null);

  const counts = useMemo(() => {
    return {
      all: loans.length,
      pending: loans.filter((l) => l.status === 'pending').length,
      approved: loans.filter((l) => l.status === 'approved').length,
      active: loans.filter((l) => l.status === 'active').length,
      overdue: loans.filter((l) => l.isOverdue).length,
      returned: loans.filter((l) => l.status === 'returned').length,
    };
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loans.filter((loan) => {
      if (statusFilter === 'overdue') {
        if (!loan.isOverdue) return false;
      } else if (statusFilter !== 'all' && loan.status !== statusFilter) {
        return false;
      }

      if (!q) return true;
      return (
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.readerName.toLowerCase().includes(q) ||
        loan.readerRegistration.toLowerCase().includes(q) ||
        (loan.copyCode ?? '').toLowerCase().includes(q)
      );
    });
  }, [loans, statusFilter, search]);

  const filterTabs: { id: LoanFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'pending', label: 'Pendentes', count: counts.pending },
    { id: 'approved', label: 'Aguardando retirada', count: counts.approved },
    { id: 'active', label: 'Ativos', count: counts.active },
    { id: 'overdue', label: 'Atrasados', count: counts.overdue },
    { id: 'returned', label: 'Devolvidos', count: counts.returned },
    { id: 'rejected', label: 'Rejeitados' },
    { id: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
          Circulação
        </p>
        <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
          Gerenciamento de Empréstimos
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Aprove solicitações, confirme retiradas físicas vinculando o exemplar
          e registre devoluções.
        </p>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por livro, leitor, matrícula ou patrimônio..."
              className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532D] focus:outline-none"
            />
          </div>
          <p className="text-xs text-stone-500 tabular-nums">
            {filteredLoans.length}{' '}
            {filteredLoans.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-200/70 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 font-mono text-[11px] opacity-75 tabular-nums">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela principal */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        {filteredLoans.length === 0 ? (
          <div className="p-10 text-center text-sm text-stone-500">
            Nenhuma solicitação ou empréstimo encontrado para os filtros atuais.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Livro e exemplar</th>
                <th className="px-4 py-3 font-medium">Leitor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Datas</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3.5 max-w-[260px]">
                    <p className="font-medium text-stone-900 truncate">
                      {loan.bookTitle}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {loan.bookAuthor}
                    </p>
                    {loan.copyCode && (
                      <p className="mt-1 font-mono text-[11px] text-stone-600 tabular-nums">
                        Exemplar: {loan.copyCode}
                      </p>
                    )}
                    {loan.notes && (
                      <p className="mt-1 text-[11px] text-stone-500 line-clamp-2">
                        Obs.: {loan.notes}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-medium text-stone-900">
                      {loan.readerName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {READER_TYPE_LABELS[loan.readerType]} ·{' '}
                      <span className="font-mono">
                        {loan.readerRegistration}
                      </span>
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <LoanStatusText
                      status={loan.status}
                      isOverdue={loan.isOverdue}
                      daysOverdue={loan.daysOverdue}
                    />
                    {loan.rejectionReason && (
                      <p className="mt-1 text-[11px] text-[#DC2626] max-w-[200px]">
                        {loan.rejectionReason}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-stone-600 tabular-nums space-y-0.5 whitespace-nowrap">
                    <p>Pedido: {formatDateBR(loan.requestedAt)}</p>
                    {loan.pickupDate && (
                      <p>Retirada: {formatDateBR(loan.pickupDate)}</p>
                    )}
                    {loan.dueDate && loan.status === 'active' && (
                      <p
                        className={
                          loan.isOverdue
                            ? 'font-semibold text-[#DC2626]'
                            : 'text-stone-800'
                        }
                      >
                        Previsto: {formatDateBR(loan.dueDate)}
                      </p>
                    )}
                    {loan.returnDate && (
                      <p className="text-[#15803D]">
                        Devolvido: {formatDateBR(loan.returnDate)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      {loan.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                approveLoan(loan.id);
                              } catch {
                                // Toast exibe erro
                              }
                            }}
                            className="rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#114224] whitespace-nowrap"
                          >
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectLoan(loan)}
                            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-red-50 whitespace-nowrap"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}

                      {loan.status === 'approved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPickupLoan(loan)}
                            className="rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap"
                          >
                            Confirmar retirada
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                expireLoan(loan.id);
                              } catch {
                                // Toast
                              }
                            }}
                            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap"
                          >
                            Expirar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancel(loan)}
                            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 whitespace-nowrap"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      {loan.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => setReturnLoan(loan)}
                          className="rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#114224] whitespace-nowrap"
                        >
                          Confirmar devolução
                        </button>
                      )}

                      {(loan.status === 'returned' ||
                        loan.status === 'rejected' ||
                        loan.status === 'cancelled' ||
                        loan.status === 'expired') && (
                        <span className="text-xs text-stone-400">
                          Histórico preservado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PickupConfirmModal
        loan={pickupLoan}
        onClose={() => setPickupLoan(null)}
      />
      <ReturnConfirmModal
        loan={returnLoan}
        onClose={() => setReturnLoan(null)}
      />
      <RejectReasonModal
        loan={rejectLoan}
        onClose={() => setRejectLoan(null)}
      />
      <ConfirmDialog
        open={Boolean(confirmCancel)}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => {
          if (confirmCancel) cancelLoan(confirmCancel.id);
        }}
        title="Cancelar solicitação aprovada"
        description={
          confirmCancel
            ? `Deseja cancelar a solicitação de "${confirmCancel.bookTitle}" feita por ${confirmCancel.readerName}?`
            : ''
        }
        confirmLabel="Cancelar solicitação"
        danger
      />
    </div>
  );
}
