import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, User } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryContext';
import { USER_ROLE_LABELS } from '../lib/formatters';
import { DemoUser } from '../types/library';

interface LoginPageProps {
  onLoggedIn: (user: DemoUser) => void;
  onBrowsePublicCatalog: () => void;
}

export function LoginPage({
  onLoggedIn,
  onBrowsePublicCatalog,
}: LoginPageProps) {
  const { demoUsers, loginAsDemoUser, settings, stats } = useLibrary();

  const handleSelect = (user: DemoUser) => {
    loginAsDemoUser(user.id);
    onLoggedIn(user);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <span className="font-serif text-lg font-semibold text-stone-900 whitespace-nowrap">
            Biblioteca Escolar Digital
          </span>
          <button
            type="button"
            onClick={onBrowsePublicCatalog}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14532D] hover:underline whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4" />
            <span>Consultar catálogo público</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-medium tracking-wider uppercase text-[#14532D]">
              {settings.schoolName}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
              Gestão de acervo e empréstimos escolares
            </h1>
            <p className="text-sm leading-relaxed text-stone-600">
              Selecione um dos perfis de demonstração ao lado para testar o
              fluxo completo entre alunos, professores e a equipe da biblioteca.
            </p>

            <div className="border-t border-stone-200 pt-5 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="font-mono text-xl font-semibold text-stone-900 tabular-nums">
                  {stats.totalBooks}
                </p>
                <p className="text-xs text-stone-500">Títulos</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold text-stone-900 tabular-nums">
                  {stats.availableCopies}
                </p>
                <p className="text-xs text-stone-500">Disponíveis</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold text-stone-900 tabular-nums">
                  {stats.activeReaders}
                </p>
                <p className="text-xs text-stone-500">Leitores ativos</p>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-600">
              <strong className="font-semibold text-stone-800">
                Modo de demonstração local:
              </strong>{' '}
              os dados são persistidos no navegador via armazenamento local
              estruturado por repositórios, pronto para futura integração com
              Supabase Auth e PostgreSQL.
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="font-sans text-sm font-semibold text-stone-800 mb-3">
              Escolha um perfil de acesso
            </h2>

            {demoUsers.map((user) => {
              const Icon =
                user.role === 'admin'
                  ? ShieldCheck
                  : user.role === 'teacher'
                  ? GraduationCap
                  : User;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="group flex w-full items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 text-left transition-all hover:border-[#14532D] hover:shadow-sm"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700 group-hover:border-[#14532D]/30 group-hover:bg-[#14532D]/5 group-hover:text-[#14532D] transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold text-stone-900">
                          {user.name}
                        </span>
                        <span className="text-stone-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs font-medium text-[#14532D]">
                          {USER_ROLE_LABELS[user.role]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        {user.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#14532D]" />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white py-4">
        <div className="mx-auto max-w-5xl px-6 text-xs text-stone-500">
          Biblioteca Escolar Digital — MVP
        </div>
      </footer>
    </div>
  );
}
