import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '../components/Modal';
import { useLibrary } from '../hooks/useLibraryContext';

export function AdminSettingsPage() {
  const { settings, updateSettings, restoreDemoData } = useLibrary();

  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [defaultLoanDays, setDefaultLoanDays] = useState(
    String(settings.defaultLoanDays)
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    setSchoolName(settings.schoolName);
    setDefaultLoanDays(String(settings.defaultLoanDays));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateSettings({
        schoolName,
        defaultLoanDays: Number(defaultLoanDays),
      });
    } catch {
      // Erro exibido via toast
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
          Configurações
        </p>
        <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
          Parâmetros da Biblioteca
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Ajuste o prazo padrão de empréstimo e gerencie os dados de
          demonstração locais.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
      >
        <div>
          <label className="block text-xs font-medium text-stone-700">
            Nome da instituição de ensino
          </label>
          <input
            type="text"
            required
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Prazo padrão de empréstimo (dias corridos)
          </label>
          <input
            type="number"
            required
            min={1}
            max={60}
            value={defaultLoanDays}
            onChange={(e) => setDefaultLoanDays(e.target.value)}
            className="mt-1.5 w-32 rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm tabular-nums text-stone-900 focus:border-[#14532D] focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-stone-500">
            A contagem inicia exclusivamente no momento da confirmação física da
            retirada do exemplar.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#114224] transition-colors"
          >
            Salvar configurações
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Dados de demonstração
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Restaura o conjunto inicial de 14 livros, 30 exemplares físicos, 10
            leitores e movimentações de exemplo, substituindo as alterações
            feitas nesta sessão.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restaurar dados iniciais de demonstração</span>
        </button>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => restoreDemoData()}
        title="Restaurar dados de demonstração"
        description="Todos os cadastros e empréstimos atuais salvos localmente serão substituídos pelos dados originais de demonstração. Deseja continuar?"
        confirmLabel="Restaurar dados"
        danger
      />
    </div>
  );
}
