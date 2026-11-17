import { useMemo, useState } from 'react';
import { BookCopy, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import { BookFormModal } from '../components/BookFormModal';
import { CopiesModal } from '../components/CopiesModal';
import { ConfirmDialog } from '../components/Modal';
import { useLibrary } from '../hooks/useLibraryContext';
import { BookWithAvailability } from '../types/library';

export function AdminBooksPage() {
  const { books, categories, deleteBook } = useLibrary();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookWithAvailability | null>(
    null
  );
  const [copiesBookId, setCopiesBookId] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<BookWithAvailability | null>(
    null
  );

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn ?? '').toLowerCase().includes(q)
      );
    });
  }, [books, search, selectedCategory]);

  const copiesModalBook = useMemo(
    () => books.find((b) => b.id === copiesBookId) ?? null,
    [books, copiesBookId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
            Gestão de Acervo
          </p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
            Livros e Exemplares Físicos
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Cadastre obras bibliográficas e controle individualmente cada
            exemplar patrimonial.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBook(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar livro</span>
        </button>
      </div>

      {/* Busca e Categoria */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar título, autor ou ISBN..."
            className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-[#14532D] focus:outline-none"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela do Acervo */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        {filteredBooks.length === 0 ? (
          <div className="p-10 text-center text-sm text-stone-500">
            Nenhum livro encontrado no acervo.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Obra</th>
                <th className="px-4 py-3 font-medium">Categoria / Editora</th>
                <th className="px-4 py-3 text-right font-medium">
                  Disponibilidade
                </th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <BookCover
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        coverUrl={book.coverUrl}
                        accentColor={book.accentColor}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">
                          {book.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {book.author}
                          {book.isbn ? ` · ISBN ${book.isbn}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-stone-800">
                      {book.category}
                    </p>
                    <p className="text-xs text-stone-500">
                      {book.publisher} ·{' '}
                      <span className="tabular-nums">
                        {book.publicationYear}
                      </span>
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <p
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        book.availability.availableCopies > 0
                          ? 'text-[#15803D]'
                          : 'text-stone-600'
                      }`}
                    >
                      {book.availability.availableCopies} /{' '}
                      {book.availability.totalCopies} disponíveis
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-500 tabular-nums">
                      {book.availability.loanedCopies} emprestado(s)
                      {book.availability.maintenanceCopies > 0
                        ? ` · ${book.availability.maintenanceCopies} manutenção`
                        : ''}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCopiesBookId(book.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap"
                      >
                        <BookCopy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Exemplares</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBook(book);
                          setFormOpen(true);
                        }}
                        aria-label={`Editar ${book.title}`}
                        className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookToDelete(book)}
                        aria-label={`Excluir ${book.title}`}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BookFormModal
        open={formOpen}
        editingBook={editingBook}
        onClose={() => setFormOpen(false)}
      />

      <CopiesModal
        book={copiesModalBook}
        onClose={() => setCopiesBookId(null)}
      />

      <ConfirmDialog
        open={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        onConfirm={() => {
          if (bookToDelete) {
            try {
              deleteBook(bookToDelete.id);
            } catch {
              // Erro exibido via toast (ex.: livro com empréstimo ativo)
            }
          }
        }}
        title="Excluir livro do acervo"
        description={
          bookToDelete
            ? `Tem certeza que deseja excluir "${bookToDelete.title}" e todos os seus exemplares físicos? Livros com empréstimos ativos não podem ser removidos.`
            : ''
        }
        confirmLabel="Excluir livro"
        danger
      />
    </div>
  );
}
