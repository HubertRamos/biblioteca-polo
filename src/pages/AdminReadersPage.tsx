import { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { ConfirmDialog } from '../components/Modal';
import { ReaderFormModal } from '../components/ReaderFormModal';
import { ReaderStatusText } from '../components/StatusIndicator';
import { useLibrary } from '../hooks/useLibraryContext';
import { READER_TYPE_LABELS } from '../lib/formatters';
import { Reader, ReaderStatus, ReaderType } from '../types/library';

export function AdminReadersPage() {
  const { readers, loans, toggleReaderStatus, deleteReader } = useLibrary();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ReaderType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReaderStatus>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [readerToDelete, setReaderToDelete] = useState<Reader | null>(null);

  const activeLoansByReader = useMemo(() => {
    const map = new Map<string, number>();
    for (const loan of loans) {
      if (loan.status === 'active') {
        map.set(loan.readerId, (map.get(loan.readerId) ?? 0) + 1);
      }
    }
    return map;
  }, [loans]);

  const filteredReaders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return readers.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.departmentOrClass ?? '').toLowerCase().includes(q)
      );
    });
  }, [readers, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
            Comunidade Escolar
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
            Leitores Cadastrados
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Gerencie alunos e professores. Leitores com empréstimos ativos podem
            ser desativados preservando todo o histórico.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingReader(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar leitor</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, matrícula, e-mail ou turma..."
            className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | ReaderType)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-[#14532D] focus:outline-none"
          >
            <option value="all">Todos os perfis</option>
            <option value="student">Alunos</option>
            <option value="teacher">Professores</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | ReaderStatus)
            }
            className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-[#14532D] focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Desativados</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        {filteredReaders.length === 0 ? (
          <div className="p-10 text-center text-sm text-stone-500">
            Nenhum leitor encontrado para os filtros aplicados.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome e contato</th>
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Perfil / Turma</th>
                <th className="px-4 py-3 text-right font-medium">
                  Empréstimos ativos
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReaders.map((reader) => {
                const activeCount = activeLoansByReader.get(reader.id) ?? 0;
                return (
                  <tr key={reader.id} className="hover:bg-stone-50/70">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-stone-900">
                        {reader.fullName}
                      </p>
                      <p className="text-xs text-stone-500">{reader.email}</p>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-stone-800 tabular-nums">
                      {reader.registrationNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-stone-800">
                        {READER_TYPE_LABELS[reader.type]}
                      </p>
                      <p className="text-xs text-stone-500">
                        {reader.departmentOrClass || '—'}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-xs text-stone-800 tabular-nums">
                      {activeCount}
                    </td>

                    <td className="px-4 py-3.5">
                      <ReaderStatusText status={reader.status} />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReader(reader);
                            setFormOpen(true);
                          }}
                          aria-label={`Editar ${reader.fullName}`}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleReaderStatus(reader.id)}
                          title={
                            reader.status === 'active'
                              ? 'Desativar leitor'
                              : 'Reativar leitor'
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap"
                        >
                          {reader.status === 'active' ? (
                            <>
                              <UserX className="h-3.5 w-3.5 text-stone-500" />
                              <span>Desativar</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-[#15803D]" />
                              <span>Reativar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setReaderToDelete(reader)}
                          aria-label={`Excluir ${reader.fullName}`}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ReaderFormModal
        open={formOpen}
        editingReader={editingReader}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(readerToDelete)}
        onClose={() => setReaderToDelete(null)}
        onConfirm={() => {
          if (readerToDelete) {
            try {
              deleteReader(readerToDelete.id);
            } catch {
              // Erro exibido via toast (ex.: leitor com empréstimo ativo)
            }
          }
        }}
        title="Excluir cadastro de leitor"
        description={
          readerToDelete
            ? `Deseja excluir permanentemente o cadastro de "${readerToDelete.fullName}"? Leitores com empréstimos ativos não podem ser excluídos — apenas desativados.`
            : ''
        }
        confirmLabel="Excluir cadastro"
        danger
      />
    </div>
  );
}
