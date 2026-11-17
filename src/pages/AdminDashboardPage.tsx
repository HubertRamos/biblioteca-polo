import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  X,
} from 'lucide-react';
import { PickupConfirmModal, RejectReasonModal, ReturnConfirmModal } from '../components/LoanActionModals';
import { LoanStatusText } from '../components/StatusIndicator';
import { useLibrary } from '../hooks/useLibraryContext';
import { formatDateBR, formatDateTimeBR } from '../lib/formatters';
import { LoanEnriched } from '../types/library';
import { AppRoute } from '../components/AppLayout';

interface AdminDashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const {
    stats,
    loans,
    books,
    activities,
    approveLoan,
  } = useLibrary();

  const [pickupLoan, setPickupLoan] = useState<LoanEnriched | null>(null);
  const [returnLoan, setReturnLoan] = useState<LoanEnriched | null>(null);
  const [rejectLoan, setRejectLoan] = useState<LoanEnriched | null>(null);

  const attentionLoans = useMemo(
    () =>
      loans
        .filter(
          (l) =>
            l.status === 'pending' ||
            l.status === 'approved' ||
            l.isOverdue
        )
        .slice(0, 8),
    [loans]
  );

  const categoryReport = useMemo(() => {
    const map = new Map<
      string,
      { category: string; titles: number; totalCopies: number; availableCopies: number }
    >();

    for (const b of books) {
      const entry = map.get(b.category) ?? {
        category: b.category,
        titles: 0,
        totalCopies: 0,
        availableCopies: 0,
      };
      entry.titles += 1;
      entry.totalCopies += b.availability.totalCopies;
      entry.availableCopies += b.availability.availableCopies;
      map.set(b.category, entry);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.category.localeCompare(b.category, 'pt-BR')
    );
  }, [books]);

  const kpis = [
    { label: 'Livros cadastrados', value: stats.totalBooks, tone: 'text-stone-900' },
    { label: 'Total de exemplares', value: stats.totalCopies, tone: 'text-stone-900' },
    { label: 'Exemplares disponíveis', value: stats.availableCopies, tone: 'text-[#15803D]' },
    { label: 'Empréstimos ativos', value: stats.activeLoans, tone: 'text-[#1D4ED8]' },
    { label: 'Solicitações pendentes', value: stats.pendingRequests, tone: 'text-[#B45309]' },
    {
      label: 'Empréstimos atrasados',
      value: stats.overdueLoans,
      tone: stats.overdueLoans > 0 ? 'text-[#DC2626]' : 'text-stone-900',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
            Painel Administrativo
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
            Visão geral da biblioteca
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Indicadores do acervo, solicitações aguardando atendimento e
            circulação de exemplares.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin_loans')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span>Gerenciar empréstimos</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6 KPIs principais */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <p className="text-xs text-stone-500">{item.label}</p>
            <p
              className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${item.tone}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Fila prioritária + Movimentações recentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Pendências e atrasos
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('admin_loans')}
              className="text-xs font-medium text-[#14532D] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            {attentionLoans.length === 0 ? (
              <div className="p-8 text-center text-sm text-stone-500">
                Nenhuma solicitação pendente ou empréstimo atrasado no momento.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {attentionLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {loan.bookTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500 truncate">
                        {loan.readerName} ({loan.readerRegistration}) ·{' '}
                        {loan.copyCode
                          ? `Patrimônio ${loan.copyCode}`
                          : `Solicitado em ${formatDateBR(loan.requestedAt)}`}
                      </p>
                      <div className="mt-1.5">
                        <LoanStatusText
                          status={loan.status}
                          isOverdue={loan.isOverdue}
                          daysOverdue={loan.daysOverdue}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                            className="inline-flex items-center gap-1 rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#114224] whitespace-nowrap"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectLoan(loan)}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap"
                          >
                            <X className="h-3.5 w-3.5" />
                            Rejeitar
                          </button>
                        </>
                      )}

                      {loan.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => setPickupLoan(loan)}
                          className="rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap"
                        >
                          Confirmar retirada
                        </button>
                      )}

                      {loan.status === 'active' && loan.isOverdue && (
                        <button
                          type="button"
                          onClick={() => setReturnLoan(loan)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-red-100 whitespace-nowrap"
                        >
                          Registrar devolução
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Movimentações recentes
          </h3>

          <div className="rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-sm text-stone-500">
                Nenhuma movimentação registrada ainda.
              </div>
            ) : (
              activities.slice(0, 7).map((act) => (
                <div key={act.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-900">
                      {act.title}
                    </p>
                    <span className="font-mono text-[11px] text-stone-400 tabular-nums shrink-0">
                      {formatDateTimeBR(act.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Relatório básico por categoria */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Relatório do acervo por categoria
            </h3>
            <p className="text-xs text-stone-500">
              Distribuição de títulos e disponibilidade física dos exemplares.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin_books')}
            className="text-xs font-medium text-[#14532D] hover:underline"
          >
            Gerenciar acervo
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 text-right font-medium">Títulos</th>
                <th className="px-4 py-3 text-right font-medium">
                  Total de exemplares
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  Disponíveis agora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categoryReport.map((row) => (
                <tr key={row.category} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {row.category}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-stone-700 tabular-nums">
                    {row.titles}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-stone-700 tabular-nums">
                    {row.totalCopies}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-[#15803D] tabular-nums">
                    {row.availableCopies}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ícones importados utilizados se necessário em alertas futuros */}
      <span className="hidden">
        <AlertTriangle />
        <Clock />
      </span>

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
    </div>
  );
}
