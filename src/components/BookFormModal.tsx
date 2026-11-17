import { useEffect, useState } from 'react';
import { useLibrary } from '../hooks/useLibraryContext';
import { BookWithAvailability, CopyCondition } from '../types/library';
import { Modal } from './Modal';

interface BookFormModalProps {
  open: boolean;
  editingBook: BookWithAvailability | null;
  onClose: () => void;
}

const SUGGESTED_CATEGORIES = [
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Ciências & Biologia',
  'Matemática & Lógica',
  'História & Humanidades',
  'Filosofia & Sociologia',
  'Tecnologia & Programação',
  'Artes & Cultura',
];

export function BookFormModal({
  open,
  editingBook,
  onClose,
}: BookFormModalProps) {
  const { createBook, updateBook, categories } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState(
    String(new Date().getFullYear())
  );
  const [category, setCategory] = useState('Literatura Brasileira');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [initialCopiesCount, setInitialCopiesCount] = useState('2');
  const [initialCondition, setInitialCondition] =
    useState<CopyCondition>('excellent');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setIsbn(editingBook.isbn ?? '');
      setPublisher(editingBook.publisher);
      setPublicationYear(String(editingBook.publicationYear));
      setCategory(editingBook.category);
      setDescription(editingBook.description);
      setCoverUrl(editingBook.coverUrl ?? '');
    } else {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setPublisher('');
      setPublicationYear(String(new Date().getFullYear()));
      setCategory('Literatura Brasileira');
      setDescription('');
      setCoverUrl('');
      setInitialCopiesCount('2');
      setInitialCondition('excellent');
    }
  }, [open, editingBook]);

  const categoryOptions = Array.from(
    new Set([...SUGGESTED_CATEGORIES, ...categories])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingBook) {
        updateBook(editingBook.id, {
          title,
          author,
          isbn,
          publisher,
          publicationYear: Number(publicationYear),
          category,
          description,
          coverUrl,
        });
      } else {
        createBook({
          title,
          author,
          isbn,
          publisher,
          publicationYear: Number(publicationYear),
          category,
          description,
          coverUrl,
          initialCopiesCount: Number(initialCopiesCount),
          initialCondition,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Verifique os dados informados.'
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingBook ? 'Editar Livro' : 'Cadastrar Novo Livro'}
      subtitle={
        editingBook
          ? 'Atualize os metadados bibliográficos. Os exemplares físicos são gerenciados separadamente.'
          : 'Cadastre a obra e informe quantos exemplares físicos iniciais serão registrados.'
      }
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700">
              Título da obra *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Grande Sertão: Veredas"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700">
              Autor(a) *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex.: João Guimarães Rosa"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700">
              Editora *
            </label>
            <input
              type="text"
              required
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Ex.: Companhia das Letras"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700">
                Ano *
              </label>
              <input
                type="number"
                required
                min={1400}
                max={new Date().getFullYear() + 1}
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm tabular-nums text-stone-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700">
                ISBN (opcional)
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-85-..."
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-xs text-stone-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700">
              URL da capa (opcional)
            </label>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="Deixe em branco para usar capa tipográfica padrão da biblioteca"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700">
              Sinopse / Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo da obra para orientação dos estudantes e professores..."
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
            />
          </div>

          {!editingBook && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-700">
                  Exemplares físicos iniciais
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={initialCopiesCount}
                  onChange={(e) => setInitialCopiesCount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm tabular-nums text-stone-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700">
                  Conservação inicial
                </label>
                <select
                  value={initialCondition}
                  onChange={(e) =>
                    setInitialCondition(e.target.value as CopyCondition)
                  }
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
                >
                  <option value="excellent">Ótimo</option>
                  <option value="good">Bom</option>
                  <option value="fair">Regular</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors"
          >
            {editingBook ? 'Salvar alterações' : 'Cadastrar livro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
