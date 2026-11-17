import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import { BookDetailModal } from '../components/BookDetailModal';
import { useLibrary } from '../hooks/useLibraryContext';
import { BookWithAvailability } from '../types/library';

export function CatalogPage() {
  const { books, categories, currentUser } = useLibrary();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }
      if (onlyAvailable && book.availability.availableCopies < 1) {
        return false;
      }
      if (!query) return true;
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query) ||
        (book.isbn ?? '').toLowerCase().includes(query)
      );
    });
  }, [books, search, selectedCategory, onlyAvailable]);

  const selectedBook: BookWithAvailability | null = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
          Catálogo do Acervo
        </p>
        <div className="mt-1.5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-stone-900">
              Livros disponíveis para leitura
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              {currentUser?.role === 'student' || currentUser?.role === 'teacher'
                ? 'Pesquise obras do acervo escolar, confira exemplares disponíveis e envie sua solicitação de empréstimo.'
                : 'Consulte títulos, autores, categorias e disponibilidade em tempo real.'}
            </p>
          </div>
          <p className="text-xs text-stone-500 tabular-nums whitespace-nowrap">
            Exibindo {filteredBooks.length} de {books.length} títulos
          </p>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor ou ISBN..."
            className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-[#14532D] focus:outline-none"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-700 hover:bg-stone-50 select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-[#14532D]"
            />
            <span className="whitespace-nowrap">Somente disponíveis</span>
          </label>
        </div>
      </div>

      {/* Grade de livros */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-stone-400" />
          <h3 className="mt-3 font-serif text-lg font-medium text-stone-900">
            Nenhum livro encontrado
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            Tente limpar os filtros ou buscar por outro termo.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setOnlyAvailable(false);
            }}
            className="mt-4 rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBooks.map((book) => {
            const hasAvailable = book.availability.availableCopies > 0;
            return (
              <article
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className="group flex cursor-pointer flex-col rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div className="overflow-hidden rounded-md">
                  <div className="transition-transform duration-200 group-hover:scale-[1.02]">
                    <BookCover
                      title={book.title}
                      author={book.author}
                      publisher={book.publisher}
                      category={book.category}
                      coverUrl={book.coverUrl}
                      accentColor={book.accentColor}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-stone-500 truncate">
                      {book.category} · {book.publicationYear}
                    </p>
                    <h3 className="mt-1 font-serif text-base font-semibold leading-snug text-stone-900 line-clamp-2 group-hover:text-[#14532D] transition-colors">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 truncate">
                      {book.author}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        hasAvailable ? 'text-[#15803D]' : 'text-stone-500'
                      }`}
                    >
                      {hasAvailable
                        ? `${book.availability.availableCopies} ${
                            book.availability.availableCopies === 1
                              ? 'disponível'
                              : 'disponíveis'
                          }`
                        : 'Indisponível'}
                    </span>

                    <span className="text-xs font-medium text-[#14532D] group-hover:underline">
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBookId(null)}
      />
    </div>
  );
}
