import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ConfirmDialog } from '../components/Modal';
import { LoanStatusText } from '../components/StatusIndicator';
import { useLibrary } from '../hooks/useLibraryContext';
import { formatDateBR } from '../lib/formatters';
import { LoanEnriched } from '../types/library';

interface MyLoansPageProps {
  onGoToCatalog: () => void;
}

type ReaderTab = 'ongoing' | 'active' | 'history';

export function MyLoansPage({ onGoToCatalog }: MyLoansPageProps) {
  const { currentUser, loans, cancelLoan } = useLibrary();
  const [tab, setTab] = useState<ReaderTab>('ongoing');
  const [loanToCancel, setLoanToCancel] = useState<LoanEnriched | null>(null);

  const myLoans = useMemo(() => {
    if (!currentUser?.readerId) return [];
    return loans.filter((l) => l.readerId === currentUser.readerId);
  }, [loans, currentUser?.readerId]);

  const requestsList = useMemo(
    () =>
      myLoans.filter((l) => l.status === 'pending' || l.status === 'approved'),
    [myLoans]
  );

  const activeList = useMemo(
    () => myLoans.filter((l) => l.status === 'active'),
    [myLoans]
  );

  const historyList = useMemo(
    () =>
      myLoans.filter(
        (l) =>
          l.status === 'returned' ||
          l.status === 'rejected' ||
          l.status === 'cancelled' ||
          l.status === 'expired'
      ),
    [myLoans]
  );

  const currentList =
    tab === 'ongoing'
      ? requestsList
      : tab === 'active'
      ? activeList
      : historyList;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
            Área do Leitor
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
            Meus Empréstimos
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Acompanhe suas solicitações, prazos de devolução e histórico na
            biblioteca.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToCatalog}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>Explorar catálogo</span>
        </button>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">Solicitações em andamento</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {requestsList.length}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">Livros comigo agora</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {activeList.length}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">Histórico concluído</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-stone-900 tabular-nums">
            {historyList.length}
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-stone-200/70 p-1">
        <button
          type="button"
          onClick={() => setTab('ongoing')}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            tab === 'ongoing'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Solicitações ({requestsList.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            tab === 'active'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Empréstimos ativos ({activeList.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            tab === 'history'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Histórico ({historyList.length})
        </button>
      </div>

      {/* Lista */}
      {currentList.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-serif text-base font-medium text-stone-900">
            Nenhum registro nesta categoria
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Quando você solicitar ou retirar um livro, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Livro</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Solicitado em</th>
                <th className="px-4 py-3 font-medium">
                  {tab === 'active'
                    ? 'Prazo de devolução'
                    : tab === 'history'
                    ? 'Encerrado em'
                    : 'Exemplar'}
                </th>
                <th className="px-4 py-3 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {currentList.map((loan) => (
                <tr key={loan.id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-stone-900">
                      {loan.bookTitle}
                    </p>
                    <p className="text-xs text-stone-500">{loan.bookAuthor}</p>
                    {loan.rejectionReason && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        Motivo: {loan.rejectionReason}
                      </p>
                    )}
                    {loan.status === 'approved' && (
                      <p className="mt-1 text-xs text-[#1D4ED8]">
                        Compareça à biblioteca para retirar seu exemplar.
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <LoanStatusText
                      status={loan.status}
                      isOverdue={loan.isOverdue}
                      daysOverdue={loan.daysOverdue}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-stone-600 tabular-nums">
                    {formatDateBR(loan.requestedAt)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-stone-600 tabular-nums">
                    {loan.status === 'active'
                      ? formatDateBR(loan.dueDate)
                      : loan.status === 'returned'
                      ? formatDateBR(loan.returnDate)
                      : loan.copyCode ?? 'A definir na retirada'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {(loan.status === 'pending' ||
                      loan.status === 'approved') && (
                      <button
                        type="button"
                        onClick={() => setLoanToCancel(loan)}
                        className="text-xs font-medium text-stone-600 hover:text-[#DC2626] whitespace-nowrap"
                      >
                        Cancelar pedido
                      </button>
                    )}
                    {loan.status === 'active' && (
                      <span className="font-mono text-xs text-stone-500">
                        {loan.copyCode}
                      </span>
                    )}
                    {(loan.status === 'returned' ||
                      loan.status === 'rejected' ||
                      loan.status === 'cancelled' ||
                      loan.status === 'expired') && (
                      <span className="text-xs text-stone-400">Concluído</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(loanToCancel)}
        onClose={() => setLoanToCancel(null)}
        onConfirm={() => {
          if (loanToCancel) cancelLoan(loanToCancel.id);
        }}
        title="Cancelar solicitação"
        description={
          loanToCancel
            ? `Deseja realmente cancelar a solicitação de empréstimo do livro "${loanToCancel.bookTitle}"?`
            : ''
        }
        confirmLabel="Cancelar solicitação"
        danger
      />
    </div>
  );
}
