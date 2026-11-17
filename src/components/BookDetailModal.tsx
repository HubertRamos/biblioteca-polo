import { useState } from 'react';
import { BookCopy as BookCopyIcon, CheckCircle2, Clock } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryContext';
import { COPY_CONDITION_LABELS } from '../lib/formatters';
import { BookWithAvailability } from '../types/library';
import { BookCover } from './BookCover';
import { Modal } from './Modal';
import { CopyStatusText } from './StatusIndicator';

interface BookDetailModalProps {
  book: BookWithAvailability | null;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const {
    currentUser,
    getCopiesForBook,
    loans,
    requestLoan,
    settings,
  } = useLibrary();

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!book) return null;

  const copies = getCopiesForBook(book.id);
  const isReader =
    currentUser?.role === 'student' || currentUser?.role === 'teacher';

  const existingOpenLoan = isReader && currentUser?.readerId
    ? loans.find(
        (l) =>
          l.bookId === book.id &&
          l.readerId === currentUser.readerId &&
          (l.status === 'pending' ||
            l.status === 'approved' ||
            l.status === 'active')
      )
    : null;

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      requestLoan(book.id, notes);
      setNotes('');
      onClose();
    } catch {
      // Erro exibido via toast pelo contexto
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(book)}
      onClose={onClose}
      title="Ficha da Obra"
      subtitle={`${book.category} · ${book.publisher} (${book.publicationYear})`}
      maxWidthClass="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
        <div className="mx-auto w-full max-w-[200px] sm:mx-0">
          <BookCover
            title={book.title}
            author={book.author}
            publisher={book.publisher}
            category={book.category}
            coverUrl={book.coverUrl}
            accentColor={book.accentColor}
            size="lg"
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900 leading-tight">
              {book.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-stone-600">
              {book.author}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
              <span>{book.category}</span>
              <span aria-hidden="true">·</span>
              <span>{book.publisher}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{book.publicationYear}</span>
              {book.isbn && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">ISBN {book.isbn}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-stone-700">
            {book.description}
          </p>

          <div className="border-t border-stone-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <BookCopyIcon className="h-4 w-4 text-stone-500" />
                <span className="font-medium text-stone-900 tabular-nums">
                  {book.availability.availableCopies} de{' '}
                  {book.availability.totalCopies} exemplares disponíveis
                </span>
              </div>
              <span className="text-xs text-stone-500">
                Prazo padrão: {settings.defaultLoanDays} dias após retirada
              </span>
            </div>

            {copies.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-lg border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Patrimônio</th>
                      <th className="px-3 py-2 font-medium">Conservação</th>
                      <th className="px-3 py-2 font-medium">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {copies.map((copy) => (
                      <tr key={copy.id} className="bg-white">
                        <td className="px-3 py-2 font-mono text-stone-800 tabular-nums">
                          {copy.assetCode}
                        </td>
                        <td className="px-3 py-2 text-stone-600">
                          {COPY_CONDITION_LABELS[copy.condition]}
                        </td>
                        <td className="px-3 py-2">
                          <CopyStatusText status={copy.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isReader && (
            <div className="border-t border-stone-200 pt-4">
              {existingOpenLoan ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-sm text-stone-700">
                  {existingOpenLoan.status === 'active' ? (
                    <CheckCircle2 className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-[#B45309] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-stone-900">
                      {existingOpenLoan.status === 'pending' &&
                        'Você já possui uma solicitação aguardando aprovação para este livro.'}
                      {existingOpenLoan.status === 'approved' &&
                        'Sua solicitação foi aprovada! Compareça à biblioteca para retirar o exemplar.'}
                      {existingOpenLoan.status === 'active' &&
                        'Você está com um exemplar deste livro emprestado no momento.'}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Acompanhe os detalhes na aba Meus Empréstimos.
                    </p>
                  </div>
                </div>
              ) : book.availability.availableCopies > 0 ? (
                <form onSubmit={handleRequest} className="space-y-3">
                  <div>
                    <label
                      htmlFor="loan-notes"
                      className="block text-xs font-medium text-stone-700"
                    >
                      Observação para a biblioteca (opcional)
                    </label>
                    <input
                      id="loan-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex.: Leitura para trabalho de Literatura"
                      className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532D] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] disabled:opacity-60 transition-colors"
                    >
                      Solicitar empréstimo
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-sm text-stone-600">
                  Todos os exemplares deste título estão emprestados ou em
                  manutenção no momento.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
