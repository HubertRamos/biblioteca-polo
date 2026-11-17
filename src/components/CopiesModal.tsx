import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryContext';
import {
  COPY_CONDITION_LABELS,
  COPY_STATUS_LABELS,
} from '../lib/formatters';
import {
  BookCopy,
  BookWithAvailability,
  CopyCondition,
  CopyStatus,
} from '../types/library';
import { Modal } from './Modal';
import { CopyStatusText } from './StatusIndicator';

interface CopiesModalProps {
  book: BookWithAvailability | null;
  onClose: () => void;
}

export function CopiesModal({ book, onClose }: CopiesModalProps) {
  const {
    getCopiesForBook,
    suggestNextAssetCode,
    createCopy,
    updateCopy,
    deleteCopy,
  } = useLibrary();

  const [assetCode, setAssetCode] = useState('');
  const [condition, setCondition] = useState<CopyCondition>('excellent');
  const [notes, setNotes] = useState('');
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [editStatus, setEditStatus] = useState<CopyStatus>('available');
  const [editCondition, setEditCondition] = useState<CopyCondition>('good');
  const [editCode, setEditCode] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (book) {
      setAssetCode(suggestNextAssetCode());
      setCondition('excellent');
      setNotes('');
      setEditingCopy(null);
    }
  }, [book, suggestNextAssetCode]);

  if (!book) return null;

  const copies = getCopiesForBook(book.id);

  const handleAddCopy = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createCopy({
        bookId: book.id,
        assetCode,
        condition,
        notes,
      });
      setAssetCode(suggestNextAssetCode());
      setNotes('');
    } catch {
      // Erro exibido via toast
    }
  };

  const startEdit = (copy: BookCopy) => {
    setEditingCopy(copy);
    setEditCode(copy.assetCode);
    setEditCondition(copy.condition);
    setEditStatus(copy.status);
    setEditNotes(copy.notes ?? '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCopy) return;
    try {
      updateCopy(editingCopy.id, {
        assetCode: editCode,
        condition: editCondition,
        status: editStatus,
        notes: editNotes,
      });
      setEditingCopy(null);
    } catch {
      // Erro exibido via toast
    }
  };

  return (
    <Modal
      open={Boolean(book)}
      onClose={onClose}
      title={`Exemplares físicos · ${book.title}`}
      subtitle={`Total cadastrado: ${copies.length} · Disponíveis para empréstimo: ${
        copies.filter((c) => c.status === 'available').length
      }`}
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-6">
        <form
          onSubmit={handleAddCopy}
          className="rounded-lg border border-stone-200 bg-stone-50 p-4"
        >
          <p className="text-xs font-semibold text-stone-800">
            Adicionar novo exemplar físico
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-stone-600">
                Patrimônio *
              </label>
              <input
                type="text"
                required
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                placeholder="PAT-00131"
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs text-stone-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-stone-600">
                Conservação
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as CopyCondition)}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#14532D] focus:outline-none"
              >
                {Object.entries(COPY_CONDITION_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-stone-600">
                Observação (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: Doação 2026"
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Incluir
              </button>
            </div>
          </div>
        </form>

        {editingCopy && (
          <form
            onSubmit={handleSaveEdit}
            className="rounded-lg border border-stone-300 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-900">
                Editando exemplar {editingCopy.assetCode}
              </p>
              <button
                type="button"
                onClick={() => setEditingCopy(null)}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-medium text-stone-600">
                  Patrimônio
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600">
                  Conservação
                </label>
                <select
                  value={editCondition}
                  onChange={(e) =>
                    setEditCondition(e.target.value as CopyCondition)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                >
                  {Object.entries(COPY_CONDITION_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600">
                  Situação
                </label>
                <select
                  value={editStatus}
                  disabled={editingCopy.status === 'loaned'}
                  onChange={(e) => setEditStatus(e.target.value as CopyStatus)}
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs disabled:bg-stone-100"
                >
                  {Object.entries(COPY_STATUS_LABELS).map(([k, label]) => (
                    <option
                      key={k}
                      value={k}
                      disabled={k === 'loaned' && editingCopy.status !== 'loaned'}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600">
                  Notas
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#114224]"
              >
                Salvar exemplar
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-lg border border-stone-200">
          {copies.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              Nenhum exemplar físico cadastrado para este título.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Patrimônio</th>
                  <th className="px-4 py-2.5 font-medium">Conservação</th>
                  <th className="px-4 py-2.5 font-medium">Situação</th>
                  <th className="px-4 py-2.5 font-medium">Observações</th>
                  <th className="px-4 py-2.5 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {copies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-stone-50/70">
                    <td className="px-4 py-2.5 font-mono font-medium text-stone-900 tabular-nums">
                      {copy.assetCode}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">
                      {COPY_CONDITION_LABELS[copy.condition]}
                    </td>
                    <td className="px-4 py-2.5">
                      <CopyStatusText status={copy.status} />
                    </td>
                    <td className="px-4 py-2.5 text-stone-500">
                      {copy.notes || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(copy)}
                          className="font-medium text-stone-700 hover:text-[#14532D]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              deleteCopy(copy.id);
                            } catch {
                              // Toast exibe erro
                            }
                          }}
                          aria-label={`Excluir exemplar ${copy.assetCode}`}
                          className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
